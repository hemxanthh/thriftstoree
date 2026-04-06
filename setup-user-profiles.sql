-- Complete Supabase schema for the thrift store admin app.
-- Run this once in the Supabase SQL editor.

create extension if not exists "pgcrypto";

-- Products
create table if not exists public.products (        
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz not null default timezone('utc'::text, now()),
    updated_at timestamptz not null default timezone('utc'::text, now()),
    name text not null,
    price numeric(12,2) not null check (price >= 0),
    image text not null,
    category text not null,
    description text,
    is_vintage boolean not null default false,
    name_description tsvector generated always as (
        to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))
    ) stored
);

create index if not exists products_category_created_at_idx on public.products (category, created_at desc);
create index if not exists products_name_description_idx on public.products using gin (name_description);

-- User profiles
create table if not exists public.user_profiles (
    id uuid primary key references auth.users on delete cascade,
    email text not null unique,
    full_name text,
    phone text,
    avatar_url text,
    role text not null default 'user' check (role in ('user', 'admin')),
    is_admin boolean not null default false,
    created_at timestamptz not null default timezone('utc'::text, now()),
    updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists user_profiles_email_idx on public.user_profiles (email);
create index if not exists user_profiles_is_admin_idx on public.user_profiles (is_admin);

-- Orders
create table if not exists public.orders (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz not null default timezone('utc'::text, now()),
    updated_at timestamptz not null default timezone('utc'::text, now()),
    user_id uuid not null references public.user_profiles(id) on delete cascade,
    total numeric(12,2) not null check (total >= 0),
    status text not null default 'pending' check (status in ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'))
);

create index if not exists orders_user_id_created_at_idx on public.orders (user_id, created_at desc);
create index if not exists orders_status_created_at_idx on public.orders (status, created_at desc);

-- Order items
create table if not exists public.order_items (
    id uuid primary key default gen_random_uuid(),
    order_id uuid not null references public.orders(id) on delete cascade,
    product_id uuid not null references public.products(id) on delete restrict,
    quantity integer not null check (quantity > 0),
    price numeric(12,2) not null check (price >= 0)
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);
create index if not exists order_items_product_id_idx on public.order_items (product_id);

-- Cart items (persisted user cart)
create table if not exists public.cart_items (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz not null default timezone('utc'::text, now()),
    updated_at timestamptz not null default timezone('utc'::text, now()),
    user_id uuid not null references public.user_profiles(id) on delete cascade,
    product_id uuid not null references public.products(id) on delete cascade,
    quantity integer not null default 1 check (quantity > 0),
    selected_size text not null default '',
    user_name text,
    product_name text,
    constraint cart_items_user_product_size_unique unique (user_id, product_id, selected_size)
);

-- Backward-compatible schema updates for existing databases
alter table public.cart_items add column if not exists user_name text;
alter table public.cart_items add column if not exists product_name text;
alter table public.cart_items add column if not exists selected_size text;
update public.cart_items set selected_size = '' where selected_size is null;
alter table public.cart_items alter column selected_size set default '';
alter table public.cart_items alter column selected_size set not null;

create index if not exists cart_items_user_id_idx on public.cart_items (user_id);
create index if not exists cart_items_product_id_idx on public.cart_items (product_id);

-- Cart activity log (keeps history even after cart item deletion)
create table if not exists public.cart_activity_log (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz not null default timezone('utc'::text, now()),
    user_id uuid not null references public.user_profiles(id) on delete cascade,
    user_name text,
    product_id uuid not null references public.products(id) on delete cascade,
    product_name text,
    selected_size text not null default '',
    quantity integer not null default 1,
    action text not null check (action in ('added', 'updated', 'removed'))
);

create index if not exists cart_activity_log_user_id_idx on public.cart_activity_log (user_id);
create index if not exists cart_activity_log_product_id_idx on public.cart_activity_log (product_id);
create index if not exists cart_activity_log_created_at_idx on public.cart_activity_log (created_at desc);

-- Product activity log (tracks admin create/update/delete)
create table if not exists public.product_activity_log (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz not null default timezone('utc'::text, now()),
    actor_user_id uuid references public.user_profiles(id) on delete set null,
    actor_name text,
    actor_email text,
    actor_role text,
    product_id uuid,
    product_name text,
    action text not null check (action in ('created', 'updated', 'deleted'))
);

create index if not exists product_activity_log_created_at_idx on public.product_activity_log (created_at desc);
create index if not exists product_activity_log_actor_user_id_idx on public.product_activity_log (actor_user_id);
create index if not exists product_activity_log_product_id_idx on public.product_activity_log (product_id);

-- Page navigation logs (tracks which user visited which page)
create table if not exists public.page_navigation_logs (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz not null default timezone('utc'::text, now()),
    user_id uuid not null references public.user_profiles(id) on delete cascade,
    user_name text,
    user_email text,
    page_path text not null
);

create index if not exists page_navigation_logs_created_at_idx on public.page_navigation_logs (created_at desc);
create index if not exists page_navigation_logs_user_id_idx on public.page_navigation_logs (user_id);

-- Helper functions
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.user_profiles (
        id,
        email,
        full_name,
        role,
        is_admin,
        created_at,
        updated_at
    )
    values (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'fullName'),
        'user',
        false,
        timezone('utc'::text, now()),
        timezone('utc'::text, now())
    )
    on conflict (id) do update
    set
        email = excluded.email,
        full_name = coalesce(excluded.full_name, public.user_profiles.full_name),
        role = public.user_profiles.role,
        is_admin = public.user_profiles.is_admin,
        updated_at = timezone('utc'::text, now());

    return new;
end;
$$;

create or replace function public.sync_user_profile_from_auth()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    update public.user_profiles
    set
        email = new.email,
        full_name = coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'fullName', public.user_profiles.full_name),
        updated_at = timezone('utc'::text, now())
    where id = new.id;

    return new;
