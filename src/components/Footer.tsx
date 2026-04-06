//
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Mail, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white/80 text-slate-800 border-t border-rose-200/70 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-sm">
                <span className="text-white font-bold">T</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">Thrift Store</h3>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              Curated vintage and thrift fashion with timeless style. Every piece tells a unique story of quality and sustainability.
            </p>
            <div className="flex space-x-3">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="p-2 bg-white/80 hover:bg-rose-50 rounded-lg transition-all text-slate-700 hover:text-rose-700 border border-rose-200/70">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="p-2 bg-white/80 hover:bg-rose-50 rounded-lg transition-all text-slate-700 hover:text-rose-700 border border-rose-200/70">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="p-2 bg-white/80 hover:bg-rose-50 rounded-lg transition-all text-slate-700 hover:text-rose-700 border border-rose-200/70">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="mailto:hello@thriftstore.com" aria-label="Email" className="p-2 bg-white/80 hover:bg-rose-50 rounded-lg transition-all text-slate-700 hover:text-rose-700 border border-rose-200/70">
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-slate-900">Shop</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: 'All Items', path: '/products' },
                { label: 'Clothing', path: '/products?category=clothing' },
                { label: 'Accessories', path: '/products?category=accessories' },
                { label: 'Shoes', path: '/products?category=shoes' },
                { label: 'Bags', path: '/products?category=bags' },
              ].map((item) => (
                <li key={item.path}>
                  <Link 
                    to={item.path} 
                    className="text-slate-600 hover:text-rose-700 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-slate-900">Help</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/faq" className="text-slate-600 hover:text-rose-700 transition-colors">FAQ</Link></li>
              <li><Link to="/contact" className="text-slate-600 hover:text-rose-700 transition-colors">Contact Us</Link></li>
              <li><Link to="/shipping-info" className="text-slate-600 hover:text-rose-700 transition-colors">Shipping Info</Link></li>
              <li><Link to="/returns" className="text-slate-600 hover:text-rose-700 transition-colors">Returns</Link></li>
              <li><Link to="/size-guide" className="text-slate-600 hover:text-rose-700 transition-colors">Size Guide</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider text-slate-900">Newsletter</h4>
            <p className="text-slate-600 text-sm mb-4">
              Subscribe for curated collections and exclusive member perks.
            </p>
            <form className="flex flex-col gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="your@email.com"
                className="px-4 py-2.5 bg-white/80 border border-rose-200/70 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-200/50 transition"
              />
              <button 
                type="submit"
                className="px-4 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-rose-200/70">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-600 text-sm flex items-center gap-1">
              Made with <Heart className="h-4 w-4 text-rose-400 fill-rose-400" /> by Thrift Store Team
            </p>
            <div className="flex space-x-6 mt-6 md:mt-0">
              <Link to="/privacy" className="text-slate-600 hover:text-rose-700 text-sm transition-colors">
                Privacy
              </Link>
              <Link to="/terms" className="text-slate-600 hover:text-rose-700 text-sm transition-colors">
                Terms
              </Link>
              <Link to="/cookie-policy" className="text-slate-600 hover:text-rose-700 text-sm transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
          <p className="text-slate-500 text-xs text-center mt-6">
            © 2024 Thrift Store. All rights reserved. Curating timeless fashion sustainably.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;