import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
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

const History = () => {
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
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchDataError, setFetchDataError] = useState(null);
  const [filters, setFilters] = useState({
    deliveries: true,
    tips: true,
  });
  const [chartType, setChartType] = useState("earnings");
  const [variable, setVariable] = useState("deliveries");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const initializePage = async () => {
      try {
        const hasActiveSession = sessionStorage.getItem("isActiveSession");
        if (!hasActiveSession) {
          navigate("/login");
          return;
        }
        if (!isLoggedin || !userData || !userData._id) {
          const success = await getUserData();
          if (!success) {
            navigate("/login");
            return;
          }
        }
      } catch (error) {
        console.error("Initialization error:", error);
        navigate("/login");
      }
    };
    initializePage();
  }, [isLoggedin, userData, getUserData, navigate]);

  useEffect(() => {
    if (!loadingUser && (!isLoggedin || fetchError)) {
      toast.error(fetchError || "Please login to access the history page");
      setTimeout(() => navigate("/login"), 2000);
    }
  }, [isLoggedin, fetchError, loadingUser, navigate]);

  const validateDates = () => {
    const newErrors = {};
    if (!startDate) newErrors.startDate = "Start date is required";
    if (!endDate) newErrors.endDate = "End date is required";
    if (startDate && endDate && userData?.account_created_at) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const today = new Date();
      today.setUTCHours(23, 59, 59, 999);
      const accountCreated = new Date(userData.account_created_at);
      accountCreated.setUTCHours(0, 0, 0, 0);

      if (isNaN(start.getTime())) newErrors.startDate = "Invalid start date";
      if (isNaN(end.getTime())) newErrors.endDate = "Invalid end date";
      if (start < accountCreated)
        newErrors.startDate = "Start date cannot be before account creation";
      if (start > today)
        newErrors.startDate = "Start date cannot be in the future";
      if (end < accountCreated)
        newErrors.endDate = "End date cannot be before account creation";
      if (end > today) newErrors.endDate = "End date cannot be in the future";
      if (start > end) newErrors.endDate = "End date must be after start date";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fetchHistoryData = async (retryCount = 0) => {
    const maxRetries = 3;
    if (!userData || !userData._id || !validateDates()) return;
    setLoading(true);
    setFetchDataError(null);
    try {
      const include = Object.keys(filters)
        .filter((key) => filters[key])
        .join(",");
      const fromDate = new Date(startDate);
      fromDate.setUTCHours(0, 0, 0, 0);
      const toDate = new Date(endDate);
      toDate.setUTCHours(23, 59, 59, 999);

      const response = await axios.get(
        `${backendUrl}/api/daily/history?user_id=${
          userData._id
        }&from_date=${fromDate.toISOString()}&to_date=${toDate.toISOString()}&include=${include}`,
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data.success) {
        setSummary(response.data.summary);
        setRecords(response.data.dailyRecords || []);
      } else {
        throw new Error(response.data.message || "Failed to fetch data");
      }
    } catch (error) {
      console.error("fetchHistoryData failed:", error);
      if (error.response?.status === 401 && retryCount < maxRetries) {
        console.log(
          `Retrying fetchHistoryData (attempt ${retryCount + 1}/${maxRetries})`
        );
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * (retryCount + 1))
        );
        return fetchHistoryData(retryCount + 1);
      }
      const message =
        error.response?.status === 401
          ? "Session expired - Please login again"
          : error.response?.data?.message || "Failed to fetch history data";
      setFetchDataError(message);
      toast.error(message);
      if (error.response?.status === 401) {
        setIsLoggedin(false);
        setTimeout(() => navigate("/login"), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name) => {
    setFilters((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const resetFilters = () => {
    setFilters({ deliveries: true, tips: true });
  };

  const getWorkingDaysData = () => {
    if (!startDate || !endDate) return [];
    return records
      .filter(record => record.work_status === "On")
      .map(record => ({
        ...record,
        date: new Date(record.date),
        dateStr: new Date(record.date).toISOString().split('T')[0]
      }))
      .sort((a, b) => a.date - b.date);
  };

  const workingDaysData = getWorkingDaysData();

  const earningsData = {
    labels: startDate && endDate && workingDaysData.length > 0
      ? workingDaysData.map(item => 
          item.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        )
      : startDate && endDate 
      ? ["No working days"]
      : ["Select date range"],
    datasets: [
      {
        label: "Earnings (Rs)",
        data: startDate && endDate && workingDaysData.length > 0
          ? workingDaysData.map(item => item.deliveries * 45 + item.tips)
          : [0],
        fill: false,
        backgroundColor: "#E31837",
        borderColor: "#E31837",
        tension: 0.1
      },
    ],
  };

  const variableData = {
    labels: startDate && endDate && workingDaysData.length > 0
      ? workingDaysData.map(item => 
          item.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
        )
      : startDate && endDate 
      ? ["No working days"]
      : ["Select date range"],
    datasets: [
      {
        label: variable.charAt(0).toUpperCase() + variable.slice(1),
        data: startDate && endDate && workingDaysData.length > 0
          ? workingDaysData.map(item => item[variable])
          : [0],
        fill: false,
        backgroundColor:
          variable === "deliveries"
            ? "#45B7D1"
            : variable === "tips"
            ? "#F7D794"
            : "#4ECDC4",
        borderColor:
          variable === "deliveries"
            ? "#45B7D1"
            : variable === "tips"
            ? "#F7D794"
            : "#4ECDC4",
        tension: 0.1
      },
    ],
  };

  const pieData = {
    labels: startDate && endDate 
      ? ["Deliveries Income", "Tips"] 
      : ["Select date range"],
    datasets: [
      {
        data: startDate && endDate && workingDaysData.length > 0
          ? [
              filters.deliveries 
                ? workingDaysData.reduce((sum, item) => sum + (item.deliveries * 45), 0)
                : 0,
              filters.tips 
                ? workingDaysData.reduce((sum, item) => sum + item.tips, 0)
                : 0,
            ]
          : [0, 0],
        backgroundColor: ["#45B7D1", "#F7D794"],
        borderColor:
          theme === "day" ? ["#ffffff", "#ffffff"] : ["#2D3748", "#2D3748"],
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
        labels: { color: theme === "day" ? "#4A5568" : "#E2E8F0" },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) label += ": ";
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
          color: theme === "day" ? "#4A5568" : "#E2E8F0",
        },
        grid: {
          color: theme === "day" ? "#E2E8F0" : "#4A5568",
        },
      },
      x: {
        ticks: {
          color: theme === "day" ? "#4A5568" : "#E2E8F0",
        },
        grid: {
          color: theme === "day" ? "#E2E8F0" : "#4A5568",
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
        labels: { color: theme === "day" ? "#4A5568" : "#E2E8F0" },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage =
              total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: Rs. ${value.toFixed(2)}${
              total > 0 ? ` (${percentage}%)` : ""
            }`;
          },
        },
      },
    },
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    if (name === "startDate") setStartDate(value);
    else setEndDate(value);
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className={`min-h-screen ${theme === "day" ? "bg-day" : "bg-night text-night-text"} py-6 px-4 sm:px-6 lg:px-8 font-["Poppins",sans-serif]`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#E31837] to-[#006491] rounded-2xl shadow-lg p-6 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            History
          </h1>
          <p className="text-sm sm:text-base text-white opacity-90 mt-2">
            Select a date range to view your performance summary and charts.
          </p>
        </div>

        {/* Date Selection */}
        <div className={`${theme === "day" ? "bg-day-card" : "bg-night-card"} rounded-2xl shadow-xl p-4 sm:p-6 hover:shadow-xl transition-shadow duration-300 border ${theme === "day" ? "border-day" : "border-night"}`}>
          <h3 className="text-lg sm:text-xl font-semibold text-[#45B7D1] mb-4 text-center relative">
            Select Date Range
            <span className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-16 h-1 bg-[#45B7D1] rounded-full"></span>
          </h3>
          <div className="flex flex-row flex-wrap gap-4 justify-center items-center">
            <div className="w-full sm:w-auto">
              <label className={`block text-sm font-medium ${theme === "day" ? "text-gray-700" : "text-gray-200"} mb-1`}>
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={startDate}
                onChange={handleDateChange}
                max={today}
                className={`w-full p-3 border ${errors.startDate ? "border-red-500" : theme === "day" ? "border-day" : "border-night"} rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#45B7D1] focus:scale-[1.01] transition-all duration-300 text-sm sm:text-base cursor-pointer ${theme === "day" ? "bg-day-input" : "bg-night-input"}`}
              />
              {errors.startDate && (
                <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>
              )}
            </div>
            <div className="w-full sm:w-auto">
              <label className={`block text-sm font-medium ${theme === "day" ? "text-gray-700" : "text-gray-200"} mb-1`}>
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={endDate}
                onChange={handleDateChange}
                max={today}
                className={`w-full p-3 border ${errors.endDate ? "border-red-500" : theme === "day" ? "border-day" : "border-night"} rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#45B7D1] focus:scale-[1.01] transition-all duration-300 text-sm sm:text-base cursor-pointer ${theme === "day" ? "bg-day-input" : "bg-night-input"}`}
              />
              {errors.endDate && (
                <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>
              )}
            </div>
            <button
              onClick={fetchHistoryData}
              disabled={loading || !startDate || !endDate || errors.startDate || errors.endDate}
              className="w-32 sm:w-36 px-4 py-2 text-sm font-semibold text-white bg-[#E31837] rounded-full hover:bg-[#C3152F] hover:scale-105 transition-all duration-300 shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-4 sm:mt-7"
            >
              {loading ? "Loading..." : "Apply"}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className={`${theme === "day" ? "bg-day-card" : "bg-night-card"} rounded-2xl shadow-xl p-4 sm:p-6 hover:shadow-xl transition-shadow duration-300 border ${theme === "day" ? "border-day" : "border-night"}`}>
          <h3 className="text-lg sm:text-xl font-semibold text-[#45B71] mb-4 text-center relative">
            Filters
            <span className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-16 h-1 bg-[#45B7D1] rounded-full"></span>
          </h3>
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <div className="flex flex-row justify-center gap-3 sm:gap-4 w-full max-w-md">
              {["deliveries", "tips"].map((filter) => (
                <label key={filter} className="relative inline-flex items-center cursor-pointer flex-1 hover:scale-105 transition-transform duration-300">
                  <input
                    type="checkbox"
                    checked={filters[filter]}
                    onChange={() => handleFilterChange(filter)}
                    className="sr-only peer"
                  />
                  <div className={`w-9 sm:w-12 h-4 sm:h-6 rounded-full transition-all duration-300 peer-focus:ring-2 peer-focus:ring-[#45B7D1] ${filters[filter] ? "bg-[#E31837]" : theme === "day" ? "bg-gray-300" : "bg-gray-600"}`}>
                    <div className={`w-3 sm:w-5 h-3 sm:h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${filters[filter] ? "translate-x-5 sm:translate-x-6" : "translate-x-0.5 sm:translate-x-1"} mt-0.5`}></div>
                  </div>
                  <span className={`ml-2 text-sm font-medium capitalize ${theme === "day" ? "text-gray-700" : "text-gray-200"}`}>
                    {filter}
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
          {/* Summary */}
          <div className={`${theme === "day" ? "bg-day-card" : "bg-night-card"} rounded-2xl shadow-xl p-4 sm:p-6 w-full lg:w-1/3 hover:shadow-xl transition-shadow duration-300 border ${theme === "day" ? "border-day" : "border-night"} flex flex-col justify-between`}>
            <h3 className="text-lg sm:text-xl font-semibold text-[#45B7D1] mb-4 text-center relative">
              Performance Summary
              <span className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-16 h-1 bg-[#45B7D1] rounded-full"></span>
            </h3>
            {loading ? (
              <div className="flex justify-center items-center flex-grow">
                <div className="w-8 h-8 border-4 border-[#E31837] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : fetchDataError ? (
              <div className="flex flex-col items-center justify-center flex-grow">
                <p className="text-red-500 text-sm mb-2">{fetchDataError}</p>
                <button
                  onClick={() => fetchHistoryData()}
                  className="px-4 py-2 text-sm font-semibold text-white bg-[#E31837] rounded-full hover:bg-[#C3152F] transition-all"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 text-sm sm:text-base flex-grow">
                <div className="flex justify-between">
                  <span className={`${theme === "day" ? "text-gray-600" : "text-gray-200"}`}>
                    Total Earnings:
                  </span>
                  <span className="font-semibold text-[#E31837]">
                    {summary ? `Rs. ${summary.total_earnings?.toFixed(2)}` : "--"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`${theme === "day" ? "text-gray-600" : "text-gray-200"}`}>
                    Total Expenses:
                  </span>
                  <span className="font-semibold text-[#4ECDC4]">
                    {summary ? `Rs. ${summary.total_expenses?.toFixed(2)}` : "--"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`${theme === "day" ? "text-gray-600" : "text-gray-200"}`}>
                    Savings:
                  </span>
                  <span className="font-semibold text-[#96CEB4]">
                    {summary ? `Rs. ${summary.savings?.toFixed(2)}` : "--"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`${theme === "day" ? "text-gray-600" : "text-gray-200"}`}>
                    Total Tips:
                  </span>
                  <span className="font-semibold text-[#F7D794]">
                    {summary ? `Rs. ${summary.total_tips?.toFixed(2)}` : "--"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`${theme === "day" ? "text-gray-600" : "text-gray-200"}`}>
                    Total Deliveries:
                  </span>
                  <span className="font-semibold text-[#45B7D1]">
                    {summary ? summary.total_deliveries : "--"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`${theme === "day" ? "text-gray-600" : "text-gray-200"}`}>
                    Days Off:
                  </span>
                  <span className="font-semibold text-[#E31837]">
                    {summary ? summary.days_off : "--"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Financial Overview */}
          <div className={`${theme === "day" ? "bg-day-card" : "bg-night-card"} rounded-2xl shadow-xl p-4 sm:p-6 w-full lg:w-2/3 hover:shadow-xl transition-shadow duration-300 border ${theme === "day" ? "border-day" : "border-night"}`}>
            <h3 className="text-lg sm:text-xl font-semibold text-[#45B7D1] mb-4 text-center relative">
              Financial Overview
              <span className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-16 h-1 bg-[#45B7D1] rounded-full"></span>
            </h3>
            <div className="mb-4 flex flex-row flex-wrap gap-3 justify-center">
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                className={`w-full sm:w-auto p-3 border ${theme === "day" ? "border-day" : "border-night"} rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#45B7D1] focus:scale-[1.01] transition-all duration-300 text-sm sm:text-base cursor-pointer ${theme === "day" ? "bg-day-input" : "bg-night-input"}`}
              >
                <option value="earnings">Earnings vs. Dates</option>
                <option value="variable">Variable vs. Dates</option>
                <option value="pie">Income Breakdown</option>
              </select>
              {chartType === "variable" && (
                <select
                  value={variable}
                  onChange={(e) => setVariable(e.target.value)}
                  className={`w-full sm:w-auto p-3 border ${theme === "day" ? "border-day" : "border-night"} rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#45B7D1] focus:scale-[1.01] transition-all duration-300 text-sm sm:text-base cursor-pointer ${theme === "day" ? "bg-day-input" : "bg-night-input"}`}
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
            ) : fetchDataError ? (
              <div className="flex flex-col items-center justify-center h-64 sm:h-80">
                <p className="text-red-500 text-sm mb-2">{fetchDataError}</p>
                <button
                  onClick={() => fetchHistoryData()}
                  className="px-4 py-2 text-sm font-semibold text-white bg-[#E31837] rounded-full hover:bg-[#C3152F] transition-all"
                >
                  Retry
                </button>
              </div>
            ) : (
              chartType === "earnings" ? (
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
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;