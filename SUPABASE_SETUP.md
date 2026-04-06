# Supabase Integration Setup

This guide will help you set up Supabase for your e-commerce application.

## 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign up/sign in
2. Create a new project
3. Wait for your database to be ready

## 2. Set Up Database Tables

Run the following SQL in the Supabase SQL Editor to create the necessary tables:

```sql
-- Create products table
create table products (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  price numeric not null,
  image text not null,
  category text not null,
  description text,
  is_vintage boolean default false
);

-- Create user_profiles table
create table user_profiles (
  id uuid references auth.users on delete cascade primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  full_name text,
  phone text,
  avatar_url text,
  is_admin boolean default false
);

-- Create orders table
create table orders (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null,
  total numeric not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled'))
);

-- Create order_items table
create table order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references orders not null,
  product_id uuid references products not null,
  quantity integer not null,
  price numeric not null
);

-- Enable Row Level Security
alter table products enable row level security;
alter table user_profiles enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Set up RLS policies for products
create policy "Public products are viewable by everyone." 
on products for select using (true);

-- Set up RLS policies for user_profiles
create policy "Users can view their own profile." 
on user_profiles for select using (auth.uid() = id);

create policy "Users can insert their own profile." 
on user_profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile." 
on user_profiles for update using (auth.uid() = id);

-- Set up RLS policies for orders
create policy "Users can view their own orders." 
on orders for select using (auth.uid() = user_id);

create policy "Users can insert their own orders." 
on orders for insert with check (auth.uid() = user_id);

-- Set up RLS policies for order_items
create policy "Users can view their own order items." 
on order_items for select using (
  exists (
    select 1 from orders 
    where orders.id = order_items.order_id 
    and orders.user_id = auth.uid()
  )
);

create policy "Users can insert their own order items." 
on order_items for insert with check (
  exists (
    select 1 from orders 
    where orders.id = order_items.order_id 
    and orders.user_id = auth.uid()
  )
);

-- Create function to automatically create user profile
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.user_profiles (id, full_name, created_at, updated_at)
  values (new.id, new.raw_user_meta_data->>'full_name', now(), now());
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger to automatically create user profile
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## 3. Set Up Authentication

1. Go to Authentication > Providers in the Supabase dashboard
2. Enable "Email" provider
3. Configure the site URL and redirect URLs

## 4. Set Up Environment Variables

1. Create a `.env.local` file in your project root, or copy the values from `.env.example`
2. Add your Supabase URL and anon key:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

You can find these values in your Supabase project settings > API. The workspace is currently configured for the project in `.env.local`.

## 5. Import Initial Data (Optional)

If you want to import the sample products, you can use the Supabase dashboard:

1. Go to Table Editor > products
2. Click "Import data from CSV"
3. Use the sample data from `src/data/products.ts`

## 6. Start the Development Server

```bash
npm install
npm run dev
```

## Available Hooks and Utilities

- `useSupabase()`: Hook to access Supabase auth and user context
- `supabase`: Direct Supabase client for database operations
- `fetchProducts()`: Fetch all products
- `fetchProductById(id)`: Fetch a single product by ID
- `fetchProductsByCategory(category)`: Fetch products by category
- `searchProducts(query)`: Search products by name or description

## Authentication

The app includes built-in authentication with the following methods:

- `signIn(email, password)`: Sign in with email and password
- `signUp(email, password)`: Create a new account
- `signOut()`: Sign out the current user

## Next Steps

- Set up email templates in Supabase
- Configure storage for product images
- Set up Stripe integration for payments
- Add more RLS policies as needed
