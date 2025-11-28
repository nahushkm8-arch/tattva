'use client';

import Link from 'next/link';
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../components/Providers';

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();

    if (cart.length === 0) {
        return (
            <div className="container py-24 text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-[var(--secondary)] mb-6">
                    <ShoppingBag size={40} className="opacity-50" />
                </div>
                <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
                <p className="opacity-60 mb-8 max-w-md mx-auto">
                    Looks like you haven't added anything to your cart yet.
                    Explore our premium collection to find something you love.
                </p>
                <Link href="/" className="btn btn-primary inline-flex items-center gap-2 px-8 py-3">
                    Start Shopping <ArrowRight size={18} />
                </Link>
            </div>
        );
    }

    return (
        <div className="container py-12">
            <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Cart Items */}
                <div className="flex-1 space-y-6">
                    {cart.map((item) => (
                        <div key={item.id} className="card p-4 flex gap-4 items-center animate-fade-in">
                            <div className="w-24 h-24 bg-[var(--secondary)] rounded-md overflow-hidden flex-shrink-0">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg">{item.name}</h3>
                                <p className="text-sm opacity-60">{item.category}</p>
                                <div className="mt-2 font-bold text-[var(--primary)]">₹{item.price.toFixed(2)}</div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    className="p-1 hover:bg-[var(--accent)] rounded disabled:opacity-50"
                                    disabled={item.quantity <= 1}
                                >
                                    <Minus size={16} />
                                </button>
                                <span className="font-medium w-8 text-center">{item.quantity}</span>
                                <button
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="p-1 hover:bg-[var(--accent)] rounded"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                            <button
                                onClick={() => removeFromCart(item.id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                aria-label="Remove item"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="w-full lg:w-80 flex-shrink-0">
                    <div className="card p-6 sticky top-24">
                        <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between">
                                <span className="opacity-70">Subtotal</span>
                                <span className="font-medium">₹{cartTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="opacity-70">Shipping</span>
                                <span className="font-medium">Free</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="opacity-70">Tax (Estimated)</span>
                                <span className="font-medium">₹{(cartTotal * 0.1).toFixed(2)}</span>
                            </div>
                            <div className="border-t border-[var(--border)] pt-4 flex justify-between text-lg font-bold">
                                <span>Total</span>
                                <span>₹{(cartTotal * 1.1).toFixed(2)}</span>
                            </div>
                        </div>

                        <Link href="/checkout" className="btn btn-primary w-full py-3 flex items-center justify-center gap-2">
                            Proceed to Checkout <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
