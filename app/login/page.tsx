'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <div className="container flex items-center justify-center min-h-[80vh]">
            <div className="card w-full max-w-md p-8">
                <h1 className="text-3xl font-bold text-center mb-2">
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                </h1>
                <p className="text-center opacity-60 mb-8">
                    {isLogin ? 'Enter your credentials to access your account' : 'Sign up to start shopping'}
                </p>

                <form className="space-y-4">
                    {!isLogin && (
                        <div className="grid grid-cols-2 gap-4">
                            <input type="text" placeholder="First Name" className="input" />
                            <input type="text" placeholder="Last Name" className="input" />
                        </div>
                    )}
                    <input type="email" placeholder="Email Address" className="input" />
                    <input type="password" placeholder="Password" className="input" />

                    {isLogin && (
                        <div className="flex justify-end">
                            <button type="button" className="text-sm text-[var(--primary)] hover:underline">
                                Forgot Password?
                            </button>
                        </div>
                    )}

                    <button className="btn btn-primary w-full py-3">
                        {isLogin ? 'Sign In' : 'Sign Up'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <span className="opacity-60">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                    </span>
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-[var(--primary)] font-bold hover:underline"
                    >
                        {isLogin ? 'Sign Up' : 'Sign In'}
                    </button>
                </div>
            </div>
        </div>
    );
}
