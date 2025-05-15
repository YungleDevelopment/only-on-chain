"use client";

import React, { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFileUpload } from "../../context/FileUploadContext";
import { UploadIcon } from "../../icons/UploadIcon";
import { useTxStatus } from "../../context/TxStatusContext";

export function UploadBox() {
  const { addFile, error } = useFileUpload();
  const [isDragging, setIsDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const { preparation } = useTxStatus();

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => prev + 1);
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragCounter((prev) => prev - 1);
      if (dragCounter === 0) {
        setIsDragging(false);
      }
    },
    [dragCounter]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      setDragCounter(0);

      const { files } = e.dataTransfer;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.size > 45 * 1024) {
          // 45KB in bytes
          alert("File too big");
          return;
        }
        addFile(files);
      }
    },
    [addFile]
  );

  return (
    <motion.div
      className={`relative border-2 border-dashed border-white rounded-3xl p-12 text-center transition-all ${
        isDragging ? "bg-white/20" : ""
      }`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <input
        type="file"
        id="file-upload"
        className={`absolute inset-0 w-full h-full opacity-0 ${
          preparation.currentStep == "prepare/construct"
            ? "cursor-pointer"
            : "cursor-not-allowed"
        } `}
        onChange={(e) => {
          if (e.target.files) {
            const file = e.target.files[0];
            if (file && file.size > 45 * 1024) {
              // 45KB in bytes

              return;
            }
            addFile(e.target.files);
          }
        }}
        accept=".jpg,.jpeg,.png,.pdg,.mp4"
        disabled={preparation.currentStep != "prepare/construct"}
      />

      <motion.div
        className="flex flex-col items-center gap-6"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <motion.div
          className="w-[2.875rem] h-[2.875rem] rounded-full flex items-center justify-center"
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.5 }}
        >
          <UploadIcon className="w-full h-full text-white" />
        </motion.div>

        <div className="flex flex-col gap-4">
          <AnimatePresence mode="wait">
            {isDragging ? (
              <motion.p
                key="dragging"
                className="text-2xl font-medium !text-white"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                Drop here your file
              </motion.p>
            ) : (
              <motion.p
                key="not-dragging"
                className="text-2xl !text-white font-medium"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                Choose a file or drag & drop it here
              </motion.p>
            )}
          </AnimatePresence>
          <p className="text-base text-light">
            JPEG, PNG, PDG, and MP4 formats, up to 45KB
          </p>
        </div>

        {error && (
          <motion.p
            className="text-red-500 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  );
}
