"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useFileUpload } from "../../context/FileUploadContext"
import { useTxPreparation } from "../../context/TxPreparationContext"
import { CloseIcon } from "../../icons/CloseIcon"
import { Button } from "../ui/Button"
import { PdfIcon } from "../../icons/PdfIcon"
import { PngIcon } from "../../icons/PngIcon"
import { PdgIcon } from "../../icons/PdgIcon"
import { Mp4Icon } from "../../icons/Mp4Icon"
import { useTxStatus } from "../../context/TxStatusContext"

export function FileList(): React.ReactElement | null {
  const { file, removeFile } = useFileUpload()
  const { fileProgress, isProcessing, currentStep } = useTxPreparation()
  const {preparation} = useTxStatus()

  if (!file) return null

  // Como solo se admite un archivo, se usa el primer elemento de fileProgress (si existe)
  const progress = fileProgress[0]

  return (
    <motion.div
      className="flex flex-col gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <AnimatePresence>
        <motion.div
          key={file.name}
          className="flex flex-col gap-2 p-4 bg-white/5 rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {file.preview ? (
                <img
                  src={file.preview}
                  alt="Preview"
                  className="w-10 h-10 rounded object-cover"
                />
              ) : (
                <div className="w-10 h-10 flex items-center justify-center">
                  {file.type === "application/pdf" ? (
                    <PdfIcon className="w-full h-full text-white" />
                  ) : file.type === "image/png" ? (
                    <PngIcon className="w-full h-full text-white" />
                  ) : file.type === "image/pdg" ? (
                    <PdgIcon className="w-full h-full text-white" />
                  ) : file.type === "video/mp4" ? (
                    <Mp4Icon className="w-full h-full text-white" />
                  ) : (
                    <span className="text-xs text-white">
                      {file.type.split("/")[1].toUpperCase()}
                    </span>
                  )}
                </div>
              )}
              <div>
                <p className="font-medium !text-white">{file.name}</p>
                <p className="text-sm !text-white/80">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              variant="icon"
              onClick={removeFile}
              className="text-white hover:bg-white/10"
              disabled={preparation.currentStep != "prepare/construct"}
            >
              <CloseIcon className="w-6 h-6" />
            </Button>
          </div>

          {/* Barra de progreso visible durante la etapa "prepare/construct" */}
          {isProcessing && currentStep === "prepare/construct" && progress && (
            <div className="space-y-1">
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary-tw"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress.progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="text-xs text-white/60">
                {progress.status === "constructing"
                  ? "Constructing transaction..."
                  : progress.status === "unsigned"
                  ? "Retrieving unsigned transaction..."
                  : "Processing..."}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
