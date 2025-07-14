import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CountryGrid from './CountryGrid';
import PlanSelectionModal from './PlanSelectionModal';
import { Country, EsimPlan } from '../lib/esimApi';
import { useCart } from '../hooks/useCart';

const EnhancedESIMShop: React.FC = () => {
  const { t } = useTranslation();
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToCart } = useCart();

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCountry(null);
  };

  const handlePlanSelect = (plan: EsimPlan, country: Country) => {
    const cartItem = {
      id: `esim-${plan.id}`,
      name: `${country.name} - ${plan.data_gb}`,
      price: plan.net_price_usd,
      quantity: 1,
      type: 'esim' as const,
      image: country.flag_icon?.url || '',
      description: `eSIM plan for ${country.name} with ${plan.data_gb} data`,
      metadata: {
        country: country.name,
        data: plan.data_gb,
        sms: plan.sms,
        voice: plan.voice,
        product_name: plan.product_name
      },
      product_type: 'esim' as const,
      product_id: plan.id
    };

    addToCart(cartItem);

    // Enhanced success notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 ease-in-out opacity-0 translate-y-[-20px]';
    notification.innerHTML = `
      <div class="flex items-center space-x-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>${t('enhanced_esim_shop.added_to_cart', { countryName: country.name, planData: plan.data_gb })}</span>
      </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateY(0)';
    }, 100);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(-20px)';
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header with Gradient and Animation */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        </div>
        
        {/* Floating Network Icons */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 animate-float">
            <div className="w-8 h-8 bg-white/20 rounded-full"></div>
          </div>
          <div className="absolute top-32 right-20 animate-float-delayed">
            <div className="w-6 h-6 bg-white/20 rounded-full"></div>
          </div>
          <div className="absolute bottom-20 left-1/4 animate-float-slow">
            <div className="w-4 h-4 bg-white/20 rounded-full"></div>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold text-white mb-6 tracking-tight">
              {t('enhanced_esim_shop.esim_plans')}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
                {t('enhanced_esim_shop.worldwide')}
              </span>
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              {t('enhanced_esim_shop.subtitle')}
            </p>
            
            {/* Stats Bar */}
            <div className="mt-12 flex flex-wrap justify-center gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">190+</div>
                <div className="text-blue-200 text-sm uppercase tracking-wider">{t('enhanced_esim_shop.stats.countries')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">99.9%</div>
                <div className="text-blue-200 text-sm uppercase tracking-wider">{t('enhanced_esim_shop.stats.uptime')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">Instant</div>
                <div className="text-blue-200 text-sm uppercase tracking-wider">{t('enhanced_esim_shop.stats.activation')}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave Border */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg className="relative block w-full h-12" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill="rgb(248 250 252)" fillOpacity="1"></path>
          </svg>
        </div>
      </div>

      {/* Country Grid with Enhanced Container */}
      <div className="relative -mt-1 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('enhanced_esim_shop.choose_destination')}</h2>
            <p className="text-gray-600">{t('enhanced_esim_shop.select_country_prompt')}</p>
          </div>
          <CountryGrid onCountrySelect={handleCountrySelect} />
        </div>
      </div>

      {/* Plan Selection Modal */}
      <PlanSelectionModal
        country={selectedCountry}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onPlanSelect={handlePlanSelect}
      />

      {/* Enhanced Features Section */}
      <div className="bg-white py-20 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('enhanced_esim_shop.why_choose_us')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('enhanced_esim_shop.why_choose_us_subtitle')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 hover:shadow-xl hover:scale-105">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{t('enhanced_esim_shop.features.instant_activation.title')}</h3>
              <p className="text-gray-600 leading-relaxed">{t('enhanced_esim_shop.features.instant_activation.description')}</p>
            </div>

            {/* Feature 2 */}
            <div className="group text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all duration-300 hover:shadow-xl hover:scale-105">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{t('enhanced_esim_shop.features.global_coverage.title')}</h3>
              <p className="text-gray-600 leading-relaxed">{t('enhanced_esim_shop.features.global_coverage.description')}</p>
            </div>

            {/* Feature 3 */}
            <div className="group text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all duration-300 hover:shadow-xl hover:scale-105">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{t('enhanced_esim_shop.features.secure_reliable.title')}</h3>
              <p className="text-gray-600 leading-relaxed">{t('enhanced_esim_shop.features.secure_reliable.description')}</p>
            </div>
          </div>

          {/* Additional Features Grid */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-300">
              <div className="text-3xl mb-2">📱</div>
              <h4 className="font-semibold text-gray-900 mb-1">{t('enhanced_esim_shop.features.easy_setup.title')}</h4>
              <p className="text-sm text-gray-600">{t('enhanced_esim_shop.features.easy_setup.description')}</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-300">
              <div className="text-3xl mb-2">💰</div>
              <h4 className="font-semibold text-gray-900 mb-1">{t('enhanced_esim_shop.features.best_prices.title')}</h4>
              <p className="text-sm text-gray-600">{t('enhanced_esim_shop.features.best_prices.description')}</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-300">
              <div className="text-3xl mb-2">🔄</div>
              <h4 className="font-semibold text-gray-900 mb-1">{t('enhanced_esim_shop.features.no_contracts.title')}</h4>
              <p className="text-sm text-gray-600">{t('enhanced_esim_shop.features.no_contracts.description')}</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-300">
              <div className="text-3xl mb-2">🎧</div>
              <h4 className="font-semibold text-gray-900 mb-1">{t('enhanced_esim_shop.features.support.title')}</h4>
              <p className="text-sm text-gray-600">{t('enhanced_esim_shop.features.support.description')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">{t('enhanced_esim_shop.cta.title')}</h2>
          <p className="text-xl text-indigo-100 mb-8">
            {t('enhanced_esim_shop.cta.subtitle')}
          </p>
          <button className="bg-white text-indigo-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
            {t('enhanced_esim_shop.cta.button')}
          </button>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 4s ease-in-out infinite 1s;
        }
        
        .animate-float-slow {
          animation: float-slow 5s ease-in-out infinite 2s;
        }
      `}</style>
    </div>
  );
};

export default EnhancedESIMShop;
