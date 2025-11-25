'use client';

import { useState, useEffect } from 'react';
import ProductCard from './components/ProductCard';
import { Filter } from 'lucide-react';
import { PRODUCTS } from './lib/data';
import { BackgroundPaths } from '@/components/ui/background-paths';
import { AnimatePresence, motion } from 'framer-motion';

const CATEGORIES = ["All", "Electronics", "Clothing", "Accessories", "Bags", "Footwear", "Home", "Fitness"];

export default function Home() {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [showSplash, setShowSplash] = useState(false);

    useEffect(() => {
        const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
        if (!hasSeenSplash) {
            setShowSplash(true);
            sessionStorage.setItem('hasSeenSplash', 'true');
        }
    }, []);

    const filteredProducts = selectedCategory === "All"
        ? PRODUCTS
        : PRODUCTS.filter(p => p.category === selectedCategory);

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
                                    <span>$0</span>
                                    <span>$1000</span>
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
                            {filteredProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
