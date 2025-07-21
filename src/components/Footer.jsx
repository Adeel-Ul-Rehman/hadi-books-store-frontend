import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";

const Footer = () => {
  const navigate = useNavigate();
  const { theme } = useContext(AppContent);
  const currentYear = new Date(Date.now()).getFullYear();
  const [message, setMessage] = useState("");

  const handleSendEmail = () => {
    if (message.trim()) {
      window.location.href = `mailto:dominoriderexpense@gmail.com?subject=Contact%20Rider%20Expense%20Manager&body=${encodeURIComponent(
        message
      )}`;
      setMessage(""); // Clear input after sending
    }
  };

  return (
    <footer className={`${theme === 'day' ? 'bg-day-card' : 'bg-night-card text-night-text'} shadow-xl py-8 px-4 sm:px-6 lg:px-8 font-['Poppins',sans-serif]`}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
        {/* Company Section */}
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-[#45B7D1] mb-4 relative">
            Company
            <span className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-16 h-1 bg-[#45B7D1] rounded-full"></span>
          </h2>
          <p
            className="text-sm sm:text-base italic animate-light-cycle text-[#E31837] mb-4"
            style={{ textShadow: "0 0 5px rgba(227, 24, 55, 0.8)" }}
          >
            𝘙𝘪𝘥𝘦𝘳 𝘌𝘹𝘱𝘦𝘯𝘴𝘦 𝘔𝘢𝘯𝘢𝘨𝘦𝘳
          </p>
          <p className={`text-sm sm:text-base ${theme === 'day' ? 'text-gray-600' : 'text-gray-300'}`}>
            Track and manage your ride expenses with ease.
          </p>
        </div>

        {/* Quick Links Section */}
        <div className="text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-[#45B7D1] mb-4 relative inline-block">
            Quick Links
            <span className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-16 h-1 bg-[#45B7D1] rounded-full"></span>
          </h2>
          <div className="flex flex-row justify-center sm:justify-start gap-4 sm:gap-6 mb-4">
            <button
              onClick={() => navigate("/")}
              className={`text-sm sm:text-base font-semibold ${theme === 'day' ? 'text-[#006491] hover:text-[#E31837]' : 'text-[#45B7D1] hover:text-[#E31837]'} hover:scale-105 transition-all duration-300 cursor-pointer`}
            >
              Home
            </button>
            <button
              onClick={() => navigate("/about")}
              className={`text-sm sm:text-base font-semibold ${theme === 'day' ? 'text-[#006491] hover:text-[#E31837]' : 'text-[#45B7D1] hover:text-[#E31837]'} hover:scale-105 transition-all duration-300 cursor-pointer`}
            >
              About
            </button>
            <button
              onClick={() => navigate("/complain")}
              className={`text-sm sm:text-base font-semibold ${theme === 'day' ? 'text-[#006491] hover:text-[#E31837]' : 'text-[#45B7D1] hover:text-[#E31837]'} hover:scale-105 transition-all duration-300 cursor-pointer`}
            >
              Complain
            </button>
          </div>
          <p className={`text-sm sm:text-base ${theme === 'day' ? 'text-gray-600' : 'text-gray-300'}`}>
            <strong>Privacy Policy:</strong> We collect your name, email, and
            expense data to provide tracking services. We don’t share your data
            except as required by law. Email us for inquiries.
          </p>
          <p className={`text-sm sm:text-base ${theme === 'day' ? 'text-gray-600' : 'text-gray-300'} mt-2`}>
            <strong>Terms of Service:</strong> Use Rider Expense Manager to
            track expenses responsibly. You’re responsible for your account
            security. We’re not liable for data inaccuracies.
          </p>
        </div>

        {/* Contact Section */}
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-[#45B7D1] mb-4 relative">
            Contact
            <span className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-16 h-1 bg-[#45B7D1] rounded-full"></span>
          </h2>
          <p className={`text-sm sm:text-base ${theme === 'day' ? 'text-gray-600' : 'text-gray-300'} mb-4`}>
            <a href="mailto:dominoriderexpense@gmail.com"></a>
          </p>
          <div className="mt-4">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              className={`w-full p-3 border ${theme === 'day' ? 'border-day' : 'border-night'} rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E31837] focus:scale-[1.01] transition-all duration-300 text-sm sm:text-base ${theme === 'day' ? 'bg-day-input' : 'bg-night-input'}`}
              rows="4"
            ></textarea>
            <button
              onClick={handleSendEmail}
              className="mt-3 px-4 py-2 text-sm sm:text-base font-semibold text-white bg-[#E31837] rounded-full hover:bg-[#C3152F] hover:scale-105 transition-all duration-300 shadow-md cursor-pointer inline-flex justify-center items-center w-auto"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className={`mt-8 text-center text-sm sm:text-base ${theme === 'day' ? 'text-day-muted' : 'text-night-muted'} border-t ${theme === 'day' ? 'border-day' : 'border-night'} pt-4`}>
        All Rights Reserved {currentYear} Rider Expense Manager. Created by
        Adeel Ul Rehman.
      </div>
    </footer>
  );
};

export default Footer;