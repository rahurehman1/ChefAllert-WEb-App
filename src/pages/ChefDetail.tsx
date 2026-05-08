import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { ChefHat, Star, Calendar, MapPin, AlertCircle, CheckCircle, Clock, Users, Award, Sparkles } from 'lucide-react';
import { PAKISTANI_DISHES } from '../data/pakistaniDishes';

export function ChefDetail() {
  const { chefId } = useParams<{ chefId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chef, setChef] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    cuisineType: '',
    primaryDish: '',
    dishes: [] as string[],
    numberOfDishes: 1,
    specialRequests: '',
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const formatPkr = (amount: number) => {
    return 'Rs ' + amount.toLocaleString('en-PK');
  };

  const isProClient = user?.role === 'client' && !!(user as any)?.is_pro;

  const getHoursDiff = () => {
    try {
      if (!bookingData.startTime || !bookingData.endTime) return 0;
      const start = new Date(`2024-01-01T${bookingData.startTime}`);
      const end = new Date(`2024-01-01T${bookingData.endTime}`);
      const diff = (end.getTime() - start.getTime()) / 3600000;
      return diff > 0 ? diff : 0;
    } catch {
      return 0;
    }
  };

  const resolveImageUrl = (value?: string | null) => {
    if (!value) return null;
    if (value.startsWith('http://') || value.startsWith('https://')) return value;
    const base = 'http://localhost:5001';
    if (value.startsWith('/')) return `${base}${value}`;
    return `${base}/${value}`;
  };

  useEffect(() => {
    fetchChefData();
    setTimeout(() => setIsVisible(true), 100);
  }, [chefId]);

  const fetchChefData = async () => {
    try {
      console.log('Fetching chef with ID:', chefId);
      const response = await api.get(`/api/chefs/${chefId}`);
      console.log('Chef API Response:', response.data);
      
      // Check the structure of the response
      const chefData = response.data;
      
      // If chef data is nested in a different structure
      if (chefData.chef) {
        setChef(chefData.chef);
      } else if (chefData.data) {
        setChef(chefData.data);
      } else {
        setChef(chefData);
      }
      
      setReviews(chefData.reviews || []);
    } catch (err: any) {
      console.error('Error fetching chef details:', err);
      setError(err.response?.data?.message || 'Failed to load chef details');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'client') {
      setError('Only clients can book chefs');
      return;
    }

    setBookingLoading(true);
    setError('');

    try {
      // Use safe access with optional chaining
      const pricePerHour = chef?.profile?.price_per_hour || chef?.price_per_hour || 0;
      const chefUserId = chef?.user_id?._id || chef?.user_id || chefId;
      
      // Calculate hours difference
      const start = new Date(`2024-01-01T${bookingData.startTime}`);
      const end = new Date(`2024-01-01T${bookingData.endTime}`);
      const hoursDiff = (end.getTime() - start.getTime()) / 3600000;
      const baseTotalAmount = pricePerHour * hoursDiff;
      const totalAmount = isProClient ? baseTotalAmount * 0.8 : baseTotalAmount;

      console.log('Booking data:', {
        client_id: user.id,
        chef_id: chefUserId,
        total_amount: totalAmount,
        hours: hoursDiff,
        price_per_hour: pricePerHour
      });

      const response = await api.post('/api/bookings', {
        client_id: user.id,
        chef_id: chefUserId,
        booking_date: bookingData.date,
        start_time: bookingData.startTime,
        end_time: bookingData.endTime,
        location: bookingData.location,
        cuisine_type: bookingData.cuisineType,
        primary_dish: bookingData.primaryDish,
        dishes: bookingData.dishes,
        number_of_dishes: bookingData.numberOfDishes,
        special_requests: bookingData.specialRequests,
        total_amount: totalAmount,
      });

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      setBookingSuccess(true);
      setTimeout(() => {
        navigate('/bookings');
      }, 2000);
    } catch (err: any) {
      console.error('Booking error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create booking');
    } finally {
      setBookingLoading(false);
    }
  };

  const LoadingSkeleton = () => (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 pt-24 pb-8">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="animate-pulse space-y-8">
          <div className="h-6 bg-gray-200 rounded w-32 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="h-80 bg-gray-200 rounded-3xl"></div>
              <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              <div className="h-12 bg-gray-200 rounded-xl"></div>
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Add a guard clause before rendering
  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!chef) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 pt-24 pb-8 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Chef not found</p>
          <button
            onClick={() => navigate('/browse-chefs')}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-xl transition-all duration-300 font-semibold"
          >
            Back to Chefs
          </button>
        </div>
      </div>
    );
  }

  // Safe data extraction
  const chefProfile = chef.profile || chef;
  const chefUser = chef.user_id || chef.user || chef;
  const experienceYears = chefProfile?.experience_years || 0;
  const rating = chefProfile?.rating || 0;
  const totalReviews = chefProfile?.total_reviews || 0;
  const pricePerHour = chefProfile?.price_per_hour || 0;
  const discountedPricePerHour = isProClient ? pricePerHour * 0.8 : pricePerHour;
  const bio = chefProfile?.bio || '';
  const specializations = chefProfile?.specializations || '';
  const certifications = chefProfile?.certifications || '';
  const availabilityStart = chefProfile?.availability_start_time || '09:00';
  const availabilityEnd = chefProfile?.availability_end_time || '17:00';
  const chefName = chefUser?.full_name || chef.full_name || 'Professional Chef';
  const chefCity = chefUser?.city || chef.city;
  const chefState = chefUser?.state || chef.state;

  const toggleDish = (dish: string) => {
    setBookingData(prev => {
      const exists = prev.dishes.includes(dish);
      return {
        ...prev,
        dishes: exists ? prev.dishes.filter(d => d !== dish) : [...prev.dishes, dish]
      };
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 pt-24 pb-8">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4 relative z-10">
        {/* Back Button */}
        <button
          onClick={() => navigate('/browse-chefs')}
          className={`flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold mb-6 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white">
            ←
          </div>
          Back to Chefs
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chef Header Card */}
            <div className={`bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl overflow-hidden border border-white/20 transition-all duration-1000 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              <div className="h-80 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center relative overflow-hidden">
                {resolveImageUrl(chefUser?.profile_picture_url) ? (
                  <img
                    src={resolveImageUrl(chefUser.profile_picture_url) as string}
                    alt={chefName}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(chefName)}&background=orange&color=white&size=512`;
                    }}
                  />
                ) : (
                  <div className="text-center">
                    <ChefHat className="w-24 h-24 text-white opacity-90 mb-4" />
                    <p className="text-white text-lg font-semibold">Professional Chef</p>
                  </div>
                )}
                
                {/* Experience Badge */}
                {experienceYears > 5 && (
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-full px-3 py-1 shadow-lg">
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <Award className="w-3 h-3" />
                      <span>Expert Chef</span>
                    </div>
                  </div>
                )}

                {/* Rating Badge */}
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-2xl px-3 py-2 shadow-lg">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    <span className="font-bold text-gray-900">
                      {rating.toFixed(1)}
                    </span>
                    <span className="text-gray-600 text-xs">
                      ({totalReviews})
                    </span>
                  </div>
                </div>
              </div>

              {/* Chef Info */}
              <div className="p-6">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">{chefName}</h1>

                <div className="flex flex-wrap items-center gap-4 mb-6">
                  {chefCity && (
                    <div className="flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-200">
                      <MapPin className="w-4 h-4 text-orange-600" />
                      <span className="font-semibold text-gray-700 text-sm">{chefCity}{chefState ? `, ${chefState}` : ''}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-xl border border-red-200">
                    <Clock className="w-4 h-4 text-red-600" />
                    <span className="font-semibold text-gray-700 text-sm">
                      {experienceYears} years experience
                    </span>
                  </div>
                </div>

                {bio && (
                  <div className="text-gray-700 leading-relaxed mb-6 bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-2xl border border-orange-100 text-sm">
                    {bio}
                  </div>
                )}

                {specializations && (
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Award className="w-5 h-5 text-orange-600" />
                      Specializations
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {specializations.split(',').map((spec: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 rounded-lg font-medium border border-orange-200 shadow-sm text-xs"
                        >
                          {spec.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {certifications && (
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Award className="w-5 h-5 text-green-600" />
                      Certifications
                    </h3>
                    <p className="text-gray-700 bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-2xl border border-green-200 text-sm">
                      {certifications}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Reviews Section */}
            {reviews.length > 0 && (
              <div className={`bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-6 border border-white/20 transition-all duration-1000 delay-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                  Client Reviews
                </h3>
                <div className="space-y-4">
                  {reviews.slice(0, 3).map((review: any, index: number) => (
                    <div
                      key={review.id || review._id || index}
                      className="border-b border-gray-200/50 pb-4 last:border-b-0"
                      style={{ 
                        animationDelay: `${index * 100}ms`,
                        animation: 'fadeInUp 0.6s ease-out forwards'
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {review.users?.full_name?.charAt(0) || review.client_id?.full_name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">
                              {review.users?.full_name || review.client_id?.full_name || 'Anonymous'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(review.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < (review.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.review_text && (
                        <p className="text-gray-600 mt-2 leading-relaxed bg-gray-50 p-3 rounded-xl text-sm">
                          "{review.review_text}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking Sidebar */}
          <div className={`transition-all duration-1000 delay-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-6 border border-white/20 sticky top-8">
              <div className="text-center mb-4">
                <p className="text-gray-600 text-xs mb-1">Hourly Rate</p>
                {isProClient ? (
                  <div>
                    <p className="text-4xl font-bold text-orange-600">
                      {formatPkr(discountedPricePerHour)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      <span className="line-through">{formatPkr(pricePerHour)}</span>
                      <span className="ml-2 font-semibold text-green-700">20% discount (because you are PRO)</span>
                    </p>
                  </div>
                ) : (
                  <p className="text-4xl font-bold text-orange-600">
                    {formatPkr(pricePerHour)}
                  </p>
                )}
                <p className="text-gray-500 text-xs mt-1">per hour</p>
              </div>

              {/* Availability */}
              <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                <div className="flex items-center gap-2 text-green-700 font-medium mb-1 text-sm">
                  <Clock className="w-3 h-3" />
                  Available
                </div>
                <p className="text-xs text-green-600">
                  {availabilityStart} - {availabilityEnd}
                </p>
              </div>

              {user?.role === 'client' ? (
                <>
                  <button
                    onClick={() => setShowBookingForm(!showBookingForm)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 mb-4 text-sm"
                  >
                    {showBookingForm ? (
                      <>
                        <AlertCircle className="w-4 h-4" />
                        Cancel Booking
                      </>
                    ) : (
                      <>
                        <Calendar className="w-4 h-4" />
                        Book This Chef
                      </>
                    )}
                  </button>

                  {showBookingForm && (
                    <form onSubmit={handleBooking} className="space-y-3">
                      {error && (
                        <div className="p-3 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl text-red-700 text-xs flex gap-2 items-start">
                          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                          <span>{error}</span>
                        </div>
                      )}

                      {bookingSuccess && (
                        <div className="p-3 bg-green-50/80 backdrop-blur-sm border border-green-200 rounded-2xl text-green-700 text-xs flex gap-2 items-start">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <div>
                            <p className="font-semibold">Booking Confirmed!</p>
                            <p>Redirecting to your bookings...</p>
                          </div>
                        </div>
                      )}

                      <div className="p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border border-orange-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-600">Estimated Total</p>
                            <p className="text-xl font-extrabold text-orange-600">
                              {formatPkr(discountedPricePerHour * getHoursDiff())}
                            </p>
                            {isProClient && (
                              <p className="text-[11px] text-gray-500 mt-1">
                                <span className="line-through">{formatPkr(pricePerHour * getHoursDiff())}</span>
                                <span className="ml-2 font-semibold text-green-700">20% off (PRO discount)</span>
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-600">Hours</p>
                            <p className="text-sm font-bold text-gray-900">{getHoursDiff().toFixed(1)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2">
                        <h4 className="text-sm font-extrabold text-gray-900">Date & Time</h4>
                        <p className="text-xs text-gray-600">Select your preferred schedule</p>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          <Calendar className="w-3 h-3 inline mr-1 text-orange-500" />
                          Date
                        </label>
                        <input
                          type="date"
                          value={bookingData.date}
                          onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                          className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-sm"
                          required
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Start Time
                          </label>
                          <input
                            type="time"
                            value={bookingData.startTime}
                            onChange={(e) => setBookingData({ ...bookingData, startTime: e.target.value })}
                            className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-sm"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            End Time
                          </label>
                          <input
                            type="time"
                            value={bookingData.endTime}
                            onChange={(e) => setBookingData({ ...bookingData, endTime: e.target.value })}
                            className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-sm"
                            required
                          />
                        </div>
                      </div>

                      <div className="pt-2">
                        <h4 className="text-sm font-extrabold text-gray-900">Location</h4>
                        <p className="text-xs text-gray-600">Where the chef should arrive</p>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          <MapPin className="w-3 h-3 inline mr-1 text-red-500" />
                          Location
                        </label>
                        <input
                          type="text"
                          value={bookingData.location}
                          onChange={(e) => setBookingData({ ...bookingData, location: e.target.value })}
                          className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-sm"
                          placeholder="Enter your address"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          <ChefHat className="w-3 h-3 inline mr-1 text-yellow-500" />
                          Cuisine Type
                        </label>
                        <input
                          type="text"
                          value={bookingData.cuisineType}
                          onChange={(e) => setBookingData({ ...bookingData, cuisineType: e.target.value })}
                          className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-sm"
                          placeholder="e.g., Italian, French, Thai..."
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          <Sparkles className="w-3 h-3 inline mr-1 text-orange-500" />
                          Primary Dish
                        </label>
                        <select
                          value={bookingData.primaryDish}
                          onChange={(e) => setBookingData({ ...bookingData, primaryDish: e.target.value })}
                          className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-sm"
                        >
                          <option value="">Select dish (optional)</option>
                          {PAKISTANI_DISHES.map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {['Biryani', 'Chicken Karahi', 'Nihari'].map((d) => (
                            <button
                              key={d}
                              type="button"
                              onClick={() => setBookingData({ ...bookingData, primaryDish: d })}
                              className={`px-3 py-1 rounded-full text-[11px] font-semibold border shadow-sm transition-all duration-200 ${
                                bookingData.primaryDish === d
                                  ? 'bg-orange-500 text-white border-orange-500'
                                  : 'bg-white/70 text-gray-700 border-gray-200 hover:border-orange-300'
                              }`}
                            >
                              {d}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Dishes (multiple)
                        </label>
                        <div className="bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm p-3 max-h-40 overflow-auto">
                          <div className="grid grid-cols-1 gap-2">
                            {PAKISTANI_DISHES.map((dish) => {
                              const checked = bookingData.dishes.includes(dish);
                              return (
                                <button
                                  key={dish}
                                  type="button"
                                  onClick={() => toggleDish(dish)}
                                  className={`text-left px-3 py-2 rounded-lg border transition-all duration-200 ${
                                    checked
                                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-orange-400'
                                      : 'bg-white/70 text-gray-800 border-gray-200 hover:border-orange-300'
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <span className="text-xs font-semibold">{dish}</span>
                                    <span className={`text-[10px] font-bold ${checked ? 'text-white' : 'text-gray-400'}`}>
                                      {checked ? 'Selected' : ''}
                                    </span>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Number of Dishes
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={bookingData.numberOfDishes}
                          onChange={(e) => setBookingData({ ...bookingData, numberOfDishes: parseInt(e.target.value) || 1 })}
                          className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-sm"
                        />
                      </div>

                      <div className="pt-2">
                        <h4 className="text-sm font-extrabold text-gray-900">Special Requests</h4>
                        <p className="text-xs text-gray-600">Dietary preferences, spice level, allergies, etc.</p>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Special Requests
                        </label>
                        <textarea
                          value={bookingData.specialRequests}
                          onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })}
                          className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 text-sm resize-none"
                          placeholder="Any dietary restrictions, preferences, or special requests..."
                          rows={2}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={bookingLoading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none text-sm"
                      >
                        {bookingLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Creating Booking...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Confirm Booking
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </>
              ) : (
                <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border border-orange-200">
                  <Users className="w-10 h-10 text-orange-500 mx-auto mb-2" />
                  <p className="text-gray-600 mb-2 text-sm">
                    {user ? 'Only clients can book chefs' : 'Please log in as a client to book this chef'}
                  </p>
                  {!user && (
                    <button
                      onClick={() => navigate('/login')}
                      className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 text-sm"
                    >
                      Login to Book
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
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