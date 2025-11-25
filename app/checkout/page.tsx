'use client';

import { useState } from 'react';
import { CreditCard, CheckCircle, Tag } from 'lucide-react';
import { useCart } from '../components/Providers';

export default function CheckoutPage() {
    const { cartTotal } = useCart();
    const [discountCode, setDiscountCode] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);

    const handleApplyDiscount = () => {
        if (discountCode.trim()) {
            // Mock discount logic
            if (discountCode.toUpperCase() === 'WELCOME20') {
                setDiscountAmount(cartTotal * 0.2);
            } else {
                // Just a random small discount for any other code for demo
                setDiscountAmount(10);
            }
        }
    };

    const totalWithTax = (cartTotal - discountAmount) * 1.1;

    return (
        <div className="container py-12 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Shipping Info */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold mb-4">Shipping Information</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="First Name" className="input" />
                        <input type="text" placeholder="Last Name" className="input" />
                    </div>
                    <input type="email" placeholder="Email Address" className="input" />
                    <input type="text" placeholder="Address" className="input" />
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="City" className="input" />
                        <input type="text" placeholder="Postal Code" className="input" />
                    </div>
                    <input type="text" placeholder="Country" className="input" />
                </div>

                {/* Payment Info */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold mb-4">Payment Details</h2>

                    <div className="card p-4 border-[var(--primary)] bg-[var(--primary)]/5 mb-4">
                        <div className="flex items-center gap-3 font-medium">
                            <CreditCard size={20} /> Credit Card
                        </div>
                    </div>

                    <input type="text" placeholder="Card Number" className="input" />
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" placeholder="MM / YY" className="input" />
                        <input type="text" placeholder="CVC" className="input" />
                    </div>
                    <input type="text" placeholder="Cardholder Name" className="input" />

                    {/* Discount Code */}
                    <div className="pt-4">
                        <label className="text-sm font-medium mb-2 block">Discount Code</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Enter code"
                                className="input uppercase"
                                value={discountCode}
                                onChange={(e) => setDiscountCode(e.target.value)}
                            />
                            <button onClick={handleApplyDiscount} className="btn btn-outline">Apply</button>
                        </div>
                        {discountAmount > 0 && (
                            <div className="text-green-600 text-sm mt-2 flex items-center gap-1">
                                <Tag size={14} /> Discount applied: -${discountAmount.toFixed(2)}
                            </div>
                        )}
                    </div>

                    <div className="border-t border-[var(--border)] pt-6 mt-6">
                        <div className="space-y-2 mb-6">
                            <div className="flex justify-between text-sm opacity-60">
                                <span>Subtotal</span>
                                <span>${cartTotal.toFixed(2)}</span>
                            </div>
                            {discountAmount > 0 && (
                                <div className="flex justify-between text-sm text-green-600">
                                    <span>Discount</span>
                                    <span>-${discountAmount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-lg font-bold">
                                <span>Total to Pay</span>
                                <span>${totalWithTax.toFixed(2)}</span>
                            </div>
                        </div>
                        <button className="btn btn-primary w-full py-4 text-lg gap-2">
                            <CheckCircle size={20} /> Complete Order
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
