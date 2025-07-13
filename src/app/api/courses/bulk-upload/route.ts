import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import JSZip from 'jszip';
import { s3Service } from '@/services/s3Upload';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface FileInfo {
  name: string;
  path: string;
  size: number;
  type: string;
  content: Buffer;
}

interface CourseStructure {
  sections: Array<{
    name: string;
    lessons: Array<{
      name: string;
      files: Array<{
        name: string;
        type: string;
        path: string;
        size: number;
        s3Url?: string;
      }>;
    }>;
  }>;
}

// File type detection
const fileTypeConfig = {
  video: {
    extensions: ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
    folder: 'videos',
    maxSize: 500 * 1024 * 1024 // 500MB
  },
  transcript: {
    extensions: ['.txt'],
    folder: 'resources',
    maxSize: 25 * 1024 * 1024 // 25MB
  },
  subtitle: {
    extensions: ['.srt', '.vtt'],
    folder: 'resources',
    maxSize: 10 * 1024 * 1024 // 10MB
  },
  instruction: {
    extensions: ['.html'],
    folder: 'resources',
    maxSize: 25 * 1024 * 1024 // 25MB
  },
  image: {
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    folder: 'resources',
    maxSize: 10 * 1024 * 1024 // 10MB
  },
  document: {
    extensions: ['.pdf', '.doc', '.docx'],
    folder: 'resources',
    maxSize: 25 * 1024 * 1024 // 25MB
  }
};

// Detect file type based on extension
function getFileType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop() || '';
  for (const [type, config] of Object.entries(fileTypeConfig)) {
    if (config.extensions.includes(`.${ext}`)) {
      return type;
    }
  }
  return 'other';
}

// Parse folder structure from uploaded files
function parseFolderStructure(files: FileInfo[]): CourseStructure {
  const sections: CourseStructure['sections'] = [];
  const fileMap = new Map<string, FileInfo[]>();

  // Group files by their path structure
  files.forEach(file => {
    const pathParts = file.path.split('/');
    if (pathParts.length >= 2) {
      const sectionName = pathParts[0];
      const lessonName = pathParts[1];
      const key = `${sectionName}/${lessonName}`;
      
      if (!fileMap.has(key)) {
        fileMap.set(key, []);
      }
      fileMap.get(key)!.push(file);
    }
  });

  // Convert to course structure
  const sectionMap = new Map<string, CourseStructure['sections'][0]>();
  
  fileMap.forEach((files, key) => {
    const [sectionName, lessonName] = key.split('/');
    
    if (!sectionMap.has(sectionName)) {
      sectionMap.set(sectionName, {
        name: sectionName,
        lessons: []
      });
    }
    
    const section = sectionMap.get(sectionName)!;
    const lesson = {
      name: lessonName,
      files: files.map(file => ({
        name: file.name,
        type: getFileType(file.name),
        path: file.path,
        size: file.size
      }))
    };
    
    section.lessons.push(lesson);
  });

  return {
    sections: Array.from(sectionMap.values())
  };
}

// Upload file to S3
async function uploadFileToS3(file: FileInfo): Promise<string> {
  const fileType = getFileType(file.name);
  const config = fileTypeConfig[fileType as keyof typeof fileTypeConfig] || fileTypeConfig.document;
  
  // Validate file size
  if (file.size > config.maxSize) {
    throw new Error(`File ${file.name} exceeds maximum size of ${config.maxSize / 1024 / 1024}MB`);
  }

  // Generate unique filename
  const hash = await generateFileHash(file.content);
  const ext = file.name.split('.').pop();
  const safeName = `${hash}.${ext}`;
  const s3Path = `${config.folder}/${safeName}`;

  // Upload to S3
  const result = await s3Service.uploadBuffer(file.content, s3Path);
  return result.url;
}

// Generate file hash for deduplication
async function generateFileHash(buffer: Buffer): Promise<string> {
  const crypto = await import('crypto');
  return crypto.default.createHash('sha256').update(buffer).digest('hex');
}

// Process ZIP file
async function processZipFile(zipBuffer: Buffer): Promise<FileInfo[]> {
  const zip = new JSZip();
  const zipContent = await zip.loadAsync(zipBuffer);
  const files: FileInfo[] = [];

  for (const [path, file] of Object.entries(zipContent.files)) {
    if (!file.dir) {
      const content = await file.async('nodebuffer');
      files.push({
        name: file.name,
        path: path,
        size: content.length,
        type: file.type || 'application/octet-stream',
        content
      });
    }
  }

  return files;
}

