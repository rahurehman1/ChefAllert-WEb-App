import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  AlertCircle, 
  CheckCircle,
  Star, 
  MessageCircle, 
  ChefHat, 
  Sparkles, 
  Filter, 
  TrendingUp, 
  X,
  ThumbsUp,
} from 'lucide-react';

export function ClientBookings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [reviewingBooking, setReviewingBooking] = useState<string | null>(null);
  const [reviewData, setReviewData] = useState({ rating: 5, text: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const formatPkr = (amount: number) => {
    return 'Rs ' + amount.toLocaleString('en-PK');
  };

  useEffect(() => {
    if (!user || user.role !== 'client') {
      navigate('/');
      return;
    }
    fetchBookings();
    setTimeout(() => setIsVisible(true), 100);
  }, [user, navigate]);

  const fetchBookings = async () => {
    try {
      if (!user?.id) return;
      
      console.log('🔍 Fetching bookings for client:', user.id);
      
      const response = await api.get(`/api/bookings/client/${user.id}`);
      
      if (response.data) {
        console.log(`✅ Found ${response.data.length} bookings`);
        
        // Log first booking structure for debugging
        if (response.data.length > 0) {
          const firstBooking = response.data[0];
          console.log('📋 Sample booking structure:', {
            id: firstBooking._id,
            status: firstBooking.status,
            hasReview: firstBooking.hasReview,
            chef_id: firstBooking.chef_id,
            'chef_id.full_name': firstBooking.chef_id?.full_name,
            'chef_id.profile_picture_url': firstBooking.chef_id?.profile_picture_url
          });
        }
        
        setBookings(response.data);
      }
    } catch (err: any) {
      console.error('❌ Error fetching bookings:', err);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = filter === 'all'
    ? bookings
    : bookings.filter(b => b.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-800 border border-yellow-200';
      case 'confirmed':
        return 'bg-gradient-to-r from-orange-100 to-red-50 text-orange-800 border border-orange-200';
      case 'completed':
        return 'bg-gradient-to-r from-green-100 to-green-50 text-green-800 border border-green-200';
      case 'cancelled':
        return 'bg-gradient-to-r from-red-100 to-red-50 text-red-800 border border-red-200';
      default:
        return 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 border border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-orange-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const submitReview = async (bookingId: string) => {
    if (!user) return;

    setSubmittingReview(true);
    setError('');
    setSuccess('');

    try {
      console.log('📝 Submitting review for booking:', bookingId);
      
      const booking = bookings.find(b => b._id === bookingId);
      if (!booking) {
        console.error('❌ Booking not found:', bookingId);
        setError('Booking not found');
        return;
      }

      // Get chef ID from booking
      let chefId = '';
      
      if (booking.chef_id && typeof booking.chef_id === 'object') {
        chefId = booking.chef_id._id || booking.chef_id.id;
      } else if (booking.chef_id) {
        chefId = booking.chef_id.toString();
      } else if (booking.chefId) {
        chefId = booking.chefId;
      } else {
        console.error('❌ Could not find chef ID in booking:', booking);
        setError('Chef information not found in booking data');
        return;
      }

      // Prepare review payload
      const reviewPayload = {
        booking_id: bookingId,
        chef_id: chefId,
        client_id: user.id,
        rating: Number(reviewData.rating),
        review_text: reviewData.text || ''
      };

      console.log('📦 Final review payload:', reviewPayload);

      // Send request
      const response = await api.post('/api/reviews', reviewPayload);
      
      console.log('✅ Server response:', response.data);

      // Update local state
      setReviewingBooking(null);
      setReviewData({ rating: 5, text: '' });
      setSuccess('Review submitted successfully!');
      
      // Refresh bookings
      setTimeout(() => {
        fetchBookings();
        setSuccess('');
      }, 2000);

    } catch (err: any) {
      console.error('❌ Review submission failed:', err);
      
      let errorMessage = 'Failed to submit review';
      
      if (err.response?.data) {
        console.error('Server error response:', err.response.data);
        errorMessage = err.response.data.message || JSON.stringify(err.response.data);
      }
      
      setError(errorMessage);
      setTimeout(() => setError(''), 5000);
    } finally {
      setSubmittingReview(false);
    }
  };

  const LoadingSkeleton = () => (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 pt-24 pb-8">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-gray-200 rounded-2xl w-64 mb-6"></div>
          <div className="flex gap-3 mb-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded-xl w-20"></div>
            ))}
          </div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-lg p-6 border border-white/20">
              <div className="flex gap-6">
                <div className="w-32 h-32 bg-gray-200 rounded-2xl"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="grid grid-cols-2 gap-3">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="h-3 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 pt-24 pb-8">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4 relative z-10">
        {/* Error/Success Messages */}
        {error && (
          <div className={`mb-6 p-4 bg-red-50/80 backdrop-blur-lg border border-red-200 rounded-2xl shadow-lg flex gap-3 items-start transform transition-all duration-500 ${
            error ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}>
            <div className="p-2 bg-red-100 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-800 mb-1">Review Submission Failed</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
            <button onClick={() => setError('')} className="text-red-600 hover:text-red-800 p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {success && (
          <div className={`mb-6 p-4 bg-green-50/80 backdrop-blur-lg border border-green-200 rounded-2xl shadow-lg flex gap-3 items-start transform transition-all duration-500 ${
            success ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}>
            <div className="p-2 bg-green-100 rounded-xl">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-800 mb-1">Success!</h3>
              <p className="text-green-700 text-sm">{success}</p>
            </div>
            <button onClick={() => setSuccess('')} className="text-green-600 hover:text-green-800 p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Header */}
        <div className={`text-center mb-8 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl shadow-2xl">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                My Bookings
              </h1>
              <p className="text-lg text-gray-600 mt-2 max-w-2xl mx-auto">
                Manage your culinary experiences and upcoming chef services
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 max-w-xl mx-auto mb-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 text-center border border-orange-100 shadow-lg">
              <div className="text-xl font-bold text-orange-600">{bookings.length}</div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 text-center border border-yellow-100 shadow-lg">
              <div className="text-xl font-bold text-yellow-600">
                {bookings.filter(b => b.status === 'pending').length}
              </div>
              <div className="text-xs text-gray-600">Pending</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 text-center border border-orange-100 shadow-lg">
              <div className="text-xl font-bold text-orange-600">
                {bookings.filter(b => b.status === 'confirmed').length}
              </div>
              <div className="text-xs text-gray-600">Confirmed</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 text-center border border-green-100 shadow-lg">
              <div className="text-xl font-bold text-green-600">
                {bookings.filter(b => b.status === 'completed').length}
              </div>
              <div className="text-xs text-gray-600">Completed</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 text-center border border-red-100 shadow-lg">
              <div className="text-xl font-bold text-red-600">
                {bookings.filter(b => b.status === 'cancelled').length}
              </div>
              <div className="text-xs text-gray-600">Cancelled</div>
            </div>
          </div>
        </div>

        {/* Filter Tabs - Orange/Red Primary */}
        <div className={`flex gap-2 mb-6 flex-wrap transition-all duration-1000 delay-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`flex items-center gap-1 px-4 py-2 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 capitalize text-sm ${
                filter === status
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                  : 'bg-white/80 backdrop-blur-sm text-gray-700 border border-gray-200 shadow-lg hover:border-orange-300 hover:shadow-xl'
              }`}
            >
              {getStatusIcon(status)}
              {status}
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                filter === status ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                {status === 'all' ? bookings.length : bookings.filter(b => b.status === status).length}
              </span>
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {filteredBookings.length > 0 ? (
          <div className={`space-y-4 transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            {filteredBookings.map((booking: any, index) => (
              <div
                key={booking._id}
                className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-lg overflow-hidden border border-white/20 hover:shadow-xl transition-all duration-500 transform hover:scale-[1.02]"
                style={{ 
                  animationDelay: `${index * 50}ms`,
                  animation: 'fadeInUp 0.4s ease-out forwards'
                }}
              >
                <div className="flex flex-col lg:flex-row">
                  {/* Chef Image Section */}
                  <div className="lg:w-48 bg-gradient-to-br from-orange-400 to-red-500 flex flex-col items-center justify-center p-6 relative overflow-hidden">
                    {/* Chef Profile Picture */}
                    <div className="relative mb-4">
                      {booking.chef_id?.profile_picture_url ? (
                        <img
                          src={booking.chef_id.profile_picture_url}
                          alt={booking.chef_id.full_name}
                          className="w-20 h-20 rounded-2xl object-cover shadow-lg border-2 border-white/20"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${booking.chef_id?.full_name || 'Chef'}&background=orange&color=white&size=80`;
                          }}
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-orange-600 to-red-600 flex items-center justify-center shadow-lg">
                          <ChefHat className="w-10 h-10 text-white" />
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                    </div>
                    
                    {/* Chef Name */}
                    <h3 className="text-white font-bold text-lg text-center">
                      {booking.chef_id?.full_name || 'Chef'}
                    </h3>
                    
                    {/* Status Badge */}
                    <div className="mt-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-semibold ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="flex-1 p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          Booking #{booking._id?.slice(-8)}
                        </h3>
                        <p className="text-gray-600">
                          {booking.cuisine_type && (
                            <span className="bg-gradient-to-r from-orange-50 to-red-50 text-orange-700 px-3 py-1 rounded-lg text-sm font-medium border border-orange-200 mr-2">
                              {booking.cuisine_type} Cuisine
                            </span>
                          )}
                          <span className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm font-medium border border-gray-200">
                            {booking.number_of_dishes || 1} Dishes
                          </span>
                        </p>
                      </div>
                      
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => navigate(`/chat/${booking._id}`)}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 mt-3 lg:mt-0 text-sm"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Chat with Chef
                        </button>
                      )}
                    </div>

                    {/* Booking Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Calendar className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Booking Date</p>
                          <p className="font-semibold text-gray-900 text-sm">
                            {new Date(booking.booking_date || booking.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <Clock className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Time</p>
                          <p className="font-semibold text-gray-900 text-sm">
                            {booking.start_time || booking.startTime} - {booking.end_time || booking.endTime}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <MapPin className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Location</p>
                          <p className="font-semibold text-gray-900 text-sm truncate">
                            {booking.location}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <TrendingUp className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Total Amount</p>
                          <p className="text-xl font-bold text-orange-600">
                            {formatPkr(booking.total_amount || booking.totalAmount || 0)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Additional Details */}
                    <div className="space-y-3 mb-6">
                      {booking.special_requests && (
                        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl border border-orange-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-orange-500" />
                            <p className="text-orange-800 font-bold text-sm">Special Requests</p>
                          </div>
                          <p className="text-gray-700 italic text-sm pl-6">"{booking.special_requests}"</p>
                        </div>
                      )}
                    </div>

                    {/* ✅ COMPLETE REVIEW SECTION - Orange/Red Primary Buttons */}
                    {booking.status === 'completed' && !booking.hasReview && (
                      <div className="mt-6">
                        {reviewingBooking === booking._id ? (
                          <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-3xl border border-orange-200 space-y-4">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl">
                                  <Star className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <h4 className="text-xl font-bold text-gray-900">Share Your Experience</h4>
                                  <p className="text-gray-600 text-sm">Help other clients by sharing your feedback</p>
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  setReviewingBooking(null);
                                  setReviewData({ rating: 5, text: '' });
                                }}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-300"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Rating Section */}
                            <div className="space-y-3">
                              <h5 className="text-lg font-bold text-gray-900">How would you rate this experience?</h5>
                              <div className="flex flex-col items-center">
                                <div className="flex gap-1 mb-3">
                                  {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                      key={star}
                                      type="button"
                                      onClick={() => setReviewData({ ...reviewData, rating: star })}
                                      className="transform hover:scale-110 transition-all duration-300 focus:outline-none"
                                    >
                                      <Star
                                        className={`w-10 h-10 ${
                                          star <= reviewData.rating
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300'
                                        }`}
                                      />
                                    </button>
                                  ))}
                                </div>
                                <div className="text-center">
                                  <p className="text-xl font-bold text-gray-900">
                                    {reviewData.rating} Star{reviewData.rating !== 1 ? 's' : ''}
                                  </p>
                                  <p className="text-gray-600 mt-1 text-sm">
                                    {reviewData.rating === 5 ? 'Excellent! Would definitely recommend!' : 
                                     reviewData.rating === 4 ? 'Good experience overall' : 
                                     reviewData.rating === 3 ? 'Average, could be better' : 
                                     reviewData.rating === 2 ? 'Below expectations' : 'Poor experience'}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Review Text Section */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h5 className="text-lg font-bold text-gray-900">Share details about your experience</h5>
                                <span className="text-xs text-gray-500">Optional</span>
                              </div>
                              <textarea
                                value={reviewData.text}
                                onChange={(e) => setReviewData({ ...reviewData, text: e.target.value })}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 min-h-[100px] text-sm"
                                placeholder="What did you love about the service? Any highlights or suggestions for improvement?"
                                rows={3}
                              />
                              <p className="text-xs text-gray-500">
                                Your review will help other clients make better decisions.
                              </p>
                            </div>

                            {/* Action Buttons - Orange/Red Primary */}
                            <div className="flex gap-3 pt-3">
                              <button
                                onClick={() => submitReview(booking._id)}
                                disabled={submittingReview}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none group text-sm"
                              >
                                {submittingReview ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Submitting...
                                  </>
                                ) : (
                                  <>
                                    <ThumbsUp className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    Submit Review
                                    <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setReviewingBooking(null);
                                  setReviewData({ rating: 5, text: '' });
                                }}
                                disabled={submittingReview}
                                className="px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              console.log('📝 Starting review for booking:', {
                                id: booking._id,
                                status: booking.status,
                                hasReview: booking.hasReview,
                                chef: booking.chef_id?.full_name
                              });
                              setReviewingBooking(booking._id);
                            }}
                            className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-orange-300 group w-full"
                          >
                            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                              <Star className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="text-left">
                              <p className="font-bold">Leave a Review</p>
                              <p className="text-xs text-orange-600">Share your experience with {booking.chef_id?.full_name || 'the chef'}</p>
                            </div>
                            <div className="ml-auto">
                              <span className="text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full font-medium">
                                Share Your Feedback
                              </span>
                            </div>
                          </button>
                        )}
                      </div>
                    )}

                    {/* Already Reviewed Section */}
                    {booking.hasReview && (
                      <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl">
                          <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-green-800 text-lg">Review Submitted</p>
                          <p className="text-green-700 text-sm">Thank you for sharing your feedback!</p>
                        </div>
                        <button
                          onClick={() => {
                            console.log('👀 Viewing review for booking:', booking._id);
                          }}
                          className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 transition-all duration-300 text-sm"
                        >
                          View Review
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className={`text-center py-12 bg-white/80 backdrop-blur-lg rounded-3xl shadow-lg border border-white/20 transition-all duration-1000 delay-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-200 to-red-200 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Calendar className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No {filter !== 'all' ? filter : ''} bookings</h3>
              <p className="text-gray-600 mb-6 leading-relaxed text-sm">
                {filter === 'all' 
                  ? "You haven't made any bookings yet. Discover amazing chefs and book your first culinary experience!"
                  : `No ${filter} bookings found. Check other statuses or book a new experience.`
                }
              </p>
              {filter === 'all' ? (
                <button
                  onClick={() => navigate('/browse-chefs')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  Browse Chefs
                </button>
              ) : (
                <button
                  onClick={() => setFilter('all')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-sm"
                >
                  <Filter className="w-4 h-4" />
                  View All Bookings
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add custom animations */}
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