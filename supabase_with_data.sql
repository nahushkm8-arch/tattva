-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE (Extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  first_name text,
  last_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. PRODUCTS TABLE
create table public.products (
  id text primary key, -- Keeping as text to match your existing IDs ('1', '2', etc.)
  name text not null,
  price numeric(10, 2) not null,
  original_price numeric(10, 2),
  category text not null,
  image text not null,
  rating numeric(3, 1) default 0,
  reviews_count integer default 0,
  sold_count integer default 0,
  description text,
  features text[], -- Array of text
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. REVIEWS TABLE (Optional, if you want to store reviews in DB)
create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
  product_id text references public.products(id) on delete cascade not null,
  user_name text not null, -- Or link to profile if you want strict user reviews
  rating integer not null check (rating >= 1 and rating <= 5),
  date timestamp with time zone default now(),
  comment text,
  avatar text
);

-- 4. ORDERS TABLE
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  status text check (status in ('Pending', 'Processing', 'In Transit', 'Delivered', 'Cancelled')) default 'Pending',
  total_amount numeric(10, 2) not null
);

-- 5. ORDER ITEMS TABLE
create table public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders not null,
  product_id text references public.products(id) not null,
  quantity integer not null default 1,
  price numeric(10, 2) not null
);

-- 6. ADDRESSES TABLE
create table public.addresses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  label text not null,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  state text not null,
  zip_code text not null,
  country text not null,
  phone text,
  is_default boolean default false
);

-- 7. WISHLIST TABLE
create table public.wishlist (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  product_id text references public.products(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, product_id)
);

-- 8. RLS POLICIES
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.reviews enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.addresses enable row level security;
alter table public.wishlist enable row level security;

-- Profiles
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Products (Publicly readable)
create policy "Products are viewable by everyone" on public.products for select using (true);

-- Reviews (Publicly readable)
create policy "Reviews are viewable by everyone" on public.reviews for select using (true);

-- Orders
create policy "Users can view own orders" on public.orders for select using (auth.uid() = user_id);

-- Order Items
create policy "Users can view own order items" on public.order_items for select using (exists (select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid()));

-- Addresses
create policy "Users can view own addresses" on public.addresses for select using (auth.uid() = user_id);
create policy "Users can insert own addresses" on public.addresses for insert with check (auth.uid() = user_id);
create policy "Users can update own addresses" on public.addresses for update using (auth.uid() = user_id);
create policy "Users can delete own addresses" on public.addresses for delete using (auth.uid() = user_id);

-- Wishlist
create policy "Users can view own wishlist" on public.wishlist for select using (auth.uid() = user_id);
create policy "Users can insert own wishlist" on public.wishlist for insert with check (auth.uid() = user_id);
create policy "Users can delete own wishlist" on public.wishlist for delete using (auth.uid() = user_id);

-- 9. AUTH TRIGGER
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, first_name, last_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name'
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 10. SEED DATA (Insert Products)
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
('14', 'Scented Soy Candle', 32.00, NULL, 'Home', 'https://images.unsplash.com/photo-1602825266988-75001771d276?w=800&auto=format&fit=crop&q=60', 4.9, 600, 5000, 'Hand-poured soy wax candle with essential oils. Long-burning and fills your home with a calming, natural fragrance.', ARRAY['100% Soy Wax', 'Essential Oils', '50+ Hour Burn Time', 'Cotton Wick', 'Reusable Glass Jar']);

-- Insert Reviews (Sample data for Product 1)
INSERT INTO public.reviews (product_id, user_name, rating, date, comment, avatar) VALUES
('1', 'Alex Johnson', 5, '2023-10-15', 'Absolutely love this watch! It looks even better in person. The leather is high quality and it fits perfectly.', 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&auto=format&fit=crop&q=60'),
('1', 'Sarah Williams', 4, '2023-09-28', 'Great watch for the price. The design is very clean. Only took off a star because shipping was a bit slow.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60');
