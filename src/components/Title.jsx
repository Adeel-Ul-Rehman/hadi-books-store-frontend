import React from "react";
import { motion } from "framer-motion";

const Title = ({ text1, text2 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex items-center justify-center gap-3 mb-6 flex-nowrap"
    >
      {/* Main Title */}
      <h2 className="text-[#00308F] font-['Poppins',sans-serif] text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight whitespace-nowrap text-center">
        {text1}{" "}
        <span className="bg-gradient-to-r from-red-500 via-red-500 to-orange-500 bg-clip-text text-transparent font-light">
          {text2}
        </span>
      </h2>

      {/* Right-side Line */}
      <span className="w-8 sm:w-12 h-[1px] sm:h-[2px] bg-gradient-to-r from-red-400 to-orange-500 rounded-full"></span>
    </motion.div>
  );
};

export default Title;
