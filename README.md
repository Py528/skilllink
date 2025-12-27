# SkillLink – Enterprise Learning Platform

**A modern, cloud-based learning management system built for scalability, performance, and real-world enterprise needs.**

---

## 🔄 Minimal S3 → Supabase Sync

**Minimal, deterministic workflow**: Lambda triggers on S3 ObjectCreated events and updates `lessons.video_url` directly. No heuristics, no webhooks, no filename inference.

### Architecture

- **Lambda**: `aws/lambdas/s3-lesson-sync/index.js`
  - Triggers on S3 `ObjectCreated` events
  - Updates `lessons.video_url` directly using `SUPABASE_SERVICE_ROLE_KEY`
  - Stores only the S3 key (e.g., `course_<folder>/videos/<filename>`)
  - Requires `lesson_id` to be provided via S3 object metadata (`x-amz-meta-lesson-id`)

- **Bulk Sync**: `tools/bulk-sync-lessons-from-csv.js`
  - Accepts CSV: `lesson_id,course_folder,filename`
  - Updates `lessons.video_url` explicitly

### Lambda Behavior

- Processes S3 ObjectCreated events
- Filters for video files only (`.mp4`, `.mov`, `.mkv`, `.webm`, `.avi`)
- Extracts `lesson_id` from S3 object metadata (`x-amz-meta-lesson-id` or `x-amz-meta-lesson_id`)
- Updates `lessons.video_url` with the S3 key (metadata not found = skipped, logged)
- Stores only the S3 key path; presigned URLs generated at playback time

### Deployment Steps

#### 1. Create Lambda Function

```bash
# Package the Lambda (if needed)
cd aws/lambdas/s3-lesson-sync
zip -r function.zip index.js node_modules/  # If using @supabase/supabase-js
```

Via AWS Console:
1. Go to Lambda → Create function
2. **Runtime**: Node.js 18.x or higher
3. **Code**: Upload `index.js` (or zip with dependencies)
4. **Environment variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (from Supabase dashboard → Settings → API)
5. **IAM Role**: Ensure the Lambda execution role has:
   - CloudWatch Logs write permissions (for logging)
   - Basic Lambda execution permissions

#### 2. Configure S3 → Lambda Trigger

**Option A: EventBridge (Recommended)**

1. Enable EventBridge notifications on your S3 bucket:
   ```bash
   aws s3api put-bucket-notification-configuration \
     --bucket your-bucket-name \
     --notification-configuration '{
       "EventBridgeConfiguration": {}
     }'
   ```

2. Create EventBridge rule:
   - Go to EventBridge → Rules → Create rule
   - **Event pattern**:
     ```json
     {
       "source": ["aws.s3"],
       "detail-type": ["Object Created"],
       "detail": {
         "bucket": {
           "name": ["your-bucket-name"]
         }
       }
     }
     ```
   - **Target**: Select your Lambda function
   - **Permissions**: EventBridge will automatically create necessary permissions

**Option B: Direct S3 Bucket Notification**

1. Go to S3 → Your bucket → Properties → Event notifications
2. Create event notification:
   - **Event type**: `ObjectCreated` → `Put`
   - **Destination**: Lambda function → Select your Lambda
   - **Prefix** (optional): `course_` or `course_*/videos/` to filter

#### 3. Verify CloudWatch Logs

- Go to CloudWatch → Log groups → `/aws/lambda/your-function-name`
- Check logs after uploading a test video file
- Look for: `Updated lesson <id> -> <s3-key>` or error messages

### Bulk Sync from CSV

**CSV Format** (no header, one row per lesson):
```
lesson_id,course_folder,filename
```

**Example**:
```
3e5f8f0c-1234-4bcd-ae2f-112233445566,course_1752811917716_0d5g65,01_introduction.mp4
a1b2c3d4-5678-90ef-ghij-klmnopqrstuv,course_1752811917716_0d5g65,02_basics.mp4
```

