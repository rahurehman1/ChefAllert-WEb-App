import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from "../lib/api";
import { useAuth } from '../context/AuthContext';
import { Avatar } from '../components/Avatar';
import { 
  Users, 
  TrendingUp, 
  AlertCircle, 
  Trash2, 
  Eye,
  Calendar,
  ChefHat,
  DollarSign,
  BarChart3,
  UserCheck,
  Shield,
  Sparkles,
  Zap,
  Activity,
  Target,
  Crown,
  Search,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface User {
  _id: string;
  email: string;
  full_name: string;
  role: 'client' | 'chef' | 'admin';
  profile_picture_url?: string | null;
  phone_number?: string;
  created_at: string;
  is_verified?: boolean;
}

interface Booking {
  _id: string;
  client_id: string;
  chef_id: string;
  status: string;
  total_amount: number;
  created_at: string;
  client?: User;
  chef?: User;
}

export function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalChefs: 0,
    totalBookings: 0,
    completedBookings: 0,
    revenue: 0,
  });
  const [clients, setClients] = useState<User[]>([]);
  const [chefs, setChefs] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [proRequests, setProRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'clients' | 'chefs' | 'bookings' | 'pro_requests'>('stats');
  const [searchTerm, setSearchTerm] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [acceptRequestId, setAcceptRequestId] = useState<string>('');
  const [acceptPaymentMethod, setAcceptPaymentMethod] = useState<'easypaisa' | 'jazzcash' | 'bank' | 'other'>('easypaisa');
  const [acceptAccountDetails, setAcceptAccountDetails] = useState('');

  const formatPkr = (amount: number) => {
    return 'Rs ' + amount.toLocaleString('en-PK');
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    loadDashboardData();
    setTimeout(() => setIsVisible(true), 100);
  }, [user, navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      console.log('📡 Loading admin dashboard data...');
      
      const [statsResponse, usersResponse, bookingsResponse, proReqRes] = await Promise.all([
        api.get('/api/admin/stats'),
        api.get('/api/admin/users'),
        api.get('/api/admin/bookings'),
        api.get('/api/support/admin/requests')
      ]);

      console.log('📊 Stats response:', statsResponse.data);
      console.log('👥 Users response:', usersResponse.data);
      console.log('📅 Bookings response:', bookingsResponse.data);
      console.log('💎 Pro requests response:', proReqRes.data);

      const statsData = statsResponse.data.stats || statsResponse.data;
      setStats({
        totalUsers: statsData.totalUsers || 0,
        totalChefs: statsData.totalChefs || 0,
        totalBookings: statsData.totalBookings || 0,
        completedBookings: statsData.completedBookings || 0,
        revenue: statsData.revenue || 0,
      });

      const usersData = Array.isArray(usersResponse.data) 
        ? usersResponse.data 
        : usersResponse.data.users || [];
      
      const clientList = usersData.filter((u: User) => u.role === 'client');
      const chefList = usersData.filter((u: User) => u.role === 'chef');

      setClients(clientList);
      setChefs(chefList);

      const bookingsData = Array.isArray(bookingsResponse.data)
        ? bookingsResponse.data
        : bookingsResponse.data.bookings || [];

      const bookingsWithUsers = bookingsData.map((booking: any) => {
        const client = usersData.find((u: User) => u._id?.toString() === booking.client_id?.toString());
        const chef = usersData.find((u: User) => u._id?.toString() === booking.chef_id?.toString());
        return { 
          ...booking, 
          client, 
          chef,
          clientId: booking.client_id,
          chefId: booking.chef_id
        };
      });

      setBookings(bookingsWithUsers);

      setProRequests(proReqRes.data.requests || []);

      console.log('✅ Dashboard Data Loaded:', {
        users: usersData.length,
        clients: clientList.length,
        chefs: chefList.length,
        bookings: bookingsData.length,
        stats: statsData
      });

    } catch (err: any) {
      console.error('❌ Error loading dashboard data:', err);
      console.error('❌ Error details:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const acceptProRequest = async (requestId: string, method: string, details: string) => {
    try {
      await api.post(`/api/support/admin/requests/${requestId}/accept`, { admin_payment_method: method, admin_account_details: details });
      loadDashboardData();
    } catch (err) {
      console.error('Error accepting pro request:', err);
    }
  };

  const openAcceptModal = (requestId: string) => {
    setAcceptRequestId(requestId);
    setAcceptPaymentMethod('easypaisa');
    setAcceptAccountDetails('');
    setAcceptModalOpen(true);
  };

  const submitAcceptModal = async () => {
    if (!acceptRequestId) return;
    await acceptProRequest(acceptRequestId, acceptPaymentMethod, acceptAccountDetails);
    setAcceptModalOpen(false);
  };

  const markProRequestPaid = async (requestId: string) => {
    try {
      await api.post(`/api/support/admin/requests/${requestId}/paid`);
      loadDashboardData();
    } catch (err) {
      console.error('Error marking pro request paid:', err);
    }
  };

  const activateProRequest = async (requestId: string) => {
    try {
      await api.post(`/api/support/admin/requests/${requestId}/activate`);
      loadDashboardData();
    } catch (err) {
      console.error('Error activating pro request:', err);
    }
  };

  const deleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await api.delete(`/api/admin/users/${userId}`);
        loadDashboardData();
      } catch (err) {
        console.error('Error deleting user:', err);
      }
    }
  };

  const cancelUserSubscription = async (userId: string) => {
    if (confirm('Cancel this user subscription now?')) {
      try {
        await api.post(`/api/subscriptions/admin/users/${userId}/cancel`);
        loadDashboardData();
      } catch (err) {
        console.error('Error cancelling subscription:', err);
      }
    }
  };

  const deleteBooking = async (bookingId: string) => {
    if (confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      try {
        await api.delete(`/api/admin/bookings/${bookingId}`);
        loadDashboardData();
      } catch (err) {
        console.error('Error deleting booking:', err);
      }
    }
  };

  const verifyChef = async (chefId: string) => {
    try {
      await api.put(`/api/admin/chefs/${chefId}/verify`);
      loadDashboardData();
    } catch (err) {
      console.error('Error verifying chef:', err);
    }
  };

  const filteredClients = clients.filter(client =>
    client.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredChefs = chefs.filter(chef =>
    chef.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chef.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBookings = bookings.filter(booking =>
    booking.client?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.chef?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProRequests = proRequests.filter((r: any) => {
    const clientName = (r.client_id?.full_name || '').toLowerCase();
    const clientEmail = (r.client_id?.email || '').toLowerCase();
    const status = (r.status || '').toLowerCase();
    const q = searchTerm.toLowerCase();
    return clientName.includes(q) || clientEmail.includes(q) || status.includes(q);
  });

  const StatCard = ({ title, value, icon: Icon, color, trend, subtitle, delay }: any) => (
    <div 
      className={`bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/20 transform transition-all duration-300 hover:scale-105 hover:shadow-xl group ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
          {trend && (
            <p className="text-xs text-green-500 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-r ${color} group-hover:scale-110 transition-transform duration-300 relative`}>
          <Icon className="w-8 h-8 text-white" />
          <Sparkles className="w-4 h-4 text-yellow-300 absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>
    </div>
  );

  const TabButton = ({ tab, activeTab, setActiveTab, icon: Icon, count }: any) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 text-sm ${
        activeTab === tab
          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
          : 'bg-white/80 backdrop-blur-sm text-gray-700 border border-gray-200 hover:border-orange-300 hover:shadow-lg'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="capitalize">{tab}</span>
      {count > 0 && (
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
          activeTab === tab ? 'bg-white/20 text-white' : 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-700'
        }`}>
          {count}
        </span>
      )}
    </button>
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'confirmed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'completed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 pt-24 pb-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 pt-24 pb-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-4 relative z-10">
        <div className={`mb-8 text-center transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl shadow-xl">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div className="px-4">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-lg text-gray-600 mt-2 max-w-2xl mx-auto">
                Manage your platform and monitor user activities
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-xl mx-auto mb-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 text-center border border-orange-100 shadow-lg">
              <div className="text-xl font-bold text-orange-600">{stats.totalUsers}</div>
              <div className="text-xs text-gray-600">Total Users</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 text-center border border-green-100 shadow-lg">
              <div className="text-xl font-bold text-green-600">{stats.totalChefs}</div>
              <div className="text-xs text-gray-600">Chefs</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 text-center border border-blue-100 shadow-lg">
              <div className="text-xl font-bold text-blue-600">{stats.totalBookings}</div>
              <div className="text-xs text-gray-600">Bookings</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 text-center border border-purple-100 shadow-lg">
              <div className="text-xl font-bold text-purple-600">{formatPkr(stats.revenue)}</div>
              <div className="text-xs text-gray-600">Revenue</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            color="from-orange-500 to-red-500"
            trend="+12% this month"
            delay="0ms"
          />
          <StatCard
            title="Professional Chefs"
            value={stats.totalChefs}
            icon={ChefHat}
            color="from-orange-500 to-red-500"
            trend="+5 new chefs"
            delay="100ms"
          />
          <StatCard
            title="Total Bookings"
            value={stats.totalBookings}
            icon={Calendar}
            color="from-orange-500 to-red-500"
            subtitle={`${stats.completedBookings} completed`}
            delay="200ms"
          />
          <StatCard
            title="Success Rate"
            value={`${stats.totalBookings > 0 ? ((stats.completedBookings / stats.totalBookings) * 100).toFixed(1) : 0}%`}
            icon={Target}
            color="from-orange-500 to-red-500"
            delay="300ms"
          />
          <StatCard
            title="Total Revenue"
            value={formatPkr(stats.revenue)}
            icon={DollarSign}
            color="from-orange-500 to-red-500"
            trend="+18% growth"
            delay="400ms"
          />
        </div>

        <div className={`flex flex-col lg:flex-row gap-4 mb-6 transition-all duration-1000 delay-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users, chefs, or bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 bg-white/80 backdrop-blur-lg border border-gray-200 rounded-xl shadow-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 hover:shadow-xl text-sm"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <TabButton tab="stats" activeTab={activeTab} setActiveTab={setActiveTab} icon={Activity} count={0} />
            <TabButton tab="clients" activeTab={activeTab} setActiveTab={setActiveTab} icon={Users} count={clients.length} />
            <TabButton tab="chefs" activeTab={activeTab} setActiveTab={setActiveTab} icon={Crown} count={chefs.length} />
            <TabButton tab="bookings" activeTab={activeTab} setActiveTab={setActiveTab} icon={Calendar} count={bookings.length} />
            <TabButton tab="pro_requests" activeTab={activeTab} setActiveTab={setActiveTab} icon={Sparkles} count={proRequests.length} />
          </div>
        </div>

        <div className={`bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden border border-white/20 transition-all duration-1000 delay-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          {activeTab === 'stats' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-orange-600" />
                Platform Analytics
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-5 border border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
                    <Users className="w-5 h-5 text-orange-600" />
                    User Analytics
                  </h3>
                  <ul className="space-y-4">
                    {[
                      { label: 'Total Registered Users', value: stats.totalUsers, color: 'text-gray-900' },
                      { label: 'Professional Chefs', value: stats.totalChefs, color: 'text-green-600' },
                      { label: 'Active Clients', value: stats.totalUsers - stats.totalChefs - 1, color: 'text-blue-600' }
                    ].map((item) => (
                      <li key={item.label} className="flex justify-between items-center py-3 border-b border-orange-200/50 last:border-b-0">
                        <span className="text-gray-600">{item.label}</span>
                        <span className={`font-bold text-lg ${item.color}`}>{item.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-5 border border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
                    <Zap className="w-5 h-5 text-orange-600" />
                    Performance Metrics
                  </h3>
                  <ul className="space-y-4">
                    {[
                      { label: 'Total Bookings', value: stats.totalBookings, color: 'text-gray-900' },
                      { label: 'Completed Bookings', value: stats.completedBookings, color: 'text-green-600' },
                      { label: 'Platform Revenue', value: formatPkr(stats.revenue), color: 'text-orange-600' }
                    ].map((item) => (
                      <li key={item.label} className="flex justify-between items-center py-3 border-b border-orange-200/50 last:border-b-0">
                        <span className="text-gray-600">{item.label}</span>
                        <span className={`font-bold text-lg ${item.color}`}>{item.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'clients' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <Users className="w-6 h-6 text-blue-600" />
                Client Management 
                <span className="text-sm text-gray-500 ml-2">({filteredClients.length})</span>
              </h2>
              <div className="overflow-x-auto rounded-xl border border-gray-200 shadow">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Client</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Contact</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Joined</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredClients.map((client) => (
                      <tr 
                        key={client._id} 
                        className="hover:bg-blue-50/50 transition-all duration-300"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={client.profile_picture_url}
                              alt={client.full_name || client.email}
                              role="client"
                              size="md"
                              className="shadow"
                            />
                            <div>
                              <p className="font-semibold text-gray-900">{client.full_name}</p>
                              <p className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full font-medium">
                                Customer
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900">{client.email}</p>
                          <p className="text-xs text-gray-500">{client.phone_number || 'No phone'}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(client.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button 
                              onClick={() => console.log('View client:', client._id)}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-300 transform hover:scale-110"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => cancelUserSubscription(client._id)}
                              className="p-2 text-orange-700 hover:bg-orange-100 rounded-lg transition-all duration-300 transform hover:scale-110"
                              title="Remove subscription"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteUser(client._id)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-300 transform hover:scale-110"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'chefs' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <Crown className="w-6 h-6 text-green-600" />
                Chef Management 
              </h2>
              <div className="overflow-x-auto rounded-xl border border-gray-200 shadow">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-green-50 to-green-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Chef</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Contact</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Joined</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredChefs.map((chef) => (
                      <tr 
                        key={chef._id} 
                        className="hover:bg-green-50/50 transition-all duration-300"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={chef.profile_picture_url}
                              alt={chef.full_name || chef.email}
                              role="chef"
                              size="md"
                              className="shadow"
                            />
                            <div>
                              <p className="font-semibold text-gray-900">{chef.full_name}</p>
                              <p className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full font-medium">
                                Professional Chef
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900">{chef.email}</p>
                          <p className="text-xs text-gray-500">{chef.phone_number || 'No phone'}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            chef.is_verified 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {chef.is_verified ? 'Verified' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(chef.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button 
                              onClick={() => console.log('View chef:', chef._id)}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-300 transform hover:scale-110"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => verifyChef(chef._id)}
                              className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-all duration-300 transform hover:scale-110"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteUser(chef._id)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-300 transform hover:scale-110"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <Calendar className="w-6 h-6 text-purple-600" />
                Booking Management 
           a  </h2>
              <div className="overflow-x-auto rounded-xl border border-gray-200 shadow">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-purple-50 to-purple-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">ID</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Client</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Chef</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredBookings.map((booking) => (
                      <tr 
                        key={booking._id} 
                        className="hover:bg-purple-50/50 transition-all duration-300"
                      >
                        <td className="px-4 py-3 text-xs font-mono text-gray-600">
                          {booking._id?.slice(-8)}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900 text-sm">{booking.client?.full_name || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{booking.client?.email || 'No email'}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900 text-sm">{booking.chef?.full_name || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{booking.chef?.email || 'No email'}</p>
                        </td>
                        <td className="px-4 py-3 font-bold text-gray-900">
                          {formatPkr(booking.total_amount || 0)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(booking.status)}`}>
                            {booking.status || 'unknown'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(booking.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button 
                              onClick={() => console.log('View booking:', booking._id)}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-300 transform hover:scale-110"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteBooking(booking._id)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-300 transform hover:scale-110"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'pro_requests' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-orange-600" />
                Pro Upgrade Requests
              </h2>

              <div className="overflow-x-auto rounded-xl border border-gray-200 shadow">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-orange-50 to-red-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Client</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Plan</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Admin Account</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredProRequests.map((r: any) => (
                      <tr key={r._id} className="hover:bg-orange-50/50 transition-all duration-300">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar
                              src={r.client_id?.profile_picture_url}
                              alt={r.client_id?.full_name || r.client_id?.email}
                              role="client"
                              size="md"
                              className="shadow"
                            />
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{r.client_id?.full_name || 'Client'}</p>
                              <p className="text-xs text-gray-500">{r.client_id?.email || ''}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-900">
                              {r.plan_code === 'pro_monthly' ? 'Monthly' : r.plan_code === 'pro_yearly' ? 'Yearly' : 'Unknown'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {r.plan_code === 'pro_monthly' ? 'Rs 1,500' : r.plan_code === 'pro_yearly' ? 'Rs 10,000' : ''}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold border ${
                            r.status === 'pending'
                              ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                              : r.status === 'accepted'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : r.status === 'paid'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : r.status === 'activated'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-gray-50 text-gray-700 border-gray-200'
                          }`}>{r.status}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="max-w-[360px]">
                            <p className="text-xs text-gray-700 whitespace-pre-wrap">
                              {r.admin_account_details || '-'}
                            </p>
                            {r.admin_payment_method && (
                              <p className="text-[11px] text-gray-500 mt-1">
                                {r.admin_payment_method === 'easypaisa'
                                  ? 'EasyPaisa'
                                  : r.admin_payment_method === 'jazzcash'
                                  ? 'JazzCash'
                                  : r.admin_payment_method === 'bank'
                                  ? 'Bank'
                                  : r.admin_payment_method === 'other'
                                  ? 'Other'
                                  : r.admin_payment_method}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            {r.status === 'pending' && (
                              <button
                                type="button"
                                onClick={() => openAcceptModal(r._id)}
                                className="px-3 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 shadow hover:shadow-lg"
                              >
                                Accept
                              </button>
                            )}
                            {(r.status === 'accepted' || r.status === 'paid' || r.status === 'activated') && (
                              <button
                                type="button"
                                onClick={() => navigate(`/support/subscription/${r._id}`)}
                                className="px-3 py-2 rounded-xl text-xs font-bold bg-white/80 border border-gray-200 text-gray-700 hover:shadow"
                              >
                                Open Chat
                              </button>
                            )}
                            {r.status === 'accepted' && (
                              <button
                                type="button"
                                onClick={() => markProRequestPaid(r._id)}
                                className="px-3 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow hover:shadow-lg"
                              >
                                Mark Paid
                              </button>
                            )}
                            {(r.status === 'paid' || r.status === 'accepted') && (
                              <button
                                type="button"
                                onClick={() => activateProRequest(r._id)}
                                className="px-3 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow hover:shadow-lg"
                              >
                                Activate Pro
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {acceptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <div>
                <p className="text-sm font-extrabold text-gray-900">Accept Pro Request</p>
                <p className="text-xs text-gray-500">Select payment method and add account details</p>
              </div>
              <button
                type="button"
                onClick={() => setAcceptModalOpen(false)}
                className="px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 font-bold"
              >
                Close
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Payment Method</label>
                <select
                  value={acceptPaymentMethod}
                  onChange={(e) => setAcceptPaymentMethod(e.target.value as any)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="easypaisa">EasyPaisa</option>
                  <option value="jazzcash">JazzCash</option>
                  <option value="bank">Bank</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Account Details</label>
                <textarea
                  value={acceptAccountDetails}
                  onChange={(e) => setAcceptAccountDetails(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="e.g. 03xx-xxxxxxx, account name, etc."
                />
              </div>
            </div>
            <div className="p-5 border-t border-gray-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setAcceptModalOpen(false)}
                className="px-4 py-3 rounded-xl font-bold bg-white border border-gray-200 text-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitAcceptModal}
                className="px-4 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 shadow-lg hover:shadow-xl"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}