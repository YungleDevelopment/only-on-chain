import React, { createContext, useContext, useState, useCallback } from "react";

interface FileWithPreview extends File {
  preview?: string;
}

interface FileUploadContextType {
  file: FileWithPreview | null;
  error: string | null;
  addFile: (newFile: FileList | File[]) => void;
  removeFile: () => void;
  clearFile: () => void;
}

const FileUploadContext = createContext<FileUploadContextType | undefined>(undefined);

export function useFileUpload() {
  const context = useContext(FileUploadContext);
  if (context === undefined) {
    throw new Error("useFileUpload must be used within a FileUploadProvider");
  }
  return context;
}

interface FileUploadProviderProps {
  children: React.ReactNode;
  maxSize?: number;
}

export function FileUploadProvider({
  children,
  maxSize = 45 * 1024, // 45KB default
}: FileUploadProviderProps) {
  const [file, setFile] = useState<FileWithPreview | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback(
    (file: File): boolean => {
      const validTypes = ["image/jpeg", "image/png", "image/pdg", "video/mp4"];
      if (!validTypes.includes(file.type)) {
        setError("File type not supported");
        return false;
      }
      if (file.size > maxSize) {
        setError("File size exceeds 45KB limit");
        return false;
      }
      return true;
    },
    [maxSize]
  );

  const addFile = useCallback(
    (newFiles: FileList | File[]) => {
      setError(null);
      // Se toma solo el primer archivo
      const fileToAdd = Array.from(newFiles)[0];
      if (!validateFile(fileToAdd)) return;

      let fileWithPreview: FileWithPreview = fileToAdd;
      if (fileToAdd.type.startsWith("image/")) {
        fileWithPreview = Object.assign(fileToAdd, {
          preview: URL.createObjectURL(fileToAdd),
        });
      }
      // Si ya existe un archivo, se revoca su URL de preview
      if (file && file.preview) {
        URL.revokeObjectURL(file.preview);
      }
      setFile(fileWithPreview);
    },
    [validateFile, file]
  );

  const removeFile = useCallback(() => {
    if (file && file.preview) {
      URL.revokeObjectURL(file.preview);
    }
    setFile(null);
  }, [file]);

  const clearFile = useCallback(() => {
    if (file && file.preview) {
      URL.revokeObjectURL(file.preview);
    }
    setFile(null);
  }, [file]);

  return (
    <FileUploadContext.Provider
      value={{
        file,
        error,
        addFile,
        removeFile,
        clearFile,
      }}
    >
      {children}
    </FileUploadContext.Provider>
  );
}
