import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import JSZip from 'jszip';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { logger } from '@/lib/logger';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const s3 = new S3Client({
  region: process.env.AWS_BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_KEY!,
  },
});

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
        s3Key?: string;
      }>;
    }>;
  }>;
}

// File type configuration for organized S3 structure
const fileTypeConfig = {
  video: {
    extensions: ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v', '.3gp'],
    folder: 'videos',
    maxSize: 500 * 1024 * 1024 // 500MB
  },
  transcript: {
    extensions: ['.txt'],
    folder: 'transcripts',
    maxSize: 25 * 1024 * 1024 // 25MB
  },
  subtitle: {
    extensions: ['.srt', '.vtt', '.sub'],
    folder: 'subtitles',
    maxSize: 10 * 1024 * 1024 // 10MB
  },
  instruction: {
    extensions: ['.html', '.htm'],
    folder: 'instructions',
    maxSize: 25 * 1024 * 1024 // 25MB
  },
  image: {
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.svg'],
    folder: 'images',
    maxSize: 10 * 1024 * 1024 // 10MB
  },
  document: {
    extensions: ['.pdf', '.doc', '.docx', '.rtf', '.odt'],
    folder: 'documents',
    maxSize: 25 * 1024 * 1024 // 25MB
  },
  spreadsheet: {
    extensions: ['.xls', '.xlsx', '.csv', '.ods'],
    folder: 'documents',
    maxSize: 25 * 1024 * 1024 // 25MB
  },
  presentation: {
    extensions: ['.ppt', '.pptx', '.odp'],
    folder: 'documents',
    maxSize: 25 * 1024 * 1024 // 25MB
  },
  code: {
    extensions: ['.py', '.tsx', '.jsx', '.js', '.ts', '.env', '.php', '.java', '.cpp', '.c', '.cs', '.rb', '.go', '.rs', '.swift', '.kt', '.scala', '.r', '.matlab', '.sh', '.bat', '.ps1', '.yaml', '.yml', '.toml', '.ini', '.cfg', '.conf', '.md', '.rst', '.tex', '.latex'],
    folder: 'documents',
    maxSize: 10 * 1024 * 1024 // 10MB
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
  return 'document';
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

// Upload file to S3 with organized folder structure
async function uploadFileToS3(file: FileInfo, courseFolderId: string): Promise<{ url: string; key: string }> {
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
  const s3Path = `${courseFolderId}/${config.folder}/${safeName}`;

  // Upload to S3
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: s3Path,
    Body: file.content,
    ContentType: getContentType(file.name),
    Metadata: {
      'original-filename': file.name,
      'upload-timestamp': new Date().toISOString(),
      'file-type': fileType,
      'folder-structure': config.folder
    }
  });

  await s3.send(command);
  
  const publicUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com/${s3Path}`;
  
  return {
    url: publicUrl,
    key: s3Path
  };
}

// Get content type based on file extension
function getContentType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop();
  switch (ext) {
    case 'mp4': return 'video/mp4';
    case 'mov': return 'video/quicktime';
    case 'avi': return 'video/x-msvideo';
    case 'webm': return 'video/webm';
    case 'pdf': return 'application/pdf';
    case 'doc': return 'application/msword';
    case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'txt': return 'text/plain';
    case 'html':
    case 'htm': return 'text/html';
    case 'srt': return 'text/plain';
    case 'vtt': return 'text/vtt';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'png': return 'image/png';
    case 'gif': return 'image/gif';
    case 'webp': return 'image/webp';
    default: return 'application/octet-stream';
  }
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

    // Generate course folder ID for S3 organization
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const courseFolderId = `course_${timestamp}_${random}`;

    // Parse course structure
    const courseStructure = parseFolderStructure(files);

    // Upload files to S3 and update structure with URLs
    for (const section of courseStructure.sections) {
      for (const lesson of section.lessons) {
        for (const file of lesson.files) {
          const fileInfo = files.find(f => f.path === file.path);
          if (fileInfo) {
            try {
              const { url, key } = await uploadFileToS3(fileInfo, courseFolderId);
              file.s3Url = url;
              file.s3Key = key;
            } catch (error) {
              logger.error('Failed to upload file', { 
                fileName: file.name, 
                error: error instanceof Error ? error.message : error 
              }, 'BULK_UPLOAD');
              // Continue with other files even if one fails
            }
          }
        }
      }
    }

    // Create course sections and lessons in Supabase
    const createdSections = [];
    const createdLessons = [];

    for (let sectionIndex = 0; sectionIndex < courseStructure.sections.length; sectionIndex++) {
      const section = courseStructure.sections[sectionIndex];
      
      // Create section
      const { data: createdSection, error: sectionError } = await supabase
        .from('course_sections')
        .insert({
          course_id: courseId,
          title: section.name,
          order_index: sectionIndex,
          description: `Section ${sectionIndex + 1}: ${section.name}`
        })
        .select()
        .single();

      if (sectionError) {
        logger.error('Error creating section', { 
          sectionName: section.name, 
          error: sectionError.message 
        }, 'BULK_UPLOAD');
        continue;
      }

      createdSections.push(createdSection);

      // Create lessons for this section
      for (let lessonIndex = 0; lessonIndex < section.lessons.length; lessonIndex++) {
        const lesson = section.lessons[lessonIndex];
        
        // Find video file for this lesson
        const videoFile = lesson.files.find(f => f.type === 'video');
        const resourceFiles = lesson.files.filter(f => f.type !== 'video');
        
        // Create lesson
        const { data: createdLesson, error: lessonError } = await supabase
          .from('lessons')
          .insert({
            course_id: courseId,
            section_id: createdSection.id,
            title: lesson.name,
            description: `Lesson ${lessonIndex + 1}: ${lesson.name}`,
            video_url: videoFile?.s3Url || null,
            order_index: lessonIndex,
            type: 'video',
            content: {
              course_folder_id: courseFolderId,
              resources: resourceFiles.map(f => ({
                name: f.name,
                type: f.type,
                url: f.s3Url,
                key: f.s3Key,
                size: f.size
              }))
            }
          })
          .select()
          .single();

        if (lessonError) {
          logger.error('Error creating lesson', { 
            lessonName: lesson.name, 
            error: lessonError.message 
          }, 'BULK_UPLOAD');
          continue;
        }

        createdLessons.push(createdLesson);
      }
    }

    // Update course with folder ID
    await supabase
      .from('courses')
      .update({
        content_folder_id: courseFolderId,
        updated_at: new Date().toISOString()
      })
      .eq('id', courseId);

    return NextResponse.json({
      success: true,
      courseFolderId,
      courseStructure,
      sectionsCreated: createdSections.length,
      lessonsCreated: createdLessons.length
    });

  } catch (error) {
    logger.error('Bulk upload error', { 
      error: error instanceof Error ? error.message : error 
    }, 'BULK_UPLOAD');
    return NextResponse.json(
      { error: 'Failed to process bulk upload' },
      { status: 500 }
    );
  }
} 