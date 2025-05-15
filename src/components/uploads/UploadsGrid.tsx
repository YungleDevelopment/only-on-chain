import React from "react";
import { Upload } from "./useUploads";
import UploadCard from "./UploadCard";


interface UploadsGridProps {
  uploads: Upload[];
  onCopyText: (text: string) => void;
}

const UploadsGrid: React.FC<UploadsGridProps> = ({ uploads, onCopyText }) => (
  <div className="uploads-grid">
    {uploads.map((upload) => (
      <UploadCard key={upload.id} upload={upload} onCopyText={onCopyText} />
    ))}
  </div>
);

export default UploadsGrid;
