'use client';

import { Package, Clock, MapPin } from 'lucide-react';

export default function BuyerDashboard() {
    return (
        <div className="container py-12">
            <h1 className="text-3xl font-bold mb-8">My Account</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Sidebar */}
                <div className="space-y-2">
                    <button className="w-full text-left px-4 py-3 rounded bg-[var(--primary)] text-[var(--primary-foreground)] font-medium">
                        Orders
                    </button>
                    <button className="w-full text-left px-4 py-3 rounded hover:bg-[var(--accent)] transition-colors">
                        Wishlist
                    </button>
                    <button className="w-full text-left px-4 py-3 rounded hover:bg-[var(--accent)] transition-colors">
                        Addresses
                    </button>
                    <button className="w-full text-left px-4 py-3 rounded hover:bg-[var(--accent)] transition-colors">
                        Settings
                    </button>
                </div>

                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold mb-4">Recent Orders</h2>

                    {[1, 2].map((i) => (
                        <div key={i} className="card">
                            <div className="card-header bg-[var(--accent)]/30 py-4 flex justify-between items-center">
                                <div className="text-sm">
                                    <span className="opacity-60">Order Placed:</span> <span className="font-medium">Nov 21, 2024</span>
                                </div>
                                <div className="text-sm">
                                    <span className="opacity-60">Order #:</span> <span className="font-medium">123-456789</span>
                                </div>
                            </div>
                            <div className="p-6 flex gap-6">
                                <div className="w-20 h-20 bg-[var(--secondary)] rounded overflow-hidden flex-shrink-0">
                                    <img
                                        src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=60"
                                        alt="Product"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold">Minimalist Watch</h3>
                                    <p className="text-sm opacity-60 mb-2">Black / Standard</p>
                                    <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                                        <Package size={16} /> Delivered
                                    </div>
                                </div>
                                <div className="text-right">
                                    <button className="btn btn-outline text-sm mb-2 w-full">Track Package</button>
                                    <button className="text-[var(--primary)] text-sm hover:underline w-full">Write a Review</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
