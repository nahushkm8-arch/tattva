
export interface Review {
    id: string;
    userName: string;
    rating: number;
    date: string;
    comment: string;
    avatar?: string;
}

export interface Product {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    category: string;
    rating: number;
    reviewsCount: number;
    soldCount?: number;
    description: string;
    features: string[];
    reviews?: Review[];
}

export const PRODUCTS: Product[] = [
    {
        id: '1',
        name: "Minimalist Watch",
        price: 129.99,
        originalPrice: 159.99,
        category: "Accessories",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60",
        rating: 4.8,
        reviewsCount: 128,
        soldCount: 1250,
        description: 'Elevate your style with this premium minimalist watch. Featuring a genuine leather strap, sapphire crystal glass, and a precision Japanese movement. Water-resistant up to 50 meters. Perfect for both casual and formal occasions.',
        features: [
            'Genuine Leather Strap',
            'Sapphire Crystal Glass',
            'Japanese Quartz Movement',
            '5ATM Water Resistance',
            'Stainless Steel Case'
        ],
        reviews: [
            {
                id: 'r1',
                userName: 'Alex Johnson',
                rating: 5,
                date: '2023-10-15',
                comment: 'Absolutely love this watch! It looks even better in person. The leather is high quality and it fits perfectly.',
                avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&auto=format&fit=crop&q=60'
            },
            {
                id: 'r2',
                userName: 'Sarah Williams',
                rating: 4,
                date: '2023-09-28',
                comment: 'Great watch for the price. The design is very clean. Only took off a star because shipping was a bit slow.',
                avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60'
            }
        ]
    },
    {
        id: '2',
        name: "Leather Backpack",
        price: 199.50,
        category: "Bags",
        image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=60",
        rating: 4.7,
        reviewsCount: 85,
        soldCount: 850,
        description: 'Handcrafted from full-grain leather, this backpack combines vintage style with modern functionality. Features a padded laptop compartment, multiple organizer pockets, and durable brass hardware.',
        features: [
            'Full-Grain Leather',
            'Padded 15" Laptop Sleeve',
            'Brass Hardware',
            'Water-Resistant Lining',
            'Ergonomic Straps'
        ],
        reviews: [
            {
                id: 'r3',
                userName: 'Michael Brown',
                rating: 5,
                date: '2023-11-02',
                comment: 'The leather quality is outstanding. Smells great and feels very durable. Fits my MacBook Pro 16" perfectly.',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60'
            }
        ]
    },
    {
        id: '3',
        name: "Wireless Headphones",
        price: 249.00,
        originalPrice: 299.00,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60",
        rating: 4.9,
        reviewsCount: 210,
        soldCount: 3200,
        description: 'Experience sound like never before with our Premium Noise-Cancelling Headphones. Designed for audiophiles, these headphones offer crystal clear audio, deep bass, and industry-leading noise cancellation technology.',
        features: [
            'Active Noise Cancellation',
            '30-Hour Battery Life',
            'Premium Memory Foam Earcups',
            'Bluetooth 5.0',
            'Built-in Microphone'
        ],
        reviews: [
            {
                id: 'r4',
                userName: 'Emily Davis',
                rating: 5,
                date: '2023-10-20',
                comment: 'Best headphones I have ever owned. The noise cancellation is magical.',
                avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=60'
            }
        ]
    },
    {
        id: '4',
        name: "Cotton T-Shirt",
        price: 29.99,
        category: "Clothing",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format&fit=crop&q=60",
        rating: 4.5,
        reviewsCount: 340,
        soldCount: 5000,
        description: 'A classic essential. Made from 100% organic cotton, this t-shirt offers breathable comfort and a perfect fit. Pre-shrunk to maintain its shape wash after wash.',
        features: [
            '100% Organic Cotton',
            'Pre-Shrunk Fabric',
            'Reinforced Seams',
            'Eco-Friendly Dye',
            'Tagless Label'
        ],
        reviews: []
    },
    {
        id: '5',
        name: "Smart Speaker",
        price: 89.99,
        originalPrice: 119.99,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=800&auto=format&fit=crop&q=60",
        rating: 4.6,
        reviewsCount: 156,
        soldCount: 1500,
        description: 'Fill your room with rich, 360-degree sound. This smart speaker connects seamlessly to your devices and features built-in voice assistant support for hands-free control.',
        features: [
            '360-Degree Sound',
            'Voice Assistant Built-in',
            'WiFi & Bluetooth',
            'Multi-Room Audio',
            'Privacy Mute Switch'
        ],
        reviews: []
    },
    {
        id: '6',
        name: "Running Shoes",
        price: 119.00,
        originalPrice: 149.00,
        category: "Footwear",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=60",
        rating: 4.8,
        reviewsCount: 189,
        soldCount: 2100,
        description: 'Designed for performance. These running shoes feature responsive cushioning, a breathable mesh upper, and a durable rubber outsole for superior traction on any surface.',
        features: [
            'Responsive Cushioning',
            'Breathable Mesh Upper',
            'Durable Rubber Outsole',
            'Lightweight Design',
            'Reflective Details'
        ],
        reviews: []
    },
    {
        id: '7',
        name: "Ceramic Coffee Mug",
        price: 24.99,
        category: "Home",
        image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&auto=format&fit=crop&q=60",
        rating: 4.9,
        reviewsCount: 450,
        soldCount: 3200,
        description: 'Hand-thrown ceramic mug with a unique glaze. Perfect for your morning coffee or tea. Microwave and dishwasher safe.',
        features: [
            'Handcrafted',
            'Unique Glaze',
            'Microwave Safe',
            'Dishwasher Safe',
            '12oz Capacity'
        ],
        reviews: []
    },
    {
        id: '8',
        name: "Premium Yoga Mat",
        price: 65.00,
        originalPrice: 85.00,
        category: "Fitness",
        image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&auto=format&fit=crop&q=60",
        rating: 4.7,
        reviewsCount: 120,
        soldCount: 900,
        description: 'Non-slip, eco-friendly yoga mat providing excellent cushioning and support for your practice. Includes a carrying strap.',
        features: [
            'Non-Slip Surface',
            'Eco-Friendly Material',
            '6mm Thickness',
            'Carrying Strap Included',
            'Easy to Clean'
        ],
        reviews: []
    },
    {
        id: '9',
        name: "Classic Aviator Sunglasses",
        price: 145.00,
        category: "Accessories",
        image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop&q=60",
        rating: 4.6,
        reviewsCount: 89,
        soldCount: 600,
        description: 'Timeless aviator style with polarized lenses for superior glare protection. Lightweight metal frame for all-day comfort.',
        features: [
            'Polarized Lenses',
            'UV400 Protection',
            'Metal Frame',
            'Adjustable Nose Pads',
            'Hard Case Included'
        ],
        reviews: []
    },
    {
        id: '10',
        name: "Mechanical Keyboard",
        price: 189.99,
        originalPrice: 219.99,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&auto=format&fit=crop&q=60",
        rating: 4.9,
        reviewsCount: 560,
        soldCount: 1800,
        description: 'High-performance mechanical keyboard with custom switches and RGB backlighting. Built for typing enthusiasts and gamers alike.',
        features: [
            'Mechanical Switches',
            'RGB Backlighting',
            'Aluminum Frame',
            'Programmable Keys',
            'Detachable Cable'
        ],
        reviews: []
    },
    {
        id: '11',
        name: "Denim Jacket",
        price: 89.50,
        category: "Clothing",
        image: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800&auto=format&fit=crop&q=60",
        rating: 4.5,
        reviewsCount: 210,
        soldCount: 1100,
        description: 'A wardrobe staple. This vintage-wash denim jacket features a relaxed fit and durable construction that gets better with age.',
        features: [
            '100% Cotton Denim',
            'Vintage Wash',
            'Button Front',
            'Chest Pockets',
            'Relaxed Fit'
        ],
        reviews: []
    },
    {
        id: '12',
        name: "Succulent Plant Pot",
        price: 18.00,
        category: "Home",
        image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&auto=format&fit=crop&q=60",
        rating: 4.8,
        reviewsCount: 150,
        soldCount: 2500,
        description: 'Minimalist concrete planter perfect for succulents or small houseplants. Adds a touch of modern greenery to any space.',
        features: [
            'Concrete Material',
            'Drainage Hole',
            'Modern Design',
            'Durable',
            'Indoor/Outdoor Use'
        ],
        reviews: []
    },
    {
        id: '13',
        name: "Travel Backpack",
        price: 159.00,
        originalPrice: 199.00,
        category: "Bags",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=60",
        rating: 4.7,
        reviewsCount: 310,
        soldCount: 1400,
        description: 'Versatile travel backpack with expandable storage and TSA-friendly laptop compartment. Water-resistant and comfortable for long journeys.',
        features: [
            'Expandable Capacity',
            'TSA-Friendly Laptop Sleeve',
            'Water-Resistant',
            'Hidden Passport Pocket',
            'Sternum Strap'
        ],
        reviews: []
    },
    {
        id: '14',
        name: "Scented Soy Candle",
        price: 32.00,
        category: "Home",
        image: "https://images.unsplash.com/photo-1602825266988-75001771d276?w=800&auto=format&fit=crop&q=60",
        rating: 4.9,
        reviewsCount: 600,
        soldCount: 5000,
        description: 'Hand-poured soy wax candle with essential oils. Long-burning and fills your home with a calming, natural fragrance.',
        features: [
            '100% Soy Wax',
            'Essential Oils',
            '50+ Hour Burn Time',
            'Cotton Wick',
            'Reusable Glass Jar'
        ],
        reviews: []
    }
];
