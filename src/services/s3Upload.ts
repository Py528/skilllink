// No AWS SDK needed in the browser for pre-signed URL upload

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadResult {
  url: string;
  key: string;
}

export const s3Service = {
  async uploadFile(file: File, folder: string, onProgress?: (progress: UploadProgress) => void): Promise<UploadResult> {
    // 1. Get pre-signed URL from your API
    const presignRes = await fetch('/api/s3-presign-upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
        folder,
      }),
    });
    if (!presignRes.ok) throw new Error('Failed to get pre-signed URL');
    const { url, key, publicUrl } = await presignRes.json();
    console.log('[s3Upload] publicUrl from presign API:', publicUrl);

    // 2. Upload to S3 using XHR for progress
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', url);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress({
            loaded: event.loaded,
            total: event.total,
            percentage: (event.loaded / event.total) * 100,
          });
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error('Upload failed with status ' + xhr.status));
        }
      };
      xhr.onerror = () => reject(new Error('XHR upload failed'));
      xhr.send(file);
    });

    return { url: publicUrl, key };
  },

  // Delete is not implemented for S3 in this client.
}; 