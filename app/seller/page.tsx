'use client';

import { Plus, Package, DollarSign, BarChart } from 'lucide-react';

export default function SellerDashboard() {
    return (
        <div className="container py-12">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Seller Dashboard</h1>
                <button className="btn btn-primary gap-2">
                    <Plus size={18} /> Add New Product
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="card p-6 flex items-center gap-4">
                    <div className="p-3 bg-[var(--accent)] rounded-full">
                        <DollarSign size={24} className="text-[var(--primary)]" />
                    </div>
                    <div>
                        <div className="text-sm opacity-60">Total Revenue</div>
                        <div className="text-2xl font-bold">$12,450.00</div>
                    </div>
                </div>
                <div className="card p-6 flex items-center gap-4">
                    <div className="p-3 bg-[var(--accent)] rounded-full">
                        <Package size={24} className="text-[var(--primary)]" />
                    </div>
                    <div>
                        <div className="text-sm opacity-60">Products Listed</div>
                        <div className="text-2xl font-bold">45</div>
                    </div>
                </div>
                <div className="card p-6 flex items-center gap-4">
                    <div className="p-3 bg-[var(--accent)] rounded-full">
                        <BarChart size={24} className="text-[var(--primary)]" />
                    </div>
                    <div>
                        <div className="text-sm opacity-60">Total Sales</div>
                        <div className="text-2xl font-bold">128</div>
                    </div>
                </div>
            </div>

            {/* Product List */}
            <div className="card">
                <div className="card-header flex justify-between items-center">
                    <h2 className="text-xl font-bold">Your Products</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[var(--accent)] text-sm uppercase">
                            <tr>
                                <th className="p-4">Product Name</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Price</th>
                                <th className="p-4">Stock</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {[1, 2, 3].map((i) => (
                                <tr key={i} className="hover:bg-[var(--accent)]/50 transition-colors">
                                    <td className="p-4 font-medium">Premium Leather Bag</td>
                                    <td className="p-4 opacity-80">Bags</td>
                                    <td className="p-4">$129.00</td>
                                    <td className="p-4">12</td>
                                    <td className="p-4"><span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold">Active</span></td>
                                    <td className="p-4">
                                        <button className="text-sm hover:underline mr-3">Edit</button>
                                        <button className="text-sm hover:underline text-red-500">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
