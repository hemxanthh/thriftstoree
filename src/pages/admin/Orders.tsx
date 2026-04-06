import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { formatINR } from '../../lib/currency';
import { Search, ShoppingCart, ChevronDown } from 'lucide-react';

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  products?: { id: string; name: string };
}

interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  created_at: string;
  user_profiles?: { email: string | null };
  order_items: OrderItem[];
}

const statusOptions = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'] as const;

const statusColors: Record<Order['status'], string> = {
  pending: 'bg-yellow-100/50 text-yellow-700',
  paid: 'bg-green-100/50 text-green-700',
  shipped: 'bg-blue-100/50 text-blue-700',
  delivered: 'bg-emerald-100/50 text-emerald-700',
  cancelled: 'bg-red-100/50 text-red-700',
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'' | Order['status']>('');
  const [q, setQ] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const s = (statusFilter || '').toLowerCase();
    const query = q.trim().toLowerCase();
    return orders.filter((o) => {
      const matchesStatus = !s || o.status === s;
      const matchesQuery =
        !query ||
        o.id.toLowerCase().includes(query) ||
        (o.user_profiles?.email || '').toLowerCase().includes(query);
      return matchesStatus && matchesQuery;
    });
  }, [orders, statusFilter, q]);

  useEffect(() => {
    let mounted = true;
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, error } = await supabase
          .from('orders')
          .select('id, user_id, status, total, created_at, user_profiles(email), order_items(id, quantity, price, products(id, name))')
          .order('created_at', { ascending: false });
        if (error) throw error;
        if (mounted) setOrders(data as unknown as Order[] || []);
      } catch (err: any) {
        console.error('Failed to fetch orders', err);
        setError(err.message || 'Failed to fetch orders');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchOrders();

    const channel = supabase
      .channel('orders-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOrders())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, () => fetchOrders())
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const updateStatus = async (id: string, status: Order['status']) => {
    const prev = orders;
    setOrders((os) => os.map((o) => (o.id === id ? { ...o, status } : o)));
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) {
      console.error('Failed to update status', error);
      setOrders(prev);
      alert('Failed to update order status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingCart className="w-8 h-8 text-amber-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-900 to-amber-700 bg-clip-text text-transparent">
              Orders Management
            </h1>
          </div>
          <p className="text-slate-600">Track and manage all orders</p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-3 text-slate-400 w-5 h-5" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by order ID or email..."
              className="w-full pl-12 pr-4 py-3 bg-white/80 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-slate-900 placeholder-slate-500 backdrop-blur transition"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            aria-label="Filter orders by status"
            className="px-4 py-3 bg-white/80 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-slate-900 backdrop-blur transition appearance-none"
          >
            <option value="">All statuses</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50/50 backdrop-blur border border-red-200/30 rounded-2xl p-6 text-red-700 mb-8">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Orders List */}
        {!error && (
          <div className="space-y-4">
            {filtered.length === 0 ? (
              <div className="text-center py-12 bg-white/50 backdrop-blur border border-white/20 rounded-2xl">
                <p className="text-slate-600 text-lg font-medium">No orders found</p>
                <p className="text-slate-500 text-sm mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              filtered.map((o) => (
                <div
                  key={o.id}
                  className="bg-white/50 backdrop-blur border border-white/20 rounded-2xl overflow-hidden hover:bg-white/70 transition shadow-md"
                >
                  <button
                    onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)}
                    className="w-full px-6 py-4 text-left hover:bg-white/30 transition flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <div>
                          <p className="font-semibold text-slate-900">Order {o.id.slice(0, 8)}...</p>
                          <p className="text-sm text-slate-600">{o.user_profiles?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm flex-wrap">
                        <span className={`px-3 py-1 rounded-full font-medium text-xs ${statusColors[o.status]}`}>
                          {o.status}
                        </span>
                        <span className="text-slate-700 font-semibold">{formatINR(o.total)}</span>
                        <span className="text-slate-500">{new Date(o.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 transition transform flex-shrink-0 ml-4 ${
                        expandedOrder === o.id ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Expanded Details */}
                  {expandedOrder === o.id && (
                    <div className="border-t border-white/20 px-6 py-4 bg-white/30 space-y-4">
                      {/* Status Update */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Update Status</label>
                        <select
                          value={o.status}
                          onChange={(e) => updateStatus(o.id, e.target.value as Order['status'])}
                          aria-label="Update order status"
                          className="w-full px-4 py-2 bg-white/80 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-slate-900 backdrop-blur transition"
                        >
                          {statusOptions.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Order Items */}
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-3">Order Items</h3>
                        <div className="space-y-2">
                          {o.order_items?.map((it) => (
                            <div
                              key={it.id}
                              className="flex items-center justify-between p-3 bg-white/50 rounded-lg border border-white/20"
                            >
                              <div>
                                <p className="font-medium text-slate-900">{it.products?.name || it.product_id}</p>
                                <p className="text-sm text-slate-600">Qty: {it.quantity}</p>
                              </div>
                              <p className="font-semibold text-amber-700">{formatINR(it.price * it.quantity)}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Total */}
                      <div className="border-t border-white/20 pt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold text-slate-900">Total</span>
                          <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-amber-700 bg-clip-text text-transparent">
                            {formatINR(o.total)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Stats Footer */}
        {filtered.length > 0 && (
          <div className="mt-8 bg-white/50 backdrop-blur border border-white/20 rounded-2xl p-6">
            <p className="text-sm text-slate-600">
              Showing <span className="font-semibold text-slate-900">{filtered.length}</span> of{' '}
              <span className="font-semibold text-slate-900">{orders.length}</span> orders •{' '}
              <span className="font-semibold text-amber-700">
                Total Revenue: {formatINR(filtered.reduce((sum, o) => sum + o.total, 0))}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
