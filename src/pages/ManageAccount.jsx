import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";
import imageCompression from "browser-image-compression";

const ManageAccount = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { backendUrl, userData, setIsLoggedin, getUserData, setUserData, theme } = useContext(AppContent);
  const [activeTab, setActiveTab] = useState(
    new URLSearchParams(location.search).get("tab") || "updateProfile"
  );
  const [profileData, setProfileData] = useState({
    name: "",
    employmentType: "PartTimer",
    oldPassword: "",
    newPassword: ""
  });
  const [deleteData, setDeleteData] = useState({
    email: "",
    password: "",
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [preview, setPreview] = useState(null);
  const [profilePictureError, setProfilePictureError] = useState("");
  const [hasFetched, setHasFetched] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userData && !hasFetched) {
        try {
          setHasFetched(true);
          await getUserData();
        } catch (error) {
          console.error("Failed to fetch user data:", error);
          toast.error("Please log in again");
          navigate("/login");
        }
      }
    };
    fetchUserData();
  }, [userData, hasFetched, getUserData, navigate]);

  useEffect(() => {
    if (userData) {
      setProfileData({
        name: userData.name || "",
        employmentType: userData.employmentType || "PartTimer",
        oldPassword: "",
        newPassword: ""
      });
      setDeleteData({
        email: userData.email || "",
        password: "",
      });
      setPreview(userData.profilePicture || null);
    }
  }, [userData]);

  const validateProfileForm = () => {
    if (profileData.name.length > 20) {
      toast.error("Name must be 20 characters or less");
      return false;
    }

    if (profileData.newPassword && profileData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return false;
    }

    return true;
  };

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!validateProfileForm()) return;

    setLoading(true);
    const toastId = toast.info("Updating profile...", { autoClose: false });

    try {
      const { data } = await axios.put(
        `${backendUrl}/api/auth/update-profile`,
        {
          name: profileData.name,
          employmentType: profileData.employmentType,
          oldPassword: profileData.oldPassword || undefined,
          newPassword: profileData.newPassword || undefined,
        },
        { withCredentials: true }
      );

      toast.dismiss(toastId);
      if (data.success) {
        toast.success("Profile updated successfully. Please login again.");
        setIsLoggedin(false);
        navigate("/login");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Profile update error:", error);
      const message = error.response?.data?.message || "Failed to update profile";
      toast.dismiss(toastId);
      toast.error(message);
      
      if (error.response?.status === 401 && message === "Session expired - Please login again") {
        setIsLoggedin(false);
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInputChange = (e) => {
    const { name, value } = e.target;
    setDeleteData({ ...deleteData, [name]: value });
  };

  const handleDeleteSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.info("Deleting account...", { autoClose: false });

    try {
      const { data } = await axios.delete(
        `${backendUrl}/api/auth/delete-account`,
        {
          data: {
            email: deleteData.email,
            password: deleteData.password,
          },
          withCredentials: true,
        }
      );

      toast.dismiss(toastId);
      if (data.success) {
        toast.success("Account deleted successfully");
        setIsLoggedin(false);
        navigate("/login");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Account deletion error:", error);
      const message = error.response?.data?.message || "Failed to delete account";
      toast.dismiss(toastId);
      toast.error(message);
      
      if (error.response?.status === 401 && message === "Session expired - Please login again") {
        setIsLoggedin(false);
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setProfilePictureError("Only valid image formats are allowed (e.g., JPEG, PNG, GIF, WEBP)");
      return;
    }

    try {
      // Compress image to ensure it's under 1MB
      const options = {
        maxSizeMB: 0.8, // Target size to account for base64 inflation
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);

      // Validate compressed file size
      if (compressedFile.size > 1 * 1024 * 1024) {
        setProfilePictureError("Image size must be 1MB or less after compression");
        return;
      }

      setProfilePictureError("");
      setProfilePicture(compressedFile);

      // Generate preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error("Image compression error:", error);
      setProfilePictureError("Failed to process image. Please try another.");
    }
  };

  const handleProfilePictureSubmit = async (e) => {
    e.preventDefault();
    if (!profilePicture) {
      toast.error("Please select an image");
      return;
    }

    setLoading(true);
    const toastId = toast.info(
      userData?.profilePicture ? "Updating profile picture..." : "Uploading profile picture...",
      { autoClose: false }
    );

    try {
      const reader = new FileReader();
      reader.readAsDataURL(profilePicture);
      reader.onloadend = async () => {
        const base64Image = reader.result;
        const { data } = await axios.post(
          `${backendUrl}/api/auth/upload-profile-picture`,
          { profilePicture: base64Image },
          { withCredentials: true }
        );

        toast.dismiss(toastId);
        if (data.success) {
          setUserData(data.user);
          toast.success(data.message);
          setProfilePicture(null);
          setPreview(data.user.profilePicture);
        } else {
          toast.error(data.message);
        }
      };
    } catch (error) {
      console.error("Profile picture upload error:", error);
      toast.dismiss(toastId);
      toast.error(error.response?.data?.message || "Failed to upload profile picture");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveProfilePicture = async () => {
    setLoading(true);
    const toastId = toast.info("Removing profile picture...", { autoClose: false });

    try {
      const { data } = await axios.delete(
        `${backendUrl}/api/auth/remove-profile-picture`,
        { withCredentials: true }
      );

      toast.dismiss(toastId);
      if (data.success) {
        setUserData(data.user);
        setPreview(null);
        setProfilePicture(null);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Profile picture removal error:", error);
      toast.dismiss(toastId);
      toast.error(error.response?.data?.message || "Failed to remove profile picture");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'day' ? 'bg-day' : 'bg-night text-night-text'} flex items-center justify-center px-4 font-['Poppins',sans-serif] py-8 sm:py-12`}>
      <div className={`${theme === 'day' ? 'bg-day-card' : 'bg-night-card'} rounded-2xl shadow-xl p-6 w-full max-w-md border ${theme === 'day' ? 'border-day' : 'border-night'} hover:shadow-2xl transition-shadow duration-300`}>
        <div className="flex justify-center mb-4">
          <img
            onClick={() => navigate("/")}
            src="/logo.png"
            alt="Logo"
            className="w-12 sm:w-14 h-auto cursor-pointer hover:scale-105 transition-transform duration-300"
          />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-[#45B7D1] mb-3 relative">
          Manage Account
          <span className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-16 h-1 bg-[#45B7D1] rounded-full"></span>
        </h2>
        <div className="flex flex-row justify-center gap-1 sm:gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab("updateProfile")}
            className={`min-w-fit px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium text-xs sm:text-sm text-white cursor-pointer transition-all duration-300 shadow-md hover:scale-105 ${
              activeTab === "updateProfile"
                ? "bg-[#E31837] hover:bg-[#C3152F]"
                : "bg-[#006491] hover:bg-[#004D73]"
            }`}
            disabled={loading}
          >
            Update Profile
          </button>
          <button
            onClick={() => setActiveTab("profilePicture")}
            className={`min-w-fit px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium text-xs sm:text-sm text-white cursor-pointer transition-all duration-300 shadow-md hover:scale-105 ${
              activeTab === "profilePicture"
                ? "bg-[#E31837] hover:bg-[#C3152F]"
                : "bg-[#006491] hover:bg-[#004D73]"
            }`}
            disabled={loading}
          >
            Profile Picture
          </button>
          <button
            onClick={() => setActiveTab("deleteAccount")}
            className={`min-w-fit px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium text-xs sm:text-sm text-white cursor-pointer transition-all duration-300 shadow-md hover:scale-105 ${
              activeTab === "deleteAccount"
                ? "bg-[#E31837] hover:bg-[#C3152F]"
                : "bg-[#006491] hover:bg-[#004D73]"
            }`}
            disabled={loading}
          >
            Delete Account
          </button>
        </div>

        {activeTab === "updateProfile" && (
          <>
            <p className={`text-center text-sm sm:text-base mb-6 ${theme === 'day' ? 'text-gray-600' : 'text-gray-300'}`}>
              Update your profile details
            </p>
            <form className="space-y-4" onSubmit={handleProfileSubmit}>
              <div className="space-y-1">
                <div className={`flex items-center border ${theme === 'day' ? 'border-day' : 'border-night'} rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-[#E31837] ${theme === 'day' ? 'bg-day-input' : 'bg-night-input'} shadow-sm hover:shadow-md transition-all duration-300`}>
                  <img
                    src={assets.person_icon}
                    alt="Person Icon"
                    className="w-5 h-5 mr-2 filter brightness-75"
                  />
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={profileData.name}
                    onChange={handleProfileInputChange}
                    maxLength={20}
                    className={`w-full outline-none text-sm sm:text-base bg-transparent ${theme === 'day' ? 'text-gray-900' : 'text-white'}`}
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className={`block text-sm sm:text-base font-medium ${theme === 'day' ? 'text-gray-700' : 'text-white'}`}>
                  Employment Type
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setProfileData({ ...profileData, employmentType: "FullTimer" })}
                    className={`flex-1 px-4 py-2 rounded-full font-medium text-sm sm:text-base text-white cursor-pointer transition-all duration-300 shadow-md hover:scale-105 ${
                      profileData.employmentType === "FullTimer"
                        ? "bg-[#E31837] hover:bg-[#C3152F]"
                        : "bg-[#006491] hover:bg-[#004D73]"
                    }`}
                    disabled={loading}
                  >
                    Full Timer
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfileData({ ...profileData, employmentType: "PartTimer" })}
                    className={`flex-1 px-4 py-2 rounded-full font-medium text-sm sm:text-base text-white cursor-pointer transition-all duration-300 shadow-md hover:scale-105 ${
                      profileData.employmentType === "PartTimer"
                        ? "bg-[#E31837] hover:bg-[#C3152F]"
                        : "bg-[#006491] hover:bg-[#004D73]"
                    }`}
                    disabled={loading}
                  >
                    Part Timer
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <div className={`flex items-center border ${theme === 'day' ? 'border-day' : 'border-night'} rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-[#E31837] ${theme === 'day' ? 'bg-day-input' : 'bg-night-input'} shadow-sm hover:shadow-md transition-all duration-300`}>
                  <img
                    src={assets.lock_icon}
                    alt="Lock Icon"
                    className="w-5 h-5 mr-2 filter brightness-75"
                  />
                  <input
                    type="password"
                    name="oldPassword"
                    placeholder="Current Password (required for password change)"
                    value={profileData.oldPassword}
                    onChange={handleProfileInputChange}
                    maxLength={50}
                    className={`w-full outline-none text-sm sm:text-base bg-transparent ${theme === 'day' ? 'text-gray-900' : 'text-white'}`}
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <div className={`flex items-center border ${theme === 'day' ? 'border-day' : 'border-night'} rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-[#E31837] ${theme === 'day' ? 'bg-day-input' : 'bg-night-input'} shadow-sm hover:shadow-md transition-all duration-300`}>
                  <img
                    src={assets.lock_icon}
                    alt="Lock Icon"
                    className="w-5 h-5 mr-2 filter brightness-75"
                  />
                  <input
                    type="password"
                    name="newPassword"
                    placeholder="New Password"
                    value={profileData.newPassword}
                    onChange={handleProfileInputChange}
                    maxLength={50}
                    className={`w-full outline-none text-sm sm:text-base bg-transparent ${theme === 'day' ? 'text-gray-900' : 'text-white'}`}
                    disabled={loading}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-[#E31837] text-white font-semibold py-3 rounded-full hover:bg-[#C3152F] hover:scale-105 transition-all duration-300 shadow-md cursor-pointer text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Profile"}
              </button>
            </form>
          </>
        )}

        {activeTab === "profilePicture" && (
          <>
            <p className={`text-center text-sm sm:text-base mb-6 ${theme === 'day' ? 'text-gray-600' : 'text-gray-300'}`}>
              {userData?.profilePicture ? "Update or remove your profile picture" : "Add a profile picture"}
            </p>
            <div className="space-y-4">
              {preview && (
                <div className="flex justify-center">
                  <img
                    src={preview}
                    alt="Profile Preview"
                    className="w-24 h-24 rounded-full object-cover shadow-md border ${theme === 'day' ? 'border-day' : 'border-night'}"
                  />
                </div>
              )}
              <div className="space-y-2">
                <label className={`block text-sm sm:text-base font-medium ${theme === 'day' ? 'text-gray-700' : 'text-white'}`}>
                  Upload from Gallery
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className={`w-full p-3 border ${theme === 'day' ? 'border-day' : 'border-night'} rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E31837] focus:scale-[1.01] transition-all duration-300 text-sm sm:text-base ${theme === 'day' ? 'bg-day-input text-gray-900' : 'bg-night-input text-white'}`}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <label className={`block text-sm sm:text-base font-medium ${theme === 'day' ? 'text-gray-700' : 'text-white'}`}>
                  Capture from Camera
                </label>
                <input
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={handleProfilePictureChange}
                  className={`w-full p-3 border ${theme === 'day' ? 'border-day' : 'border-night'} rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E31837] focus:scale-[1.01] transition-all duration-300 text-sm sm:text-base ${theme === 'day' ? 'bg-day-input text-gray-900' : 'bg-night-input text-white'}`}
                  disabled={loading}
                />
              </div>
              {profilePictureError && (
                <p className="text-[#E31837] text-xs sm:text-sm">{profilePictureError}</p>
              )}
              <div className="flex flex-row gap-2 sm:gap-3">
                <button
                  onClick={handleProfilePictureSubmit}
                  disabled={!profilePicture || loading}
                  className="flex-1 bg-[#E31837] text-white font-semibold py-2 sm:py-3 rounded-full hover:bg-[#C3152F] hover:scale-105 transition-all duration-300 shadow-md cursor-pointer text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Processing..." : userData?.profilePicture ? "Update Picture" : "Add Picture"}
                </button>
                {userData?.profilePicture && (
                  <button
                    onClick={handleRemoveProfilePicture}
                    className="flex-1 bg-[#006491] text-white font-semibold py-2 sm:py-3 rounded-full hover:bg-[#004D73] hover:scale-105 transition-all duration-300 shadow-md cursor-pointer text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    {loading ? "Removing..." : "Remove Picture"}
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === "deleteAccount" && (
          <>
            <p className={`text-center text-sm sm:text-base mb-6 ${theme === 'day' ? 'text-gray-600' : 'text-gray-300'}`}>
              Enter your credentials to delete your account
            </p>
            <form className="space-y-4" onSubmit={handleDeleteSubmit}>
              <div className={`flex items-center border ${theme === 'day' ? 'border-day' : 'border-night'} rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-[#E31837] ${theme === 'day' ? 'bg-day-input' : 'bg-night-input'} shadow-sm hover:shadow-md transition-all duration-300`}>
                <img
                  src={assets.mail_icon}
                  alt="Mail Icon"
                  className="w-5 h-5 mr-2 filter brightness-75"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email ID"
                  value={deleteData.email}
                  onChange={handleDeleteInputChange}
                  required
                  className={`w-full outline-none text-sm sm:text-base bg-transparent ${theme === 'day' ? 'text-gray-900' : 'text-white'}`}
                  disabled={loading}
                />
              </div>
              <div className="space-y-1">
                <div className={`flex items-center border ${theme === 'day' ? 'border-day' : 'border-night'} rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-[#E31837] ${theme === 'day' ? 'bg-day-input' : 'bg-night-input'} shadow-sm hover:shadow-md transition-all duration-300`}>
                  <img
                    src={assets.lock_icon}
                    alt="Lock Icon"
                    className="w-5 h-5 mr-2 filter brightness-75"
                  />
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={deleteData.password}
                    onChange={handleDeleteInputChange}
                    required
                    maxLength={50}
                    className={`w-full outline-none text-sm sm:text-base bg-transparent ${theme === 'day' ? 'text-gray-900' : 'text-white'}`}
                    disabled={loading}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-[#E31837] text-white font-semibold py-3 rounded-full hover:bg-[#C3152F] hover:scale-105 transition-all duration-300 shadow-md cursor-pointer text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete Account"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ManageAccount;