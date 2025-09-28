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
    if (success) {
      toast.success('Added to cart');
    } else {
      toast.error('Failed to add to cart');
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    const success = await removeFromWishlist(productId);
    if (success) {
      toast.info('Removed from wishlist');
      await fetchWishlist(); // Refresh wishlist after removal
    } else {
      toast.error('Failed to remove from wishlist');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 font-['Poppins',sans-serif]"
      style={{
        background: 'linear-gradient(to right, #e0f2fe, #ffedd5, #fecaca)', // same as Home
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center"
            style={{ color: '#374151' }} // fixed gray-700
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
            <p style={{ color: '#4b5563' }} className="mt-2">
              Loading wishlist...
            </p>
          </motion.div>
        )}

        {!loading && getWishlistCount() === 0 && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-xl shadow-lg p-12 text-center"
            style={{
              background: 'linear-gradient(to right, #e0f2fe, #ffedd5, #fecaca)',
            }}
          >
            <FiHeart className="mx-auto w-16 h-16 text-red-300 mb-4" />
            <h3 className="text-xl font-medium mb-2" style={{ color: '#111827' }}>
              There are no products in your wishlist
            </h3>
            <p className="mb-6" style={{ color: '#4b5563' }}>
              Save your favorite books here to view them later
            </p>
            <button
              onClick={() => navigate('/collections')}
              className="px-6 py-3 rounded-lg text-white transition-colors"
              style={{
                backgroundColor: '#00308F',
              }}
            >
              Browse Collections
            </button>
          </motion.div>
        )}

        {!loading && getWishlistCount() > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            <AnimatePresence>
              {wishlistProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-105 min-h-[220px] sm:min-h-[260px] w-full flex flex-col border"
                  style={{
                    background: 'linear-gradient(to right, #e0f2fe, #ffedd5, #fecaca)',
                    borderColor: '#e5e7eb',
                  }}
                >
                  <div className="relative w-full h-40 sm:h-56">
                    <img
                      className="w-full h-full object-cover rounded-t-2xl"
                      src={product.image || 'https://placehold.co/300x300?text=Book+Image'}
                      alt={product.name}
                      onError={(e) => { e.target.src = 'https://placehold.co/300x300?text=Book+Image'; e.target.onerror = null; }}
                      loading="lazy"
                    />
                    {product.bestseller && (
                      <span className="absolute top-2 left-2 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-lg">
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
                  <div className="flex-1 flex flex-col p-3 sm:p-4">
                    <p className="text-xs capitalize line-clamp-1 overflow-hidden text-ellipsis max-w-full" style={{ color: '#6b7280' }}>
                      {product.category}
                    </p>
                    <h3 className="text-xs sm:text-sm font-semibold line-clamp-1 overflow-hidden text-ellipsis max-w-full mt-1" style={{ color: '#111827' }}>
                      {product.name}
                    </h3>
                    <div className="flex items-center space-x-1 mt-1 shrink-0 max-w-full overflow-hidden">
                      <p className="text-xs font-semibold whitespace-nowrap" style={{ color: '#00308F' }}>
                        {currency}{product.price.toFixed(2)}
                      </p>
                      {product.originalPrice && (
                        <p className="text-xs line-through whitespace-nowrap" style={{ color: '#6b7280' }}>
                          {currency}{product.originalPrice.toFixed(2)}
                        </p>
                      )}
                    </div>
                    <motion.button
                      onClick={() => handleAddToCart(product.id)}
                      whileTap={{ scale: 0.95 }}
                      className="w-full mt-3 py-2 text-xs sm:text-sm font-semibold rounded-lg text-white transition-transform duration-300 flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(to right, #f87171, #fb923c)', // red to orange
                      }}
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
