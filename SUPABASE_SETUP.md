# Supabase Integration Setup Guide

Complete setup instructions for the Thrift Store e-commerce application.

## 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and create an account
2. Click "New Project" and fill in the details
3. Wait for your PostgreSQL database to be provisioned
4. Note your **Project URL** and **Anon Key** from Settings > API

## 2. Run the Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Click **New Query**
3. Copy and paste the entire contents of [`setup-user-profiles.sql`](setup-user-profiles.sql)
4. Click **Run**

This creates:
- `products` table with full-text search support
- `user_profiles` table with admin role management
- `orders` and `order_items` tables for checkout
- Row-level security (RLS) policies for data access control
- `product-images` storage bucket for product images
- Database functions: `is_admin_user()`, `handle_new_user()`, `get_total_revenue()`

## 3. Enable Email Authentication

1. Go to **Authentication > Providers** in Supabase
2. Enable the **Email** provider
3. Configure your site URL and redirect URLs:
   - **Site URL**: `http://localhost:5173` (for local development)
   - **Redirect URLs**: Add your production domain later

## 4. Configure Environment Variables

Create a `.env.local` file in your project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Find these in**: Supabase Project Settings > API > Project URL and anon key

## 5. ⚠️ CRITICAL: Set Up Admin Access

This is the most important step! Without this, you'll get "row-level security policy" errors when trying to add products.

### Option A: Via SQL (Recommended)

1. Go back to **SQL Editor** in Supabase
2. Run this query to find your user ID:

```sql
SELECT auth.uid() as your_user_id, id, email, is_admin, role FROM public.user_profiles WHERE id = auth.uid();
```

3. Copy your `user_id` from the results
4. Run this query (replace the UUID with your actual user_id):

```sql
UPDATE public.user_profiles 
SET is_admin = true, role = 'admin' 
WHERE id = 'YOUR-USER-ID-HERE';
```

5. Verify it worked:

```sql
SELECT public.is_admin_user() as am_i_admin;
```

Should return `true`.

### Option B: Via Supabase Dashboard

1. Go to **Table Editor** > **user_profiles**
2. Find the row with your email
3. Click to edit it
4. Set `is_admin = true` and `role = 'admin'`
5. Click Save

## 6. Troubleshooting Admin Access

### Problem: "new row violates row-level security policy" when adding products

**Solution**: You haven't been marked as admin yet. Follow Section 5 above.

### Problem: Can't see user_profiles table

**Solution**: RLS is blocking the view. Run this in SQL Editor:

```sql
SELECT id, email, is_admin, role FROM public.user_profiles;
```

### Problem: Admin dashboard is not accessible

**Solution**: 

1. Refresh the browser after setting `is_admin = true`
2. Sign out and sign back in
3. Check that you can see the Admin Dashboard link in your user menu (top right)

### Got "row-level security policy" error after setting admin?

Run this verification query:

```sql
-- Check if you're actually marked as admin
SELECT id, email, is_admin, role FROM public.user_profiles WHERE id = auth.uid();

-- Check if the is_admin_user() function works
SELECT public.is_admin_user() as result;

-- Check the products RLS policy
SELECT * FROM public.products LIMIT 1;
```

## 7. Set Up Storage for Product Images

1. Go to **Storage** in the Supabase dashboard
2. Verify the `product-images` bucket exists
3. Click the bucket name
4. Go to **Policies** tab
5. Verify these policies exist:
   - "Public product images are viewable by everyone" (SELECT for all)
   - "Admins can upload product images" (INSERT for admins)
   - "Admins can update product images" (UPDATE for admins)
   - "Admins can delete product images" (DELETE for admins)

## 8. Start the Development Server

```bash
npm install
npm run dev
```

Then visit `http://localhost:5173`

## 9. Test Admin Features

1. **Sign up** with an email account at `/register`
2. **Log in** at `/login`
3. Set yourself as admin (Section 5)
4. Refresh and click your user avatar (top right)
5. You should see **"Admin Dashboard"** option
6. Go to Admin Dashboard > Products and try adding a new product
7. Fill in the form and upload an image
8. Click "Add Product"
9. You should see it appear instantly in the shop!

## 10. Deploy to Production

### Set GitHub Secrets (if using GitHub Actions)

1. Go to your GitHub repo > Settings > Secrets and variables > Actions
2. Add these secrets:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your anon key

### Update Supabase Settings

1. Go to Supabase > Authentication > Providers > Email
2. Update **Redirect URLs** to include your production domain:
   - `https://yourdomain.com/auth/callback`

## Helpful Database Queries

```sql
-- See all current admins
SELECT id, email, is_admin, role FROM public.user_profiles WHERE is_admin = true;

-- Count total products
SELECT COUNT(*) FROM public.products;

-- See all orders
SELECT id, user_id, total, status, created_at FROM public.orders;

-- Get revenue from confirmed orders
SELECT public.get_total_revenue();

-- Debug: See which policies are enabled
SELECT * FROM information_schema.role_table_grants WHERE table_name = 'products';
```

## Available APIs

### Authentication
- `signUp(email, password)` - Create new account
- `signIn(email, password)` - Sign in
- `signOut()` - Sign out
- `useAuth()` - React hook for current user

### Cart
- `useCart()` - React hook for cart state
- Cart is automatically persisted to localStorage per user

### Products
- `fetchProducts()` - Get all products
- `fetchProductById(id)` - Get single product
- `fetchProductsByCategory(category)` - Filter by category  
- `searchProducts(query)` - Full-text search

### Admin
- `/admin` - Dashboard
- `/admin/products` - Product management
- `/admin/products/new` - Add product
- `/admin/products/edit/:id` - Edit product
- `/admin/orders` - Order management
- `/admin/users` - User management

## Common Issues

| Issue | Solution |
|-------|----------|
| Products page is blank | Run the schema SQL, wait 5 seconds, refresh |
| Cart doesn't persist | Check browser console for errors, clear localStorage |
| Can't log in | Check email is correct, verify authentication is enabled |
| Admin dashboard 404 | Refresh after being set as admin, check user menu |
| Image upload fails | Verify Storage policies, check file is under 5MB |

For more help, check the [setup-user-profiles.sql](setup-user-profiles.sql) file for the full schema definition.

## Next Steps

- Set up email templates in Supabase
- Configure storage for product images
- Set up Stripe integration for payments
- Add more RLS policies as needed
