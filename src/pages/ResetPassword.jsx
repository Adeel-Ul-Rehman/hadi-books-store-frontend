import React, { useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContent } from "../context/AppContext";
import { assets } from "../assets/assets";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { backendUrl, theme } = useContext(AppContent);
  const [step, setStep] = useState("email"); // email, otp, password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const inputRefs = useRef([]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/send-reset-otp`, { email });
      console.log("Send OTP response:", data);
      if (data.success) {
        toast.success(data.message);
        setStep("otp");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Send OTP error:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Failed to send OTP");
    }
  };

  const handleOtpChange = (index, value) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
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
      inputRefs.current[5].focus();
    } else {
      toast.error("Please paste a valid 6-digit OTP");
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== 6 || !/^\d{6}$/.test(otpString)) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/verify-reset-otp`, {
        email,
        otp: otpString
      });
      console.log("Verify OTP response:", data);
      if (data.success) {
        toast.success(data.message);
        setStep("password");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("OTP verification error:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Failed to verify OTP");
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    if (name === "newPassword") {
      if (value.length > 50) {
        setNewPasswordError("Password cannot exceed 50 characters");
        return;
      }
      if (value && value.length < 8) {
        setNewPasswordError("Password must be at least 8 characters");
      } else if (value && !/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*]*$/.test(value)) {
        setNewPasswordError("Password must contain at least one alphabet and one number");
      } else {
        setNewPasswordError("");
      }
      // Update confirmPassword error if confirmPassword exists
      if (confirmPassword && value !== confirmPassword) {
        setConfirmPasswordError("Passwords do not match");
      } else if (confirmPassword) {
        setConfirmPasswordError("");
      }
      setNewPassword(value);
    } else if (name === "confirmPassword") {
      if (value.length > 50) {
        setConfirmPasswordError("Password cannot exceed 50 characters");
        return;
      }
      if (value && value !== newPassword) {
        setConfirmPasswordError("Passwords do not match");
      } else {
        setConfirmPasswordError("");
      }
      setConfirmPassword(value);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (!/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*]*$/.test(newPassword)) {
      toast.error("Password must contain at least one alphabet and one number");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/reset-password`, {
        email,
        otp: otp.join(""),
        newPassword,
        confirmPassword
      });
      console.log("Reset password response:", data);
      if (data.success) {
        toast.success(data.message);
        navigate("/login");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Password reset error:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Failed to reset password");
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
        {step === "email" && (
          <>
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-[#006491] mb-3">
              Reset Your Password
            </h2>
            <p className={`text-center ${theme === 'day' ? 'text-day-muted' : 'text-night-muted'} text-sm mb-6`}>
              Enter your email to receive a password reset OTP.
            </p>
            <form className="space-y-6" onSubmit={handleEmailSubmit}>
              <div className={`flex items-center border ${theme === 'day' ? 'border-day' : 'border-night'} rounded-lg px-2 py-1 focus-within:ring-2 focus-within:ring-[#006491] ${theme === 'day' ? 'bg-day-input' : 'bg-night-input'}`}>
                <img
                  src={assets.mail_icon}
                  alt="Email Icon"
                  className="w-4 h-4 mr-2"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full outline-none text-sm bg-transparent"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#E31837] text-white font-semibold py-2.5 rounded-full hover:bg-[#c3152f] transition-all duration-300 cursor-pointer text-sm animate-pulse-slow"
              >
                Send OTP
              </button>
            </form>
          </>
        )}
        {step === "otp" && (
          <>
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-[#006491] mb-3">
              Verify OTP
            </h2>
            <p className={`text-center ${theme === 'day' ? 'text-day-muted' : 'text-night-muted'} text-sm mb-6`}>
              Enter the 6-digit OTP sent to {email}.
            </p>
            <form className="space-y-6" onSubmit={handleOtpSubmit}>
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
                    className={`w-10 h-10 sm:w-12 sm:h-12 text-center text-lg font-semibold border ${theme === 'day' ? 'border-day' : 'border-night'} rounded-lg focus:ring-2 focus:ring-[#006491]/20 outline-none ${theme === 'day' ? 'bg-day-input' : 'bg-night-input'} hover:bg-opacity-80 transition-all duration-200 otp-input`}
                    placeholder="0"
                  />
                ))}
              </div>
              <button
                type="submit"
                className="w-full bg-[#E31837] text-white font-semibold py-2.5 rounded-full hover:bg-[#c3152f] transition-all duration-300 cursor-pointer text-sm animate-pulse-slow"
              >
                Verify OTP
              </button>
            </form>
          </>
        )}
        {step === "password" && (
          <>
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-[#006491] mb-3">
              Set New Password
            </h2>
            <p className={`text-center ${theme === 'day' ? 'text-day-muted' : 'text-night-muted'} text-sm mb-6`}>
              Enter and confirm your new password.
            </p>
            <form className="space-y-2.5" onSubmit={handlePasswordSubmit}>
              <div className="space-y-1">
                <div className={`flex items-center border ${theme === 'day' ? 'border-day' : 'border-night'} rounded-lg px-2 py-1 focus-within:ring-2 focus-within:ring-[#006491] ${theme === 'day' ? 'bg-day-input' : 'bg-night-input'}`}>
                  <img
                    src={assets.lock_icon}
                    alt="Lock Icon"
                    className="w-4 h-4 mr-2"
                  />
                  <input
                    type="password"
                    name="newPassword"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={handlePasswordChange}
                    required
                    maxLength={50}
                    className="w-full outline-none text-sm bg-transparent"
                  />
                </div>
                {newPasswordError && (
                  <p className="text-[#E31837] text-xs">{newPasswordError}</p>
                )}
              </div>
              <div className="space-y-1">
                <div className={`flex items-center border ${theme === 'day' ? 'border-day' : 'border-night'} rounded-lg px-2 py-1 focus-within:ring-2 focus-within:ring-[#006491] ${theme === 'day' ? 'bg-day-input' : 'bg-night-input'}`}>
                  <img
                    src={assets.lock_icon}
                    alt="Lock Icon"
                    className="w-4 h-4 mr-2"
                  />
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    maxLength={50}
                    className="w-full outline-none text-sm bg-transparent"
                  />
                </div>
                {confirmPasswordError && (
                  <p className="text-[#E31837] text-xs">{confirmPasswordError}</p>
                )}
              </div>
              <button
                type="submit"
                className="w-full bg-[#E31837] text-white font-semibold py-2.5 rounded-full hover:bg-[#c3152f] transition-all duration-300 cursor-pointer text-sm animate-pulse-slow"
              >
                Reset Password
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;