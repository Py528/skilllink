# Software Requirements Specification (SRS)
## Skill Learn - Cloud-Based Project-Driven Coding Education Platform

**Document Version:** 1.0  
**Date:** January 2025  
**Status:** Draft

---

## Table of Contents

1. [Introduction](#1-introduction)
   - 1.1 [Purpose](#11-purpose)
   - 1.2 [Scope](#12-scope)
   - 1.3 [Definitions, Acronyms, and Abbreviations](#13-definitions-acronyms-and-abbreviations)
   - 1.4 [References](#14-references)
   - 1.5 [Overview](#15-overview)

2. [Overall Description](#2-overall-description)
   - 2.1 [Product Perspective](#21-product-perspective)
   - 2.2 [Product Functions](#22-product-functions)
   - 2.3 [User Classes and Characteristics](#23-user-classes-and-characteristics)
   - 2.4 [Operating Environment](#24-operating-environment)
   - 2.5 [Design and Implementation Constraints](#25-design-and-implementation-constraints)
   - 2.6 [Assumptions and Dependencies](#26-assumptions-and-dependencies)

3. [System Features](#3-system-features)
   - 3.1 [Authentication and Authorization](#31-authentication-and-authorization)
   - 3.2 [Course Management](#32-course-management)
   - 3.3 [Cloud IDE](#33-cloud-ide)
   - 3.4 [Code Execution Engine](#34-code-execution-engine)
   - 3.5 [GitHub Integration](#35-github-integration)
   - 3.6 [Video Learning System](#36-video-learning-system)
   - 3.7 [Progress Tracking](#37-progress-tracking)
   - 3.8 [Instructor Dashboard](#38-instructor-dashboard)
   - 3.9 [Learner Dashboard](#39-learner-dashboard)
   - 3.10 [File Management and Storage](#310-file-management-and-storage)

4. [External Interface Requirements](#4-external-interface-requirements)
   - 4.1 [User Interfaces](#41-user-interfaces)
   - 4.2 [Hardware Interfaces](#42-hardware-interfaces)
   - 4.3 [Software Interfaces](#43-software-interfaces)
   - 4.4 [Communication Interfaces](#44-communication-interfaces)

5. [System Requirements](#5-system-requirements)
   - 5.1 [Functional Requirements](#51-functional-requirements)
   - 5.2 [Performance Requirements](#52-performance-requirements)
   - 5.3 [Security Requirements](#53-security-requirements)
   - 5.4 [Reliability Requirements](#54-reliability-requirements)
   - 5.5 [Scalability Requirements](#55-scalability-requirements)

6. [Non-Functional Requirements](#6-non-functional-requirements)
   - 6.1 [Usability](#61-usability)
   - 6.2 [Maintainability](#62-maintainability)
   - 6.3 [Portability](#63-portability)
   - 6.4 [Compliance](#64-compliance)

7. [Appendices](#7-appendices)
   - 7.1 [Glossary](#71-glossary)
   - 7.2 [Data Models](#72-data-models)
   - 7.3 [API Specifications](#73-api-specifications)

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) document provides a comprehensive description of **Skill Learn**, a cloud-based, project-driven coding education platform. This document is intended for:

- **Developers**: To understand system architecture and implementation requirements
- **Product Managers**: To define feature scope and priorities
- **Stakeholders**: To understand business value and technical capabilities
- **QA Engineers**: To develop test plans and validation criteria
- **DevOps Engineers**: To plan infrastructure and deployment strategies

The SRS follows the IEEE 830 standard format and serves as the authoritative source for all system requirements.

### 1.2 Scope

**Skill Learn** is a web-based learning management system that enables learners to code, run, and preview real software projects directly from their browsers without requiring powerful local hardware or complex development environment setup.

**In Scope:**
- Browser-based cloud IDE with Monaco Editor
- Docker-based code execution engine
- GitHub repository integration and synchronization
- Course creation and management tools
- Video lesson delivery with progress tracking
- Real-time code execution output streaming
- User authentication and role-based access control
- File storage and management (S3/Supabase)
- Instructor and learner dashboards
- Progress tracking and analytics

**Out of Scope (MVP):**
- Native mobile applications
- Offline mode for code execution
- AI-powered code mentoring
- Live video conferencing
- Discussion forums
- Certificate generation
- SCORM/xAPI compliance
- Multi-language support (UI localization)

### 1.3 Definitions, Acronyms, and Abbreviations

| Term | Definition |
|------|------------|
| **IDE** | Integrated Development Environment |
| **SRS** | Software Requirements Specification |
| **MVP** | Minimum Viable Product |
| **RLS** | Row Level Security (Supabase) |
| **JWT** | JSON Web Token |
| **OAuth** | Open Authorization protocol |
| **API** | Application Programming Interface |
| **CDN** | Content Delivery Network |
| **GDPR** | General Data Protection Regulation |
| **Docker** | Containerization platform |
| **EC2** | Amazon Elastic Compute Cloud |
| **S3** | Amazon Simple Storage Service |
| **Lambda** | AWS Lambda serverless function |
| **Monaco** | VS Code's editor core |
| **Presigned URL** | Time-limited, secure S3 URL |
| **Ephemeral Container** | Short-lived, auto-destroyed container |
| **Cold Start** | Initial container initialization time |
| **Warm Start** | Reusing existing container instance |

### 1.4 References

- IEEE Std 830-1998: IEEE Recommended Practice for Software Requirements Specifications
- Next.js 15 Documentation: https://nextjs.org/docs
- Supabase Documentation: https://supabase.com/docs
- Monaco Editor Documentation: https://microsoft.github.io/monaco-editor/
- AWS S3 Documentation: https://docs.aws.amazon.com/s3/
- Docker Documentation: https://docs.docker.com/
- GitHub API Documentation: https://docs.github.com/en/rest

### 1.5 Overview

This document is organized into seven main sections:

- **Section 1**: Introduction and document overview
- **Section 2**: Overall system description, user classes, and constraints
- **Section 3**: Detailed feature specifications
- **Section 4**: External interface requirements
- **Section 5**: System-level requirements (functional, performance, security)
- **Section 6**: Non-functional requirements
- **Section 7**: Appendices with data models and API specifications

---

## 2. Overall Description

### 2.1 Product Perspective

**Skill Learn** is a standalone web application that integrates with several external services:

```
┌─────────────────────────────────────────────────────────────┐
│                    Skill Learn Platform                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Frontend   │  │   Backend    │  │   Database   │     │
│  │  (Next.js)   │  │  (Node.js)   │  │ (Supabase)   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   GitHub     │    │  AWS S3      │    │   Docker     │
│   (OAuth)    │    │  (Storage)   │    │ (Execution)  │
└──────────────┘    └──────────────┘    └──────────────┘
```

**System Boundaries:**
- **Frontend**: Next.js 15 application running in user's browser
- **Backend**: Node.js API routes (Next.js API routes)
- **Database**: Supabase PostgreSQL with real-time subscriptions
- **Storage**: AWS S3 for video files and course assets
- **Execution**: Docker containers on EC2/Railway infrastructure
- **Authentication**: Supabase Auth (Email, Google, GitHub OAuth)

### 2.2 Product Functions

The system provides the following major functional areas:

1. **User Management**
   - Registration and authentication (Email, Google, GitHub)
   - Role-based access (Learner, Instructor, Admin)
   - Profile management

2. **Course Management**
   - Course creation and editing
   - Lesson organization and sequencing
   - Video upload and management
   - Resource attachment
   - Course publishing workflow

3. **Cloud IDE**
   - Monaco Editor with syntax highlighting
   - Multi-file project management
   - File tree navigation
   - Terminal emulation
   - Code execution interface

4. **Code Execution**
   - Docker container provisioning
   - Real-time output streaming
   - Multi-language support (JavaScript, Python)
   - Ephemeral container lifecycle management

5. **GitHub Integration**
   - Repository cloning and forking
   - Git operations (commit, push, pull)
   - Progress synchronization

6. **Learning Experience**
   - Video player with progress tracking
   - Side-by-side video and code view
   - Lesson completion tracking
   - Course progress visualization

7. **Analytics and Reporting**
   - Instructor dashboard with student metrics
   - Learner progress tracking
   - Course engagement analytics

### 2.3 User Classes and Characteristics

#### 2.3.1 Learner / Student

**Characteristics:**
- Age: 18-30 years old
- Technical proficiency: Beginner to intermediate
- Primary goal: Learn coding through hands-on projects
- Device: Desktop, laptop, or tablet (Chromebook-friendly)

**Key Actions:**
- Enroll in courses
- Watch video lessons
- Code in cloud IDE
- Run and preview code
- Submit projects via GitHub
- Track learning progress

**Access Rights:**
- View published courses
- Access enrolled course content
- Execute code in sandboxed containers
- Create personal projects (future)

#### 2.3.2 Instructor / Creator

**Characteristics:**
- Technical proficiency: Advanced
- Role: Developer or educator
- Primary goal: Create interactive, project-based courses

**Key Actions:**
- Create and edit courses
- Upload video content
- Link GitHub repositories to lessons
- Configure IDE projects
- Review student progress
- Manage course enrollment

**Access Rights:**
- Full CRUD on own courses
- Access to instructor dashboard
- View analytics for own courses
- Manage course content and resources

#### 2.3.3 Admin / Platform Owner

**Characteristics:**
- Technical proficiency: Advanced
- Role: Platform operator
- Primary goal: Maintain platform health and performance

**Key Actions:**
- Manage user accounts
- Monitor system metrics
- Review and moderate courses
- Manage infrastructure
- View platform-wide analytics

**Access Rights:**
- Full system access
- User management
- Course moderation
- System configuration

### 2.4 Operating Environment

#### 2.4.1 Client Environment

**Browsers (Minimum Versions):**
- Chrome/Edge: 90+
- Firefox: 88+
- Safari: 14+
- Mobile browsers: iOS Safari 14+, Chrome Mobile 90+

**Device Requirements:**
- Desktop: Any device capable of running modern browsers
- Tablet: iPad, Android tablets
- Mobile: Responsive design (limited IDE functionality)

**Network:**
- Minimum: 5 Mbps for video streaming
- Recommended: 10+ Mbps for optimal experience
- Latency: < 200ms for real-time features

#### 2.4.2 Server Environment

**Infrastructure:**
- **Frontend Hosting**: Vercel, Netlify, or similar (Next.js deployment)
- **Database**: Supabase (PostgreSQL 14+)
- **Storage**: AWS S3 (Standard storage class)
- **Execution**: AWS EC2 or Railway (Docker host)
- **CDN**: CloudFront or similar (for static assets)

**Runtime Requirements:**
- Node.js: 18.x or higher
- Docker: 20.10+ (on execution servers)
- PostgreSQL: 14+ (via Supabase)

### 2.5 Design and Implementation Constraints

#### 2.5.1 Technical Constraints

1. **Technology Stack (Fixed)**
   - Frontend: Next.js 15, React 19, TypeScript 5
   - UI Framework: Tailwind CSS 4
   - Editor: Monaco Editor (VS Code core)
   - Backend: Next.js API routes (Node.js)
   - Database: Supabase PostgreSQL
   - Auth: Supabase Auth
   - Storage: AWS S3

2. **Language Support (MVP)**
   - Phase 1: JavaScript/Node.js, Python
   - Phase 2: Go, Java, C++ (future)

3. **Container Constraints**
   - Maximum execution time: 60 seconds per run
   - Container auto-stop after 60s inactivity
   - No network access from containers
   - Isolated filesystem per execution

4. **File Size Limits**
   - Video upload: 500 MB per file
   - Code file: 10 MB per file
   - Total project size: 100 MB

#### 2.5.2 Business Constraints

1. **Cost Ceiling**
   - MVP infrastructure: ≤ $10/month
   - Ephemeral containers reduce compute costs
   - S3 storage optimized for cost

2. **Timeline**
   - MVP: 3-6 months
   - Phase 2 features: 6-12 months

3. **Regulatory**
   - GDPR compliance required
   - No data collection from users under 13
   - Data encryption at rest and in transit

#### 2.5.3 Regulatory Constraints

- **GDPR**: User data protection, right to deletion
- **COPPA**: No users under 13
- **Accessibility**: WCAG 2.1 Level AA compliance (future)

### 2.6 Assumptions and Dependencies

#### 2.6.1 Assumptions

1. Users have stable internet connectivity
2. Users are familiar with basic web browsing
3. Instructors have GitHub accounts for repository integration
4. AWS/Supabase services remain available and stable
5. Docker execution environment is properly secured
6. Users understand basic coding concepts (for advanced courses)

#### 2.6.2 Dependencies

**External Services:**
- **Supabase**: Database, authentication, real-time subscriptions
- **AWS S3**: Video and file storage
- **GitHub**: Repository hosting and OAuth
- **Google OAuth**: Authentication provider
- **Docker Hub**: Base images for execution containers
- **Monaco Editor**: Code editor library

**Internal Dependencies:**
- Next.js framework and ecosystem
- React and React DOM
- TypeScript compiler
- Node.js runtime

**Third-Party Libraries:**
- `@supabase/supabase-js`: Supabase client
- `monaco-editor`: Code editor
- `@aws-sdk/client-s3`: AWS S3 integration
- `react-player`: Video playback

---

## 3. System Features

### 3.1 Authentication and Authorization

#### 3.1.1 User Registration

**FR-1.1.1**: The system SHALL allow users to register with:
- Email and password
- Google OAuth
- GitHub OAuth

**FR-1.1.2**: During registration, users SHALL select their role:
- Learner
- Instructor

**FR-1.1.3**: The system SHALL validate:
- Email format
- Password strength (minimum 8 characters)
- Unique email addresses

**FR-1.1.4**: The system SHALL send email verification for email/password registrations.

#### 3.1.2 User Authentication

**FR-1.2.1**: The system SHALL provide login via:
- Email and password
- Google OAuth
- GitHub OAuth

**FR-1.2.2**: The system SHALL maintain user sessions using JWT tokens.

**FR-1.2.3**: The system SHALL support "Remember Me" functionality (extended session).

**FR-1.2.4**: The system SHALL implement password reset functionality.

#### 3.1.3 Role-Based Access Control (RBAC)

**FR-1.3.1**: The system SHALL enforce role-based permissions:
- **Learners**: Can view enrolled courses, execute code, track progress
- **Instructors**: Can create/edit own courses, view analytics, manage content
- **Admins**: Full system access, user management, course moderation

**FR-1.3.2**: The system SHALL use Row Level Security (RLS) policies in Supabase.

**FR-1.3.3**: The system SHALL restrict course creation to Instructors and Admins.

### 3.2 Course Management

#### 3.2.1 Course Creation

**FR-2.1.1**: Instructors SHALL be able to create new courses with:
- Title (required, max 200 characters)
- Description (optional, max 5000 characters)
- Thumbnail image (optional)
- Price (default: $0, free)
- Difficulty level (Beginner, Intermediate, Advanced)
- Category/tags
- Estimated duration
- Learning objectives
- Prerequisites

**FR-2.1.2**: The system SHALL support a multi-step course creation wizard:
1. Basic Information
2. Course Content (lessons)
3. IDE Projects Configuration
4. Preview and Publish

**FR-2.1.3**: The system SHALL allow saving courses as drafts.

#### 3.2.2 Lesson Management

**FR-2.2.1**: Instructors SHALL be able to add lessons to courses with:
- Title (required)
- Description (optional)
- Video file upload
- Order index (for sequencing)
- Resources (files, links)
- Associated IDE project (optional)

**FR-2.2.2**: The system SHALL support lesson reordering via drag-and-drop.

**FR-2.2.3**: The system SHALL allow marking lessons as "preview" (free access).

**FR-2.2.4**: The system SHALL support lesson deletion with confirmation.

#### 3.2.3 Course Publishing

**FR-2.3.1**: Instructors SHALL be able to publish courses when:
- At least one lesson exists
- Basic information is complete
- Course is saved as draft

**FR-2.3.2**: The system SHALL set course status to "published" upon publish action.

**FR-2.3.3**: Published courses SHALL be visible to all users (unless private).

**FR-2.3.4**: The system SHALL allow unpublishing courses (returns to draft).

### 3.3 Cloud IDE

#### 3.3.1 Monaco Editor Integration

**FR-3.1.1**: The system SHALL provide a Monaco Editor instance with:
- Syntax highlighting for JavaScript, Python, TypeScript, HTML, CSS, JSON, Markdown, Shell
- Code autocomplete and IntelliSense
- Multi-cursor editing
- Find and replace
- Code folding
- Line numbers
- Dark/light theme support

**FR-3.1.2**: The editor SHALL support file switching via tabs.

**FR-3.1.3**: The editor SHALL auto-save changes (debounced, every 2 seconds).

**FR-3.1.4**: The editor SHALL display file language based on file extension.

#### 3.3.2 File Management

**FR-3.2.1**: The system SHALL display a file tree sidebar showing:
- Project files
- Course overview (markdown)
- Current lesson content (markdown)
- User-created files

**FR-3.2.2**: Users SHALL be able to:
- Open files by clicking in file tree
- Create new files
- Rename files
- Delete files (with confirmation)
- Navigate folder structure

**FR-3.2.3**: The system SHALL support file upload (drag-and-drop or file picker).

**FR-3.2.4**: The system SHALL validate file types and sizes before upload.

#### 3.3.3 IDE Interface

**FR-3.3.1**: The IDE interface SHALL include:
- Sidebar (Explorer, Search, Source Control, Run)
- Editor area (tabs, editor pane)
- Terminal (collapsible)
- Status bar (language, line/column, terminal toggle)

**FR-3.3.2**: The system SHALL support resizable panels (sidebar, terminal).

**FR-3.3.3**: The system SHALL support fullscreen mode for editor.

**FR-3.3.4**: The interface SHALL be responsive (tablet-friendly, limited mobile support).

### 3.4 Code Execution Engine

#### 3.4.1 Container Provisioning

**FR-4.1.1**: The system SHALL provision Docker containers on-demand for code execution.

**FR-4.1.2**: The system SHALL support multiple language runtimes:
- Node.js (JavaScript/TypeScript)
- Python 3.x

**FR-4.1.3**: Containers SHALL be isolated with:
- No network access
- Ephemeral filesystem
- Resource limits (CPU, memory)

**FR-4.1.4**: The system SHALL use pre-built Docker images for each language.

#### 3.4.2 Code Execution

**FR-4.2.1**: Users SHALL be able to execute code via:
- "Run" button in IDE
- Terminal command execution
- Keyboard shortcut (Ctrl+R / Cmd+R)

**FR-4.2.2**: The system SHALL stream execution output in real-time to the terminal.

**FR-4.2.3**: The system SHALL support execution of:
- Single file scripts
- Multi-file projects (with entry point)
- Package manager commands (npm, pip)

**FR-4.2.4**: The system SHALL enforce maximum execution time (60 seconds).

**FR-4.2.5**: The system SHALL handle execution errors gracefully and display error messages.

#### 3.4.3 Container Lifecycle

**FR-4.3.1**: Containers SHALL auto-stop after 60 seconds of inactivity.

**FR-4.3.2**: The system SHALL support "warm" container reuse (if available within 5 minutes).

**FR-4.3.3**: The system SHALL clean up stopped containers automatically.

**FR-4.3.4**: Cold start time SHALL be < 10 seconds, warm start < 3 seconds.

#### 3.4.4 Output Streaming

**FR-4.4.1**: The system SHALL stream stdout and stderr in real-time via WebSocket or Server-Sent Events.

**FR-4.4.2**: The terminal SHALL display:
- Command input
- Execution output
- Error messages
- Exit codes

**FR-4.4.3**: The system SHALL support terminal history (up/down arrow keys).

### 3.5 GitHub Integration

#### 3.5.1 Repository Connection

**FR-5.1.1**: Instructors SHALL be able to link GitHub repositories to:
- Courses (as template)
- Lessons (as starter code)

**FR-5.1.2**: The system SHALL authenticate users via GitHub OAuth.

**FR-5.1.3**: The system SHALL request GitHub permissions:
- Read repository contents
- Clone repositories
- Create forks (optional)

#### 3.5.2 Repository Operations

**FR-5.2.1**: The system SHALL support:
- Cloning repositories into IDE projects
- Forking repositories (for student work)
- Pulling latest changes
- Viewing repository files in IDE

**FR-5.2.2**: Learners SHALL be able to:
- Clone course template repositories
- Make changes in IDE
- Commit changes (via Git commands in terminal)
- Push to their own forks

**FR-5.2.3**: The system SHALL display Git status in IDE sidebar (Source Control view).

#### 3.5.3 Progress Synchronization

**FR-5.3.1**: The system SHALL allow learners to push code progress to GitHub.

**FR-5.3.2**: The system SHALL track which learners have synced their work.

**FR-5.3.3**: Instructors SHALL be able to view student GitHub repositories (if public).

### 3.6 Video Learning System

#### 3.6.1 Video Upload

**FR-6.1.1**: Instructors SHALL be able to upload video files:
- Supported formats: MP4, MOV, MKV, WebM, AVI
- Maximum size: 500 MB per file
- Upload progress indicator

**FR-6.1.2**: The system SHALL upload videos to AWS S3.

**FR-6.1.3**: The system SHALL trigger Lambda function on S3 upload to update database.

**FR-6.1.4**: Videos SHALL be stored with metadata:
- Lesson ID
- Course folder path
- File name

#### 3.6.2 Video Playback

**FR-6.2.1**: The system SHALL provide a video player with:
- Play/pause controls
- Progress bar (seekable)
- Volume control
- Fullscreen mode
- Playback speed control (0.5x - 2x)

**FR-6.2.2**: Videos SHALL be delivered via presigned S3 URLs (temporary, expires in 1 hour).

**FR-6.2.3**: The system SHALL track video playback progress.

**FR-6.2.4**: The system SHALL resume playback from last watched position.

#### 3.6.3 Video-Lesson Integration

**FR-6.3.1**: The system SHALL support side-by-side view:
- Video player (left)
- IDE/Code editor (right)

**FR-6.3.2**: Users SHALL be able to toggle between:
- Video-only view
- Code-only view
- Split view

**FR-6.3.3**: The system SHALL sync video timestamps with lesson content (future enhancement).

### 3.7 Progress Tracking

#### 3.7.1 Lesson Progress

**FR-7.1.1**: The system SHALL track:
- Lesson completion status
- Video watch progress (percentage)
- Last accessed timestamp
- Time spent per lesson

**FR-7.1.2**: The system SHALL mark lessons as "completed" when:
- Video is watched to 90% completion, OR
- User manually marks as complete

**FR-7.1.3**: The system SHALL display progress indicators:
- Progress bar per lesson
- Checkmark for completed lessons
- Overall course progress percentage

#### 3.7.2 Course Progress

**FR-7.2.1**: The system SHALL calculate course completion:
- Total lessons completed / Total lessons
- Display as percentage

**FR-7.2.2**: The system SHALL track enrollment date and last access date.

**FR-7.2.3**: The system SHALL support course certificates (future feature).

#### 3.7.3 Analytics

**FR-7.3.1**: Learners SHALL be able to view:
- Personal progress dashboard
- Time spent learning
- Courses enrolled
- Lessons completed

**FR-7.3.2**: Instructors SHALL be able to view:
- Student enrollment count
- Average completion rate
- Most/least completed lessons
- Student engagement metrics

### 3.8 Instructor Dashboard

#### 3.8.1 Course Management

**FR-8.1.1**: The dashboard SHALL display:
- List of created courses (published and drafts)
- Course statistics (enrollments, completion rate)
- Quick actions (Edit, Publish, Delete)

**FR-8.1.2**: Instructors SHALL be able to:
- Create new course
- Edit existing courses
- Delete courses (with confirmation)
- Duplicate courses

#### 3.8.2 Student Analytics

**FR-8.2.1**: The dashboard SHALL show per-course analytics:
- Total enrollments
- Active students (last 30 days)
- Average completion rate
- Lesson completion breakdown

**FR-8.2.2**: The system SHALL provide student list with:
- Student name
- Enrollment date
- Progress percentage
- Last access date

**FR-8.2.3**: Instructors SHALL be able to export analytics data (CSV).

#### 3.8.3 Content Management

**FR-8.3.1**: Instructors SHALL be able to:
- Upload course thumbnails
- Manage video files
- Add/remove resources
- Reorder lessons

**FR-8.3.2**: The system SHALL display storage usage per course.

### 3.9 Learner Dashboard

#### 3.9.1 Course Discovery

**FR-9.1.1**: The dashboard SHALL display:
- Featured courses
- Recommended courses (based on enrollment)
- Search and filter functionality
- Course categories

**FR-9.1.2**: Learners SHALL be able to:
- Browse all published courses
- Filter by category, difficulty, price
- Search by keyword
- View course previews

#### 3.9.2 My Courses

**FR-9.2.1**: The dashboard SHALL display enrolled courses with:
- Course thumbnail
- Progress indicator
- Last accessed date
- Continue learning button

**FR-9.2.2**: Learners SHALL be able to:
- Enroll in courses
- Unenroll from courses
- Access course content
- View progress

#### 3.9.3 Learning Progress

**FR-9.3.1**: The dashboard SHALL show:
- Overall learning statistics
- Courses in progress
- Completed courses
- Learning streak (future)

### 3.10 File Management and Storage

#### 3.10.1 S3 Integration

**FR-10.1.1**: The system SHALL use AWS S3 for:
- Video file storage
- Course thumbnails
- Resource files
- IDE project files (optional)

**FR-10.1.2**: The system SHALL generate presigned URLs for:
- Video playback (1 hour expiry)
- File downloads (15 minutes expiry)
- File uploads (5 minutes expiry)

**FR-10.1.3**: The system SHALL organize S3 objects by:
- Course folder: `course_{id}/`
- Videos: `course_{id}/videos/{filename}`
- Thumbnails: `course_{id}/thumbnails/{filename}`
- Resources: `course_{id}/resources/{filename}`

#### 3.10.2 Supabase Storage

**FR-10.2.1**: The system SHALL use Supabase Storage for:
- IDE code files (small files)
- User avatars
- Temporary uploads

**FR-10.2.2**: The system SHALL enforce storage quotas (future).

#### 3.10.3 File Upload

**FR-10.3.1**: The system SHALL support:
- Drag-and-drop upload
- File picker upload
- Progress indicators
- Multiple file selection

**FR-10.3.2**: The system SHALL validate:
- File type (MIME type check)
- File size (per file and total)
- File name (sanitization)

#### 3.10.4 Lambda Sync

**FR-10.4.1**: AWS Lambda SHALL trigger on S3 `ObjectCreated` events.

**FR-10.4.2**: Lambda SHALL:
- Extract lesson ID from S3 metadata
- Update `lessons.video_url` in Supabase
- Log success/failure to CloudWatch

**FR-10.4.3**: The system SHALL support bulk sync via CSV import.

---

## 4. External Interface Requirements

### 4.1 User Interfaces

#### 4.1.1 Web Application UI

**UI-1.1**: The application SHALL provide a responsive web interface with:

**Layout Components:**
- Header/Navbar: Logo, navigation links, user menu, search
- Footer: Links, copyright, social media
- Sidebar: Course navigation, file tree (in IDE)
- Main content area: Course content, IDE, dashboards

**Design System:**
- Color scheme: Dark mode (default) and light mode
- Typography: System fonts (San Francisco, Segoe UI, Roboto)
- Spacing: Consistent 4px grid system
- Components: Radix UI primitives, custom components

**Responsive Breakpoints:**
- Mobile: < 768px (limited IDE functionality)
- Tablet: 768px - 1024px (full functionality)
- Desktop: > 1024px (optimal experience)

#### 4.1.2 IDE Interface

**UI-1.2**: The IDE SHALL provide:
- VS Code-inspired interface
- Monaco Editor with syntax highlighting
- File tree sidebar
- Terminal panel (collapsible)
- Tab-based file navigation
- Status bar with metadata

**UI-1.3**: The IDE SHALL support keyboard shortcuts:
- `Ctrl/Cmd + S`: Save file
- `Ctrl/Cmd + R`: Run code
- `Ctrl/Cmd + P`: Quick file open
- `Ctrl/Cmd + \`: Toggle sidebar
- `Ctrl/Cmd + J`: Toggle terminal

#### 4.1.3 Video Player UI

**UI-1.4**: The video player SHALL include:
- Custom controls overlay
- Progress bar with seek functionality
- Play/pause button
- Volume slider
- Fullscreen button
- Playback speed selector
- Time display (current/total)

### 4.2 Hardware Interfaces

**HI-1**: The system SHALL operate on standard computing devices:
- Desktop computers (Windows, macOS, Linux)
- Laptops
- Tablets (iPad, Android tablets)
- Mobile devices (limited functionality)

**HI-2**: The system SHALL not require specialized hardware.

**HI-3**: Execution containers run on cloud infrastructure (EC2/Railway), not user devices.

### 4.3 Software Interfaces

#### 4.3.1 Supabase Integration

**SI-1.1**: The system SHALL interact with Supabase via:
- `@supabase/supabase-js` client library
- REST API endpoints
- Real-time subscriptions (PostgreSQL changes)

**SI-1.2**: Authentication SHALL use Supabase Auth:
- Email/password
- OAuth providers (Google, GitHub)
- JWT token management

**SI-1.3**: Database operations SHALL use:
- Supabase client (browser)
- Supabase server client (API routes)
- Row Level Security (RLS) policies

#### 4.3.2 AWS S3 Integration

**SI-2.1**: The system SHALL use AWS SDK v3:
- `@aws-sdk/client-s3`: S3 client
- `@aws-sdk/s3-request-presigner`: Presigned URL generation

**SI-2.2**: S3 operations SHALL include:
- `PutObject`: File upload
- `GetObject`: File download (via presigned URL)
- `ListObjectsV2`: File listing
- `DeleteObject`: File deletion

**SI-2.3**: Lambda function SHALL use:
- S3 EventBridge notifications
- Supabase service role key for database updates

#### 4.3.3 GitHub API Integration

**SI-3.1**: The system SHALL use GitHub REST API v3:
- OAuth authentication
- Repository cloning (via Git)
- Repository metadata retrieval

**SI-3.2**: GitHub operations SHALL include:
- User authentication (OAuth)
- Repository listing
- File content retrieval
- Repository forking (via Git commands)

#### 4.3.4 Docker Execution Engine

**SI-4.1**: The system SHALL interact with Docker via:
- Docker API (HTTP)
- Docker CLI (via Node.js child process)

**SI-4.2**: Container operations SHALL include:
- Container creation
- Code execution (stdin/stdout/stderr)
- Container lifecycle management
- Log streaming

### 4.4 Communication Interfaces

#### 4.4.1 HTTP/HTTPS

**CI-1.1**: All client-server communication SHALL use HTTPS (TLS 1.2+).

**CI-1.2**: API endpoints SHALL follow RESTful conventions:
- `GET`: Retrieve resources
- `POST`: Create resources
- `PUT/PATCH`: Update resources
- `DELETE`: Delete resources

**CI-1.3**: API responses SHALL use JSON format.

#### 4.4.2 WebSocket / Server-Sent Events

**CI-2.1**: Real-time features SHALL use:
- WebSocket for bidirectional communication (code execution output)
- Server-Sent Events (SSE) for one-way streaming (alternative)

**CI-2.2**: The system SHALL handle connection failures gracefully (reconnect logic).

#### 4.4.3 Real-time Subscriptions

**CI-3.1**: The system SHALL use Supabase real-time for:
- Database change notifications
- Collaborative features (future)

---

## 5. System Requirements

### 5.1 Functional Requirements

#### 5.1.1 Data Management

**FR-DM-1**: The system SHALL store user data in Supabase PostgreSQL:
- User profiles
- Courses and lessons
- Enrollments
- Progress tracking
- IDE projects and files

**FR-DM-2**: The system SHALL enforce data integrity:
- Foreign key constraints
- Unique constraints (email, course slugs)
- Not null constraints on required fields

**FR-DM-3**: The system SHALL support data backup:
- Daily automated backups (Supabase)
- Point-in-time recovery (Supabase)

#### 5.1.2 Error Handling

**FR-EH-1**: The system SHALL handle errors gracefully:
- Display user-friendly error messages
- Log errors for debugging
- Prevent application crashes

**FR-EH-2**: The system SHALL validate user input:
- Form validation (client-side and server-side)
- File upload validation
- API request validation

**FR-EH-3**: The system SHALL handle network failures:
- Retry logic for API calls
- Offline detection (future)
- Graceful degradation

#### 5.1.3 Security

**FR-SEC-1**: The system SHALL implement authentication:
- Secure password storage (bcrypt hashing)
- JWT token expiration (24 hours)
- Refresh token rotation

**FR-SEC-2**: The system SHALL enforce authorization:
- Role-based access control (RBAC)
- Row Level Security (RLS) policies
- API endpoint protection

**FR-SEC-3**: The system SHALL prevent security vulnerabilities:
- SQL injection prevention (parameterized queries)
- XSS prevention (input sanitization)
- CSRF protection (Next.js built-in)
- File upload validation

**FR-SEC-4**: The system SHALL sandbox code execution:
- No network access from containers
- Resource limits (CPU, memory)
- Isolated filesystem
- Time limits on execution

### 5.2 Performance Requirements

#### 5.2.1 Response Time

**PERF-1**: Page load time SHALL be:
- Initial page load: < 3 seconds
- Subsequent navigation: < 1 second
- API response time: < 500ms (p95)

**PERF-2**: Code execution SHALL have:
- Cold start: < 10 seconds
- Warm start: < 3 seconds
- Execution output streaming: < 100ms latency

**PERF-3**: Video playback SHALL:
- Start buffering within 2 seconds
- Support adaptive bitrate streaming (future)

#### 5.2.2 Throughput

**PERF-4**: The system SHALL support:
- 50 concurrent users (MVP)
- 100 concurrent code executions (with queue)
- 1000 API requests per minute per user

#### 5.2.3 Resource Usage

**PERF-5**: Client-side resource usage SHALL be:
- Initial bundle size: < 500 KB (gzipped)
- Total page size: < 2 MB
- Memory usage: < 200 MB (browser)

**PERF-6**: Server-side resource usage:
- Container memory: 512 MB per execution
- Container CPU: 1 vCPU per execution
- Database connections: Connection pooling (Supabase)

### 5.3 Security Requirements

#### 5.3.1 Authentication and Authorization

**SEC-1**: The system SHALL require authentication for:
- Accessing enrolled courses
- Creating/editing courses (instructors)
- Code execution
- File uploads

**SEC-2**: The system SHALL implement:
- Password complexity requirements (8+ characters)
- Session timeout (24 hours inactivity)
- Multi-factor authentication (future)

**SEC-3**: The system SHALL protect against:
- Brute force attacks (rate limiting)
- Session hijacking (secure cookies, HTTPS)
- Token theft (HTTP-only cookies)

#### 5.3.2 Data Protection

**SEC-4**: The system SHALL encrypt:
- Data in transit (TLS 1.2+)
- Data at rest (Supabase encryption, S3 encryption)
- Sensitive user data (passwords, tokens)

**SEC-5**: The system SHALL comply with:
- GDPR (right to access, deletion, portability)
- Data retention policies (user data deletion on request)

#### 5.3.3 Code Execution Security

**SEC-6**: Code execution containers SHALL:
- Run in isolated Docker containers
- Have no network access
- Have resource limits (CPU, memory, time)
- Be automatically destroyed after execution

**SEC-7**: The system SHALL prevent:
- Container escape
- Resource exhaustion attacks
- Malicious code execution (sandboxing)

### 5.4 Reliability Requirements

#### 5.4.1 Availability

**REL-1**: The system SHALL maintain:
- 99% uptime (MVP target)
- Graceful degradation during outages
- Health check endpoints

**REL-2**: The system SHALL handle:
- Database connection failures (retry logic)
- S3 service outages (error messages)
- Container execution failures (retry or error display)

#### 5.4.2 Fault Tolerance

**REL-3**: The system SHALL recover from:
- Application crashes (auto-restart)
- Database connection loss (reconnection)
- Container failures (new container provisioning)

**REL-4**: The system SHALL log:
- All errors (structured logging)
- Performance metrics
- Security events

### 5.5 Scalability Requirements

#### 5.5.1 Horizontal Scaling

**SCAL-1**: The system SHALL support:
- Multiple frontend instances (Next.js)
- Multiple execution servers (Docker hosts)
- Database read replicas (Supabase)

**SCAL-2**: The system SHALL handle:
- 50 concurrent users (MVP)
- 1000+ concurrent users (future)
- Auto-scaling execution containers

#### 5.5.2 Vertical Scaling

**SCAL-3**: The system SHALL support:
- Increased container resources (CPU, memory)
- Database performance optimization
- CDN for static assets

---

## 6. Non-Functional Requirements

### 6.1 Usability

#### 6.1.1 User Experience

**NFR-USE-1**: The interface SHALL be:
- Intuitive and easy to navigate
- Consistent across all pages
- Accessible (WCAG 2.1 Level AA - future)

**NFR-USE-2**: The system SHALL provide:
- Clear error messages
- Loading indicators
- Success confirmations
- Help tooltips (future)

**NFR-USE-3**: The IDE SHALL:
- Feel responsive (< 100ms input latency)
- Support common keyboard shortcuts
- Provide code autocomplete

#### 6.1.2 Documentation

**NFR-USE-4**: The system SHALL provide:
- User guide for learners
- Instructor guide for course creation
- API documentation (future)
- Video tutorials (future)

### 6.2 Maintainability

#### 6.2.1 Code Quality

**NFR-MAIN-1**: The codebase SHALL:
- Follow TypeScript best practices
- Use consistent code formatting (Prettier)
- Include code comments for complex logic
- Maintain test coverage > 70% (future)

**NFR-MAIN-2**: The system SHALL use:
- Modular architecture
- Reusable components
- Clear separation of concerns

#### 6.2.2 Monitoring and Logging

**NFR-MAIN-3**: The system SHALL include:
- Application logging (structured logs)
- Error tracking (Sentry or similar - future)
- Performance monitoring
- Usage analytics

### 6.3 Portability

#### 6.3.1 Browser Compatibility

**NFR-PORT-1**: The system SHALL support:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (limited)

#### 6.3.2 Deployment

**NFR-PORT-2**: The system SHALL be deployable on:
- Vercel (Next.js hosting)
- AWS (EC2, S3, Lambda)
- Railway (alternative execution host)
- Supabase (database and auth)

### 6.4 Compliance

#### 6.4.1 Data Protection

**NFR-COMP-1**: The system SHALL comply with:
- **GDPR**: European General Data Protection Regulation
  - Right to access personal data
  - Right to deletion
  - Right to data portability
  - Data breach notification
  - Privacy by design

**NFR-COMP-2**: The system SHALL implement:
- User consent for data collection
- Data minimization (collect only necessary data)
- Data retention policies
- Secure data deletion

#### 6.4.2 Accessibility

**NFR-COMP-3**: The system SHALL aim for:
- WCAG 2.1 Level AA compliance (future)
- Keyboard navigation support
- Screen reader compatibility (future)
- Color contrast requirements

#### 6.4.3 Age Restrictions

**NFR-COMP-4**: The system SHALL:
- Prohibit users under 13 (COPPA compliance)
- Require age verification during registration
- Enforce age-based content restrictions (future)

---

## 7. Appendices

### 7.1 Glossary

| Term | Definition |
|------|------------|
| **API** | Application Programming Interface - a set of protocols for building software |
| **Authentication** | Process of verifying user identity |
| **Authorization** | Process of determining user permissions |
| **CDN** | Content Delivery Network - distributed network for content delivery |
| **Container** | Isolated runtime environment using Docker |
| **Cold Start** | Initial container provisioning time |
| **Course** | A structured learning program with multiple lessons |
| **Docker** | Containerization platform for running isolated applications |
| **Ephemeral** | Short-lived, temporary (containers that auto-destroy) |
| **IDE** | Integrated Development Environment - code editor with tools |
| **JWT** | JSON Web Token - secure token for authentication |
| **Lambda** | AWS serverless function service |
| **Lesson** | Individual learning unit within a course |
| **Monaco Editor** | VS Code's editor core, used in browser |
| **OAuth** | Open Authorization protocol for third-party authentication |
| **Presigned URL** | Time-limited, secure URL for S3 object access |
| **RLS** | Row Level Security - database-level access control |
| **S3** | Amazon Simple Storage Service - cloud object storage |
| **Sandbox** | Isolated execution environment |
| **Supabase** | Open-source Firebase alternative (PostgreSQL + Auth) |
| **Warm Start** | Reusing existing container instance |

### 7.2 Data Models

#### 7.2.1 Database Schema Overview

**Core Tables:**

1. **profiles**
   - `id` (UUID, PK)
   - `user_type` (enum: 'learner', 'instructor', 'admin')
   - `full_name` (TEXT)
   - `avatar_url` (TEXT, nullable)
   - `onboarding_completed` (BOOLEAN)
   - `created_at` (TIMESTAMPTZ)
   - `updated_at` (TIMESTAMPTZ)

2. **courses**
   - `id` (UUID, PK)
   - `title` (TEXT, NOT NULL)
   - `description` (TEXT, nullable)
   - `instructor_id` (UUID, FK → profiles.id)
   - `thumbnail_url` (TEXT, nullable)
   - `price` (DECIMAL(10,2), default 0)
   - `is_published` (BOOLEAN, default FALSE)
   - `difficulty_level` (enum: 'beginner', 'intermediate', 'advanced')
   - `estimated_duration` (INTEGER, nullable)
   - `tags` (TEXT[])
   - `created_at` (TIMESTAMPTZ)
   - `updated_at` (TIMESTAMPTZ)

3. **lessons**
   - `id` (UUID, PK)
   - `course_id` (UUID, FK → courses.id)
   - `title` (TEXT, NOT NULL)
   - `description` (TEXT, nullable)
   - `video_url` (TEXT, nullable) - S3 key path
   - `duration` (INTEGER, nullable) - seconds
   - `order_index` (INTEGER)
   - `is_preview` (BOOLEAN, default FALSE)
   - `ide_project_id` (UUID, FK → ide_projects.id, nullable)
   - `created_at` (TIMESTAMPTZ)
   - `updated_at` (TIMESTAMPTZ)

4. **enrollments**
   - `id` (UUID, PK)
   - `user_id` (UUID, FK → profiles.id)
   - `course_id` (UUID, FK → courses.id)
   - `enrolled_at` (TIMESTAMPTZ)
   - `last_accessed_at` (TIMESTAMPTZ, nullable)
   - UNIQUE(user_id, course_id)

5. **lesson_progress**
   - `id` (UUID, PK)
   - `user_id` (UUID, FK → profiles.id)
   - `lesson_id` (UUID, FK → lessons.id)
   - `completed` (BOOLEAN, default FALSE)
   - `video_progress` (DECIMAL(5,2), nullable) - percentage 0-100
   - `time_spent` (INTEGER, nullable) - seconds
   - `last_accessed_at` (TIMESTAMPTZ)
   - UNIQUE(user_id, lesson_id)

6. **ide_projects**
   - `id` (UUID, PK)
   - `course_id` (UUID, FK → courses.id)
   - `lesson_id` (UUID, FK → lessons.id, nullable)
   - `name` (TEXT, NOT NULL)
   - `template` (TEXT, nullable) - template type
   - `entry_file` (TEXT, nullable)
   - `package_manager` (enum: 'npm', 'yarn', 'pnpm', 'pip', 'poetry', nullable)
   - `env_vars_ref` (UUID, nullable)
   - `created_at` (TIMESTAMPTZ)
   - `updated_at` (TIMESTAMPTZ)

7. **ide_files**
   - `id` (UUID, PK)
   - `project_id` (UUID, FK → ide_projects.id)
   - `path` (TEXT, NOT NULL) - file path relative to project root
   - `size_bytes` (BIGINT, nullable)
   - `content_type` (TEXT, nullable)
   - `storage` (enum: 'supabase', 's3')
   - `url` (TEXT, NOT NULL) - storage path or S3 key
   - `version` (INTEGER, default 1)
   - `checksum_sha256` (TEXT, nullable)
   - `is_binary` (BOOLEAN, default FALSE)
   - `is_executable` (BOOLEAN, default FALSE)
   - `created_at` (TIMESTAMPTZ)
   - `updated_at` (TIMESTAMPTZ)
   - UNIQUE(project_id, path, version)

#### 7.2.2 Data Relationships

```
profiles (1) ──< (many) courses
courses (1) ──< (many) lessons
courses (1) ──< (many) enrollments
profiles (1) ──< (many) enrollments
lessons (1) ──< (many) lesson_progress
profiles (1) ──< (many) lesson_progress
courses (1) ──< (many) ide_projects
lessons (0..1) ──< (many) ide_projects
ide_projects (1) ──< (many) ide_files
```

#### 7.2.3 S3 Storage Structure

```
s3://bucket-name/
├── course_{course_id}/
│   ├── videos/
│   │   ├── {filename}.mp4
│   │   └── ...
│   ├── thumbnails/
│   │   ├── {filename}.jpg
│   │   └── ...
│   └── resources/
│       ├── {filename}.pdf
│       └── ...
└── ide-code/
    └── {project_id}/
        └── {file_path}
```

### 7.3 API Specifications

#### 7.3.1 Authentication Endpoints

**POST `/api/auth/register`**
- **Description**: Register new user
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword",
    "name": "John Doe",
    "userType": "learner" | "instructor"
  }
  ```
- **Response**: `200 OK` with user object
- **Errors**: `400` (validation), `409` (email exists)

**POST `/api/auth/login`**
- **Description**: Authenticate user
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```
- **Response**: `200 OK` with JWT token
- **Errors**: `401` (invalid credentials)

**POST `/api/auth/logout`**
- **Description**: End user session
- **Response**: `200 OK`

#### 7.3.2 Course Endpoints

**GET `/api/courses`**
- **Description**: List published courses
- **Query Parameters**: `?category=`, `?difficulty=`, `?search=`
- **Response**: Array of course objects

**GET `/api/courses/[courseId]`**
- **Description**: Get course details
- **Response**: Course object with lessons

**POST `/api/courses`**
- **Description**: Create new course (Instructor only)
- **Request Body**: Course creation data
- **Response**: Created course object

**PUT `/api/courses/[courseId]`**
- **Description**: Update course (Owner only)
- **Request Body**: Course update data
- **Response**: Updated course object

**DELETE `/api/courses/[courseId]`**
- **Description**: Delete course (Owner only)
- **Response**: `200 OK`

**GET `/api/courses/[courseId]/lessons`**
- **Description**: Get lessons for a course
- **Response**: Array of lesson objects

**POST `/api/courses/[courseId]/lessons`**
- **Description**: Add lesson to course (Instructor only)
- **Request Body**: Lesson data
- **Response**: Created lesson object

#### 7.3.3 IDE Endpoints

**POST `/api/ide/projects`**
- **Description**: Create IDE project
- **Request Body**:
  ```json
  {
    "courseId": "uuid",
    "lessonId": "uuid",
    "name": "project-name",
    "template": "nodejs" | "python",
    "entryFile": "index.js",
    "packageManager": "npm"
  }
  ```
- **Response**: `{ projectId: "uuid" }`

**GET `/api/ide/projects/[projectId]`**
- **Description**: Get project details
- **Response**: Project object with files

**POST `/api/ide/projects/[projectId]/files/upload`**
- **Description**: Upload file to project
- **Request Body**:
  ```json
  {
    "path": "src/index.js",
    "contentBase64": "base64-encoded-content",
    "contentType": "text/javascript"
  }
  ```
- **Response**: File metadata with signed URL

**GET `/api/ide/projects/[projectId]/files`**
- **Description**: List project files
- **Response**: Array of file objects

**POST `/api/ide/projects/[projectId]/execute`**
- **Description**: Execute code in container
- **Request Body**:
  ```json
  {
    "command": "node index.js",
    "files": [{ "path": "index.js", "content": "..." }]
  }
  ```
- **Response**: WebSocket connection for streaming output

#### 7.3.4 Storage Endpoints

**POST `/api/s3-presign-upload`**
- **Description**: Generate presigned URL for S3 upload
- **Request Body**:
  ```json
  {
    "key": "course_123/videos/lesson1.mp4",
    "contentType": "video/mp4",
    "metadata": { "lesson-id": "uuid" }
  }
  ```
- **Response**: `{ url: "presigned-url", fields: {...} }`

**POST `/api/s3-presign-download`**
- **Description**: Generate presigned URL for S3 download
- **Request Body**:
  ```json
  {
    "key": "course_123/videos/lesson1.mp4"
  }
  ```
- **Response**: `{ url: "presigned-url", expiresIn: 3600 }`

**POST `/api/videos`**
- **Description**: Get video presigned URL
- **Request Body**:
  ```json
  {
    "lessonId": "uuid"
  }
  ```
- **Response**: `{ url: "presigned-url", expiresAt: "timestamp" }`

#### 7.3.5 Progress Endpoints

**GET `/api/courses/[courseId]/progress`**
- **Description**: Get user's progress for a course
- **Response**: Progress object with completion percentage

**POST `/api/lessons/[lessonId]/progress`**
- **Description**: Update lesson progress
- **Request Body**:
  ```json
  {
    "completed": true,
    "videoProgress": 85.5,
    "timeSpent": 1200
  }
  ```
- **Response**: Updated progress object

#### 7.3.6 Dashboard Endpoints

**GET `/api/dashboard/instructor`**
- **Description**: Get instructor dashboard data
- **Response**: Analytics and course list

**GET `/api/dashboard/learner`**
- **Description**: Get learner dashboard data
- **Response**: Enrolled courses and progress

#### 7.3.7 Error Response Format

All error responses follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

**Common HTTP Status Codes:**
- `200 OK`: Success
- `201 Created`: Resource created
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., duplicate)
- `500 Internal Server Error`: Server error

---

## Document Control

**Version History:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | January 2025 | Development Team | Initial SRS document |

**Approval:**

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Manager | | | |
| Technical Lead | | | |
| QA Lead | | | |

---

**End of Document**