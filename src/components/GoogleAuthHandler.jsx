import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const GoogleAuthHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleGoogleAuth = async () => {
      console.log('🔄 Handling Google OAuth callback...');
      
      // Check if we have the success parameters
      const urlParams = new URLSearchParams(window.location.search);
      const loginSuccess = urlParams.get('login');
      const source = urlParams.get('source');
      
      if (loginSuccess === 'success' && source === 'google') {
        try {
          // Wait a moment for cookies to be set
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Check authentication status
          const response = await fetch('/api/auth/is-auth', {
            credentials: 'include'
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.user) {
              console.log('✅ Google OAuth successful, user:', data.user.name);
              toast.success(`Welcome, ${data.user.name}!`);
              
              // Clear the URL parameters
              window.history.replaceState({}, document.title, '/account');
              
              // You might want to update your global state here
              if (window.updateUserState) {
                window.updateUserState(data.user);
              }
            } else {
              console.log('❌ Auth check failed after Google OAuth');
              toast.error('Authentication failed. Please try again.');
              navigate('/login');
            }
          } else {
            console.log('❌ Auth check request failed');
            toast.error('Authentication check failed.');
            navigate('/login');
          }
        } catch (error) {
          console.error('Error during Google auth handling:', error);
          toast.error('An error occurred during authentication.');
          navigate('/login');
        }
      }
    };

    handleGoogleAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing Google authentication...</p>
      </div>
    </div>
  );
};

export default GoogleAuthHandler;