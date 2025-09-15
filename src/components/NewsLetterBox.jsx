import React, { useState } from "react";
import Title from "./Title";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

const NewsLetterBox = () => {
  const [email, setEmail] = useState("");

  const onSubmitHandler = (event) => {
    event.preventDefault();
    if (email.trim() && /\S+@\S+\.\S+/.test(email)) {
      toast.success("Thank you for subscribing to our newsletter!");
      setEmail("");
    } else {
      toast.error("Please enter a valid email address.");
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto text-center">
        <Title text1="SUBSCRIBE" text2="NEWSLETTER" />
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-2 text-sm sm:text-base text-gray-600 font-medium max-w-2xl mx-auto italic tracking-wide"
        >
          Stay updated with our latest books and exclusive offers.
        </motion.p>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-6 max-w-xl mx-auto"
      >
        <form
          onSubmit={onSubmitHandler}
          className="flex flex-col sm:flex-row items-center gap-3 border border-gray-100 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-all duration-300"
          role="form"
          aria-labelledby="newsletter-title"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="w-full flex-1 py-2 px-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#00308F] text-sm text-gray-800"
            aria-label="Email address"
            required
          />
          <div className="w-full sm:w-auto flex justify-center sm:block">
            <button
              type="submit"
              className="py-2 px-5 bg-gradient-to-r from-red-400 to-orange-500 text-white font-semibold rounded-full hover:from-red-500 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-[#00308F] text-sm transition-all duration-300"
              aria-label="Subscribe to newsletter"
            >
              Subscribe
            </button>
          </div>
        </form>
      </motion.div>
    </motion.section>
  );
};

export default NewsLetterBox;