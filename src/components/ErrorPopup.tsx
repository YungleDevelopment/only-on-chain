import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ErrorPopupProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

export const ErrorPopup: React.FC<ErrorPopupProps> = ({
  message,
  isVisible,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3 }}
          className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg z-50"
        >
          <div className="flex items-center justify-between">
            <p className="mr-4">{message}</p>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 focus:outline-none"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
