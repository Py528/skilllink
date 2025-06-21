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
    const { data: lesson, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .single();

    if (error) {
      console.error('Error fetching lesson:', error);
      return null;
    }

    return lesson;
  } catch (error) {
    console.error('Error fetching lesson with resources:', error);
    return null;
  }
}

// Function to fetch all lessons for a course with resources
export async function fetchCourseLessonsWithResources(courseId: string): Promise<Lesson[]> {
  try {
    // First get all sections for the course
    const { data: sections, error: sectionsError } = await supabase
      .from('course_sections')
      .select('id')
      .eq('course_id', courseId);

    if (sectionsError) {
      console.error('Error fetching sections:', sectionsError);
      return [];
    }

    if (!sections || sections.length === 0) {
      return [];
    }

    // Get all lessons for all sections
    const sectionIds = sections.map(section => section.id);
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('*')
      .in('section_id', sectionIds)
      .order('order_index');

    if (lessonsError) {
      console.error('Error fetching lessons:', lessonsError);
      return [];
    }

    return lessons || [];
  } catch (error) {
    console.error('Error fetching course lessons with resources:', error);
    return [];
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