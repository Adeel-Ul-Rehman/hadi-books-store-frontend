import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import { assets } from "../assets/assets";

const About = () => {
  const navigate = useNavigate();
  const { theme } = useContext(AppContent);

  return (
    <div className={`min-h-screen ${theme === 'day' ? 'bg-day' : 'bg-night text-night-text'} py-6 px-4 sm:px-6 lg:px-8 font-['Poppins',sans-serif]`}>
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#E31837] to-[#006491] rounded-2xl shadow-lg p-6 sm:p-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            About Rider Expense Manager
          </h1>
          <p className="text-sm sm:text-base text-white opacity-90 max-w-3xl mx-auto">
            Empowering Domino's Pizza riders to take control of their finances with a simple, intuitive app designed to track earnings, manage expenses, and visualize progress.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-6 w-32 sm:w-36 px-4 py-2 text-sm font-semibold text-white bg-[#E31837] rounded-full hover:bg-[#C3152F] hover:scale-105 transition-all duration-300 shadow-md cursor-pointer"
          >
            Get Started
          </button>
        </div>

        {/* Motive Section */}
        <div className={`${theme === 'day' ? 'bg-day-card' : 'bg-night-card'} rounded-2xl shadow-lg p-6 sm:p-8 hover:shadow-xl transition-shadow duration-300 border ${theme === 'day' ? 'border-day' : 'border-night'}`}>
          <h2 className="text-xl sm:text-2xl font-semibold text-[#45B7D1] mb-6 text-center relative">
            Our Motive
            <span className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-16 h-1 bg-[#45B7D1] rounded-full"></span>
          </h2>
          <p className={`text-sm sm:text-base ${theme === 'day' ? 'text-gray-600' : 'text-gray-200'} max-w-4xl mx-auto`}>
            At Rider Expense Manager, our mission is to simplify financial management for Domino's Pizza riders. We understand the challenges of tracking variable income from deliveries and tips, as well as managing expenses like fuel and bike maintenance. Our app provides a user-friendly platform to monitor your daily earnings, visualize your financial trends, and make informed decisions to maximize your savings. Whether you're a full-time or part-time rider, we're here to help you stay on top of your finances with ease.
          </p>
        </div>

        {/* How It Works Section */}
        <div className={`${theme === 'day' ? 'bg-day-card' : 'bg-night-card'} rounded-2xl shadow-lg p-6 sm:p-8 hover:shadow-xl transition-shadow duration-300 border ${theme === 'day' ? 'border-day' : 'border-night'}`}>
          <h2 className="text-xl sm:text-2xl font-semibold text-[#45B7D1] mb-6 text-center relative">
            How It Works
            <span className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-16 h-1 bg-[#45B7D1] rounded-full"></span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-[#006491] mb-2">
                1. Track Your Daily Earnings
              </h3>
              <p className={`text-sm sm:text-base ${theme === 'day' ? 'text-gray-600' : 'text-gray-200'}`}>
                Log your daily deliveries and tips effortlessly. The app calculates your earnings based on each delivery (Rs. 45 per delivery) and tips, giving you a clear picture of your income without the clutter of fixed salaries or penalties.
              </p>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-[#006491] mb-2">
                2. Manage Expenses
              </h3>
              <p className={`text-sm sm:text-base ${theme === 'day' ? 'text-gray-600' : 'text-gray-200'}`}>
                Record expenses like fuel, maintenance, or other costs directly in the app. See how your spending impacts your savings, helping you identify areas to cut back and save more.
              </p>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-[#006491] mb-2">
                3. Visualize Your Progress
              </h3>
              <p className={`text-sm sm:text-base ${theme === 'day' ? 'text-gray-600' : 'text-gray-200'}`}>
                Use interactive charts to view your earnings, tips, and expenses over any date range. Missing a day's data? The charts show a dip to zero, keeping your trends accurate and easy to understand.
              </p>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-[#006491] mb-2">
                4. Stay in Control
              </h3>
              <p className={`text-sm sm:text-base ${theme === 'day' ? 'text-gray-600' : 'text-gray-200'}`}>
                Review your performance with summaries of total earnings, expenses, savings, tips, deliveries, and days off. Filter data to focus on what matters most, and make smarter financial choices.
              </p>
            </div>
          </div>
        </div>

        {/* Images Section */}
        <div className={`${theme === 'day' ? 'bg-day-card' : 'bg-night-card'} rounded-2xl shadow-lg p-6 sm:p-8 hover:shadow-xl transition-shadow duration-300 border ${theme === 'day' ? 'border-day' : 'border-night'}`}>
          <h2 className="text-xl sm:text-2xl font-semibold text-[#45B7D1] mb-6 text-center relative">
            See It in Action
            <span className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-16 h-1 bg-[#45B7D1] rounded-full"></span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center">
              <img
                src={assets.p5}
                alt="Track Your Earnings"
                className="w-full h-48 sm:h-64 object-cover rounded-xl shadow-sm hover:scale-105 hover:shadow-xl transition-all duration-300"
              />
              <p className={`mt-2 text-sm sm:text-base ${theme === 'day' ? 'text-gray-600' : 'text-gray-200'}`}>
                Track Your Earnings
              </p>
            </div>
            <div className="text-center">
              <img
                src={assets.p3}
                alt="Visualize Your Progress"
                className="w-full h-48 sm:h-64 object-cover rounded-xl shadow-sm hover:scale-105 hover:shadow-xl transition-all duration-300"
              />
              <p className={`mt-2 text-sm sm:text-base ${theme === 'day' ? 'text-gray-600' : 'text-gray-200'}`}>
                Visualize Your Progress
              </p>
            </div>
            <div className="text-center">
              <img
                src={assets.p4}
                alt="Manage Expenses"
                className="w-full h-48 sm:h-64 object-cover rounded-xl shadow-sm hover:scale-105 hover:shadow-xl transition-all duration-300"
              />
              <p className={`mt-2 text-sm sm:text-base ${theme === 'day' ? 'text-gray-600' : 'text-gray-200'}`}>
                Manage Expenses
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;