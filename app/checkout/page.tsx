'use client';

import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, Tag } from 'lucide-react';
import { useCart } from '../components/Providers';
import { supabase } from '../lib/supabase';
import { DbAddress } from '../lib/db-types';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
    const { cartTotal, cart, clearCart } = useCart();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [discountCode, setDiscountCode] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        address: '',
        city: '',
        postalCode: '',
        country: ''
    });

    useEffect(() => {
        const fetchAddress = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setFormData(prev => ({ ...prev, email: user.email || '' }));

                const { data: addressData } = await supabase
                    .from('addresses')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('is_default', true)
                    .single();

                if (addressData) {
                    const address = addressData as DbAddress;
                    setFormData(prev => ({
                        ...prev,
                        address: address.address_line1,
                        city: address.city,
                        postalCode: address.zip_code,
                        country: address.country
                    }));
                }
            }
        };
        fetchAddress();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

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

    const handlePlaceOrder = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert('Please sign in to place an order');
                router.push('/login');
                return;
            }

            // 1. Create Order
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    user_id: user.id,
                    status: 'Processing',
                    total_amount: totalWithTax
                })
                .select()
                .single();

            if (orderError || !order) throw orderError;

            // 2. Create Order Items
            const orderItems = cart.map(item => ({
                order_id: order.id,
                product_id: item.id,
                quantity: item.quantity,
                price: item.price
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems);

            if (itemsError) throw itemsError;

            // 3. Clear Cart
            await clearCart();

            // 4. Redirect
            router.push('/you?view=orders');

        } catch (error: any) {
            console.error('Error placing order:', error);
            alert(`Failed to place order: ${error.message || JSON.stringify(error)}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-12 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Shipping Info */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold mb-4">Shipping Information</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" name="firstName" placeholder="First Name" className="input" value={formData.firstName} onChange={handleInputChange} />
                        <input type="text" name="lastName" placeholder="Last Name" className="input" value={formData.lastName} onChange={handleInputChange} />
                    </div>
                    <input type="email" name="email" placeholder="Email Address" className="input" value={formData.email} onChange={handleInputChange} />
                    <input type="text" name="address" placeholder="Address" className="input" value={formData.address} onChange={handleInputChange} />
                    <div className="grid grid-cols-2 gap-4">
                        <input type="text" name="city" placeholder="City" className="input" value={formData.city} onChange={handleInputChange} />
                        <input type="text" name="postalCode" placeholder="Postal Code" className="input" value={formData.postalCode} onChange={handleInputChange} />
                    </div>
                    <input type="text" name="country" placeholder="Country" className="input" value={formData.country} onChange={handleInputChange} />
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
                                <Tag size={14} /> Discount applied: -₹{discountAmount.toFixed(2)}
                            </div>
                        )}
                    </div>

                    <div className="border-t border-[var(--border)] pt-6 mt-6">
                        <div className="space-y-2 mb-6">
                            <div className="flex justify-between text-sm opacity-60">
                                <span>Subtotal</span>
                                <span>₹{cartTotal.toFixed(2)}</span>
                            </div>
                            {discountAmount > 0 && (
                                <div className="flex justify-between text-sm text-green-600">
                                    <span>Discount</span>
                                    <span>-₹{discountAmount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-lg font-bold">
                                <span>Total to Pay</span>
                                <span>₹{totalWithTax.toFixed(2)}</span>
                            </div>
                        </div>
                        <button
                            onClick={handlePlaceOrder}
                            disabled={loading || cart.length === 0}
                            className="btn btn-primary w-full py-4 text-lg gap-2"
                        >
                            {loading ? 'Processing...' : <><CheckCircle size={20} /> Complete Order</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
