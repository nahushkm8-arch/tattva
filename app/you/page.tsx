'use client';

import { useState, Suspense } from 'react';
import { Package, Truck, Clock, CheckCircle, Gift, ChevronRight, TrendingUp, Tag, LayoutDashboard, UserCog, Settings, LogOut, Heart, MapPin, Edit, Plus, Trash2 } from 'lucide-react';
import { PRODUCTS } from '../lib/data';
import Link from 'next/link';
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';

function YouContent() {
    const [open, setOpen] = useState(false);
    const [discountCode, setDiscountCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const currentView = searchParams.get('view') || 'dashboard';

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

    // Mock Orders
    const orders = [
        {
            id: 'ORD-2024-001',
            date: '2024-11-20',
            status: 'Delivered',
            total: 129.99,
            items: [PRODUCTS[0]]
        },
        {
            id: 'ORD-2024-002',
            date: '2024-11-22',
            status: 'In Transit',
            total: 89.99,
            items: [PRODUCTS[4]]
        }
    ];

    const activeOrder = orders.find(o => o.status === 'In Transit');

    const handleApplyDiscount = () => {
        if (discountCode.trim()) {
            setAppliedDiscount(discountCode);
            setDiscountCode('');
        }
    };

    const mostBoughtProducts = [...PRODUCTS].sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0)).slice(0, 4);
    const discountedProducts = PRODUCTS.filter(p => p.originalPrice && p.originalPrice > p.price).slice(0, 4);

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
                                            <div className="font-bold text-lg">${order.total.toFixed(2)}</div>
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
                                        <button className="btn btn-outline text-xs h-9">View Invoice</button>
                                        <button className="btn btn-primary text-xs h-9">Track Order</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'wishlist':
                return (
                    <div className="space-y-8">
                        <h2 className="text-3xl font-bold">My Wishlist</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {PRODUCTS.slice(0, 3).map(product => (
                                <div key={product.id} className="card group relative">
                                    <button className="absolute top-2 right-2 p-2 bg-white/80 dark:bg-black/50 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-colors z-10">
                                        <Trash2 size={16} />
                                    </button>
                                    <div className="aspect-square bg-[var(--secondary)] overflow-hidden">
                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold truncate">{product.name}</h3>
                                        <div className="font-bold mt-1 text-[var(--primary)]">${product.price.toFixed(2)}</div>
                                        <button className="btn btn-outline w-full mt-4 text-sm">Add to Cart</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'addresses':
                return (
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-3xl font-bold">Saved Addresses</h2>
                            <button className="btn btn-primary gap-2 text-sm">
                                <Plus size={16} /> Add New
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 border border-[var(--primary)] bg-[var(--primary)]/5 rounded-xl relative">
                                <div className="absolute top-4 right-4 bg-[var(--primary)] text-[var(--primary-foreground)] text-[10px] px-2 py-1 rounded-full font-bold">DEFAULT</div>
                                <h3 className="font-bold mb-2 flex items-center gap-2"><MapPin size={18} /> Home</h3>
                                <p className="opacity-80 text-sm leading-relaxed mb-4">
                                    John Doe<br />
                                    123 Main Street, Apt 4B<br />
                                    New York, NY 10001<br />
                                    United States<br />
                                    +1 (555) 123-4567
                                </p>
                                <div className="flex gap-2">
                                    <button className="btn btn-outline text-xs h-8 gap-1"><Edit size={12} /> Edit</button>
                                    <button className="btn btn-outline text-xs h-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 gap-1"><Trash2 size={12} /> Delete</button>
                                </div>
                            </div>
                            <div className="p-6 border border-[var(--border)] rounded-xl">
                                <h3 className="font-bold mb-2 flex items-center gap-2"><MapPin size={18} /> Office</h3>
                                <p className="opacity-80 text-sm leading-relaxed mb-4">
                                    John Doe<br />
                                    456 Corporate Blvd, Suite 200<br />
                                    San Francisco, CA 94105<br />
                                    United States<br />
                                    +1 (555) 987-6543
                                </p>
                                <div className="flex gap-2">
                                    <button className="btn btn-outline text-xs h-8 gap-1"><Edit size={12} /> Edit</button>
                                    <button className="btn btn-outline text-xs h-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 gap-1"><Trash2 size={12} /> Delete</button>
                                </div>
                            </div>
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
                                    <input type="text" defaultValue="John" className="input" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Last Name</label>
                                    <input type="text" defaultValue="Doe" className="input" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email Address</label>
                                <input type="email" defaultValue="john.doe@example.com" className="input" />
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
                                <h1 className="text-3xl font-bold mb-2">Hello, User</h1>
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
                                                <button className="btn btn-outline text-xs h-8">View Details</button>
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
                                        <div className="font-bold mt-1">${product.price.toFixed(2)}</div>
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
                                            <span className="font-bold text-red-500">${product.price.toFixed(2)}</span>
                                            {product.originalPrice && (
                                                <span className="text-sm opacity-40 line-through">${product.originalPrice.toFixed(2)}</span>
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
