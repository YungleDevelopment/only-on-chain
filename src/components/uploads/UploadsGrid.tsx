import React from "react";
import { Upload } from "./useUploads";
import UploadCard from "./UploadCard";


interface UploadsGridProps {
  uploads: Upload[];
  onCopyText: (text: string) => void;
}

const UploadsGrid: React.FC<UploadsGridProps> = ({ uploads, onCopyText }) => (
  <div className="grid grid-cols-3 gap-5 mb-8 md:grid-cols-2 sm:grid-cols-1">
    {uploads.map((upload) => (
      <UploadCard key={upload.id} upload={upload} onCopyText={onCopyText} />
    ))}
  </div>
);

export default UploadsGrid;
