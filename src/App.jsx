import React, { useContext } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AppContent } from "./context/AppContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import EmailVerify from "./pages/EmailVerify";
import ResetPassword from "./pages/ResetPassword";
import ManageAccount from "./pages/ManageAccount";
import History from "./pages/History";
import DailyRecords from "./pages/DailyRecords";
import Dashboard from "./pages/Dashboard";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./components/Navbar";
import Complain from "./pages/Complain";
import About from "./pages/About";
import Footer from "./components/Footer";

const ProtectedRoute = ({ children }) => {
  const { isLoggedin, loadingUser } = useContext(AppContent);
  const location = useLocation();

  if (loadingUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!isLoggedin) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const App = () => {
  const { theme } = useContext(AppContent);

  return (
    <div className={`flex flex-col min-h-screen ${theme === 'day' ? 'bg-day' : 'bg-night text-night-text'}`}>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        theme={theme === 'day' ? 'light' : 'dark'}
      />
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/email-verify" element={<EmailVerify />} />
          <Route path="/about" element={<About />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          <Route path="/manage-account" element={
            <ProtectedRoute>
              <ManageAccount />
            </ProtectedRoute>
          } />
          <Route path="/complain" element={
            <ProtectedRoute>
              <Complain />
            </ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          } />
          <Route path="/daily-records" element={
            <ProtectedRoute>
              <DailyRecords />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;