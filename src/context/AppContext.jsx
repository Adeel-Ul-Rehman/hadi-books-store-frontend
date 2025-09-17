import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import validator from "validator";
import { toast } from "react-toastify";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL || "/api"; // Use Vite proxy prefix for same-origin requests

  // Configure Axios default settings
  useEffect(() => {
    axios.defaults.baseURL =
      import.meta.env.VITE_API_URL || "http://localhost:4000";
    axios.defaults.withCredentials = true;
  }, []);

  // Retry helper function for API requests (no retry on 401 to avoid loops)
  const retryRequest = async (fn, retries = 3, delay = 1000) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await fn();
      } catch (err) {
        if (err.response?.status === 401) {
          throw err; // No retry on auth errors
        }
        if (attempt === retries || err.response?.status < 500) {
          throw err;
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  };

  // Check authentication on component mount
  useEffect(() => {
    isAuthenticated();
  }, []);

  const apiRequest = async (method, url, data = null, config = {}) => {
    setError(null);
    try {
      const axiosFn = async () => {
        const response = await axios({
          method,
          url: `${url}`,
          data,
          ...config,
        });
        return response.data;
      };
      const data = await retryRequest(axiosFn);
      return data;
    } catch (err) {
      const message =
        err.response?.data?.message || "An unexpected error occurred";
      setError(message);

      // Auto-logout on 401 errors
      if (err.response?.status === 401) {
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("localCart");
        localStorage.removeItem("localWishlist");
        toast.error("Session expired. Please login again.");
      }

      throw err;
    }
  };

const isAuthenticated = async () => {
  setIsLoading(true);
  try {
    const data = await apiRequest("get", "/api/auth/is-auth");
    if (data.success && data.user) {
      setUser({
        id: data.user.id,
        name: data.user.name,
        lastName: data.user.lastName,
        email: data.user.email,
        isAccountVerified: data.user.isAccountVerified,
        address: data.user.address,
        postCode: data.user.postCode,
        city: data.user.city,
        country: data.user.country,
        shippingAddress: data.user.shippingAddress,
        mobileNumber: data.user.mobileNumber,
        profilePicture: data.user.profilePicture,
      });
      localStorage.setItem("user", JSON.stringify(data.user));
      return data;
    } else {
      setUser(null);
      localStorage.removeItem("user");
      return { success: false, message: "Not authenticated" };
    }
  } catch (err) {
    // FIX: Handle network errors gracefully
    if (err.code === 'NETWORK_ERROR' || err.message === 'Network Error') {
      console.warn('Authentication check failed - network error');
    } else if (err.response?.status === 401 && localStorage.getItem("user")) {
      localStorage.removeItem("user");
    }
    setUser(null);
    return { success: false, message: "Network error - using guest mode" };
  } finally {
    setIsLoading(false);
  }
};

  const register = async (userData) => {
    setIsLoading(true);
    const { name, lastName, email, password, confirmPassword } = userData;
    if (!name || !email || !password || !confirmPassword) {
      setIsLoading(false);
      return {
        success: false,
        message: "Name, email, password, and confirm password are required",
      };
    }
    if (!validator.isEmail(email)) {
      setIsLoading(false);
      return { success: false, message: "Invalid email format" };
    }
    if (
      password.length < 8 ||
      !/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*]*$/.test(password)
    ) {
      setIsLoading(false);
      return { success: false, message: "Invalid password format" };
    }
    if (password !== confirmPassword) {
      setIsLoading(false);
      return { success: false, message: "Passwords do not match" };
    }
    if (name.length > 20) {
      setIsLoading(false);
      return { success: false, message: "Name must not exceed 20 characters" };
    }
    if (lastName && lastName.length > 20) {
      setIsLoading(false);
      return {
        success: false,
        message: "Last name must not exceed 20 characters",
      };
    }

    try {
      const data = await apiRequest("post", "/api/auth/register", userData);
      return data;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Registration failed",
      };
    } finally {
      setIsLoading(false);
    }
  };

