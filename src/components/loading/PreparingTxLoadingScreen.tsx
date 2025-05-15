import { motion } from "framer-motion";
import React from "react";

export function PreparingTxLoadingScreen(): React.ReactElement {
  return (
    <motion.div
      className="fixed inset-0 bg-white flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-12 h-12"
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 1,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44C35.0457 44 44 35.0457 44 24"
            stroke="#447BF4"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </motion.div>
    </motion.div>
  );
}
