import { useState, FC, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, ShoppingCart, Globe, ChevronDown, LogOut, UserCircle } from 'lucide-react';
import AuthModal from './AuthModal';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import CartSidebar from './CartSidebar';
import useMobile from '../hooks/use-mobile';

const Header: FC = () => {
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isShopMenuOpen, setIsShopMenuOpen] = useState(false);
  const [isServicesMenuOpen, setIsServicesMenuOpen] = useState(false);
  const [isMobileShopOpen, setIsMobileShopOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isLoggedIn, user } = useAuth();
  const { getTotalItems } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMobile();

  useEffect(() => {
    if (!isMobile) {
      setIsMenuOpen(false);
    }
  }, [isMobile]);

  const handleCloseMenus = () => {
    setIsMenuOpen(false);
    setIsShopMenuOpen(false);
    setIsServicesMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  const scrollToSection = (sectionId: string) => {
    handleCloseMenus();
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('jwt');
    window.dispatchEvent(new CustomEvent('authChange'));
    setIsUserMenuOpen(false);
  };

  const getLinkClass = (path: string) => {
    return `relative font-medium transition-all duration-300 group ${
      location.pathname === path 
        ? 'text-blue-600' 
        : 'text-gray-800 hover:text-blue-700'
    }`;
  };

  const getActiveLinkUnderline = (path: string) => {
    return location.pathname === path 
      ? 'absolute -bottom-1 left-0 w-full h-0.5 bg-blue-500 transform scale-x-100 rounded-full' 
      : 'absolute -bottom-1 left-0 w-full h-0.5 bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full';
  };

  return (
    <>
      <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-lg shadow-md border-b border-gray-200' 
          : 'bg-white/90 backdrop-blur-sm'
      }`}>
        <div className="container-custom">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Enhanced Circular Logo */}
            <Link 
              to="/" 
              className="flex items-center space-x-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-2 rounded-full"
              onClick={handleCloseMenus}
            >
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center shadow-md hover:shadow-lg transition-shadow">
                <Globe className="text-white w-5 h-5 lg:w-6 lg:h-6" />
              </div>
              <span className="text-lg lg:text-xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent tracking-tight">
                {t("common.tarim_tours")}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className={`hidden lg:flex items-center ${i18n.language === 'ar' ? 'flex-row-reverse space-x-reverse space-x-8' : 'space-x-8'}`}>
              {/* Shop Dropdown */}
              <div className="relative group">
                <button
                  onMouseEnter={() => setIsShopMenuOpen(true)}
                  onMouseLeave={() => setIsShopMenuOpen(false)}
                  className={`font-medium transition-all duration-300 flex items-center py-2 px-3 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-2 rounded-lg ${
                    location.pathname.startsWith('/shop') || location.pathname.startsWith('/esim') || location.pathname.startsWith('/accessories')
                      ? 'text-blue-600' : 'text-gray-800'
                  }`}
                >
                  {t("common.shop")}
                  <ChevronDown className={`${i18n.language === 'ar' ? 'mr-2' : 'ml-2'} h-4 w-4 transition-transform duration-300 ${
                    isShopMenuOpen ? 'rotate-180' : ''
                  }`} />
                </button>

                {isShopMenuOpen && (
                  <div 
                    className={`absolute top-full ${i18n.language === 'ar' ? 'right-0' : 'left-0'} mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 py-3 z-50`}
                    onMouseEnter={() => setIsShopMenuOpen(true)}
                    onMouseLeave={() => setIsShopMenuOpen(false)}
                  >
                    <div className="px-4 py-2">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">{t("common.shop_products")}</h3>
                    </div>
                    <Link 
                      to="/esim" 
                      className={`block w-full ${i18n.language === 'ar' ? 'text-right' : 'text-left'} px-5 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-300 group border-l-3 border-transparent hover:border-blue-500`} 
                      onClick={handleCloseMenus}
                    >
                      <div className="font-medium flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 transition-all duration-300"></div>
                        {t("common.esim_data")}
                      </div>
                      <div className="text-sm text-gray-500 ml-5 mt-1">{t("common.global_connectivity")}</div>
                    </Link>
                    <Link 
                      to="/accessories" 
                      className={`block w-full ${i18n.language === 'ar' ? 'text-right' : 'text-left'} px-5 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-300 group border-l-3 border-transparent hover:border-blue-500`} 
                      onClick={handleCloseMenus}
                    >
                      <div className="font-medium flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 transition-all duration-300"></div>
                        {t("common.travel_accessories")}
                      </div>
                      <div className="text-sm text-gray-500 ml-5 mt-1">{t("common.essential_travel_gear")}</div>
                    </Link>
                  </div>
                )}
              </div>

              <Link to="/enhanced-travel-packages" className={`${getLinkClass('/enhanced-travel-packages')} py-2 px-3`}>
                {t("common.travel_packages")}
                <span className={getActiveLinkUnderline('/enhanced-travel-packages')}></span>
              </Link>

              {/* Services Dropdown */}
              <div className="relative group">
                <button
                  onMouseEnter={() => setIsServicesMenuOpen(true)}
                  onMouseLeave={() => setIsServicesMenuOpen(false)}
                  className={`font-medium transition-all duration-300 flex items-center py-2 px-3 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-2 rounded-lg ${
                    location.pathname.startsWith('/visa-services') || location.pathname.startsWith('/international-driving-license') || location.pathname.startsWith('/business-incorporation')
                      ? 'text-blue-600' : 'text-gray-800'
                  }`}
                >
                  {t("common.services")}
                  <ChevronDown className={`${i18n.language === 'ar' ? 'mr-2' : 'ml-2'} h-4 w-4 transition-transform duration-300 ${
                    isServicesMenuOpen ? 'rotate-180' : ''
                  }`} />
                </button>

                {isServicesMenuOpen && (
                  <div 
                    className={`absolute top-full ${i18n.language === 'ar' ? 'right-0' : 'left-0'} mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 py-3 z-50`}
                    onMouseEnter={() => setIsServicesMenuOpen(true)}
                    onMouseLeave={() => setIsServicesMenuOpen(false)}
                  >
                    <div className="px-4 py-2">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">{t("common.our_services")}</h3>
                    </div>
                    <Link 
                      to="/visa-services" 
                      className={`block w-full ${i18n.language === 'ar' ? 'text-right' : 'text-left'} px-5 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-300 group border-l-3 border-transparent hover:border-blue-500`} 
                      onClick={handleCloseMenus}
                    >
                      <div className="font-medium flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 transition-all duration-300"></div>
                        {t("common.visa_services")}
                      </div>
                      <div className="text-sm text-gray-500 ml-5 mt-1">{t("common.streamlined_visa")}</div>
                    </Link>
                    <Link 
                      to="/international-driving-license" 
                      className={`block w-full ${i18n.language === 'ar' ? 'text-right' : 'text-left'} px-5 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-300 group border-l-3 border-transparent hover:border-blue-500`} 
                      onClick={handleCloseMenus}
                    >
                      <div className="font-medium flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 transition-all duration-300"></div>
                        {t("common.international_driving_license")}
                      </div>
                      <div className="text-sm text-gray-500 ml-5 mt-1">{t("common.drive_legally")}</div>
                    </Link>
                    <Link 
                      to="/business-incorporation" 
                      className={`block w-full ${i18n.language === 'ar' ? 'text-right' : 'text-left'} px-5 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-300 group border-l-3 border-transparent hover:border-blue-500`} 
                      onClick={handleCloseMenus}
                    >
                      <div className="font-medium flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 transition-all duration-300"></div>
                        {t("common.business_incorporation")}
                      </div>
                      <div className="text-sm text-gray-500 ml-5 mt-1">{t("common.start_business")}</div>
                    </Link>
                  </div>
                )}
              </div>

              <Link to="/tracking" className={`${getLinkClass('/tracking')} py-2 px-3`}>
                {t("common.track_application")}
                <span className={getActiveLinkUnderline('/tracking')}></span>
              </Link>

              <button
                onClick={() => scrollToSection('contact')}
                className="text-gray-800 hover:text-blue-700 font-medium transition-all duration-300 py-2 px-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-2 rounded-lg relative group"
              >
                {t("common.contact")}
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full"></span>
              </button>
            </nav>
            
            {/* Desktop Right Section */}
            <div className="hidden lg:flex items-center space-x-5">
              {/* Language Switcher */}
              <div className="flex items-center space-x-1 bg-gray-100 rounded-full p-1 border border-gray-200">
                <button
                  onClick={() => { i18n.changeLanguage("en"); localStorage.setItem('i18nextLng', 'en'); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                    i18n.language === "en" 
                      ? "bg-blue-600 text-white shadow-inner" 
                      : "text-gray-600 hover:text-blue-600 hover:bg-white"
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => { i18n.changeLanguage("ar"); localStorage.setItem('i18nextLng', 'ar'); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                    i18n.language === "ar" 
                      ? "bg-blue-600 text-white shadow-inner" 
                      : "text-gray-600 hover:text-blue-600 hover:bg-white"
                  }`}
                >
                  عربي
                </button>
              </div>

              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-700 hover:text-blue-700 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-2"
              >
                <ShoppingCart size={20} />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </button>

              {/* User Section */}
              {isLoggedIn ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 text-gray-800 hover:text-blue-700 px-3 py-2 rounded-lg transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-2"
                  >
                    <UserCircle className="w-8 h-8 text-blue-600" />
                    <span className="font-medium text-sm">{user?.username}</span>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                      <div className="px-4 py-2">
                        <p className="text-sm font-medium text-gray-900">{t("common.welcome_back")}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <hr className="my-1 border-gray-100" />
                      <Link 
                        to="/profile" 
                        className="flex items-center space-x-2 px-4 py-2.5 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-300"
                        onClick={handleCloseMenus}
                      >
                        <User className="w-4 h-4" />
                        <span className="text-sm">{t("common.profile")}</span>
                      </Link>
                      <hr className="my-1 border-gray-100" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full px-4 py-2.5 text-red-600 hover:bg-red-50 transition-all duration-300"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm">{t("common.logout")}</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-all duration-300 text-sm font-medium shadow-sm hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-2"
                >
                  {t("common.login")}
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex lg:hidden items-center space-x-3">
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 text-gray-700 rounded-full"
              >
                <ShoppingCart size={20} />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </button>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-gray-700 rounded-full"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div
            className={`lg:hidden fixed inset-0 bg-white z-40 overflow-y-auto pb-8 pt-20 transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
            style={{ height: '100vh' }}
            dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
          >
              <div className="px-5 space-y-1">
                {/* Shop Section */}
                <div className="py-2">
                  <button
                    onClick={() => setIsMobileShopOpen(!isMobileShopOpen)}
                    className={`w-full flex items-center justify-between py-3 text-gray-900 font-medium hover:bg-blue-50 rounded-lg transition-all duration-300 px-5`}
                  >
                    <div className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                      {t("common.shop")}
                    </div>
                    <ChevronDown className={`h-5 w-5 transition-transform ${isMobileShopOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isMobileShopOpen && (
                    <div className="space-y-1 pt-2 pl-8">
                      <Link
                        to="/esim"
                        className={`block w-full ${i18n.language === 'ar' ? 'text-right' : 'text-left'} px-5 py-3 text-gray-700 hover:bg-blue-50 rounded-lg transition-all duration-300`}
                        onClick={handleCloseMenus}
                      >
                        <div className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                          {t("common.esim_data")}
                        </div>
                      </Link>
                      <Link
                        to="/accessories"
                        className={`block w-full ${i18n.language === 'ar' ? 'text-right' : 'text-left'} px-5 py-3 text-gray-700 hover:bg-blue-50 rounded-lg transition-all duration-300`}
                        onClick={handleCloseMenus}
                      >
                        <div className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                          {t("common.travel_accessories")}
                        </div>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Travel Packages */}
                <Link 
                  to="/enhanced-travel-packages" 
                  className={`block w-full ${i18n.language === 'ar' ? 'text-right' : 'text-left'} px-5 py-3 text-gray-900 font-medium hover:bg-blue-50 rounded-lg transition-all duration-300`} 
                  onClick={handleCloseMenus}
                >
                  <div className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                    {t("common.travel_packages")}
                  </div>
                </Link>

                {/* Services Section */}
                <div className="py-2">
                  <button
                    onClick={() => setIsMobileServicesOpen(!isMobileServicesOpen)}
                    className={`w-full flex items-center justify-between py-3 text-gray-900 font-medium hover:bg-blue-50 rounded-lg transition-all duration-300 px-5`}
                  >
                    <div className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                      {t("common.services")}
                    </div>
                    <ChevronDown className={`h-5 w-5 transition-transform ${isMobileServicesOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isMobileServicesOpen && (
                    <div className="space-y-1 pt-2 pl-8">
                      <Link
                        to="/visa-services"
                        className={`block w-full ${i18n.language === 'ar' ? 'text-right' : 'text-left'} px-5 py-3 text-gray-700 hover:bg-blue-50 rounded-lg transition-all duration-300`}
                        onClick={handleCloseMenus}
                      >
                        <div className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                          {t("common.visa_services")}
                        </div>
                      </Link>
                      <Link
                        to="/international-driving-license"
                        className={`block w-full ${i18n.language === 'ar' ? 'text-right' : 'text-left'} px-5 py-3 text-gray-700 hover:bg-blue-50 rounded-lg transition-all duration-300`}
                        onClick={handleCloseMenus}
                      >
                        <div className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                        {t("common.international_driving_license")}
                        </div>
                      </Link>
                      <Link
                        to="/business-incorporation"
                        className={`block w-full ${i18n.language === 'ar' ? 'text-right' : 'text-left'} px-5 py-3 text-gray-700 hover:bg-blue-50 rounded-lg transition-all duration-300`}
                        onClick={handleCloseMenus}
                      >
                        <div className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                          {t("common.business_incorporation")}
                        </div>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Tracking */}
                <Link 
                  to="/tracking" 
                  className={`block w-full ${i18n.language === 'ar' ? 'text-right' : 'text-left'} px-5 py-3 text-gray-900 font-medium hover:bg-blue-50 rounded-lg transition-all duration-300`} 
                  onClick={handleCloseMenus}
                >
                  <div className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                    {t("common.track_application")}
                  </div>
                </Link>

                {/* Contact */}
                <button
                  onClick={() => scrollToSection('contact')}
                  className={`block w-full ${i18n.language === 'ar' ? 'text-right' : 'text-left'} px-5 py-3 text-gray-900 font-medium hover:bg-blue-50 rounded-lg transition-all duration-300`}
                >
                  <div className="flex items-center">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3"></div>
                    {t("common.contact")}
                  </div>
                </button>
                
                {/* Language Switcher */}
                <div className="flex justify-center py-4">
                  <div className="flex items-center bg-gray-100 rounded-full p-1 border border-gray-200">
                    <button
                      onClick={() => { i18n.changeLanguage("en"); localStorage.setItem('i18nextLng', 'en'); }}
                      className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 ${
                        i18n.language === "en" 
                          ? "bg-blue-600 text-white shadow-inner" 
                          : "text-gray-600 hover:text-blue-600 hover:bg-white"
                      }`}
                    >
                      EN
                    </button>
                    <button
                      onClick={() => { i18n.changeLanguage("ar"); localStorage.setItem('i18nextLng', 'ar'); }}
                      className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 ${
                        i18n.language === "ar" 
                          ? "bg-blue-600 text-white shadow-inner" 
                          : "text-gray-600 hover:text-blue-600 hover:bg-white"
                      }`}
                    >
                      عربي
                    </button>
                  </div>
                </div>

                {/* User Section */}
                {isLoggedIn ? (
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex items-center space-x-3 px-5 py-3">
                      <UserCircle className="w-10 h-10 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                    </div>
                    <Link 
                      to="/profile" 
                      className="block w-full px-5 py-3 text-gray-700 hover:bg-blue-50 rounded-lg transition-all duration-300"
                      onClick={handleCloseMenus}
                    >
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-3" />
                        <span>{t("common.profile")}</span>
                      </div>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full px-5 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300"
                    >
                      <div className="flex items-center">
                        <LogOut className="w-4 h-4 mr-3" />
                        <span>{t("common.logout")}</span>
                      </div>
                    </button>
                  </div>
                ) : (
                  <div className="pt-4 px-2">
                    <button
                      onClick={() => {
                        setIsAuthModalOpen(true);
                        handleCloseMenus();
                      }}
                      className="w-full bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 text-base font-medium shadow-sm"
                    >
                      {t("common.login_signup")}
                    </button>
                  </div>
                )}
              </div>
            </div>
        </div>
      </header>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
      
      <CartSidebar 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
        onCheckout={handleCheckout}
      />
    </>
  );
};

export default Header;
