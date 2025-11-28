'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';

interface WishlistButtonProps {
    productId: string;
    className?: string;
    size?: number;
}

export default function WishlistButton({ productId, className = '', size = 20 }: WishlistButtonProps) {
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const checkWishlistStatus = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                const { data } = await supabase
                    .from('wishlist')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('product_id', productId)
                    .single();

                if (data) {
                    setIsInWishlist(true);
                }
            }
            setLoading(false);
        };
        checkWishlistStatus();
    }, [productId]);

    const toggleWishlist = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!userId) {
            // Redirect to login if not authenticated
            router.push('/login');
            return;
        }

        // Optimistic update
        const newState = !isInWishlist;
        setIsInWishlist(newState);

        if (newState) {
            // Add to wishlist
            const { error } = await supabase
                .from('wishlist')
                .insert({ user_id: userId, product_id: productId });

            if (error) {
                console.error('Error adding to wishlist:', error);
                setIsInWishlist(!newState); // Revert on error
            }
        } else {
            // Remove from wishlist
            const { error } = await supabase
                .from('wishlist')
                .delete()
                .eq('user_id', userId)
                .eq('product_id', productId);

            if (error) {
                console.error('Error removing from wishlist:', error);
                setIsInWishlist(!newState); // Revert on error
            }
        }
    };

    if (loading) {
        return <div className={`animate-pulse bg-gray-200 rounded-full h-[${size}px] w-[${size}px]`} />;
    }

    return (
        <button
            onClick={toggleWishlist}
            className={`transition-colors ${className} ${isInWishlist ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
            title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
        >
            <Heart size={size} fill={isInWishlist ? "currentColor" : "none"} />
        </button>
    );
}
