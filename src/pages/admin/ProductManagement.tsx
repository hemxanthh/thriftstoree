import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Product } from '../../types/Product';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';

const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
        console.error('Error fetching products:', error);
      } else {
        setProducts(data as Product[]);
      }
      setLoading(false);
    };

    fetchProducts();

    const refreshProducts = () => {
      void fetchProducts();
    };

    window.addEventListener('products:changed', refreshProducts);

    const channel = supabase
      .channel('admin-products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, refreshProducts)
      .subscribe();

    return () => {
      window.removeEventListener('products:changed', refreshProducts);
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDelete = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) {
        alert('Error deleting product: ' + error.message);
      } else {
        setProducts(products.filter(p => p.id !== productId));
        window.dispatchEvent(new Event('products:changed'));
        alert('Product deleted successfully.');
      }
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-slate-100 p-6">
        <div className="max-w-4xl mx-auto bg-red-50/50 backdrop-blur border border-red-200/30 rounded-2xl p-6 text-red-700">
          <p className="font-medium">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-900 to-amber-700 bg-clip-text text-transparent mb-2">
            Product Management
          </h1>
          <p className="text-slate-600">Manage and organize your product catalog</p>
        </div>

        {/* Search and Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-3 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/80 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-slate-900 placeholder-slate-500 backdrop-blur transition"
            />
          </div>
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-medium rounded-xl hover:shadow-lg hover:scale-105 transition transform backdrop-blur"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </Link>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 mb-6">No products found</p>
            <Link
              to="/admin/products/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-medium rounded-xl hover:shadow-lg transition"
            >
              <Plus className="w-5 h-5" />
              Create Your First Product
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop: Table */}
            <div className="hidden md:block bg-white/50 backdrop-blur border border-white/20 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20 bg-white/30">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Product</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Category</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Price</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product, index) => (
                      <tr key={product.id} className={`border-b border-white/10 ${index % 2 === 0 ? 'bg-white/20' : 'bg-white/10'} hover:bg-white/40 transition`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 shadow-md">
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{product.name}</p>
                              <p className="text-xs text-slate-500 line-clamp-1">{product.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-block px-3 py-1 bg-amber-100/50 text-amber-700 rounded-full text-sm font-medium capitalize">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-900">${product.price}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Link
                              to={`/admin/products/edit/${product.id}`}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 text-amber-700 rounded-lg hover:bg-amber-500/40 transition font-medium"
                            >
                              <Edit2 className="w-4 h-4" />
                              <span className="hidden sm:inline">Edit</span>
                            </Link>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-700 rounded-lg hover:bg-red-500/40 transition font-medium"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="hidden sm:inline">Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile: Card List */}
            <div className="md:hidden space-y-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white/50 backdrop-blur border border-white/20 rounded-xl p-4 hover:bg-white/70 transition shadow-md"
                >
                  <div className="flex gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 shadow-md">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{product.name}</p>
                      <p className="text-xs text-slate-500 line-clamp-1 mb-2">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="inline-block px-2 py-1 bg-amber-100/50 text-amber-700 rounded text-xs font-medium capitalize">
                            {product.category}
                          </span>
                          <p className="font-semibold text-slate-900">${product.price}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Link
                      to={`/admin/products/edit/${product.id}`}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-amber-500/20 text-amber-700 rounded-lg hover:bg-amber-500/40 transition font-medium text-sm"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500/20 text-red-700 rounded-lg hover:bg-red-500/40 transition font-medium text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductManagement;
