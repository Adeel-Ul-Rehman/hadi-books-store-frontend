import { Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Home from './pages/Home.jsx';
import Orders from './pages/Orders.jsx';
import Cart from './pages/Cart.jsx';
import Collections from './pages/Collections.jsx';
import Navbar from './components/Navbar.jsx';
import About from './pages/About.jsx';
import PlaceOrder from './pages/PlaceOrder.jsx';
import Contact from './pages/Contact.jsx';
import Footer from './components/Footer.jsx';
import Product from './pages/Product.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Account from './pages/Account.jsx';
import Wishlist from './pages/Wishlist.jsx';
import Delivery from './pages/Delivery.jsx';
import AppContextProvider from './context/AppContext.jsx';
import ShopContextProvider from './context/ShopContext.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import PrivacyPolicy from './pages/PrivacyPolicy.jsx';
import { useContext, useEffect, useState } from 'react';
import { ShopContext } from './context/ShopContext';
import { AppContext } from './context/AppContext';

const App = () => {
  const { fetchHeroImages } = useContext(ShopContext) || {};
  const { isAuthenticated } = useContext(AppContext) || {};
  const location = useLocation();
  const [isContextReady, setIsContextReady] = useState(false);

  // Mark context as ready after providers mount
  useEffect(() => {
    setIsContextReady(true);
  }, []);

  // Fetch hero images when context is ready
  useEffect(() => {
    if (isContextReady && fetchHeroImages) {
      console.log('ShopContext initialized, fetching hero images...');
      fetchHeroImages();
    } else if (!isContextReady) {
      console.warn('ShopContext not yet available, waiting for initialization...');
    }
  }, [isContextReady, fetchHeroImages]);

  // Check authentication on mount and location change
  useEffect(() => {
    if (isContextReady && isAuthenticated) {
      isAuthenticated().catch(err => {
        console.error('Initial auth check failed:', err);
      });
    }
  }, [isContextReady, isAuthenticated, location.pathname]);

  return (
    <AppContextProvider>
      <ShopContextProvider>
        <div className="flex flex-col min-h-screen bg-gradient-to-r from-sky-50 via-orange-50 to-red-50 dark:from-gray-800 dark:via-gray-900 dark:to-black">
          <Navbar />
          <ScrollToTop />
          <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/collections" element={<Collections />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/product/:productId" element={<Product />} />
              <Route path="/place-order" element={<PlaceOrder />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/account" element={<Account />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/delivery" element={<Delivery />} />
              <Route path="/wishlist" element={<Wishlist />} />
            </Routes>
          </main>
          <Footer />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
            limit={1}
          />
        </div>
      </ShopContextProvider>
    </AppContextProvider>
  );
};

export default App;