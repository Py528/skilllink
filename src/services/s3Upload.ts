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
const uploadQueue: Array<() => Promise<any>> = [];
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

  // Upload multiple files with progress tracking
  async uploadMultipleFiles(
    files: File[], 
    folder: string, 
    onProgress?: (progress: { completed: number; total: number; percentage: number; currentFile?: string }) => void
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    const total = files.length;
    let completed = 0;

    for (const file of files) {
      try {
        const result = await this.uploadFile(file, folder, (fileProgress) => {
          // Calculate overall progress
          const overallPercentage = ((completed + fileProgress.percentage / 100) / total) * 100;
          onProgress?.({
            completed: completed + (fileProgress.percentage / 100),
            total,
            percentage: overallPercentage,
            currentFile: file.name
          });
        });
        
        results.push(result);
        completed++;
        
        // Update progress after file completion
        onProgress?.({
          completed,
          total,
          percentage: (completed / total) * 100,
          currentFile: file.name
        });
        
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        // Continue with other files even if one fails
        completed++;
      }
    }

    return results;
  },

  // Upload files with organized folder structure
  async uploadWithOrganization(
    files: File[], 
    courseFolderId: string,
    onProgress?: (progress: { completed: number; total: number; percentage: number; currentFile?: string }) => void
  ): Promise<{ file: File; result: UploadResult }[]> {
    const results: { file: File; result: UploadResult }[] = [];
    const total = files.length;
    let completed = 0;

    // File type configuration for organization
    const fileTypeConfig = {
      video: { folder: 'videos', extensions: ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v', '.3gp'] },
      audio: { folder: 'audio', extensions: ['.mp3', '.wav', '.aac', '.ogg', '.flac', '.m4a'] },
      transcript: { folder: 'transcripts', extensions: ['.txt'] },
      subtitle: { folder: 'subtitles', extensions: ['.srt', '.vtt', '.sub'] },
      instruction: { folder: 'instructions', extensions: ['.html', '.htm'] },
      image: { folder: 'images', extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.svg'] },
      document: { folder: 'documents', extensions: ['.pdf', '.doc', '.docx', '.rtf', '.odt'] },
      spreadsheet: { folder: 'spreadsheets', extensions: ['.xls', '.xlsx', '.csv', '.ods'] },
      presentation: { folder: 'presentations', extensions: ['.ppt', '.pptx', '.odp'] },
      code: { folder: 'code', extensions: ['.py', '.tsx', '.jsx', '.js', '.ts', '.env', '.php', '.java', '.cpp', '.c', '.cs', '.rb', '.go', '.rs', '.swift', '.kt', '.scala', '.r', '.matlab', '.sh', '.bat', '.ps1', '.yaml', '.yml', '.toml', '.ini', '.cfg', '.conf', '.md', '.rst', '.tex', '.latex'] },
      archive: { folder: 'archives', extensions: ['.zip', '.rar', '.7z', '.tar', '.gz'] }
    };

    // Helper function to get file type
    const getFileType = (filename: string): string => {
      const ext = filename.toLowerCase().split('.').pop() || '';
      for (const [type, config] of Object.entries(fileTypeConfig)) {
        if (config.extensions.includes(`.${ext}`)) {
          return type;
        }
      }
      return 'document'; // Default to documents
    };

    for (const file of files) {
      try {
        const fileType = getFileType(file.name);
        const fileConfig = fileTypeConfig[fileType as keyof typeof fileTypeConfig] || fileTypeConfig.document;
        const folder = `${courseFolderId}/${fileConfig.folder}`;

        const result = await this.uploadFile(file, folder, (fileProgress) => {
          // Calculate overall progress
          const overallPercentage = ((completed + fileProgress.percentage / 100) / total) * 100;
          onProgress?.({
            completed: completed + (fileProgress.percentage / 100),
            total,
            percentage: overallPercentage,
            currentFile: file.name
          });
        });
        
        results.push({ file, result });
        completed++;
        
        // Update progress after file completion
        onProgress?.({
          completed,
          total,
          percentage: (completed / total) * 100,
          currentFile: file.name
        });
        
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        // Continue with other files even if one fails
        completed++;
      }
    }

    return results;
  },

  // Server-side buffer upload method
  async uploadBuffer(buffer: Buffer, s3Path: string): Promise<UploadResult> {
    // This method is for server-side use only
    // It requires AWS SDK on the server side
    
    // For now, we'll simulate the upload
    // In a real implementation, you'd use AWS SDK to upload directly to S3
    
    return new Promise((resolve) => {
      // Simulate upload delay
      setTimeout(() => {
        const publicUrl = `https://your-s3-bucket.s3.amazonaws.com/${s3Path}`;
        resolve({
          url: publicUrl,
          key: s3Path
        });
      }, 1000);
    });
  },

  // Delete is not implemented for S3 in this client.
}; 