**Run**:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
node tools/bulk-sync-lessons-from-csv.js /path/to/lessons.csv
```

**Output**: Lists each updated lesson and a final summary (updated count, errors).

### Verification

#### 1. Single S3 File Test

1. Upload a video to S3 with metadata:
   ```bash
   aws s3 cp test-video.mp4 s3://your-bucket/course_test/videos/test.mp4 \
     --metadata "lesson-id=your-lesson-uuid"
   ```

2. Check Lambda logs in CloudWatch:
   - Should see: `Updated lesson <uuid> -> course_test/videos/test.mp4`

3. Query Supabase:
   ```sql
   SELECT id, title, video_url, updated_at 
   FROM lessons 
   WHERE id = 'your-lesson-uuid';
   ```
   - `video_url` should be: `course_test/videos/test.mp4`

#### 2. Bulk CSV Test

1. Create CSV file with test data:
   ```csv
   lesson-uuid-1,course_folder_1,video1.mp4
   lesson-uuid-2,course_folder_1,video2.mp4
   ```

2. Run bulk sync script (see above)

3. Verify in Supabase:
   ```sql
   SELECT id, title, video_url 
   FROM lessons 
   WHERE id IN ('lesson-uuid-1', 'lesson-uuid-2')
   ORDER BY updated_at DESC;
   ```

#### 3. Confirm DB Updates

```bash
# Using Supabase CLI or psql
psql "$SUPABASE_DB_URL" -c "
  SELECT id, title, video_url, updated_at 
  FROM lessons 
  WHERE video_url IS NOT NULL 
  ORDER BY updated_at DESC 
  LIMIT 20;
"
```

#### 4. Playback Test

1. In the app, navigate to a lesson with a `video_url`
2. Verify the video player loads the presigned URL
3. Check browser network tab: should see a presigned S3 URL (temporary, expires)
4. Video should play correctly

**Note**: The app's presigning logic should use the stored S3 key from `lessons.video_url` to generate temporary URLs at runtime.

### Troubleshooting

- **Lambda not triggering**: Check EventBridge/S3 notification configuration, Lambda permissions
- **"No lesson_id metadata provided"**: Ensure S3 upload includes `x-amz-meta-lesson-id` header
- **"Update failed"**: Check Supabase service role key, RLS policies, lesson ID exists
- **No logs**: Verify CloudWatch Logs permissions on Lambda execution role

---

## 🚀 Overview

**SkillLink** is an open-source enterprise learning platform designed to make corporate and institutional training more effective.  
It provides tools for **course creation**, **learner management**, and **performance analytics**, all powered by a scalable backend and a responsive, mobile-first frontend.

The goal of SkillLink is to give organizations and educators a flexible way to manage online learning — from employee onboarding to university-level e-learning programs.

---

## ✨ Features

### 🎓 Learning Experience
- Interactive video player with progress tracking and playback controls  
- Support for downloadable content and offline access  
- Mobile-first responsive UI built with modern web tech  
- Accessibility-friendly design (WCAG compliant)

### 👩‍🏫 Instructor & Admin Tools
- Drag-and-drop course builder  
- Content management for lessons, resources, and assessments  
- Analytics dashboard to monitor learner engagement and progress  
- Role-based permissions for admins, instructors, and learners  

### 🏢 Enterprise Capabilities
- Multi-tenant architecture for large organizations  
- Secure API integrations for HR and LMS systems  
- Reporting and insights for performance tracking  
- Scalable infrastructure designed for high concurrency  

---

## 🧠 Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | Next.js 15, TypeScript, Tailwind CSS |
| **Backend** | Node.js, Supabase |
| **Database** | PostgreSQL (with real-time features) |
| **Storage** | AWS S3 |
| **Infrastructure** | AWS + global CDN |
| **Auth & Security** | Supabase Auth, JWT, HTTPS, role-based access control |

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL database
- Supabase project
- AWS S3 credentials (for file uploads)

### Installation

# Clone the repository
git clone https://github.com/Py528/skilllink.git

# Navigate into the project directory
cd skilllink

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Run the development server
npm run dev

Once running, open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 📈 Roadmap

* [ ] Add certificate generation
* [ ] Implement discussion forums
* [ ] Improve analytics visualization
* [ ] Add support for SCORM/xAPI content
* [ ] Mobile app (React Native)

---

## 🧩 Contributing

Contributions are welcome!
Please fork the repo and create a pull request with your proposed changes.

1. Fork the project
2. Create a new branch (`feature/awesome-feature`)
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 🔒 Security

* Data encrypted at rest and in transit
* Compliant with GDPR and SOC 2 principles
* Regular dependency audits
* Role-based access with logging and permissions

---

## 📬 Contact

For support, feedback, or collaboration:

**Author:** [@Py528](https://github.com/Py528)
**Email:** [pranaav.shinde5280@gmail.com](mailto:pranaav.shinde5280@gmail.com)
**Website:** [https://skilllink.com](https://skilllink.com)

---

**SkillLink** © 2025 – Open-source enterprise learning platform.
