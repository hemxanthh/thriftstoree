import { supabase } from './supabase';
import { Database } from '../types/database.types';

type Product = Database['public']['Tables']['products']['Row'];

const DB_TIMEOUT_MS = 10000;

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    console.log('Fetching products from database...');

    const productPromise = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Product fetch timeout')), DB_TIMEOUT_MS)
    );

    const { data, error } = await Promise.race([productPromise, timeoutPromise]) as any;

    if (error) {
      console.error('Error fetching products from database:', error);
      return [];
    }

    console.log('Products fetched:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Exception fetching products:', error);
    return [];
  }
};

export const fetchProductById = async (id: string): Promise<Product | null> => {
  try {
    const productPromise = supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Product detail fetch timeout')), DB_TIMEOUT_MS)
    );

    const { data, error } = await Promise.race([productPromise, timeoutPromise]) as any;

    if (error || !data) {
      console.error('Error fetching product:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Exception fetching product by id:', error);
    return null;
  }
};

export const fetchProductsByCategory = async (category: string): Promise<Product[]> => {
  try {
    console.log(`Fetching ${category} products from database...`);

    const { data, error } = await Promise.race([
      supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Category fetch timeout')), DB_TIMEOUT_MS))
    ]) as any;

    if (error) {
      console.error(`Error fetching ${category} products from database:`, error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error(`Exception fetching ${category} products:`, error);
    return [];
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
