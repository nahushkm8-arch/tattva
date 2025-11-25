'use client';

import Link from 'next/link';
import { ShoppingCart, Search, Sun, Moon, User, Mic, Camera } from 'lucide-react';
import { useTheme, useCart } from './Providers';
import { useState, useEffect } from 'react';

export default function Navbar() {
    const { theme, toggleTheme } = useTheme();
    const { cart } = useCart();
    const [searchQuery, setSearchQuery] = useState('');
    const [mounted, setMounted] = useState(false);
    const [isListening, setIsListening] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

    const handleVoiceSearch = () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            const recognition = new SpeechRecognition();

            recognition.onstart = () => {
                setIsListening(true);
            };

            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setSearchQuery(transcript);
                setIsListening(false);
            };

            recognition.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognition.start();
        } else {
            alert("Voice search is not supported in this browser.");
        }
    };

    const handleImageSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Mock image search functionality
            setSearchQuery(`Searching for similar to: ${file.name}...`);
            // In a real app, you would upload the image to a backend for analysis
            setTimeout(() => {
                setSearchQuery("Watch"); // Simulating a result
            }, 1500);
        }
    };

    return (
        <nav className="border-b border-[var(--border)] sticky top-0 z-50 bg-[var(--background)]/80 backdrop-blur-md">
            <div className="container flex items-center justify-between h-16">
                {/* Logo */}
                <Link href="/" className="text-2xl font-bold tracking-tighter">
                    Tattva<span className="text-[var(--primary)]">.</span>
                </Link>

                {/* Search Bar */}
                <div className="hidden md:flex items-center flex-1 max-w-md mx-8 relative">
                    <input
                        type="text"
                        placeholder={isListening ? "Listening..." : "Search products..."}
                        className={`input pr-24 ${isListening ? 'border-red-500 ring-1 ring-red-500' : ''}`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="absolute right-2 flex items-center gap-1">
                        <button
                            onClick={handleVoiceSearch}
                            className={`p-1.5 rounded-full transition-colors ${isListening ? 'bg-red-100 text-red-500 animate-pulse' : 'hover:bg-[var(--accent)] opacity-60 hover:opacity-100'}`}
                            title="Voice Search"
                        >
                            <Mic size={16} />
                        </button>
                        <label className="p-1.5 rounded-full hover:bg-[var(--accent)] opacity-60 hover:opacity-100 cursor-pointer transition-colors" title="Search by Image">
                            <Camera size={16} />
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageSearch} />
                        </label>
                        <div className="w-px h-4 bg-[var(--border)] mx-1"></div>
                        <Search className="w-4 h-4 text-[var(--foreground)] opacity-50" />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <Link href="/seller" className="nav-link hidden sm:block">
                        Become a Seller
                    </Link>

                    <button onClick={toggleTheme} className="p-2 hover:bg-[var(--accent)] rounded-full transition-colors">
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>

                    <Link href="/cart" className="p-2 hover:bg-[var(--accent)] rounded-full transition-colors relative">
                        <ShoppingCart size={20} />
                        {mounted && cartCount > 0 && (
                            <span className="absolute top-0 right-0 w-4 h-4 bg-[var(--primary)] text-[var(--primary-foreground)] text-[10px] font-bold rounded-full flex items-center justify-center animate-in zoom-in">
                                {cartCount}
                            </span>
                        )}
                    </Link>

                    <Link href="/you" className="p-2 hover:bg-[var(--accent)] rounded-full transition-colors" title="Your Profile">
                        <User size={20} />
                    </Link>

                    <Link href="/login" className="btn btn-primary text-sm">
                        Sign In
                    </Link>
                </div>
            </div>
        </nav>
    );
}