end;
$$;

create or replace function public.is_admin_user(user_uuid uuid default auth.uid())
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
begin
    return coalesce(
        (
            select up.is_admin or up.role = 'admin'
            from public.user_profiles up
            where up.id = coalesce(user_uuid, auth.uid())
        ),
        false
    );
end;
$$;

create or replace function public.get_total_revenue()
returns table(total numeric)
language sql
stable
security definer
set search_path = public
as $$
    select coalesce(sum(total), 0)::numeric
    from public.orders
    where status <> 'cancelled';
$$;

create or replace function public.set_cart_item_names()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    select coalesce(up.full_name, up.email), p.name
      into new.user_name, new.product_name
    from public.user_profiles up
    join public.products p on p.id = new.product_id
    where up.id = new.user_id;

    new.selected_size := coalesce(new.selected_size, '');
    return new;
end;
$$;

create or replace function public.log_cart_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    if tg_op = 'INSERT' then
        insert into public.cart_activity_log (
            user_id, user_name, product_id, product_name, selected_size, quantity, action
        ) values (
            new.user_id, new.user_name, new.product_id, new.product_name, coalesce(new.selected_size, ''), new.quantity, 'added'
        );
        return new;
    elsif tg_op = 'UPDATE' then
        insert into public.cart_activity_log (
            user_id, user_name, product_id, product_name, selected_size, quantity, action
        ) values (
            new.user_id, new.user_name, new.product_id, new.product_name, coalesce(new.selected_size, ''), new.quantity, 'updated'
        );
        return new;
    elsif tg_op = 'DELETE' then
        insert into public.cart_activity_log (
            user_id, user_name, product_id, product_name, selected_size, quantity, action
        ) values (
            old.user_id, old.user_name, old.product_id, old.product_name, coalesce(old.selected_size, ''), old.quantity, 'removed'
        );
        return old;
    end if;

    return null;
end;
$$;

create or replace function public.log_product_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    actor_profile record;
begin
    select
        up.id,
        coalesce(up.full_name, up.email) as actor_name,
        up.email,
        case when up.is_admin then 'admin' else coalesce(up.role, 'user') end as actor_role
    into actor_profile
    from public.user_profiles up
    where up.id = auth.uid();

    if tg_op = 'INSERT' then
        insert into public.product_activity_log (
            actor_user_id, actor_name, actor_email, actor_role, product_id, product_name, action
        ) values (
            actor_profile.id, actor_profile.actor_name, actor_profile.email, actor_profile.actor_role,
            new.id, new.name, 'created'
        );
        return new;
    elsif tg_op = 'UPDATE' then
        insert into public.product_activity_log (
            actor_user_id, actor_name, actor_email, actor_role, product_id, product_name, action
        ) values (
            actor_profile.id, actor_profile.actor_name, actor_profile.email, actor_profile.actor_role,
            new.id, new.name, 'updated'
        );
        return new;
    elsif tg_op = 'DELETE' then
        insert into public.product_activity_log (
            actor_user_id, actor_name, actor_email, actor_role, product_id, product_name, action
        ) values (
            actor_profile.id, actor_profile.actor_name, actor_profile.email, actor_profile.actor_role,
            old.id, old.name, 'deleted'
        );
        return old;
    end if;

    return null;
end;
$$;

-- Triggers
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
    after update on auth.users
    for each row execute function public.sync_user_profile_from_auth();

