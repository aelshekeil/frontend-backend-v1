import * as React from 'react';
import { useTranslation } from 'react-i18next';
import Mail from 'lucide-react/dist/esm/icons/mail';
import Phone from 'lucide-react/dist/esm/icons/phone';
import MapPin from 'lucide-react/dist/esm/icons/map-pin';
import Facebook from 'lucide-react/dist/esm/icons/facebook';
import Twitter from 'lucide-react/dist/esm/icons/twitter';
import Instagram from 'lucide-react/dist/esm/icons/instagram';
import Linkedin from 'lucide-react/dist/esm/icons/linkedin';
import ArrowUp from 'lucide-react/dist/esm/icons/arrow-up';

const Footer: React.FC = () => {
  const { t } = useTranslation();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-teal-500 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Main footer content */}
      <div className="relative z-10 py-16">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
            {/* Company Info */}
            <div className="group">
              <div className="mb-6">
                <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                  Tarim Tours
                </h3>
                <div className="w-12 h-1 bg-gradient-to-r from-blue-400 to-teal-400 rounded-full mb-4 group-hover:w-16 transition-all duration-300"></div>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                {t('common.trusted_partner')}
              </p>
              <div className="flex space-x-4">
                <div className="p-2 bg-gray-800 rounded-full hover:bg-blue-600 transition-all duration-300 hover:scale-110 cursor-pointer group">
                  <Facebook size={20} className="text-gray-400 group-hover:text-white transition-colors" />
                </div>
                <div className="p-2 bg-gray-800 rounded-full hover:bg-blue-500 transition-all duration-300 hover:scale-110 cursor-pointer group">
                  <Twitter size={20} className="text-gray-400 group-hover:text-white transition-colors" />
                </div>
                <div className="p-2 bg-gray-800 rounded-full hover:bg-pink-600 transition-all duration-300 hover:scale-110 cursor-pointer group">
                  <Instagram size={20} className="text-gray-400 group-hover:text-white transition-colors" />
                </div>
                <div className="p-2 bg-gray-800 rounded-full hover:bg-blue-700 transition-all duration-300 hover:scale-110 cursor-pointer group">
                  <Linkedin size={20} className="text-gray-400 group-hover:text-white transition-colors" />
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="group">
              <h4 className="text-xl font-semibold mb-6 text-white relative">
                {t('common.services_title')}
                <div className="absolute -bottom-2 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-teal-400 group-hover:w-full transition-all duration-300"></div>
              </h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-300 hover:text-blue-400 transition-all duration-300 flex items-center group/link">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 opacity-0 group-hover/link:opacity-100 transition-opacity duration-300"></span>
                    <span className="group-hover/link:translate-x-1 transition-transform duration-300">{t('common.visa_services_link')}</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-blue-400 transition-all duration-300 flex items-center group/link">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 opacity-0 group-hover/link:opacity-100 transition-opacity duration-300"></span>
                    <span className="group-hover/link:translate-x-1 transition-transform duration-300">{t('common.idl_link')}</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-blue-400 transition-all duration-300 flex items-center group/link">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 opacity-0 group-hover/link:opacity-100 transition-opacity duration-300"></span>
                    <span className="group-hover/link:translate-x-1 transition-transform duration-300">{t('common.business_incorporation_link')}</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-blue-400 transition-all duration-300 flex items-center group/link">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 opacity-0 group-hover/link:opacity-100 transition-opacity duration-300"></span>
                    <span className="group-hover/link:translate-x-1 transition-transform duration-300">{t('common.travel_packages_link')}</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-blue-400 transition-all duration-300 flex items-center group/link">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 opacity-0 group-hover/link:opacity-100 transition-opacity duration-300"></span>
                    <span className="group-hover/link:translate-x-1 transition-transform duration-300">{t('common.esim_sales_link')}</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Quick Links */}
            <div className="group">
              <h4 className="text-xl font-semibold mb-6 text-white relative">
                {t('common.quick_links_title')}
                <div className="absolute -bottom-2 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-teal-400 group-hover:w-full transition-all duration-300"></div>
              </h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-300 hover:text-blue-400 transition-all duration-300 flex items-center group/link">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 opacity-0 group-hover/link:opacity-100 transition-opacity duration-300"></span>
                    <span className="group-hover/link:translate-x-1 transition-transform duration-300">{t('common.about_us_link')}</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-blue-400 transition-all duration-300 flex items-center group/link">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 opacity-0 group-hover/link:opacity-100 transition-opacity duration-300"></span>
                    <span className="group-hover/link:translate-x-1 transition-transform duration-300">{t('common.track_application_link')}</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-blue-400 transition-all duration-300 flex items-center group/link">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 opacity-0 group-hover/link:opacity-100 transition-opacity duration-300"></span>
                    <span className="group-hover/link:translate-x-1 transition-transform duration-300">{t('common.faq_link')}</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-blue-400 transition-all duration-300 flex items-center group/link">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 opacity-0 group-hover/link:opacity-100 transition-opacity duration-300"></span>
                    <span className="group-hover/link:translate-x-1 transition-transform duration-300">{t('common.terms_conditions_link')}</span>
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-blue-400 transition-all duration-300 flex items-center group/link">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 opacity-0 group-hover/link:opacity-100 transition-opacity duration-300"></span>
                    <span className="group-hover/link:translate-x-1 transition-transform duration-300">{t('common.privacy_policy_link')}</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="group">
              <h4 className="text-xl font-semibold mb-6 text-white relative">
                {t('common.contact_us')}
                <div className="absolute -bottom-2 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-teal-400 group-hover:w-full transition-all duration-300"></div>
              </h4>
              <div className="space-y-4">
                <div className="flex items-center group/contact hover:bg-gray-800/50 p-3 rounded-lg transition-all duration-300">
                  <div className="p-2 bg-blue-500/20 rounded-full mr-4 group-hover/contact:bg-blue-500 transition-all duration-300">
                    <Mail size={16} className="text-blue-400 group-hover/contact:text-white transition-colors" />
                  </div>
                  <span className="text-gray-300 group-hover/contact:text-white transition-colors">info@tarimtours.com</span>
                </div>
                <div className="flex items-center group/contact hover:bg-gray-800/50 p-3 rounded-lg transition-all duration-300">
                  <div className="p-2 bg-green-500/20 rounded-full mr-4 group-hover/contact:bg-green-500 transition-all duration-300">
                    <Phone size={16} className="text-green-400 group-hover/contact:text-white transition-colors" />
                  </div>
                  <span className="text-gray-300 group-hover/contact:text-white transition-colors">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-start group/contact hover:bg-gray-800/50 p-3 rounded-lg transition-all duration-300">
                  <div className="p-2 bg-purple-500/20 rounded-full mr-4 mt-1 group-hover/contact:bg-purple-500 transition-all duration-300">
                    <MapPin size={16} className="text-purple-400 group-hover/contact:text-white transition-colors" />
                  </div>
                  <span className="text-gray-300 group-hover/contact:text-white transition-colors">
                    {t('common.address')}<br />
                    {t('common.city')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section with enhanced styling */}
      <div className="relative z-10 border-t border-gray-700/50 bg-gradient-to-r from-slate-900/80 to-gray-900/80 backdrop-blur-sm">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              {t('common.all_rights_reserved')}
            </p>
            <button
              onClick={scrollToTop}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <ArrowUp size={16} />
              <span className="text-sm">{t('common.back_to_top')}</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
