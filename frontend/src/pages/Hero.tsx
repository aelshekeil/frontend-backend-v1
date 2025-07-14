import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';

const Hero: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const services = [
    { name: t('common.visa_services'), route: '/visa-services' },
    { name: t('common.international_driving_license'), route: '/international-driving-license' },
    { name: t('common.business_incorporation'), route: '/business-incorporation' },
    { name: t('common.travel_packages'), route: '/travel-packages' },
    { name: t('hero.esim_solutions'), route: '/esim' }
  ];

  useEffect(() => {
    setIsVisible(true);
    
    const interval = setInterval(() => {
      setCurrentServiceIndex((prev) => (prev + 1) % services.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [services.length]); // Added services.length to dependency array

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-28 h-28 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
        
        {/* Geometric Shapes */}
        <div className="absolute top-1/4 right-1/4 w-6 h-6 bg-white opacity-20 rotate-45 animate-spin-slow"></div>
        <div className="absolute bottom-1/3 left-1/3 w-4 h-4 bg-blue-300 opacity-30 animate-bounce"></div>
        <div className="absolute top-1/2 left-1/6 w-8 h-8 border-2 border-white opacity-20 rounded-full animate-ping"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            {/* Main Heading with Animation */}
            <div className={`transform transition-all duration-1000 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight">
                <span className="bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                  {t('hero.your_gateway_part1')}
                </span>
                <br />
                <span className="relative">
                  <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                    {t('hero.global_travel')}
                  </span>
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></span>
                </span>
                <br />
                <span className="text-white font-light">{t('hero.and_services')}</span>
              </h1>
            </div>

            {/* Animated Service Display */}
            <div className={`transform transition-all duration-1000 delay-300 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              <div className="text-xl md:text-2xl mb-2 text-blue-200">
                {t('hero.specializing_in')}
              </div>
              <div className="h-12 md:h-16 mb-8 flex items-center justify-center">
                <div className="relative">
                  <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent transition-all duration-500">
                    {services[currentServiceIndex].name}
                  </div>
                  <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-400 to-orange-400 transform scale-x-0 animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Service Pills */}
            <div className={`transform transition-all duration-1000 delay-500 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              <div className="flex flex-wrap justify-center gap-3 mb-10 max-w-4xl mx-auto">
                {services.map((service, index) => (
                  <button
                    key={service.name}
                    onClick={() => navigate(service.route)}
                    className={`px-4 py-2 rounded-full border border-white border-opacity-30 backdrop-blur-sm transition-all duration-300 text-sm md:text-base cursor-pointer ${
                      index === currentServiceIndex
                        ? 'bg-white bg-opacity-20 text-yellow-300 border-yellow-300'
                        : 'bg-white bg-opacity-10 text-white hover:bg-opacity-20'
                    }`}
                  >
                    {service.name}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className={`transform transition-all duration-1000 delay-700 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <button 
                  onClick={() => navigate('/services')}
                  className="group relative bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center justify-center space-x-3"
                >
                  <span>{t('hero.explore_services')}</span>
                  <ArrowRight 
                    size={20} 
                    className="group-hover:translate-x-1 transition-transform duration-300" 
                  />
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-full transition-opacity duration-300"></div>
                </button>
                
                <button 
                  onClick={() => navigate('/application-tracking')}
                  className="group relative bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
                >
                  <span className="relative z-10">{t('common.track_application')}</span>
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 rounded-full transition-opacity duration-300"></div>
                </button>
              </div>
            </div>

            {/* Scroll Indicator */}
            <div className={`transform transition-all duration-1000 delay-1000 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              <div className="mt-16 flex flex-col items-center">
                <div className="text-white text-opacity-70 text-sm mb-2">{t('hero.scroll_to_explore')}</div>
                <div className="w-6 h-10 border-2 border-white border-opacity-30 rounded-full flex justify-center">
                  <div className="w-1 h-3 bg-white bg-opacity-70 rounded-full mt-2 animate-bounce"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </section>
  );
};

export default Hero;
