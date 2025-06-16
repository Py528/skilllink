"use client";

import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Book, Code, FileText } from 'lucide-react';
import { CodeSnippet } from './code-snippet';

type LessonContentProps = {
  lesson: {
    id: number;
    title: string;
    content: {
      description: string;
      codeSnippets: { language: string; code: string }[];
      assignment: string;
    };
  };
  moduleTitle: string;
};

export function LessonContent({ lesson, moduleTitle }: LessonContentProps) {
  const { title, content } = lesson;
  const { description, codeSnippets, assignment } = content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      key={lesson.id}
      className="space-y-6"
    >
      <div>
        <p className="text-sm text-muted-foreground">{moduleTitle}</p>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      </div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="content" className="flex items-center gap-2">
            <Book size={16} />
            <span className="hidden sm:inline">Content</span>
          </TabsTrigger>
          <TabsTrigger value="code" className="flex items-center gap-2">
            <Code size={16} />
            <span className="hidden sm:inline">Code</span>
          </TabsTrigger>
          <TabsTrigger value="assignment" className="flex items-center gap-2">
            <FileText size={16} />
            <span className="hidden sm:inline">Assignment</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lesson Description</CardTitle>
              <CardDescription>Key concepts and learning objectives</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p>{description}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="code" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Code Examples</CardTitle>
              <CardDescription>Reference implementations for this lesson</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {codeSnippets.map((snippet, index) => (
                <CodeSnippet 
                  key={index} 
                  language={snippet.language} 
                  code={snippet.code} 
                />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Practice Assignment</CardTitle>
              <CardDescription>Apply what you&apos;ve learned</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>{assignment}</p>
              <div className="flex justify-end">
                <Button>Submit Assignment</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}