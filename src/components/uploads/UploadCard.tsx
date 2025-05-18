import React from "react";
import { Upload } from "./useUploads";
import { ExplorerLink } from "../ui/FinishScreen";

interface UploadCardProps {
  upload: Upload;
  onCopyText: (text: string) => void;
}

const getImageSrc = (upload: Upload): string | undefined => {
  if (upload.thumbnailUrl) return upload.thumbnailUrl;
  if (upload.objectData && upload.objectType && upload.objectType.startsWith("image/")) {
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

const UploadCard: React.FC<UploadCardProps> = ({ upload, onCopyText }) => (
  <div className="bg-gradient-to-b from-[rgba(30,30,60,0.7)] to-[rgba(20,20,40,0.7)] rounded-lg p-4 flex flex-col h-full border border-[rgba(255,255,255,0.1)] transition-all duration-200 hover:transform hover:-translate-y-1.5 hover:shadow-lg">
    <div className="text-xs text-[var(--color-text-secondary)] mb-1.5">{formatDate(upload.indexingTxSubmittedAt || "")}</div>
    <div className="text-lg font-bold mb-2.5 text-[var(--color-primary-tw)]">{upload.name}</div>
    <p className="text-sm text-[var(--color-light)] mb-4 flex-grow overflow-hidden text-ellipsis line-clamp-3">{upload.description}</p>
    <div className="w-full h-[150px] bg-[var(--color-bg-card)] rounded-md flex items-center justify-center mb-4 overflow-hidden">
      {upload.objectType === "text/plain" && upload.objectData ? (
        <pre className="whitespace-pre-wrap break-all bg-[#f6f6f6] p-3 rounded-md max-h-[300px] overflow-auto w-full h-full">{atob(upload.objectData)}</pre>
      ) : upload.fileType && upload.fileType.toLowerCase().includes("pdf") && upload.objectData ? (
        <iframe src={`data:application/pdf;base64,${upload.objectData}`} title={upload.name} className="w-full h-full object-cover" />
      ) : getImageSrc(upload) ? (
        <img src={getImageSrc(upload)} alt={upload.name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-[var(--color-bg-card)]"><span className="text-3xl text-[var(--color-text-secondary)]">🖼️</span></div>
      )}
    </div>
    {upload.fileType && upload.fileType.toLowerCase().includes("text") && (
      <button className="bg-transparent border border-[rgba(255,255,255,0.2)] text-[var(--color-primary-tw)] py-2 px-3 rounded-md cursor-pointer transition-colors duration-200 hover:bg-[rgba(255,255,255,0.1)] text-sm" onClick={() => onCopyText(upload.description || "")}>Copy text</button>
    )}
    {upload.indexingTxId && <ExplorerLink txId={upload.indexingTxId} />}
    {upload.shardTxIds && upload.shardTxIds.length > 0 && upload.shardTxIds.map((txId, index) => (
      <ExplorerLink txId={txId} key={index} />
    ))}
  </div>
);

export default UploadCard;
