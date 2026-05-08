import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { ProfilePictureUpload } from '../components/ProfilePictureUpload';
import { AlertCircle, CheckCircle, Save, ChefHat, Star, Clock, DollarSign, Award, Sparkles, Zap, TrendingUp, Users, Calendar, Mail } from 'lucide-react';
import { PAKISTANI_DISHES } from '../data/pakistaniDishes';

export function ChefProfile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [chefProfile, setChefProfile] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    experience_years: '0',
    price_per_hour: '0',
    availability_start_time: '08:00',
    availability_end_time: '22:00',
    specializations: '',
    specialties: [] as string[],
    certifications: '',
  });

  const formatPkr = (amount: number) => {
    return 'Rs ' + amount.toLocaleString('en-PK');
  };

  const toggleSpecialty = (dish: string) => {
    setFormData(prev => {
      const exists = prev.specialties.includes(dish);
      return {
        ...prev,
        specialties: exists ? prev.specialties.filter(d => d !== dish) : [...prev.specialties, dish]
      };
    });
  };

  useEffect(() => {
    if (!user || user.role !== 'chef') {
      navigate('/');
      return;
    }
    fetchChefProfile();
    setTimeout(() => setIsVisible(true), 100);
  }, [user, navigate]);

  const fetchChefProfile = async () => {
    try {
      console.log('🔍 Fetching chef profile...');
      
      const response = await api.get('/api/chefs/profile/me');
      
      console.log('✅ Chef profile response:', response.data);
      
      if (response.data) {
        setChefProfile(response.data);
        
        setFormData({
          bio: response.data.bio || '',
          experience_years: response.data.experience_years || 0,
          price_per_hour: (response.data.price_per_hour || 0).toString(),
          availability_start_time: response.data.availability_start_time || '08:00',
          availability_end_time: response.data.availability_end_time || '22:00',
          specializations: response.data.specializations || '',
          specialties: Array.isArray(response.data.specialties) ? response.data.specialties : [],
          certifications: response.data.certifications || '',
        });
      }
    } catch (err: any) {
      console.error('❌ Error loading chef profile:', err);
      
      try {
        console.log('🔄 Trying fallback endpoint...');
        const fallbackResponse = await api.get('/api/chefs/profile');
        
        if (fallbackResponse.data) {
          setChefProfile(fallbackResponse.data);
          
          setFormData({
            bio: fallbackResponse.data.bio || '',
            experience_years: fallbackResponse.data.experience_years || 0,
            price_per_hour: (fallbackResponse.data.price_per_hour || 0).toString(),
            availability_start_time: fallbackResponse.data.availability_start_time || '08:00',
            availability_end_time: fallbackResponse.data.availability_end_time || '22:00',
            specializations: fallbackResponse.data.specializations || '',
            specialties: Array.isArray(fallbackResponse.data.specialties) ? fallbackResponse.data.specialties : [],
            certifications: fallbackResponse.data.certifications || '',
          });
        }
      } catch (fallbackErr) {
        console.error('❌ Fallback also failed:', fallbackErr);
        setError(err.response?.data?.message || err.message || 'Error loading profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'experience_years' || name === 'price_per_hour' 
        ? (value === '' ? '0' : value)
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      console.log('📝 Submitting chef profile update...', formData);
      
      const response = await api.put('/api/chefs/profile', {
        ...formData,
        price_per_hour: parseFloat(formData.price_per_hour) || 0,
        updated_at: new Date().toISOString(),
      });

      console.log('✅ Update response:', response.data);
      
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      
      setSuccess('Profile updated successfully!');
      
      // Refresh profile data
      fetchChefProfile();
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      console.error('❌ Error saving profile:', err);
      
      if (err.response?.status === 403) {
        setError('Access denied. Only chefs can update profile.');
      } else if (err.response?.status === 401) {
        setError('Please login to update profile');
        navigate('/login');
      } else {
        setError(err.response?.data?.message || err.message || 'Error saving profile');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleProfilePictureSuccess = (newPictureUrl: string | null) => {
    if (updateUser && user) {
      updateUser({
        ...user,
        profile_picture_url: newPictureUrl
      });
    }
    setSuccess(newPictureUrl ? 'Profile picture updated!' : 'Profile picture removed!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const LoadingSkeleton = () => (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 pt-20 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 w-full">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded-2xl w-64 mb-8"></div>
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-200/50">
              <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
              <div className="space-y-3 flex-1">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="flex gap-4">
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-12 bg-gray-200 rounded-xl"></div>
                </div>
              ))}
              <div className="h-14 bg-gray-200 rounded-xl mt-8"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 pt-20">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="p-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl shadow-2xl">
              <ChefHat className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Chef Profile
              </h1>
              <p className="text-xl text-gray-600 mt-4 max-w-2xl mx-auto">
                Showcase your culinary expertise and attract amazing clients
              </p>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className={`space-y-4 mb-8 transition-all duration-1000 delay-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          {error && (
            <div className="p-6 bg-red-50/80 backdrop-blur-lg border border-red-200 rounded-2xl shadow-lg flex gap-4 items-start transform hover:scale-105 transition-all duration-300">
              <div className="p-2 bg-red-100 rounded-xl">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-800 text-lg mb-1">Update Failed</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="p-6 bg-green-50/80 backdrop-blur-lg border border-green-200 rounded-2xl shadow-lg flex gap-4 items-start transform hover:scale-105 transition-all duration-300">
              <div className="p-2 bg-green-100 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-green-800 text-lg mb-1">Success!</h3>
                <p className="text-green-700">{success}</p>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
            </div>
          )}
        </div>

        {/* Profile Card */}
        <div className={`bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20 transition-all duration-1000 delay-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          {/* Chef Header with Profile Picture */}
          <div className="flex flex-col md:flex-row items-center gap-6 mb-8 pb-8 border-b border-gray-200/50">
            <div className="flex-shrink-0">
              <ProfilePictureUpload 
                currentPicture={user?.profile_picture_url || null}
                onUploadSuccess={handleProfilePictureSuccess}
                size="lg"
              />
            </div>
            
            <div className="flex-1 text-center md:text-left mt-4 md:mt-0">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{user?.full_name || 'Professional Chef'}</h2>
              <div className="flex items-center gap-3 text-gray-600 mb-4 justify-center md:justify-start">
                <Mail className="w-5 h-5 text-blue-500" />
                <span className="text-lg">{user?.email}</span>
              </div>
              {chefProfile && (
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-100 to-yellow-50 px-4 py-2 rounded-xl border border-yellow-200">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <span className="font-bold text-gray-900 text-lg">
                      {chefProfile.rating?.toFixed(1) || '0.0'}
                    </span>
                    <span className="text-gray-600 text-sm">rating</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gradient-to-r from-blue-100 to-blue-50 px-4 py-2 rounded-xl border border-blue-200">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    <span className="font-bold text-gray-900 text-lg">
                      {chefProfile.total_reviews || 0}
                    </span>
                    <span className="text-gray-600 text-sm">reviews</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gradient-to-r from-orange-100 to-orange-50 px-4 py-2 rounded-xl border border-orange-200">
                    <Award className="w-5 h-5 text-orange-500" />
                    <span className="font-bold text-gray-900 text-lg">
                      {Array.isArray(formData.specialties) ? formData.specialties.length : 0}
                    </span>
                    <span className="text-gray-600 text-sm">specialties</span>
                  </div>
                  {chefProfile.price_per_hour && (
                    <div className="flex items-center gap-2 bg-gradient-to-r from-green-100 to-green-50 px-4 py-2 rounded-xl border border-green-200">
                      <DollarSign className="w-5 h-5 text-green-500" />
                      <span className="font-bold text-gray-900 text-lg">
                        {formatPkr(chefProfile.price_per_hour || 0)}
                      </span>
                      <span className="text-gray-600 text-sm">/hour</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Bio Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">About You</h3>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Professional Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-4 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 hover:shadow-xl resize-none"
                  placeholder="Tell clients about your culinary journey, philosophy, and what makes your service special..."
                />
              </div>
            </div>

            {/* Experience & Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Experience</h3>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    name="experience_years"
                    min="0"
                    max="50"
                    value={formData.experience_years}
                    onChange={handleChange}
                    className="w-full px-4 py-4 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:shadow-xl"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-xl">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Pricing</h3>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Price Per Hour (PKR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold">Rs</span>
                    <input
                      type="number"
                      name="price_per_hour"
                      min="0"
                      step="0.01"
                      value={formData.price_per_hour}
                      onChange={handleChange}
                      className="w-full pl-14 pr-4 py-4 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 hover:shadow-xl"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-xl">
                  <Calendar className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Availability</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Start Time
                  </label>
                  <input
                    type="time"
                    name="availability_start_time"
                    value={formData.availability_start_time}
                    onChange={handleChange}
                    className="w-full px-4 py-4 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 hover:shadow-xl"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    End Time
                  </label>
                  <input
                    type="time"
                    name="availability_end_time"
                    value={formData.availability_end_time}
                    onChange={handleChange}
                    className="w-full px-4 py-4 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 hover:shadow-xl"
                  />
                </div>
              </div>
            </div>

            {/* Specializations */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-xl">
                  <Award className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Specializations</h3>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Cuisine Specialties (comma-separated)
                </label>
                <textarea
                  name="specializations"
                  value={formData.specializations}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-4 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 hover:shadow-xl resize-none"
                  placeholder="e.g., Italian, French, Thai, Vegan, Gluten-Free..."
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Pakistani Dishes (select multiple)
                </label>
                <div className="bg-white/50 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg p-4 max-h-56 overflow-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {PAKISTANI_DISHES.map((dish) => {
                      const checked = formData.specialties.includes(dish);
                      return (
                        <button
                          key={dish}
                          type="button"
                          onClick={() => toggleSpecialty(dish)}
                          className={`text-left px-3 py-2 rounded-xl border transition-all duration-200 ${
                            checked
                              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-orange-400 shadow'
                              : 'bg-white/70 text-gray-800 border-gray-200 hover:border-orange-300'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-semibold">{dish}</span>
                            <span className={`text-xs font-bold ${checked ? 'text-white' : 'text-gray-400'}`}>
                              {checked ? 'Selected' : ''}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <p className="text-xs text-gray-500">These dishes will be used in client search to show you as a top match.</p>
              </div>
            </div>

            {/* Certifications */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-xl">
                  <Award className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Certifications</h3>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Professional Certifications (optional)
                </label>
                <textarea
                  name="certifications"
                  value={formData.certifications}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-4 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 hover:shadow-xl resize-none"
                  placeholder="List your professional certifications, awards, or recognitions..."
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  <span>Update Chef Profile</span>
                  <Zap className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Profile Tips */}
        <div className={`text-center mt-8 transition-all duration-1000 delay-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-500" />
            Complete profiles receive 3x more booking requests
          </p>
        </div>
      </div>

      {/* Add custom animations */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
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