import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ShoppingCart from 'lucide-react/dist/esm/icons/shopping-cart';
import Wifi from 'lucide-react/dist/esm/icons/wifi';
import Globe from 'lucide-react/dist/esm/icons/globe';
import Plus from 'lucide-react/dist/esm/icons/plus';
import Minus from 'lucide-react/dist/esm/icons/minus';
import strapiAPI from '../lib/api';
import { ESIMProduct, API_URL } from '../lib/types';
import { useCart } from '../hooks/useCart';

const ESIMShop: React.FC = () => {
  const { t } = useTranslation();
  const [esimProducts, setEsimProducts] = useState<ESIMProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { addToCart, getItemQuantity, updateQuantity } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const products = await strapiAPI.getESIMProducts();
        console.log('eSIM products:', products);
        setEsimProducts(products.filter(p => p.is_active));
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = esimProducts.filter(product => 
    selectedCategory === 'all' || product.category === selectedCategory
  );

  const handleAddToCart = (product: ESIMProduct) => {
    addToCart({
      id: `esim-${product.id}`,
      product_type: 'esim',
      product_id: product.id,
      name: `${product.name} - ${product.country}`,
      price: product.price,
      product_details: {
        country: product.country,
        data_amount: product.data_amount,
        validity: product.validity,
      },
      image_url: product.image ? `${API_URL}${product.image.url}` : undefined,
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <p>{t('esim.error_loading')}: {error.message}</p>
        </div>
      </div>
    );
  }

  console.log('ESIMShop component rendering...');
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center mb-8">
        <Wifi className="text-blue-600 mr-3" size={32} />
        <h2 className="text-3xl font-bold">{t('esim.title')}</h2>
      </div>

      {/* Category Filter */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-md transition-colors ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {t('esim.categories.all')}
          </button>
          <button
            onClick={() => setSelectedCategory('global')}
            className={`px-4 py-2 rounded-md transition-colors ${
              selectedCategory === 'global'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {t('esim.categories.global')}
          </button>
          <button
            onClick={() => setSelectedCategory('regional')}
            className={`px-4 py-2 rounded-md transition-colors ${
              selectedCategory === 'regional'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {t('esim.categories.regional')}
          </button>
          <button
            onClick={() => setSelectedCategory('country-specific')}
            className={`px-4 py-2 rounded-md transition-colors ${
              selectedCategory === 'country-specific'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {t('esim.categories.country_specific')}
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => {
          console.log('Mapping product:', product);
          try {
          const quantity = getItemQuantity(`esim-${product.id}`);
          console.log('Product image data:', product.image);
          
          const productCard = (
            <div key={product.id} className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              {/* Product Image */}
              {product.image ? (
                <div className="h-48 bg-gray-100 flex items-center justify-center">
                  <img
                    src={`${API_URL}${product.image.url}`}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              ) : (
                <div className="h-48 bg-gray-200 flex flex-col items-center justify-center text-gray-500 border border-dashed border-gray-400 p-4">
                    <Wifi size={32} className="mb-2" />
                    <span className="text-sm font-semibold">{t('esim.no_image')}</span>
                  </div>
                )}
                
                <div className="p-6">
                  {/* Product Header */}
                  <div className="flex items-center mb-4">
                    <Globe className="text-green-500 mr-2" size={20} />
                    <h3 className="text-xl font-bold">{product.country}</h3>
                  </div>
                  
                  {/* Product Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('esim.data')}:</span>
                      <span className="font-semibold">{product.data_amount}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('esim.validity')}:</span>
                      <span className="font-semibold">{product.validity}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('esim.price')}:</span>
                      <span className="font-bold text-lg text-blue-600">
                        ${product.price}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  {product.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                {/* Features */}
                {product.features && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {Object.values(product.features).slice(0, 3).map((feature: any, index: number) => (
                        <span key={index} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                  {/* Category Badge */}
                  <div className="mb-4">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {product.category.replace('-', ' ')}
                    </span>
                  </div>
                  
                  {/* Add to Cart Button */}
                  {quantity > 0 ? (
                    <div className="flex items-center justify-between bg-blue-50 rounded-md p-2">
                      <button
                        onClick={() => updateQuantity(`esim-${product.id}`, quantity - 1)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Minus size={20} />
                      </button>
                      <span className="font-semibold text-blue-600">
                        {quantity} {t('esim.in_cart')}
                      </span>
                      <button
                        onClick={() => updateQuantity(`esim-${product.id}`, quantity + 1)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAddToCart(product)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <ShoppingCart className="mr-2" size={18} />
                    {t('esim.add_to_cart')}
                  </button>
                )}

                {/* Stock Status */}
                {product.stock_quantity < 10 && (
                  <p className="text-orange-600 text-xs mt-2">
                    {t('esim.stock_status', { count: product.stock_quantity })}
                  </p>
                )}
              </div>
            </div>
            );
            console.log('Product card generated:', productCard);
            return productCard;
          } catch (e) {
            console.error('Error rendering product card:', e, 'for product:', product);
            return null; // Return null to prevent crashing the entire map
          }
        })}
      </div>

      {/* No Products Message */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Wifi className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {t('esim.no_products_found')}
          </h3>
          <p className="text-gray-500">
            {t('esim.try_different_category')}
          </p>
        </div>
      )}
    </div>
  );
};

export default ESIMShop;
