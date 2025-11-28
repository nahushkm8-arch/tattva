'use client';

import Link from 'next/link';
import { ShoppingCart, Check, Star } from 'lucide-react';
import { useCart, Product } from './Providers';
import { useState } from 'react';
import WishlistButton from './WishlistButton';

// Extend the global Product type or use it directly. 
// Since the global type has more fields, we can just use it, 
// but the props passed might be a subset if coming from a list that doesn't have full details.
// For now, let's assume the passed product has at least the basic fields.

export default function ProductCard({ product }: { product: any }) {
    const { addToCart } = useCart();
    const [isAdded, setIsAdded] = useState(false);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation to detail page
        // Construct a full product object if needed, or ensure the passed product has enough info.
        // We'll assume the passed product is sufficient for the cart (needs id, name, price, image).
        // We might need to add default values for missing fields if the list view doesn't have them.
        const cartProduct: Product = {
            ...product,
            id: product.id.toString(),
            rating: product.rating || 0,
            reviewsCount: product.reviewsCount || 0,
            description: product.description || '',
            features: product.features || []
        };

        addToCart(cartProduct);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    return (
        <div className="card group hover:shadow-lg transition-shadow">
            <div className="relative aspect-square overflow-hidden bg-[var(--secondary)]">
                <Link href={`/product/${product.id}`} className="block w-full h-full">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                </Link>
                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <WishlistButton productId={product.id.toString()} className="bg-white/80 dark:bg-black/50 p-2 rounded-full backdrop-blur-sm" />
                </div>
                <button
                    onClick={handleAddToCart}
                    className={`absolute bottom-4 right-4 p-3 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] z-10 ${isAdded ? 'bg-green-500 text-white opacity-100' : 'bg-[var(--background)]'}`}
                    title="Add to Cart"
                >
                    {isAdded ? <Check size={20} /> : <ShoppingCart size={20} />}
                </button>
            </div>
            <div className="p-4">
                <div className="text-xs font-medium opacity-60 mb-1 uppercase tracking-wider">
                    {product.category}
                </div>
                <Link href={`/product/${product.id}`} className="block text-lg font-semibold mb-2 hover:underline">
                    {product.name}
                </Link>
                <div className="flex items-center gap-2 mb-2">
                    <div className="flex text-yellow-400">
                        {[1, 2, 3, 4, 5].map(i => (
                            <Star
                                key={i}
                                size={14}
                                fill={i <= Math.round(product.rating || 0) ? "currentColor" : "none"}
                                className={i > Math.round(product.rating || 0) ? "text-gray-300" : ""}
                            />
                        ))}
                    </div>
                    <span className="text-xs opacity-60">({product.reviewsCount || 0})</span>
                </div>
                <div className="font-bold text-[var(--primary)]">
                    ₹{product.price.toFixed(2)}
                </div>

                {product.reviews && product.reviews.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[var(--border)]">
                        <p className="text-xs italic opacity-70 line-clamp-2">
                            "{product.reviews[0].comment}"
                        </p>
                        <p className="text-[10px] font-medium mt-1 opacity-50">
                            - {product.reviews[0].userName}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
