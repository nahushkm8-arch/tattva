const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    console.log('Checking Products...');
    const { data: products, error: prodError } = await supabase
        .from('products')
        .select('id, name, seller_id');

    if (prodError) {
        console.error('Error fetching products:', JSON.stringify(prodError, null, 2));
    } else {
        console.log(`Found ${products.length} products.`);
        console.table(products.slice(0, 5)); // Show first 5
    }

    console.log('\nChecking Order Items...');
    const { data: orderItems, error: oiError } = await supabase
        .from('order_items')
        .select('id, product_id, order_id, products(seller_id)');

    if (oiError) {
        console.error('Error fetching order items:', JSON.stringify(oiError, null, 2));
    } else {
        console.log('Order Items found:', orderItems.length);
        orderItems.forEach(item => {
            console.log(`Order Item ${item.id}: Product ${item.product_id}, Seller: ${item.products?.seller_id}`);
        });
    }
}

checkData();
