import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ShoppingCart from 'lucide-react/dist/esm/icons/shopping-cart';
import Package from 'lucide-react/dist/esm/icons/package';
import Plus from 'lucide-react/dist/esm/icons/plus';
import Minus from 'lucide-react/dist/esm/icons/minus';
import Heart from 'lucide-react/dist/esm/icons/heart';
import Eye from 'lucide-react/dist/esm/icons/eye';
import Star from 'lucide-react/dist/esm/icons/star';
import Truck from 'lucide-react/dist/esm/icons/truck';
import Shield from 'lucide-react/dist/esm/icons/shield';
import Zap from 'lucide-react/dist/esm/icons/zap';
import Filter from 'lucide-react/dist/esm/icons/filter';
import Search from 'lucide-react/dist/esm/icons/search';
import Grid from 'lucide-react/dist/esm/icons/grid';
import List from 'lucide-react/dist/esm/icons/list';
import strapiAPI from '../lib/api';
import { TravelAccessory, API_URL } from '../lib/types';
import { useCart } from '../hooks/useCart';

const TravelAccessories: React.FC = () => {
  const { t } = useTranslation();
  const [accessories, setAccessories] = useState<TravelAccessory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const { addToCart, getItemQuantity, updateQuantity } = useCart();

  useEffect(() => {
    const fetchAccessories = async () => {
      try {
        setLoading(true);
        const products = await strapiAPI.getTravelAccessories();
        const activeProducts = products.filter(p => p.is_active);
        setAccessories(activeProducts);
        
        // Set initial price range based on actual products
        if (activeProducts.length > 0) {
          const prices = activeProducts.map(p => p.price);
          setPriceRange([Math.min(...prices), Math.max(...prices)]);
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccessories();
  }, []);

  const filteredAccessories = accessories
    .filter(accessory => {
      const matchesCategory = selectedCategory === 'all' || accessory.category === selectedCategory;
      const matchesSearch = accessory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           accessory.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           accessory.brand?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPrice = accessory.price >= priceRange[0] && accessory.price <= priceRange[1];
      
      return matchesCategory && matchesSearch && matchesPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'brand':
          return (a.brand || '').localeCompare(b.brand || '');
        default:
          return 0;
      }
    });

  const handleAddToCart = (accessory: TravelAccessory) => {
    addToCart({
      id: `accessory-${accessory.id}`,
      product_type: 'travel-accessory',
      product_id: accessory.id,
      name: accessory.name,
      price: accessory.price,
      product_details: {
        category: accessory.category,
        brand: accessory.brand,
        weight: accessory.weight,
        dimensions: accessory.dimensions,
        requires_shipping: accessory.requires_shipping
      },
      image_url: accessory.images?.[0]?.url ? `${API_URL}${accessory.images[0].url}` : undefined
    });
  };

  const toggleFavorite = (id: number) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      return newFavorites;
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'luggage':
        return '🧳';
      case 'electronics':
        return '🔌';
      case 'comfort':
        return '😌';
      case 'security':
        return '🔒';
      case 'health':
        return '🏥';
      default:
        return '📦';
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: t('accessories.out_of_stock'), color: 'text-red-500', bg: 'bg-red-100' };
    if (stock < 5) return { text: t('accessories.low_stock'), color: 'text-orange-500', bg: 'bg-orange-100' };
    if (stock < 10) return { text: t('accessories.limited_stock'), color: 'text-yellow-500', bg: 'bg-yellow-100' };
    return { text: t('accessories.in_stock'), color: 'text-green-500', bg: 'bg-green-100' };
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="relative">
            <div className="animate-spin rounded-full h-32 w-32 border-4 border-blue-200"></div>
            <div className="animate-spin rounded-full h-32 w-32 border-4 border-blue-600 border-t-transparent absolute top-0 left-0"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Package className="h-12 w-12 text-blue-600 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error("Error loading accessories:", error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center bg-red-50 p-8 rounded-lg border border-red-200">
          <div className="text-red-600 mb-4">
            <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">{t('accessories.error_loading')}</h3>
            <p className="text-sm">{error.message}</p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            {t('accessories.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Enhanced Header with Gradient */}
      <div className="relative mb-12">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl opacity-10"></div>
        <div className="relative bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl mr-4">
                <Package className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {t('accessories.title')}
                </h1>
                <p className="text-gray-600 mt-2">{t('accessories.subtitle')}</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Truck className="text-green-500" size={20} />
                <span className="text-sm text-gray-600">{t('accessories.free_shipping')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="text-blue-500" size={20} />
                <span className="text-sm text-gray-600">{t('accessories.warranty')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={t('accessories.search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Filter size={18} />
              <span>{t('accessories.filters')}</span>
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="name">{t('accessories.sort_by_name')}</option>
              <option value="price_asc">{t('accessories.sort_by_price_asc')}</option>
              <option value="price_desc">{t('accessories.sort_by_price_desc')}</option>
              <option value="brand">{t('accessories.sort_by_brand')}</option>
            </select>

            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Category Filter */}
            <div>
              <h3 className="font-semibold mb-3">{t('accessories.category')}</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === 'all'}
                    onChange={() => setSelectedCategory('all')}
                    className="mr-2"
                  />
                  {t('accessories.categories.all_products')}
                </label>
                {['luggage', 'electronics', 'comfort', 'security', 'health'].map(category => (
                  <label key={category} className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === category}
                      onChange={() => setSelectedCategory(category)}
                      className="mr-2"
                    />
                    <span className="mr-2">{getCategoryIcon(category)}</span>
                    {t(`accessories.categories.${category}`)}
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="font-semibold mb-3">{t('accessories.price_range')}</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">$</span>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600">${priceRange[0]}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">$</span>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600">${priceRange[1]}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div>
              <h3 className="font-semibold mb-3">{t('accessories.quick_stats')}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>{t('accessories.total_products')}:</span>
                  <span className="font-semibold">{accessories.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('accessories.showing')}:</span>
                  <span className="font-semibold">{filteredAccessories.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('accessories.categories_available')}:</span>
                  <span className="font-semibold">5</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Category Pills */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105 ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md border border-gray-200'
            }`}
          >
            <span className="font-medium">{t('accessories.categories.all_products')}</span>
          </button>
          {['luggage', 'electronics', 'comfort', 'security', 'health'].map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md border border-gray-200'
              }`}
            >
              <span className="text-lg">{getCategoryIcon(category)}</span>
              <span className="font-medium">{t(`accessories.categories.${category}`)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Products Display */}
      <div className={
        viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
          : "space-y-6"
      }>
        {filteredAccessories.map((accessory) => {
          const quantity = getItemQuantity(`accessory-${accessory.id}`);
          const mainImage = accessory.images?.[0];
          const imageUrl = mainImage?.url ? `${API_URL}${mainImage.url}` : '';
          const stockStatus = getStockStatus(accessory.stock_quantity);
          const isFavorite = favorites.has(accessory.id);
          
          return (
            <div 
              key={accessory.id} 
              className={`group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden ${
                viewMode === 'list' ? 'flex' : ''
              }`}
            >
              {/* Product Image */}
              <div className={`relative bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center ${
                viewMode === 'list' ? 'w-48 h-48' : 'h-64'
              }`}>
                {mainImage ? (
                  <img
                    src={imageUrl}
                    alt={accessory.name}
                    className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="text-6xl transition-transform duration-300 group-hover:scale-110">
                    {getCategoryIcon(accessory.category)}
                  </div>
                )}
                
                {/* Overlay Elements */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                
                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                  <span className="bg-white bg-opacity-95 text-xs font-medium px-3 py-1 rounded-full shadow-sm">
                    {accessory.category}
                  </span>
                </div>

                {/* Stock Status Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`${stockStatus.bg} ${stockStatus.color} text-xs font-medium px-3 py-1 rounded-full`}>
                    {stockStatus.text}
                  </span>
                </div>

                {/* Favorite Button */}
                <button
                  onClick={() => toggleFavorite(accessory.id)}
                  className={`absolute bottom-3 right-3 p-2 rounded-full transition-all duration-300 ${
                    isFavorite ? 'bg-red-500 text-white' : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-500'
                  } shadow-md hover:shadow-lg`}
                >
                  <Heart size={16} className={isFavorite ? 'fill-current' : ''} />
                </button>

                {/* Quick View Button */}
                <button className="absolute bottom-3 left-3 p-2 rounded-full bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 shadow-md hover:shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100">
                  <Eye size={16} />
                </button>

                {/* New/Sale Badge */}
                {accessory.price < 50 && (
                  <div className="absolute top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-green-400 to-green-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                      <Zap size={12} className="inline mr-1" />
                      SALE
                    </div>
                  </div>
                )}
              </div>
              
              <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                {/* Product Header */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold mb-2 text-gray-800 group-hover:text-blue-600 transition-colors">
                    {accessory.name}
                  </h3>
                  {accessory.brand && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">{t('accessories.by')}</span>
                      <span className="text-sm font-medium text-blue-600">{accessory.brand}</span>
                    </div>
                  )}
                </div>

                {/* Rating Stars (Mock) */}
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="text-yellow-400 fill-current" />
                  ))}
                  <span className="text-sm text-gray-500 ml-2">(4.5)</span>
                </div>
                
                {/* Product Details */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {accessory.weight && (
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400">⚖️</span>
                      <div>
                        <p className="text-xs text-gray-500">{t('accessories.weight')}</p>
                        <p className="text-sm font-medium">{accessory.weight}</p>
                      </div>
                    </div>
                  )}
                  
                  {accessory.dimensions && (
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400">📏</span>
                      <div>
                        <p className="text-xs text-gray-500">{t('accessories.size')}</p>
                        <p className="text-sm font-medium">{accessory.dimensions}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-blue-600">
                      ${accessory.price}
                    </span>
                    {accessory.price > 100 && (
                      <span className="text-sm text-gray-500 line-through">
                        ${(accessory.price * 1.2).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                {accessory.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {accessory.description}
                  </p>
                )}

                {/* Features */}
                {accessory.features && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {Object.values(accessory.features.features || {}).slice(0, 3).map((feature: any, index: number) => (
                        <span key={index} className="inline-flex items-center text-xs bg-gradient-to-r from-green-100 to-green-200 text-green-800 px-3 py-1 rounded-full font-medium">
                          ✓ {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Shipping Info */}
                {accessory.requires_shipping && (
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 text-xs bg-blue-50 text-blue-700 px-3 py-2 rounded-lg">
                      <Truck size={14} />
                      <span className="font-medium">{t('accessories.requires_shipping')}</span>
                    </div>
                  </div>
                )}
                
                {/* Add to Cart Button */}
                <div className="space-y-3">
                  {quantity > 0 ? (
                    <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                      <button
                        onClick={() => updateQuantity(`accessory-${accessory.id}`, quantity - 1)}
                        className="flex items-center justify-center w-8 h-8 bg-white text-blue-600 rounded-full hover:bg-blue-50 transition-colors shadow-sm"
                      >
                        <Minus size={16} />
                      </button>
                      <div className="text-center">
                        <span className="block text-lg font-bold text-blue-600">{quantity}</span>
                        <span className="text-xs text-blue-500">{t('accessories.in_cart')}</span>
                      </div>
                      <button
                        onClick={() => updateQuantity(`accessory-${accessory.id}`, quantity + 1)}
                        className="flex items-center justify-center w-8 h-8 bg-white text-blue-600 rounded-full hover:bg-blue-50 transition-colors shadow-sm"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAddToCart(accessory)}
                      disabled={accessory.stock_quantity === 0}
                      className={`w-full py-3 px-6 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 ${
                        accessory.stock_quantity === 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                      }`}
                    >
                      <ShoppingCart size={18} />
                      <span>
                        {accessory.stock_quantity === 0 ? t('accessories.out_of_stock') : t('accessories.add_to_cart')}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Enhanced No Products Message */}
      {filteredAccessories.length === 0 && (
        <div className="text-center py-16">
          <div className="bg-white rounded-2xl shadow-lg p-12 border border-gray-100 max-w-md mx-auto">
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-full p-6 w-24 h-24 mx-auto mb-6">
              <Package className="text-blue-600 w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              {t('accessories.no_products_found')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('accessories.try_different_category')}
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchTerm('');
                setPriceRange([0, 1000]);
              }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
            >
              {t('accessories.reset_filters')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TravelAccessories;