import { supabase } from './supabase';
import { Database } from '../types/database.types';
import { allProducts } from '../data/products';

type Product = Database['public']['Tables']['products']['Row'];

// Track connection state to prevent repeated failed requests
let isSupabaseAvailable: boolean | null = null;
let lastCheckTime = 0;
const CHECK_INTERVAL = 30000; // 30 seconds

const checkSupabaseConnection = async (): Promise<boolean> => {
  const now = Date.now();
  
  // Return cached result if checked recently
  if (isSupabaseAvailable !== null && (now - lastCheckTime) < CHECK_INTERVAL) {
    return isSupabaseAvailable;
  }
  
  try {
    // Simple connection test
    const { error } = await Promise.race([
      supabase.from('products').select('id').limit(1),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 3000))
    ]) as any;
    
    isSupabaseAvailable = !error;
    lastCheckTime = now;
    console.log('Supabase connection status:', isSupabaseAvailable ? 'Available' : 'Unavailable');
    return isSupabaseAvailable;
  } catch (error) {
    console.log('Supabase connection test failed:', error);
    isSupabaseAvailable = false;
    lastCheckTime = now;
    return false;
  }
};

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    console.log('Fetching products from Supabase...');
    
    // Check if Supabase is available first
    const isAvailable = await checkSupabaseConnection();
    if (!isAvailable) {
      console.log('Supabase unavailable, using static products immediately');
      return allProducts.map(product => ({
        ...product,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })) as any;
    }
    
    // Add timeout protection for product fetching
    const productPromise = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Product fetch timeout')), 5000)
    );
    
    const { data, error } = await Promise.race([productPromise, timeoutPromise]) as any;

    if (error) {
      console.error('Error fetching products:', error);
      console.log('Falling back to static products...');
      // Mark Supabase as unavailable
      isSupabaseAvailable = false;
      return allProducts.map(product => ({
        ...product,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })) as any;
    }

    if (!data || data.length === 0) {
      console.warn('Supabase returned no products, using static fallback products');
      return allProducts.map(product => ({
        ...product,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })) as any;
    }

    console.log('Products fetched successfully:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Exception fetching products:', error);
    console.log('Using fallback static products...');
    // Mark Supabase as unavailable
    isSupabaseAvailable = false;
    return allProducts.map(product => ({
      ...product,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })) as any;
  }
};

export const fetchProductById = async (id: string): Promise<Product | null> => {
  try {
    const isAvailable = await checkSupabaseConnection();

    if (!isAvailable) {
      const fallback = allProducts.find((p) => p.id === id);
      if (!fallback) return null;
      return {
        ...fallback,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any;
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('Error fetching product:', error);
      const fallback = allProducts.find((p) => p.id === id);
      if (!fallback) return null;
      return {
        ...fallback,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any;
    }

    return data;
  } catch (error) {
    console.error('Exception fetching product by id:', error);
    const fallback = allProducts.find((p) => p.id === id);
    if (!fallback) return null;
    return {
      ...fallback,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as any;
  }
};

export const fetchProductsByCategory = async (category: string): Promise<Product[]> => {
  try {
    console.log(`Fetching ${category} products...`);
    
    // Check if Supabase is available first
    const isAvailable = await checkSupabaseConnection();
    if (!isAvailable) {
      console.log('Supabase unavailable, filtering static products');
      const filtered = allProducts.filter(p => p.category === category);
      return filtered.map(product => ({
        ...product,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })) as any;
    }

    const { data, error } = await Promise.race([
      supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Category fetch timeout')), 5000))
    ]) as any;

    if (error) {
      console.error(`Error fetching ${category} products:`, error);
      // Mark Supabase as unavailable and return filtered static products
      isSupabaseAvailable = false;
      const filtered = allProducts.filter(p => p.category === category);
      return filtered.map(product => ({
        ...product,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })) as any;
    }

    if (!data || data.length === 0) {
      console.warn(`Supabase returned no ${category} products, using static fallback products`);
      const filtered = allProducts.filter(p => p.category === category);
      return filtered.map(product => ({
        ...product,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })) as any;
    }

    return data || [];
  } catch (error) {
    console.error(`Exception fetching ${category} products:`, error);
    isSupabaseAvailable = false;
    const filtered = allProducts.filter(p => p.category === category);
    return filtered.map(product => ({
      ...product,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })) as any;
  }
};

export const searchProducts = async (query: string): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .textSearch('name_description', query, {
      type: 'websearch',
      config: 'english',
    });

  if (error) {
    console.error('Error searching products:', error);
    return [];
  }

  return data || [];
};
