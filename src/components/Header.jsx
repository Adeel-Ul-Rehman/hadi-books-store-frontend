import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import { assets } from "../assets/assets";

const Header = () => {
  const navigate = useNavigate();
  const { theme } = useContext(AppContent);

  return (
    <div className={`min-h-screen ${theme === 'day' ? 'bg-day' : 'bg-night text-night-text'} flex items-center justify-center px-4 font-['Poppins',sans-serif] my-8 sm:my-12`}>
      <div className={`${theme === 'day' ? 'bg-day-card' : 'bg-night-card'} rounded-2xl shadow-xl p-6 w-full max-w-6xl border ${theme === 'day' ? 'border-day' : 'border-night'} hover:shadow-2xl transition-shadow duration-300`}>
        {/* Purpose Section */}
        <section className="mb-12">
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-[#45B7D1] mb-6 relative">
            Purpose
            <span className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-16 h-1 bg-[#45B7D1] rounded-full"></span>
          </h1>
          <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8">
            <div className="w-full md:w-1/2">
              <img
                src={assets.p1}
                alt="Rider tracking expenses"
                className="w-full h-[200px] sm:h-[250px] object-cover rounded-xl shadow-md hover:scale-[1.02] transition-transform duration-300"
              />
            </div>
            <div className="w-full md:w-1/2">
              <p className={`text-base sm:text-lg ${theme === 'day' ? 'text-gray-700' : 'text-gray-200'} leading-relaxed`}>
                As a Domino’s rider, I, Adeel Ul Rehman, struggled to track my earnings and expenses, often feeling I earned too little without clear insights. Rider Expense Manager solves this by letting riders log daily details—expenses, tips, orders, and day ratings—to calculate income (fixed salary + 45 rupees per order) and savings. This free, secure, and user-friendly app empowers delivery riders to take control of their finances with ease.
              </p>
            </div>
          </div>
        </section>

        {/* Get Started Button */}
        <div className="text-center mb-12">
          <button
            onClick={() => navigate("/login")}
            className="bg-[#E31837] text-white font-semibold py-3 px-8 rounded-full hover:bg-[#C3152F] hover:scale-105 transition-all duration-300 shadow-md cursor-pointer text-base sm:text-lg"
          >
            Get Started
          </button>
        </div>

        {/* How It Works Section */}
        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-[#45B7D1] mb-6 relative">
            How It Works
            <span className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-16 h-1 bg-[#45B7D1] rounded-full"></span>
          </h2>
          <div className="flex flex-col md:flex-row-reverse items-center gap-6 sm:gap-8">
            <div className="w-full md:w-1/2">
              <img
                src={assets.p2}
                alt="Rider tracking expenses"
                className="w-full h-[200px] sm:h-[250px] object-cover rounded-xl shadow-md hover:scale-[1.02] transition-transform duration-300"
              />
            </div>
            <div className="w-full md:w-1/2">
              <p className={`text-base sm:text-lg ${theme === 'day' ? 'text-gray-700' : 'text-gray-200'} leading-relaxed`}>
                Rider Expense Manager makes tracking easy: each day, input your expenses (fuel, maintenance), tips, number of orders, day rating (Excellent, Good, etc.), and date. The app calculates your income by adding your fixed salary to your orders multiplied by 45 (Domino’s per-order rate), then subtracts expenses to show your daily savings. With a secure and intuitive interface, it keeps a detailed record to help you understand your earnings over time.
              </p>
            </div>
          </div>
        </section>

        {/* Creator Section */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-[#45B7D1] mb-6 relative">
            Meet the Creator
            <span className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-16 h-1 bg-[#45B7D1] rounded-full"></span>
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 sm:gap-8">
            <div className="w-full md:w-1/2 flex justify-center">
              <img
                src={assets.me}
                alt="Adeel Ul Rehman, Creator"
                className="w-[150px] sm:w-[200px] h-[150px] sm:h-[200px] object-cover rounded-full shadow-md hover:scale-[1.02] transition-transform duration-300"
              />
            </div>
            <div className="w-full md:w-1/2">
              <h3 className="text-lg sm:text-xl font-semibold text-[#006491] mb-2">Adeel Ul Rehman</h3>
              <p className={`text-base sm:text-lg ${theme === 'day' ? 'text-gray-700' : 'text-gray-200'} mb-4 leading-relaxed`}>
                I’m Adeel Ul Rehman, a Computer Science student and part-time Domino’s rider. I created Rider Expense Manager to address my own challenge of tracking income and expenses, ensuring riders like you can easily monitor earnings and savings. This app is my dedication to helping the rider community gain financial clarity.
              </p>
              <p className="text-base sm:text-lg font-semibold italic text-[#E31837]">
                Work Hard, Track Daily, Save Smart – Free for All Riders!
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Header;