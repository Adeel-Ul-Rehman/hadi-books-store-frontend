import React, { createContext, useState, useEffect, useContext } from 'react';
import { AppContext } from './AppContext';
import { toast } from 'react-toastify';

export const ShopContext = createContext();

const TAX_RATE = 0.02;
const SHIPPING_FEE = 99;

const ShopContextProvider = ({ children }) => {
  const { user, apiRequest, setUser } = useContext(AppContext);
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [currency] = useState('Rs.');
  const [loading, setLoading] = useState(false);

  // Initialize from localStorage for non-auth users, or fetch for auth users
  useEffect(() => {
    if (!user) {
      const localWishlist = JSON.parse(localStorage.getItem('localWishlist') || '[]');
      const localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
      setWishlistItems(localWishlist.map(id => ({ productId: id })));
      setCartItems(localCart);
    } else {
      // Fetch cart and wishlist only if user is authenticated
      fetchWishlist();
      fetchCart();
    }
  }, [user]);

  const fetchProducts = async (category = '', search = '', bestseller = false) => {
    console.log("Shayan is testiing in frontend at fetchProducts in ShopContext")
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (search) params.append('search', search);
      if (bestseller) params.append('bestseller', 'true');
      params.append('page', '1');
      params.append('limit', '120');

      const data = await apiRequest('get', `/api/products/get?${params.toString()}`);
      if (data.success) {
        const productsWithSubCategories = data.products.map(product => ({
          ...product,
          subCategories: product.subCategories || [],
        }));
        setProducts(productsWithSubCategories || []);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Fetch Products Error:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    if (!user) return; // Don't fetch if no user
    
    setLoading(true);
    try {
      const data = await apiRequest('get', `/api/cart/get/${user.id}`);
      if (data.success) {
        setCartItems(data.cart?.items || []);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error('Fetch Cart Error:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    if (!user) return; // Don't fetch if no user
    
    setLoading(true);
    try {
      const data = await apiRequest('get', `/api/wishlist/get/${user.id}`);
      if (data.success) {
        setWishlistItems(data.wishlist?.items || []);
      } else {
        setWishlistItems([]);
      }
    } catch (error) {
      console.error('Fetch Wishlist Error:', error);
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, format = null, quantity = 1) => {
    let prevCartItems = [...cartItems];
    try {
      const product = products.find(p => p.id === productId);
      if (!product) {
        toast.error('Product not found');
        return false;
      }

      if (!user) {
        // Local storage for guest users
        const localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
        const existingItemIndex = localCart.findIndex(item => 
          item.productId === productId && item.format === format
        );

        if (existingItemIndex > -1) {
          localCart[existingItemIndex].quantity += quantity;
        } else {
          localCart.push({ 
            productId, 
            format, 
            quantity, 
            name: product.name, 
            price: product.price, 
            originalPrice: product.originalPrice,
            image: product.image,
            category: product.category,
          });
        }
        localStorage.setItem('localCart', JSON.stringify(localCart));
        setCartItems([...localCart]);
        return true;
      }

      // For logged-in users - call API
      const data = await apiRequest('post', '/api/cart/add', { productId, quantity });
      if (data.success) {
        await fetchCart(); // Refresh cart from server
        return true;
      }
      return false;
    } catch (error) {
      console.error('Add to Cart Error:', error);
      setCartItems(prevCartItems);
      return false;
    }
  };

  const removeFromCart = async (productId, format = null) => {
    let prevCartItems = [...cartItems];
    try {
      if (!user) {
        const localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
        const updatedCart = localCart.filter(item => 
          !(item.productId === productId && item.format === format)
        );
        localStorage.setItem('localCart', JSON.stringify(updatedCart));
        setCartItems([...updatedCart]);
        return true;
      }

      const data = await apiRequest('delete', '/api/cart/remove', { productId });
      if (data.success) {
        await fetchCart();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Remove from Cart Error:', error);
      setCartItems(prevCartItems);
      return false;
    }
  };

  const updateCart = async (productId, format = null, quantity) => {
    let prevCartItems = [...cartItems];
    try {
      if (!user) {
        const localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
        const updatedCart = localCart.map(item =>
          item.productId === productId && item.format === format ? { ...item, quantity } : item
        );
        localStorage.setItem('localCart', JSON.stringify(updatedCart));
        setCartItems([...updatedCart]);
        return true;
      }

      const data = await apiRequest('put', '/api/cart/update', { productId, quantity });
      if (data.success) {
        await fetchCart();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Update Cart Error:', error);
      setCartItems(prevCartItems);
      return false;
    }
  };

  const toggleWishlistItem = async (productId) => {
    let prevWishlistItems = [...wishlistItems];
    try {
      const product = products.find(p => p.id === productId);
      if (!product) {
        toast.error('Product not found');
        return false;
      }

      if (!user) {
        const localWishlist = JSON.parse(localStorage.getItem('localWishlist') || '[]');
        if (localWishlist.includes(productId)) {
          const updatedWishlist = localWishlist.filter(id => id !== productId);
          localStorage.setItem('localWishlist', JSON.stringify(updatedWishlist));
          setWishlistItems(updatedWishlist.map(id => ({ productId: id })));
          return true;
        } else {
          if (localWishlist.length >= 10) {
            toast.error('Wishlist is full');
            return false;
          }
          localWishlist.push(productId);
          localStorage.setItem('localWishlist', JSON.stringify(localWishlist));
          setWishlistItems(localWishlist.map(id => ({ productId: id })));
          return true;
        }
      }

      const isInWishlist = wishlistItems.some(item => item.productId === productId);
      
      if (isInWishlist) {
        const data = await apiRequest('delete', '/api/wishlist/remove', { productId });
        if (data.success) {
          await fetchWishlist();
          return true;
        }
        return false;
      } else {
        const data = await apiRequest('post', '/api/wishlist/add', { productId });
        if (data.success) {
          await fetchWishlist();
          return true;
        }
        return false;
      }
    } catch (error) {
      setWishlistItems(prevWishlistItems);
      console.error('Toggle Wishlist Error:', error);
      return false;
    }
  };

  const removeFromWishlist = async (productId) => {
    let prevWishlistItems = [...wishlistItems];
    try {
      if (!user) {
        const localWishlist = JSON.parse(localStorage.getItem('localWishlist') || '[]');
        const updatedWishlist = localWishlist.filter(id => id !== productId);
        localStorage.setItem('localWishlist', JSON.stringify(updatedWishlist));
        setWishlistItems(updatedWishlist.map(id => ({ productId: id })));
        return true;
      }

      const data = await apiRequest('delete', '/api/wishlist/remove', { productId });
      if (data.success) {
        await fetchWishlist();
        return true;
      }
      return false;
    } catch (error) {
      setWishlistItems(prevWishlistItems);
      console.error('Remove from Wishlist Error:', error);
      return false;
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.productId === productId);
  };

  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
  };

  const getWishlistCount = () => {
    return wishlistItems.length;
  };

  const getCartTotal = () => {
    const subtotal = cartItems.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      const price = product ? product.price : item.price || 0;
      return total + price * item.quantity;
    }, 0);
    const taxes = subtotal * TAX_RATE;
    const total = subtotal + taxes + SHIPPING_FEE;
    return total.toFixed(2);
  };

  const getProductReviews = async (productId, page = 1, limit = 10) => {
    try {
      const data = await apiRequest('get', `/api/reviews/product/${productId}?page=${page}&limit=${limit}`);
      if (data.success) {
        return {
          reviews: data.reviews || [],
          pagination: data.pagination || { page: 1, limit: 10, total: 0, pages: 0 },
          averageRating: data.averageRating || 0,
        };
      } else {
        return { reviews: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 }, averageRating: 0 };
      }
    } catch (error) {
      console.error('Fetch Reviews Error:', error);
      return { reviews: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 }, averageRating: 0 };
    }
  };

  const uploadPaymentProof = async (orderId, file) => {
    setLoading(true);
    if (!orderId || !file) {
      setLoading(false);
      return { success: false, message: 'Order ID and proof file are required' };
    }

    const formData = new FormData();
    formData.append('orderId', orderId);
    formData.append('proof', file);

    try {
      const data = await apiRequest('post', '/api/checkout/upload-proof', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    } catch (error) {
      console.error('Upload Payment Proof Error:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to upload payment proof' };
    } finally {
      setLoading(false);
    }
  };

  const calculateCheckout = async (items) => {
    try {
      const data = await apiRequest('post', '/api/checkout/calculate', { 
        items,
        taxes: items.reduce((sum, item) => {
          const product = products.find(p => p.id === item.productId);
          return sum + (product ? product.price * item.quantity : 0);
        }, 0) * TAX_RATE,
        shippingFee: SHIPPING_FEE,
      });
      return data;
    } catch (error) {
      console.error('Calculate Checkout Error:', error);
      return { success: false, message: 'Failed to calculate checkout totals' };
    }
  };

  const processCheckout = async (checkoutData) => {
    try {
      const { paymentMethod, onlinePaymentOption, ...rest } = checkoutData;
      const data = await apiRequest('post', '/api/checkout/process', {
        ...rest,
        paymentMethod,
        onlinePaymentOption: paymentMethod === 'online' ? onlinePaymentOption : undefined,
        taxes: rest.items.reduce((sum, item) => {
          const product = products.find(p => p.id === item.productId);
          return sum + (product ? product.price * item.quantity : 0);
        }, 0) * TAX_RATE,
        shippingFee: SHIPPING_FEE,
      });
      return data;
    } catch (error) {
      console.error('Process Checkout Error:', error);
      return { success: false, message: 'Failed to process checkout' };
    }
  };

  const fetchHeroImages = async () => {
    try {
      const data = await apiRequest('get', '/api/hero/');
      if (data.success) {
        return data.data || [];
      }
      return [];
    } catch (error) {
      console.error('Fetch Hero Images Error:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [user]);

  return (
    <ShopContext.Provider
      value={{
        products,
        cartItems,
        wishlistItems,
        currency,
        addToCart,
        removeFromCart,
        updateCart,
        toggleWishlistItem,
        removeFromWishlist,
        isInWishlist,
        getCartCount,
        getWishlistCount,
        getProductReviews,
        getCartTotal,
        fetchProducts,
        fetchCart,
        fetchWishlist,
        loading,
        processCheckout,
        uploadPaymentProof,
        calculateCheckout,
        TAX_RATE,
        SHIPPING_FEE,
        fetchHeroImages,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
