import { useState, useEffect, createContext, useContext } from 'react';
import { CartItem } from '../lib/types';

interface Cart {
  items: CartItem[];
}

interface CartContextType {
  cart: Cart;
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalAmount: () => number;
  getTotalItems: () => number;
  getItemQuantity: (id: string) => number;
  hasShippingItems: () => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const useCartState = () => {
  const [cart, setCart] = useState<Cart>({ items: [] });

  useEffect(() => {
    const savedCart = localStorage.getItem('tarim-cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        if (parsedCart && Array.isArray(parsedCart.items)) {
          setCart(parsedCart);
        } else {
          setCart({ items: [] });
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        setCart({ items: [] });
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tarim-cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (newItemData: Omit<CartItem, 'quantity'>) => {
    setCart(currentCart => {
      const existingItem = currentCart.items.find(item => item.id === newItemData.id);
      
      if (existingItem) {
        const updatedItems = currentCart.items.map(item =>
          item.id === newItemData.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        return { ...currentCart, items: updatedItems };
      } else {
        const newItems = [...currentCart.items, { ...newItemData, quantity: 1 }];
        return { ...currentCart, items: newItems };
      }
    });
  };

  const removeFromCart = (id: string) => {
    setCart(currentCart => ({
      ...currentCart,
      items: currentCart.items.filter(item => item.id !== id)
    }));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCart(currentCart => ({
      ...currentCart,
      items: currentCart.items.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    }));
  };

  const clearCart = () => {
    setCart({ items: [] });
  };

  const getTotalAmount = () => {
    return cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getItemQuantity = (id: string) => {
    const item = cart.items.find(item => item.id === id);
    return item ? item.quantity : 0;
  };

  const hasShippingItems = () => {
    return cart.items.some(item => item.product_type === 'travel-accessory');
  };

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalAmount,
    getTotalItems,
    getItemQuantity,
    hasShippingItems
  };
};

export { CartContext };
