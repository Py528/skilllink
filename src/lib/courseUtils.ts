// Types for course resources
export interface CourseResource {
  key: string;
  url: string;
  name: string;
  size: number;
  type: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  video_url: string;
  duration: number;
  order_index: number;
  is_preview: boolean;
  content: Record<string, unknown>;
  thumbnail_url?: string;
  resources: CourseResource[];
  is_free: boolean;
  section_id: string;
}

// Function to fetch a lesson with its resources
export async function fetchLessonWithResources(lessonId: string): Promise<Lesson | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    const response = await fetch(`${supabaseUrl}/rest/v1/lessons?id=eq.${lessonId}&select=*`, {
      headers: {
        'apikey': supabaseKey!,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data && data.length > 0 ? data[0] : null
  } catch (error) {
    return null
  }
}

// Function to fetch all lessons for a course with resources
export async function fetchCourseLessonsWithResources(courseId: string): Promise<Lesson[]> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // First get all sections for the course
    const sectionsResponse = await fetch(`${supabaseUrl}/rest/v1/course_sections?course_id=eq.${courseId}&select=id`, {
      headers: {
        'apikey': supabaseKey!,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!sectionsResponse.ok) {
      return []
    }

    const sections = await sectionsResponse.json()

    if (!sections || sections.length === 0) {
      return []
    }

    // Get all lessons for all sections
    const sectionIds = sections.map((section: any) => section.id)
    const lessonsResponse = await fetch(`${supabaseUrl}/rest/v1/lessons?section_id=in.(${sectionIds.join(',')})&select=*&order=order_index.asc`, {
      headers: {
        'apikey': supabaseKey!,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!lessonsResponse.ok) {
      return []
    }

    const lessons = await lessonsResponse.json()
    return lessons || []
  } catch (error) {
    return []
  }
}

// Function to format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Function to get file type category
export function getFileTypeCategory(fileName: string, mimeType: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('image/')) return 'image';
  if (extension === 'pdf' || mimeType === 'application/pdf') return 'pdf';
  if (['doc', 'docx', 'txt', 'rtf'].includes(extension || '')) return 'document';
  if (['py', 'tsx', 'jsx', 'js', 'ts', 'env', 'sql', 'json', 'xml', 'html', 'css'].includes(extension || '')) return 'code';
  return 'other';
}

// Function to download a resource
export function downloadResource(resource: CourseResource) {
  const link = document.createElement('a');
  link.href = resource.url;
  link.download = resource.name;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.click();
}

// Function to open a resource in new tab
export function openResourceInNewTab(resource: CourseResource) {
  window.open(resource.url, '_blank', 'noopener,noreferrer');
}

// Function to check if a resource can be previewed
export function canPreviewResource(resource: CourseResource): boolean {
  const category = getFileTypeCategory(resource.name, resource.type);
  return category === 'image' || category === 'pdf' || category === 'video';
}

// S3 public bucket base URL
export const S3_BASE_URL = 'https://courses-skilllearn.s3.us-east-1.amazonaws.com/';

// Helper to construct a full S3 URL from a key or relative path
export function getS3Url(pathOrUrl?: string): string | undefined {
  if (!pathOrUrl) return undefined;
  // If already a full URL (http/https), return as is
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
  // Otherwise, treat as S3 key or relative path
  return S3_BASE_URL + pathOrUrl.replace(/^\/+/, '');
} 