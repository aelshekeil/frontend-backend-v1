import React from 'react';
import ShoppingBag from 'lucide-react/dist/esm/icons/shopping-bag';
import CreditCard from 'lucide-react/dist/esm/icons/credit-card';
import Lock from 'lucide-react/dist/esm/icons/lock';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle';
import { useCart } from '../hooks/useCart';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { CartItem } from '../lib/types';

const Checkout: React.FC = () => {
  const { t } = useTranslation();
  const { cart, getTotalAmount } = useCart();
  const navigate = useNavigate();
  
  const handleContinueShopping = () => {
    console.log('Navigate to shop');
    navigate('/shop'); // Assuming '/shop' is the path to your shop page
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="container-custom py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleContinueShopping}
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">{t('checkout.continue_shopping')}</span>
              </button>
            </div>
            <div className="flex items-center space-x-2 text-slate-600">
              <Lock className="w-4 h-4" />
              <span className="text-sm font-medium">{t('checkout.secure_checkout')}</span>
            </div>
          </div>
        </div>
      </div>

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">{t('checkout.title')}</h1>
          <p className="text-slate-600 text-lg">{t('checkout.review_order')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                <div className="flex items-center space-x-3 text-white">
                  <ShoppingBag className="w-6 h-6" />
                  <h2 className="text-2xl font-bold">{t('checkout.order_summary')}</h2>
                </div>
              </div>
              
              <div className="p-8">
                {cart.items.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                      <ShoppingBag className="w-12 h-12 text-slate-400" />
                    </div>
                    <p className="text-slate-600 text-lg">{t('checkout.cart_empty')}</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {cart.items.map((item: CartItem) => (
                      <div key={item.id} className="group">
                        <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 bg-gradient-to-r from-white to-slate-50">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                              <span className="text-2xl font-bold text-blue-600">
                                {item.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">
                                {item.name}
                              </h3>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                                  {t('checkout.quantity')}: {item.quantity}
                                </span>
                                <span className="text-sm text-slate-500">
                                  ${item.price.toFixed(2)} {t('checkout.each')}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-slate-900">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment & Summary */}
          <div className="space-y-6">
            {/* Total Summary */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6">
                <div className="flex items-center space-x-3 text-white">
                  <CheckCircle className="w-6 h-6" />
                  <h3 className="text-xl font-bold">{t('checkout.order_total')}</h3>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-slate-200">
                    <span className="text-slate-600">{t('checkout.subtotal')}</span>
                    <span className="font-semibold text-slate-900">${getTotalAmount().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-200">
                    <span className="text-slate-600">{t('checkout.shipping')}</span>
                    <span className="font-semibold text-emerald-600">{t('checkout.free')}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-200">
                    <span className="text-slate-600">{t('checkout.tax')}</span>
                    <span className="font-semibold text-slate-900">$0.00</span>
                  </div>
                  <div className="flex justify-between items-center pt-4">
                    <span className="text-xl font-bold text-slate-900">{t('checkout.total')}</span>
                    <span className="text-2xl font-bold text-slate-900">${getTotalAmount().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
                <div className="flex items-center space-x-3 text-white">
                  <CreditCard className="w-6 h-6" />
                  <h3 className="text-xl font-bold">{t('checkout.payment_information')}</h3>
                </div>
              </div>
              
              <div className="p-6">
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                    <CreditCard className="w-8 h-8 text-purple-600" />
                  </div>
                  <p className="text-slate-600 mb-4">{t('checkout.payment_form_placeholder')}</p>
                  <div className="bg-slate-50 rounded-lg p-4 border-2 border-dashed border-slate-200">
                    <p className="text-sm text-slate-500">{t('checkout.payment_form_integrated')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              disabled={cart.items.length === 0}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
            >
              <Lock className="w-5 h-5" />
              <span>{t('checkout.complete_secure_checkout')}</span>
            </button>

            {/* Security Notice */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center space-x-2 mb-2">
                <Lock className="w-4 h-4 text-slate-600" />
                <span className="text-sm font-medium text-slate-700">{t('checkout.secure_payment')}</span>
              </div>
              <p className="text-xs text-slate-600">
                {t('checkout.payment_encrypted')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
