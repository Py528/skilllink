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

// Queue for managing uploads to prevent rate limiting
let uploadQueue: Array<() => Promise<any>> = [];
let isProcessingQueue = false;

const processQueue = async () => {
  if (isProcessingQueue || uploadQueue.length === 0) return;
  
  isProcessingQueue = true;
  
  while (uploadQueue.length > 0) {
    const uploadTask = uploadQueue.shift();
    if (uploadTask) {
      try {
        await uploadTask();
        // Add a delay between uploads to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('[s3Upload] Queue upload error:', error);
        // Continue with next upload even if one fails
      }
    }
  }
  
  isProcessingQueue = false;
};

export const s3Service = {
  async uploadFile(file: File, folder: string, onProgress?: (progress: UploadProgress) => void): Promise<UploadResult> {
    // Sanitize file name for S3
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    const uploadTask = async (): Promise<UploadResult> => {
      // 1. Get pre-signed URL from your API
      const requestBody = {
        fileName: sanitizedFileName,
        fileType: file.type,
        folder,
      };
      console.log('[s3Upload] Sending request:', requestBody);
      
      const presignRes = await fetch('/api/s3-presign-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      if (!presignRes.ok) {
        const errorText = await presignRes.text();
        console.error('[s3Upload] API error:', presignRes.status, errorText);
        throw new Error(`Failed to get pre-signed URL: ${presignRes.status} ${errorText}`);
      }
      const { url, key, publicUrl } = await presignRes.json();
      console.log('[s3Upload] publicUrl from presign API:', publicUrl);

      // 2. Upload to S3 using XHR for progress with retry logic
      const uploadWithRetry = async (retryCount = 0): Promise<void> => {
        return new Promise<void>((resolve, reject) => {
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
            } else if (xhr.status === 503 && retryCount < 3) {
              // Retry on 503 (Slow Down) after a delay
              console.log(`[s3Upload] Got 503, retrying (${retryCount + 1}/3) after delay...`);
              setTimeout(() => {
                uploadWithRetry(retryCount + 1).then(resolve).catch(reject);
              }, 2000 * (retryCount + 1)); // Exponential backoff
            } else {
              reject(new Error(`Upload failed with status ${xhr.status} after ${retryCount} retries`));
            }
          };
          xhr.onerror = () => reject(new Error('XHR upload failed'));
          xhr.send(file);
        });
      };

      await uploadWithRetry();

      return { url: publicUrl, key };
    };

    // Add to queue and process
    return new Promise((resolve, reject) => {
      uploadQueue.push(async () => {
        try {
          const result = await uploadTask();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      processQueue();
    });
  },

  // Delete is not implemented for S3 in this client.
}; 