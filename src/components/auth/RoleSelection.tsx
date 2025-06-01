// src/components/auth/RoleSelection.tsx
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, Video, Award, Star, TrendingUp } from 'lucide-react';

interface RoleSelectionProps {
  onSelectRole: (role: 'instructor' | 'learner') => Promise<void>;
  loading?: boolean;
}

export default function RoleSelection({ onSelectRole, loading = false }: RoleSelectionProps) {
  const [selectedRole, setSelectedRole] = useState<'instructor' | 'learner' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRoleSelection = async (role: 'instructor' | 'learner') => {
    setSelectedRole(role);
    setIsSubmitting(true);
    
    try {
      await onSelectRole(role);
    } catch (error) {
      console.error('Error selecting role:', error);
      setSelectedRole(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Setting up your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to SkillLink!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Choose your role to get started with your learning or teaching journey
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Learner Card */}
          <Card 
            className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
              selectedRole === 'learner' 
                ? 'border-blue-500 shadow-lg transform scale-105' 
                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
            }`}
            onClick={() => !isSubmitting && handleRoleSelection('learner')}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-3 bg-blue-100 dark:bg-blue-900 rounded-full w-16 h-16 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                I&apos;m a Learner
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Discover new skills and advance your career
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-3">
                  <Video className="h-5 w-5 text-blue-600" />
                  <span className="text-gray-700 dark:text-gray-300">Access thousands of courses</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Award className="h-5 w-5 text-blue-600" />
                  <span className="text-gray-700 dark:text-gray-300">Earn certificates and badges</span>
                </div>
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span className="text-gray-700 dark:text-gray-300">Track your progress</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary">Learn at your pace</Badge>
                <Badge variant="secondary">Interactive content</Badge>
                <Badge variant="secondary">Community support</Badge>
              </div>

              <Button 
                className="w-full" 
                disabled={isSubmitting}
                variant={selectedRole === 'learner' ? 'default' : 'outline'}
              >
                {isSubmitting && selectedRole === 'learner' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Setting up...
                  </>
                ) : (
                  'Start Learning'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Instructor Card */}
          <Card 
            className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
              selectedRole === 'instructor' 
                ? 'border-purple-500 shadow-lg transform scale-105' 
                : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
            }`}
            onClick={() => !isSubmitting && handleRoleSelection('instructor')}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-3 bg-purple-100 dark:bg-purple-900 rounded-full w-16 h-16 flex items-center justify-center">
                <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                I&apos;m an Instructor
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Share your expertise and build your teaching business
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-3">
                  <Video className="h-5 w-5 text-purple-600" />
                  <span className="text-gray-700 dark:text-gray-300">Create engaging courses</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-purple-600" />
                  <span className="text-gray-700 dark:text-gray-300">Build your student community</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Star className="h-5 w-5 text-purple-600" />
                  <span className="text-gray-700 dark:text-gray-300">Earn from your knowledge</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary">Course builder</Badge>
                <Badge variant="secondary">Analytics dashboard</Badge>
                <Badge variant="secondary">Revenue tracking</Badge>
              </div>

              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700" 
                disabled={isSubmitting}
                variant={selectedRole === 'instructor' ? 'default' : 'outline'}
              >
                {isSubmitting && selectedRole === 'instructor' ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Setting up...
                  </>
                ) : (
                  'Start Teaching'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Don&apos;t worry, you can always change your role later in your account settings
          </p>
        </div>
      </div>
    </div>
  );
}