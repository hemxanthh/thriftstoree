import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="pt-16 min-h-screen bg-neutral-950 text-white">
      <section className="relative overflow-hidden min-h-[calc(100vh-4rem)] flex items-center py-16 sm:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_15%,rgba(255,255,255,0.16),transparent_34%),radial-gradient(circle_at_85%_0%,rgba(148,163,184,0.2),transparent_32%),linear-gradient(145deg,#050507_0%,#0f172a_65%,#0a1120_100%)]" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="rounded-3xl border border-white/15 bg-white/10 backdrop-blur-2xl shadow-[0_20px_80px_rgba(0,0,0,0.45)] p-8 sm:p-12 lg:p-14 text-center">
            <p className="text-[11px] tracking-[0.26em] uppercase text-neutral-300 mb-5">Error 404</p>
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-light tracking-tight leading-none mb-6">Page Not Found</h1>
            <p className="text-lg sm:text-xl text-neutral-200/90 leading-relaxed max-w-2xl mx-auto mb-10">
              The page you were looking for does not exist or may have moved.
              Let us guide you back to the collection.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/"
                className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 rounded-xl bg-white/90 text-neutral-950 font-medium tracking-wide hover:bg-white transition"
              >
                Back to Home
              </Link>
              <Link
                to="/products"
                className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 rounded-xl border border-white/30 bg-white/10 text-white font-medium tracking-wide hover:bg-white/20 transition"
              >
                Explore Products
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NotFound;
