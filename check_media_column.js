
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMediaColumn() {
    const { data, error } = await supabase
        .from('products')
        .select('media')
        .limit(1);

    if (error) {
        console.log('Error or column does not exist:', error.message);
    } else {
        console.log('Media column exists!');
    }
}

checkMediaColumn();
