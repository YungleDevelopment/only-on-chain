import React, { useState, useRef } from "react";
import { Upload } from "./useUploads";
import { ExplorerLink } from "../ui/FinishScreen";
import GradientText from "./GradientText";

interface UploadListItemProps {
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

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "Uncompleted";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Uncompleted";
  return date.toLocaleDateString();
};

const UploadListItem: React.FC<UploadListItemProps> = ({
  upload,
  onCopyText,
}) => {
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
      <article className="bg-[var(--color-card)] rounded-xl p-4 flex flex-row items-center border border-[rgba(255,255,255,0.1)] transition-all duration-200 hover:transform hover:-translate-y-0.5 hover:shadow-lg mb-4 w-full overflow-hidden">
        {/* Lado izquierdo - Información del upload */}
        <div className="flex flex-col flex-grow pr-4">
          <header className="mb-2">
            <time className="text-xs text-[var(--color-light)]">
              {formatDate(upload.indexingTxSubmittedAt)}
            </time>
            <h2 className="text-xl font-bold mt-1">
              <GradientText text={upload.name} />
            </h2>
          </header>

          {upload.description && (
            <p className="text-sm text-white opacity-80 mb-3 line-clamp-2">
              {upload.description}
            </p>
          )}

          <footer className="flex flex-col items-start gap-2 mt-auto">
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
              <div className="mt-1">
                <ExplorerLink txId={upload.indexingTxId} />
              </div>
            )}
          </footer>
        </div>

        {/* Lado derecho - Vista previa del contenido */}
        <div className="w-32 h-24 md:w-40 md:h-32 bg-[rgba(0,0,0,0.2)] rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
          {upload.objectType === "text/plain" && upload.objectData ? (
            <pre className="whitespace-pre-wrap break-all p-2 max-h-full overflow-auto h-full w-full text-[var(--color-light)] text-xs">
              {atob(upload.objectData).substring(0, 100)}...
            </pre>
          ) : upload.fileType &&
            upload.fileType.toLowerCase().includes("pdf") &&
            upload.objectData ? (
            <div
              className="w-full h-full flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity relative"
              onClick={handleImageClick}
            >
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20">
                <span className="text-white text-sm font-medium">Ver PDF</span>
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
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-3xl text-[var(--color-text-secondary)]">
                🖼️
              </span>
            </div>
          )}
        </div>
      </article>

      {/* Modal para visualizar imágenes y PDFs */}
      <dialog
        ref={dialogRef}
        className="m-auto backdrop:bg-[rgba(0,0,0,0.8)] p-0 rounded-xl outline-none max-w-4xl w-full"
        onClick={(e) => {
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

export default UploadListItem;
