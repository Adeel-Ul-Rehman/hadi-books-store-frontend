import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiHeart, FiArrowLeft, FiShoppingCart } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Title from '../components/Title';

const Wishlist = () => {
  const { products, wishlistItems, removeFromWishlist, addToCart, getWishlistCount, user, loading, currency } = useContext(ShopContext);
  const navigate = useNavigate();

  const wishlistProducts = products.filter(product =>
    wishlistItems.some(item => item.productId === product.id)
  );

  const handleAddToCart = async (productId) => {
    const success = await addToCart(productId, null, 1);
    if (success) toast.success('Added to cart');
    else toast.error('Failed to add to cart');
  };

  const handleRemoveFromWishlist = async (productId) => {
    const success = await removeFromWishlist(productId);
    if (success) toast.info('Removed from wishlist');
    else toast.error('Failed to remove from wishlist');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-['Poppins',sans-serif]"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-700 hover:text-black transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            Back
          </button>
          <Title text1="MY" text2="WISHLIST" />
          <div className="w-8"></div>
        </div>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-[#00308F] rounded-full animate-spin"></div>
            <p className="text-gray-600 mt-2">Loading wishlist...</p>
          </motion.div>
        )}

        {!loading && getWishlistCount() === 0 && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-r from-gray-100 via-gray-50 to-white rounded-xl shadow-lg p-12 text-center"
          >
            <FiHeart className="mx-auto w-16 h-16 text-red-200 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              There are no products in your wishlist
            </h3>
            <p className="text-gray-600 mb-6">
              Save your favorite books here to view them later
            </p>
            <button
              onClick={() => navigate('/collections')}
              className="px-6 py-3 bg-[#00308F] text-white rounded-lg hover:bg-blue-900 transition-colors"
            >
              Browse Collections
            </button>
          </motion.div>
        )}

        {!loading && getWishlistCount() > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            <AnimatePresence>
              {wishlistProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:scale-105"
                >
                  <div className="relative">
                    <img
                      className="w-full h-48 sm:h-56 object-cover rounded-t-2xl"
                      src={product.image || 'https://placehold.co/300x300?text=Book+Image'}
                      alt={product.name}
                      onError={(e) => { e.target.src = 'https://placehold.co/300x300?text=Book+Image'; e.target.onerror = null; }}
                      loading="lazy"
                    />
                    {product.bestseller && (
                      <span className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-semibold px-2 py-1 rounded-full">
                        Bestseller
                      </span>
                    )}
                    <button
                      onClick={() => handleRemoveFromWishlist(product.id)}
                      className="absolute top-2 right-2 z-10 p-2 rounded-full transition-colors duration-300 bg-red-500 text-white shadow-md hover:shadow-lg"
                      aria-label="Remove from wishlist"
                    >
                      <FiHeart className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-4 flex flex-col h-auto">
                    <p className="text-xs text-gray-500 capitalize truncate">{product.category}</p>
                    <h3 className="text-base font-semibold text-gray-800 truncate mt-1">{product.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="text-sm font-semibold text-[#00308F]">
                        {currency}{product.price.toFixed(2)}
                      </p>
                      {product.originalPrice && (
                        <p className="text-sm text-gray-600 line-through">
                          {currency}{product.originalPrice.toFixed(2)}
                        </p>
                      )}
                    </div>
                    <motion.button
                      onClick={() => handleAddToCart(product.id)}
                      whileTap={{ scale: 0.95 }}
                      className="w-full mt-3 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-red-400 to-orange-500 hover:from-red-500 hover:to-orange-600 text-white transition-transform duration-300 flex items-center justify-center"
                    >
                      <FiShoppingCart className="w-3 h-3 inline-block mr-1" />
                      <span>Add to Cart</span>
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Wishlist;