// Process folder upload (from FormData)
async function processFolderUpload(formData: FormData): Promise<FileInfo[]> {
  const files: FileInfo[] = [];
  const entries = formData.entries();

  for (const [key, value] of entries) {
    if (value instanceof File) {
      const buffer = Buffer.from(await value.arrayBuffer());
      files.push({
        name: value.name,
        path: key, // The key contains the relative path
        size: value.size,
        type: value.type,
        content: buffer
      });
    }
  }

  return files;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const courseId = formData.get('courseId') as string;
    const instructorId = formData.get('instructorId') as string;
    const uploadType = formData.get('uploadType') as string; // 'zip' or 'folder'

    if (!courseId || !instructorId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let files: FileInfo[] = [];

    if (uploadType === 'zip') {
      const zipFile = formData.get('file') as File;
      if (!zipFile) {
        return NextResponse.json(
          { error: 'No ZIP file provided' },
          { status: 400 }
        );
      }

      const zipBuffer = Buffer.from(await zipFile.arrayBuffer());
      files = await processZipFile(zipBuffer);
    } else {
      files = await processFolderUpload(formData);
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files found in upload' },
        { status: 400 }
      );
    }

    // Parse course structure
    const courseStructure = parseFolderStructure(files);

    // Upload files to S3 and update structure with URLs
    for (const section of courseStructure.sections) {
      for (const lesson of section.lessons) {
        for (const file of lesson.files) {
          const fileInfo = files.find(f => f.path === file.path);
          if (fileInfo) {
            try {
              const s3Url = await uploadFileToS3(fileInfo);
              file.s3Url = s3Url;
            } catch (error) {
              console.error(`Failed to upload ${file.name}:`, error);
              // Continue with other files
            }
          }
        }
      }
    }

    // Create sections and lessons in database
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Create sections
    for (let i = 0; i < courseStructure.sections.length; i++) {
      const section = courseStructure.sections[i];
      
      const { data: sectionData, error: sectionError } = await supabase
        .from('sections')
        .insert({
          course_id: courseId,
          title: section.name,
          description: `Section ${i + 1}: ${section.name}`,
          order_index: i,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (sectionError) {
        console.error('Failed to create section:', sectionError);
        continue;
      }

      // Create lessons for this section
      for (let j = 0; j < section.lessons.length; j++) {
        const lesson = section.lessons[j];
        
        // Find video file for duration
        const videoFile = lesson.files.find(f => f.type === 'video');
        let duration = 0;
        
        if (videoFile && videoFile.s3Url) {
          // In a real implementation, you'd extract duration from video metadata
          // For now, we'll use a placeholder
          duration = 300; // 5 minutes placeholder
        }

        // Find transcript file
        const transcriptFile = lesson.files.find(f => f.type === 'transcript');
        const subtitleFile = lesson.files.find(f => f.type === 'subtitle');
        const instructionFile = lesson.files.find(f => f.type === 'instruction');

        const { error: lessonError } = await supabase
          .from('lessons')
          .insert({
            course_id: courseId,
            section_id: sectionData.id,
            title: lesson.name,
            description: `Lesson ${j + 1}: ${lesson.name}`,
            type: videoFile ? 'video' : 'text',
            duration: duration,
            video_url: videoFile?.s3Url || null,
            thumbnail_url: null, // Could be extracted from video or separate image
            transcript_url: transcriptFile?.s3Url || null,
            subtitle_url: subtitleFile?.s3Url || null,
            instruction_url: instructionFile?.s3Url || null,
            resources: lesson.files
              .filter(f => f.type !== 'video' && f.type !== 'transcript' && f.type !== 'subtitle' && f.type !== 'instruction')
              .map(f => ({
                name: f.name,
                type: f.type,
                url: f.s3Url,
                size: f.size
              })),
            status: 'draft',
            order_index: j,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (lessonError) {
          console.error('Failed to create lesson:', lessonError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Course structure created successfully',
      structure: courseStructure,
      stats: {
        sections: courseStructure.sections.length,
        lessons: courseStructure.sections.reduce((acc, s) => acc + s.lessons.length, 0),
        files: courseStructure.sections.reduce((acc, s) => 
          acc + s.lessons.reduce((acc2, l) => acc2 + l.files.length, 0), 0
        )
      }
    });

  } catch (error) {
    console.error('Bulk upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 