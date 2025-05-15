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
  <div className="upload-card">
    <div className="date-of-upload">{formatDate(upload.indexingTxSubmittedAt || "")}</div>
    <div className="upload-name">{upload.name}</div>
    <p className="upload-description">{upload.description}</p>
    <div className="thumbnail-container">
      {upload.objectType === "text/plain" && upload.objectData ? (
        <pre className="upload-plaintext" style={{ whiteSpace: "pre-wrap", wordBreak: "break-all", background: "#f6f6f6", padding: 12, borderRadius: 4, maxHeight: 300, overflow: "auto" }}>{atob(upload.objectData)}</pre>
      ) : upload.fileType && upload.fileType.toLowerCase().includes("pdf") && upload.objectData ? (
        <iframe src={`data:application/pdf;base64,${upload.objectData}`} title={upload.name} className="upload-thumbnail" style={{ width: "100%", height: "300px", border: "none" }} />
      ) : getImageSrc(upload) ? (
        <img src={getImageSrc(upload)} alt={upload.name} className="upload-thumbnail" />
      ) : (
        <div className="placeholder-thumbnail"><span className="image-icon">🖼️</span></div>
      )}
    </div>
    {upload.fileType && upload.fileType.toLowerCase().includes("text") && (
      <button className="copy-text" onClick={() => onCopyText(upload.description || "")}>Copy text</button>
    )}
    {upload.indexingTxId && <ExplorerLink txId={upload.indexingTxId} />}
    {upload.shardTxIds && upload.shardTxIds.length > 0 && upload.shardTxIds.map((txId, index) => (
      <ExplorerLink txId={txId} key={index} />
    ))}
  </div>
);

export default UploadCard;
