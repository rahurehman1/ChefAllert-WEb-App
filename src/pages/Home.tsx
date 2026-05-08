import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChefHat, Clock, Star, Users, ArrowRight, Calendar, MessageCircle, Sparkles, Award, Heart, Zap, User, MapPin, Coffee, Pizza, Cake, Wine, Utensils, IceCream, Salad, Sandwich } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../lib/api';

export function Home() {
  const { user } = useAuth();
  const [topChefs, setTopChefs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeFoodIndex, setActiveFoodIndex] = useState(0);

  const foodImages = [
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1432139509613-5c4255815697?w=300&h=300&fit=crop',
    'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=300&h=300&fit=crop',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFoodIndex((prev) => (prev + 1) % foodImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const formatPkr = (amount: number) => {
    return 'Rs ' + amount.toLocaleString('en-PK');
  };

  const isProClient = user?.role === 'client' && !!(user as any)?.is_pro;

  const resolveImageUrl = (value?: string | null) => {
    if (!value) return null;
    if (value.startsWith('http://') || value.startsWith('https://')) return value;
    const base = 'http://localhost:5001';
    if (value.startsWith('/')) return `${base}${value}`;
    return `${base}/${value}`;
  };

  useEffect(() => {
    fetchTopChefs();
    setIsVisible(true);
  }, []);

  const fetchTopChefs = async () => {
    try {
      const response = await api.get('/api/chefs');
      const chefs = response.data.slice(0, 6);
      setTopChefs(chefs);
    } catch (error) {
      console.error('Error fetching chefs:', error);
    } finally {
      setLoading(false);
    }
  };

  const FloatingFoodIcons = () => {
    const icons = [
      { Icon: Pizza, color: 'text-orange-500', delay: '0s', size: 24, left: '5%', top: '15%', speed: 6 },
      { Icon: Coffee, color: 'text-amber-700', delay: '2s', size: 20, left: '85%', top: '25%', speed: 7 },
      { Icon: Cake, color: 'text-pink-500', delay: '4s', size: 28, left: '15%', top: '75%', speed: 5 },
      { Icon: IceCream, color: 'text-purple-500', delay: '1s', size: 22, left: '75%', top: '80%', speed: 8 },
      { Icon: Salad, color: 'text-green-500', delay: '3s', size: 26, left: '45%', top: '10%', speed: 6 },
      { Icon: Sandwich, color: 'text-yellow-600', delay: '5s', size: 24, left: '60%', top: '40%', speed: 7 },
      { Icon: Wine, color: 'text-red-500', delay: '2.5s', size: 20, left: '25%', top: '45%', speed: 5 },
      { Icon: Utensils, color: 'text-gray-500', delay: '3.5s', size: 30, left: '92%', top: '60%', speed: 6 },
    ];

    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {icons.map((item, index) => (
          <div
            key={index}
            className="absolute animate-float"
            style={{
              left: item.left,
              top: item.top,
              animation: `float ${item.speed}s ease-in-out infinite`,
              animationDelay: item.delay,
              transform: `translate(${mousePosition.x * (index % 2 === 0 ? 1 : -1)}px, ${mousePosition.y * (index % 2 === 0 ? -1 : 1)}px)`,
            }}
          >
            <item.Icon 
              className={`${item.color} opacity-30 hover:opacity-60 transition-opacity duration-300`} 
              size={item.size}
              style={{
                filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.2))',
              }}
            />
          </div>
        ))}
      </div>
    );
  };

  const MovingFoodPictures = () => {
    const positions = [
      { left: '2%', top: '10%', width: '150px', delay: '0s', duration: '25s' },
      { left: '85%', top: '20%', width: '180px', delay: '2s', duration: '30s' },
      { left: '10%', top: '70%', width: '120px', delay: '4s', duration: '22s' },
      { left: '75%', top: '80%', width: '160px', delay: '1s', duration: '28s' },
      { left: '45%', top: '30%', width: '140px', delay: '3s', duration: '26s' },
      { left: '60%', top: '45%', width: '130px', delay: '5s', duration: '24s' },
      { left: '25%', top: '85%', width: '170px', delay: '2.5s', duration: '27s' },
      { left: '92%', top: '60%', width: '140px', delay: '3.5s', duration: '23s' },
      { left: '15%', top: '40%', width: '160px', delay: '4.5s', duration: '29s' },
      { left: '80%', top: '15%', width: '150px', delay: '1.5s', duration: '26s' },
    ];

    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {positions.map((pos, index) => (
          <div
            key={index}
            className="absolute animate-drift"
            style={{
              left: pos.left,
              top: pos.top,
              width: pos.width,
              height: 'auto',
              animation: `drift ${pos.duration} linear infinite`,
              animationDelay: pos.delay,
              opacity: 0.15,
              transition: 'opacity 0.3s ease',
              transform: `translate(${mousePosition.x * (index % 2 === 0 ? 0.5 : -0.5)}px, ${mousePosition.y * (index % 2 === 0 ? -0.5 : 0.5)}px)`,
            }}
          >
            <img
              src={foodImages[index % foodImages.length]}
              alt="Food"
              className="w-full h-full object-cover rounded-2xl shadow-2xl"
              style={{
                filter: 'blur(2px) brightness(0.8)',
                transform: `rotate(${index * 15}deg)`,
              }}
            />
          </div>
        ))}
      </div>
    );
  };

  const SequentialFoodImages = () => {
    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {foodImages.map((img, index) => (
          <div
            key={index}
            className={`absolute transition-all duration-1000 ${
              index === activeFoodIndex 
                ? 'opacity-30 scale-100' 
                : 'opacity-0 scale-50'
            }`}
            style={{
              left: `${15 + (index * 8) % 70}%`,
              top: `${10 + (index * 12) % 80}%`,
              width: '180px',
              height: '180px',
              animation: index === activeFoodIndex ? `float-${index % 3} 6s ease-in-out infinite` : 'none',
              transform: `rotate(${index * 25}deg) translate(${mousePosition.x * 0.3}px, ${mousePosition.y * 0.3}px)`,
            }}
          >
            <img
              src={img}
              alt="Food"
              className="w-full h-full object-cover rounded-3xl shadow-2xl border-4 border-white/30"
              style={{
                filter: 'brightness(0.7) saturate(1.2)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              }}
            />
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-orange-500/20 to-red-500/20 mix-blend-overlay"></div>
          </div>
        ))}
      </div>
    );
  };

  const ChefCardSkeleton = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 animate-pulse-slow">
      <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 animate-shimmer" />
      <div className="p-6 space-y-4">
        <div className="h-6 bg-gray-200 rounded w-3/4 animate-shimmer"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 animate-shimmer"></div>
        <div className="h-4 bg-gray-200 rounded w-full animate-shimmer"></div>
        <div className="h-6 bg-gray-200 rounded w-20 animate-shimmer"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 relative overflow-hidden">
      {/* Multiple background food elements */}
      <FloatingFoodIcons />
      <MovingFoodPictures />
      <SequentialFoodImages />

      {/* Animated background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-0 left-0 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"
          style={{ transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)` }}
        />
        <div 
          className="absolute top-0 right-0 w-96 h-96 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"
          style={{ transform: `translate(${mousePosition.x * -0.3}px, ${mousePosition.y * 0.4}px)` }}
        />
        <div 
          className="absolute bottom-0 left-20 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"
          style={{ transform: `translate(${mousePosition.x * 0.4}px, ${mousePosition.y * -0.3}px)` }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-20 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          {user && (
            <div className={`mb-12 transition-all duration-1000 transform ${
              isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'
            }`}>
              <div className="inline-flex flex-col items-center gap-4 p-6 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-orange-200/50 animate-float-slow hover:shadow-3xl transition-all duration-500">
                <div className="relative group">
                  {user.profile_picture_url ? (
                    <img 
                      src={user.profile_picture_url} 
                      alt={user.full_name}
                      className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-xl transform group-hover:scale-110 transition-transform duration-500 group-hover:rotate-3"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${user.full_name}&background=orange&color=white&size=80`;
                      }}
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform duration-500 group-hover:rotate-3">
                      {user.role === 'chef' ? (
                        <ChefHat className="w-10 h-10 text-white animate-bounce-slow" />
                      ) : (
                        <User className="w-10 h-10 text-white animate-bounce-slow" />
                      )}
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-full p-1.5 shadow-lg animate-ping-slow">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 animate-gradient-text">
                    Welcome back, {user.full_name}!
                  </h2>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 rounded-xl text-sm font-semibold shadow-sm border border-orange-200 transform hover:scale-105 transition-transform duration-300">
                    {user.role === 'chef' ? <ChefHat className="w-4 h-4 animate-spin-slow" /> : <User className="w-4 h-4 animate-pulse" />}
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className={`inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-orange-200 mb-8 transition-all duration-1000 transform ${
            isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'
          }`}>
            <Sparkles className="w-5 h-5 text-orange-600 animate-sparkle" />
            <span className="font-semibold text-gray-700">Trusted by food lovers worldwide</span>
            <Sparkles className="w-5 h-5 text-orange-600 animate-sparkle animation-delay-500" />
          </div>

          <div className={`transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Discover Culinary
              <span className="block bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 bg-clip-text text-transparent animate-gradient-x bg-[length:200%_auto]">
                Excellence
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up">
              Connect with world-class chefs for unforgettable dining experiences. 
              From intimate dinners to grand celebrations, find the perfect culinary artist for every occasion.
            </p>
          </div>

          <div className={`flex flex-col sm:flex-row gap-4 justify-center mb-16 transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            {user ? (
              <>
                {user.role === 'client' && (
                  <Link
                    to="/browse-chefs"
                    className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl font-bold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                  >
                    <span className="relative z-10">Explore Top Chefs</span>
                    <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform group-hover:rotate-12" />
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 animate-pulse"></div>
                    <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                  </Link>
                )}
                {user.role === 'chef' && (
                  <Link
                    to="/chef-profile"
                    className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl font-bold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                  >
                    <span className="relative z-10">Manage Your Profile</span>
                    <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform group-hover:rotate-12" />
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl font-bold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 hover:-translate-y-1 overflow-hidden animate-pulse-glow"
                >
                  <span className="relative z-10">Start Your Journey</span>
                  <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform group-hover:rotate-12" />
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                </Link>
                <Link
                  to="/login"
                  className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white/80 backdrop-blur-sm border-2 border-orange-500 text-orange-600 rounded-2xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                >
                  <span className="relative z-10">Sign In</span>
                  <Zap className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform group-hover:rotate-12" />
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                </Link>
              </>
            )}
          </div>

          {/* Feature Cards */}
          <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-1000 delay-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            {[
              {
                icon: ChefHat,
                title: "Expert Chefs",
                description: "Verified professional chefs with extensive experience and proven track records"
              },
              {
                icon: Award,
                title: "Award Winning",
                description: "Recognized culinary talents with awards and industry recognition"
              },
              {
                icon: Heart,
                title: "Satisfaction Guaranteed",
                description: "Exceptional service quality backed by customer reviews and ratings"
              }
            ].map((feature, index) => (
              <div
                key={feature.title}
                className="group p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-orange-100 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 hover:border-orange-200 animate-fade-in-up"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all duration-500 group-hover:rotate-3 group-hover:shadow-xl">
                    <feature.icon className="w-8 h-8 text-white animate-bounce-slow" style={{ animationDelay: `${index * 300}ms` }} />
                  </div>
                  <div className="absolute -top-2 -right-2 animate-ping-slow">
                    <Sparkles className="w-5 h-5 text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-900 transition-colors duration-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Chefs Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent to-orange-50/50 relative">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl shadow-lg transform hover:rotate-6 transition-transform duration-300 animate-float">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 bg-clip-text text-transparent animate-gradient-x bg-[length:200%_auto]">
                Featured Chefs
              </h2>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
              Meet our most celebrated culinary artists, handpicked for their exceptional skills and customer satisfaction
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <ChefCardSkeleton key={i} />
              ))}
            </div>
          ) : topChefs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {topChefs.map((chef: any, index) => {
                const chefName = chef.user?.full_name ||
                                chef.user_id?.full_name || 
                                chef.users?.full_name || 
                                chef.full_name || 
                                'Professional Chef';
                
                const chefImage = chef.user?.profile_picture_url ||
                                chef.user_id?.profile_picture_url || 
                                chef.users?.profile_picture_url || 
                                chef.profile_picture_url ||
                                chef.profile_picture;

                const resolvedChefImage = resolveImageUrl(chefImage);
                
                const chefCity = chef.user_id?.city || 
                                chef.users?.city || 
                                chef.city;
                
                const chefSpecialization = chef.specializations || 
                                          chef.specialization || 
                                          'Professional Chef';
                
                const chefRating = chef.rating || 0;
                const chefReviews = chef.total_reviews || chef.reviews_count || 0;
                const chefExperience = chef.experience_years || chef.experience || 0;
                const chefPrice = chef.price_per_hour || chef.price || 0;

                return (
                  <Link
                    key={chef.id || chef._id || `chef-${index}`}
                    to={user?.role === 'client' ? `/chef/${chef.user_id || chef.user?._id || chef.user?.id || chef._id}` : '#'}
                    className="group relative bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 animate-fade-in-up"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div className="relative h-48 bg-gradient-to-br from-orange-400 to-red-500 overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center p-4">
                        {resolvedChefImage ? (
                          <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-white/90 shadow-2xl group-hover:border-orange-300 transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3">
                            <img
                              src={resolvedChefImage}
                              alt={chefName}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(chefName)}&background=orange&color=white&size=128&bold=true`;
                              }}
                            />
                            
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-4">
                              <span className="text-white font-semibold text-sm bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm mb-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                View Profile
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="relative w-36 h-36 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center border-4 border-white/90 shadow-2xl group-hover:border-orange-300 transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3">
                            <div className="text-white text-4xl font-bold animate-pulse">
                              {chefName.charAt(0).toUpperCase()}
                            </div>
                            
                            <div className="absolute bottom-2 right-2 bg-white/20 backdrop-blur-sm rounded-full p-1.5 animate-bounce-slow">
                              <ChefHat className="w-5 h-5 text-white" />
                            </div>
                            
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-4">
                              <span className="text-white font-semibold text-sm bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm mb-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                View Profile
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full px-3 py-2 shadow-lg transform hover:scale-110 transition-transform duration-300">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-500 text-yellow-500 animate-pulse" />
                          <span className="font-bold text-gray-900 text-sm">
                            {chefRating.toFixed(1)}
                          </span>
                        </div>
                      </div>

                      {chefExperience > 5 && (
                        <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-full px-3 py-1.5 shadow-lg animate-float">
                          <div className="flex items-center gap-1 text-xs font-semibold">
                            <Award className="w-3 h-3" />
                            <span>Expert</span>
                          </div>
                        </div>
                      )}

                      {chefCity && (
                        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg transform hover:scale-105 transition-transform duration-300">
                          <div className="flex items-center gap-1 text-xs font-semibold text-gray-800">
                            <MapPin className="w-3 h-3 text-blue-500 animate-pulse" />
                            <span className="truncate max-w-[100px]">{chefCity}</span>
                          </div>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    <div className="p-6">
                      <div className="text-center mb-3">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors duration-300 line-clamp-1 transform group-hover:scale-105">
                          {chefName}
                        </h3>
                        
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-50 to-red-50 text-orange-700 rounded-full text-xs font-medium border border-orange-200 transform hover:scale-105 transition-transform duration-300">
                          <ChefHat className="w-3 h-3 animate-spin-slow" />
                          <span className="font-semibold line-clamp-1 max-w-[150px]">{chefSpecialization}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 transition-all duration-300 hover:scale-125 ${
                                star <= Math.floor(chefRating)
                                  ? 'fill-yellow-500 text-yellow-500 animate-pulse'
                                  : star === Math.ceil(chefRating) && chefRating % 1 !== 0
                                  ? 'fill-yellow-500 text-yellow-500 opacity-50'
                                  : 'fill-gray-300 text-gray-300'
                              }`}
                              style={{ animationDelay: `${star * 100}ms` }}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">({chefReviews} reviews)</span>
                      </div>

                      <p className="text-gray-600 text-sm text-center mb-4">
                        <span className="font-semibold text-orange-600 animate-pulse">{chefExperience} years</span> of culinary excellence
                      </p>
                      
                      <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
                        <div className="text-left">
                          <p className="text-xs text-gray-500 mb-1">Starting from</p>
                          {isProClient ? (
                            <div>
                              <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-orange-600 animate-pulse">
                                  {formatPkr(chefPrice * 0.8)}
                                </span>
                                <span className="text-gray-500 text-sm">/hour</span>
                              </div>
                              <div className="text-[11px] text-gray-500">
                                <span className="line-through">{formatPkr(chefPrice)}</span>
                                <span className="ml-2 font-semibold text-green-700 animate-pulse">20% off</span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-bold text-orange-600 animate-pulse">
                                {formatPkr(chefPrice)}
                              </span>
                              <span className="text-gray-500 text-sm">/hour</span>
                            </div>
                          )}
                        </div>
                        
                        <button className="relative bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 overflow-hidden group">
                          <span className="relative z-10">Book Now</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        </button>
                      </div>
                    </div>

                    <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-orange-200 transition-all duration-500 pointer-events-none"></div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-100 animate-fade-in-up">
              <ChefHat className="w-20 h-20 text-gray-300 mx-auto mb-6 animate-bounce-slow" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No Chefs Available Yet</h3>
              <p className="text-gray-600 text-lg mb-8">
                We're working on bringing amazing chefs to our platform. Check back soon!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-white to-orange-50 relative">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="flex items-center justify-center gap-3 mb-4 animate-fade-in-up">
            <Zap className="w-8 h-8 text-orange-600 animate-ping-slow" />
            <h2 className="text-4xl font-bold text-gray-900">How It Works</h2>
          </div>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
            Simple steps to bring exceptional culinary experiences to your table
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Browse & Discover", desc: "Explore chefs by cuisine, ratings, and availability", icon: Users },
              { step: "2", title: "Book & Schedule", desc: "Choose your date, time, and menu preferences", icon: Calendar },
              { step: "3", title: "Connect & Chat", desc: "Communicate directly with your chosen chef", icon: MessageCircle },
              { step: "4", title: "Enjoy & Review", desc: "Savor the experience and share your feedback", icon: Star }
            ].map((item, index) => (
              <div 
                key={item.step}
                className="group p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-orange-100 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 animate-fade-in-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold group-hover:scale-110 transition-transform duration-500 group-hover:rotate-3 group-hover:shadow-xl">
                    {item.step}
                  </div>
                  <div className="absolute -top-2 -right-2 animate-ping-slow">
                    <Sparkles className="w-5 h-5 text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors duration-300">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-900 transition-colors duration-300">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-orange-500 to-red-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-ping-slow"></div>
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-white rounded-full transform translate-x-1/2 translate-y-1/2 animate-pulse-slow"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center text-white relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in-up">
            Ready to Create Unforgettable Memories?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
            Join thousands of satisfied customers who have transformed their events with our professional chefs
          </p>
          <Link
            to={user ? (user.role === 'client' ? '/browse-chefs' : '/chef-profile') : '/signup'}
            className="relative inline-flex items-center gap-3 px-8 py-4 bg-white text-orange-600 rounded-2xl font-bold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 hover:-translate-y-1 overflow-hidden group animate-pulse-glow"
          >
            <span className="relative z-10">Get Started Today</span>
            <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          </Link>
        </div>
      </section>

      {/* Animations CSS */}
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
        
        @keyframes gradient-x {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        
        @keyframes float {
          0% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
          100% {
            transform: translateY(0px) rotate(0deg);
          }
        }
        
        @keyframes float-0 {
          0% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-25px) rotate(8deg);
          }
          100% {
            transform: translateY(0px) rotate(0deg);
          }
        }
        
        @keyframes float-1 {
          0% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(-5deg);
          }
          100% {
            transform: translateY(0px) rotate(0deg);
          }
        }
        
        @keyframes float-2 {
          0% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(12deg);
          }
          100% {
            transform: translateY(0px) rotate(0deg);
          }
        }
        
        @keyframes drift {
          0% {
            transform: translateX(-100%) rotate(0deg);
          }
          100% {
            transform: translateX(calc(100vw + 100%)) rotate(360deg);
          }
        }
        
        @keyframes float-slow {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
          100% {
            transform: translateY(0px);
          }
        }
        
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }
        
        @keyframes ping-slow {
          75%, 100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }
        
        @keyframes sparkle {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.2);
          }
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(249, 115, 22, 0.3);
          }
          50% {
            box-shadow: 0 0 40px rgba(249, 115, 22, 0.6);
          }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
          background-size: 200% 200%;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 4s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        
        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        
        .animate-shimmer {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
        }
        
        .animate-sparkle {
          animation: sparkle 1.5s ease-in-out infinite;
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        .animate-drift {
          animation: drift 25s linear infinite;
        }
        
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        
        .animation-delay-500 {
          animation-delay: 500ms;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animate-gradient-text {
          background: linear-gradient(90deg, #f97316, #ef4444, #f97316);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: gradient-x 3s ease infinite;
        }
        
        .hover\:shadow-3xl:hover {
          box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.3);
        }
        
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}