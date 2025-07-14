import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Wifi from 'lucide-react/dist/esm/icons/wifi';
import Package from 'lucide-react/dist/esm/icons/package';
import Plane from 'lucide-react/dist/esm/icons/plane';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import Globe from 'lucide-react/dist/esm/icons/globe';
import Star from 'lucide-react/dist/esm/icons/star';

const Shop: React.FC = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const shopItems = [
    {
      id: 1,
      icon: Wifi,
      title: t('shop.esim.title'),
      description: t('shop.esim.description'),
      button: t('shop.esim.button'),
      href: '#/esim',
      gradient: 'from-blue-600 to-indigo-600',
      hoverGradient: 'from-blue-700 to-indigo-700',
      iconBg: 'from-blue-100 to-indigo-200',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-500',
      features: ['Instant Activation', 'Global Coverage', '24/7 Support'],
      badge: 'Popular'
    },
    {
      id: 2,
      icon: Package,
      title: t('shop.accessories.title'),
      description: t('shop.accessories.description'),
      button: t('shop.accessories.button'),
      href: '#/accessories',
      gradient: 'from-emerald-600 to-teal-500',
      hoverGradient: 'from-emerald-700 to-teal-600',
      iconBg: 'from-green-100 to-emerald-200',
      iconColor: 'text-emerald-600',
      borderColor: 'border-emerald-500',
      features: ['Premium Quality', 'Travel Ready', 'Warranty Included'],
      badge: 'New'
    },
    {
      id: 3,
      icon: Plane,
      title: t('shop.packages.title'),
      description: t('shop.packages.description'),
      button: t('shop.packages.button'),
      href: '#/travel-packages',
      gradient: 'from-purple-600 to-pink-500',
      hoverGradient: 'from-purple-700 to-pink-600',
      iconBg: 'from-purple-100 to-pink-200',
      iconColor: 'text-purple-600',
      borderColor: 'border-purple-500',
      features: ['All Inclusive', 'Expert Guides', 'Flexible Dates'],
      badge: 'Best Value'
    }
  ];

  const FloatingElements = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 2}s`
          }}
        >
          <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-20 px-4 relative overflow-hidden">
      <FloatingElements />

      {/* Hero Section */}
      <div className={`max-w-6xl mx-auto text-center mb-20 relative z-10 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="relative inline-block mb-6">
          <Globe className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" style={{animationDuration: '20s'}} />
          <div className="absolute -top-2 -right-2">
            <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
          </div>
        </div>
        
        <h1 className="text-6xl md:text-7xl font-bold text-slate-900 mb-6 tracking-tight bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-700 bg-clip-text text-transparent">
          {t('shop.title')}
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
          {t('shop.subtitle')}
        </p>
        
        <div className="mt-8 flex justify-center items-center space-x-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
          ))}
          <span className="ml-2 text-slate-600 font-medium">Trusted by 10,000+ travelers</span>
        </div>
      </div>

      {/* Shop Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto relative z-10">
        {shopItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <div
              key={item.id}
              className={`relative bg-white rounded-3xl shadow-xl overflow-hidden group transform transition-all duration-500 ease-out hover:-translate-y-3 hover:shadow-2xl border-b-4 border-transparent hover:${item.borderColor} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{
                transitionDelay: `${index * 200}ms`,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.95) 100%)'
              }}
            >
              {/* Badge */}
              <div className="absolute top-4 right-4 z-20">
                <span className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${item.gradient} shadow-lg animate-pulse-glow`}>
                  {item.badge}
                </span>
              </div>

              {/* Card Content */}
              <div className="p-8 text-center relative">
                {/* Icon Container */}
                <div className={`w-28 h-28 mx-auto mb-6 rounded-full bg-gradient-to-br ${item.iconBg} flex items-center justify-center shadow-inner relative group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent 
                    className={`${item.iconColor} w-14 h-14 group-hover:rotate-12 transition-transform duration-300`} 
                  />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-slate-800 mb-4 group-hover:text-slate-900 transition-colors">
                  {item.title}
                </h2>

                {/* Description */}
                <p className="text-slate-600 mb-6 px-2 leading-relaxed">
                  {item.description}
                </p>

                {/* Features */}
                <div className="mb-8">
                  <ul className="space-y-2">
                    {item.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center justify-center text-sm text-slate-500">
                        <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mr-2"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Button */}
                <a
                  href={item.href}
                  className={`inline-block bg-gradient-to-r ${item.gradient} hover:${item.hoverGradient} text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 relative overflow-hidden shimmer-effect`}
                >
                  <span className="relative z-10">{item.button}</span>
                </a>
              </div>

              {/* Hover Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`}></div>
            </div>
          );
        })}
      </div>

      {/* Bottom Section */}
      <div className="mt-20 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
            <h3 className="text-2xl font-bold text-slate-800 mb-4">
              Why Choose Tarim Tours?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-3">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-slate-700 mb-1">Premium Quality</h4>
                <p className="text-sm text-slate-600">Only the finest travel products and services</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mb-3">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-slate-700 mb-1">Global Reach</h4>
                <p className="text-sm text-slate-600">Worldwide coverage for all your adventures</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-3">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-slate-700 mb-1">24/7 Support</h4>
                <p className="text-sm text-slate-600">Round-the-clock assistance wherever you are</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
