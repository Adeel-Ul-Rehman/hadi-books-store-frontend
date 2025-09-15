import React, { useState, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";
import SearchBar from "./SearchBar";
import { FiHeart } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useContext(AppContext);
  const { getCartCount, getWishlistCount } = useContext(ShopContext);

  // Close profile menu after delay only if not hovering
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

  // Get user initial for profile placeholder
  const getUserInitial = () => {
    return user?.name ? user.name.charAt(0).toUpperCase() : "U";
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-sky-100 via-orange-100 to-red-100 shadow-md">
      {/* Main Navbar */}
      <nav className="flex justify-between items-center py-2 px-4 sm:px-6 lg:px-8 h-16">
        {/* Logo */}
        <div className="flex items-center">
          <img
            src="/logo.png"
            onClick={() => navigate("/")}
            alt="Hadi Books Store Logo"
            className="w-24 h-24 -mt-4 cursor-pointer hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-6 absolute left-1/2 transform -translate-x-1/2">
          {["/", "/collections", "/about", "/contact"].map((path, index) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `text-base font-semibold transition-colors duration-300 ${
                  isActive
                    ? "text-red-500 underline underline-offset-4 decoration-2"
                    : "text-gray-800 hover:text-" +
                      ["sky-600", "orange-600", "red-600", "blue-600"][index]
                }`
              }
              aria-label={["Home", "Collections", "About", "Contact"][index]}
            >
              {["HOME", "COLLECTIONS", "ABOUT", "CONTACT"][index]}
            </NavLink>
          ))}
        </div>

        {/* Right Icons - Updated order: Search, Wishlist, Cart, Profile */}
        <div className="flex items-center gap-4">
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
                <img
                  src={assets.profile_icon}
                  alt="Profile"
                  className="w-6 h-6"
                />
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
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => {
                          setShowProfileMenu(false);
                          setMobileMenuOpen(false);
                        }}
                        aria-label="My Account"
                      >
                        My Account
                      </NavLink>
                      <NavLink
                        to="/orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => {
                          setShowProfileMenu(false);
                          setMobileMenuOpen(false);
                        }}
                        aria-label="My Orders"
                      >
                        My Orders
                      </NavLink>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        aria-label="Logout"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <NavLink
                        to="/login"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => {
                          setShowProfileMenu(false);
                          setMobileMenuOpen(false);
                        }}
                        aria-label="Login"
                      >
                        Login
                      </NavLink>
                      <NavLink
                        to="/register"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => {
                          setShowProfileMenu(false);
                          setMobileMenuOpen(false);
                        }}
                        aria-label="Register"
                      >
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
            className="md:hidden flex items-center focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Toggle mobile menu"
          >
            <img src={assets.menu_icon} alt="Menu" className="w-6 h-6" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 80, damping: 20 }}
            className="fixed inset-0 z-50 md:hidden"
          >
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Sliding Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 100, damping: 18 }}
              className="absolute right-0 top-0 h-full w-72 bg-gradient-to-b from-sky-50 via-orange-50 to-red-50 shadow-2xl rounded-l-2xl flex flex-col"
            >
              {/* Header with Close */}
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-800">Menu</h3>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 transition"
                  aria-label="Close mobile menu"
                >
                  <img
                    src={assets.dropdown_icon}
                    alt="Close"
                    className="w-5 h-5 rotate-180"
                  />
                </button>
              </div>

              {/* Scrollable Links */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {["/", "/collections", "/about", "/contact"].map(
                  (path, index) => (
                    <NavLink
                      key={path}
                      to={path}
                      className={({ isActive }) =>
                        `block w-full text-base font-semibold px-4 py-3 rounded-lg transition-all text-center ${
                          isActive
                            ? "bg-red-100 text-red-600 shadow-sm"
                            : "text-gray-700 hover:bg-gray-100 hover:text-" +
                              ["sky-600", "orange-600", "red-600", "blue-600"][
                                index
                              ]
                        }`
                      }
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {["HOME", "COLLECTIONS", "ABOUT", "CONTACT"][index]}
                    </NavLink>
                  )
                )}

                {/* Auth / Account */}
                <div className="mt-6 border-t pt-4 space-y-2">
                  {user ? (
                    <>
                      <NavLink
                        to="/account"
                        className="block w-full text-base font-semibold px-4 py-3 rounded-lg text-center text-gray-700 hover:bg-gray-100 hover:text-red-600"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        My Account
                      </NavLink>
                      <NavLink
                        to="/orders"
                        className="block w-full text-base font-semibold px-4 py-3 rounded-lg text-center text-gray-700 hover:bg-gray-100 hover:text-red-600"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        My Orders
                      </NavLink>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-base font-semibold px-4 py-3 rounded-lg text-center text-gray-700 hover:bg-gray-100 hover:text-red-600 transition"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <NavLink
                        to="/login"
                        className="block w-full text-base font-semibold px-4 py-3 rounded-lg text-center text-gray-700 hover:bg-gray-100 hover:text-red-600"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Login
                      </NavLink>
                      <NavLink
                        to="/register"
                        className="block w-full text-base font-semibold px-4 py-3 rounded-lg text-center text-gray-700 hover:bg-gray-100 hover:text-red-600"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Register
                      </NavLink>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/923090005634"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50"
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