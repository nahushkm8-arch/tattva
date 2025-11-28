'use client';

import { useState, useEffect } from 'react';
import ProductCard from './components/ProductCard';
import { Filter } from 'lucide-react';
import { supabase } from './lib/supabase';
import { Product } from './components/Providers';
import { BackgroundPaths } from '@/components/ui/background-paths';
import { AnimatePresence, motion } from 'framer-motion';

const CATEGORIES = ["All", "Electronics", "Clothing", "Accessories", "Bags", "Footwear", "Home", "Fitness"];

export default function Home() {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [showSplash, setShowSplash] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            const { data, error } = await supabase
                .from('products')
                .select('*');

            if (data && !error) {
                // Map DB fields to Product interface if needed (e.g. camelCase)
                // Our DB columns match the interface mostly, but let's be safe
                const mappedProducts: Product[] = data.map((p: any) => ({
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
                setProducts(mappedProducts);
            }
            setLoading(false);
        };

        fetchProducts();

        const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
        if (!hasSeenSplash) {
            setShowSplash(true);
            sessionStorage.setItem('hasSeenSplash', 'true');
        }
    }, []);

    const filteredProducts = selectedCategory === "All"
        ? products
        : products.filter(p => p.category === selectedCategory);

    const handleSplashComplete = () => {
        setShowSplash(false);
    };

    return (
        <>
            <AnimatePresence>
                {showSplash && (
                    <motion.div
                        key="splash"
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="fixed inset-0 z-50"
                    >
                        <BackgroundPaths onComplete={handleSplashComplete} />
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="container py-12">
                {/* Hero Section */}
                <section className="mb-16 text-center">
                    <h1 className="text-5xl font-bold mb-4 tracking-tight">
                        Curated Essentials for <span className="text-[var(--primary)]">Modern Living</span>
                    </h1>
                    <p className="text-lg opacity-70 max-w-2xl mx-auto">
                        Discover a collection of premium products designed to elevate your everyday experience.
                    </p>
                </section>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <aside className="w-full md:w-64 flex-shrink-0">
                        <div className="sticky top-24">
                            <div className="flex items-center gap-2 font-bold mb-4 text-lg">
                                <Filter size={20} /> Filters
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-medium mb-2 opacity-80">Categories</h3>
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`block w-full text-left px-3 py-2 rounded-md transition-colors ${selectedCategory === cat
                                            ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                                            : 'hover:bg-[var(--accent)]'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            <div className="mt-8 pt-8 border-t border-[var(--border)]">
                                <h3 className="font-medium mb-4 opacity-80">Price Range</h3>
                                <input type="range" className="w-full accent-[var(--primary)]" />
                                <div className="flex justify-between text-sm opacity-60 mt-2">
                                    <span>₹0</span>
                                    <span>₹1000</span>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Product Grid */}
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">
                                {selectedCategory === "All" ? "All Products" : selectedCategory}
                            </h2>
                            <span className="text-sm opacity-60">{filteredProducts.length} results</span>
                        </div>

                        <div className="grid-products">
                            {loading ? (
                                // Skeleton loading
                                Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="card h-[400px] animate-pulse">
                                        <div className="h-[300px] bg-[var(--secondary)] rounded-t-xl" />
                                        <div className="p-4 space-y-3">
                                            <div className="h-4 bg-[var(--secondary)] rounded w-3/4" />
                                            <div className="h-4 bg-[var(--secondary)] rounded w-1/2" />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                filteredProducts.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
