import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
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
  const apiUrl = '/api'; // Use Vite proxy prefix for same-origin requests

  // Initialize from localStorage for non-auth users, or fetch for auth users
  useEffect(() => {
    if (!user) {
      const localWishlist = JSON.parse(localStorage.getItem('localWishlist') || '[]');
      const localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
      setWishlistItems(localWishlist.map(id => ({ productId: id })));
      setCartItems(localCart);
    } else {
      fetchWishlist();
      fetchCart();
    }
  }, [user]);

  const fetchProducts = async (category = '', search = '', bestseller = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (search) params.append('search', search);
      if (bestseller) params.append('bestseller', 'true');
      params.append('page', '1');
      params.append('limit', '100');

      const data = await apiRequest('get', `/products/get?${params.toString()}`);
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
    setLoading(true);
    try {
      if (!user) {
        const localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
        setCartItems(localCart);
        return;
      }

      const data = await apiRequest('get', `/cart/get/${user.id}`);
      if (data.success) {
        setCartItems(data.cart?.items || []);
      } else {
        // On error, keep local cart data if available (fallback for sync issues)
        const localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
        if (localCart.length > 0) {
          setCartItems(localCart);
          toast.warn('Using local cart data due to sync issue');
        } else {
          setCartItems([]);
        }
      }
    } catch (error) {
      console.error('Fetch Cart Error:', error);
      // On error, keep local cart data if available
      const localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
      if (localCart.length > 0) {
        setCartItems(localCart);
        toast.warn('Using local cart data due to sync issue');
      } else {
        setCartItems([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      if (!user) {
        const localWishlist = JSON.parse(localStorage.getItem('localWishlist') || '[]');
        setWishlistItems(localWishlist.map(id => ({ productId: id })));
        return;
      }

      const data = await apiRequest('get', `/wishlist/get/${user.id}`);
      if (data.success) {
        setWishlistItems(data.wishlist?.items || []);
      } else {
        // On error, keep local wishlist data if available
        const localWishlist = JSON.parse(localStorage.getItem('localWishlist') || '[]');
        if (localWishlist.length > 0) {
          setWishlistItems(localWishlist.map(id => ({ productId: id })));
          toast.warn('Using local wishlist data due to sync issue');
        } else {
          setWishlistItems([]);
        }
      }
    } catch (error) {
      console.error('Fetch Wishlist Error:', error);
      // On error, keep local wishlist data if available
      const localWishlist = JSON.parse(localStorage.getItem('localWishlist') || '[]');
      if (localWishlist.length > 0) {
        setWishlistItems(localWishlist.map(id => ({ productId: id })));
        toast.warn('Using local wishlist data due to sync issue');
      } else {
        setWishlistItems([]);
      }
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

      // Optimistic update for logged-in users
      const existingItem = cartItems.find(item => item.productId === productId);
      let newCartItems;
      if (existingItem) {
        newCartItems = cartItems.map(item =>
          item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        newCartItems = [...cartItems, { productId, quantity, price: product.price }];
      }
      setCartItems(newCartItems);

      const data = await apiRequest('post', '/cart/add', { productId, quantity });
      if (data.success) {
        await fetchCart();
        return true;
      } else {
        setCartItems(prevCartItems);
        toast.error(data.message || 'Failed to add to cart');
        return false;
      }
    } catch (error) {
      setCartItems(prevCartItems);
      console.error('Add to Cart Error:', error);
      toast.error('Failed to add to cart');
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

      const newCartItems = cartItems.filter(item => item.productId !== productId);
      setCartItems(newCartItems);

      const data = await apiRequest('post', '/cart/remove', { productId });
      if (data.success) {
        await fetchCart();
        return true;
      } else {
        setCartItems(prevCartItems);
        toast.error(data.message || 'Failed to remove from cart');
        return false;
      }
    } catch (error) {
      setCartItems(prevCartItems);
      console.error('Remove from Cart Error:', error);
      toast.error('Failed to remove from cart');
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

      const newCartItems = cartItems.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      );
      setCartItems(newCartItems);

      const data = await apiRequest('post', '/cart/update', { productId, quantity });
      if (data.success) {
        await fetchCart();
        return true;
      } else {
        setCartItems(prevCartItems);
        toast.error(data.message || 'Failed to update cart');
        return false;
      }
    } catch (error) {
      setCartItems(prevCartItems);
      console.error('Update Cart Error:', error);
      toast.error('Failed to update cart');
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
      let newWishlistItems;
      if (isInWishlist) {
        newWishlistItems = wishlistItems.filter(item => item.productId !== productId);
        setWishlistItems(newWishlistItems);
        const data = await apiRequest('post', '/wishlist/remove', { productId });
        if (data.success) {
          await fetchWishlist();
          return true;
        } else {
          setWishlistItems(prevWishlistItems);
          toast.error(data.message || 'Failed to remove from wishlist');
          return false;
        }
      } else {
        newWishlistItems = [...wishlistItems, { productId }];
        setWishlistItems(newWishlistItems);
        const data = await apiRequest('post', '/wishlist/add', { productId });
        if (data.success) {
          await fetchWishlist();
          return true;
        } else {
          setWishlistItems(prevWishlistItems);
          toast.error(data.message || 'Failed to add to wishlist');
          return false;
        }
      }
    } catch (error) {
      setWishlistItems(prevWishlistItems);
      console.error('Toggle Wishlist Error:', error);
      toast.error('Failed to toggle wishlist');
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

      const newWishlistItems = wishlistItems.filter(item => item.productId !== productId);
      setWishlistItems(newWishlistItems);

      const data = await apiRequest('post', '/wishlist/remove', { productId });
      if (data.success) {
        await fetchWishlist();
        return true;
      } else {
        setWishlistItems(prevWishlistItems);
        toast.error(data.message || 'Failed to remove from wishlist');
        return false;
      }
    } catch (error) {
      setWishlistItems(prevWishlistItems);
      console.error('Remove from Wishlist Error:', error);
      toast.error('Failed to remove from wishlist');
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
      const data = await apiRequest('get', `/reviews/product/${productId}?page=${page}&limit=${limit}`);
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

  const calculateCheckoutTotals = async (items) => {
    try {
      if (!user) {
        const localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
        let subtotal = 0;
        const validatedItems = localCart.map(item => {
          const product = products.find(p => p.id === item.productId);
          if (!product) return null;
          const itemTotal = product.price * item.quantity;
          subtotal += itemTotal;
          return {
            productId: item.productId,
            quantity: item.quantity,
            price: product.price,
            originalPrice: product.originalPrice,
            productName: product.name,
            productImage: product.image,
          };
        }).filter(item => item !== null);
        const taxes = subtotal * TAX_RATE;
        const shippingFee = SHIPPING_FEE;
        const total = subtotal + taxes + shippingFee;
        return { success: true, subtotal, taxes, shippingFee, total, items: validatedItems };
      }

      const data = await apiRequest('post', '/checkout/calculate', { 
        items,
        taxes: items.reduce((sum, item) => {
          const product = products.find(p => p.id === item.productId);
          return sum + (product ? product.price * item.quantity : 0);
        }, 0) * TAX_RATE,
        shippingFee: SHIPPING_FEE,
      });
      if (data.success) {
        return data;
      } else {
        return { success: false, message: data.message || 'Failed to calculate checkout totals' };
      }
    } catch (error) {
      console.error('Calculate Checkout Totals Error:', error);
      return { success: false, message: 'Failed to calculate checkout totals' };
    }
  };

  const processCheckout = async (checkoutData) => {
    try {
      if (!user) {
        return { success: false, message: 'User not authenticated' };
      }

      const { paymentMethod, onlinePaymentOption, ...rest } = checkoutData;
      const data = await apiRequest('post', '/checkout/process', {
        ...rest,
        paymentMethod,
        onlinePaymentOption: paymentMethod === 'online' ? onlinePaymentOption : undefined,
        taxes: rest.items.reduce((sum, item) => {
          const product = products.find(p => p.id === item.productId);
          return sum + (product ? product.price * item.quantity : 0);
        }, 0) * TAX_RATE,
        shippingFee: SHIPPING_FEE,
      });
      if (data.success) {
        if (data.updatedUser) {
          setUser(data.updatedUser);
          localStorage.setItem('user', JSON.stringify(data.updatedUser));
        }
        setCartItems([]);
        localStorage.removeItem('localCart');
        return data;
      } else {
        return { success: false, message: data.message || 'Failed to process checkout' };
      }
    } catch (error) {
      console.error('Process Checkout Error:', error);
      return { success: false, message: 'Failed to process checkout' };
    }
  };

  const fetchHeroImages = async () => {
    try {
      const data = await apiRequest('get', '/hero/');
      if (data.success) {
        return data.data || []; // Backend returns 'data' not 'images'
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
        calculateCheckoutTotals,
        processCheckout,
        apiUrl,
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