import React, { useState, useRef, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContent } from "../context/AppContext";

const EmailVerify = () => {
  const navigate = useNavigate();
  const { backendUrl, theme } = useContext(AppContent);
  const { state } = useLocation();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  const handleOtpChange = (index, value) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handlePaste = (e, index) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split("").slice(0, 6);
      setOtp(newOtp);
      inputRefs.current[5].focus(); // Focus last input
    } else {
      toast.error("Please paste a valid 6-digit OTP");
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== 6 || !/^\d{6}$/.test(otpString)) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/auth/verify-account`,
        { userId: state?.userId, otp: otpString },
        { withCredentials: true }
      );
      console.log("Verify OTP response:", data); // Debug log
      if (data.success) {
        toast.success("User registered successfully! OTP verified.");
        navigate("/login");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("OTP verification error:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Failed to verify OTP");
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'day' ? 'bg-day' : 'bg-night text-night-text'} flex items-center justify-center px-4 font-['Poppins',sans-serif]`}>
      <div className={`${theme === 'day' ? 'bg-day-card' : 'bg-night-card'} rounded-2xl shadow-xl p-6 w-full max-w-md border ${theme === 'day' ? 'border-day' : 'border-night'} hover:shadow-2xl transition-shadow duration-300`}>
        <div className="flex justify-center mb-4 cursor-pointer">
          <img
            onClick={() => navigate("/")}
            src="/logo.png"
            alt="Logo"
            className="w-12 sm:w-14 h-auto"
          />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-[#006491] mb-3">
          Verify Your Email
        </h2>
        <p className={`text-center ${theme === 'day' ? 'text-day-muted' : 'text-night-muted'} text-sm mb-6`}>
          Verification OTP sent to your Email.
        </p>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="flex justify-center gap-2 sm:gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onPaste={(e) => handlePaste(e, index)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                ref={(el) => (inputRefs.current[index] = el)}
                className={`w-10 h-10 sm:w-12 sm:h-12 text-center text-lg font-semibold ${theme === 'day' ? 'text-gray-700' : 'text-gray-200'} border ${theme === 'day' ? 'border-day' : 'border-night'} rounded-lg focus:ring-2 focus:ring-[#006491] outline-none ${theme === 'day' ? 'bg-day-input' : 'bg-night-input'} hover:bg-opacity-80 transition-all duration-200 otp-input`}
                placeholder="0"
              />
            ))}
          </div>
          <button
            type="submit"
            className="w-full bg-[#E31837] text-white font-semibold py-2.5 rounded-full hover:bg-[#c3152f] transition-colors duration-300 cursor-pointer text-sm animate-pulse-slow"
          >
            Verify OTP
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmailVerify;