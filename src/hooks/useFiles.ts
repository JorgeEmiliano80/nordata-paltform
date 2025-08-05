
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fileService, FileRecord } from '@/services/fileService';
import { toast } from 'sonner';

export const useFiles = () => {
  const queryClient = useQueryClient();

  const {
    data: files = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['files'],
    queryFn: fileService.getFiles,
  });

  const uploadMutation = useMutation({
    mutationFn: fileService.uploadFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast.success('Archivo subido exitosamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al subir archivo');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: fileService.deleteFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast.success('Archivo eliminado exitosamente');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar archivo');
    },
  });

  const processMutation = useMutation({
    mutationFn: fileService.processFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      toast.success('Archivo enviado para procesamiento');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al procesar archivo');
    },
  });

  return {
    files,
    isLoading,
    error,
    uploadFile: uploadMutation.mutate,
    deleteFile: deleteMutation.mutate,
    processFile: processMutation.mutate,
    isUploading: uploadMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isProcessing: processMutation.isPending,
    refetch,
  };
};
