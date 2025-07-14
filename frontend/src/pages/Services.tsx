import * as React from 'react';
import { FileText, Car, Building, Plane, Smartphone, ArrowRight, Star, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';

const Services: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const { t } = useTranslation();
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const navigate = useNavigate();

  const services = [
    {
      icon: <FileText size={48} />,
      title: t('common.visa_services_title'),
      description: t('common.visa_services_description'),
      features: [
        t('common.visa_services_feature1'),
        t('common.visa_services_feature2'),
        t('common.visa_services_feature3'),
        t('common.visa_services_feature4')
      ],
      action: t('common.apply_now_action'),
      onClick: () => navigate('/visa-services'),
      requiresAuth: true,
      color: 'from-blue-500 to-indigo-600',
      textColor: 'text-blue-500',
      bgColor: 'bg-blue-50',
      popular: true
    },
    {
      icon: <Car size={48} />,
      title: t('common.international_driving_license_title'),
      description: t('common.international_driving_license_description'),
      features: [
        t('common.international_driving_license_feature1'),
        t('common.international_driving_license_feature2'),
        t('common.international_driving_license_feature3'),
        t('common.international_driving_license_feature4')
      ],
      action: t('common.apply_now_action'),
      onClick: () => navigate('/international-driving-license'),
      requiresAuth: true,
      color: 'from-green-500 to-emerald-600',
      textColor: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    {
      icon: <Building size={48} />,
      title: t('common.business_incorporation_title'),
      description: t('common.business_incorporation_description'),
      features: [
        t('common.business_incorporation_feature1'),
        t('common.business_incorporation_feature2'),
        t('common.business_incorporation_feature3'),
        t('common.business_incorporation_feature4')
      ],
      action: t('common.learn_more_action'),
      onClick: () => navigate('/business-incorporation'),
      requiresAuth: true,
      color: 'from-purple-500 to-violet-600',
      textColor: 'text-purple-500',
      bgColor: 'bg-purple-50'
    },
    {
      icon: <Plane size={48} />,
      title: t('common.travel_packages_title'),
      description: t('common.travel_packages_description'),
      features: [
        t('common.travel_packages_feature1'),
        t('common.travel_packages_feature2'),
        t('common.travel_packages_feature3'),
        t('common.travel_packages_feature4')
      ],
      action: t('common.view_packages_action'),
      onClick: () => navigate('/travel-packages'),
      requiresAuth: false,
      color: 'from-orange-500 to-red-500',
      textColor: 'text-orange-500',
      bgColor: 'bg-orange-50'
    },
    {
      icon: <Smartphone size={48} />,
      title: t('common.esim_sales_title'),
      description: t('common.esim_sales_description'),
      features: [
        t('common.esim_sales_feature1'),
        t('common.esim_sales_feature2'),
        t('common.esim_sales_feature3'),
        t('common.esim_sales_feature4')
      ],
      action: t('common.shop_now_action'),
      onClick: () => navigate('/esim'),
      requiresAuth: false,
      color: 'from-teal-500 to-cyan-600',
      textColor: 'text-teal-500',
      bgColor: 'bg-teal-50'
    }
  ];

  return (
    <section id="services" className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-orange-100 to-pink-100 rounded-full opacity-20 animate-pulse delay-700"></div>
      </div>
      
      <div className="container-custom relative z-10">
        {/* Enhanced header section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6 shadow-lg">
            <Star className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
            {t('common.our_premium_services')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('common.comprehensive_solutions_description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div 
              key={index} 
              className={`relative group cursor-pointer transform transition-all duration-300 hover:scale-105 ${
                hoveredCard === index ? 'z-10' : ''
              }`}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Popular badge */}
              {service.popular && (
                <div className="absolute -top-3 -right-3 z-20">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-bounce">
                    {t('common.most_popular')}
                  </div>
                </div>
              )}

              <div className={`relative overflow-hidden bg-white rounded-2xl shadow-xl border border-gray-100 transition-all duration-300 group-hover:shadow-2xl group-hover:border-transparent ${
                hoveredCard === index ? 'shadow-2xl' : ''
              }`}>
                
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                
                {/* Content */}
                <div className="relative p-8">
                  {/* Icon section with enhanced background */}
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 ${service.bgColor} transition-all duration-300 group-hover:scale-110`}>
                    <div className={service.textColor}>
                      {service.icon}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold mb-4 text-gray-800 group-hover:text-gray-900 transition-colors">
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Features list with enhanced styling */}
                  <ul className="space-y-3 mb-8">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-700 group-hover:text-gray-800 transition-colors">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                        <span className="font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Enhanced CTA button */}
                  <button 
                    className={`w-full relative overflow-hidden bg-gradient-to-r ${service.color} hover:shadow-lg text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 group`}
                    onClick={service.onClick}
                  >
                    <span className="relative z-10">{service.action}</span>
                    <ArrowRight size={16} className="relative z-10 transition-transform group-hover:translate-x-1" />
                    
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  </button>

                  {/* Login required badge */}
                  {service.requiresAuth && !isLoggedIn && (
                    <div className="mt-4 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></div>
                        {t('common.login_required_badge')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Bottom gradient accent */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${service.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA section */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center justify-center space-x-2 text-gray-600 bg-white px-6 py-3 rounded-full shadow-md">
            <span className="text-sm font-medium">{t('common.need_help_choosing')}</span>
            <button className="text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors">
              {t('common.contact_our_experts')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
