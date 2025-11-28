const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
    console.log("Checking products for seller_id...");
    const { data, error } = await supabase.from('products').select('id, name, seller_id');
    if (error) {
        console.error("Error:", error);
    } else {
        console.table(data);
        const nullSellers = data.filter(p => !p.seller_id);
        if (nullSellers.length > 0) {
            console.log(`\nWARNING: ${nullSellers.length} products have NO seller_id. These will NOT show up in the dashboard.`);
        } else {
            console.log("\nAll products have a seller_id.");
        }
    }
}
check();