const login = async (email, password) => {
  setIsLoading(true);
  if (!email || !password) {
    setIsLoading(false);
    return { success: false, message: "Email and password are required" };
  }
  if (!validator.isEmail(email)) {
    setIsLoading(false);
    return { success: false, message: "Invalid email format" };
  }

  const localCart = JSON.parse(localStorage.getItem("localCart") || "[]");
  const localWishlist = JSON.parse(
    localStorage.getItem("localWishlist") || "[]"
  );
  try {
    const data = await apiRequest("post", "/api/auth/login", {
      email,
      password,
      localCart,
      localWishlist,
    });
    if (data.success) {
      // Call isAuthenticated to refresh the user data with complete profile info
      await isAuthenticated();
      
      // Remove the manual setUser and localStorage setting here
      // The isAuthenticated call above will handle this
      
      if (data.wishlistSynced) {
        localStorage.removeItem("localWishlist");
      }
      if (data.cartSynced) {
        localStorage.removeItem("localCart");
      }
      if (data.syncErrors && data.syncErrors.length > 0) {
        console.warn("Login sync errors:", data.syncErrors);
      }
    }
    return data;
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || "Login failed",
    };
  } finally {
    setIsLoading(false);
  }
};

  const verifyEmail = async (otp) => {
    setIsLoading(true);
    if (!otp || !/^\d{6}$/.test(otp)) {
      setIsLoading(false);
      return { success: false, message: "Invalid OTP format" };
    }
    try {
      const data = await apiRequest("post", "/api/auth/verify-account", { otp });
      if (data.success) {
        setUser((prev) => ({ ...prev, isAccountVerified: true }));
        localStorage.setItem(
          "user",
          JSON.stringify({ ...user, isAccountVerified: true })
        );
      }
      return data;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Email verification failed",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const sendVerifyOtp = async (userId) => {
    setIsLoading(true);
    if (!userId) {
      setIsLoading(false);
      return { success: false, message: "User ID is required" };
    }
    try {
      const data = await apiRequest("post", "/api/auth/send-verify-otp", {
        userId,
      });
      return data;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to send OTP",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const sendResetOtp = async (email) => {
    setIsLoading(true);
    if (!email || !validator.isEmail(email)) {
      setIsLoading(false);
      return { success: false, message: "Valid email is required" };
    }
    try {
      const data = await apiRequest("post", "/api/auth/send-reset-otp", { email });
      return data;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to send reset OTP",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyResetOtp = async (email, otp) => {
    setIsLoading(true);
    if (!email || !otp || !validator.isEmail(email) || !/^\d{6}$/.test(otp)) {
      setIsLoading(false);
      return { success: false, message: "Valid email and OTP are required" };
    }
    try {
      const data = await apiRequest("post", "/api/auth/verify-reset-otp", {
        email,
        otp,
      });
      return data;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "OTP verification failed",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserOrders = async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest("get", "/api/orders/get");
      return data;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to fetch orders",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const createOrder = async (orderData) => {
    setIsLoading(true);
    try {
      const data = await apiRequest("post", "/api/orders/create", orderData);
      return data;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to create order",
      };
    } finally {
      setIsLoading(false);
    }
  };
  const resetPassword = async (email, otp, newPassword, confirmPassword) => {
    setIsLoading(true);
    if (!email || !otp || !newPassword || !confirmPassword) {
      setIsLoading(false);
      return { success: false, message: "All fields are required" };
    }
    if (!validator.isEmail(email)) {
      setIsLoading(false);
      return { success: false, message: "Invalid email format" };
    }
    if (!/^\d{6}$/.test(otp)) {
      setIsLoading(false);
      return { success: false, message: "Invalid OTP format" };
    }
    if (
      newPassword.length < 8 ||
      !/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*]*$/.test(newPassword)
    ) {
      setIsLoading(false);
      return { success: false, message: "Invalid password format" };
    }
    if (newPassword !== confirmPassword) {
      setIsLoading(false);
      return { success: false, message: "Passwords do not match" };
    }
    try {
      const data = await apiRequest("post", "/api/auth/reset-password", {
        email,
        otp,
        newPassword,
        confirmPassword,
      });
      return data;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Password reset failed",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const data = await apiRequest("post", "/api/auth/logout");
      if (data.success) {
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("localCart");
        localStorage.removeItem("localWishlist");
        toast.success("Logged out");
      }
      return data;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Logout failed",
      };
    }
  };

  const updateUser = async (formData) => {
    setIsLoading(true);
    try {
      const data = await apiRequest("put", "/api/auth/update-profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (data.success) {
        setUser({
          id: data.user.id,
          name: data.user.name,
          lastName: data.user.lastName,
          email: data.user.email,
          address: data.user.address,
          postCode: data.user.postCode,
          city: data.user.city,
          country: data.user.country,
          shippingAddress: data.user.shippingAddress,
          mobileNumber: data.user.mobileNumber,
          profilePicture: data.user.profilePicture,
          isAccountVerified: data.user.isAccountVerified,
        });
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      return data;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Profile update failed",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const removeProfilePicture = async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest("delete", "/api/auth/remove-profile-picture");
      if (data.success) {
        setUser((prev) => ({ ...prev, profilePicture: null }));
        localStorage.setItem(
          "user",
          JSON.stringify({ ...user, profilePicture: null })
        );
      }
      return data;
    } catch (err) {
      return {
        success: false,
        message:
          err.response?.data?.message || "Failed to remove profile picture",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAccount = async (email, password) => {
    setIsLoading(true);
    if (!email || !password) {
      setIsLoading(false);
      return { success: false, message: "Email and password are required" };
    }
    if (!validator.isEmail(email)) {
      setIsLoading(false);
      return { success: false, message: "Invalid email format" };
    }
    try {
      const data = await apiRequest("delete", "/api/auth/delete-account", {
        email,
        password,
      });
      if (data.success) {
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("localCart");
        localStorage.removeItem("localWishlist");
      }
      return data;
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Account deletion failed",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const uploadPaymentProof = async (orderId, file) => {
    setIsLoading(true);
    if (!orderId || !file) {
      setIsLoading(false);
      return {
        success: false,
        message: "Order ID and proof file are required",
      };
    }

    const formData = new FormData();
    formData.append("orderId", orderId);
    formData.append("proof", file);

    try {
      const data = await apiRequest(
        "post",
        "/checkout/upload-proof",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return data;
    } catch (err) {
      return {
        success: false,
        message:
          err.response?.data?.message || "Failed to upload payment proof",
      };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        register,
        logout,
        updateUser,
        deleteAccount,
        verifyEmail,
        sendVerifyOtp,
        sendResetOtp,
        verifyResetOtp,
        resetPassword,
        apiRequest,
        setUser,
        removeProfilePicture,
        isAuthenticated,
        uploadPaymentProof,
        fetchUserOrders,
        createOrder,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;