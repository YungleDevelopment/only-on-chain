"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTxStatus } from "../../context/TxStatusContext";

interface DelegateViewProps {
  text: string;
  setText: (text: string) => void;
  isProcessing: boolean;
}

export function DelegateView({
  text,
  setText,
  isProcessing,
}: DelegateViewProps): React.ReactElement {
  const { preparation } = useTxStatus();
  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter your text here..."
        className="w-full h-48 p-4 bg-white/5 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#447BF4]"
        disabled={preparation.currentStep != "prepare/construct"}
      />
    </motion.div>
  );
}
