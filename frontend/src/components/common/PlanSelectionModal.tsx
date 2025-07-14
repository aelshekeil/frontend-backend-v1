import React, { useState, useEffect } from 'react';
import { Country, EsimPlan } from '../lib/esimApi';

interface PlanSelectionModalProps {
  country: Country | null;
  isOpen: boolean;
  onClose: () => void;
  onPlanSelect: (plan: EsimPlan, country: Country) => void;
}

const PlanSelectionModal: React.FC<PlanSelectionModalProps> = ({
  country,
  isOpen,
  onClose,
  onPlanSelect
}) => {
  const [selectedPlan, setSelectedPlan] = useState<EsimPlan | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [sortBy, setSortBy] = useState<'price' | 'data' | 'duration'>('price');
  const [filterData, setFilterData] = useState<string>('all');

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedPlan(null);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
    }
  }, [isOpen]);

  if (!isOpen || !country) return null;

  const getFlagUrl = (country: Country) => {
    if (country.flag_icon?.url) {
      return country.flag_icon.url.startsWith('http')
        ? country.flag_icon.url
        : `${process.env.REACT_APP_API_URL || 'https://back.tarimtours.com'}${country.flag_icon.url}`;
    }

    const countryCode = getCountryCode(country.name);
    if (countryCode) {
      return `https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`;
    }

    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCA0OCAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjMyIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAyMEwyMCAxNkgyOEwyNCAyMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
  };

  const getCountryCode = (countryName: string): string | null => {
    const map: Record<string, string> = {
      'united states': 'us',
      'united kingdom': 'gb',
      germany: 'de',
      france: 'fr',
      italy: 'it',
      spain: 'es',
      japan: 'jp',
      china: 'cn',
      india: 'in',
      australia: 'au',
      canada: 'ca',
      brazil: 'br',
      mexico: 'mx',
      russia: 'ru',
      'south korea': 'kr',
      thailand: 'th',
      singapore: 'sg',
      malaysia: 'my',
      indonesia: 'id',
      philippines: 'ph',
      vietnam: 'vn',
      turkey: 'tr',
      egypt: 'eg',
      'south africa': 'za',
      nigeria: 'ng',
      kenya: 'ke',
      morocco: 'ma',
      tunisia: 'tn',
      algeria: 'dz',
      ghana: 'gh',
      ethiopia: 'et',
      uganda: 'ug',
      tanzania: 'tz'
    };
    return map[countryName.toLowerCase()] || null;
  };

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  const getPlanDuration = (productName: string) => {
    const match = productName.match(/(\d+)days?/i);
    return match ? `${match[1]} days` : 'Duration varies';
  };

  const getDurationInDays = (productName: string) => {
    const match = productName.match(/(\d+)days?/i);
    return match ? parseInt(match[1]) : 0;
  };

  const handlePlanSelect = (plan: EsimPlan) => {
    setSelectedPlan(plan);
    setTimeout(() => {
      onPlanSelect(plan, country);
      onClose();
    }, 200);
  };

  const plans = country.Country || [];

  // Enhanced filtering and sorting
  const filteredPlans = plans.filter(plan => {
    if (filterData === 'all') return true;
    return plan.data_gb === filterData;
  });

  const sortedPlans = [...filteredPlans].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.net_price_usd - b.net_price_usd;
      case 'data':
        return parseFloat(a.data_gb.replace(/[^\d.]/g, '')) - parseFloat(b.data_gb.replace(/[^\d.]/g, ''));
      case 'duration':
        return getDurationInDays(a.product_name) - getDurationInDays(b.product_name);
      default:
        return 0;
    }
  });

  const groupedPlans = sortedPlans.reduce((acc: Record<string, EsimPlan[]>, plan: EsimPlan) => {
    const key = plan.data_gb;
    if (!acc[key]) acc[key] = [];
    acc[key].push(plan);
    return acc;
  }, {});

  const uniqueDataAmounts = [...new Set(plans.map(plan => plan.data_gb))];

  const getPopularBadge = (plan: EsimPlan) => {
    const duration = getDurationInDays(plan.product_name);
    const dataAmount = parseFloat(plan.data_gb.replace(/[^\d.]/g, ''));
    
    if (duration >= 7 && duration <= 30 && dataAmount >= 1 && dataAmount <= 10) {
      return 'Most Popular';
    }
    if (plan.net_price_usd < 10) {
      return 'Best Value';
    }
    if (dataAmount >= 20) {
      return 'High Data';
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`
        bg-white rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden
        transform transition-all duration-300 ease-out
        ${isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}
        shadow-2xl
      `}>
        {/* Enhanced Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={getFlagUrl(country)}
                  alt={`${country.name} flag`}
                  className="w-12 h-8 object-cover rounded-lg border-2 border-white/30 shadow-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCA0OCAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjMyIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAyMEwyMCAxNkgyOEwyNCAyMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                  }}
                />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h2 className="text-2xl font-bold">{country.name}</h2>
                <p className="text-white/80 text-sm">
                  {plans.length} eSIM plans available • Choose your perfect plan
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Decorative wave */}
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-white" 
               style={{clipPath: 'polygon(0 100%, 100% 100%, 100% 0, 0 80%)'}}>
          </div>
        </div>

        {/* Enhanced Controls */}
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'price' | 'data' | 'duration')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="price">Price (Low to High)</option>
                <option value="data">Data Amount</option>
                <option value="duration">Duration</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Filter:</span>
              <select
                value={filterData}
                onChange={(e) => setFilterData(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="all">All Data Plans</option>
                {uniqueDataAmounts.map(amount => (
                  <option key={amount} value={amount}>{amount}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Enhanced Plans Grid */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
          {Object.keys(groupedPlans).length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Plans Available</h3>
              <p className="text-gray-500">No eSIM plans match your current filter criteria.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedPlans).map(([dataAmount, planList]) => {
                const typedPlans = planList as EsimPlan[];
                return (
                  <div key={dataAmount} className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">{dataAmount} Data Plans</h3>
                      <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {typedPlans.map((plan) => {
                        const isSelected = selectedPlan?.id === plan.id;
                        const popularBadge = getPopularBadge(plan);
                        
                        return (
                          <div
                            key={plan.id}
                            className={`
                              relative group cursor-pointer
                              bg-white border-2 rounded-xl p-6
                              transition-all duration-300 ease-out
                              hover:shadow-xl hover:scale-105 hover:-translate-y-1
                              ${isSelected ? 'border-blue-500 shadow-lg bg-blue-50' : 'border-gray-200 hover:border-blue-300'}
                            `}
                            onClick={() => handlePlanSelect(plan)}
                          >
                            {/* Popular Badge */}
                            {popularBadge && (
                              <div className="absolute -top-3 left-6 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                {popularBadge}
                              </div>
                            )}
                            
                            {/* Plan Header */}
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h4 className="text-lg font-bold text-gray-900 mb-1">{plan.data_gb}</h4>
                                <p className="text-sm text-gray-600 flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {getPlanDuration(plan.product_name)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-blue-600">{formatPrice(plan.net_price_usd)}</p>
                                <p className="text-xs text-gray-500">USD</p>
                              </div>
                            </div>

                            {/* Plan Features */}
                            <div className="space-y-3 mb-6">
                              {plan.sms > 0 && (
                                <div className="flex items-center space-x-3 text-sm text-gray-600">
                                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                  </div>
                                  <span className="font-medium">{plan.sms} SMS included</span>
                                </div>
                              )}
                              {plan.voice > 0 && (
                                <div className="flex items-center space-x-3 text-sm text-gray-600">
                                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                  </div>
                                  <span className="font-medium">{plan.voice} minutes calling</span>
                                </div>
                              )}
                              
                              {/* Data highlight */}
                              <div className="flex items-center space-x-3 text-sm text-gray-600">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                                  </svg>
                                </div>
                                <span className="font-medium">High-speed mobile data</span>
                              </div>
                            </div>

                            {/* Select Button */}
                            <button className={`
                              w-full py-3 px-4 rounded-lg font-semibold
                              transition-all duration-200 transform
                              ${isSelected 
                                ? 'bg-blue-600 text-white shadow-lg' 
                                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 group-hover:shadow-lg'
                              }
                            `}>
                              {isSelected ? 'Selected ✓' : 'Select This Plan'}
                            </button>

                            {/* Hover effect overlay */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanSelectionModal;