import { useEffect, useState } from 'react';
import Hero from '../components/Hero';
import ProductGrid from '../components/ProductGrid';
import { fetchProducts } from '../lib/supabaseProducts';
import { supabase } from '../lib/supabase';
import { Product } from '../types/Product';
import { Link } from 'react-router-dom';
import { Truck, RotateCcw, Shield } from 'lucide-react';

const Home = () => {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let channel: any = null;
    
    const load = async () => {
      try {
        setLoading(true);
        console.log('Home: Loading products...');
        const all = await fetchProducts();
        console.log('Home: Products loaded:', all.length);
        // Pick latest 8 as featured
        if (mounted) setFeatured(all.slice(0, 8) as any);
      } catch (error) {
        console.error('Home: Error loading products:', error);
        if (mounted) setFeatured([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    
    // Add timeout to ensure loading state doesn't hang
    const timeoutId = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Home: Product loading timed out');
        setLoading(false);
        setFeatured([]);
      }
    }, 10000); // Reduced timeout
    
    load();

    const refreshProducts = () => {
      void load();
    };

    window.addEventListener('products:changed', refreshProducts);

    channel = supabase
      .channel('home-products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, refreshProducts)
      .subscribe();

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      window.removeEventListener('products:changed', refreshProducts);
      if (channel) {
        console.log('Cleaning up realtime subscription');
        supabase.removeChannel(channel);
      }
    };
  }, []); // Remove featured dependency to prevent loops

  return (
    <div>
      <Hero />

      {/* Marquee Promo Strip */}
      <section className="marquee bg-neutral-900 text-white text-xs sm:text-sm py-3 border-y border-black/20">
        <div className="marquee-track">
          <span className="mx-6">NEW DROPS EVERY WEEK</span>
          <span className="mx-6">VINTAGE • MEN • WOMEN • ETHNIC • ACCESSORIES</span>
          <span className="mx-6">FREE SHIPPING OVER ₹999</span>
          <span className="mx-6">INDIA-WIDE DELIVERY</span>
        </div>
        <div className="marquee-track" aria-hidden="true">
          <span className="mx-6">NEW DROPS EVERY WEEK</span>
          <span className="mx-6">VINTAGE • MEN • WOMEN • ETHNIC • ACCESSORIES</span>
          <span className="mx-6">FREE SHIPPING OVER ₹999</span>
          <span className="mx-6">INDIA-WIDE DELIVERY</span>
        </div>
      </section>

      {/* Featured Products */}
      <ProductGrid products={featured} title={loading ? 'Loading Featured...' : 'Featured Items'} />

      {/* View All CTA */}
      <div className="-mt-8 mb-10 text-center">
        <Link to="/products" className="inline-block px-6 py-3 bg-neutral-900 text-white text-sm rounded shadow-[3px_3px_0_0_#000] border border-black/20 hover:translate-y-[1px] hover:translate-x-[1px] transition-transform">
          VIEW ALL PRODUCTS
        </Link>
      </div>

      {/* Values Section */}
      <section className="relative py-20 sm:py-24 bg-neutral-950 text-white border-t border-neutral-800 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-14">
            <p className="text-[11px] tracking-[0.24em] uppercase text-neutral-400 mb-4">Why Choose Us</p>
            <h2 className="text-4xl sm:text-5xl font-light tracking-tight mb-5">
              Our Values
            </h2>
            <p className="text-neutral-400 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
              More than just fashion - we're committed to sustainable style
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-7 sm:p-8 text-center">
              <div className="w-12 h-12 rounded-full border border-neutral-700 flex items-center justify-center mx-auto mb-6">
                <span className="text-base text-neutral-100">♻</span>
              </div>
              <h3 className="text-2xl font-medium mb-3 text-neutral-100">Sustainable</h3>
              <p className="text-neutral-400 text-[15px] leading-relaxed">
                Giving pre-loved fashion a second life reduces waste and environmental impact
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-7 sm:p-8 text-center">
              <div className="w-12 h-12 rounded-full border border-neutral-700 flex items-center justify-center mx-auto mb-6">
                <span className="text-base text-neutral-100">✦</span>
              </div>
              <h3 className="text-2xl font-medium mb-3 text-neutral-100">Curated</h3>
              <p className="text-neutral-400 text-[15px] leading-relaxed">
                Every piece is hand-selected for quality, style, and timeless appeal
              </p>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-7 sm:p-8 text-center">
              <div className="w-12 h-12 rounded-full border border-neutral-700 flex items-center justify-center mx-auto mb-6">
                <span className="text-base text-neutral-100">◈</span>
              </div>
              <h3 className="text-2xl font-medium mb-3 text-neutral-100">Unique</h3>
              <p className="text-neutral-400 text-[15px] leading-relaxed">
                Find one-of-a-kind pieces that express your individual style
              </p>
            </div>
          </div>

          {/* Trust Bar */}
          <div className="mt-12 sm:mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            <div className="flex items-center justify-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900/70 px-4 py-4">
              <Truck className="h-4 w-4 text-neutral-300" />
              <span className="text-[15px] text-neutral-200">Free shipping over $75</span>
            </div>
            <div className="flex items-center justify-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900/70 px-4 py-4">
              <RotateCcw className="h-4 w-4 text-neutral-300" />
              <span className="text-[15px] text-neutral-200">30-day easy returns</span>
            </div>
            <div className="flex items-center justify-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900/70 px-4 py-4">
              <Shield className="h-4 w-4 text-neutral-300" />
              <span className="text-[15px] text-neutral-200">Secure checkout</span>
            </div>
          </div>

        </div>

        {/* Smooth handoff into footer */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-b from-transparent via-neutral-950/85 to-neutral-950" />
      </section>
    </div>
  );
};

export default Home;