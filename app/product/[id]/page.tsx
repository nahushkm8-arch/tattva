'use client';

import { ShoppingCart, Star, Truck, ShieldCheck, Check, User } from 'lucide-react';
import { useCart } from '../../components/Providers';
import { useState } from 'react';
import { PRODUCTS } from '../../lib/data';

export default function ProductDetail({ params }: { params: { id: string } }) {
    const { addToCart } = useCart();
    const [isAdded, setIsAdded] = useState(false);

    // Find product by ID
    const product = PRODUCTS.find(p => p.id === params.id);

    if (!product) {
        return (
            <div className="container py-24 text-center">
                <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
                <p className="opacity-60">The product you are looking for does not exist.</p>
            </div>
        );
    }

    const handleAddToCart = () => {
        addToCart(product);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    return (
        <div className="container py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                {/* Image Gallery */}
                <div className="space-y-4">
                    <div className="aspect-square bg-[var(--secondary)] rounded-lg overflow-hidden">
                        <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="aspect-square bg-[var(--secondary)] rounded-md overflow-hidden cursor-pointer hover:ring-2 ring-[var(--primary)]">
                                <img
                                    src={product.image}
                                    alt="Thumbnail"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Product Info */}
                <div>
                    <div className="mb-2 text-[var(--primary)] font-bold tracking-wide uppercase text-sm">{product.category}</div>
                    <h1 className="text-4xl font-bold mb-4">{product.name}</h1>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex text-yellow-400">
                            {[1, 2, 3, 4, 5].map(i => (
                                <Star
                                    key={i}
                                    size={16}
                                    fill={i <= Math.round(product.rating) ? "currentColor" : "none"}
                                    className={i > Math.round(product.rating) ? "text-gray-300" : ""}
                                />
                            ))}
                        </div>
                        <span className="opacity-60 text-sm">({product.reviewsCount} reviews)</span>
                    </div>

                    <div className="text-3xl font-bold mb-8">${product.price.toFixed(2)}</div>

                    <p className="opacity-80 leading-relaxed mb-8">
                        {product.description}
                    </p>

                    {/* Features Section */}
                    <div className="mb-8">
                        <h3 className="font-bold mb-4">Key Features</h3>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {product.features.map((feature, index) => (
                                <li key={index} className="flex items-center gap-2 text-sm opacity-80">
                                    <div className="w-5 h-5 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
                                        <Check size={12} />
                                    </div>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex gap-4 mb-8">
                        <button
                            onClick={handleAddToCart}
                            className="btn btn-primary flex-1 py-4 text-lg gap-2 transition-all duration-300"
                        >
                            {isAdded ? (
                                <>
                                    <Check size={20} /> Added to Cart
                                </>
                            ) : (
                                <>
                                    <ShoppingCart size={20} /> Add to Cart
                                </>
                            )}
                        </button>
                        <button className="btn btn-outline flex-1 py-4 text-lg">
                            Buy Now
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm opacity-80">
                        <div className="flex items-center gap-2">
                            <Truck size={18} /> Free Shipping
                        </div>
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={18} /> 2 Year Warranty
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="border-t border-[var(--border)] pt-12">
                <h2 className="text-2xl font-bold mb-8">Customer Reviews</h2>

                {product.reviews && product.reviews.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {product.reviews.map((review) => (
                            <div key={review.id} className="card p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-[var(--secondary)] overflow-hidden">
                                        {review.avatar ? (
                                            <img src={review.avatar} alt={review.userName} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <User size={20} className="opacity-50" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-bold">{review.userName}</div>
                                        <div className="text-xs opacity-60">{new Date(review.date).toLocaleDateString()}</div>
                                    </div>
                                    <div className="ml-auto flex text-yellow-400">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <Star
                                                key={i}
                                                size={14}
                                                fill={i <= review.rating ? "currentColor" : "none"}
                                                className={i > review.rating ? "text-gray-300" : ""}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <p className="opacity-80 leading-relaxed">
                                    "{review.comment}"
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-[var(--secondary)]/30 rounded-lg">
                        <p className="opacity-60">No reviews yet. Be the first to review this product!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
