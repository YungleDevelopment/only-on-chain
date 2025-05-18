import React from "react";
import { Upload } from "./useUploads";
import { ExplorerLink } from "../ui/FinishScreen";

interface UploadListItemProps {
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

const UploadListItem: React.FC<UploadListItemProps> = ({ upload, onCopyText }) => (
  <div className="bg-gradient-to-r from-[rgba(30,30,60,0.7)] to-[rgba(20,20,40,0.7)] rounded-lg p-4 grid grid-cols-[1fr_2fr_100px] gap-4 border border-[rgba(255,255,255,0.1)] transition-all duration-200 hover:transform hover:-translate-y-0.5 hover:shadow-lg items-center md:grid-cols-1 md:grid-rows-[auto_auto_auto]">
    <div className="flex flex-col gap-1.5">
      <div className="text-xs text-[var(--color-text-secondary)]">{formatDate(upload.indexingTxSubmittedAt || "")}</div>
      <div className="text-lg font-bold text-[var(--color-primary-tw)]">{upload.name}</div>
    </div>
    <div className="flex flex-col gap-2.5">
      <p className="text-sm text-[var(--color-light)] overflow-hidden text-ellipsis line-clamp-2">{upload.description}</p>
      {upload.fileType && upload.fileType.toLowerCase().includes("text") && (
        <button className="bg-transparent border border-[rgba(255,255,255,0.2)] text-[var(--color-primary-tw)] py-2 px-3 rounded-md cursor-pointer transition-colors duration-200 hover:bg-[rgba(255,255,255,0.1)] text-sm" onClick={() => onCopyText(upload.description || "")}>Copy text</button>
      )}
    </div>
    <div className="w-[100px] h-[100px] bg-[var(--color-bg-card)] rounded-md flex items-center justify-center overflow-hidden md:w-full md:h-[150px] md:order-first">
      {upload.objectType === "text/plain" && upload.objectData ? (
        <pre className="whitespace-pre-wrap break-all bg-[#f6f6f6] p-3 rounded-md max-h-[300px] overflow-auto w-full h-full">{atob(upload.objectData)}</pre>
      ) : upload.fileType && upload.fileType.toLowerCase().includes("pdf") && upload.objectData ? (
        <iframe src={`data:application/pdf;base64,${upload.objectData}`} title={upload.name} className="w-full h-full object-cover" />
      ) : getImageSrc(upload) ? (
        <img src={getImageSrc(upload)} alt={upload.name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-[var(--color-bg-card)]"><span className="text-3xl text-[var(--color-text-secondary)]">🖼️</span></div>
      )}
      {upload.indexingTxId && <ExplorerLink txId={upload.indexingTxId} />}
      {upload.shardTxIds && upload.shardTxIds.length > 0 && upload.shardTxIds.map((txId, idx) => (
        <ExplorerLink txId={txId} key={idx} />
      ))}
    </div>
  </div>
);

export default UploadListItem;
