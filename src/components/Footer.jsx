import React from 'react';
import { NavLink } from 'react-router-dom';
import { assets } from '../assets/assets';

const Footer = () => {
  return (
    <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-gray-200">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Logo Section */}
        <div className="flex flex-col items-center sm:items-start">
          <img
            src="/logo.png"
            alt="HADI BOOKS STORE Logo"
            className="w-24 h-24 mb-4 cursor-pointer hover:scale-105 transition-transform duration-300"
          />
          <p className="text-sm text-gray-600 italic tracking-wide text-center sm:text-left">
            Your trusted bookstore for knowledge and stories.
          </p>
        </div>

        {/* Company Section */}
        <div className="flex flex-col items-center sm:items-start">
          <h3 className="text-base font-semibold text-gray-800 mb-3">COMPANY</h3>
          <ul className="space-y-2 text-center sm:text-left">
            {[{ path: '/', text: 'Home' }, { path: '/about', text: 'About us' }, { path: '/delivery', text: 'Delivery' }, { path: '/privacy-policy', text: 'Privacy Policy' }].map(
              ({ path, text }, index) => (
                <li key={index}>
                  <NavLink
                    to={path}
                    className={({ isActive }) =>
                      `text-sm text-gray-600 hover:text-red-500 transition-colors duration-300 ${
                        isActive ? 'text-red-500 font-medium' : ''
                      }`
                    }
                  >
                    {text}
                  </NavLink>
                </li>
              )
            )}
          </ul>
        </div>

        {/* Get in Touch Section */}
        <div className="flex flex-col items-center sm:items-start">
          <h3 className="text-base font-semibold text-gray-800 mb-3">Get in Touch</h3>
          <ul className="space-y-2 text-center sm:text-left w-full">
            <li className="text-sm text-gray-600">
              <span className="font-medium">Email:</span>{' '}
              <a
                href="mailto:support@hadibooks.com"
                className="hover:text-red-500 transition-colors duration-300"
              >
                hadibooksstore01@gmail.com.com
              </a>
            </li>
            <li className="text-sm text-gray-600">
              <span className="font-medium">Phone:</span>{' '}
              <a
                href="tel:+12345678900"
                className="hover:text-red-500 transition-colors duration-300"
              >
                0347 6452977
              </a>
            </li>
            <li className="text-sm text-gray-600 flex flex-wrap justify-center sm:justify-start items-center gap-2">
              <span className="font-medium">Address:</span>
              <span className="inline-block">Sarwar Market Main Urdu Bazaar, Lahore</span>
              <a
                href="https://maps.app.goo.gl/c9aXiLstVma81ytg8"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-red-500 transition-transform duration-300"
                aria-label="View store location on map"
              >
                <img
                  src={assets.location}
                  alt="Location"
                  className="w-5 h-5 hover:scale-110 transition-transform duration-300"
                />
              </a>
            </li>
          </ul>
        </div>

        {/* Follow Us Section */}
        <div className="flex flex-col items-center sm:items-start">
          <h3 className="text-base font-semibold text-gray-800 mb-3">Follow Us</h3>
          <ul className="flex gap-3">
            <li>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-110 transition-transform duration-300"
                aria-label="Follow us on Facebook"
              >
                <img src={assets.fb_icon} alt="Facebook" className="w-7 h-7" />
              </a>
            </li>
            <li>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-110 transition-transform duration-300"
                aria-label="Follow us on Instagram"
              >
                <img src={assets.insta_icon} alt="Instagram" className="w-7 h-7" />
              </a>
            </li>
            <li>
              <a
                href="https://whatsapp.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-110 transition-transform duration-300"
                aria-label="Follow us on WhatsApp"
              >
                <img src={assets.whatsapp_icon} alt="WhatsApp" className="w-7 h-7" />
              </a>
            </li>
            <li>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-110 transition-transform duration-300"
                aria-label="Follow us on X"
              >
                <img src={assets.x_icon} alt="X" className="w-7 h-7" />
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-6 border-t border-gray-200 pt-4 text-center">
        <p className="text-sm text-gray-600">
          &copy; {new Date().getFullYear()} HADI BOOKS STORE. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;