import React, { useContext } from "react";
import Navbar from "../components/Navbar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Dashboard from "./Dashboard";
import { AppContent } from "../context/AppContext";

const Home = () => {
  const { isLoggedin } = useContext(AppContent);

  return (
    <div>
      {isLoggedin ? <Dashboard /> : <Header />}
    </div>
  );
};

export default Home;