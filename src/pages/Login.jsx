import React, { useState, useContext } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiMail, FiLock } from "react-icons/fi";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import validator from "validator";
import Title from "../components/Title";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath =
    new URLSearchParams(location.search).get("redirect") || "/account";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Client-side validation
    if (!formData.email || !formData.password) {
      toast.error("Email and password are required");
      setLoading(false);
      return;
    }

    if (!validator.isEmail(formData.email)) {
      toast.error("Invalid email format");
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    try {
      const data = await login(formData.email, formData.password);
      if (data.success) {
        // Redirect based on account verification status
        if (data.user.isAccountVerified) {
          toast.success("Login successful");
          navigate(redirectPath, { replace: true });
        } else {
          toast.info("Please verify your email to continue");
          navigate("/verify-otp", {
            state: { email: formData.email, userId: data.user?.id },
            replace: true,
          });
        }
      } else {
        toast.error(data.message || "Invalid email or password");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-r from-sky-100 via-orange-100 to-red-100 dark:from-gray-800 dark:via-gray-900 dark:to-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-['Poppins',sans-serif]"
    >
      <div className="max-w-md w-full space-y-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <Title text1="SIGN" text2="IN" />
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Or{" "}
            <Link
              to="/register"
              className="text-blue-800 hover:text-blue-800 hover:underline transition-colors duration-200 dark:text-blue-400 dark:hover:text-blue-200"
            >
              create a new account
            </Link>
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:scale-105 transition-all duration-300 p-4"
        >
          <form
            className="space-y-6"
            onSubmit={handleSubmit}
            aria-label="Login form"
          >
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail
                    className="h-5 w-5 text-gray-400 dark:text-gray-500"
                    aria-hidden="true"
                  />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md py-3 border"
                  placeholder="you@example.com"
                  aria-describedby="email-error"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-900 dark:text-gray-200"
              >
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock
                    className="h-5 w-5 text-gray-400 dark:text-gray-500"
                    aria-hidden="true"
                  />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="focus:ring-red-500 focus:border-red-500 block w-full pl-10 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md py-3 border"
                  placeholder="••••••••"
                  aria-describedby="password-error"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 dark:border-gray-600 rounded"
                  aria-label="Remember me"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-600 dark:text-gray-200"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/reset-password"
                  className="font-medium text-[#00308F] hover:text-[#002266] transition-all duration-300"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="mt-3 w-full py-2 bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 text-white rounded-2xl text-sm font-medium transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                aria-label={loading ? "Logging In" : "Log In"}
              >
                <span className="flex justify-center items-center">
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Logging In...
                    </>
                  ) : (
                    "Log In"
                  )}
                </span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Login;