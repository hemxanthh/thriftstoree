import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { formatINR } from '../../lib/currency';
import { Users, Package, ShoppingCart, TrendingUp, LogOut, ChevronRight } from 'lucide-react';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out from dashboard:', error);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        const [
          { count: usersCount },
          { count: productsCount },
          { count: ordersCount },
          { data: revenueData },
          { data: ordersData },
        ] = await Promise.all([
          supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
          supabase.from('products').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('*', { count: 'exact', head: true }),
          supabase.rpc('get_total_revenue'),
          supabase
            .from('orders')
            .select('*, order_items(*, products(*))')
            .order('created_at', { ascending: false })
            .limit(5),
        ]);

        setStats({
          totalUsers: usersCount || 0,
          totalProducts: productsCount || 0,
          totalOrders: ordersCount || 0,
          totalRevenue: revenueData?.[0]?.total || 0,
        });

        setRecentOrders(ordersData || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();

    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchDashboardData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, fetchDashboardData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, fetchDashboardData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_profiles' }, fetchDashboardData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border border-white/30 border-t-white"></div>
          <p className="mt-4 text-white/60 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/5 border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-white/50 text-sm mt-1">Admin Portal</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur">
              <p className="text-sm text-white/70">{user?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 hover:border-white/30 transition-all backdrop-blur flex items-center gap-2 group"
            >
              <LogOut className="h-4 w-4 group-hover:rotate-180 transition-transform" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8 relative z-10">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Total Users */}
          <div className="group">
            <div className="h-full p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 hover:border-white/40 hover:bg-white/15 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-500/20 backdrop-blur border border-cyan-400/30">
                  <Users className="h-5 w-5 text-cyan-300" />
                </div>
                <TrendingUp className="h-4 w-4 text-green-400/50" />
              </div>
              <p className="text-white/60 text-sm font-medium">Total Users</p>
              <p className="text-4xl font-bold text-white mt-2">{stats.totalUsers}</p>
              <p className="text-xs text-white/40 mt-2">Active members</p>
            </div>
          </div>

          {/* Total Products */}
          <div className="group">
            <div className="h-full p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 hover:border-white/40 hover:bg-white/15 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/20 backdrop-blur border border-purple-400/30">
                  <Package className="h-5 w-5 text-purple-300" />
                </div>
                <TrendingUp className="h-4 w-4 text-green-400/50" />
              </div>
              <p className="text-white/60 text-sm font-medium">Total Products</p>
              <p className="text-4xl font-bold text-white mt-2">{stats.totalProducts}</p>
              <p className="text-xs text-white/40 mt-2">In inventory</p>
            </div>
          </div>

          {/* Total Orders */}
          <div className="group">
            <div className="h-full p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 hover:border-white/40 hover:bg-white/15 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/30 to-cyan-500/20 backdrop-blur border border-blue-400/30">
                  <ShoppingCart className="h-5 w-5 text-blue-300" />
                </div>
                <TrendingUp className="h-4 w-4 text-green-400/50" />
              </div>
              <p className="text-white/60 text-sm font-medium">Total Orders</p>
              <p className="text-4xl font-bold text-white mt-2">{stats.totalOrders}</p>
              <p className="text-xs text-white/40 mt-2">All time</p>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="group">
            <div className="h-full p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 hover:border-white/40 hover:bg-white/15 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/30 to-emerald-500/20 backdrop-blur border border-green-400/30">
                  <TrendingUp className="h-5 w-5 text-green-300" />
                </div>
                <div className="text-sm font-medium text-green-400">+12%</div>
              </div>
              <p className="text-white/60 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold text-white mt-2">{formatINR(stats.totalRevenue)}</p>
              <p className="text-xs text-white/40 mt-2">Monthly income</p>
            </div>
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="mb-8">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 hover:border-white/30 transition-all">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Recent Orders</h2>
              <Link to="/admin/orders" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors">
                View All <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            
            {recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    to="/admin/orders"
                    className="group p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all backdrop-blur flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-cyan-300">
                        Order #{order.id.substring(0, 8)}
                      </p>
                      <p className="text-xs text-white/40 mt-1">
                        {order.order_items?.length} items • {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-sm font-semibold text-white">{formatINR(order.total)}</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur border ${
                        order.status === 'paid' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                        order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                        order.status === 'shipped' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                        'bg-white/10 text-white/60 border-white/20'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-white/40">No recent orders</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              to="/admin/products/new"
              className="group p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 hover:border-white/40 hover:bg-white/15 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10"
            >
              <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-500/20 backdrop-blur border border-cyan-400/30 w-fit group-hover:scale-110 transition-transform">
                <Package className="h-5 w-5 text-cyan-300" />
              </div>
              <p className="text-sm font-semibold text-white mt-4">Add Product</p>
              <p className="text-xs text-white/40 mt-1">Create new item</p>
            </Link>

            <Link
              to="/admin/products"
              className="group p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 hover:border-white/40 hover:bg-white/15 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10"
            >
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/20 backdrop-blur border border-purple-400/30 w-fit group-hover:scale-110 transition-transform">
                <Package className="h-5 w-5 text-purple-300" />
              </div>
              <p className="text-sm font-semibold text-white mt-4">Manage Products</p>
              <p className="text-xs text-white/40 mt-1">Edit or delete</p>
            </Link>

            <Link
              to="/admin/users"
              className="group p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 hover:border-white/40 hover:bg-white/15 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10"
            >
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/30 to-cyan-500/20 backdrop-blur border border-blue-400/30 w-fit group-hover:scale-110 transition-transform">
                <Users className="h-5 w-5 text-blue-300" />
              </div>
              <p className="text-sm font-semibold text-white mt-4">Manage Users</p>
              <p className="text-xs text-white/40 mt-1">View accounts</p>
            </Link>

            <Link
              to="/admin/orders"
              className="group p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 hover:border-white/40 hover:bg-white/15 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/10"
            >
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/30 to-emerald-500/20 backdrop-blur border border-green-400/30 w-fit group-hover:scale-110 transition-transform">
                <ShoppingCart className="h-5 w-5 text-green-300" />
              </div>
              <p className="text-sm font-semibold text-white mt-4">Manage Orders</p>
              <p className="text-xs text-white/40 mt-1">Track status</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
