import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AppContext } from "../context/AppContext";

// Determine the API base URL based on the environment
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://hadi-books-store-backend-4.onrender.com' // Replace with your actual deployed backend URL
    : 'http://localhost:4000'); // Adjust port if your localhost backend uses a different one

const Hero = () => {
  const { apiRequest } = useContext(AppContext);
  const [heroImages, setHeroImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch hero images from backend
  useEffect(() => {
    const fetchHeroImages = async () => {
      try {
        // Use the API_BASE_URL to construct the full endpoint
        const data = await apiRequest('get', `${API_BASE_URL}/api/hero/`);
        if (data.success) {
          setHeroImages(data.data || []);
        } else {
          setError(data.message || "Failed to fetch hero images");
          setHeroImages([]);
        }
      } catch (error) {
        console.error("Fetch Hero Images Error:", error.message);
        setError("Failed to fetch hero images");
        setHeroImages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroImages();
  }, [apiRequest]);

  // Automatic image change
  useEffect(() => {
    if (heroImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000); // 5 seconds interval

    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Navigation functions
  const goToPrevious = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? heroImages.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
  };

  const reelVariants = {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
  };

  // Fallback hero images if API fails
  const fallbackImages = [
    {
      imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=400&fit=crop",
      altText: "Book Collection"
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&h=400&fit=crop",
      altText: "Reading Books"
    }
  ];

  const displayImages = heroImages.length > 0 ? heroImages : fallbackImages;

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-sky-100 via-orange-100 to-red-100 min-h-[500px] flex items-center py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left Side: Text and Buttons */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col justify-center space-y-4 sm:space-y-6 md:space-y-8 text-center md:text-left"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-snug sm:leading-tight"
            >
              Discover Your Next <br className="hidden sm:block" />
              <span className="text-red-500">Favorite Book</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-lg mx-auto md:mx-0 px-2 sm:px-0"
            >
              We offer both{" "}
              <span className="font-semibold text-gray-800">new</span> and
              <span className="font-semibold text-gray-800">
                {" "}
                used books
              </span>{" "}
              at
              <span className="text-red-500 font-semibold">
                {" "}
                affordable prices
              </span>
              . Discover bestsellers, hidden gems, and second-hand treasures —
              all in one place, making reading accessible for everyone.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
            >
              <Link
                to="/collections"
                className="w-full sm:w-40 px-6 py-3 text-center bg-gradient-to-r from-red-400 to-orange-500 text-white font-semibold rounded-lg shadow-md hover:from-red-500 hover:to-orange-600 transition-all duration-300 hover:shadow-lg"
              >
                Shop Now
              </Link>
              <Link
                to="/about"
                className="w-full sm:w-40 px-6 py-3 text-center bg-[#00308F] text-white font-semibold rounded-lg shadow-md hover:bg-[#002266] transition-all duration-300 hover:shadow-lg"
              >
                Learn More
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Side: Image Carousel */}
          <div className="relative flex justify-center items-center h-full">
            <div className="relative w-full h-[250px] sm:h-[350px] md:h-[400px] rounded-xl shadow-xl border-4 border-white overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center h-full bg-gray-200">
                  <svg
                    className="animate-spin h-10 w-10 sm:h-12 sm:w-12 text-orange-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full bg-gray-200 text-gray-600 text-sm sm:text-base">
                  {error}
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  <motion.img
                    key={currentImageIndex}
                    src={displayImages[currentImageIndex]?.imageUrl || fallbackImages[0].imageUrl}
                    alt={displayImages[currentImageIndex]?.altText || "Book Collection"}
                    className="w-full h-full object-cover absolute top-0 left-0"
                    variants={reelVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = fallbackImages[0].imageUrl;
                    }}
                  />
                </AnimatePresence>
              )}
              
              {displayImages.length > 0 && (
                <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 bg-white p-2 sm:p-3 rounded-lg shadow-md text-xs sm:text-sm">
                  <div className="font-medium text-gray-900">Bestsellers</div>
                  <div className="text-gray-500">{displayImages.length} Titles</div>
                </div>
              )}

              {displayImages.length > 1 && (
                <>
                  <button
                    onClick={goToPrevious}
                    className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white p-1 sm:p-2 rounded-full shadow-md hover:bg-gray-100 transition-all duration-300 z-10"
                    aria-label="Previous book"
                  >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" />
                  </button>
                  <button
                    onClick={goToNext}
                    className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white p-1 sm:p-2 rounded-full shadow-md hover:bg-gray-100 transition-all duration-300 z-10"
                    aria-label="Next book"
                  >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-40 sm:w-64 h-40 sm:h-64 bg-red-100 rounded-full opacity-20 mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-0 left-0 w-40 sm:w-64 h-40 sm:h-64 bg-sky-100 rounded-full opacity-20 mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-0 right-0 w-40 sm:w-64 h-40 sm:h-64 bg-orange-100 rounded-full opacity-20 mix-blend-multiply filter blur-3xl animate-blob"></div>
      </div>
    </div>
  );
};

export default Hero;