import React, { useState, useContext, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";

const Navbar = () => {
  const navigate = useNavigate();
  const { backendUrl, userData, isLoggedin, setIsLoggedin, setUserData, theme } =
    useContext(AppContent);

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
      if (data.success) {
        setIsLoggedin(false);
        setUserData(null);
        toast.success(data.message);
        navigate("/login");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to logout");
    }
    setShowDropdown(false);
  };

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const ThemeToggle = () => {
    const { theme, toggleTheme } = useContext(AppContent);
    
    return (
      <button
        onClick={toggleTheme}
        className={`relative w-10 h-5 sm:w-12 sm:h-6 rounded-full transition-all duration-300 focus:outline-none cursor-pointer ${
          theme === 'day' 
            ? 'bg-gray-200 ring-1 ring-gray-300' 
            : 'bg-gray-700 ring-1 ring-gray-600'
        }`}
        aria-label="Toggle theme"
      >
        {/* Track background */}
        <div className={`absolute inset-0 rounded-full ${
          theme === 'day' ? 'bg-gray-200' : 'bg-gray-700'
        }`}></div>
        
        {/* Thumb with icon */}
        <div
          className={`absolute top-1/2 transform -translate-y-1/2 transition-all duration-300 rounded-full flex items-center justify-center ${
            theme === 'day'
              ? 'bg-yellow-400 left-0.5 w-4 h-4'
              : 'bg-gray-300 left-6 sm:left-7 w-4 h-4'
          }`}
        >
          {theme === 'day' ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-yellow-700">
              <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-gray-700">
              <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </button>
    );
  };

  return (
    <nav className={`${theme === 'day' ? 'bg-day-card' : 'bg-night-card text-night-text'} shadow-xl py-3 px-4 sm:px-6 lg:px-8 flex justify-between items-center relative z-10 font-['Poppins',sans-serif]`}>
      <div className="flex items-center gap-2 sm:gap-4 justify-center w-full md:w-auto">
        <img
          src="/logo.png"
          onClick={() => navigate("/")}
          alt="Logo"
          className="w-8 h-8 sm:w-10 sm:h-10 cursor-pointer hover:scale-105 transition-transform duration-300"
        />
        
        {/* Show title next to logo on mobile */}
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold italic tracking-tight text-[#E31837] animate-light-cycle whitespace-nowrap md:hidden">
          𝐑𝐢𝐝𝐞𝐫 𝐄𝐱𝐩𝐞𝐧𝐬𝐞 𝐌𝐚𝐧𝐚𝐠𝐞𝐫
        </h1>
      </div>

      {/* Centered title for desktop */}
      <h1 className="hidden md:block absolute left-1/2 transform -translate-x-1/2 text-xl lg:text-2xl font-bold italic tracking-tight text-[#E31837] animate-light-cycle whitespace-nowrap">
        𝐑𝐢𝐝𝐞𝐫 𝐄𝐱𝐩𝐞𝐧𝐬𝐞 𝐌𝐚𝐧𝐚𝐠𝐞𝐫
      </h1>

      <div className="relative flex items-center gap-3 sm:gap-4" ref={dropdownRef}>
        <ThemeToggle />
        {isLoggedin && userData ? (
          <div className="relative">
            <div
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#E31837] text-white flex items-center justify-center text-sm sm:text-base font-semibold cursor-pointer hover:scale-110 hover:shadow-lg transition-all duration-300 shadow-md overflow-hidden"
              onClick={toggleDropdown}
            >
              {userData.profilePicture ? (
                <img
                  src={userData.profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : userData.name ? (
                userData.name[0].toUpperCase()
              ) : (
                "?"
              )}
            </div>

            {showDropdown && (
              <div
                className={`${theme === 'day' ? 'bg-day-card shadow-lg' : 'bg-night-card text-night-text shadow-night'} absolute right-0 top-full mt-2 w-48 sm:w-56 rounded-lg py-1 z-50 transition-all duration-300 ease-in-out transform origin-top-right border ${theme === 'day' ? 'border-gray-100' : 'border-gray-700'}`}
              >
                <button
                  className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm ${theme === 'day' ? 'hover:bg-gray-100 text-gray-800' : 'hover:bg-gray-700 text-gray-200'} transition-all duration-200`}
                  onClick={() => {
                    navigate("/manage-account?tab=updateProfile");
                    setShowDropdown(false);
                  }}
                >
                  Manage Account
                </button>
                <button
                  className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm ${theme === 'day' ? 'hover:bg-gray-100 text-gray-800' : 'hover:bg-gray-700 text-gray-200'} transition-all duration-200`}
                  onClick={() => {
                    navigate("/history");
                    setShowDropdown(false);
                  }}
                >
                  History
                </button>
                <button
                  className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm ${theme === 'day' ? 'hover:bg-gray-100 text-gray-800' : 'hover:bg-gray-700 text-gray-200'} transition-all duration-200`}
                  onClick={() => {
                    navigate("/daily-records");
                    setShowDropdown(false);
                  }}
                >
                  Daily Records
                </button>
                <button
                  className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm ${theme === 'day' ? 'hover:bg-gray-100 text-gray-800' : 'hover:bg-gray-700 text-gray-200'} transition-all duration-200 rounded-b-lg`}
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="bg-[#E31837] text-white font-medium text-xs sm:text-sm py-1.5 px-3 sm:py-2 sm:px-4 rounded-full flex items-center gap-1 hover:bg-[#C3152F] hover:scale-105 transition-all duration-300 shadow-md cursor-pointer whitespace-nowrap"
          >
            <span className="hidden sm:inline">Login</span>
            <span className="sm:hidden">Log in</span>
            <img
              src={assets.arrow_icon}
              alt="Arrow"
              className="w-2.5 h-2.5 sm:w-3 sm:h-3"
            />
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;