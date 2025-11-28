'use client';

import { ShoppingCart, Star, Truck, ShieldCheck, Check, User } from 'lucide-react';
import { useCart, Product } from '../../components/Providers';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import WishlistButton from '../../components/WishlistButton';
import { useRouter } from 'next/navigation';

export default function ProductDetail({ params }: { params: { id: string } }) {
    const { addToCart } = useCart();
    const [isAdded, setIsAdded] = useState(false);
    const [product, setProduct] = useState<Product | null>(null);
    const [selectedMedia, setSelectedMedia] = useState<{ type: 'image' | 'video'; url: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const getYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    useEffect(() => {
        const fetchProduct = async () => {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('id', params.id)
                .single();

            // Fetch Reviews
            const { data: reviewsData } = await supabase
                .from('reviews')
                .select('*')
                .eq('product_id', params.id)
                .order('created_at', { ascending: false });

            if (data && !error) {
                setProduct({
                    id: data.id,
                    name: data.name,
                    price: data.price,
                    originalPrice: data.original_price,
                    image: data.image,
                    category: data.category,
                    rating: data.rating || 0,
                    reviewsCount: data.reviews_count || 0,
                    soldCount: data.sold_count || 0,
                    description: data.description,
                    features: data.features || [],
                    media: data.media || [],
                    reviews: reviewsData ? reviewsData.map((r: any) => ({
                        id: r.id,
                        userName: r.user_name || 'Anonymous',
                        rating: r.rating,
                        comment: r.comment,
                        date: r.created_at,
                        avatar: ''
                    })) : []
                });
                if (data.media && data.media.length > 0) {
                    setSelectedMedia(data.media[0]);
                }
            }
            setLoading(false);
        };
        fetchProduct();
    }, [params.id]);

    if (loading) {
        return (
            <div className="container py-24 text-center">
                <div className="animate-pulse space-y-8">
                    <div className="h-[400px] bg-[var(--secondary)] rounded-xl w-full max-w-4xl mx-auto" />
                    <div className="h-8 bg-[var(--secondary)] rounded w-1/3 mx-auto" />
                </div>
            </div>
        );
    }

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

    const handleBuyNow = () => {
        addToCart(product);
        router.push('/checkout');
    };

    return (
        <div className="container py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                {/* Image Gallery */}
                {/* Image Gallery */}
                <div className="space-y-4">
                    <div className="aspect-square bg-[var(--secondary)] rounded-lg overflow-hidden relative">
                        {product.media && product.media.length > 0 ? (
                            selectedMedia?.type === 'video' ? (
                                getYouTubeId(selectedMedia.url) ? (
                                    <iframe
                                        src={`https://www.youtube.com/embed/${getYouTubeId(selectedMedia.url)}?autoplay=1&mute=1`}
                                        className="w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                ) : (
                                    <video src={selectedMedia.url} className="w-full h-full object-cover" controls autoPlay loop muted />
                                )
                            ) : (
                                <img
                                    src={selectedMedia?.url || product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            )
                        ) : (
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        {product.media && product.media.length > 0 ? (
                            product.media.map((item, i) => (
                                <div
                                    key={i}
                                    onClick={() => setSelectedMedia(item)}
                                    className={`aspect-square bg-[var(--secondary)] rounded-md overflow-hidden cursor-pointer hover:ring-2 ring-[var(--primary)] ${selectedMedia === item ? 'ring-2 ring-[var(--primary)]' : ''}`}
                                >
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
                                            <video src={item.url} className="w-full h-full object-cover" muted />
                                        )
                                    ) : (
                                        <img
                                            src={item.url}
                                            alt={`Thumbnail ${i + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="aspect-square bg-[var(--secondary)] rounded-md overflow-hidden cursor-pointer ring-2 ring-[var(--primary)]">
                                <img
                                    src={product.image}
                                    alt="Thumbnail"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
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

                    <div className="text-3xl font-bold mb-8">₹{product.price.toFixed(2)}</div>

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
                        <button
                            onClick={handleBuyNow}
                            className="btn btn-outline flex-1 py-4 text-lg"
                        >
                            Buy Now
                        </button>
                        <div className="flex items-center justify-center px-4">
                            <WishlistButton productId={product.id} size={28} className="p-2 hover:bg-red-50 rounded-full" />
                        </div>
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
