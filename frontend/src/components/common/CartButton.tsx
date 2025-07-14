import React, { useState } from 'react';
import ShoppingCart from 'lucide-react/dist/esm/icons/shopping-cart';
import { useCart } from '../hooks/useCart';
import CartSidebar from './CartSidebar';

const CartButton: React.FC = () => {
  const { getTotalItems } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const totalItems = getTotalItems();

  const handleCartClick = () => {
    setIsCartOpen(true);
    // Add subtle animation feedback
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 200);
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    // In a real app, you'd navigate to the checkout page, e.g., using react-router-dom
    window.location.href = '/checkout';
  };

  return (
    <>
      <button
        onClick={handleCartClick}
        className={`
          relative group
          rounded-full p-3
          bg-white shadow-lg hover:shadow-xl
          border border-gray-200 hover:border-blue-300
          text-gray-700 hover:text-blue-600
          transition-all duration-300 ease-in-out
          transform hover:scale-105 active:scale-95
          focus:outline-none focus:ring-4 focus:ring-blue-500/30
          ${isAnimating ? 'animate-pulse' : ''}
        `}
        aria-label={`Shopping cart with ${totalItems} items`}
      >
        {/* Cart Icon with subtle animations */}
        <div className="relative">
          <ShoppingCart 
            size={22} 
            className={`
              transition-transform duration-200 ease-in-out
              ${isAnimating ? 'scale-110' : ''}
            `}
          />
          
          {/* Animated background circle on hover */}
          <div className="absolute inset-0 rounded-full bg-blue-500/10 scale-0 group-hover:scale-150 transition-transform duration-300 ease-out -z-10" />
        </div>

        {/* Enhanced Badge */}
        {totalItems > 0 && (
          <span className={`
            absolute -top-1 -right-1
            min-w-[20px] h-5 px-1.5
            bg-gradient-to-r from-red-500 to-pink-500
            text-white text-xs font-bold
            rounded-full
            flex items-center justify-center
            shadow-lg
            transform transition-all duration-200 ease-in-out
            ${totalItems > 99 ? 'text-[10px]' : ''}
            animate-bounce
          `}>
            {totalItems > 99 ? '99+' : totalItems}
          </span>
        )}

        {/* Subtle glow effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm -z-10" />
      </button>

      {/* Cart Sidebar with enhanced backdrop */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50">
          {/* Enhanced backdrop with blur effect */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsCartOpen(false)}
          />
          
          {/* Sidebar container with slide animation */}
          <div className="relative h-full">
            <CartSidebar
              isOpen={isCartOpen}
              onClose={() => setIsCartOpen(false)}
              onCheckout={handleCheckout}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default CartButton;