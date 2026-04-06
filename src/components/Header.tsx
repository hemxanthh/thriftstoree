import React, { useState, Fragment } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, Search, User, LogOut, ChevronDown, LayoutDashboard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Menu as HeadlessMenu, Transition } from '@headlessui/react';
import { toast } from 'react-hot-toast';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { items } = useCart();
  const { user, isAdmin, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign out');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center group-hover:shadow-lg transition-all">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                Thrift Store
              </h1>
              <p className="text-xs text-slate-500">Vintage. Timeless.</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {[
              { label: 'Home', path: '/' },
              { label: 'Shop', path: '/products' },
              { label: 'About', path: '/about' },
              { label: 'Contact', path: '/contact' },
            ].map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(item.path)
                    ? 'bg-amber-100 text-amber-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-2">
            <button 
              className="hidden sm:p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
              title="Search products"
            >
              <Search className="h-5 w-5" />
            </button>

            {user ? (
              <HeadlessMenu as="div" className="relative">
                <HeadlessMenu.Button className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-all">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-sm">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-600" />
                </HeadlessMenu.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <HeadlessMenu.Items className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden">
                    <div className="p-3 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-900">{user.email}</p>
                      {isAdmin && (
                        <p className="text-xs bg-amber-100 text-amber-900 rounded-full px-2 py-1 mt-1 inline-block font-medium">
                          Admin
                        </p>
                      )}
                    </div>
                    
                    <div className="py-1">
                      {isAdmin && (
                        <HeadlessMenu.Item>
                          {({ active }) => (
                            <Link
                              to="/admin"
                              className={`px-4 py-2 text-sm flex items-center gap-2 ${
                                active 
                                  ? 'bg-amber-50 text-amber-900' 
                                  : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <LayoutDashboard className="h-4 w-4" />
                              Admin Dashboard
                            </Link>
                          )}
                        </HeadlessMenu.Item>
                      )}
                      
                      <HeadlessMenu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleSignOut}
                            className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${
                              active 
                                ? 'bg-red-50 text-red-700' 
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <LogOut className="h-4 w-4" />
                            Sign out
                          </button>
                        )}
                      </HeadlessMenu.Item>
                    </div>
                  </HeadlessMenu.Items>
                </Transition>
              </HeadlessMenu>
            ) : (
              <Link 
                to="/login" 
                className="px-3 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all text-sm font-medium"
              >
                Sign In
              </Link>
            )}

            <Link 
              to="/cart" 
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
              title="Shopping cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-br from-amber-600 to-amber-700 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              title="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 animate-in fade-in slide-in-from-top-2">
            <nav className="flex flex-col space-y-2">
              {[
                { label: 'Home', path: '/' },
                { label: 'Shop', path: '/products' },
                { label: 'About', path: '/about' },
                { label: 'Contact', path: '/contact' },
              ].map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(item.path)
                      ? 'bg-amber-100 text-amber-900'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              {isAdmin && (
                <>
                  <div className="h-px bg-slate-200 my-2" />
                  <Link
                    to="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-amber-700 hover:bg-amber-50 bg-amber-50 flex items-center gap-2 transition-all"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Admin Dashboard
                  </Link>
                  <Link
                    to="/admin/products/new"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-amber-700 hover:bg-amber-50 flex items-center gap-2 transition-all"
                  >
                    ➕ Add Product
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;