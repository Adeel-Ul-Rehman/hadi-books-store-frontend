import React, { useState, useContext } from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const [state, setState] = useState("Login");
  const [riderType, setRiderType] = useState("Part Timer");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [nameError, setNameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();
  const { backendUrl, setIsLoggedin, getUserData, theme } =
    useContext(AppContent);

  const validateForm = () => {
    if (state === "Sign Up") {
      if (formData.name.length > 20) {
        toast.error("Name must be 20 characters or less");
        return false;
      }
      if (!/^[a-zA-Z0-9\s]+$/.test(formData.name)) {
        toast.error("Name can only contain alphabets, numbers, or spaces");
        return false;
      }
      if (formData.password.length < 8) {
        toast.error("Password must be at least 8 characters");
        return false;
      }
      if (
        !/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*]*$/.test(formData.password)
      ) {
        toast.error(
          "Password must contain at least one alphabet and one number"
        );
        return false;
      }
    }
    return true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "name") {
      if (value.length > 20) {
        setNameError("Name must be 20 characters or less");
        return;
      }
      if (value && !/^[a-zA-Z0-9\s]+$/.test(value)) {
        setNameError("Name can only contain alphabets, numbers, or spaces");
      } else {
        setNameError("");
      }
    } else if (name === "password") {
      if (value.length > 50) {
        setPasswordError("Password cannot exceed 50 characters");
        return;
      }
      if (value && value.length < 8) {
        setPasswordError("Password must be at least 8 characters");
      } else if (
        value &&
        !/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*]*$/.test(value)
      ) {
        setPasswordError(
          "Password must contain at least one alphabet and one number"
        );
      } else {
        setPasswordError("");
      }
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      if (state === "Sign Up") {
        const employmentType =
          riderType === "Part Timer" ? "PartTimer" : "FullTimer";
        const { data } = await axios.post(`${backendUrl}/api/auth/register`, {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          employmentType,
        }, { withCredentials: true });
        if (data.success) {
          toast.success("OTP sent to your email");
          navigate("/email-verify", { state: { userId: data.user.id } });
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post(`${backendUrl}/api/auth/login`, {
          email: formData.email,
          password: formData.password,
        }, { withCredentials: true });
        if (data.success) {
          setIsLoggedin(true);
          sessionStorage.setItem('isLoggedin', 'true');
          await getUserData();
          const from = window.location.state?.from?.pathname || "/dashboard";
          navigate(from, { replace: true });
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    }
  };

  return (
    <div
      className={`min-h-screen ${
        theme === "day" ? "bg-day" : "bg-night text-night-text"
      } flex items-center justify-center px-4 font-['Poppins',sans-serif]`}
    >
      <div
        className={`${
          theme === "day" ? "bg-day-card" : "bg-night-card"
        } rounded-2xl shadow-xl p-6 w-full max-w-xs border ${
          theme === "day" ? "border-day" : "border-night"
        } hover:shadow-2xl transition-shadow duration-300`}
      >
        <div className="flex justify-center mb-4 cursor-pointer">
          <img
            onClick={() => navigate("/")}
            src="/logo.png"
            alt="Logo"
            className="w-10 sm:w-12 h-auto"
          />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-center text-[#006491] mb-2">
          {state === "Sign Up" ? "Create Account" : "Login"}
        </h2>
        <p
          className={`text-center ${
            theme === "day" ? "text-day-muted" : "text-night-muted"
          } text-sm mb-4`}
        >
          {state === "Sign Up"
            ? "Join to manage your expenses"
            : "Access your rider expense dashboard"}
        </p>
        <div className="flex justify-center gap-2 mb-4">
          <button
            onClick={() => setState("Sign Up")}
            className={`px-3 py-1.5 rounded-full font-medium text-sm text-white cursor-pointer transition-colors duration-300 ${
              state === "Sign Up"
                ? "bg-[#E31837] hover:bg-[#c3152f]"
                : "bg-[#006491] hover:bg-[#004d73]"
            }`}
          >
            Sign Up
          </button>
          <button
            onClick={() => setState("Login")}
            className={`px-3 py-1.5 rounded-full font-medium text-sm text-white cursor-pointer transition-colors duration-300 ${
              state === "Login"
                ? "bg-[#E31837] hover:bg-[#c3152f]"
                : "bg-[#006491] hover:bg-[#004d73]"
            }`}
          >
            Login
          </button>
        </div>
        <form className="space-y-2.5" onSubmit={handleSubmit}>
          {state === "Sign Up" && (
            <div className="space-y-1">
              <div
                className={`flex items-center border ${
                  theme === "day" ? "border-day" : "border-night"
                } rounded-lg px-2 py-1 focus-within:ring-2 focus-within:ring-[#006491] ${
                  theme === "day" ? "bg-day-input" : "bg-night-input"
                }`}
              >
                <img
                  src={assets.person_icon}
                  alt="Person Icon"
                  className="w-4 h-4 mr-2"
                />
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  required
                  maxLength={20}
                  value={formData.name}
                  className="w-full outline-none text-sm bg-transparent"
                  onChange={handleInputChange}
                />
              </div>
              {nameError && (
                <p className="text-[#E31837] text-xs">{nameError}</p>
              )}
            </div>
          )}
          <div
            className={`flex items-center border ${
              theme === "day" ? "border-day" : "border-night"
            } rounded-lg px-2 py-1 focus-within:ring-2 focus-within:ring-[#006491] ${
              theme === "day" ? "bg-day-input" : "bg-night-input"
            }`}
          >
            <img
              src={assets.mail_icon}
              alt="Mail Icon"
              className="w-4 h-4 mr-2"
            />
            <input
              type="email"
              name="email"
              placeholder="Email ID"
              required
              value={formData.email}
              className="w-full outline-none text-sm bg-transparent"
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-1">
            <div
              className={`flex items-center border ${
                theme === "day" ? "border-day" : "border-night"
              } rounded-lg px-2 py-1 focus-within:ring-2 focus-within:ring-[#006491] ${
                theme === "day" ? "bg-day-input" : "bg-night-input"
              }`}
            >
              <img
                src={assets.lock_icon}
                alt="Lock Icon"
                className="w-4 h-4 mr-2"
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                maxLength={50}
                value={formData.password}
                className="w-full outline-none text-sm bg-transparent"
                onChange={handleInputChange}
              />
            </div>
            {passwordError && (
              <p className="text-[#E31837] text-xs">{passwordError}</p>
            )}
          </div>
          {state === "Sign Up" && (
            <div className="space-y-1">
              <label
                className={`text-sm font-container ${
                  theme === "day" ? "text-gray-600" : "text-gray-200"
                }`}
              >
                Are You:
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRiderType("Full Timer")}
                  className={`flex-1 px-3 py-1.5 rounded-full font-medium text-sm text-white cursor-pointer transition-colors duration-300 ${
                    riderType === "Full Timer"
                      ? "bg-[#E31837] hover:bg-[#c3152f]"
                      : "bg-[#006491] hover:bg-[#004d73]"
                  }`}
                >
                  Full Timer
                </button>
                <button
                  type="button"
                  onClick={() => setRiderType("Part Timer")}
                  className={`flex-1 px-3 py-1.5 rounded-full font-medium text-sm text-white cursor-pointer transition-colors duration-300 ${
                    riderType === "Part Timer"
                      ? "bg-[#E31837] hover:bg-[#c3152f]"
                      : "bg-[#006491] hover:bg-[#004d73]"
                  }`}
                >
                  Part Timer
                </button>
              </div>
            </div>
          )}
          {state === "Login" && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => navigate("/reset-password")}
                className={`${
                  theme === "day"
                    ? "text-[#006491] hover:text-[#004d73]"
                    : "text-[#45B7D1] hover:text-[#3a8bb1]"
                } text-sm font-medium transition-colors duration-300 cursor-pointer`}
              >
                Forgot Password?
              </button>
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-[#E31837] text-white font-semibold py-2 rounded-full hover:bg-[#c3152f] transition-colors duration-300 cursor-pointer text-sm"
          >
            {state === "Sign Up" ? "Create Account" : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;