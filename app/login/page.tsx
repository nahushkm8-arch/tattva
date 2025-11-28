'use client';

import Link from 'next/link';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const router = useRouter();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            if (mode === 'signup') {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            first_name: firstName,
                            last_name: lastName,
                        }
                    }
                });
                if (error) throw error;
                setMessage({ type: 'success', text: 'Check your email for the confirmation link!' });
            } else if (mode === 'login') {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                router.push('/you');
            } else if (mode === 'forgot') {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/auth/update-password`,
                });
                if (error) throw error;
                setMessage({ type: 'success', text: 'Check your email for the password reset link!' });
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container flex items-center justify-center min-h-[80vh]">
            <div className="card w-full max-w-md p-8">
                <h1 className="text-3xl font-bold text-center mb-2">
                    {mode === 'login' && 'Welcome Back'}
                    {mode === 'signup' && 'Create Account'}
                    {mode === 'forgot' && 'Reset Password'}
                </h1>
                <p className="text-center opacity-60 mb-8">
                    {mode === 'login' && 'Enter your credentials to access your account'}
                    {mode === 'signup' && 'Sign up to start shopping'}
                    {mode === 'forgot' && 'Enter your email to receive a reset link'}
                </p>

                {message && (
                    <div className={`p-3 rounded-md mb-4 text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-4">
                    {mode === 'signup' && (
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="First Name"
                                className="input"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Last Name"
                                className="input"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </div>
                    )}

                    <input
                        type="email"
                        placeholder="Email Address"
                        className="input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    {mode !== 'forgot' && (
                        <input
                            type="password"
                            placeholder="Password"
                            className="input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    )}

                    {mode === 'login' && (
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => setMode('forgot')}
                                className="text-sm text-[var(--primary)] hover:underline"
                            >
                                Forgot Password?
                            </button>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary w-full py-3"
                    >
                        {loading ? 'Processing...' : (
                            <>
                                {mode === 'login' && 'Sign In'}
                                {mode === 'signup' && 'Sign Up'}
                                {mode === 'forgot' && 'Send Reset Link'}
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <span className="opacity-60">
                        {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                    </span>
                    <button
                        onClick={() => {
                            setMode(mode === 'login' ? 'signup' : 'login');
                            setMessage(null);
                        }}
                        className="text-[var(--primary)] font-bold hover:underline"
                    >
                        {mode === 'login' ? 'Sign Up' : 'Sign In'}
                    </button>
                </div>
            </div>
        </div>
    );
}
