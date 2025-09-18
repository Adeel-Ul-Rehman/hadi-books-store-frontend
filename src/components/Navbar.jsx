import React, { useState, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
import SearchBar from "./SearchBar";
import { FiHeart, FiX, FiMenu, FiUser, FiLogOut, FiShoppingBag, FiHome, FiBook, FiInfo, FiMail } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useContext(AppContext);
  const { getCartCount, getWishlistCount } = useContext(ShopContext);

  const handleProfileMouseLeave = () => {
    if (window.innerWidth > 768) {
      const timer = setTimeout(() => {
        if (!document.querySelector(".profile-menu:hover")) {
          setShowProfileMenu(false);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowProfileMenu(false);
      setMobileMenuOpen(false);
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Logout failed");
    }
  };

  const getUserInitial = () => {
    return user?.name ? user.name.charAt(0).toUpperCase() : "U";
  };

  const menuItems = [
    { path: "/", label: "HOME", icon: <FiHome className="w-5 h-5" /> },
    { path: "/collections", label: "COLLECTIONS", icon: <FiBook className="w-5 h-5" /> },
    { path: "/about", label: "ABOUT", icon: <FiInfo className="w-5 h-5" /> },
    { path: "/contact", label: "CONTACT", icon: <FiMail className="w-5 h-5" /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-sky-100 via-orange-100 to-red-100 shadow-md">
      {/* Main Navbar */}
      <nav className="flex justify-between items-center py-2 px-4 sm:px-6 lg:px-8 h-16">
        {/* Logo - Move slightly more left on mobile */}
        <div className="flex items-center ml-0 sm:ml-0 md:-ml-0">
          <img
            src="/logo.png"
            onClick={() => navigate("/")}
            alt="Hadi Books Store Logo"
            className="w-24 h-24 -mt-4 cursor-pointer hover:scale-105 transition-transform duration-300 ml-[-10px] md:ml-0"
          />
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-6 absolute left-1/2 transform -translate-x-1/2">
          {menuItems.map((item, index) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `text-base font-semibold transition-colors duration-300 ${
                  isActive
                    ? "text-red-500 underline underline-offset-4 decoration-2"
                    : "text-gray-800 hover:text-" +
                      ["sky-600", "orange-600", "red-600", "blue-600"][index]
                }`
              }
              aria-label={item.label}
            >
              {item.label}
            </NavLink>
          ))}
        </div>

  {/* Right Icons - reduce gap */}
  <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          {/* Search */}
          <SearchBar isNavbar={true} />

          {/* Wishlist */}
          <button
            className="relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            onClick={() => navigate("/wishlist")}
            aria-label="View wishlist"
          >
            <FiHeart className="w-5 h-5 text-gray-800 hover:text-red-500 transition-colors" />
            {getWishlistCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {getWishlistCount()}
              </span>
            )}
          </button>

          {/* Cart */}
          <button
            className="relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            onClick={() => navigate("/cart")}
            aria-label="View cart"
          >
            <img src={assets.cart_icon} alt="Cart" className="w-6 h-6" />
            {getCartCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {getCartCount()}
              </span>
            )}
          </button>

          {/* Profile */}
          <div
            className="relative group"
            onMouseEnter={() =>
              window.innerWidth > 768 && setShowProfileMenu(true)
            }
            onMouseLeave={handleProfileMouseLeave}
            onClick={() =>
              window.innerWidth <= 768 && setShowProfileMenu(!showProfileMenu)
            }
          >
            <button
              className="focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-full"
              aria-label="Profile menu"
            >
              {user ? (
                user.profilePicture ? (
                  <img
                    src={`${user.profilePicture}?t=${Date.now()}`}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover border-2 border-gray-300 hover:border-red-500 transition-colors"
                    onError={(e) =>
                      (e.target.src =
                        "https://via.placeholder.com/40?text=User")
                    }
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-semibold border-2 border-gray-300 hover:border-red-500 transition-colors">
                    {getUserInitial()}
                  </div>
                )
              ) : (
                <FiUser className="w-6 h-6 text-gray-800" />
              )}
            </button>
            <AnimatePresence>
              {(showProfileMenu || mobileMenuOpen) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="profile-menu absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-100"
                  onMouseEnter={() => setShowProfileMenu(true)}
                  onMouseLeave={handleProfileMouseLeave}
                >
                  {user ? (
                    <>
                      <NavLink
                        to="/account"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => {
                          setShowProfileMenu(false);
                          setMobileMenuOpen(false);
                        }}
                        aria-label="My Account"
                      >
                        <FiUser className="w-4 h-4 mr-2" />
                        My Account
                      </NavLink>
                      <NavLink
                        to="/orders"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => {
                          setShowProfileMenu(false);
                          setMobileMenuOpen(false);
                        }}
                        aria-label="My Orders"
                      >
                        <FiShoppingBag className="w-4 h-4 mr-2" />
                        My Orders
                      </NavLink>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        aria-label="Logout"
                      >
                        <FiLogOut className="w-4 h-4 mr-2" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <NavLink
                        to="/login"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => {
                          setShowProfileMenu(false);
                          setMobileMenuOpen(false);
                        }}
                        aria-label="Login"
                      >
                        <FiUser className="w-4 h-4 mr-2" />
                        Login
                      </NavLink>
                      <NavLink
                        to="/register"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => {
                          setShowProfileMenu(false);
                          setMobileMenuOpen(false);
                        }}
                        aria-label="Register"
                      >
                        <FiUser className="w-4 h-4 mr-2" />
                        Register
                      </NavLink>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden flex items-center focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 p-1"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Toggle mobile menu"
          >
            <FiMenu className="w-6 h-6 text-gray-800" />
          </button>
        </div>
      </nav>

      {/* Enhanced Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Overlay with blur effect */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Sliding Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                mass: 0.8
              }}
              className="fixed right-0 top-0 h-full w-80 max-w-[85vw] bg-gradient-to-b from-white to-gray-50 shadow-2xl z-50 flex flex-col"
            >
              {/* Header with Close Button */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-white">
                <div className="flex items-center">
                  <img
                    src="/logo.png"
                    alt="Hadi Books Store"
                    className="w-10 h-10 mr-3"
                  />
                  <h3 className="text-xl font-bold text-gray-800">Menu</h3>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 transition duration-200"
                  aria-label="Close menu"
                >
                  <FiX className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Navigation Links */}
                <div className="space-y-3 mb-8">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    Navigation
                  </h4>
                  {menuItems.map((item, index) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 ${
                          isActive
                            ? "bg-gradient-to-r from-red-50 to-orange-50 text-red-600 shadow-sm border border-red-100"
                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        }`
                      }
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="mr-3 text-red-500">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </NavLink>
                  ))}
                </div>

                {/* User Section */}
                <div className="space-y-3 border-t pt-6">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    Account
                  </h4>
                  {user ? (
                    <>
                      <NavLink
                        to="/account"
                        className="flex items-center w-full px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition duration-200"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <FiUser className="w-5 h-5 mr-3 text-blue-500" />
                        <span className="font-medium">My Account</span>
                      </NavLink>
                      <NavLink
                        to="/orders"
                        className="flex items-center w-full px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition duration-200"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <FiShoppingBag className="w-5 h-5 mr-3 text-green-500" />
                        <span className="font-medium">My Orders</span>
                      </NavLink>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition duration-200"
                      >
                        <FiLogOut className="w-5 h-5 mr-3 text-red-500" />
                        <span className="font-medium">Logout</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <NavLink
                        to="/login"
                        className="flex items-center w-full px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition duration-200"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <FiUser className="w-5 h-5 mr-3 text-blue-500" />
                        <span className="font-medium">Login</span>
                      </NavLink>
                      <NavLink
                        to="/register"
                        className="flex items-center w-full px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition duration-200"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <FiUser className="w-5 h-5 mr-3 text-green-500" />
                        <span className="font-medium">Register</span>
                      </NavLink>
                    </>
                  )}
                </div>
              </div>

              {/* Footer with WhatsApp */}
              <div className="p-6 border-t border-gray-200 bg-white">
                <a
                  href="https://wa.me/923090005634"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full bg-green-500 text-white py-3 px-4 rounded-xl hover:bg-green-600 transition duration-200 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <img src={assets.whatsapp_icon} alt="WhatsApp" className="w-5 h-5 mr-2" />
                  Contact via WhatsApp
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/923090005634"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40"
        aria-label="Contact via WhatsApp"
      >
        <motion.img
          src={assets.whatsapp_icon}
          alt="WhatsApp"
          className="w-14 h-14"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3 }}
        />
      </a>
    </header>
  );
};

export default Navbar;