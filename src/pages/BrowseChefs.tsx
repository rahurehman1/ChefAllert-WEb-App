import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Star, Search, Filter, MapPin, Clock, Award, Sparkles, Zap, TrendingUp } from 'lucide-react';
import api from '../lib/api';
import { PAKISTANI_DISHES } from '../data/pakistaniDishes';
import { useAuth } from '../context/AuthContext';

export function BrowseChefs() {
  const { user } = useAuth();
  const [chefs, setChefs] = useState<any[]>([]);
  const [filteredChefs, setFilteredChefs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDish, setSelectedDish] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100000);
  const [sortBy, setSortBy] = useState('rating');
  const [isVisible, setIsVisible] = useState(false);

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
    fetchChefs();
    setIsVisible(true);
  }, []);

  useEffect(() => {
    fetchChefs();
  }, [searchTerm, selectedDish]);

  useEffect(() => {
    filterChefs();
  }, [chefs, searchTerm, minRating, maxPrice, sortBy]);

  const fetchChefs = async () => {
    try {
      const params: any = {};
      if (searchTerm.trim()) params.q = searchTerm.trim();
      if (selectedDish) params.dish = selectedDish;
      const response = await api.get('/api/chefs', { params });
      console.log('📋 Chefs data:', response.data);
      setChefs(response.data);
    } catch (error) {
      console.error('Error fetching chefs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterChefs = () => {
    let filtered = chefs.filter(chef => {
      const chefUser = chef.user || chef.user_id || chef.users || {};
      const chefName = chefUser?.full_name || '';
      const specializations = chef.specializations || '';
      const specialtiesArr: string[] = Array.isArray(chef.specialties) ? chef.specialties : [];
      const ratingValue = typeof chef.rating === 'number' ? chef.rating : 0;
      const priceValue = typeof chef.price_per_hour === 'number' ? chef.price_per_hour : 0;
      
      const matchesSearch =
        chefName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        specializations.toLowerCase().includes(searchTerm.toLowerCase()) ||
        specialtiesArr.some(s => (s || '').toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesRating = ratingValue >= minRating;
      const matchesPrice = priceValue <= maxPrice;

      return matchesSearch && matchesRating && matchesPrice;
    });

    // Sort chefs
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'smart': {
          const aScore = typeof a.smart_score === 'number' ? a.smart_score : (a.rating || 0) * 10 + (a.experience_years || 0) * 2;
          const bScore = typeof b.smart_score === 'number' ? b.smart_score : (b.rating || 0) * 10 + (b.experience_years || 0) * 2;
          return bScore - aScore;
        }
        case 'rating':
          return b.rating - a.rating;
        case 'price_low':
          return a.price_per_hour - b.price_per_hour;
        case 'price_high':
          return b.price_per_hour - a.price_per_hour;
        case 'experience':
          return b.experience_years - a.experience_years;
        default:
          return 0;
      }
    });

    setFilteredChefs(filtered);
  };

  const ChefCardSkeleton = () => (
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden border border-white/20 animate-pulse">
      <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300" />
      <div className="p-6 space-y-4">
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        <div className="flex justify-between">
          <div className="h-6 bg-gray-200 rounded w-20"></div>
          <div className="h-6 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    </div>
  );

  const FilterBadge = ({ label, value, onRemove }: any) => (
    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 border border-orange-200 shadow-sm">
      {label}: {value}
      <button
        onClick={onRemove}
        className="hover:text-orange-600 transition-colors duration-200"
      >
        
      </button>
    </span>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 pt-20">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className={`text-center mb-12 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="p-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl shadow-2xl">
              <ChefHat className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Discover Chefs
              </h1>
              <p className="text-xl text-gray-600 mt-4 max-w-2xl mx-auto">
                Find the perfect culinary artist for your special occasion. From intimate dinners to grand celebrations.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center border border-orange-100 shadow-lg">
              <div className="text-2xl font-bold text-orange-600">{chefs.length}</div>
              <div className="text-sm text-gray-600">Total Chefs</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center border border-green-100 shadow-lg">
              <div className="text-2xl font-bold text-green-600">
                {chefs.filter(c => c.rating >= 4).length}
              </div>
              <div className="text-sm text-gray-600">Top Rated</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center border border-blue-100 shadow-lg">
              <div className="text-2xl font-bold text-blue-600">
                {chefs.filter(c => c.experience_years > 5).length}
              </div>
              <div className="text-sm text-gray-600">Experts</div>
            </div>
          </div>
        </div>

        <div className={`bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl p-8 mb-8 border border-white/20 transition-all duration-1000 delay-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Search className="w-5 h-5 text-orange-600" />
                Search Chefs
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, specialty, or cuisine..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 hover:shadow-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-600" />
                Dish
              </label>
              <select
                value={selectedDish}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedDish(value);
                  if (value) setSortBy('smart');
                }}
                className="w-full px-4 py-4 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 hover:shadow-xl"
              >
                <option value="">All Dishes</option>
                {PAKISTANI_DISHES.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <div className="flex flex-wrap gap-2 mt-3">
                {['Biryani', 'Chicken Karahi', 'Nihari'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      setSelectedDish(d);
                      setSortBy('smart');
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border shadow-sm transition-all duration-200 ${
                      selectedDish === d
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-white/70 text-gray-700 border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                Minimum Rating
              </label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="w-full px-4 py-4 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 hover:shadow-xl"
              >
                <option value={0}>All Ratings</option>
                <option value={3}>3+ </option>
                <option value={4}>4+ </option>
                <option value={4.5}>4.5+ </option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Max Price
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold">Rs</span>
                <input
                  type="number"
                  min="0"
                  max="100000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full pl-12 pr-4 py-4 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 hover:shadow-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Filter className="w-5 h-5 text-purple-500" />
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-4 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 hover:shadow-xl"
              >
                <option value="smart">Smart Match</option>
                <option value="rating">Highest Rated</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="experience">Most Experienced</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 mt-8 pt-8 border-t border-gray-200/50">
            <div className="flex flex-wrap gap-3">
              {searchTerm && (
                <FilterBadge
                  label="Search"
                  value={`"${searchTerm}"`}
                  onRemove={() => setSearchTerm('')}
                />
              )}
              {selectedDish && (
                <FilterBadge
                  label="Dish"
                  value={selectedDish}
                  onRemove={() => setSelectedDish('')}
                />
              )}
              {minRating > 0 && (
                <FilterBadge
                  label="Min Rating"
                  value={`${minRating}+ ⭐`}
                  onRemove={() => setMinRating(0)}
                />
              )}
              {maxPrice < 100000 && (
                <FilterBadge
                  label="Max Price"
                  value={`${formatPkr(maxPrice)}/hr`}
                  onRemove={() => setMaxPrice(100000)}
                />
              )}
            </div>
            
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedDish('');
                setMinRating(0);
                setMaxPrice(100000);
                setSortBy('rating');
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <Zap className="w-4 h-4" />
              Clear All
            </button>
          </div>
        </div>

        <div className={`flex items-center justify-between mb-8 transition-all duration-1000 delay-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <p className="text-lg text-gray-700">
            Showing <span className="font-bold text-orange-600 text-xl">{filteredChefs.length}</span> chefs
            {filteredChefs.length !== chefs.length && ` of ${chefs.length}`}
          </p>
          {filteredChefs.length > 0 && (
            <div className="flex items-center gap-3 text-gray-600 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <span className="font-medium">Sorted by {sortBy.replace('_', ' ')}</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <ChefCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredChefs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredChefs.map((chef: any, index) => (
              <Link
                key={chef.id || chef._id || `chef-${index}`}
                to={`/chef/${chef.user_id || chef.user?._id || chef.user?.id}`}
                className="group bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-white/20 hover:shadow-3xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2"
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                <div className="relative h-48 bg-gradient-to-br from-orange-400 to-red-500 overflow-hidden">
                  {resolveImageUrl((chef.user || chef.user_id || chef.users)?.profile_picture_url) ? (
                    <img
                      src={resolveImageUrl((chef.user || chef.user_id || chef.users)?.profile_picture_url) as string}
                      alt={(chef.user || chef.user_id || chef.users)?.full_name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        const fallbackName = (chef.user || chef.user_id || chef.users)?.full_name || 'Chef';
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=orange&color=white&size=256`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-orange-600 to-red-600 flex items-center justify-center">
                        <ChefHat className="w-10 h-10 text-white opacity-80" />
                      </div>
                    </div>
                  )}
                  
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full px-3 py-2 shadow-lg">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      <span className="font-bold text-gray-900 text-sm">
                        {(chef.rating || 0).toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {chef.experience_years > 5 && (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-full px-3 py-1 shadow-lg">
                      <div className="flex items-center gap-1 text-xs font-semibold">
                        <Award className="w-3 h-3" />
                        <span>Expert</span>
                      </div>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                    <span className="text-white font-semibold text-sm bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                      View Profile →
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors duration-300 line-clamp-1">
                    {(chef.user || chef.user_id || chef.users)?.full_name || 'Professional Chef'}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                    {chef.specializations || 'Professional chef specializing in various cuisines'}
                  </p>

                  {Array.isArray(chef.specialties) && chef.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {chef.specialties.slice(0, 3).map((d: string) => (
                        <span
                          key={d}
                          className="px-2.5 py-1 bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 rounded-lg font-semibold border border-orange-200 shadow-sm text-[11px]"
                        >
                          {d}
                        </span>
                      ))}
                      {chef.specialties.length > 3 && (
                        <span className="px-2.5 py-1 bg-white/70 text-gray-600 rounded-lg font-semibold border border-gray-200 text-[11px]">
                          +{chef.specialties.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    {(chef.user || chef.user_id || chef.users)?.city && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">{(chef.user || chef.user_id || chef.users).city}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-purple-500" />
                      <span className="font-medium">{chef.experience_years || 0}y exp</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= Math.floor(chef.rating || 0)
                              ? 'fill-yellow-500 text-yellow-500'
                              : star === Math.ceil(chef.rating || 0) && (chef.rating || 0) % 1 !== 0
                              ? 'fill-yellow-500 text-yellow-500 opacity-50'
                              : 'fill-gray-300 text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 font-medium">({chef.total_reviews || 0} reviews)</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      {isProClient ? (
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-orange-600">
                              {formatPkr((chef.price_per_hour || 0) * 0.8)}
                            </span>
                            <span className="text-gray-500 text-sm">/hour</span>
                          </div>
                          <div className="text-[11px] text-gray-500">
                            <span className="line-through">{formatPkr(chef.price_per_hour || 0)}</span>
                            <span className="ml-2 font-semibold text-green-700">20% off (because you are PRO)</span>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <span className="text-2xl font-bold text-orange-600">{formatPkr(chef.price_per_hour || 0)}</span>
                          <span className="text-gray-500 text-sm ml-1">/hour</span>
                        </div>
                      )}
                    </div>
                    <div className="bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 px-4 py-2 rounded-xl text-sm font-semibold group-hover:from-orange-500 group-hover:to-red-500 group-hover:text-white transition-all duration-300 transform group-hover:scale-105 shadow-sm">
                      View Profile
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className={`text-center py-20 bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 transition-all duration-1000 delay-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-200 to-red-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Filter className="w-12 h-12 text-orange-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">No chefs found</h3>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                {chefs.length === 0 
                  ? "We're currently onboarding amazing chefs. Check back soon for culinary excellence!"
                  : "We couldn't find any chefs matching your criteria. Try adjusting your filters or search terms."
                }
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setMinRating(0);
                  setMaxPrice(1000);
                  setSortBy('rating');
                }}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <Zap className="w-5 h-5" />
                Reset All Filters
              </button>
            </div>
          </div>
        )}
      </div>

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