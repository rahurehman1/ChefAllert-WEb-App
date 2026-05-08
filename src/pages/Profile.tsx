import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { ProfilePictureUpload } from '../components/ProfilePictureUpload';
import { AlertCircle, CheckCircle, Save, User, Mail, Phone, MapPin, Building, Navigation, Shield, Zap } from 'lucide-react';

export function Profile() {
  const { user, updateUser, refreshUser } = useAuth(); // ✅ refreshUser ko import karo
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    setFormData({
      full_name: user.full_name || '',
      phone_number: user.phone_number || '',
      address: user.address || '',
      city: user.city || '',
      state: user.state || '',
      zip_code: user.zip_code || '',
    });
    setLoading(false);
    setTimeout(() => setIsVisible(true), 100);
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.put('/api/auth/profile', {
        ...formData,
        updated_at: new Date().toISOString(),
      });

      if (response.data.error) throw new Error(response.data.error);
      
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 5000);
      
      // Update user context
      if (response.data.user && updateUser) {
        updateUser(response.data.user);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving profile');
    } finally {
      setSaving(false);
    }
  };

  const handleProfilePictureSuccess = (newPictureUrl: string | null) => {
    // AuthContext already handles the update, so just show success message
    setSuccess(newPictureUrl ? 'Profile picture updated!' : 'Profile picture removed!');
    setTimeout(() => setSuccess(''), 3000);
    
    // Optional: Refresh page data
    fetchUserProfile();
  };

  const fetchUserProfile = async () => {
    if (refreshUser) {
      await refreshUser();
    }
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
                <div className="h-6 bg-gray-200 rounded w-32"></div>
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
            <div className="p-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl shadow-2xl">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                My Profile
              </h1>
              <p className="text-xl text-gray-600 mt-4 max-w-2xl mx-auto">
                Manage your personal information and account details
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
          {/* User Header with Profile Picture */}
          <div className="flex flex-col md:flex-row items-center gap-6 mb-8 pb-8 border-b border-gray-200/50">
            <div className="flex-shrink-0">
              <ProfilePictureUpload 
                currentPicture={user?.profile_picture_url || null}
                onUploadSuccess={handleProfilePictureSuccess}
                size="lg"
              />
            </div>
            
            <div className="flex-1 text-center md:text-left mt-4 md:mt-0">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <h2 className="text-3xl font-bold text-gray-900">{user?.full_name || 'User'}</h2>
                {user?.role === 'client' && (user as any)?.is_pro && (
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg">
                    PRO
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-gray-600 mb-3 justify-center md:justify-start">
                <Mail className="w-5 h-5 text-orange-500" />
                <span className="text-lg">{user?.email}</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 rounded-xl text-sm font-semibold shadow-sm border border-orange-200">
                <Shield className="w-4 h-4" />
                {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''}
              </div>
            </div>
          </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-100 rounded-xl">
                <User className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Personal Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-orange-500" />
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 hover:shadow-xl"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-red-500" />
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 hover:shadow-xl"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-500" />
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={user?.email || ''}
                    readOnly
                    className="w-full pl-12 pr-4 py-4 bg-gray-50/80 border border-gray-200 rounded-2xl shadow-sm text-gray-600 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>

            {/* Address Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-red-100 rounded-xl">
                  <MapPin className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Address Information</h3>
              </div>

              <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-500" />
                Street Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300 hover:shadow-xl"
                  placeholder="Enter your street address"
                />
              </div>
            </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Building className="w-4 h-4 text-orange-500" />
                    City
                  </label>
                  <div className="relative">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-4 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 hover:shadow-xl"
                      placeholder="City"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-yellow-500" />
                    State
                  </label>
                  <div className="relative">
                    <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-4 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 hover:shadow-xl"
                      placeholder="State"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    Zip Code
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="zip_code"
                      value={formData.zip_code}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-4 bg-white/60 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 hover:shadow-xl"
                      placeholder="Zip Code"
                    />
                  </div>
                </div>
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
                  <span>Save Profile Changes</span>
                  <Zap className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security Note */}
        <div className={`text-center mt-8 transition-all duration-1000 delay-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
            <Shield className="w-4 h-4 text-green-500" />
            Your information is securely encrypted and protected
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