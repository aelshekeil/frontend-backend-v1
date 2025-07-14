import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../hooks/useCart';
import { CartItem, API_URL } from '../lib/types';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose, onCheckout }) => {
const { t, i18n } = useTranslation();
  const { cart, removeFromCart, updateQuantity, getTotalAmount, clearCart } = useCart();
  const items = cart.items;
  const [animatingItems, setAnimatingItems] = useState<Set<string>>(new Set());
  const [isClosing, setIsClosing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
    }
  }, [isOpen]);

  useEffect(() => {
    i18n.on('languageChanged', () => {
      // Force re-render when language changes
    });

    return () => {
      i18n.off('languageChanged', () => {
        // Clean up event listener
      });
    };
  }, [i18n]);

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  const getItemImage = (item: CartItem) => {
    if (item.image_url) {
      return item.image_url.startsWith('http') 
        ? item.image_url 
        : `${API_URL}${item.image_url}`;
    }
    
    if (item.product_type === 'esim') {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCA0OCAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjMyIiBmaWxsPSIjNGY0NmU1IiByeD0iNCIvPgo8dGV4dCB4PSIyNCIgeT0iMTgiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjgiIHRleHQtYW5jaG9yPSJtaWRkbGUiPmVTSU08L3RleHQ+Cjwvc3ZnPg==';
    }
    
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzMkwyMCAyOEgyOEwyNCAzMloiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    setAnimatingItems(prev => new Set(prev).add(itemId));
    updateQuantity(itemId, newQuantity);
    
    setTimeout(() => {
      setAnimatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }, 400);
  };

  const handleRemoveItem = (itemId: string) => {
    setAnimatingItems(prev => new Set(prev).add(itemId));
    setTimeout(() => {
      removeFromCart(itemId);
      setAnimatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }, 400);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setMounted(false);
      onClose();
    }, 400);
  };

  const EmptyCartAnimation = () => (
    <div className="relative flex flex-col items-center justify-center py-20">
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float 3s ease-in-out infinite ${i * 0.5}s`,
            }}
          />
        ))}
      </div>
      
      {/* Main cart icon with pulse animation */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 animate-ping"></div>
        <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 p-6 rounded-full">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9m-9 0h9" />
          </svg>
        </div>
      </div>
      
<h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-3">
    {t('common.your_cart_is_empty')}
      </h3>
      <p className="text-gray-500 text-center max-w-xs leading-relaxed">
        {t('common.start_adding_travel_experiences')}
      </p>
    </div>
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Ultra-modern backdrop with animated gradient */}
      <div 
        className={`fixed inset-0 z-40 transition-all duration-500 ease-out ${
          isClosing 
            ? 'opacity-0 backdrop-blur-0' 
            : 'opacity-100 backdrop-blur-xl'
        }`}
        style={{
          background: isClosing 
            ? 'transparent' 
            : 'linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(59,130,246,0.05) 50%, rgba(147,51,234,0.1) 100%)'
        }}
        onClick={handleClose}
      />
      
      {/* Futuristic Sidebar */}
      <div className={`fixed right-0 top-0 h-full w-[28rem] z-50 flex flex-col transform transition-all duration-500 ease-out ${
        isClosing ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
      }`}>
        {/* Glassmorphism container */}
        <div className="h-full bg-white/80 backdrop-blur-2xl border-l border-white/20 shadow-2xl shadow-black/10 flex flex-col">
          {/* Futuristic Header */}
          <div className="relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 animate-pulse"></div>
            
            {/* Grid pattern overlay */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}></div>
            </div>
            
            <div className="relative p-8 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-20"></div>
                  </div>
                  <div>
<h2 className="text-2xl font-bold tracking-tight">{t('common.cart')}</h2>
<p className="text-blue-200 text-sm font-medium">
                      {items.length} {items.length === 1 ? t('common.item') : t('common.items')} • {formatPrice(getTotalAmount())}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="group relative p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300"
                >
                  <svg className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Modern Cart Items */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <EmptyCartAnimation />
            ) : (
              <div className="space-y-4">
                {items.map((item: CartItem, index) => (
                  <div 
                    key={item.id} 
                    className={`group relative transition-all duration-500 ease-out ${
                      animatingItems.has(item.id) 
                        ? 'scale-95 opacity-0 translate-x-8' 
                        : 'scale-100 opacity-100 translate-x-0'
                    }`}
                    style={{
                      animationDelay: `${index * 0.1}s`,
                      animation: mounted ? `slideInFromRight 0.6s ease-out ${index * 0.1}s both` : 'none'
                    }}
                  >
                    {/* Glassmorphism card */}
                    <div className="relative bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-white/30 shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-black/10 transition-all duration-300 hover:-translate-y-1">
                      {/* Floating quantity indicator */}
                      <div className="absolute -top-3 -right-3 z-10">
                        <div className="relative">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                            {item.quantity}
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-ping opacity-20"></div>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4">
                        {/* Enhanced image with hover effects */}
                        <div className="relative group/image">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl blur-sm group-hover/image:blur-none transition-all duration-300"></div>
                          <img
                            src={getItemImage(item)}
                            alt={item.name}
                            className="relative w-20 h-20 object-cover rounded-2xl border-2 border-white/50 shadow-lg group-hover:scale-105 transition-transform duration-300"
                          />
                          {item.product_type === 'esim' && (
                            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-lg">
                              eSIM
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-gray-900 truncate group-hover:text-blue-600 transition-colors mb-2">
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-4 flex items-center">
                            <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                            {formatPrice(item.price)} each
                          </p>
                          
                          {/* Ultra-modern quantity controls */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center bg-gray-100/80 backdrop-blur-sm rounded-2xl p-1 shadow-inner">
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="w-10 h-10 rounded-xl bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center text-gray-600 hover:text-blue-600 hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <svg className="w-4 h-4 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
                                </svg>
                              </button>
                              <span className="mx-4 font-bold text-gray-900 min-w-[2rem] text-center text-lg">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                className="w-10 h-10 rounded-xl bg-white/80 backdrop-blur-sm shadow-md flex items-center justify-center text-gray-600 hover:text-blue-600 hover:shadow-lg hover:scale-105 transition-all duration-200"
                              >
                                <svg className="w-4 h-4 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                              </button>
                            </div>
                            
                            <div className="text-right">
                              <p className="font-black text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
                                {formatPrice(item.price * item.quantity)}
                              </p>
<button
                                onClick={() => handleRemoveItem(item.id)}
                                className="text-red-500 hover:text-red-700 text-sm font-bold hover:underline transition-all duration-200 hover:scale-105"
                              >
                                {t('common.remove')}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Futuristic Footer */}
          {items.length > 0 && (
            <div className="relative p-6 bg-gradient-to-t from-gray-50/80 to-transparent backdrop-blur-xl border-t border-white/30">
              {/* Animated background elements */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50"></div>
              
              <div className="relative space-y-6">
                {/* Ultra-modern order summary */}
                <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-white/40 shadow-xl">
                  <div className="space-y-3">
<div className="flex justify-between items-center text-gray-600">
                      <span className="flex items-center">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                        {t('common.subtotal')}
                      </span>
                      <span className="font-semibold">{formatPrice(getTotalAmount())}</span>
                    </div>
<div className="flex justify-between items-center text-gray-600">
                      <span className="flex items-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                        {t('common.shipping')}
                      </span>
                      <span className="font-semibold text-green-600">{t('common.free')}</span>
                    </div>
<div className="border-t border-gray-200/50 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-gray-900">{t('common.total_price')}</span>
                        <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          {formatPrice(getTotalAmount())}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Futuristic action buttons */}
                <div className="space-y-3">
                  <button
                    onClick={onCheckout}
                    className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-[1px] shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300"
                  >
                    <div className="relative rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 text-white font-bold text-lg">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
<span className="relative flex items-center justify-center">
                        {t('common.proceed_to_checkout')}
                        <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                    </div>
                  </button>
                  
<button
                    onClick={clearCart}
                    className="w-full bg-white/60 backdrop-blur-sm text-gray-700 py-3 px-6 rounded-2xl hover:bg-white/80 transition-all duration-300 font-semibold border border-white/40 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  >
                    {t('common.clear_cart')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced CSS animations */}
      <style>{`
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(50px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(180deg); }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        .animate-shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
      `}</style>
    </>
  );
};

export default CartSidebar;
