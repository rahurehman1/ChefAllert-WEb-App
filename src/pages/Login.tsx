import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  AlertCircle, ChefHat, Eye, EyeOff, Sparkles, Zap, Lock, Mail, 
  UtensilsCrossed, Pizza, Coffee, Croissant, Sandwich, Flame,
  ChefHat as ChefIcon
} from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : user.role === 'chef' ? '/chef-profile' : '/browse-chefs');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      setTimeout(() => {
        navigate('/');
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-amber-50 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      
      {/* Floating Food Images Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        
        {/* Row 1: Italian Specialties */}
        <div className="absolute animate-float-slow" style={{ top: '2%', left: '1%' }}>
          <div className="relative w-32 h-32 md:w-40 md:h-40 rotate-12 hover:rotate-45 transition-transform duration-1000">
            <img 
              src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=200&fit=crop" 
              alt="Margherita Pizza"
              className="w-full h-full object-cover rounded-2xl shadow-2xl opacity-30 hover:opacity-50 transition-opacity duration-500"
            />
            <div className="absolute inset-0 bg-orange-500 rounded-2xl mix-blend-overlay"></div>
          </div>
        </div>

        <div className="absolute animate-float" style={{ top: '8%', right: '2%' }}>
          <div className="relative w-28 h-28 md:w-36 md:h-36 -rotate-6 hover:rotate-0 transition-transform duration-700">
            <img 
              src="https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=200&h=200&fit=crop" 
              alt="Pepperoni Pizza"
              className="w-full h-full object-cover rounded-2xl shadow-2xl opacity-30 hover:opacity-50 transition-opacity duration-500"
            />
            <div className="absolute inset-0 bg-red-500 rounded-2xl mix-blend-overlay"></div>
          </div>
        </div>

        {/* Row 2: Burgers & Fast Food */}
        <div className="absolute animate-float-delayed" style={{ top: '15%', left: '5%' }}>
          <div className="relative w-28 h-28 md:w-36 md:h-36 rotate-45 hover:rotate-90 transition-transform duration-1000">
            <img 
              src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop" 
              alt="Classic Burger"
              className="w-full h-full object-cover rounded-2xl shadow-2xl opacity-30 hover:opacity-50 transition-opacity duration-500"
            />
            <div className="absolute inset-0 bg-red-500 rounded-2xl mix-blend-overlay"></div>
          </div>
        </div>

        <div className="absolute animate-float-slow" style={{ top: '22%', right: '8%' }}>
          <div className="relative w-32 h-32 md:w-40 md:h-40 -rotate-12 hover:rotate-12 transition-transform duration-700">
            <img 
              src="https://images.unsplash.com/photo-1553979459-d22298657431?w=200&h=200&fit=crop" 
              alt="Cheeseburger"
              className="w-full h-full object-cover rounded-2xl shadow-2xl opacity-30 hover:opacity-50 transition-opacity duration-500"
            />
            <div className="absolute inset-0 bg-amber-500 rounded-2xl mix-blend-overlay"></div>
          </div>
        </div>

        {/* Row 3: Pasta Dishes */}
        <div className="absolute animate-float" style={{ top: '30%', left: '3%' }}>
          <div className="relative w-36 h-36 md:w-44 md:h-44 rotate-90 hover:rotate-180 transition-transform duration-1000">
            <img 
              src="https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=200&h=200&fit=crop" 
              alt="Spaghetti Pasta"
              className="w-full h-full object-cover rounded-2xl shadow-2xl opacity-30 hover:opacity-50 transition-opacity duration-500"
            />
            <div className="absolute inset-0 bg-yellow-500 rounded-2xl mix-blend-overlay"></div>
          </div>
        </div>

        <div className="absolute animate-float-delayed" style={{ top: '38%', right: '12%' }}>
          <div className="relative w-32 h-32 md:w-40 md:h-40 rotate-12 hover:rotate-45 transition-transform duration-700">
            <img 
              src="https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=200&h=200&fit=crop" 
              alt="Lasagna"
              className="w-full h-full object-cover rounded-2xl shadow-2xl opacity-30 hover:opacity-50 transition-opacity duration-500"
            />
            <div className="absolute inset-0 bg-orange-600 rounded-2xl mix-blend-overlay"></div>
          </div>
        </div>

        {/* Row 4: Asian Cuisine */}
        <div className="absolute animate-float-slow" style={{ top: '45%', left: '8%' }}>
          <div className="relative w-24 h-24 md:w-32 md:h-32 -rotate-12 hover:rotate-12 transition-transform duration-700">
            <img 
              src="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=200&h=200&fit=crop" 
              alt="Sushi Platter"
              className="w-full h-full object-cover rounded-2xl shadow-2xl opacity-30 hover:opacity-50 transition-opacity duration-500"
            />
            <div className="absolute inset-0 bg-green-500 rounded-2xl mix-blend-overlay"></div>
          </div>
        </div>

        <div className="absolute animate-float" style={{ top: '52%', right: '4%' }}>
          <div className="relative w-28 h-28 md:w-36 md:h-36 rotate-45 hover:rotate-90 transition-transform duration-1000">
            <img 
              src="https://images.unsplash.com/photo-1617196035154-1e7e6e28b0db?w=200&h=200&fit=crop" 
              alt="Ramen Noodles"
              className="w-full h-full object-cover rounded-2xl shadow-2xl opacity-30 hover:opacity-50 transition-opacity duration-500"
            />
            <div className="absolute inset-0 bg-red-400 rounded-2xl mix-blend-overlay"></div>
          </div>
        </div>

        {/* Row 5: Healthy Options */}
        <div className="absolute animate-float-delayed" style={{ top: '60%', left: '2%' }}>
          <div className="relative w-32 h-32 md:w-40 md:h-40 rotate-90 hover:rotate-180 transition-transform duration-1000">
            <img 
              src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&h=200&fit=crop" 
              alt="Fresh Salad"
              className="w-full h-full object-cover rounded-2xl shadow-2xl opacity-30 hover:opacity-50 transition-opacity duration-500"
            />
            <div className="absolute inset-0 bg-lime-500 rounded-2xl mix-blend-overlay"></div>
          </div>
        </div>

        <div className="absolute animate-float-slow" style={{ top: '68%', right: '6%' }}>
          <div className="relative w-28 h-28 md:w-36 md:h-36 -rotate-6 hover:rotate-0 transition-transform duration-700">
            <img 
              src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop" 
              alt="Buddha Bowl"
              className="w-full h-full object-cover rounded-2xl shadow-2xl opacity-30 hover:opacity-50 transition-opacity duration-500"
            />
            <div className="absolute inset-0 bg-emerald-500 rounded-2xl mix-blend-overlay"></div>
          </div>
        </div>

        {/* Row 6: Mexican Food */}
        <div className="absolute animate-float" style={{ top: '75%', left: '12%' }}>
          <div className="relative w-28 h-28 md:w-36 md:h-36 rotate-12 hover:rotate-45 transition-transform duration-700">
            <img 
              src="https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=200&h=200&fit=crop" 
              alt="Tacos"
              className="w-full h-full object-cover rounded-2xl shadow-2xl opacity-30 hover:opacity-50 transition-opacity duration-500"
            />
            <div className="absolute inset-0 bg-orange-500 rounded-2xl mix-blend-overlay"></div>
          </div>
        </div>

        <div className="absolute animate-float-delayed" style={{ top: '82%', right: '10%' }}>
          <div className="relative w-32 h-32 md:w-40 md:h-40 -rotate-45 hover:rotate-0 transition-transform duration-1000">
            <img 
              src="https://images.unsplash.com/photo-1613514785940-daed07799d9b?w=200&h=200&fit=crop" 
              alt="Burrito"
              className="w-full h-full object-cover rounded-2xl shadow-2xl opacity-30 hover:opacity-50 transition-opacity duration-500"
            />
            <div className="absolute inset-0 bg-amber-600 rounded-2xl mix-blend-overlay"></div>
          </div>
        </div>

        {/* Row 7: Desserts */}
        <div className="absolute animate-float-slow" style={{ top: '12%', left: '15%' }}>
          <div className="relative w-24 h-24 md:w-32 md:h-32 -rotate-12 hover:rotate-12 transition-transform duration-700">
            <img 
              src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&h=200&fit=crop" 
              alt="Chocolate Cake"
              className="w-full h-full object-cover rounded-2xl shadow-2xl opacity-30 hover:opacity-50 transition-opacity duration-500"
            />
            <div className="absolute inset-0 bg-pink-500 rounded-2xl mix-blend-overlay"></div>
          </div>
        </div>

        <div className="absolute animate-float" style={{ top: '25%', left: '20%' }}>
          <div className="relative w-28 h-28 md:w-36 md:h-36 rotate-45 hover:rotate-90 transition-transform duration-700">
            <img 
              src="https://images.unsplash.com/photo-1551024506-0bccd828d307?w=200&h=200&fit=crop" 
              alt="Ice Cream"
              className="w-full h-full object-cover rounded-2xl shadow-2xl opacity-30 hover:opacity-50 transition-opacity duration-500"
            />
            <div className="absolute inset-0 bg-purple-500 rounded-2xl mix-blend-overlay"></div>
          </div>
        </div>

        {/* Row 8: Breakfast Items */}
        <div className="absolute animate-float-delayed" style={{ top: '35%', left: '25%' }}>
          <div className="relative w-20 h-20 md:w-28 md:h-28 rotate-45 hover:rotate-90 transition-transform duration-700">
            <img 
              src="https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=200&h=200&fit=crop" 
              alt="Coffee"
              className="w-full h-full object-cover rounded-2xl shadow-2xl opacity-30 hover:opacity-50 transition-opacity duration-500"
            />
            <div className="absolute inset-0 bg-amber-500 rounded-2xl mix-blend-overlay"></div>
          </div>
        </div>

        <div className="absolute animate-float-slow" style={{ top: '42%', right: '18%' }}>
          <div className="relative w-24 h-24 md:w-32 md:h-32 -rotate-12 hover:rotate-12 transition-transform duration-700">
            <img 
              src="https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=200&h=200&fit=crop" 
              alt="Pancakes"
              className="w-full h-full object-cover rounded-2xl shadow-2xl opacity-30 hover:opacity-50 transition-opacity duration-500"
            />
            <div className="absolute inset-0 bg-yellow-400 rounded-2xl mix-blend-overlay"></div>
          </div>
        </div>

        {/* Row 9: Seafood */}
        <div className="absolute animate-float" style={{ top: '55%', left: '22%' }}>
          <div className="relative w-32 h-32 md:w-40 md:h-40 rotate-12 hover:rotate-45 transition-transform duration-700">
            <img 
              src="https://images.unsplash.com/photo-1519996529938-82c4035b99c6?w=200&h=200&fit=crop" 
              alt="Fruit Bowl"
              className="w-full h-full object-cover rounded-2xl shadow-2xl opacity-30 hover:opacity-50 transition-opacity duration-500"
            />
            <div className="absolute inset-0 bg-purple-500 rounded-2xl mix-blend-overlay"></div>
          </div>
        </div>

        <div className="absolute animate-float-delayed" style={{ top: '62%', right: '22%' }}>
          <div className="relative w-28 h-28 md:w-36 md:h-36 -rotate-45 hover:rotate-0 transition-transform duration-1000">
            <img 
              src="https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=200&h=200&fit=crop" 
              alt="Grilled Salmon"
              className="w-full h-full object-cover rounded-2xl shadow-2xl opacity-30 hover:opacity-50 transition-opacity duration-500"
            />
            <div className="absolute inset-0 bg-red-600 rounded-2xl mix-blend-overlay"></div>
          </div>
        </div>

        {/* Row 10: Meat Dishes */}
        <div className="absolute animate-float-slow" style={{ bottom: '5%', left: '18%' }}>
          <div className="relative w-28 h-28 md:w-36 md:h-36 -rotate-45 hover:rotate-0 transition-transform duration-1000">
            <img 
              src="https://images.unsplash.com/photo-1546964124-0cce460f38ef?w=200&h=200&fit=crop" 
              alt="Grilled Steak"
              className="w-full h-full object-cover rounded-2xl shadow-2xl opacity-30 hover:opacity-50 transition-opacity duration-500"
            />
            <div className="absolute inset-0 bg-red-600 rounded-2xl mix-blend-overlay"></div>
          </div>
        </div>

        <div className="absolute animate-float" style={{ bottom: '12%', right: '15%' }}>
          <div className="relative w-32 h-32 md:w-40 md:h-40 rotate-12 hover:rotate-45 transition-transform duration-700">
            <img 
              src="https://images.unsplash.com/photo-1432139509613-5c4255815697?w=200&h=200&fit=crop" 
              alt="Roasted Chicken"
              className="w-full h-full object-cover rounded-2xl shadow-2xl opacity-30 hover:opacity-50 transition-opacity duration-500"
            />
            <div className="absolute inset-0 bg-amber-700 rounded-2xl mix-blend-overlay"></div>
          </div>
        </div>

        {/* Additional Floating Items - More Variety */}
        <div className="absolute animate-float-delayed" style={{ top: '18%', left: '30%' }}>
          <div className="relative w-22 h-22 md:w-30 md:h-30 rotate-90 hover:rotate-180 transition-transform duration-1000">
            <img 
              src="https://images.unsplash.com/photo-1607532941433-304659e8698a?w=200&h=200&fit=crop" 
              alt="Fresh Sushi Rolls"
              className="w-full h-full object-cover rounded-2xl shadow-2xl opacity-30 hover:opacity-50 transition-opacity duration-500"
            />
            <div className="absolute inset-0 bg-green-600 rounded-2xl mix-blend-overlay"></div>
          </div>
        </div>

        <div className="absolute animate-float-slow" style={{ top: '48%', left: '35%' }}>
          <div className="relative w-26 h-26 md:w-34 md:h-34 -rotate-12 hover:rotate-12 transition-transform duration-700">
            <img 
              src="https://images.unsplash.com/photo-1625937289531-1d6c371b4c8b?w=200&h=200&fit=crop" 
              alt="Gourmet Pizza"
              className="w-full h-full object-cover rounded-2xl shadow-2xl opacity-30 hover:opacity-50 transition-opacity duration-500"
            />
            <div className="absolute inset-0 bg-orange-400 rounded-2xl mix-blend-overlay"></div>
          </div>
        </div>

        <div className="absolute animate-float" style={{ top: '72%', left: '28%' }}>
          <div className="relative w-30 h-30 md:w-38 md:h-38 rotate-45 hover:rotate-90 transition-transform duration-700">
            <img 
              src="https://images.unsplash.com/photo-1585032226651-759b368d7246?w=200&h=200&fit=crop" 
              alt="Fresh Tacos"
              className="w-full h-full object-cover rounded-2xl shadow-2xl opacity-30 hover:opacity-50 transition-opacity duration-500"
            />
            <div className="absolute inset-0 bg-yellow-600 rounded-2xl mix-blend-overlay"></div>
          </div>
        </div>
      </div>

      {/* Animated Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        
        {/* Additional floating particles */}
        <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-orange-400 rounded-full opacity-20 animate-ping"></div>
        <div className="absolute top-3/4 right-1/4 w-6 h-6 bg-red-400 rounded-full opacity-20 animate-ping animation-delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-yellow-400 rounded-full opacity-20 animate-ping animation-delay-2000"></div>
        <div className="absolute top-2/3 left-2/3 w-5 h-5 bg-green-400 rounded-full opacity-20 animate-ping animation-delay-3000"></div>
        <div className="absolute bottom-1/3 right-1/3 w-4 h-4 bg-purple-400 rounded-full opacity-20 animate-ping animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <div className={`w-full max-w-md relative z-10 transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        
        {/* Header Card */}
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 overflow-hidden mb-8 transform hover:scale-105 transition-transform duration-500">
          
          {/* Food Pattern Overlay */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-repeat" style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f97316' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '30px 30px'
            }} />
          </div>

          <div className="bg-gradient-to-r from-orange-500 via-red-500 to-amber-600 p-8 text-white text-center relative overflow-hidden">
            
            {/* Floating Chef Hats */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-float-chef-hat"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${i * 0.3}s`,
                    opacity: 0.1
                  }}
                >
                  <ChefIcon className="w-6 h-6 text-white" />
                </div>
              ))}
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm animate-bounce-subtle">
                  <ChefHat className="w-8 h-8" />
                </div>
                <h1 className="text-4xl font-bold animate-pulse-slow">Welcome Back</h1>
              </div>
              <p className="text-orange-100 text-lg animate-fade-in-up">Sign in to your Chef Alert account</p>
            </div>

            {/* Animated Food Icons */}
            <div className="absolute -bottom-6 left-0 right-0 flex justify-center gap-6">
              <Pizza className="w-6 h-6 text-yellow-300 animate-bounce-subtle" />
              <Coffee className="w-6 h-6 text-amber-300 animate-bounce-subtle animation-delay-500" />
              <Croissant className="w-6 h-6 text-orange-300 animate-bounce-subtle animation-delay-1000" />
              <Sandwich className="w-6 h-6 text-red-300 animate-bounce-subtle animation-delay-1500" />
              <UtensilsCrossed className="w-6 h-6 text-green-300 animate-bounce-subtle animation-delay-2000" />
            </div>
          </div>

          <div className="p-8">
            {error && (
              <div className={`mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3 transition-all duration-500 transform ${
                error ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-4'
              }`}>
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5 animate-spin-slow" />
                <div>
                  <p className="text-red-700 font-medium">Authentication Error</p>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Email Field */}
              <div className="group animate-slide-in-left">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-orange-600 animate-bounce-subtle" />
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-12 py-4 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl shadow-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 hover:shadow-xl hover:border-orange-300 hover:scale-105 focus:scale-105"
                    placeholder="you@example.com"
                    required
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <Mail className="w-5 h-5 text-gray-400 group-hover:text-orange-500 group-hover:scale-110 transition-all duration-300" />
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div className="group animate-slide-in-right">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-orange-600 animate-bounce-subtle animation-delay-500" />
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-12 pr-12 py-4 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl shadow-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 hover:shadow-xl hover:border-orange-300 hover:scale-105 focus:scale-105"
                    placeholder="••••••••"
                    required
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <Lock className="w-5 h-5 text-gray-400 group-hover:text-orange-500 group-hover:scale-110 transition-all duration-300" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-all duration-200 hover:scale-110"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full group relative bg-gradient-to-r from-orange-500 via-red-500 to-amber-600 text-white font-bold py-4 rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-300 overflow-hidden animate-pulse-glow"
              >
                <div className="relative z-10 flex items-center justify-center gap-3">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                      <span>Sign In to Your Account</span>
                    </>
                  )}
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 via-red-600 to-amber-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Sparkles className="absolute top-2 right-4 w-4 h-4 text-yellow-300 opacity-0 group-hover:opacity-100 animate-pulse" />
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8 animate-fade-in">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-200 border-dashed"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/80 text-gray-500 font-medium rounded-full">
                  <UtensilsCrossed className="w-4 h-4 inline-block mr-2 animate-spin-slow" />
                  New to Chef Alert?
                </span>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="text-center animate-slide-in-up">
              <Link 
                to="/signup" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-orange-500 text-orange-600 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 hover:bg-orange-50 group"
              >
                <ChefHat className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                Create New Account
                <Flame className="w-4 h-4 text-orange-500 group-hover:animate-pulse" />
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <div className="text-center animate-fade-in animation-delay-1000">
          <p className="text-gray-600 text-sm">
            By signing in, you agree to our{' '}
            <a href="#" className="text-orange-600 hover:text-orange-700 font-medium underline hover:no-underline transition-all duration-300 hover:scale-105 inline-block">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-orange-600 hover:text-orange-700 font-medium underline hover:no-underline transition-all duration-300 hover:scale-105 inline-block">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
          }
          25% { 
            transform: translateY(-20px) rotate(5deg); 
          }
          50% { 
            transform: translateY(20px) rotate(-5deg); 
          }
          75% { 
            transform: translateY(-10px) rotate(3deg); 
          }
        }
        
        @keyframes float-slow {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
          }
          33% { 
            transform: translateY(-30px) rotate(10deg); 
          }
          66% { 
            transform: translateY(15px) rotate(-8deg); 
          }
        }
        
        @keyframes float-delayed {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
          }
          20% { 
            transform: translateY(-15px) rotate(-5deg); 
          }
          40% { 
            transform: translateY(25px) rotate(5deg); 
          }
          60% { 
            transform: translateY(-10px) rotate(-3deg); 
          }
          80% { 
            transform: translateY(10px) rotate(3deg); 
          }
        }
        
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(249, 115, 22, 0.3); }
          50% { box-shadow: 0 0 40px rgba(249, 115, 22, 0.6); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slide-in-up {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float-chef-hat {
          0% {
            transform: translateY(100px) rotate(0deg);
            opacity: 0;
          }
          50% {
            transform: translateY(-50px) rotate(180deg);
            opacity: 0.15;
          }
          100% {
            transform: translateY(-200px) rotate(360deg);
            opacity: 0;
          }
        }
        
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animate-float {
          animation: float 12s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 15s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 18s ease-in-out infinite;
        }
        
        .animate-bounce-subtle {
          animation: bounce-subtle 3s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
        
        .animate-ping {
          animation: ping 3s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        
        .animate-slide-in-left {
          animation: slide-in-left 0.8s ease-out forwards;
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.8s ease-out forwards;
          animation-delay: 0.2s;
          opacity: 0;
        }
        
        .animate-slide-in-up {
          animation: slide-in-up 0.8s ease-out forwards;
          animation-delay: 0.4s;
          opacity: 0;
        }
        
        .animate-fade-in {
          animation: fade-in-up 1s ease-out forwards;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
        }
        
        .animate-float-chef-hat {
          animation: float-chef-hat 12s linear infinite;
        }
        
        .animation-delay-500 {
          animation-delay: 500ms;
        }
        
        .animation-delay-1000 {
          animation-delay: 1000ms;
        }
        
        .animation-delay-1500 {
          animation-delay: 1500ms;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-3000 {
          animation-delay: 3s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}