import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import { toast } from "react-toastify";

const Complain = () => {
  const navigate = useNavigate();
  const { theme } = useContext(AppContent);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate form inputs
  const validateForm = () => {
    const newErrors = {};
    if (!subject.trim()) newErrors.subject = "Subject is required";
    if (!message.trim()) newErrors.message = "Message is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!validateForm()) {
      toast.error("Please fill out all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      window.location.href = `mailto:dominoriderexpense@gmail.com?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(message)}`;
      toast.success("Opening your email client...");
      setSubject("");
      setMessage("");
    } catch (error) {
      toast.error("Failed to open email client");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "subject") setSubject(value);
    else setMessage(value);
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  return (
    <div className={`min-h-screen ${theme === 'day' ? 'bg-day' : 'bg-night text-night-text'} py-6 px-4 sm:px-6 lg:px-8 font-['Poppins',sans-serif]`}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-[#E31837] to-[#006491] rounded-2xl shadow-lg p-6 sm:p-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            File a Complaint
          </h1>
          <p className="text-sm sm:text-base text-white opacity-90 max-w-3xl mx-auto">
            We value your feedback. Share any issues or concerns, and our team will respond promptly to ensure your experience with Rider Expense Manager is seamless.
          </p>
        </div>

        {/* Complaint Form */}
        <div className={`${theme === 'day' ? 'bg-day-card' : 'bg-night-card'} rounded-2xl shadow-lg p-6 sm:p-8 max-w-2xl mx-auto hover:shadow-xl transition-shadow duration-300 border ${theme === 'day' ? 'border-day' : 'border-night'}`}>
          <h2 className="text-xl sm:text-2xl font-semibold text-[#45B7D1] mb-6 text-center relative">
            Submit Your Complaint
            <span className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-16 h-1 bg-[#45B7D1] rounded-full"></span>
          </h2>
          <div className="space-y-6">
            {/* Subject Field */}
            <div>
              <label className={`block text-sm sm:text-base font-medium ${theme === 'day' ? 'text-gray-700' : 'text-gray-200'} mb-2`}>
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={subject}
                onChange={handleInputChange}
                placeholder="Enter the subject of your complaint"
                className={`w-full px-3 py-2 border ${errors.subject ? 'border-red-500' : theme === 'day' ? 'border-day' : 'border-night'} rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#006491] focus:scale-[1.01] transition-all duration-300 text-sm sm:text-base ${theme === 'day' ? 'bg-day-input' : 'bg-night-input'}`}
              />
              {errors.subject && (
                <p className="text-red-500 text-xs mt-1">{errors.subject}</p>
              )}
            </div>

            {/* Message Field */}
            <div>
              <label className={`block text-sm sm:text-base font-medium ${theme === 'day' ? 'text-gray-700' : 'text-gray-200'} mb-2`}>
                Message
              </label>
              <textarea
                name="message"
                value={message}
                onChange={handleInputChange}
                placeholder="Describe your complaint in detail..."
                className={`w-full p-3 border ${errors.message ? 'border-red-500' : theme === 'day' ? 'border-day' : 'border-night'} rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#006491] focus:scale-[1.01] transition-all duration-300 text-sm sm:text-base ${theme === 'day' ? 'bg-day-input' : 'bg-night-input'}`}
                rows="6"
              ></textarea>
              {errors.message && (
                <p className="text-red-500 text-xs mt-1">{errors.message}</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex flex-row gap-4 justify-center">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-32 sm:w-36 px-4 py-2 text-sm font-semibold text-white bg-[#E31837] rounded-full hover:bg-[#C3152F] hover:scale-105 transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? "Sending..." : "Send Complaint"}
              </button>
              <button
                onClick={() => navigate("/")}
                className="w-32 sm:w-36 px-4 py-2 text-sm font-semibold text-white bg-[#006491] rounded-full hover:bg-[#004D73] hover:scale-105 transition-all duration-300 shadow-md cursor-pointer"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Complain;