drop trigger if exists products_handle_updated_at on public.products;
create trigger products_handle_updated_at
    before update on public.products
    for each row execute function public.handle_updated_at();

drop trigger if exists products_activity_log on public.products;
create trigger products_activity_log
    after insert or update or delete on public.products
    for each row execute function public.log_product_activity();

drop trigger if exists user_profiles_handle_updated_at on public.user_profiles;
create trigger user_profiles_handle_updated_at
    before update on public.user_profiles
    for each row execute function public.handle_updated_at();

drop trigger if exists orders_handle_updated_at on public.orders;
create trigger orders_handle_updated_at
    before update on public.orders
    for each row execute function public.handle_updated_at();

drop trigger if exists cart_items_handle_updated_at on public.cart_items;
create trigger cart_items_handle_updated_at
    before update on public.cart_items
    for each row execute function public.handle_updated_at();

drop trigger if exists cart_items_set_names on public.cart_items;
create trigger cart_items_set_names
    before insert or update on public.cart_items
    for each row execute function public.set_cart_item_names();

drop trigger if exists cart_items_activity_log on public.cart_items;
create trigger cart_items_activity_log
    after insert or update or delete on public.cart_items
    for each row execute function public.log_cart_activity();

-- Seed profiles for existing auth users
insert into public.user_profiles (id, email, full_name, role, is_admin, created_at, updated_at)
select
    au.id,
    au.email,
    coalesce(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'fullName', au.email),
    'user',
    false,
    au.created_at,
    timezone('utc'::text, now())
from auth.users au
on conflict (id) do update
set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.user_profiles.full_name),
    role = public.user_profiles.role,
    is_admin = public.user_profiles.is_admin,
    updated_at = timezone('utc'::text, now());

-- Storage for product images
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "Public product images are viewable by everyone" on storage.objects;
create policy "Public product images are viewable by everyone"
on storage.objects
for select
using (bucket_id = 'product-images');

drop policy if exists "Admins can upload product images" on storage.objects;
create policy "Admins can upload product images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'product-images' and public.is_admin_user());

drop policy if exists "Admins can update product images" on storage.objects;
create policy "Admins can update product images"
on storage.objects
for update
to authenticated
using (bucket_id = 'product-images' and public.is_admin_user())
with check (bucket_id = 'product-images' and public.is_admin_user());

drop policy if exists "Admins can delete product images" on storage.objects;
create policy "Admins can delete product images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'product-images' and public.is_admin_user());

-- Row level security
alter table public.products enable row level security;
alter table public.user_profiles enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.cart_items enable row level security;
alter table public.cart_activity_log enable row level security;
alter table public.product_activity_log enable row level security;
alter table public.page_navigation_logs enable row level security;

-- Products: public read, admin write
drop policy if exists "Public products are viewable by everyone." on public.products;
create policy "Public products are viewable by everyone."
on public.products
for select
using (true);

drop policy if exists "Admins can manage products." on public.products;
create policy "Admins can manage products."
on public.products
for all
using (public.is_admin_user())
with check (public.is_admin_user());

-- Profiles: owner or admin
drop policy if exists "Users can view their own profile." on public.user_profiles;
create policy "Users can view their own profile."
on public.user_profiles
for select
using (auth.uid() = id or public.is_admin_user());

drop policy if exists "Users can insert their own profile." on public.user_profiles;
create policy "Users can insert their own profile."
on public.user_profiles
for insert
with check (auth.uid() = id or public.is_admin_user());

drop policy if exists "Users can update their own profile." on public.user_profiles;
create policy "Users can update their own profile."
on public.user_profiles
for update
using (auth.uid() = id or public.is_admin_user())
with check (auth.uid() = id or public.is_admin_user());

-- Orders: owner or admin
drop policy if exists "Users can view their own orders." on public.orders;
create policy "Users can view their own orders."
on public.orders
for select
using (auth.uid() = user_id or public.is_admin_user());

drop policy if exists "Users can insert their own orders." on public.orders;
create policy "Users can insert their own orders."
on public.orders
for insert
with check (auth.uid() = user_id or public.is_admin_user());

drop policy if exists "Admins can update orders." on public.orders;
create policy "Admins can update orders."
on public.orders
for update
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "Admins can delete orders." on public.orders;
create policy "Admins can delete orders."
on public.orders
for delete
using (public.is_admin_user());

-- Order items: order owner or admin
drop policy if exists "Users can view their own order items." on public.order_items;
create policy "Users can view their own order items."
on public.order_items
for select
using (
    exists (
        select 1
        from public.orders o
        where o.id = order_items.order_id
          and (o.user_id = auth.uid() or public.is_admin_user())
    )
);

