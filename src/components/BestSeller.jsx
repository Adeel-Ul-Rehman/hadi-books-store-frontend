import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';
import ProductItems from './ProductItems';
import { motion } from 'framer-motion';
import { FiBook } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom'; // ADD THIS IMPORT

const BestSeller = () => {
  const { products } = useContext(ShopContext);
  const navigate = useNavigate(); // ADD THIS LINE
  const bestSeller = products.filter(item => item.bestseller).slice(0, 6);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto text-center">
        <Title text1={'BEST'} text2={'SELLERS'} />
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-2 text-sm sm:text-base text-gray-600 font-medium font-['Poppins',sans-serif] max-w-2xl mx-auto italic tracking-wide"
        >
          Explore our top-selling books loved by readers and knowledge fans.
        </motion.p>
      </div>
      {bestSeller.length > 0 ? (
        <motion.div
          className="mt-6 max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {bestSeller.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ProductItems
                id={item.id}
                image={item.image}
                name={item.name}
                price={item.price}
                originalPrice={item.originalPrice}
                category={item.category}
                bestseller={item.bestseller}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 max-w-md mx-auto bg-white rounded-2xl shadow-sm p-6 text-center border border-gray-100"
        >
          <FiBook className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400" />
          <h3 className="mt-4 text-lg sm:text-xl font-semibold text-gray-900">No Bestsellers Available</h3>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            No bestsellers available at the moment. Check out our collections!
          </p>
          <button
            onClick={() => navigate('/collections')} // FIXED: Use navigate instead of window.location
            className="mt-4 inline-block px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-red-400 to-orange-500 text-white font-semibold rounded-lg shadow-sm hover:from-red-500 hover:to-orange-600 transition-all duration-300 cursor-pointer text-sm sm:text-base"
          >
            Explore Collections
          </button>
        </motion.div>
      )}
    </motion.section>
  );
};

export default BestSeller;