'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Theme = 'light' | 'dark';

const ThemeContext = createContext<{
    theme: Theme;
    toggleTheme: () => void;
}>({
    theme: 'light',
    toggleTheme: () => { },
});

export const useTheme = () => useContext(ThemeContext);

export interface Product {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    category: string;
    rating: number;
    reviewsCount: number;
    soldCount?: number;
    description: string;
    features: string[];
    reviews?: any[];
    media?: { type: 'image' | 'video'; url: string }[];
}

export interface CartItem extends Product {
    quantity: number;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    cartTotal: number;
}

const CartContext = createContext<CartContextType>({
    cart: [],
    addToCart: () => { },
    removeFromCart: () => { },
    updateQuantity: () => { },
    clearCart: () => { },
    cartTotal: 0,
});

export const useCart = () => useContext(CartContext);

export function Providers({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>('light');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedTheme = localStorage.getItem('theme') as Theme;
        if (savedTheme) {
            setTheme(savedTheme);
            document.documentElement.setAttribute('data-theme', savedTheme);
            if (savedTheme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('dark');
            document.documentElement.setAttribute('data-theme', 'dark');
            document.documentElement.classList.add('dark');
        }

    }, []);

    // Sync with Supabase on mount and auth state change
    useEffect(() => {
        const syncCart = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // Fetch cart from Supabase
                const { data: cartItems, error } = await supabase
                    .from('cart_items')
                    .select('*, products(*)')
                    .eq('user_id', user.id);

                if (cartItems && !error) {
                    const mappedItems: CartItem[] = cartItems.map((item: any) => ({
                        ...item.products, // Spread product details
                        quantity: item.quantity,
                        // Ensure ID matches product ID, not cart item ID
                        id: item.product_id
                    }));
                    setCart(mappedItems);
                }
            } else {
                // Load from local storage if not logged in
                const savedCart = localStorage.getItem('cart');
                if (savedCart) {
                    try {
                        setCart(JSON.parse(savedCart));
                    } catch (e) {
                        console.error('Failed to parse cart', e);
                    }
                }
            }
        };

        syncCart();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            syncCart();
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (mounted) {
            localStorage.setItem('cart', JSON.stringify(cart));
        }
    }, [cart, mounted]);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const addToCart = async (product: Product) => {
        // Optimistic update
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });

        // Sync with Supabase
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            // Check if item exists in DB
            const { data: existingItem } = await supabase
                .from('cart_items')
                .select('*')
                .eq('user_id', user.id)
                .eq('product_id', product.id)
                .single();

            if (existingItem) {
                await supabase
                    .from('cart_items')
                    .update({ quantity: existingItem.quantity + 1 })
                    .eq('id', existingItem.id);
            } else {
                await supabase
                    .from('cart_items')
                    .insert({
                        user_id: user.id,
                        product_id: product.id,
                        quantity: 1
                    });
            }
        }
    };

    const removeFromCart = async (productId: string) => {
        setCart(prev => prev.filter(item => item.id !== productId));

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase
                .from('cart_items')
                .delete()
                .eq('user_id', user.id)
                .eq('product_id', productId);
        }
    };

    const updateQuantity = async (productId: string, quantity: number) => {
        if (quantity < 1) return;
        setCart(prev => prev.map(item =>
            item.id === productId ? { ...item, quantity } : item
        ));

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase
                .from('cart_items')
                .update({ quantity })
                .eq('user_id', user.id)
                .eq('product_id', productId);
        }
    };

    const clearCart = async () => {
        setCart([]);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase
                .from('cart_items')
                .delete()
                .eq('user_id', user.id);
        }
    };

    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    // Prevent hydration mismatch by not rendering until mounted
    // if (!mounted) {
    //     return <div style={{ visibility: 'hidden' }}>{children}</div>;
    // }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal }}>
                {children}
            </CartContext.Provider>
        </ThemeContext.Provider>
    );
}
