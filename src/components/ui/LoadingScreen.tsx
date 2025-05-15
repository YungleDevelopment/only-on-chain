"use client";

import React from "react";
import { motion } from "framer-motion";

interface LoadingScreenProps {
  text?: string;
  className?: string;
}

export function LoadingScreen({
  text = "Loading...",
  className = "",
}: LoadingScreenProps): React.ReactElement {
  return (
    <motion.div
      className={`w-full h-full  z-50 flex flex-col items-center justify-center rounded-4xl !text-white ${className} py-8 `}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex flex-col items-center gap-6">
        <motion.div
          className="w-20 h-20"
          animate={{
            rotateY: 360,
          }}
          transition={{
            duration: 2.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear"//"easeInOut",
          }}
        >
          <img
            src="https://cdn.prod.website-files.com/66c3b779674915c288ca9998/66c63fa6307332e239106044_Logo%20(11).png"
            alt="Loading spinner"
            className="w-full h-full"
          />
        </motion.div>
        <motion.p
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="text-[1.25rem] font-medium !text-white"
        >
          {text}
        </motion.p>
        <motion.p
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className=" text-[0.875rem] !text-white"
        >
          ¿Have questions? See our{" "}
          <a className="underline !text-white" href="/faq">
            FAQs
          </a>
          .
        </motion.p>
      </div>
    </motion.div>
  );
}
