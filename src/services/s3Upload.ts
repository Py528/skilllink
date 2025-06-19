import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
    const filePath = `${folder}/${file.name}`;
    
    const { data, error } = await supabase.storage.from('course-content').upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
      onUploadProgress: (event) => {
        if (onProgress) {
          const percentage = (event.loaded / event.total) * 100;
          onProgress({ loaded: event.loaded, total: event.total, percentage });
        }
      },
    });

    if (error) {
      throw error;
    }

    const { data: publicUrlData } = supabase.storage.from('course-content').getPublicUrl(filePath);

    if (!publicUrlData) {
        throw new Error('Failed to get public URL for uploaded file');
    }

    return { url: publicUrlData.publicUrl, key: filePath };
  },

  async deleteFile(key: string): Promise<void> {
    const { error } = await supabase.storage.from('course-content').remove([key]);
    if (error) {
      throw error;
    }
  },
}; 