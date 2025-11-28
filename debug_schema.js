const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkSchema() {
    console.log("Checking 'orders' table columns...");
    const { data: orders, error: oError } = await supabase.from('orders').select('*').limit(1);

    if (oError) {
        console.error("Error fetching orders:", oError);
        // If we can't fetch, we can't see columns. 
        // But the error might tell us if a column is missing if we tried to select it specifically.
    } else {
        if (orders.length > 0) {
            console.log("Orders columns:", Object.keys(orders[0]));
        } else {
            console.log("Orders table is empty, cannot infer columns from data.");
            // Try inserting a dummy row that will fail but reveal schema? No.
        }
    }

    console.log("\nChecking 'order_items' table columns...");
    const { data: items, error: iError } = await supabase.from('order_items').select('*').limit(1);
    if (iError) {
        console.error("Error fetching items:", iError);
    } else {
        if (items.length > 0) {
            console.log("Order Items columns:", Object.keys(items[0]));
        } else {
            console.log("Order Items table is empty.");
        }
    }
}

checkSchema();
