import { useState } from 'react';

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

interface UseImageUploadReturn {
  isLoading: boolean;
  error: string | null;
  progress: UploadProgress | null;
  uploadImage: (file: File) => Promise<{ url: string; key: string }>;
}

/**
 * Hook مخصص لتحميل الصور إلى S3
 * يوفر تتبع التقدم والأخطاء
 */
export function useImageUpload(): UseImageUploadReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<UploadProgress | null>(null);

  const uploadImage = async (file: File): Promise<{ url: string; key: string }> => {
    setIsLoading(true);
    setError(null);
    setProgress(null);

    try {
      // التحقق من نوع الملف
      if (!file.type.startsWith('image/')) {
        throw new Error('الملف يجب أن يكون صورة');
      }

      // التحقق من حجم الملف (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('حجم الملف يجب أن يكون أقل من 10MB');
      }

      // إنشاء FormData
      const formData = new FormData();
      formData.append('file', file);

      // تحميل الملف
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('فشل تحميل الصورة');
      }

      const data = await response.json();
      
      setProgress({ loaded: file.size, total: file.size, percentage: 100 });
      setIsLoading(false);

      return { url: data.url, key: data.key };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطأ غير معروف';
      setError(errorMessage);
      setIsLoading(false);
      throw err;
    }
  };

  return { isLoading, error, progress, uploadImage };
}
