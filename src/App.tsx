import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Suspense } from 'react';
import Home from './pages/Home';
import Header from './components/Header';
import Footer from './components/Footer';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import About from './pages/About';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import ShippingInfo from './pages/ShippingInfo';
import Returns from './pages/Returns';
import SizeGuide from './pages/SizeGuide';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import CookiePolicy from './pages/CookiePolicy';
import NotFound from './pages/NotFound';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/admin/Dashboard';
import TestConnection from './pages/TestConnection';
import ProductManagement from './pages/admin/ProductManagement';
import ProductForm from './pages/admin/ProductForm';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Users from './pages/admin/Users';
import Orders from './pages/admin/Orders';
import ErrorBoundary from './components/ErrorBoundary';

// Loading Skeleton Component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px] bg-gradient-to-br from-slate-50 to-slate-100">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600" />
      <p className="mt-4 text-slate-600 font-medium">Loading...</p>
    </div>
  </div>
);

// Main App Component
const AppContent = () => {
  const { user } = useAuth();

  return (
    <CartProvider>
      <Router>
        <Toaster position="top-right" />
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-50 flex flex-col">
          <Header />
          <main className="flex-1">
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/shipping-info" element={<ShippingInfo />} />
                  <Route path="/returns" element={<Returns />} />
                  <Route path="/size-guide" element={<SizeGuide />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/cookie-policy" element={<CookiePolicy />} />
                  <Route path="/test" element={<TestConnection />} />
                  
                  {/* Auth Routes */}
                  <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
                  <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
                  <Route path="/forgot-password" element={user ? <Navigate to="/" /> : <ForgotPassword />} />
                  <Route path="/reset-password" element={user ? <Navigate to="/" /> : <ResetPassword />} />
                  
                  {/* Admin Routes */}
                  <Route
                    path="/admin/*"
                    element={
                      <ProtectedRoute adminOnly>
                        <Suspense fallback={<PageLoader />}>
                          <Routes>
                            <Route index element={<Dashboard />} />
                            <Route path="products" element={<ProductManagement />} />
                            <Route path="products/new" element={<ProductForm />} />
                            <Route path="products/edit/:id" element={<ProductForm />} />
                            <Route path="users" element={<Users />} />
                            <Route path="orders" element={<Orders />} />
                            <Route path="*" element={<Navigate to="/admin" replace />} />
                          </Routes>
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </main>
          <Footer />
        </div>
      </Router>
    </CartProvider>
  );
};

// App Wrapper with Providers
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;