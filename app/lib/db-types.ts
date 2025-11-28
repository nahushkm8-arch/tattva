export interface DbOrder {
    id: string;
    user_id: string;
    created_at: string;
    status: string;
    total_amount: number;
}

export interface DbOrderItem {
    id: string;
    order_id: string;
    product_id: string;
    quantity: number;
    price: number;
}

export interface DbAddress {
    id: string;
    user_id: string;
    label: string; // e.g., "Home", "Office"
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
    phone: string;
    is_default: boolean;
}

export interface DbWishlist {
    id: string;
    user_id: string;
    product_id: string;
    created_at: string;
}

export interface DbReview {
    id: string;
    user_id: string;
    product_id: string;
    rating: number;
    comment: string;
    created_at: string;
}
