
import { useState, useEffect } from 'react';
import { useUpload } from './useUpload';
import { useStorage } from './useStorage';
import { useFileProcessing } from './useFileProcessing';
import type { FileRecord } from './useUpload';

export { type FileRecord } from './useUpload';

export const useFiles = () => {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const { uploading, uploadFile } = useUpload();
  const { loading, deleteFile, getFileInsights, fetchFiles } = useStorage();
  const { processing, processFile } = useFileProcessing();

  const refetchFiles = async () => {
    const filesList = await fetchFiles();
    setFiles(filesList);
  };

  useEffect(() => {
    refetchFiles();
  }, []);

  const handleUploadFile = async (file: File) => {
    const result = await uploadFile(file);
    if (result.success) {
      await refetchFiles();
    }
    return result;
  };

  const handleDeleteFile = async (fileId: string) => {
    const result = await deleteFile(fileId);
    if (result.success) {
      await refetchFiles();
    }
    return result;
  };

  const handleProcessFile = async (fileId: string) => {
    const result = await processFile(fileId);
    if (result.success) {
      await refetchFiles();
    }
    return result;
  };

  return {
    files,
    loading: loading || uploading || processing,
    uploading,
    uploadFile: handleUploadFile,
    processFile: handleProcessFile,
    deleteFile: handleDeleteFile,
    getFileInsights,
    refetchFiles
  };
};
