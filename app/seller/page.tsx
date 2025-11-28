'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, Package, DollarSign, BarChart, Trash2, X, ShoppingBag, Store, Settings, TrendingUp, Users, Activity } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Product } from '../components/Providers';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SellerDashboard() {
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'settings'>('overview');
    const [user, setUser] = useState<any>(null);

    const getYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    // Form State
    const [formData, setFormData] = useState({
        id: '', // Manual ID for now or auto-gen
        name: '',
        price: '',
        category: 'Electronics',
        image: '',
        description: '',
        features: '',
        media: [] as { type: 'image' | 'video'; url: string }[]
    });

    const [currentMediaUrl, setCurrentMediaUrl] = useState('');
    const [currentMediaType, setCurrentMediaType] = useState<'image' | 'video'>('image');

    useEffect(() => {
        fetchSellerData();
    }, []);

    const fetchSellerData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setLoading(false);
            return;
        }
        setUser(user);

        // 1. Fetch My Products
        const { data: myProducts } = await supabase
            .from('products')
            .select('*')
            .eq('seller_id', user.id);

        if (myProducts) {
            setProducts(myProducts.map((p: any) => ({
                ...p,
                originalPrice: p.original_price,
                reviewsCount: p.reviews_count,
                soldCount: p.sold_count
            })));
        }

        // 2. Fetch My Sales (Order Items for my products)
        const { data: mySales, error: salesError } = await supabase
            .from('order_items')
            .select('*, products!inner(*), orders(*)')
            .eq('products.seller_id', user.id);

        if (salesError) {
            console.error('Error fetching sales:', salesError);
        }

        if (mySales) {
            // Sort by date descending (newest first)
            const sortedSales = mySales.sort((a: any, b: any) =>
                new Date(b.orders?.created_at || 0).getTime() - new Date(a.orders?.created_at || 0).getTime()
            );
            setOrders(sortedSales);
        }

        setLoading(false);
    };

    const handleAddMedia = () => {
        if (!currentMediaUrl) return;
        setFormData(prev => ({
            ...prev,
            media: [...prev.media, { type: currentMediaType, url: currentMediaUrl }]
        }));
        setCurrentMediaUrl('');
    };

    const handleRemoveMedia = (index: number) => {
        setFormData(prev => ({
            ...prev,
            media: prev.media.filter((_, i) => i !== index)
        }));
    };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const newProduct = {
            id: crypto.randomUUID(),
            seller_id: user.id,
            name: formData.name,
            price: parseFloat(formData.price),
            category: formData.category,
            // Use first image as main image, or default if none
            image: formData.media.length > 0 ? formData.media[0].url : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60',
            description: formData.description,
            features: formData.features.split(',').map(f => f.trim()).filter(f => f),
            rating: 0,
            reviews_count: 0,
            sold_count: 0,
            media: formData.media
        };

        const { error } = await supabase
            .from('products')
            .insert(newProduct);

        if (error) {
            console.error('Error adding product:', error);
            alert('Failed to add product');
        } else {
            setShowAddModal(false);
            fetchSellerData();
            setFormData({
                id: '',
                name: '',
                price: '',
                category: 'Electronics',
                image: '',
                description: '',
                features: '',
                media: []
            });
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm('Are you sure? This will remove the product from the store.')) return;

        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting product:', error);
            alert('Failed to delete product');
        } else {
            setProducts(prev => prev.filter(p => p.id !== id));
        }
    };

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        // Optimistic update
        setOrders(prev => prev.map(item => {
            if (item.orders?.id === orderId) {
                return { ...item, orders: { ...item.orders, status: newStatus } };
            }
            return item;
        }));

        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId);

        if (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status. Please check your permissions.');
            // Revert on error
            fetchSellerData();
        } else {
            // Success - maybe show a toast?
            console.log('Status updated to', newStatus);
        }
    };

    const totalRevenue = orders.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalSales = orders.reduce((sum, item) => sum + item.quantity, 0);


    // Calculate Chart Data
    const chartData = useMemo(() => {
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            // Manual YYYY-MM-DD format to ensure consistency and avoid locale issues
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        });

        return last7Days.map(dateStr => {
            const dayOrders = orders.filter(o => {
                if (!o.orders?.created_at) return false;
                const d = new Date(o.orders.created_at);
                // Convert order date to local YYYY-MM-DD
                const orderDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                return orderDateStr === dateStr;
            });

            const sales = dayOrders.reduce((sum, item) => {
                const price = Number(item.price) || 0;
                const quantity = Number(item.quantity) || 0;
                return sum + (price * quantity);
            }, 0);

            // Create date object for display formatting
            const [year, month, day] = dateStr.split('-').map(Number);
            const dateObj = new Date(year, month - 1, day);
            const displayDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            return {
                date: displayDate,
                sales: sales
            };
        });
    }, [orders]);

    if (loading) {
        return <div className="container py-24 text-center">Loading Seller Dashboard...</div>;
    }

    if (!user) {
        return (
            <div className="container py-24 text-center">
                <h1 className="text-3xl font-bold mb-4">Seller Access Required</h1>
                <p className="mb-8">Please sign in to access the seller dashboard.</p>
                <a href="/login" className="btn btn-primary">Sign In</a>
            </div>
        );
    }

    return (
        <div className="container py-12" >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Seller Dashboard</h1>
                    <p className="text-sm opacity-60">Welcome back, {user.email?.split('@')[0]}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchSellerData}
                        className="btn btn-outline gap-2"
                        disabled={loading}
                    >
                        <TrendingUp size={18} /> Refresh Data
                    </button>
                    {showAddModal ? (
                        <button
                            onClick={() => setShowAddModal(false)}
                            className="btn btn-outline gap-2"
                        >
                            <X size={18} /> Cancel & Go Back
                        </button>
                    ) : (
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="btn btn-primary gap-2"
                        >
                            <Plus size={18} /> Add New Product
                        </button>
                    )}
                </div>
            </div>

            {showAddModal ? (
                <div className="max-w-4xl mx-auto">
                    <div className="card p-8 border-[var(--primary)]/20 shadow-lg">
                        <div className="mb-8 border-b border-[var(--border)] pb-4">
                            <h2 className="text-2xl font-bold mb-2">Add New Product</h2>
                            <p className="opacity-60">Fill in the details below to list a new product on the marketplace.</p>
                        </div>

                        <form onSubmit={handleAddProduct} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Product Name</label>
                                        <input
                                            type="text"
                                            className="input bg-[var(--secondary)] border-transparent h-12"
                                            placeholder="e.g. Premium Leather Jacket"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Category</label>
                                        <select
                                            className="input bg-[var(--secondary)] border-transparent h-12"
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            <option>Electronics</option>
                                            <option>Clothing</option>
                                            <option>Accessories</option>
                                            <option>Bags</option>
                                            <option>Footwear</option>
                                            <option>Home</option>
                                            <option>Fitness</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Price (₹)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50">₹</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="input bg-[var(--secondary)] border-transparent h-12 pl-8"
                                                placeholder="0.00"
                                                value={formData.price}
                                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Media (Images & Videos)</label>
                                        <div className="flex gap-2 mb-2">
                                            <input
                                                type="url"
                                                placeholder="https://example.com/image.jpg"
                                                className="input bg-[var(--secondary)] border-transparent h-12 flex-1"
                                                value={currentMediaUrl}
                                                onChange={e => setCurrentMediaUrl(e.target.value)}
                                            />
                                            <select
                                                className="input bg-[var(--secondary)] border-transparent h-12 w-24"
                                                value={currentMediaType}
                                                onChange={e => setCurrentMediaType(e.target.value as 'image' | 'video')}
                                            >
                                                <option value="image">Image</option>
                                                <option value="video">Video</option>
                                            </select>
                                            <button
                                                type="button"
                                                onClick={handleAddMedia}
                                                className="btn btn-primary px-4"
                                            >
                                                Add
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 mt-4">
                                            {formData.media.map((item, index) => (
                                                <div key={index} className="relative aspect-video rounded-lg overflow-hidden bg-[var(--secondary)] border border-[var(--border)] group">
                                                    {item.type === 'video' ? (
                                                        getYouTubeId(item.url) ? (
                                                            <div className="w-full h-full bg-black flex items-center justify-center relative">
                                                                <img
                                                                    src={`https://img.youtube.com/vi/${getYouTubeId(item.url)}/0.jpg`}
                                                                    className="w-full h-full object-cover opacity-70"
                                                                    alt="Video thumbnail"
                                                                />
                                                                <div className="absolute inset-0 flex items-center justify-center">
                                                                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                                                        <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1"></div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <video src={item.url} className="w-full h-full object-cover" controls={false} muted />
                                                        )
                                                    ) : (
                                                        <img src={item.url} alt={`Media ${index + 1}`} className="w-full h-full object-cover" />
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveMedia(index)}
                                                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                    {index === 0 && (
                                                        <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded">Main</div>
                                                    )}
                                                </div>
                                            ))}
                                            {formData.media.length === 0 && (
                                                <div className="col-span-3 flex flex-col items-center justify-center h-[100px] rounded-lg border-2 border-dashed border-[var(--border)] bg-[var(--secondary)]/50 opacity-60">
                                                    <Package size={24} className="mb-2" />
                                                    <span className="text-xs">No media added yet</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <textarea
                                    className="input min-h-[150px] bg-[var(--secondary)] border-transparent p-4 leading-relaxed"
                                    placeholder="Describe your product in detail..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Features</label>
                                <p className="text-xs opacity-60 mb-2">Add key features separated by commas (e.g. Waterproof, 2 Year Warranty, Lightweight)</p>
                                <input
                                    type="text"
                                    className="input bg-[var(--secondary)] border-transparent h-12"
                                    placeholder="Feature 1, Feature 2, Feature 3..."
                                    value={formData.features}
                                    onChange={e => setFormData({ ...formData, features: e.target.value })}
                                />
                            </div>

                            <div className="pt-8 border-t border-[var(--border)] flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="btn btn-outline px-8"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary px-8"
                                >
                                    List Product
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            ) : (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="card p-6 flex items-center gap-4 border-[var(--primary)]/20 bg-[var(--primary)]/5">
                            <div className="p-3 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)]">
                                <DollarSign size={24} />
                            </div>
                            <div>
                                <p className="text-sm opacity-60 font-medium">Total Revenue</p>
                                <h3 className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</h3>
                            </div>
                        </div>
                        <div className="card p-6 flex items-center gap-4">
                            <div className="p-3 rounded-full bg-[var(--secondary)]">
                                <ShoppingBag size={24} />
                            </div>
                            <div>
                                <p className="text-sm opacity-60 font-medium">Total Sales</p>
                                <h3 className="text-2xl font-bold">{totalSales}</h3>
                            </div>
                        </div>
                        <div className="card p-6 flex items-center gap-4">
                            <div className="p-3 rounded-full bg-[var(--secondary)]">
                                <Package size={24} />
                            </div>
                            <div>
                                <p className="text-sm opacity-60 font-medium">Products Listed</p>
                                <h3 className="text-2xl font-bold">{products.length}</h3>
                            </div>
                        </div>
                        <div className="card p-6 flex items-center gap-4">
                            <div className="p-3 rounded-full bg-[var(--secondary)]">
                                <Users size={24} />
                            </div>
                            <div>
                                <p className="text-sm opacity-60 font-medium">Customers</p>
                                <h3 className="text-2xl font-bold">{new Set(orders.map(o => o.orders?.user_id)).size}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex border-b border-[var(--border)] mb-8 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-6 py-3 font-medium text-sm flex items-center gap-2 transition-colors border-b-2 ${activeTab === 'overview' ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent opacity-60 hover:opacity-100'}`}
                        >
                            <Activity size={16} /> Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('products')}
                            className={`px-6 py-3 font-medium text-sm flex items-center gap-2 transition-colors border-b-2 ${activeTab === 'products' ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent opacity-60 hover:opacity-100'}`}
                        >
                            <Package size={16} /> My Products
                        </button>
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`px-6 py-3 font-medium text-sm flex items-center gap-2 transition-colors border-b-2 ${activeTab === 'orders' ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent opacity-60 hover:opacity-100'}`}
                        >
                            <ShoppingBag size={16} /> Sales Orders
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`px-6 py-3 font-medium text-sm flex items-center gap-2 transition-colors border-b-2 ${activeTab === 'settings' ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent opacity-60 hover:opacity-100'}`}
                        >
                            <Settings size={16} /> Store Settings
                        </button>
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'overview' && (
                        <div className="space-y-8">
                            <div className="card p-6">
                                <h3 className="text-xl font-bold mb-6">Sales Overview (Last 7 Days)</h3>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                            <XAxis
                                                dataKey="date"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: 'var(--foreground)', opacity: 0.5, fontSize: 12 }}
                                                dy={10}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: 'var(--foreground)', opacity: 0.5, fontSize: 12 }}
                                                tickFormatter={(value) => `₹${value}`}
                                            />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                                                itemStyle={{ color: 'var(--foreground)' }}
                                                formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Revenue']}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="sales"
                                                stroke="var(--primary)"
                                                fillOpacity={1}
                                                fill="url(#colorSales)"
                                                strokeWidth={2}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'products' && (
                        <div className="card">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-[var(--accent)] text-sm uppercase">
                                        <tr>
                                            <th className="p-4">Product</th>
                                            <th className="p-4">Category</th>
                                            <th className="p-4">Price</th>
                                            <th className="p-4">Sold</th>
                                            <th className="p-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--border)]">
                                        {products.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="p-12 text-center">
                                                    <div className="flex flex-col items-center justify-center opacity-60">
                                                        <Package size={48} className="mb-4 opacity-50" />
                                                        <p className="text-lg font-medium mb-2">No products listed yet</p>
                                                        <button onClick={() => setShowAddModal(true)} className="text-[var(--primary)] hover:underline">
                                                            List your first product
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            products.map((product) => (
                                                <tr key={product.id} className="hover:bg-[var(--accent)]/50 transition-colors">
                                                    <td className="p-4 font-medium flex items-center gap-3">
                                                        <img src={product.image} alt={product.name} className="w-10 h-10 rounded object-cover bg-[var(--secondary)]" />
                                                        {product.name}
                                                    </td>
                                                    <td className="p-4 opacity-80">{product.category}</td>
                                                    <td className="p-4">₹{product.price.toFixed(2)}</td>
                                                    <td className="p-4">{product.soldCount || 0}</td>
                                                    <td className="p-4">
                                                        <button
                                                            onClick={() => handleDeleteProduct(product.id)}
                                                            className="text-sm hover:underline text-red-500 flex items-center gap-1"
                                                        >
                                                            <Trash2 size={14} /> Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div className="card">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-[var(--accent)] text-sm uppercase">
                                        <tr>
                                            <th className="p-4">Order ID</th>
                                            <th className="p-4">Product</th>
                                            <th className="p-4">Quantity</th>
                                            <th className="p-4">Total</th>
                                            <th className="p-4">Date</th>
                                            <th className="p-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--border)]">
                                        {orders.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="p-12 text-center">
                                                    <div className="flex flex-col items-center justify-center opacity-60">
                                                        <ShoppingBag size={48} className="mb-4 opacity-50" />
                                                        <p className="text-lg font-medium">No sales yet</p>
                                                        <p className="text-sm">Your sales orders will appear here.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            orders.map((item) => (
                                                <tr key={item.id} className="hover:bg-[var(--accent)]/50 transition-colors">
                                                    <td className="p-4 font-mono text-xs opacity-60">{item.order_id.split('-')[0]}...</td>
                                                    <td className="p-4 font-medium flex items-center gap-3">
                                                        <img src={item.products?.image} alt={item.products?.name} className="w-8 h-8 rounded object-cover bg-[var(--secondary)]" />
                                                        {item.products?.name}
                                                    </td>
                                                    <td className="p-4">{item.quantity}</td>
                                                    <td className="p-4">₹{(item.price * item.quantity).toFixed(2)}</td>
                                                    <td className="p-4 text-sm opacity-60">{new Date(item.orders?.created_at).toLocaleDateString()}</td>
                                                    <td className="p-4">
                                                        <select
                                                            value={item.orders?.status || 'Pending'}
                                                            onChange={(e) => handleStatusUpdate(item.orders?.id, e.target.value)}
                                                            className={`px-3 py-1 rounded-full text-xs font-bold border-none cursor-pointer focus:ring-2 focus:ring-[var(--primary)] outline-none transition-colors ${(item.orders?.status || 'Pending') === 'Delivered' ? 'bg-green-100 text-green-800' :
                                                                (item.orders?.status || 'Pending') === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                                                                    (item.orders?.status || 'Pending') === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                                                        'bg-yellow-100 text-yellow-800'
                                                                }`}
                                                        >
                                                            <option value="Pending">Pending</option>
                                                            <option value="Processing">Processing</option>
                                                            <option value="Shipped">Shipped</option>
                                                            <option value="Delivered">Delivered</option>
                                                            <option value="Cancelled">Cancelled</option>
                                                        </select>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="max-w-2xl">
                            <div className="card p-6 space-y-6">
                                <div>
                                    <h3 className="text-xl font-bold mb-4">Store Settings</h3>
                                    <p className="opacity-60 text-sm mb-6">Manage your public store profile and preferences.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Store Name</label>
                                    <input type="text" className="input bg-[var(--secondary)] border-transparent" placeholder="e.g. My Awesome Store" defaultValue={user.user_metadata?.first_name ? `${user.user_metadata.first_name}'s Store` : ''} />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Support Email</label>
                                    <input type="email" className="input bg-[var(--secondary)] border-transparent" defaultValue={user.email} />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Store Description</label>
                                    <textarea className="input min-h-[100px] bg-[var(--secondary)] border-transparent" placeholder="Tell customers about your store..." />
                                </div>

                                <div className="pt-4 border-t border-[var(--border)] flex justify-end">
                                    <button className="btn btn-primary">Save Changes</button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div >
    );
}
