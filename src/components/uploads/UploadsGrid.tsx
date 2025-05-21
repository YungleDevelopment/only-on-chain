import React from "react";
import { Upload } from "./useUploads";
import UploadCard from "./UploadCard";

interface UploadsGridProps {
  uploads: Upload[];
  onCopyText: (text: string) => void;
}

const UploadsGrid: React.FC<UploadsGridProps> = ({ uploads, onCopyText }) => (
  <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
    {uploads.map((upload) => (
      <UploadCard key={upload.id} upload={upload} onCopyText={onCopyText} />
    ))}
  </section>
);

export default UploadsGrid;
