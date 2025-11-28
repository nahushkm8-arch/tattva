const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkProductSchema() {
    console.log("Checking 'products' table schema...");
    // We can't directly query information_schema easily with just the JS client unless we use rpc or have permissions.
    // But we can infer from a select.

    const { data, error } = await supabase.from('products').select('id').limit(1);
    if (error) {
        console.error("Error:", error);
    } else {
        if (data.length > 0) {
            console.log("Sample Product ID:", data[0].id);
            console.log("Type of ID:", typeof data[0].id);
        } else {
            console.log("No products found to check type.");
        }
    }
}

checkProductSchema();
