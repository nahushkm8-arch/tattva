'use client';

import { useState, Suspense, useEffect } from 'react';
import { Package, Truck, Clock, CheckCircle, Gift, ChevronRight, TrendingUp, Tag, LayoutDashboard, UserCog, Settings, LogOut, Heart, MapPin, Edit, Plus, Trash2, X } from 'lucide-react';
import { Product } from '../components/Providers';
import Link from 'next/link';
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { DbOrder, DbAddress, DbWishlist, DbOrderItem } from '../lib/db-types';

// Extended types for UI
type OrderWithItems = DbOrder & {
    items: (DbOrderItem & { name: string; image: string })[];
    date: string;
    total: number;
};

function YouContent() {
    const [open, setOpen] = useState(false);
    const [discountCode, setDiscountCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);
    const [orders, setOrders] = useState<OrderWithItems[]>([]);
    const [addresses, setAddresses] = useState<DbAddress[]>([]);
    const [wishlist, setWishlist] = useState<string[]>([]); // Array of product IDs
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // Address Form State
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [addressForm, setAddressForm] = useState({
        label: 'Home',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        zip_code: '',
        country: '',
        phone: '',
        is_default: false
    });

    // Review State
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewData, setReviewData] = useState({
        productId: '',
        rating: 5,
        comment: ''
    });

    const handleSubmitReview = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from('reviews')
                .insert({
                    user_id: user.id,
                    product_id: reviewData.productId,
                    rating: reviewData.rating,
                    comment: reviewData.comment,
                    user_name: user.user_metadata?.first_name || user.email?.split('@')[0] || 'Anonymous'
                });

            if (error) throw error;

            alert('Review submitted successfully!');
            setShowReviewModal(false);
            setReviewData({ productId: '', rating: 5, comment: '' });
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Failed to submit review');
        }
    };
    const searchParams = useSearchParams();
    const router = useRouter();
    const currentView = searchParams.get('view') || 'dashboard';

    useEffect(() => {
        const getUserAndData = async () => {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error || !user) {
                // Optional: Redirect to login if not authenticated
                // router.push('/login');
                setLoading(false);
            } else {
                setUser(user);

                // Fetch Products first
                const { data: productsData } = await supabase
                    .from('products')
                    .select('*');

                let fetchedProducts: Product[] = [];
                if (productsData) {
                    fetchedProducts = productsData.map((p: any) => ({
                        id: p.id,
                        name: p.name,
                        price: p.price,
                        originalPrice: p.original_price,
                        image: p.image,
                        category: p.category,
                        rating: p.rating || 0,
                        reviewsCount: p.reviews_count || 0,
                        soldCount: p.sold_count || 0,
                        description: p.description,
                        features: p.features || []
                    }));
                    setProducts(fetchedProducts);
                }

                // Fetch Orders
                const { data: ordersData } = await supabase
                    .from('orders')
                    .select('*, order_items(*)')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });

                if (ordersData) {
                    const enrichedOrders = ordersData.map((order: any) => ({
                        ...order,
                        // Map database fields to UI expected fields if necessary, or keep as is
                        date: new Date(order.created_at).toISOString().split('T')[0],
                        total: order.total_amount,
                        items: order.order_items.map((item: any) => {
                            const product = fetchedProducts.find(p => p.id === item.product_id);
                            return {
                                ...item,
                                name: product?.name || 'Unknown Product',
                                image: product?.image || '',
                            };
                        })
                    }));
                    setOrders(enrichedOrders);
                }

                // Fetch Addresses
                const { data: addressesData } = await supabase
                    .from('addresses')
                    .select('*')
                    .eq('user_id', user.id);

                if (addressesData) {
                    setAddresses(addressesData);
                }

                // Fetch Wishlist
                const { data: wishlistData } = await supabase
                    .from('wishlist')
                    .select('product_id')
                    .eq('user_id', user.id);

                if (wishlistData) {
                    setWishlist(wishlistData.map((w: any) => w.product_id));
                }

                setLoading(false);
            }
        };
        getUserAndData();
    }, []);

    const links = [
        {
            label: "Dashboard",
            href: "/you?view=dashboard",
            icon: <LayoutDashboard className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
        },
        {
            label: "Orders",
            href: "/you?view=orders",
            icon: <Package className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
        },
        {
            label: "Wishlist",
            href: "/you?view=wishlist",
            icon: <Heart className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
        },
        {
            label: "Addresses",
            href: "/you?view=addresses",
            icon: <MapPin className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
        },
        {
            label: "Settings",
            href: "/you?view=settings",
            icon: <Settings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
        },
        {
            label: "Logout",
            href: "/login",
            icon: <LogOut className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />,
        },
    ];

    // Mock Orders Removed
    /* 
    const orders = [
        ...
    ];
    */

    const activeOrder = orders.find(o => o.status === 'In Transit');

    const handleApplyDiscount = () => {
        if (discountCode.trim()) {
            setAppliedDiscount(discountCode);
            setDiscountCode('');
        }
    };

    const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('addresses')
                .insert({
                    ...addressForm,
                    user_id: user.id
                })
                .select()
                .single();

            if (error) throw error;

            setAddresses(prev => [...prev, data]);
            setShowAddressForm(false);
            // Reset form
            setAddressForm({
                label: 'Home',
                address_line1: '',
                address_line2: '',
                city: '',
                state: '',
                zip_code: '',
                country: '',
                phone: '',
                is_default: false
            });
        } catch (error) {
            console.error('Error adding address:', error);
            alert('Failed to add address');
        }
    };

    const handleDeleteAddress = async (id: string) => {
        if (!confirm('Are you sure you want to delete this address?')) return;
        try {
            const { error } = await supabase
                .from('addresses')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setAddresses(prev => prev.filter(a => a.id !== id));
        } catch (error) {
            console.error('Error deleting address:', error);
            alert('Failed to delete address');
        }
    };

    const handleViewInvoice = (order: OrderWithItems) => {
        const invoiceWindow = window.open('', '_blank');
        if (!invoiceWindow) return;

        const html = `
            <html>
            <head>
                <title>Invoice - ${order.id}</title>
                <style>
                    body { font-family: 'Inter', sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #333; }
                    .header { display: flex; justify-content: space-between; margin-bottom: 60px; padding-bottom: 20px; border-bottom: 2px solid #eee; }
                    .logo { font-size: 28px; font-weight: 800; letter-spacing: -1px; }
                    .invoice-title { font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #888; margin-bottom: 10px; }
                    .meta-group { margin-bottom: 10px; }
                    .meta-label { font-size: 12px; color: #888; text-transform: uppercase; }
                    .meta-value { font-size: 14px; font-weight: 500; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
                    th { text-align: left; padding: 15px 10px; border-bottom: 2px solid #eee; font-size: 12px; text-transform: uppercase; color: #888; }
                    td { padding: 15px 10px; border-bottom: 1px solid #eee; font-size: 14px; }
                    .total-section { display: flex; justify-content: flex-end; }
                    .total-row { display: flex; justify-content: space-between; width: 250px; padding: 10px 0; }
                    .total-label { font-weight: 500; }
                    .total-value { font-weight: 700; font-size: 18px; }
                    .footer { margin-top: 80px; text-align: center; color: #aaa; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; }
                    @media print {
                        body { padding: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <div class="logo">Tattva.</div>
                        <div style="color: #666; font-size: 14px; margin-top: 5px;">Premium Marketplace</div>
                    </div>
                    <div style="text-align: right;">
                        <div class="invoice-title">INVOICE</div>
                        <div class="meta-group">
                            <div class="meta-label">Order ID</div>
                            <div class="meta-value">#${order.id.slice(0, 8).toUpperCase()}</div>
                        </div>
                        <div class="meta-group">
                            <div class="meta-label">Date</div>
                            <div class="meta-value">${new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                        </div>
                    </div>
                </div>

                <div style="margin-bottom: 40px;">
                    <div class="meta-label" style="margin-bottom: 10px;">Bill To</div>
                    <div class="meta-value">${user?.user_metadata?.first_name || 'Customer'} ${user?.user_metadata?.last_name || ''}</div>
                    <div style="font-size: 14px; color: #666;">${user?.email || ''}</div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th style="width: 50%;">Item</th>
                            <th style="width: 15%; text-align: center;">Quantity</th>
                            <th style="width: 15%; text-align: right;">Price</th>
                            <th style="width: 20%; text-align: right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${order.items.map(item => `
                            <tr>
                                <td>
                                    <div style="font-weight: 500;">${item.name}</div>
                                </td>
                                <td style="text-align: center;">${item.quantity}</td>
                                <td style="text-align: right;">₹${item.price.toFixed(2)}</td>
                                <td style="text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="total-section">
                    <div>
                        <div class="total-row" style="border-bottom: 1px solid #eee;">
                            <span style="color: #666;">Subtotal</span>
                            <span>₹${order.total.toFixed(2)}</span>
                        </div>
                        <div class="total-row" style="border-bottom: 1px solid #eee;">
                            <span style="color: #666;">Shipping</span>
                            <span>Free</span>
                        </div>
                        <div class="total-row" style="margin-top: 10px;">
                            <span class="total-label">Total</span>
                            <span class="total-value">₹${order.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div class="footer">
                    <p>Thank you for your business!</p>
                    <p>Questions? Email support@tattva.com</p>
                </div>
                <script>
                    window.onload = () => { setTimeout(() => window.print(), 500); }
                </script>
            </body>
            </html>
        `;

        invoiceWindow.document.write(html);
        invoiceWindow.document.close();
    };

    const mostBoughtProducts = [...products].sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0)).slice(0, 4);
    const discountedProducts = products.filter(p => p.originalPrice && p.originalPrice > p.price).slice(0, 4);

    // Render Content based on View
    const renderContent = () => {
        switch (currentView) {
            case 'orders':
                return (
                    <div className="space-y-8">
                        <h2 className="text-3xl font-bold">My Orders</h2>
                        <div className="space-y-4">
                            {orders.map(order => (
                                <div key={order.id} className="flex flex-col sm:flex-row gap-4 p-6 border border-[var(--border)] rounded-lg hover:bg-[var(--accent)]/10 transition-colors bg-[var(--card)]">
                                    <div className="w-full sm:w-24 h-24 bg-[var(--secondary)] rounded-md overflow-hidden flex-shrink-0">
                                        <img src={order.items[0].image} alt="Product" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="font-bold text-lg">{order.items[0].name}</div>
                                                <div className="text-sm opacity-60">{order.items.length > 1 ? `+ ${order.items.length - 1} more items` : '1 item'}</div>
                                            </div>
                                            <div className="font-bold text-lg">₹{order.total.toFixed(2)}</div>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm mb-4">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${order.status === 'Delivered' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                                {order.status}
                                            </span>
                                            <span className="opacity-40">•</span>
                                            <span className="opacity-60">{order.date}</span>
                                            <span className="opacity-40">•</span>
                                            <span className="opacity-60 font-mono">{order.id}</span>
                                        </div>
                                    </div>
                                    <div className="flex sm:flex-col justify-center gap-2">
                                        <button onClick={() => handleViewInvoice(order)} className="btn btn-outline text-xs h-9">View Invoice</button>
                                        <button className="btn btn-primary text-xs h-9">Track Order</button>
                                        {order.status === 'Delivered' && (
                                            <button
                                                onClick={() => {
                                                    setReviewData({ ...reviewData, productId: order.items[0].product_id });
                                                    setShowReviewModal(true);
                                                }}
                                                className="btn btn-outline text-xs h-9 gap-1"
                                            >
                                                <Edit size={12} /> Write Review
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Review Modal */}
                        {showReviewModal && (
                            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                                <div className="bg-[var(--card)] bg-white dark:bg-zinc-900 p-6 rounded-xl w-full max-w-md border border-[var(--border)] shadow-xl">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold">Write a Review</h3>
                                        <button onClick={() => setShowReviewModal(false)}><X size={20} /></button>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex flex-col items-center gap-2 mb-4">
                                            <label className="text-sm font-medium">Rating</label>
                                            <div className="flex gap-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        onClick={() => setReviewData({ ...reviewData, rating: star })}
                                                        className={`text-2xl transition-colors ${star <= reviewData.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                                    >
                                                        ★
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Comment</label>
                                            <textarea
                                                className="input min-h-[100px]"
                                                placeholder="Share your experience with this product..."
                                                value={reviewData.comment}
                                                onChange={e => setReviewData({ ...reviewData, comment: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex justify-end gap-4 pt-4">
                                            <button onClick={() => setShowReviewModal(false)} className="btn btn-outline">Cancel</button>
                                            <button onClick={handleSubmitReview} className="btn btn-primary">Submit Review</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 'wishlist':
                return (
                    <div className="space-y-8">
                        <h2 className="text-3xl font-bold">My Wishlist</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {wishlist.length === 0 ? (
                                <p>Your wishlist is empty.</p>
                            ) : (
                                products.filter(p => wishlist.includes(p.id)).map(product => (
                                    <div key={product.id} className="card group relative">
                                        <button className="absolute top-2 right-2 p-2 bg-white/80 dark:bg-black/50 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-colors z-10">
                                            <Trash2 size={16} />
                                        </button>
                                        <div className="aspect-square bg-[var(--secondary)] overflow-hidden">
                                            <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-bold truncate">{product.name}</h3>
                                            <div className="font-bold mt-1 text-[var(--primary)]">₹{product.price.toFixed(2)}</div>
                                            <button className="btn btn-outline w-full mt-4 text-sm">Add to Cart</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                );
            case 'addresses':
                return (
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-3xl font-bold">Saved Addresses</h2>
                            <button
                                onClick={() => setShowAddressForm(true)}
                                className="btn btn-primary gap-2 text-sm"
                            >
                                <Plus size={16} /> Add New
                            </button>
                        </div>

                        {/* Add Address Form Modal */}
                        {showAddressForm && (
                            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                                <div className="bg-[var(--card)] p-6 rounded-xl w-full max-w-lg border border-[var(--border)] shadow-xl">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold">Add New Address</h3>
                                        <button onClick={() => setShowAddressForm(false)}><X size={20} /></button>
                                    </div>
                                    <form onSubmit={handleAddAddress} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Label</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Home, Work"
                                                    className="input"
                                                    value={addressForm.label}
                                                    onChange={e => setAddressForm({ ...addressForm, label: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Phone</label>
                                                <input
                                                    type="text"
                                                    placeholder="Phone Number"
                                                    className="input"
                                                    value={addressForm.phone}
                                                    onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Address Line 1</label>
                                            <input
                                                type="text"
                                                placeholder="Street Address"
                                                className="input"
                                                value={addressForm.address_line1}
                                                onChange={e => setAddressForm({ ...addressForm, address_line1: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Address Line 2 (Optional)</label>
                                            <input
                                                type="text"
                                                placeholder="Apt, Suite, etc."
                                                className="input"
                                                value={addressForm.address_line2}
                                                onChange={e => setAddressForm({ ...addressForm, address_line2: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">City</label>
                                                <input
                                                    type="text"
                                                    placeholder="City"
                                                    className="input"
                                                    value={addressForm.city}
                                                    onChange={e => setAddressForm({ ...addressForm, city: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">State</label>
                                                <input
                                                    type="text"
                                                    placeholder="State"
                                                    className="input"
                                                    value={addressForm.state}
                                                    onChange={e => setAddressForm({ ...addressForm, state: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Zip Code</label>
                                                <input
                                                    type="text"
                                                    placeholder="Zip Code"
                                                    className="input"
                                                    value={addressForm.zip_code}
                                                    onChange={e => setAddressForm({ ...addressForm, zip_code: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Country</label>
                                                <input
                                                    type="text"
                                                    placeholder="Country"
                                                    className="input"
                                                    value={addressForm.country}
                                                    onChange={e => setAddressForm({ ...addressForm, country: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 pt-2">
                                            <input
                                                type="checkbox"
                                                id="is_default"
                                                checked={addressForm.is_default}
                                                onChange={e => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                                                className="rounded border-gray-300"
                                            />
                                            <label htmlFor="is_default" className="text-sm">Set as default address</label>
                                        </div>
                                        <div className="flex justify-end gap-4 pt-4">
                                            <button type="button" onClick={() => setShowAddressForm(false)} className="btn btn-outline">Cancel</button>
                                            <button type="submit" className="btn btn-primary">Save Address</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {addresses.map(address => (
                                <div key={address.id} className={`p-6 border rounded-xl relative ${address.is_default ? 'border-[var(--primary)] bg-[var(--primary)]/5' : 'border-[var(--border)]'}`}>
                                    {address.is_default && (
                                        <div className="absolute top-4 right-4 bg-[var(--primary)] text-[var(--primary-foreground)] text-[10px] px-2 py-1 rounded-full font-bold">DEFAULT</div>
                                    )}
                                    <h3 className="font-bold mb-2 flex items-center gap-2"><MapPin size={18} /> {address.label}</h3>
                                    <p className="opacity-80 text-sm leading-relaxed mb-4">
                                        {user?.email ? user.email.split('@')[0] : 'User'}<br />
                                        {address.address_line1}<br />
                                        {address.address_line2 && <>{address.address_line2}<br /></>}
                                        {address.city}, {address.state} {address.zip_code}<br />
                                        {address.country}<br />
                                        {address.phone}
                                    </p>
                                    <div className="flex gap-2">
                                        <button className="btn btn-outline text-xs h-8 gap-1"><Edit size={12} /> Edit</button>
                                        <button
                                            onClick={() => handleDeleteAddress(address.id)}
                                            className="btn btn-outline text-xs h-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 gap-1"
                                        >
                                            <Trash2 size={12} /> Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {addresses.length === 0 && (
                                <div className="col-span-full text-center p-10 border border-dashed border-[var(--border)] rounded-xl">
                                    <p className="opacity-60">No addresses saved yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'settings':
                return (
                    <div className="space-y-8 max-w-2xl">
                        <h2 className="text-3xl font-bold">Account Settings</h2>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">First Name</label>
                                    <input type="text" defaultValue={user?.user_metadata?.first_name || "John"} className="input" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Last Name</label>
                                    <input type="text" defaultValue={user?.user_metadata?.last_name || "Doe"} className="input" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email Address</label>
                                <input type="email" value={user?.email || ''} disabled className="input opacity-60 cursor-not-allowed" />
                                <p className="text-xs opacity-50">Email address cannot be changed.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Phone Number</label>
                                <input type="tel" defaultValue="+1 (555) 123-4567" className="input" />
                            </div>

                            <div className="pt-6 border-t border-[var(--border)]">
                                <h3 className="font-bold mb-4">Change Password</h3>
                                <div className="space-y-4">
                                    <input type="password" placeholder="Current Password" className="input" />
                                    <input type="password" placeholder="New Password" className="input" />
                                    <input type="password" placeholder="Confirm New Password" className="input" />
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 pt-4">
                                <button className="btn btn-outline">Cancel</button>
                                <button className="btn btn-primary">Save Changes</button>
                            </div>
                        </div>
                    </div>
                );
            case 'dashboard':
            default:
                return (
                    <div className="space-y-12">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">Hello, {user?.email ? user.email.split('@')[0] : 'Guest'}</h1>
                                <p className="opacity-60">Welcome back to your personal dashboard.</p>
                            </div>
                        </div>

                        {/* Active Order Tracking */}
                        {activeOrder && (
                            <section className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <Truck className="text-[var(--primary)]" /> Track Order
                                    </h2>
                                    <span className="text-sm font-mono opacity-60">{activeOrder.id}</span>
                                </div>

                                <div className="relative">
                                    <div className="absolute top-1/2 left-0 w-full h-1 bg-[var(--secondary)] -translate-y-1/2 z-0"></div>
                                    <div className="absolute top-1/2 left-0 w-2/3 h-1 bg-[var(--primary)] -translate-y-1/2 z-0 transition-all duration-1000"></div>

                                    <div className="relative z-10 flex justify-between">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center">
                                                <CheckCircle size={16} />
                                            </div>
                                            <span className="text-xs font-medium">Confirmed</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center">
                                                <Package size={16} />
                                            </div>
                                            <span className="text-xs font-medium">Packed</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center shadow-[0_0_0_4px_var(--background)]">
                                                <Truck size={16} />
                                            </div>
                                            <span className="text-xs font-bold text-[var(--primary)]">In Transit</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-[var(--secondary)] text-[var(--muted-foreground)] flex items-center justify-center">
                                                <CheckCircle size={16} />
                                            </div>
                                            <span className="text-xs opacity-60">Delivered</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 flex gap-4 p-4 bg-[var(--secondary)]/30 rounded-lg items-center">
                                    <img src={activeOrder.items[0].image} alt="Product" className="w-16 h-16 object-cover rounded-md" />
                                    <div>
                                        <div className="font-bold">{activeOrder.items[0].name}</div>
                                        <div className="text-sm opacity-60">Arriving by Nov 28</div>
                                    </div>
                                </div>
                            </section>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Order History Preview */}
                            <section className="lg:col-span-2 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold flex items-center gap-2">
                                        <Clock size={24} /> Recent Orders
                                    </h2>
                                    <Link href="/you?view=orders" className="text-sm text-[var(--primary)] hover:underline">View All</Link>
                                </div>
                                <div className="space-y-4">
                                    {orders.slice(0, 2).map(order => (
                                        <div key={order.id} className="flex flex-col sm:flex-row gap-4 p-4 border border-[var(--border)] rounded-lg hover:bg-[var(--accent)]/10 transition-colors">
                                            <div className="w-full sm:w-24 h-24 bg-[var(--secondary)] rounded-md overflow-hidden flex-shrink-0">
                                                <img src={order.items[0].image} alt="Product" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <div className="font-bold text-lg">{order.items[0].name}</div>
                                                        <div className="text-sm opacity-60">{order.items.length > 1 ? `+ ${order.items.length - 1} more items` : '1 item'}</div>
                                                    </div>
                                                    <div className="font-bold">${order.total.toFixed(2)}</div>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm mb-4">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${order.status === 'Delivered' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                                        {order.status}
                                                    </span>
                                                    <span className="opacity-40">•</span>
                                                    <span className="opacity-60">{order.date}</span>
                                                </div>
                                            </div>
                                            <div className="flex sm:flex-col justify-center gap-2">
                                                <Link href="/you?view=orders" className="btn btn-outline text-xs h-8 flex items-center justify-center">View Details</Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Discount Code */}
                            <section className="space-y-6">
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    <Gift size={24} /> Discounts
                                </h2>
                                <div className="p-6 border border-[var(--border)] rounded-xl bg-[var(--card)] shadow-sm">
                                    <p className="text-sm opacity-70 mb-4">Have a discount code? Apply it here to save on your next purchase.</p>

                                    {appliedDiscount ? (
                                        <div className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-3 rounded-lg flex items-center justify-between mb-4">
                                            <span className="font-medium flex items-center gap-2"><Tag size={16} /> {appliedDiscount}</span>
                                            <button onClick={() => setAppliedDiscount(null)} className="text-xs hover:underline">Remove</button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2 mb-4">
                                            <input
                                                type="text"
                                                placeholder="Enter code"
                                                className="input uppercase"
                                                value={discountCode}
                                                onChange={(e) => setDiscountCode(e.target.value)}
                                            />
                                            <button onClick={handleApplyDiscount} className="btn btn-primary">Apply</button>
                                        </div>
                                    )}

                                    <div className="text-xs opacity-50 text-center">
                                        Try "WELCOME20" for 20% off
                                    </div>
                                </div>

                                <div className="p-6 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-xl">
                                    <div className="text-3xl font-bold mb-1">250</div>
                                    <div className="text-sm opacity-80">Points Earned</div>
                                    <div className="mt-4 text-xs opacity-60">Redeem points for exclusive rewards.</div>
                                </div>
                            </section>
                        </div>

                        {/* Most Bought */}
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    <TrendingUp className="text-[var(--primary)]" /> Most Popular
                                </h2>
                                <Link href="/" className="text-sm text-[var(--primary)] hover:underline flex items-center gap-1">
                                    View All <ChevronRight size={16} />
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {mostBoughtProducts.map(product => (
                                    <Link href={`/product/${product.id}`} key={product.id} className="group">
                                        <div className="aspect-square bg-[var(--secondary)] rounded-lg overflow-hidden mb-3 relative">
                                            <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm">
                                                {product.soldCount}+ SOLD
                                            </div>
                                        </div>
                                        <h3 className="font-bold truncate">{product.name}</h3>
                                        <p className="text-sm opacity-60">{product.category}</p>
                                        <div className="font-bold mt-1">₹{product.price.toFixed(2)}</div>
                                    </Link>
                                ))}
                            </div>
                        </section>

                        {/* Deals */}
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    <Tag className="text-[var(--primary)]" /> Deals for You
                                </h2>
                                <Link href="/" className="text-sm text-[var(--primary)] hover:underline flex items-center gap-1">
                                    View All <ChevronRight size={16} />
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {discountedProducts.map(product => (
                                    <Link href={`/product/${product.id}`} key={product.id} className="group">
                                        <div className="aspect-square bg-[var(--secondary)] rounded-lg overflow-hidden mb-3 relative">
                                            <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            {product.originalPrice && (
                                                <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                                                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="font-bold truncate">{product.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="font-bold text-red-500">₹{product.price.toFixed(2)}</span>
                                            {product.originalPrice && (
                                                <span className="text-sm opacity-40 line-through">₹{product.originalPrice.toFixed(2)}</span>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    </div>
                );
        }
    };

    return (
        <div className={cn(
            "rounded-md flex flex-col md:flex-row bg-[var(--background)] w-full flex-1 mx-auto border border-[var(--border)] overflow-hidden",
            "h-[calc(100vh-65px)]" // Adjust for navbar height
        )}>
            <Sidebar open={open} setOpen={setOpen}>
                <SidebarBody className="justify-between gap-10">
                    <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                        <div className="flex items-center gap-2 px-2 py-1">
                            <div className="h-5 w-6 bg-[var(--foreground)] rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="font-medium text-[var(--foreground)] whitespace-pre"
                            >
                                Tattva
                            </motion.span>
                        </div>
                        <div className="mt-8 flex flex-col gap-2">
                            {links.map((link, idx) => (
                                <SidebarLink key={idx} link={link} />
                            ))}
                        </div>
                    </div>
                    <div>
                        <SidebarLink
                            link={{
                                label: "User Profile",
                                href: "/you?view=settings",
                                icon: (
                                    <div className="h-7 w-7 flex-shrink-0 rounded-full bg-[var(--secondary)] flex items-center justify-center text-xs font-bold text-[var(--foreground)]">
                                        U
                                    </div>
                                ),
                            }}
                        />
                    </div>
                </SidebarBody>
            </Sidebar>

            {/* Main Dashboard Content */}
            <div className="flex flex-1 overflow-y-auto p-2 md:p-10 bg-[var(--background)]">
                <div className="max-w-6xl w-full mx-auto">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}

export default function YouPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <YouContent />
        </Suspense>
    );
}
