-- 1. Create PRODUCTS table first (referenced by cart_items)
create table if not exists public.products (
  id text primary key,
  name text not null,
  price numeric(10, 2) not null,
  original_price numeric(10, 2),
  category text not null,
  image text not null,
  rating numeric(3, 1) default 0,
  reviews_count integer default 0,
  sold_count integer default 0,
  description text,
  features text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS for products
alter table public.products enable row level security;
create policy "Products are viewable by everyone" on public.products for select using (true);

-- 3. Populate PRODUCTS with data (Required for Foreign Keys to work when you add items)
INSERT INTO public.products (id, name, price, original_price, category, image, rating, reviews_count, sold_count, description, features) VALUES
('1', 'Minimalist Watch', 129.99, 159.99, 'Accessories', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60', 4.8, 128, 1250, 'Elevate your style with this premium minimalist watch. Featuring a genuine leather strap, sapphire crystal glass, and a precision Japanese movement. Water-resistant up to 50 meters. Perfect for both casual and formal occasions.', ARRAY['Genuine Leather Strap', 'Sapphire Crystal Glass', 'Japanese Quartz Movement', '5ATM Water Resistance', 'Stainless Steel Case']),
('2', 'Leather Backpack', 199.50, NULL, 'Bags', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=60', 4.7, 85, 850, 'Handcrafted from full-grain leather, this backpack combines vintage style with modern functionality. Features a padded laptop compartment, multiple organizer pockets, and durable brass hardware.', ARRAY['Full-Grain Leather', 'Padded 15" Laptop Sleeve', 'Brass Hardware', 'Water-Resistant Lining', 'Ergonomic Straps']),
('3', 'Wireless Headphones', 249.00, 299.00, 'Electronics', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=60', 4.9, 210, 3200, 'Experience sound like never before with our Premium Noise-Cancelling Headphones. Designed for audiophiles, these headphones offer crystal clear audio, deep bass, and industry-leading noise cancellation technology.', ARRAY['Active Noise Cancellation', '30-Hour Battery Life', 'Premium Memory Foam Earcups', 'Bluetooth 5.0', 'Built-in Microphone']),
('4', 'Cotton T-Shirt', 29.99, NULL, 'Clothing', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format&fit=crop&q=60', 4.5, 340, 5000, 'A classic essential. Made from 100% organic cotton, this t-shirt offers breathable comfort and a perfect fit. Pre-shrunk to maintain its shape wash after wash.', ARRAY['100% Organic Cotton', 'Pre-Shrunk Fabric', 'Reinforced Seams', 'Eco-Friendly Dye', 'Tagless Label']),
('5', 'Smart Speaker', 89.99, 119.99, 'Electronics', 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=800&auto=format&fit=crop&q=60', 4.6, 156, 1500, 'Fill your room with rich, 360-degree sound. This smart speaker connects seamlessly to your devices and features built-in voice assistant support for hands-free control.', ARRAY['360-Degree Sound', 'Voice Assistant Built-in', 'WiFi & Bluetooth', 'Multi-Room Audio', 'Privacy Mute Switch']),
('6', 'Running Shoes', 119.00, 149.00, 'Footwear', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=60', 4.8, 189, 2100, 'Designed for performance. These running shoes feature responsive cushioning, a breathable mesh upper, and a durable rubber outsole for superior traction on any surface.', ARRAY['Responsive Cushioning', 'Breathable Mesh Upper', 'Durable Rubber Outsole', 'Lightweight Design', 'Reflective Details']),
('7', 'Ceramic Coffee Mug', 24.99, NULL, 'Home', 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&auto=format&fit=crop&q=60', 4.9, 450, 3200, 'Hand-thrown ceramic mug with a unique glaze. Perfect for your morning coffee or tea. Microwave and dishwasher safe.', ARRAY['Handcrafted', 'Unique Glaze', 'Microwave Safe', 'Dishwasher Safe', '12oz Capacity']),
('8', 'Premium Yoga Mat', 65.00, 85.00, 'Fitness', 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&auto=format&fit=crop&q=60', 4.7, 120, 900, 'Non-slip, eco-friendly yoga mat providing excellent cushioning and support for your practice. Includes a carrying strap.', ARRAY['Non-Slip Surface', 'Eco-Friendly Material', '6mm Thickness', 'Carrying Strap Included', 'Easy to Clean']),
('9', 'Classic Aviator Sunglasses', 145.00, NULL, 'Accessories', 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&auto=format&fit=crop&q=60', 4.6, 89, 600, 'Timeless aviator style with polarized lenses for superior glare protection. Lightweight metal frame for all-day comfort.', ARRAY['Polarized Lenses', 'UV400 Protection', 'Metal Frame', 'Adjustable Nose Pads', 'Hard Case Included']),
('10', 'Mechanical Keyboard', 189.99, 219.99, 'Electronics', 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&auto=format&fit=crop&q=60', 4.9, 560, 1800, 'High-performance mechanical keyboard with custom switches and RGB backlighting. Built for typing enthusiasts and gamers alike.', ARRAY['Mechanical Switches', 'RGB Backlighting', 'Aluminum Frame', 'Programmable Keys', 'Detachable Cable']),
('11', 'Denim Jacket', 89.50, NULL, 'Clothing', 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800&auto=format&fit=crop&q=60', 4.5, 210, 1100, 'A wardrobe staple. This vintage-wash denim jacket features a relaxed fit and durable construction that gets better with age.', ARRAY['100% Cotton Denim', 'Vintage Wash', 'Button Front', 'Chest Pockets', 'Relaxed Fit']),
('12', 'Succulent Plant Pot', 18.00, NULL, 'Home', 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&auto=format&fit=crop&q=60', 4.8, 150, 2500, 'Minimalist concrete planter perfect for succulents or small houseplants. Adds a touch of modern greenery to any space.', ARRAY['Concrete Material', 'Drainage Hole', 'Modern Design', 'Durable', 'Indoor/Outdoor Use']),
('13', 'Travel Backpack', 159.00, 199.00, 'Bags', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=60', 4.7, 310, 1400, 'Versatile travel backpack with expandable storage and TSA-friendly laptop compartment. Water-resistant and comfortable for long journeys.', ARRAY['Expandable Capacity', 'TSA-Friendly Laptop Sleeve', 'Water-Resistant', 'Hidden Passport Pocket', 'Sternum Strap']),
('14', 'Scented Soy Candle', 32.00, NULL, 'Home', 'https://images.unsplash.com/photo-1602825266988-75001771d276?w=800&auto=format&fit=crop&q=60', 4.9, 600, 5000, 'Hand-poured soy wax candle with essential oils. Long-burning and fills your home with a calming, natural fragrance.', ARRAY['100% Soy Wax', 'Essential Oils', '50+ Hour Burn Time', 'Cotton Wick', 'Reusable Glass Jar'])
ON CONFLICT (id) DO NOTHING; -- Prevent errors if data already exists

-- 4. Now Create CART ITEMS table (which references products)
create table if not exists public.cart_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  product_id text references public.products(id) not null,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, product_id)
);

-- 5. Enable RLS for cart_items
alter table public.cart_items enable row level security;

-- 6. Policies for cart_items
create policy "Users can view their own cart items" 
  on public.cart_items for select 
  using (auth.uid() = user_id);

create policy "Users can add items to their own cart" 
  on public.cart_items for insert 
  with check (auth.uid() = user_id);

create policy "Users can update quantity of their own cart items" 
  on public.cart_items for update 
  using (auth.uid() = user_id);

create policy "Users can remove items from their own cart" 
  on public.cart_items for delete 
  using (auth.uid() = user_id);
