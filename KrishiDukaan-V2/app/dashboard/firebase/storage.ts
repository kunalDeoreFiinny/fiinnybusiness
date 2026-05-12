import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  UploadTask,
} from 'firebase/storage';
import { storage } from './config';

export interface UploadProgress {
  progress: number;
  url: string | null;
  error: string | null;
}

/** Upload a file to Firebase Storage and return its download URL. */
export async function uploadFile(
  path: string,
  file: File,
  onProgress?: (pct: number) => void,
): Promise<string> {
  if (!storage) throw new Error('Firebase Storage not initialized');

  const storageRef = ref(storage, path);
  const task: UploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    task.on(
      'state_changed',
      (snap) => {
        const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
        onProgress?.(pct);
      },
      (err) => reject(err),
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve(url);
      },
    );
  });
}

/** Generate a unique storage path for a retailer file. */
export function retailerFilePath(retailerId: string, folder: string, fileName: string): string {
  const ext = fileName.split('.').pop() ?? 'jpg';
  const ts = Date.now();
  return `retailers/${retailerId}/${folder}/${ts}.${ext}`;
}
