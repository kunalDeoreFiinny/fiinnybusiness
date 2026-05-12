import { useState, useCallback } from 'react';
import { uploadFile, retailerFilePath } from '../firebase/storage';

interface UploadState {
  uploading: boolean;
  progress: number;
  url: string | null;
  error: string | null;
}

/**
 * Hook for uploading files to Firebase Storage.
 * Returns { state, upload, reset }.
 */
export function useMediaUpload(retailerId: string, folder: string) {
  const [state, setState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    url: null,
    error: null,
  });

  const upload = useCallback(
    async (file: File): Promise<string | null> => {
      setState({ uploading: true, progress: 0, url: null, error: null });
      try {
        const path = retailerFilePath(retailerId, folder, file.name);
        const url = await uploadFile(path, file, (pct) => {
          setState((prev) => ({ ...prev, progress: pct }));
        });
        setState({ uploading: false, progress: 100, url, error: null });
        return url;
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Upload failed';
        setState({ uploading: false, progress: 0, url: null, error: msg });
        return null;
      }
    },
    [retailerId, folder],
  );

  const reset = useCallback(() => {
    setState({ uploading: false, progress: 0, url: null, error: null });
  }, []);

  return { state, upload, reset };
}
