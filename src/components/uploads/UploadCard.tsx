import React, { useState, useRef, useEffect } from "react";
import { Upload } from "./useUploads";
import { ExplorerLink } from "../ui/FinishScreen";
import GradientText from "./GradientText";

interface UploadCardProps {
  upload: Upload;
  onCopyText: (text: string) => void;
}

const getImageSrc = (upload: Upload): string | undefined => {
  if (upload.thumbnailUrl) return upload.thumbnailUrl;
  if (
    upload.objectData &&
    upload.objectType &&
    upload.objectType.startsWith("image/")
  ) {
    return `data:${upload.objectType};base64,${upload.objectData}`;
  }
  return undefined;
};

const formatDate = (dateString: string): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const UploadCard: React.FC<UploadCardProps> = ({ upload, onCopyText }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (dialogRef.current) {
      dialogRef.current.showModal();
    }
  };

  const closeModal = () => {
    if (dialogRef.current) {
      dialogRef.current.close();
    }
  };

  return (
    <>
      <article className="bg-[var(--color-card)] rounded-4xl p-4 flex flex-col h-full border border-[rgba(255,255,255,0.1)] transition-all duration-200 hover:transform hover:-translate-y-1.5 hover:shadow-lg overflow-hidden">
        <header className="mb-3 flex flex-col gap-2">
          <time className="text-xs text-[var(--color-light)]">
            {formatDate(upload.indexingTxSubmittedAt || "")}
          </time>
          <h2 className="text-3xl font-bold">
            <GradientText text={upload.name} />
          </h2>
        </header>

        <figure className="w-full h-[240px] rounded-3xl flex items-center justify-center mb-4 overflow-hidden">
          {upload.objectType === "text/plain" && upload.objectData ? (
            <pre className="whitespace-pre-wrap break-all p-3 max-h-[240px] overflow-auto h-full w-full text-[var(--color-light)]">
              {atob(upload.objectData)}
            </pre>
          ) : upload.fileType &&
            upload.fileType.toLowerCase().includes("pdf") &&
            upload.objectData ? (
            <div
              className="w-full h-full flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity relative"
              onClick={handleImageClick}
            >
              <iframe
                src={`data:application/pdf;base64,${upload.objectData}`}
                title={upload.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                <span className="text-white font-medium">
                  Click para ver PDF
                </span>
              </div>
            </div>
          ) : getImageSrc(upload) ? (
            <img
              src={getImageSrc(upload)}
              alt={upload.name}
              className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
              onClick={handleImageClick}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[var(--color-bg-card)]">
              <span className="text-3xl text-[var(--color-text-secondary)]">
                🖼️
              </span>
            </div>
          )}
        </figure>

        <footer>
          {/* Botón para copiar texto */}
          {upload.objectType === "text/plain" && upload.objectData && (
            <button
              className="bg-transparent text-white underline cursor-pointer transition-colors duration-200 hover:text-[var(--color-light)] text-sm"
              onClick={() => onCopyText(atob(upload.objectData || ""))}
            >
              Copy text
            </button>
          )}
          {upload.indexingTxId && (
            <div className="mt-2">
              <ExplorerLink txId={upload.indexingTxId} />
            </div>
          )}
          {upload.shardTxIds && upload.shardTxIds.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {upload.shardTxIds.map((txId, index) => (
                <ExplorerLink txId={txId} key={index} />
              ))}
            </div>
          )}
        </footer>
      </article>
      {/* Modal para visualizar imágenes y PDFs usando dialog */}
      <dialog
        ref={dialogRef}
        className="m-auto backdrop:bg-[rgba(0,0,0,0.8)] p-0 rounded-xl outline-none max-w-4xl w-full"
        onClick={(e) => {
          // Cerrar solo si se hace clic fuera del contenido principal
          if (e.target === dialogRef.current) {
            closeModal();
          }
        }}
      >
        <div className="bg-[rgba(0,0,0)] min-h-[400px] flex flex-col items-center justify-center gap-10">
          <button
            className="absolute top-0 right-0 z-10 cursor-pointer p-2 rounded-full text-white hover:text-[var(--color-light)]"
            onClick={closeModal}
            aria-label="Cerrar"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <h3 className="text-white text-3xl font-medium">{upload.name}</h3>

          {getImageSrc(upload) ? (
            <img
              src={getImageSrc(upload)}
              alt={upload.name}
              className="max-w-full max-h-[80vh] object-contain"
            />
          ) : upload.fileType &&
            upload.fileType.toLowerCase().includes("pdf") &&
            upload.objectData ? (
            <iframe
              src={`data:application/pdf;base64,${upload.objectData}`}
              title={upload.name}
              className="w-full h-[80vh]"
            />
          ) : null}
        </div>
      </dialog>
    </>
  );
};

export default UploadCard;
