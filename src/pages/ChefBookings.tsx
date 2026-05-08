import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  AlertCircle, 
  MessageCircle, 
  CheckCircle, 
  XCircle, 
  Star,
  ChefHat,
  Filter,
  DollarSign,
  Sparkles,
  Zap,
  TrendingUp,
  Award,
  Phone,
  Mail,
  User
} from 'lucide-react';
import api from '../lib/api';

export function ChefBookings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [isVisible, setIsVisible] = useState(false);

  const formatPkr = (amount: number) => {
    return 'Rs ' + amount.toLocaleString('en-PK');
  };

  const getStartOfWeek = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setDate(diff);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const getEndOfWeek = (start: Date) => {
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return end;
  };

  const now = new Date();
  const startOfWeek = getStartOfWeek(now);
  const endOfWeek = getEndOfWeek(startOfWeek);

  const thisWeekBookingsCount = bookings.filter((b) => {
    const value = b?.booking_date || b?.date;
    if (!value) return false;
    const dt = new Date(value);
    return dt >= startOfWeek && dt < endOfWeek;
  }).length;

  useEffect(() => {
    if (!user || user.role !== 'chef') {
      navigate('/');
      return;
    }
    fetchBookings();
    setTimeout(() => setIsVisible(true), 100);
  }, [user, navigate]);
  
  const fetchBookings = async () => {
    try {
      if (!user?.id) return;
      
      const response = await api.get(`/api/bookings/chef/${user.id}`);
      console.log('📋 Chef bookings:', response.data);
      setBookings(response.data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    setUpdating(bookingId);
    try {
      await api.put(`/api/bookings/${bookingId}/status`, { status: newStatus });
      fetchBookings(); // Refresh the list
    } catch (err) {
      console.error('Error updating booking:', err);
    } finally {
      setUpdating(null);
    }
  };

  const filteredBookings = filter === 'all'
    ? bookings
    : bookings.filter(b => b.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-gradient-to-r from-orange-100 to-red-50 text-orange-800 border-orange-200';
      case 'completed':
        return 'bg-gradient-to-r from-green-100 to-green-50 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-gradient-to-r from-red-100 to-red-50 text-red-800 border-red-200';
      default:
        return 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'completed':
        return <Star className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const LoadingSkeleton = () => (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 pt-24 pb-8">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-gray-200 rounded-2xl w-64 mx-auto mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto"></div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="flex gap-2 mb-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded-lg w-20"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white/80 rounded-xl shadow p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="space-y-1 flex-1">
                    <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const StatusButton = ({ status, active, onClick, count }: any) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 text-sm ${
        active
          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
          : 'bg-white/80 backdrop-blur-sm text-gray-700 border border-gray-200 hover:border-orange-300 hover:shadow-lg'
      }`}
    >
      {getStatusIcon(status)}
      <span className="capitalize">{status}</span>
      {count > 0 && (
        <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
          active ? 'bg-white/20 text-white' : 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-700'
        }`}>
          {count}
        </span>
      )}
    </button>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 pt-24 pb-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4 relative z-10">
        <div className={`text-center mb-8 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl shadow-xl">
              <ChefHat className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                My Bookings
              </h1>
              <p className="text-lg text-gray-600 mt-2 max-w-2xl mx-auto">
                Manage your culinary appointments and provide exceptional service
              </p>
            </div>
          </div>
        </div>

        <div className={`grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8 transition-all duration-1000 delay-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 text-center border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="text-2xl font-bold text-gray-900 mb-1">{bookings.length}</div>
            <div className="text-gray-600 flex items-center justify-center gap-1 text-sm">
              <TrendingUp className="w-3 h-3 text-orange-500" />
              Total
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="text-2xl font-bold text-blue-700 mb-1">{thisWeekBookingsCount}</div>
            <div className="text-blue-600 flex items-center justify-center gap-1 text-sm">
              <Calendar className="w-3 h-3" />
              This Week
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 text-center border border-yellow-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="text-2xl font-bold text-yellow-700 mb-1">{bookings.filter(b => b.status === 'pending').length}</div>
            <div className="text-yellow-600 flex items-center justify-center gap-1 text-sm">
              <Clock className="w-3 h-3" />
              Pending
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 text-center border border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="text-2xl font-bold text-orange-700 mb-1">{bookings.filter(b => b.status === 'confirmed').length}</div>
            <div className="text-orange-600 flex items-center justify-center gap-1 text-sm">
              <CheckCircle className="w-3 h-3" />
              Confirmed
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="text-2xl font-bold text-green-700 mb-1">{bookings.filter(b => b.status === 'completed').length}</div>
            <div className="text-green-600 flex items-center justify-center gap-1 text-sm">
              <Award className="w-3 h-3" />
              Completed
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 text-center border border-red-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div className="text-2xl font-bold text-red-700 mb-1">{bookings.filter(b => b.status === 'cancelled').length}</div>
            <div className="text-red-600 flex items-center justify-center gap-1 text-sm">
              <XCircle className="w-3 h-3" />
              Cancelled
            </div>
          </div>
        </div>

        <div className={`flex gap-2 mb-6 flex-wrap transition-all duration-1000 delay-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map(status => (
            <StatusButton
              key={status}
              status={status}
              active={filter === status}
              onClick={() => setFilter(status)}
              count={status === 'all' ? bookings.length : bookings.filter(b => b.status === status).length}
            />
          ))}
        </div>

        {filteredBookings.length > 0 ? (
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 transition-all duration-1000 delay-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            {filteredBookings.map((booking: any, index) => (
              <div 
                key={booking._id || booking.id} 
                className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                style={{ 
                  animationDelay: `${index * 50}ms`,
                  animation: 'fadeInUp 0.4s ease-out forwards'
                }}
              >
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {booking.client_id?.profile_picture_url ? (
                            <img
                              src={booking.client_id.profile_picture_url}
                              alt={booking.client_id?.full_name}
                              className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${booking.client_id?.full_name}&background=blue&color=white&size=48`;
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow">
                              <User className="w-6 h-6 text-white" />
                            </div>
                          )}
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                        </div>
                        
                        <div>
                          <h3 className="text-xl font-bold mb-1">{booking.client_id?.full_name || 'Client'}</h3>
                          <div className="flex flex-col gap-1 text-orange-100 text-xs">
                            {booking.client_id?.phone_number && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                <span>{booking.client_id.phone_number}</span>
                              </div>
                            )}
                            {booking.client_id?.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                <span className="truncate max-w-[180px]">{booking.client_id.email}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border backdrop-blur-sm ${getStatusColor(booking.status)} shadow`}>
                        {getStatusIcon(booking.status)}
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Calendar className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Date</p>
                        <p className="font-bold text-gray-900 text-sm">
                          {new Date(booking.booking_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Clock className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Time</p>
                        <p className="font-bold text-gray-900 text-sm">
                          {booking.start_time} - {booking.end_time}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <MapPin className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Location</p>
                        <p className="font-bold text-gray-900 text-sm truncate">{booking.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <DollarSign className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Total</p>
                        <p className="font-bold text-orange-600 text-lg">
                          {formatPkr(booking.total_amount || 0)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    {booking.cuisine_type && (
                      <div className="flex justify-between items-center py-2 px-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                        <span className="text-gray-600 font-medium text-sm">Cuisine Type</span>
                        <span className="font-bold text-gray-900 bg-white px-3 py-0.5 rounded-lg border text-sm">
                          {booking.cuisine_type}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-2 px-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                      <span className="text-gray-600 font-medium text-sm">Number of Dishes</span>
                      <span className="font-bold text-gray-900 bg-white px-3 py-0.5 rounded-lg border text-sm">
                        {booking.number_of_dishes || 1}
                      </span>
                    </div>
                    {booking.special_requests && (
                      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200">
                        <p className="text-orange-800 font-bold mb-1 flex items-center gap-1 text-sm">
                          <Sparkles className="w-3 h-3" />
                          Special Requests
                        </p>
                        <p className="text-orange-700 text-sm italic">"{booking.special_requests}"</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    {booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateBookingStatus(booking._id || booking.id, 'confirmed')}
                          disabled={updating === (booking._id || booking.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:transform-none transition-all duration-300 group text-sm"
                        >
                          {updating === (booking._id || booking.id) ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                              Accept
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => updateBookingStatus(booking._id || booking.id, 'cancelled')}
                          disabled={updating === (booking._id || booking.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:transform-none transition-all duration-300 group text-sm"
                        >
                          <XCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          Decline
                        </button>
                      </>
                    )}

                    {booking.status === 'confirmed' && (
                      <>
                        <button
                          onClick={() => navigate(`/chat/${booking._id || booking.id}`)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group text-sm"
                        >
                          <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          Chat
                        </button>
                        <button
                          onClick={() => updateBookingStatus(booking._id || booking.id, 'completed')}
                          disabled={updating === (booking._id || booking.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:transform-none transition-all duration-300 group text-sm"
                        >
                          {updating === (booking._id || booking.id) ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <>
                              <Award className="w-4 h-4 group-hover:scale-110 transition-transform" />
                              Complete
                            </>
                          )}
                        </button>
                      </>
                    )}

                    {booking.status === 'completed' && (
                      <button
                        onClick={() => navigate(`/chat/${booking._id || booking.id}`)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group text-sm"
                      >
                        <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        View Chat
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`text-center py-12 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 transition-all duration-1000 delay-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-200 to-red-200 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow">
                <Filter className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No {filter !== 'all' ? filter : ''} bookings</h3>
              <p className="text-gray-600 mb-6 leading-relaxed text-sm">
                {filter === 'all' 
                  ? "You don't have any bookings yet. Your upcoming appointments will appear here."
                  : `You don't have any ${filter} bookings at the moment. Check other statuses for active bookings.`
                }
              </p>
              {filter !== 'all' && (
                <button
                  onClick={() => setFilter('all')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-sm"
                >
                  <Zap className="w-4 h-4" />
                  View All Bookings
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
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