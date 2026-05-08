import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, User, ChefHat, Home, Calendar, Sparkles, Zap, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Avatar } from './Avatar';

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const isProClient = user?.role === 'client' && (user as any)?.is_pro;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Initial animation
    setTimeout(() => setIsVisible(true), 100);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
  };

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    ...(user
      ? user.role === 'client'
        ? [
            { path: '/browse-chefs', label: 'Browse Chefs', icon: ChefHat },
            { path: '/subscriptions', label: 'Subscription', icon: Sparkles },
            { path: '/bookings', label: 'My Bookings', icon: Calendar },
          ]
        : user.role === 'chef'
        ? [
            { path: '/chef-profile', label: 'My Profile', icon: User },
            { path: '/chef-bookings', label: 'Bookings', icon: Calendar },
          ]
        : user.role === 'admin'
        ? [{ path: '/admin', label: 'Admin Dashboard', icon: Shield }]
        : []
      : []),
  ];

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'chef':
        return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg';
      case 'admin':
        return 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg';
      case 'client':
        return 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'chef':
        return <ChefHat className="w-3 h-3" />;
      case 'admin':
        return <Shield className="w-3 h-3" />;
      case 'client':
        return <User className="w-3 h-3" />;
      default:
        return <User className="w-3 h-3" />;
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-2xl border-b border-orange-100/30'
          : 'bg-gradient-to-r from-white/95 via-orange-50/80 to-red-50/80 backdrop-blur-xl border-b border-orange-100/20'
      }`}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-32 h-32 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className={`flex items-center gap-3 group transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
            }`}
          >
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl group-hover:shadow-3xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                <ChefHat className="w-6 h-6 text-white" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
              </div>
              <div className="absolute -inset-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-2xl blur-xl opacity-30 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-2xl bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
                ChefAlert
              </span>
              <span className="text-xs text-gray-500 -mt-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-orange-500" />
                Premium Culinary Experience
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className={`hidden md:flex items-center gap-2 transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
          }`}>
            {navItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-500 group overflow-hidden ${
                    isActive(item.path)
                      ? 'text-white bg-gradient-to-r from-orange-500 to-red-500 shadow-2xl shadow-orange-200/50 transform scale-105'
                      : 'text-gray-700 hover:text-orange-700 hover:bg-white/80 hover:shadow-xl border border-transparent hover:border-orange-200/50'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Hover Effect Background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 opacity-0 group-hover:opacity-5 transition-opacity duration-500"></div>
                  
                  <Icon
                    className={`w-5 h-5 transition-all duration-500 ${
                      isActive(item.path) 
                        ? 'transform scale-110 animate-pulse' 
                        : 'group-hover:scale-110 group-hover:text-orange-600'
                    }`}
                  />
                  <span className="font-semibold tracking-wide">{item.label}</span>
                  
                  {/* Active indicator */}
                  {isActive(item.path) && (
                    <>
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-orange-400 rounded-full animate-ping"></div>
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-orange-500 rounded-full"></div>
                    </>
                  )}
                  
                  {/* Shine effect */}
                  <div className="absolute inset-0 -inset-y-1 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                </Link>
              );
            })}

            {user ? (
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-orange-200/50">
                <Avatar
                  src={user.profile_picture_url}
                  alt={user.full_name || user.email}
                  role={user.role}
                  size="md"
                  className="shadow-xl border-2 border-white"
                />

                {/* User Role Badge */}
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-2xl ${getRoleBadgeColor(user.role)} transition-all duration-500 transform hover:scale-105`}
                >
                  {getRoleIcon(user.role)}
                  <span className="text-sm font-semibold capitalize">
                    {user.role === 'client' ? 'Customer' : user.role}
                  </span>
                </div>

                {isProClient && (
                  <span className="px-2 py-1 rounded-full text-[11px] font-extrabold bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow">
                    PRO
                  </span>
                )}

                {/* Profile & Logout */}
                <div className="flex items-center gap-1">
                  <Link
                    to="/profile"
                    className="p-3 text-gray-600 hover:text-orange-600 hover:bg-white/80 rounded-2xl transition-all duration-500 hover:shadow-xl transform hover:scale-110 group border border-transparent hover:border-orange-200/50"
                  >
                    <User className="w-5 h-5 group-hover:stroke-2 transition-all" />
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="p-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all duration-500 hover:shadow-xl transform hover:scale-110 group border border-transparent hover:border-red-200/50"
                  >
                    <LogOut className="w-5 h-5 group-hover:stroke-2 transition-all" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3 ml-4 pl-4 border-l border-orange-200/50">
                <Link
                  to="/login"
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-500 transform hover:scale-105 ${
                    isActive('/login')
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-2xl'
                      : 'text-gray-700 hover:text-orange-600 hover:bg-white/80 hover:shadow-xl border border-transparent hover:border-orange-200/50'
                  }`}
                >
                  <User className="w-4 h-4" />
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl font-semibold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-500 hover:from-orange-600 hover:to-red-600 group"
                >
                  <Zap className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Sign Up
                  <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`md:hidden p-3 text-gray-600 hover:text-orange-600 hover:bg-white/80 rounded-2xl transition-all duration-500 transform hover:scale-110 border border-transparent hover:border-orange-200/50 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
            }`}
          >
            {isOpen ? (
              <X className="w-6 h-6 animate-spin-in" />
            ) : (
              <Menu className="w-6 h-6 animate-pulse" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-6 space-y-2 animate-slide-down">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-500 transform hover:scale-105 ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-2xl'
                      : 'text-gray-700 hover:bg-white/80 hover:text-orange-600 hover:shadow-xl border border-transparent hover:border-orange-200/50'
                  }`}
                  onClick={() => setIsOpen(false)}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-semibold">{item.label}</span>
                  {isActive(item.path) && (
                    <div className="ml-auto w-2 h-2 bg-orange-300 rounded-full animate-pulse"></div>
                  )}
                </Link>
              );
            })}

            {user ? (
              <div className="pt-4 border-t border-orange-200/50 space-y-3">
                {/* User Info */}
                <div className="px-4 py-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border border-orange-200/50 shadow-lg">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={user.profile_picture_url}
                      alt={user.full_name || user.email}
                      role={user.role}
                      size="lg"
                      className="shadow-lg border-2 border-white"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate text-lg">
                        {user.full_name || user.email}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${getRoleBadgeColor(user.role)}`}>
                          {getRoleIcon(user.role)}
                          <span className="ml-1">
                            {user.role === 'client' ? 'Customer' : user.role}
                          </span>
                        </div>
                        {isProClient && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow">
                            PRO
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile Actions */}
                <Link
                  to="/profile"
                  className="flex items-center gap-4 px-4 py-4 text-gray-700 hover:bg-white/80 hover:text-orange-600 rounded-2xl transition-all duration-500 transform hover:scale-105 border border-transparent hover:border-orange-200/50"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="w-5 h-5" />
                  <span className="font-semibold">Profile</span>
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-4 px-4 py-4 text-red-600 hover:bg-red-50 rounded-2xl transition-all duration-500 transform hover:scale-105 text-left border border-transparent hover:border-red-200/50"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-semibold">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-orange-200/50 space-y-3">
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-3 px-4 py-4 text-gray-700 hover:bg-white/80 hover:text-orange-600 rounded-2xl transition-all duration-500 transform hover:scale-105 border border-orange-200/50 hover:border-orange-300"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="w-5 h-5" />
                  <span className="font-semibold">Login</span>
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center justify-center gap-3 px-4 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl font-semibold shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 hover:from-orange-600 hover:to-red-600"
                  onClick={() => setIsOpen(false)}
                >
                  <Zap className="w-5 h-5" />
                  <span>Sign Up</span>
                  <Sparkles className="w-5 h-5" />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add these styles to your global CSS or use a CSS-in-JS solution */}
      <style>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        @keyframes spin-in {
          from {
            transform: rotate(-90deg) scale(0.5);
            opacity: 0;
          }
          to {
            transform: rotate(0deg) scale(1);
            opacity: 1;
          }
        }
        .animate-spin-in {
          animation: spin-in 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(20px, -20px) scale(1.1);
          }
          66% {
            transform: translate(-10px, 10px) scale(0.9);
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
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </nav>
  );
}