import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Title
);

const Dashboard = () => {
  const {
    backendUrl,
    isLoggedin,
    setIsLoggedin,
    userData,
    getUserData,
    loadingUser,
    fetchError,
    theme,
  } = useContext(AppContent);
  const [animateWelcome, setAnimateWelcome] = useState(false);
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    fixed_salary: true,
    deliveries: true,
    tips: true,
  });
  const [chartType, setChartType] = useState("earnings");
  const [variable, setVariable] = useState("deliveries");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    work_status: "On",
    deliveries: "",
    tips: "",
    expenses: "",
    day_quality: "Average",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

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

  useEffect(() => {
    if (!loadingUser && (!isLoggedin || fetchError)) {
      navigate("/");
    }
  }, [isLoggedin, fetchError, loadingUser, navigate]);

  const fetchDashboardData = async () => {
    if (!userData || !userData._id) return;
    setLoading(true);
    try {
      const include = Object.keys(filters)
        .filter((key) => filters[key])
        .join(",");
      const [summaryRes, recordsRes] = await Promise.all([
        axios.get(
          `${backendUrl}/api/daily/monthly-summary?user_id=${userData._id}&include=${include}`,
          {
            withCredentials: true,
          }
        ),
        axios.get(`${backendUrl}/api/daily/records?user_id=${userData._id}`, {
          withCredentials: true,
        }),
      ]);
      if (summaryRes.data.success) setSummary(summaryRes.data.summary);
      if (recordsRes.data.success) setRecords(recordsRes.data.records);
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch data";
      toast.error(message);
      if (
        error.response?.status === 401 &&
        message === "Session expired - Please login again"
      ) {
        setIsLoggedin(false);
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleWelcomeClick = () => {
    setAnimateWelcome((prev) => !prev);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "work_status") {
        updated.day_quality = value === "On" ? "Average" : null;
      }
      return updated;
    });
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.work_status)
      newErrors.work_status = "Work status is required";
    if (formData.work_status === "On") {
      if (!formData.deliveries || Number(formData.deliveries) < 0)
        newErrors.deliveries = "Deliveries must be a non-negative number";
      if (!formData.tips || Number(formData.tips) < 0)
        newErrors.tips = "Tips must be a non-negative number";
      if (!formData.expenses || Number(formData.expenses) < 0)
        newErrors.expenses = "Expenses must be a non-negative number";
      if (
        !formData.day_quality ||
        ![
          "Excellent",
          "VeryGood",
          "Good",
          "Average",
          "Bad",
          "VeryBad",
        ].includes(formData.day_quality)
      )
        newErrors.day_quality = "Valid day quality is required for On status";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!isLoggedin || !userData || !userData._id) {
      toast.error("Please log in to submit details.");
      navigate("/login");
      return;
    }

    setSubmitting(true);
    const submissionData = {
      ...formData,
      user_id: userData._id,
      deliveries:
        formData.work_status === "On" ? Number(formData.deliveries) : 0,
      tips: formData.work_status === "On" ? Number(formData.tips) : 0,
      expenses: formData.work_status === "On" ? Number(formData.expenses) : 0,
    };

    try {
      const response = await axios.post(
        `${backendUrl}/api/daily/record`,
        submissionData,
        {
          withCredentials: true,
        }
      );
      if (response.data.success) {
        toast.success("Details saved successfully!", { autoClose: 1500 });
        await getUserData();
        await fetchDashboardData();
        setFormData({
          date: new Date().toISOString().split("T")[0],
          work_status: "On",
          deliveries: "",
          tips: "",
          expenses: "",
          day_quality: "Average",
        });
        setShowForm(false);
      } else {
        toast.error(response.data.message || "Failed to save details");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "An error occurred while saving."
      );
      console.error("Submission error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (isLoggedin && (!userData || !userData._id)) {
      getUserData();
    }
  }, [isLoggedin, userData, getUserData]);

  useEffect(() => {
    if (isLoggedin && userData?._id) {
      fetchDashboardData();
    }
  }, [backendUrl, isLoggedin, filters, userData]);

  const handleFilterChange = (name) => {
    setFilters((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const resetFilters = () => {
    setFilters({
      fixed_salary: true,
      deliveries: true,
      tips: true,
    });
  };

  const fixedSalary = userData?.employmentType === "FullTimer" ? 37000 : 18500;
  const penalty = userData?.employmentType === "FullTimer" ? 1170 : 585;
  const adjustedFixedSalary =
    summary && summary.days_off > 4
      ? fixedSalary - (summary.days_off - 4) * penalty
      : fixedSalary;

  const sortedRecords = [...records].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const earningsData = {
    labels: sortedRecords.map((r) => new Date(r.date).toLocaleDateString()),
    datasets: [
      {
        label: "Earnings",
        data: sortedRecords.map((r) => r.deliveries * 45 + r.tips),
        fill: false,
        backgroundColor: "#E31837",
        borderColor: "#E31837",
        tension: 0.1,
      },
    ],
  };

  const variableData = {
    labels: sortedRecords.map((r) => new Date(r.date).toLocaleDateString()),
    datasets: [
      {
        label: variable.charAt(0).toUpperCase() + variable.slice(1),
        data: sortedRecords.map((r) => r[variable]),
        fill: false,
        backgroundColor:
          variable === "deliveries"
            ? "#45B7D1"
            : variable === "tips"
            ? "#F7D794"
            : variable === "expenses"
            ? "#4ECDC4"
            : "#96CEB4",
        borderColor:
          variable === "deliveries"
            ? "#45B7D1"
            : variable === "tips"
            ? "#F7D794"
            : variable === "expenses"
            ? "#4ECDC4"
            : "#96CEB4",
        tension: 0.1,
      },
    ],
  };

  const pieData = {
    labels: ["Fixed Salary", "Penalty Deduction", "Deliveries Income", "Tips"],
    datasets: [
      {
        data: [
          filters.fixed_salary ? adjustedFixedSalary : 0,
          filters.fixed_salary && summary && summary.days_off > 4
            ? (summary.days_off - 4) * penalty
            : 0,
          filters.deliveries && summary ? summary.total_deliveries * 45 : 0,
          filters.tips && summary ? summary.total_tips : 0,
        ],
        backgroundColor: ["#E31837", "#FF6B6B", "#45B7D1", "#F7D794"],
        borderColor: theme === 'day' ? ["#ffffff", "#ffffff", "#ffffff", "#ffffff"] : ["#2D3748", "#2D3748", "#2D3748", "#2D3748"],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { color: theme === 'day' ? '#4A5568' : '#E2E8F0' },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "LKR",
                minimumFractionDigits: 2,
              }).format(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return "Rs. " + value;
          },
          color: theme === 'day' ? '#4A5568' : '#E2E8F0',
        },
        grid: {
          color: theme === 'day' ? '#E2E8F0' : '#4A5568',
        },
      },
      x: {
        ticks: {
          color: theme === 'day' ? '#4A5568' : '#E2E8F0',
        },
        grid: {
          color: theme === 'day' ? '#E2E8F0' : '#4A5568',
        },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { color: theme === 'day' ? '#4A5568' : '#E2E8F0' },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: Rs. ${value.toFixed(2)}${
              total > 0 ? ` (${percentage}%)` : ""
            }`;
          },
        },
      },
    },
  };

  if (!isLoggedin || fetchError) {
    navigate("/login");
    return null;
  }

  return (
    <div className={`min-h-screen ${theme === 'day' ? 'bg-day' : 'bg-night text-night-text'} py-6 px-4 sm:px-6 lg:px-8 font-['Poppins',sans-serif]`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Message */}
        <div className="text-center bg-gradient-to-r from-[#E31837] to-[#006491] rounded-2xl shadow-lg p-6 mb-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            <span
              className={`inline-block transition-transform duration-300 hover:scale-105 hover:text-[#F7D794] ${
                animateWelcome ? "scale-105 text-[#F7D794]" : ""
              }`}
              onClick={handleWelcomeClick}
            >
              Welcome,{" "}
              <span
                className={`text-[#F7D794] hover:text-white ${
                  animateWelcome ? "text-white" : ""
                }`}
              >
                {userData?.name?.split(" ")[0]} !
              </span>
            </span>
          </h1>
          <p className="text-sm sm:text-base text-white opacity-90 mt-2">
            Here's a snapshot of your current month's performance.
          </p>
        </div>

        {/* Add Today's Details Button */}
        <div className="text-center space-y-2">
          <p className="text-base sm:text-lg font-bold text-[#45B7D1] tracking-tight relative">
            Add your today's details
          </p>
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-32 sm:w-36 px-4 py-2 text-sm font-semibold text-white bg-[#E31837] rounded-full hover:bg-[#C3152F] hover:scale-105 transition-all duration-300 shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loadingUser || !userData || !userData._id}
          >
            {showForm ? "Close Form" : "Add"}
          </button>
        </div>

        {/* Daily Details Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div
              className={`${theme === 'day' ? 'bg-day-card' : 'bg-night-card'} rounded-2xl shadow-xl p-4 sm:p-6 w-full max-w-md mx-auto my-auto hover:shadow-xl transition-shadow duration-300 border ${theme === 'day' ? 'border-day' : 'border-night'}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-[#45B7D1]">
                  Add Today's Details
                </h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-sm font-semibold text-[#E31837] hover:text-[#C3152F]"
                >
                  Close
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={`block ${theme === 'day' ? 'text-gray-700' : 'text-gray-200'} font-medium mb-1`}>
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className={`w-full border ${errors.date ? 'border-red-500' : theme === 'day' ? 'border-day' : 'border-night'} rounded-xl p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#45B7D1] focus:scale-[1.01] transition-all duration-300 text-sm sm:text-base ${theme === 'day' ? 'bg-day-input' : 'bg-night-input'}`}
                    disabled={submitting}
                  />
                  {errors.date && (
                    <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                  )}
                </div>

                <div>
                  <label className={`block ${theme === 'day' ? 'text-gray-700' : 'text-gray-200'} font-medium mb-1`}>
                    Work Status
                  </label>
                  <select
                    name="work_status"
                    value={formData.work_status}
                    onChange={handleChange}
                    className={`w-full border ${errors.work_status ? 'border-red-500' : theme === 'day' ? 'border-day' : 'border-night'} rounded-xl p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F7D794] focus:scale-[1.01] transition-all duration-300 text-sm sm:text-base ${theme === 'day' ? 'bg-day-input' : 'bg-night-input'}`}
                    disabled={submitting}
                  >
                    <option value="On">On</option>
                    <option value="Off">Off</option>
                  </select>
                  {errors.work_status && (
                    <p className="text-red-500 text-sm mt-1">{errors.work_status}</p>
                  )}
                </div>

                {formData.work_status === "On" && (
                  <>
                    <div>
                      <label className={`block ${theme === 'day' ? 'text-gray-700' : 'text-gray-200'} font-medium mb-1`}>
                        Deliveries
                      </label>
                      <input
                        type="number"
                        name="deliveries"
                        value={formData.deliveries}
                        onChange={handleChange}
                        className={`w-full border ${errors.deliveries ? 'border-red-500' : theme === 'day' ? 'border-day' : 'border-night'} rounded-xl p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E31837] focus:scale-[1.01] transition-all duration-300 text-sm sm:text-base ${theme === 'day' ? 'bg-day-input' : 'bg-night-input'}`}
                        min="0"
                        disabled={submitting}
                      />
                      {errors.deliveries && (
                        <p className="text-red-500 text-sm mt-1">{errors.deliveries}</p>
                      )}
                    </div>

                    <div>
                      <label className={`block ${theme === 'day' ? 'text-gray-700' : 'text-gray-200'} font-medium mb-1`}>
                        Tips (Rs)
                      </label>
                      <input
                        type="number"
                        name="tips"
                        value={formData.tips}
                        onChange={handleChange}
                        className={`w-full border ${errors.tips ? 'border-red-500' : theme === 'day' ? 'border-day' : 'border-night'} rounded-xl p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#45B7D1] focus:scale-[1.01] transition-all duration-300 text-sm sm:text-base ${theme === 'day' ? 'bg-day-input' : 'bg-night-input'}`}
                        min="0"
                        step="0.01"
                        disabled={submitting}
                      />
                      {errors.tips && (
                        <p className="text-red-500 text-sm mt-1">{errors.tips}</p>
                      )}
                    </div>

                    <div>
                      <label className={`block ${theme === 'day' ? 'text-gray-700' : 'text-gray-200'} font-medium mb-1`}>
                        Expenses (Rs)
                      </label>
                      <input
                        type="number"
                        name="expenses"
                        value={formData.expenses}
                        onChange={handleChange}
                        className={`w-full border ${errors.expenses ? 'border-red-500' : theme === 'day' ? 'border-day' : 'border-night'} rounded-xl p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F7D794] focus:scale-[1.01] transition-all duration-300 text-sm sm:text-base ${theme === 'day' ? 'bg-day-input' : 'bg-night-input'}`}
                        min="0"
                        step="0.01"
                        disabled={submitting}
                      />
                      {errors.expenses && (
                        <p className="text-red-500 text-sm mt-1">{errors.expenses}</p>
                      )}
                    </div>

                    <div>
                      <label className={`block ${theme === 'day' ? 'text-gray-700' : 'text-gray-200'} font-medium mb-1`}>
                        Day Quality
                      </label>
                      <select
                        name="day_quality"
                        value={formData.day_quality}
                        onChange={handleChange}
                        className={`w-full border ${errors.day_quality ? 'border-red-500' : theme === 'day' ? 'border-day' : 'border-night'} rounded-xl p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#E31837] focus:scale-[1.01] transition-all duration-300 text-sm sm:text-base ${theme === 'day' ? 'bg-day-input' : 'bg-night-input'}`}
                        disabled={submitting}
                      >
                        <option value="Excellent">Excellent</option>
                        <option value="VeryGood">Very Good</option>
                        <option value="Good">Good</option>
                        <option value="Average">Average</option>
                        <option value="Bad">Bad</option>
                        <option value="VeryBad">Very Bad</option>
                      </select>
                      {errors.day_quality && (
                        <p className="text-red-500 text-sm mt-1">{errors.day_quality}</p>
                      )}
                    </div>
                  </>
                )}

                <div className="flex justify-end gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="w-32 sm:w-36 px-4 py-2 text-sm font-semibold text-white bg-[#1A1A1A] rounded-full hover:bg-[#333333] hover:scale-105 transition-all duration-300 shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-32 sm:w-36 px-4 py-2 text-sm font-semibold text-white bg-[#E31837] rounded-full hover:bg-[#C3152F] hover:scale-105 transition-all duration-300 shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className={`${theme === 'day' ? 'bg-day-card' : 'bg-night-card'} rounded-2xl shadow-xl p-4 sm:p-6 hover:shadow-xl transition-shadow duration-300 border ${theme === 'day' ? 'border-day' : 'border-night'}`}>
          <h3 className="text-lg sm:text-xl font-semibold text-[#45B7D1] mb-4 text-center relative">
            Filters
            <span className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-16 h-1 bg-[#45B7D1] rounded-full"></span>
          </h3>
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <div className="flex flex-row flex-nowrap justify-center gap-2 sm:gap-4 w-full max-w-md">
              {["fixed_salary", "deliveries", "tips"].map((filter) => (
                <label
                  key={filter}
                  className="relative inline-flex items-center cursor-pointer flex-1 hover:scale-105 transition-transform duration-300"
                >
                  <input
                    type="checkbox"
                    checked={filters[filter]}
                    onChange={() => handleFilterChange(filter)}
                    className="sr-only peer"
                  />
                  <div
                    className={`w-10 sm:w-12 h-5 sm:h-6 rounded-full transition-all duration-300 peer-focus:ring-2 peer-focus:ring-[#45B7D1] ${
                      filters[filter] ? "bg-[#E31837]" : theme === 'day' ? "bg-gray-300" : "bg-gray-600"
                    }`}
                  >
                    <div
                      className={`w-4 sm:w-5 h-4 sm:h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                        filters[filter]
                          ? "translate-x-5 sm:translate-x-6"
                          : "translate-x-0.5 sm:translate-x-1"
                      } mt-0.5`}
                    ></div>
                  </div>
                  <span className={`ml-2 text-xs sm:text-sm font-medium capitalize ${theme === 'day' ? 'text-gray-700' : 'text-gray-200'}`}>
                    {filter.replace("_", " ")}
                  </span>
                </label>
              ))}
            </div>
            <button
              onClick={resetFilters}
              className="w-32 sm:w-36 px-4 py-2 text-sm font-semibold text-white bg-[#006491] rounded-full hover:bg-[#004D73] hover:scale-105 transition-all duration-300 shadow-md cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
          {/* Monthly Summary */}
          <div className={`${theme === 'day' ? 'bg-day-card' : 'bg-night-card'} rounded-2xl shadow-xl p-4 sm:p-6 w-full lg:w-1/3 hover:shadow-xl transition-shadow duration-300 border ${theme === 'day' ? 'border-day' : 'border-night'}`}>
            <h3 className="text-lg sm:text-xl font-semibold text-[#45B7D1] mb-4 text-center relative">
              Monthly Summary
              <span className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-16 h-1 bg-[#45B7D1] rounded-full"></span>
            </h3>
            {loading ? (
              <div className="flex justify-center">
                <div className="w-8 h-8 border-4 border-[#E31837] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : summary ? (
              <div className="grid grid-cols-1 gap-3 text-sm sm:text-base">
                <div>
                  <p className={`${theme === 'day' ? 'text-gray-600' : 'text-gray-200'}`}>Total Earnings:</p>
                  <p className="text-lg font-semibold text-[#E31837]">
                    Rs. {summary.total_earnings?.toFixed(2) || "0.00"}
                  </p>
                </div>
                <div>
                  <p className={`${theme === 'day' ? 'text-gray-600' : 'text-gray-200'}`}>Total Expenses:</p>
                  <p className="text-lg font-semibold text-[#4ECDC4]">
                    Rs. {summary.total_expenses?.toFixed(2) || "0.00"}
                  </p>
                </div>
                <div>
                  <p className={`${theme === 'day' ? 'text-gray-600' : 'text-gray-200'}`}>Savings:</p>
                  <p className="text-lg font-semibold text-[#96CEB4]">
                    Rs. {summary.savings?.toFixed(2) || "0.00"}
                  </p>
                </div>
                <div>
                  <p className={`${theme === 'day' ? 'text-gray-600' : 'text-gray-200'}`}>Total Tips:</p>
                  <p className="text-lg font-semibold text-[#F7D794]">
                    Rs. {summary.total_tips?.toFixed(2) || "0.00"}
                  </p>
                </div>
                <div>
                  <p className={`${theme === 'day' ? 'text-gray-600' : 'text-gray-200'}`}>Total Deliveries:</p>
                  <p className="text-lg font-semibold text-[#45B7D1]">
                    {summary.total_deliveries || 0}
                  </p>
                </div>
                <div>
                  <p className={`${theme === 'day' ? 'text-gray-600' : 'text-gray-200'}`}>Days Off:</p>
                  <p className="text-lg font-semibold text-[#E31837]">
                    {summary.days_off || 0}
                  </p>
                </div>
                {summary.days_off > 4 && (
                  <div>
                    <p className={`${theme === 'day' ? 'text-gray-600' : 'text-gray-200'}`}>Penalty Deduction:</p>
                    <p className="text-lg font-semibold text-[#FF6B6B]">
                      Rs. {((summary.days_off - 4) * penalty).toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className={`text-center ${theme === 'day' ? 'text-gray-600' : 'text-gray-200'}`}>
                No data available for this cycle.
              </p>
            )}
          </div>

          {/* Financial Overview */}
          <div className={`${theme === 'day' ? 'bg-day-card' : 'bg-night-card'} rounded-2xl shadow-xl p-4 sm:p-6 w-full lg:w-2/3 hover:shadow-xl transition-shadow duration-300 border ${theme === 'day' ? 'border-day' : 'border-night'}`}>
            <h3 className="text-lg sm:text-xl font-semibold text-[#45B7D1] mb-4 text-center relative">
              Financial Overview
              <span className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-16 h-1 bg-[#45B7D1] rounded-full"></span>
            </h3>
            <div className="mb-4 flex flex-col sm:flex-row gap-2 justify-center">
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                className={`border ${theme === 'day' ? 'border-day' : 'border-night'} rounded-xl px-3 py-2 text-sm ${theme === 'day' ? 'text-gray-600' : 'text-gray-200'} shadow-sm focus:outline-none focus:ring-2 focus:ring-[#45B7D1] focus:scale-[1.01] hover:bg-opacity-80 transition-all duration-300 w-full sm:w-auto cursor-pointer ${theme === 'day' ? 'bg-day-input' : 'bg-night-input'}`}
              >
                <option value="earnings">Earnings vs. Dates</option>
                <option value="variable">Variable vs. Dates</option>
                <option value="pie">Income Breakdown</option>
              </select>
              {chartType === "variable" && (
                <select
                  value={variable}
                  onChange={(e) => setVariable(e.target.value)}
                  className={`border ${theme === 'day' ? 'border-day' : 'border-night'} rounded-xl px-3 py-2 text-sm ${theme === 'day' ? 'text-gray-600' : 'text-gray-200'} shadow-sm focus:outline-none focus:ring-2 focus:ring-[#45B7D1] focus:scale-[1.01] hover:bg-opacity-80 transition-all duration-300 w-full sm:w-auto cursor-pointer ${theme === 'day' ? 'bg-day-input' : 'bg-night-input'}`}
                >
                  <option value="deliveries">Deliveries</option>
                  <option value="tips">Tips</option>
                  <option value="expenses">Expenses</option>
                </select>
              )}
            </div>
            {loading ? (
              <div className="flex justify-center h-64 sm:h-80">
                <div className="w-8 h-8 border-4 border-[#E31837] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : chartType === "earnings" ? (
              <div className="h-64 sm:h-80">
                <Line data={earningsData} options={chartOptions} />
              </div>
            ) : chartType === "variable" ? (
              <div className="h-64 sm:h-80">
                <Line data={variableData} options={chartOptions} />
              </div>
            ) : (
              <div className="h-64 sm:h-80 max-w-sm mx-auto">
                <Pie data={pieData} options={pieOptions} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;