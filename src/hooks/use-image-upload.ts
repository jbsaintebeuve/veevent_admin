import { useState, useEffect, useCallback } from 'react';
import { uploadImage } from '@/utils/upload-image';

export interface ImageUploadState {
  file: File | null;
  previewUrl: string | null;
  currentUrl: string;
}

export interface ImageUploadActions {
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemove: () => void;
  uploadIfNeeded: () => Promise<string | null>;
  reset: (currentUrl?: string) => void;
}

export interface UseImageUploadReturn extends ImageUploadState, ImageUploadActions {}

export function useImageUpload(initialUrl: string = ''): UseImageUploadReturn {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState(initialUrl);

  // Cleanup preview URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newFile = e.target.files?.[0] || null;
    
    // Cleanup previous preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    
    if (newFile) {
      setFile(newFile);
      const url = URL.createObjectURL(newFile);
      setPreviewUrl(url);
    } else {
      setFile(null);
      setPreviewUrl(null);
    }
  }, [previewUrl]);

  const handleRemove = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(null);
    setPreviewUrl(null);
  }, [previewUrl]);

  const uploadIfNeeded = useCallback(async (): Promise<string | null> => {
    if (file) {
      return await uploadImage(file);
    }
    return currentUrl || null;
  }, [file, currentUrl]);

  const reset = useCallback((newCurrentUrl: string = '') => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFile(null);
    setPreviewUrl(null);
    setCurrentUrl(newCurrentUrl);
  }, [previewUrl]);

  // Update currentUrl when initialUrl changes
  useEffect(() => {
    if (initialUrl !== currentUrl && !file) {
      setCurrentUrl(initialUrl);
    }
  }, [initialUrl, currentUrl, file]);

  return {
    file,
    previewUrl,
    currentUrl,
    handleFileChange,
    handleRemove,
    uploadIfNeeded,
    reset,
  };
}

// Hook for multiple images (banner + main image)
export interface UseMultipleImagesReturn {
  banner: UseImageUploadReturn;
  image: UseImageUploadReturn;
  uploadAll: () => Promise<{ bannerUrl: string | null; imageUrl: string | null }>;
  resetAll: (bannerUrl?: string, imageUrl?: string) => void;
}

export function useMultipleImages(
  initialBannerUrl: string = '',
  initialImageUrl: string = ''
): UseMultipleImagesReturn {
  const banner = useImageUpload(initialBannerUrl);
  const image = useImageUpload(initialImageUrl);

  const uploadAll = useCallback(async () => {
    const [bannerUrl, imageUrl] = await Promise.all([
      banner.uploadIfNeeded(),
      image.uploadIfNeeded(),
    ]);
    return { bannerUrl, imageUrl };
  }, [banner, image]);

  const resetAll = useCallback((bannerUrl = '', imageUrl = '') => {
    banner.reset(bannerUrl);
    image.reset(imageUrl);
  }, [banner, image]);

  return {
    banner,
    image,
    uploadAll,
    resetAll,
  };
}