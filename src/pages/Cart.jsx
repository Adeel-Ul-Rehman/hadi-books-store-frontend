import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { AppContext } from "../context/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiShoppingBag,
  FiShoppingCart,
  FiTrash2,
  FiPlus,
  FiMinus,
  FiChevronRight,
} from "react-icons/fi";
import { toast } from "react-toastify";
import Title from "../components/Title";

const Cart = () => {
  const {
    products,
    currency,
    cartItems,
    removeFromCart,
    updateCart,
    addToCart,
    getCartTotal,
    loading,
    fetchCart,
    TAX_RATE,
    SHIPPING_FEE,
  } = useContext(ShopContext);
  const { user } = useContext(AppContext);
  const [cartData, setCartData] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const tempData = cartItems.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (product) {
        return {
          ...item,
          product: {
            ...product,
            image: Array.isArray(product.image)
              ? product.image[0]
              : product.image,
          },
        };
      } else {
        return {
          ...item,
          product: {
            name: item.name,
            image: item.image,
            price: item.price,
            originalPrice: item.originalPrice,
            category: item.category || "N/A",
          },
        };
      }
    });
    setCartData(tempData);
  }, [cartItems, products]);

  const getImageUrl = (item) => {
    if (!item) return "https://placehold.co/300x300?text=Book+Image";
    if (item.product?.image) {
      const image = item.product.image;
      if (Array.isArray(image) && image.length > 0) return image[0];
      else if (typeof image === "string" && image.trim() !== "") return image;
    }
    if (item.image) {
      if (Array.isArray(item.image) && item.image.length > 0)
        return item.image[0];
      else if (typeof item.image === "string" && item.image.trim() !== "")
        return item.image;
    }
    return "https://placehold.co/300x300?text=Book+Image";
  };

  const calculateSubtotal = () => {
    return cartData
      .reduce((total, item) => {
        return total + (item.product?.price || item.price || 0) * item.quantity;
      }, 0)
      .toFixed(2);
  };

  const handleQuantityChange = async (productId, format, newQuantity) => {
    if (newQuantity < 1 || newQuantity > 10) {
      toast.error(
        newQuantity < 1
          ? "Quantity cannot be less than 1"
          : "Maximum quantity is 10"
      );
      return;
    }
    const success = await updateCart(productId, format, newQuantity);
    if (success) {
      toast.success("Cart updated");
    } else {
      toast.error("Failed to update cart");
    }
  };

  const handleRemoveItem = async (productId, format) => {
    setIsAnimating(true);
    const success = await removeFromCart(productId, format);
    if (success) {
      if (user) await fetchCart();
      toast.success("Item removed from cart");
      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    } else {
      setIsAnimating(false);
      toast.error("Failed to remove item");
    }
  };

  const handleImageError = (e) => {
    if (e.target.src !== "https://placehold.co/300x300?text=Book+Image") {
      e.target.src = "https://placehold.co/300x300?text=Book+Image";
      e.target.onerror = null;
    }
  };

  const handleAddToCart = async (productId, format = null, quantity = 1) => {
    const success = await addToCart(productId, format, quantity);
    if (success) {
      toast.success("Added to cart");
    } else {
      toast.error("Failed to add to cart");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen py-8 px-4 sm:px-6 font-['Poppins',sans-serif]"
    >
      <div className="max-w-7xl mx-auto">
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-3xl md:text-4xl font-thin mb-12 text-center relative inline-block"
        >
          <Title text1={"Your"} text2={"Shopping Cart"} />
        </motion.h1>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
            <p className="text-gray-600 mt-2">Loading cart...</p>
          </motion.div>
        )}

        <AnimatePresence>
          {!loading && cartData.length === 0 ? (
            <motion.div
              key="empty-cart"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center flex flex-col items-center justify-center py-16"
            >
              <div className="bg-white p-8 rounded-full shadow-md mb-6">
                <FiShoppingBag className="text-4xl text-[#00308F] mx-auto" />
              </div>
              <h2 className="text-2xl font-semibold mb-2 text-gray-900">
                Your cart is empty
              </h2>
              <p className="text-gray-600 mb-8 max-w-md">
                Looks like you haven't added anything to your cart yet
              </p>
              <button
                onClick={() => navigate("/collections")}
                className="px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-all duration-300 flex items-center gap-2"
              >
                Continue Shopping <FiChevronRight />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="cart-items"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {/* Cart Items */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="md:col-span-2 space-y-6"
              >
                <AnimatePresence>
                  {cartData.map((item, index) => {
                    const imageUrl = getImageUrl(item);
                    return (
                      <motion.div
                        key={`${item.productId}-${item.format || "default"}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex items-center justify-between p-4"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={imageUrl}
                            alt={item.product?.name || item.name || "Product"}
                            className="w-20 h-20 object-cover rounded-2xl"
                            onError={handleImageError}
                            loading="lazy"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {item.product?.name ||
                                item.name ||
                                "Unknown Product"}
                            </p>
                            <div className="flex items-center space-x-2">
                              <p className="text-xs text-gray-500">
                                {currency}
                                {(
                                  item.product?.price ||
                                  item.price ||
                                  0
                                ).toFixed(2)}
                              </p>
                              {item.product?.originalPrice && (
                                <p className="text-xs text-gray-500 line-through">
                                  {currency}
                                  {(
                                    item.product?.originalPrice ||
                                    item.originalPrice ||
                                    0
                                  ).toFixed(2)}
                                </p>
                              )}
                            </div>
                            {item.format && (
                              <p className="text-xs text-gray-500">
                                Format:{" "}
                                <span className="font-medium">
                                  {item.format}
                                </span>
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  item.productId,
                                  item.format,
                                  item.quantity - 1
                                )
                              }
                              className="p-1 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                              aria-label={`Decrease quantity for ${
                                item.product?.name || item.name
                              }`}
                              disabled={loading || item.quantity <= 1}
                            >
                              <FiMinus />
                            </button>
                            <span className="text-sm font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  item.productId,
                                  item.format,
                                  item.quantity + 1
                                )
                              }
                              className="p-1 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                              aria-label={`Increase quantity for ${
                                item.product?.name || item.name
                              }`}
                              disabled={loading || item.quantity >= 10}
                            >
                              <FiPlus />
                            </button>
                          </div>
                          <button
                            onClick={() =>
                              handleRemoveItem(item.productId, item.format)
                            }
                            className="text-red-500 hover:text-red-700 transition-colors"
                            aria-label={`Remove ${
                              item.product?.name || item.name
                            } from cart`}
                            disabled={loading}
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
              {/* End of Cart Items */}

              {/* Order Summary */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg p-6 flex flex-col gap-4 sticky top-6 max-h-[400px]"
              >
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                  Order Summary
                </h2>
                <div className="space-y-2 flex-1">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>
                      {currency}
                      {calculateSubtotal()}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax ({(TAX_RATE * 100).toFixed(0)}%)</span>
                    <span>
                      {currency}
                      {(calculateSubtotal() * TAX_RATE).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>
                      {currency}
                      {cartData.length > 0 ? SHIPPING_FEE.toFixed(2) : "0.00"}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 text-lg pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span>
                      {currency}
                      {getCartTotal()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (!user) {
                      setShowLoginModal(true);
                    } else {
                      navigate("/place-order");
                    }
                  }}
                  className="w-full py-3 mt-2 text-white font-semibold rounded-xl bg-gradient-to-r from-red-400 to-orange-500 hover:from-red-500 hover:to-orange-600 transition-all duration-300"
                  aria-label="Proceed to checkout"
                  disabled={loading || cartData.length === 0}
                >
                  <FiShoppingCart className="inline-block w-4 h-4 mr-1" />
                  Proceed to Checkout
                </button>
                {showLoginModal && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                  >
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-md w-full">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Log In Required
                        </h3>
                        <button
                          onClick={() => setShowLoginModal(false)}
                          className="text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            ></path>
                          </svg>
                        </button>
                      </div>
                      <p className="text-gray-600 mb-6">
                        Please log in or register to proceed with checkout and
                        place your order.
                      </p>
                      <div className="flex items-center justify-center gap-4">
                        <button
                          onClick={() => navigate("/login?redirect=/cart")}
                          className="px-8 py-3 cursor-pointer bg-gradient-to-r from-red-400 to-orange-500 text-white font-semibold rounded-lg shadow-md hover:from-red-500 hover:to-orange-600 transition-all duration-300 hover:shadow-lg text-center"
                        >
                          Log In
                        </button>
                        <button
                          onClick={() => navigate("/register?redirect=/login")}
                          className="px-6 py-3 cursor-pointer bg-[#00308F] text-white font-semibold rounded-lg shadow-md hover:bg-[#002266] transition-all duration-300 hover:shadow-lg text-center"
                        >
                          Register
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div className="mt-4 text-center">
                  <button
                    onClick={() => navigate("/collections")}
                    className="text-sm text-gray-600 hover:text-black transition-colors"
                    aria-label="Continue shopping"
                  >
                    Continue Shopping{" "}
                    <FiChevronRight className="inline-block ml-1 text-xs" />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {cartData.length > 0 && (
          <div className="mt-16">
            <div className="text-2xl mb-3 text-center">
              <Title text1={"You Might"} text2={"Also Like"} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {products
                .filter(
                  (item) =>
                    !cartData.some((cartItem) => cartItem.productId === item.id)
                )
                .slice(0, 4)
                .map((item, index) => {
                  const imageUrl = Array.isArray(item.image)
                    ? item.image[0]
                    : item.image;
                  return (
                    <div
                      key={item.id}
                      className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:scale-105 transition-all duration-300"
                    >
                      <div className="h-48 bg-gray-100 overflow-hidden rounded-t-2xl">
                        <img
                          src={
                            imageUrl ||
                            "https://placehold.co/300x300?text=Book+Image"
                          }
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                          onError={handleImageError}
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 mb-1">
                          {item.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-2 capitalize">
                          {item.category}
                        </p>
                        <div className="flex items-center space-x-2">
                          <p className="font-bold text-gray-900">
                            {currency}
                            {item.price.toFixed(2)}
                          </p>
                          {item.originalPrice && (
                            <p className="text-sm text-gray-600 line-through">
                              {currency}
                              {item.originalPrice.toFixed(2)}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() =>
                            handleAddToCart(item.id, item.sizes?.[0] || null, 1)
                          } // FIXED: Use handleAddToCart instead of addToCart
                          className="mt-3 w-full py-2 bg-gradient-to-r from-red-400 to-orange-500 hover:from-red-500 hover:to-orange-600 text-white rounded-2xl text-sm font-medium transition-all duration-300"
                          disabled={loading}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Cart;
