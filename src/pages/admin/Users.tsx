import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Users as UsersIcon } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string | null;
  created_at: string;
}

export default function Users() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      (u.email || '').toLowerCase().includes(q) || (u.full_name || '').toLowerCase().includes(q)
    );
  }, [users, query]);

  useEffect(() => {
    let mounted = true;
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, error } = await supabase
          .from('user_profiles')
          .select('id, email, full_name, role, created_at')
          .order('created_at', { ascending: false });
        if (error) throw error;
        if (mounted) setUsers(data || []);
      } catch (err: any) {
        console.error('Failed to fetch users', err);
        setError(err.message || 'Failed to fetch users');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchUsers();

    const channel = supabase
      .channel('users-admin')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_profiles' },
        () => {
          fetchUsers();
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading users...</p>
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
            <UsersIcon className="w-8 h-8 text-amber-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-900 to-amber-700 bg-clip-text text-transparent">
              Users Management
            </h1>
          </div>
          <p className="text-slate-600">View and manage all registered users</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-3 text-slate-400 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-12 pr-4 py-3 bg-white/80 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-slate-900 placeholder-slate-500 backdrop-blur transition"
            />
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50/50 backdrop-blur border border-red-200/30 rounded-2xl p-6 text-red-700 mb-8">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Table */}
        {!error && (
          <div className="bg-white/50 backdrop-blur border border-white/20 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20 bg-white/30">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Full Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                        <p className="text-lg font-medium">No users found</p>
                        <p className="text-sm mt-1">Try adjusting your search terms</p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((u, index) => (
                      <tr
                        key={u.id}
                        className={`border-b border-white/10 ${index % 2 === 0 ? 'bg-white/20' : 'bg-white/10'} hover:bg-white/40 transition`}
                      >
                        <td className="px-6 py-4 text-sm text-slate-900 font-medium">{u.email}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{u.full_name || '-'}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              u.role === 'admin'
                                ? 'bg-amber-100/50 text-amber-700'
                                : 'bg-slate-100/50 text-slate-700'
                            }`}
                          >
                            {u.role || 'user'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(u.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer Stats */}
            {filtered.length > 0 && (
              <div className="bg-white/30 border-t border-white/20 px-6 py-4 flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  Showing <span className="font-semibold text-slate-900">{filtered.length}</span> of{' '}
                  <span className="font-semibold text-slate-900">{users.length}</span> users
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