drop policy if exists "Users can insert their own order items." on public.order_items;
create policy "Users can insert their own order items."
on public.order_items
for insert
with check (
    exists (
        select 1
        from public.orders o
        where o.id = order_items.order_id
          and (o.user_id = auth.uid() or public.is_admin_user())
    )
);

drop policy if exists "Admins can update order items." on public.order_items;
create policy "Admins can update order items."
on public.order_items
for update
using (public.is_admin_user())
with check (public.is_admin_user());

drop policy if exists "Admins can delete order items." on public.order_items;
create policy "Admins can delete order items."
on public.order_items
for delete
using (public.is_admin_user());

-- Cart items: owner or admin
drop policy if exists "Users can view their own cart items." on public.cart_items;
create policy "Users can view their own cart items."
on public.cart_items
for select
using (auth.uid() = user_id or public.is_admin_user());

drop policy if exists "Users can insert their own cart items." on public.cart_items;
create policy "Users can insert their own cart items."
on public.cart_items
for insert
with check (auth.uid() = user_id or public.is_admin_user());

drop policy if exists "Users can update their own cart items." on public.cart_items;
create policy "Users can update their own cart items."
on public.cart_items
for update
using (auth.uid() = user_id or public.is_admin_user())
with check (auth.uid() = user_id or public.is_admin_user());

drop policy if exists "Users can delete their own cart items." on public.cart_items;
create policy "Users can delete their own cart items."
on public.cart_items
for delete
using (auth.uid() = user_id or public.is_admin_user());

-- Cart activity logs: owner or admin can view
drop policy if exists "Users can view their own cart activity." on public.cart_activity_log;
create policy "Users can view their own cart activity."
on public.cart_activity_log
for select
using (auth.uid() = user_id or public.is_admin_user());

-- Product activity logs: admins can view
drop policy if exists "Admins can view product activity." on public.product_activity_log;
create policy "Admins can view product activity."
on public.product_activity_log
for select
using (public.is_admin_user());

-- Page navigation logs: users insert/view their own, admins view all
drop policy if exists "Users can insert their own page navigation logs." on public.page_navigation_logs;
create policy "Users can insert their own page navigation logs."
on public.page_navigation_logs
for insert
with check (auth.uid() = user_id or public.is_admin_user());

drop policy if exists "Users can view their own page navigation logs." on public.page_navigation_logs;
create policy "Users can view their own page navigation logs."
on public.page_navigation_logs
for select
using (auth.uid() = user_id or public.is_admin_user());

-- ============================================================================
-- ADMIN VERIFICATION & SETUP HELPERS
-- ============================================================================
-- Run these queries to verify your admin setup and troubleshoot RLS issues:

-- 1. Check your current user and admin status:
-- SELECT auth.uid() as user_id, id, email, is_admin, role FROM public.user_profiles WHERE id = auth.uid();

-- 2. Check all users and their admin status:
-- SELECT id, email, is_admin, role FROM public.user_profiles ORDER BY created_at DESC;

-- 3. Set yourself as admin (replace the UUID with your actual user ID from query #1):
-- UPDATE public.user_profiles SET is_admin = true, role = 'admin' WHERE id = '00000000-0000-0000-0000-000000000000';

-- 4. Verify admin functions work:
-- SELECT public.is_admin_user() as am_i_admin;

-- 5. Check if products table RLS is working correctly:
-- SELECT COUNT(*) as product_count FROM public.products;

-- If you get "new row violates row-level security policy" when adding products:
-- 1. Run query #1 above to find your user_id
-- 2. Run query #3 with your actual user_id to set yourself as admin
-- 3. Refresh the admin page and try adding a product again

-- 6. View which user added which product to cart:
-- SELECT
--   ci.id,
--   ci.user_name,
--   ci.product_name,
--   ci.quantity,
--   ci.selected_size,
--   ci.created_at
-- FROM public.cart_items ci
-- ORDER BY ci.created_at DESC;

-- 7. View full cart history (includes removed items):
-- SELECT
--   created_at,
--   user_name,
--   product_name,
--   selected_size,
--   quantity,
--   action
-- FROM public.cart_activity_log
-- ORDER BY created_at DESC;

-- 8. View admin product activity history:
-- SELECT
--   created_at,
--   actor_name,
--   actor_email,
--   actor_role,
--   product_name,
--   action
-- FROM public.product_activity_log
-- ORDER BY created_at DESC;

-- 9. View page navigation logs:
-- SELECT
--   created_at,
--   user_name,
--   user_email,
--   page_path
-- FROM public.page_navigation_logs
-- ORDER BY created_at DESC;

