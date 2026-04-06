import { useEffect, useMemo, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import ProductGrid from '../components/ProductGrid';
import { Product } from '../types/Product';
import { fetchProducts, fetchProductsByCategory } from '../lib/supabaseProducts';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);

  const categories = ['all', 'clothing', 'accessories', 'shoes', 'bags', 'men', 'women', 'ethnic'];

  useEffect(() => {
    let mounted = true;
    let channel: any = null;
    
    const load = async () => {
      try {
        setLoading(true);
        console.log('Products: Loading products for category:', selectedCategory);
        const data =
          selectedCategory === 'all'
            ? await fetchProducts()
            : await fetchProductsByCategory(selectedCategory);
        console.log('Products: Loaded products:', data.length);
        if (mounted) setProducts(data as any);
      } catch (error) {
        console.error('Products: Error loading products:', error);
        if (mounted) setProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    
    // Add timeout to ensure loading state doesn't hang
    const timeoutId = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Products: Product loading timed out');
        setLoading(false);
        setProducts([]);
      }
    }, 10000); // Reduced timeout
    
    load();

    const refreshProducts = () => {
      void load();
    };

    window.addEventListener('products:changed', refreshProducts);

    // Keep URL in sync when selectedCategory changes
    const params = new URLSearchParams(searchParams.toString());
    if (selectedCategory === 'all') params.delete('category');
    else params.set('category', selectedCategory);
    setSearchParams(params, { replace: true });

    channel = supabase
      .channel('products-page')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, refreshProducts)
      .subscribe();

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      window.removeEventListener('products:changed', refreshProducts);
      if (channel) {
        console.log('Cleaning up products realtime subscription');
        supabase.removeChannel(channel);
      }
    };
  }, [selectedCategory]); // Keep selectedCategory dependency

  const filteredProducts = useMemo(() => products, [products]);

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'newest':
      default:
        return 0;
    }
  });

  return (
    <div className="pt-16">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-light text-neutral-900 tracking-tight">
                All Products
              </h1>
              <p className="text-neutral-600 mt-2">
                {loading ? 'Loading...' : `${sortedProducts.length} items available`}
              </p>
            </div>

            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center mt-4 md:mt-0 px-4 py-2 border border-neutral-300 rounded text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-neutral-50 border-b border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
              {/* Categories */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                      selectedCategory === category
                        ? 'bg-neutral-900 text-white'
                        : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-300'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                title="Sort products"
                className="px-4 py-2 border border-neutral-300 rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="bg-white">
        <ProductGrid products={sortedProducts} />
      </div>
    </div>
  );
};

export default Products;