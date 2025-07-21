import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const DailyRecords = () => {
  const { backendUrl, isLoggedin, userData, getUserData, theme } =
    useContext(AppContent);
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    work_status: "On",
    deliveries: 0,
    tips: 0,
    expenses: 0,
    day_quality: "Average",
  });
  const [errors, setErrors] = useState({});
  const [activeFilters, setActiveFilters] = useState([]);
  const [showDaysOff, setShowDaysOff] = useState(false);

  // Day quality options with colors
  const dayQualityOptions = [
    { value: "Excellent", label: "Excellent", color: "bg-green-600" },
    { value: "VeryGood", label: "Very Good", color: "bg-teal-500" },
    { value: "Good", label: "Good", color: "bg-blue-500" },
    { value: "Average", label: "Average", color: "bg-yellow-500" },
    { value: "Bad", label: "Bad", color: "bg-orange-500" },
    { value: "VeryBad", label: "Very Bad", color: "bg-red-600" },
  ];

  // Calculate current billing cycle (21st to 20th)
  const getBillingCycle = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();
    let startDate, endDate;

    if (day >= 21) {
      // Current cycle started on 21st of current month
      startDate = new Date(year, month, 21);
      endDate = new Date(year, month + 1, 20);
    } else {
      // Current cycle started on 21st of previous month
      startDate = new Date(year, month - 1, 21);
      endDate = new Date(year, month, 20);
    }

    // Set times correctly
    startDate.setUTCHours(0, 0, 0, 0);
    endDate.setUTCHours(23, 59, 59, 999);
    return { startDate, endDate };
  };

  const { startDate, endDate } = getBillingCycle();
  const cycleDisplay = `${startDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
  })} to ${endDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })}`;

  // Fetch records for the current billing cycle
  const fetchRecords = async () => {
    if (!userData || !userData._id) return;
    setLoading(true);
    try {
      const response = await axios.get(
        `${backendUrl}/api/daily/records?user_id=${
          userData._id
        }&start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`,
        { withCredentials: true }
      );
      if (response.data.success) {
        setRecords(response.data.records);
        setFilteredRecords(response.data.records);
      } else {
        toast.error(response.data.message || "Failed to fetch records");
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to fetch records";
      toast.error(message);
      if (
        error.response?.status === 401 &&
        message === "Session expired - Please login again"
      ) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializePage = async () => {
      try {
        if (!isLoggedin || !userData || !userData._id) {
          const success = await getUserData();
          if (!success) {
            navigate("/login");
            return;
          }
        }
        await fetchRecords();
      } catch (error) {
        console.error("Initialization error:", error);
        navigate("/login");
      }
    };

    initializePage();
  }, [isLoggedin, userData, getUserData, navigate, backendUrl]);

  // Apply filters when activeFilters, records, or showDaysOff change
  useEffect(() => {
    if (showDaysOff) {
      setFilteredRecords(
        records.filter((record) => record.work_status === "Off")
      );
    } else if (activeFilters.length === 0) {
      setFilteredRecords(records);
    } else {
      setFilteredRecords(
        records.filter((record) => activeFilters.includes(record.day_quality))
      );
    }
  }, [activeFilters, records, showDaysOff]);

  const toggleFilter = (quality) => {
    if (showDaysOff) return;
    setActiveFilters((prev) =>
      prev.includes(quality)
        ? prev.filter((q) => q !== quality)
        : [...prev, quality]
    );
  };

  const resetFilters = () => {
    setActiveFilters([]);
    setShowDaysOff(false);
  };

  const toggleDaysOff = () => {
    setShowDaysOff((prev) => !prev);
    setActiveFilters([]);
  };

  const handleViewDetails = (record) => {
    setSelectedRecord(record);
    setFormData({
      work_status: record.work_status,
      deliveries: record.deliveries,
      tips: record.tips,
      expenses: record.expenses,
      day_quality: record.day_quality || "Average",
    });
    setIsEditing(false);
    setErrors({});
  };

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setFormData({
      work_status: record.work_status,
      deliveries: record.deliveries,
      tips: record.tips,
      expenses: record.expenses,
      day_quality: record.day_quality || "Average",
    });
    setIsEditing(true);
    setErrors({});
  };

  const handleDelete = (record) => {
    setShowDeleteConfirm(record);
  };

  const confirmDelete = async () => {
    try {
      const response = await axios.delete(
        `${backendUrl}/api/daily/record/${showDeleteConfirm._id}`,
        { withCredentials: true }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        setShowDeleteConfirm(null);
        fetchRecords();
      } else {
        toast.error(response.data.message || "Failed to delete record");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete record");
    }
  };

  const handleCloseDetails = () => {
    setSelectedRecord(null);
    setIsEditing(false);
    setErrors({});
  };

  const handleCloseDeleteConfirm = () => {
    setShowDeleteConfirm(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "work_status"
          ? value
          : name === "day_quality"
          ? value
          : Number(value) || 0,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.work_status) {
      newErrors.work_status = "Work status is required";
    } else if (!["On", "Off"].includes(formData.work_status)) {
      newErrors.work_status = "Invalid work status";
    }
    if (formData.work_status === "On") {
      if (formData.deliveries < 0)
        newErrors.deliveries = "Deliveries cannot be negative";
      if (formData.tips < 0) newErrors.tips = "Tips cannot be negative";
      if (formData.expenses < 0)
        newErrors.expenses = "Expenses cannot be negative";
      if (
        ![
          "Excellent",
          "VeryGood",
          "Good",
          "Average",
          "Bad",
          "VeryBad",
        ].includes(formData.day_quality)
      ) {
        newErrors.day_quality = "Day quality is required for On status";
      }
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const updatedData = {
        date: selectedRecord.date,
        work_status: formData.work_status,
        deliveries: formData.work_status === "Off" ? 0 : formData.deliveries,
        tips: formData.work_status === "Off" ? 0 : formData.tips,
        expenses: formData.work_status === "Off" ? 0 : formData.expenses,
        day_quality:
          formData.work_status === "Off" ? null : formData.day_quality,
      };

      const response = await axios.put(
        `${backendUrl}/api/daily/record/${selectedRecord._id}`,
        updatedData,
        { withCredentials: true }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        setSelectedRecord(null);
        setIsEditing(false);
        fetchRecords();
      } else {
        toast.error(response.data.message || "Failed to update record");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update record");
    }
  };

  if (!isLoggedin || !userData) {
    return null;
  }

  return (
    <div
      className={`min-h-screen ${
        theme === "day" ? "bg-day" : "bg-night text-night-text"
      } py-6 px-4 sm:px-6 lg:px-8 font-['Poppins',sans-serif]`}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Billing Cycle Header */}
        <div className="bg-gradient-to-r from-[#E31837] to-[#006491] rounded-2xl shadow-lg p-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Daily Records
          </h2>
          <p className="text-sm sm:text-base text-white opacity-90 mt-2">
            {cycleDisplay}
          </p>
        </div>

        {/* Filter Controls */}
        <div
          className={`${
            theme === "day" ? "bg-day-card" : "bg-night-card"
          } rounded-2xl shadow-xl p-4 sm:p-6 hover:shadow-xl transition-shadow duration-300`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h3 className="text-lg sm:text-xl font-semibold text-[#45B7D1] relative">
              Filter by Day Quality
            </h3>
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-3">
                {dayQualityOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => toggleFilter(option.value)}
                    disabled={showDaysOff}
                    className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-full transition-all duration-300 cursor-pointer shadow-sm ${
                      activeFilters.includes(option.value) && !showDaysOff
                        ? `${
                            option.color
                          } text-white hover:${option.color.replace(
                            /-\d+/,
                            (match) => `-${parseInt(match.slice(1)) + 100}`
                          )}`
                        : `${
                            theme === "day"
                              ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                              : "bg-gray-600 text-gray-200 hover:bg-gray-500"
                          }${
                            showDaysOff ? " opacity-50 cursor-not-allowed" : ""
                          }`
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-3 items-center sm:items-end justify-center sm:justify-end">
                <button
                  onClick={resetFilters}
                  className="w-32 sm:w-36 px-4 py-2 text-sm font-semibold text-white bg-[#006491] rounded-full hover:bg-[#004D73] hover:scale-105 transition-all duration-300 shadow-md cursor-pointer"
                >
                  Reset
                </button>
                <button
                  onClick={toggleDaysOff}
                  className={`w-32 sm:w-36 px-4 py-2 text-sm font-semibold text-white rounded-full transition-all duration-300 shadow-md cursor-pointer hover:scale-105 ${
                    showDaysOff
                      ? "bg-[#E31837] hover:bg-[#C3152F]"
                      : "bg-[#E31837]/80 hover:bg-[#E31837]"
                  }`}
                >
                  {showDaysOff ? "Show All Records" : "Show Days Off"}
                </button>
              </div>
            </div>
          </div>
          <p
            className={`text-sm ${
              theme === "day" ? "text-day-muted" : "text-night-muted"
            }`}
          >
            Showing {filteredRecords.length} of {records.length} records
            {showDaysOff
              ? " (filtered by Days Off)"
              : activeFilters.length > 0
              ? ` (filtered by ${activeFilters.join(", ")})`
              : ""}
          </p>
        </div>

        {/* Records List */}
        <div
          className={`${
            theme === "day" ? "bg-day-card" : "bg-night-card"
          } rounded-2xl shadow-xl p-3 sm:p-6 hover:shadow-xl transition-shadow duration-300`}
        >
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-[#E31837] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredRecords.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {filteredRecords.map((record) => (
                <div
                  key={record._id}
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 ${
                    theme === "day"
                      ? "bg-gray-50 hover:bg-gray-100"
                      : "bg-gray-700 hover:bg-gray-600"
                  } rounded-xl hover:shadow-md transition-all duration-300`}
                >
                  <div className="flex items-center gap-3 w-full sm:w-auto mb-2 sm:mb-0">
                    <span
                      className={`px-3 py-1 text-xs sm:text-sm font-semibold text-white rounded-full ${
                        record.work_status === "On"
                          ? "bg-[#22C55E]"
                          : "bg-[#E31837]"
                      }`}
                    >
                      {record.work_status}
                    </span>
                    <span
                      className={`text-sm sm:text-base font-medium ${
                        theme === "day" ? "text-gray-700" : "text-gray-200"
                      }`}
                    >
                      {new Date(record.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    {record.day_quality && (
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          dayQualityOptions.find(
                            (q) => q.value === record.day_quality
                          )?.color || "bg-gray-200"
                        } text-white`}
                      >
                        {dayQualityOptions.find(
                          (q) => q.value === record.day_quality
                        )?.label || record.day_quality}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto justify-end sm:justify-normal">
                    <button
                      onClick={() => handleViewDetails(record)}
                      className="w-24 sm:w-28 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold text-white bg-[#8B5CF6] rounded-full hover:bg-[#7C3AED] hover:scale-105 transition-all duration-300 shadow-md cursor-pointer"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleEdit(record)}
                      className="w-24 sm:w-28 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold text-white bg-[#45B7D1] rounded-full hover:bg-[#3B9BB3] hover:scale-105 transition-all duration-300 shadow-md cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(record)}
                      className="w-24 sm:w-28 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold text-white bg-[#E31837] rounded-full hover:bg-[#C3152F] hover:scale-105 transition-all duration-300 shadow-md cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p
                className={`text-sm sm:text-base ${
                  theme === "day" ? "text-day-muted" : "text-night-muted"
                }`}
              >
                {showDaysOff
                  ? "No days off in this cycle"
                  : activeFilters.length > 0
                  ? "No records match the selected filters"
                  : "No records available for this cycle"}
              </p>
              {(showDaysOff || activeFilters.length > 0) && (
                <button
                  onClick={resetFilters}
                  className="mt-4 px-4 py-2 text-sm font-semibold text-white bg-[#006491] rounded-full hover:bg-[#004D73] hover:scale-105 transition-all duration-300 shadow-md cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Details/Edit Modal */}
        {selectedRecord && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={handleCloseDetails}
          >
            <div
              className={`${
                theme === "day" ? "bg-day-card" : "bg-night-card"
              } rounded-2xl shadow-xl p-4 sm:p-6 max-w-lg w-full mx-auto hover:shadow-xl transition-shadow duration-300 border ${
                theme === "day" ? "border-day" : "border-night"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-[#45B7D1]">
                  {isEditing ? "Edit Record" : "Record Details"}
                </h3>
                <button
                  onClick={handleCloseDetails}
                  className="text-sm font-semibold text-[#E31837] hover:text-[#C3152F]"
                >
                  Close
                </button>
              </div>
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      className={`block ${
                        theme === "day" ? "text-gray-700" : "text-gray-200"
                      } font-medium mb-1`}
                    >
                      Work Status
                    </label>
                    <select
                      name="work_status"
                      value={formData.work_status}
                      onChange={handleInputChange}
                      className={`w-full border ${
                        errors.work_status
                          ? "border-red-500"
                          : theme === "day"
                          ? "border-day"
                          : "border-night"
                      } rounded-xl p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#45B7D1] text-sm sm:text-base ${
                        theme === "day" ? "bg-day-input" : "bg-night-input"
                      }`}
                    >
                      <option value="On">On</option>
                      <option value="Off">Off</option>
                    </select>
                    {errors.work_status && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.work_status}
                      </p>
                    )}
                  </div>
                  {formData.work_status === "On" && (
                    <>
                      <div>
                        <label
                          className={`block ${
                            theme === "day" ? "text-gray-700" : "text-gray-200"
                          } font-medium mb-1`}
                        >
                          Deliveries
                        </label>
                        <input
                          type="number"
                          name="deliveries"
                          value={formData.deliveries}
                          onChange={handleInputChange}
                          className={`w-full border ${
                            errors.deliveries
                              ? "border-red-500"
                              : theme === "day"
                              ? "border-day"
                              : "border-night"
                          } rounded-xl p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#45B7D1] text-sm sm:text-base ${
                            theme === "day" ? "bg-day-input" : "bg-night-input"
                          }`}
                          min="0"
                        />
                        {errors.deliveries && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.deliveries}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          className={`block ${
                            theme === "day" ? "text-gray-700" : "text-gray-200"
                          } font-medium mb-1`}
                        >
                          Tips (Rs)
                        </label>
                        <input
                          type="number"
                          name="tips"
                          value={formData.tips}
                          onChange={handleInputChange}
                          className={`w-full border ${
                            errors.tips
                              ? "border-red-500"
                              : theme === "day"
                              ? "border-day"
                              : "border-night"
                          } rounded-xl p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#45B7D1] text-sm sm:text-base ${
                            theme === "day" ? "bg-day-input" : "bg-night-input"
                          }`}
                          min="0"
                          step="0.01"
                        />
                        {errors.tips && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.tips}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          className={`block ${
                            theme === "day" ? "text-gray-700" : "text-gray-200"
                          } font-medium mb-1`}
                        >
                          Expenses (Rs)
                        </label>
                        <input
                          type="number"
                          name="expenses"
                          value={formData.expenses}
                          onChange={handleInputChange}
                          className={`w-full border ${
                            errors.expenses
                              ? "border-red-500"
                              : theme === "day"
                              ? "border-day"
                              : "border-night"
                          } rounded-xl p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#45B7D1] text-sm sm:text-base ${
                            theme === "day" ? "bg-day-input" : "bg-night-input"
                          }`}
                          min="0"
                          step="0.01"
                        />
                        {errors.expenses && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.expenses}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          className={`block ${
                            theme === "day" ? "text-gray-700" : "text-gray-200"
                          } font-medium mb-1`}
                        >
                          Day Quality
                        </label>
                        <select
                          name="day_quality"
                          value={formData.day_quality}
                          onChange={handleInputChange}
                          className={`w-full border ${
                            errors.day_quality
                              ? "border-red-500"
                              : theme === "day"
                              ? "border-day"
                              : "border-night"
                          } rounded-xl p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#45B7D1] text-sm sm:text-base ${
                            theme === "day" ? "bg-day-input" : "bg-night-input"
                          }`}
                        >
                          {dayQualityOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {errors.day_quality && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.day_quality}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                  <div className="flex justify-end gap-4 pt-2">
                    <button
                      type="button"
                      onClick={handleCloseDetails}
                      className="w-32 sm:w-36 px-4 py-2 text-sm font-semibold text-white bg-[#1A1A1A] rounded-full hover:bg-[#333333] hover:scale-105 transition-all duration-300 shadow-md cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="w-32 sm:w-36 px-4 py-2 text-sm font-semibold text-white bg-[#E31837] rounded-full hover:bg-[#C3152F] hover:scale-105 transition-all duration-300 shadow-md cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <p
                    className={`${
                      theme === "day" ? "text-gray-700" : "text-gray-200"
                    }`}
                  >
                    <strong>Date:</strong>{" "}
                    {new Date(selectedRecord.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p
                    className={`${
                      theme === "day" ? "text-gray-700" : "text-gray-200"
                    }`}
                  >
                    <strong>Work Status:</strong> {selectedRecord.work_status}
                  </p>
                  {selectedRecord.work_status === "On" && (
                    <>
                      <p
                        className={`${
                          theme === "day" ? "text-gray-700" : "text-gray-200"
                        }`}
                      >
                        <strong>Deliveries:</strong> {selectedRecord.deliveries}
                      </p>
                      <p
                        className={`${
                          theme === "day" ? "text-gray-700" : "text-gray-200"
                        }`}
                      >
                        <strong>Tips:</strong> Rs.{" "}
                        {selectedRecord.tips.toFixed(2)}
                      </p>
                      <p
                        className={`${
                          theme === "day" ? "text-gray-700" : "text-gray-200"
                        }`}
                      >
                        <strong>Expenses:</strong> Rs.{" "}
                        {selectedRecord.expenses.toFixed(2)}
                      </p>
                      <p
                        className={`${
                          theme === "day" ? "text-gray-700" : "text-gray-200"
                        }`}
                      >
                        <strong>Day Quality:</strong>{" "}
                        {dayQualityOptions.find(
                          (q) => q.value === selectedRecord.day_quality
                        )?.label || selectedRecord.day_quality}
                      </p>
                    </>
                  )}
                  <div className="flex justify-end gap-4 pt-2">
                    <button
                      onClick={handleCloseDetails}
                      className="w-32 sm:w-36 px-4 py-2 text-sm font-semibold text-white bg-[#1A1A1A] rounded-full hover:bg-[#333333] hover:scale-105 transition-all duration-300 shadow-md cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={handleCloseDeleteConfirm}
          >
            <div
              className={`${
                theme === "day" ? "bg-day-card" : "bg-night-card"
              } rounded-2xl shadow-xl p-4 sm:p-6 max-w-lg w-full mx-auto hover:shadow-xl transition-shadow duration-300 border ${
                theme === "day" ? "border-day" : "border-night"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg sm:text-xl font-bold text-[#E31837] mb-4">
                Confirm Deletion
              </h3>
              <p
                className={`${
                  theme === "day" ? "text-gray-700" : "text-gray-200"
                } mb-6`}
              >
                Are you sure you want to delete the record for{" "}
                {new Date(showDeleteConfirm.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
                ?
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={handleCloseDeleteConfirm}
                  className="w-32 sm:w-36 px-4 py-2 text-sm font-semibold text-white bg-[#1A1A1A] rounded-full hover:bg-[#333333] hover:scale-105 transition-all duration-300 shadow-md cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="w-32 sm:w-36 px-4 py-2 text-sm font-semibold text-white bg-[#E31837] rounded-full hover:bg-[#C3152F] hover:scale-105 transition-all duration-300 shadow-md cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyRecords;
