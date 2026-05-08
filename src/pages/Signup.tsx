import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  AlertCircle, CheckCircle, ChefHat, User, Mail, Lock, Users, Sparkles, Zap, Crown,
  Utensils, Pizza, Coffee, Soup, Cake, Wine, Beef, Sandwich, Apple
} from 'lucide-react';

export function Signup() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'client',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);
  const { signUp, user } = useAuth();
  const navigate = useNavigate();

  // High-quality food background images
  const foodBackgrounds = [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1920&q=80',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1920&q=80',
    'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=1920&q=80',
    'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=1920&q=80',
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1920&q=80',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1920&q=80',
    'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=1920&q=80',
  ];

  // Cycle background every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % foodBackgrounds.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Generate falling food icons
  const [fallingItems] = useState(() => {
    const icons = [Utensils, Pizza, Coffee, Soup, Cake, Wine, Beef, Sandwich, Apple];
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      Icon: icons[Math.floor(Math.random() * icons.length)],
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 10}s`,
      duration: `${8 + Math.random() * 12}s`,
      size: 20 + Math.floor(Math.random() * 36),
      rotate: Math.random() * 360,
    }));
  });

  useEffect(() => {
    setIsVisible(true);
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : user.role === 'chef' ? '/chef-profile' : '/browse-chefs');
    }
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await signUp(
        formData.email,
        formData.password,
        formData.fullName,
        formData.role as 'client' | 'chef' | 'admin'
      );
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  const RoleCard = ({ value, label, description, icon: Icon, selected, onChange }: any) => (
    <label className={`block cursor-pointer transition-all duration-300 transform hover:scale-105 ${
      selected ? 'scale-105' : ''
    }`}>
      <input
        type="radio"
        name="role"
        value={value}
        checked={selected}
        onChange={onChange}
        className="hidden"
      />
      <div className={`p-6 border-2 rounded-2xl transition-all duration-300 ${
        selected
          ? 'border-orange-500 bg-gradient-to-r from-orange-50 to-red-50 shadow-lg'
          : 'border-gray-200 bg-white/50 backdrop-blur-sm hover:border-orange-300 hover:shadow-md'
      }`}>
        <div className="flex items-center gap-4 mb-3">
          <div className={`p-3 rounded-xl transition-all duration-300 ${
            selected
              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
              : 'bg-gray-100 text-gray-600'
          }`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{label}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
        {selected && (
          <div className="absolute -top-2 -right-2">
            <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
          </div>
        )}
      </div>
    </label>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background Slideshow */}
      <div className="fixed inset-0 -z-10">
        {foodBackgrounds.map((img, idx) => (
          <div
            key={img}
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
            style={{
              backgroundImage: `url(${img})`,
              opacity: idx === bgIndex ? 0.2 : 0,
            }}
          />
        ))}
        {/* Dark overlay for text contrast */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Falling Food Icons */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-5">
        {fallingItems.map(({ id, Icon, left, delay, duration, size, rotate }) => (
          <div
            key={id}
            className="absolute text-orange-400/20 animate-fall"
            style={{
              left,
              top: '-10%',
              animationDelay: delay,
              animationDuration: duration,
              fontSize: size,
              transform: `rotate(${rotate}deg)`,
            }}
          >
            <Icon size={size} />
          </div>
        ))}
      </div>

      {/* Animated Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/3 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Signup Form Card */}
      <div className={`relative z-10 w-full max-w-2xl transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        {/* Card with Animated Gradient Border */}
        <div className="relative group">
          {/* Animated Gradient Border */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 rounded-3xl blur opacity-75 group-hover:opacity-100 animate-gradient-xy transition duration-1000"></div>
          
          {/* Main Card Content */}
          <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-600 p-8 text-white text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10 animate-shimmer"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm animate-bounce-subtle">
                    <ChefHat className="w-8 h-8" />
                  </div>
                  <h1 className="text-4xl font-bold">Join Chef Alert</h1>
                </div>
                <p className="text-orange-100 text-lg">Create your account and start your culinary journey</p>
              </div>
              
              {/* Floating food icons in header */}
              <div className="absolute top-2 left-2 text-white/10 animate-float">
                <Pizza size={24} />
              </div>
              <div className="absolute bottom-2 right-2 text-white/10 animate-float-delayed">
                <Coffee size={24} />
              </div>
            </div>

            {/* Form */}
            <div className="p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3 animate-shake">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-700 font-medium">Registration Error</p>
                    <p className="text-red-600 text-sm mt-1">{error}</p>
                  </div>
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex gap-3 animate-bounce-subtle">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-green-700 font-medium">Success!</p>
                    <p className="text-green-600 text-sm mt-1">Account created! Redirecting to login...</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="group">
                    <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <User className="w-4 h-4 text-orange-600" />
                      Full Name
                    </label>
                    <div className="relative">
                      <input
                        id="fullName"
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="w-full px-12 py-4 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 hover:shadow-xl"
                        placeholder="Enter your name"
                        required
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <User className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors duration-300" />
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="group">
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-orange-600" />
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-12 py-4 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 hover:shadow-xl"
                        placeholder="you@example.com"
                        required
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <Mail className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors duration-300" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Role Selection */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-orange-600" />
                    I want to join as a...
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <RoleCard
                      value="client"
                      label="Client"
                      description="Book amazing chefs for your events"
                      icon={User}
                      selected={formData.role === 'client'}
                      onChange={handleChange}
                    />
                    <RoleCard
                      value="chef"
                      label="Professional Chef"
                      description="Showcase your culinary skills"
                      icon={Crown}
                      selected={formData.role === 'chef'}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Password */}
                  <div className="group">
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-orange-600" />
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-12 pr-12 py-4 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 hover:shadow-xl"
                        placeholder="••••••••"
                        required
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <Lock className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors duration-300" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      >
                        {showPassword ? <Lock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="group">
                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-orange-600" />
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full px-12 pr-12 py-4 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 hover:shadow-xl"
                        placeholder="••••••••"
                        required
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <Lock className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-colors duration-300" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      >
                        {showConfirmPassword ? <Lock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Password Requirements */}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <p className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Password Requirements:
                  </p>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li className={`flex items-center gap-2 transition-all duration-300 ${formData.password.length >= 6 ? 'text-green-600' : ''}`}>
                      <div className={`w-2 h-2 rounded-full transition-all duration-300 ${formData.password.length >= 6 ? 'bg-green-500 scale-125' : 'bg-blue-400'}`}></div>
                      At least 6 characters long
                      {formData.password.length >= 6 && (
                        <CheckCircle className="w-3 h-3 text-green-500 ml-1" />
                      )}
                    </li>
                    <li className={`flex items-center gap-2 transition-all duration-300 ${formData.password === formData.confirmPassword && formData.confirmPassword ? 'text-green-600' : ''}`}>
                      <div className={`w-2 h-2 rounded-full transition-all duration-300 ${formData.password === formData.confirmPassword && formData.confirmPassword ? 'bg-green-500 scale-125' : 'bg-blue-400'}`}></div>
                      Passwords must match
                      {formData.password === formData.confirmPassword && formData.confirmPassword && (
                        <CheckCircle className="w-3 h-3 text-green-500 ml-1" />
                      )}
                    </li>
                  </ul>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || success}
                  className="w-full group relative bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-4 rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-300 overflow-hidden"
                >
                  <div className="relative z-10 flex items-center justify-center gap-3">
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating Account...</span>
                      </>
                    ) : success ? (
                      <>
                        <CheckCircle className="w-5 h-5 animate-bounce-subtle" />
                        <span>Account Created Successfully!</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span>Create Your Account</span>
                      </>
                    )}
                  </div>
                  
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Sparkle effect */}
                  <Sparkles className="absolute top-2 right-4 w-4 h-4 text-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white/80 text-gray-500 font-medium">Already have an account?</span>
                </div>
              </div>

              {/* Login Link */}
              <div className="text-center">
                <Link 
                  to="/login" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-orange-500 text-orange-600 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 hover:bg-orange-50"
                >
                  <User className="w-5 h-5" />
                  Sign In to Existing Account
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-6">
          <p className="text-gray-600 text-sm">
            By creating an account, you agree to our{' '}
            <a href="#" className="text-orange-600 hover:text-orange-700 font-medium underline transition-colors duration-300">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-orange-600 hover:text-orange-700 font-medium underline transition-colors duration-300">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>

      {/* Animations CSS */}
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

        @keyframes gradient-xy {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes fall {
          0% {
            transform: translateY(-10vh) rotate(0deg);
            opacity: 0.2;
          }
          100% {
            transform: translateY(110vh) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes bounce-subtle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(5deg);
          }
        }

        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(-5deg);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-5px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(5px);
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

        .animate-gradient-xy {
          background-size: 200% 200%;
          animation: gradient-xy 3s ease infinite;
        }

        .animate-fall {
          animation: fall 15s linear infinite;
        }

        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 4s ease-in-out infinite;
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}