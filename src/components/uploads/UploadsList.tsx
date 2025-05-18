import React from "react";
import { Upload } from "./useUploads";
import UploadListItem from "./UploadListItem";

interface UploadsListProps {
  uploads: Upload[];
  onCopyText: (text: string) => void;
}

const UploadsList: React.FC<UploadsListProps> = ({ uploads, onCopyText }) => (
  <div className="flex flex-col gap-4 mb-8">
    {uploads.map((upload, idx) => (
      <UploadListItem key={upload.id || idx} upload={upload} onCopyText={onCopyText} />
    ))}
  </div>
);

export default UploadsList;
