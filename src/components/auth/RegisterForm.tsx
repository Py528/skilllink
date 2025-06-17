"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { User, Mail, Lock, Github, ArrowRight, Loader2, Sparkles, CheckCircle2, Briefcase, GraduationCap } from 'lucide-react';
import { FcGoogle } from "react-icons/fc";
import { useAuth } from '@/components/auth/useAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AlertCircle } from 'lucide-react';

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'instructor' | 'student';
}

interface FormError {
  field: keyof FormState;
  message: string;
}

export const RegisterForm: React.FC = () => {
  const router = useRouter();
  const [formState, setFormState] = useState<FormState>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });
  const [errors, setErrors] = useState<FormError[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormError[] = [];

    if (!formState.firstName) {
      newErrors.push({ field: 'firstName', message: 'First name is required' });
    }
    if (!formState.lastName) {
      newErrors.push({ field: 'lastName', message: 'Last name is required' });
    }
    if (!formState.email) {
      newErrors.push({ field: 'email', message: 'Email is required' });
    } else if (!/\S+@\S+\.\S+/.test(formState.email)) {
      newErrors.push({ field: 'email', message: 'Invalid email format' });
    }
    if (!formState.password) {
      newErrors.push({ field: 'password', message: 'Password is required' });
    } else if (formState.password.length < 6) {
      newErrors.push({ field: 'password', message: 'Password must be at least 6 characters' });
    }
    if (formState.password !== formState.confirmPassword) {
      newErrors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formState.email,
        password: formState.password,
        options: {
          data: {
            first_name: formState.firstName,
            last_name: formState.lastName,
            role: formState.role,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              first_name: formState.firstName,
              last_name: formState.lastName,
              role: formState.role,
            },
          ]);

        if (profileError) throw profileError;
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors([{ field: 'email', message: 'Registration failed. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const { register, loginWithGithub, loginWithGoogle } = useAuth();
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const [showWelcome, setShowWelcome] = useState(true);
  const [focusedField, setFocusedField] = useState<'name' | 'email' | 'password' | 'confirmPassword' | null>(null);
  const [formProgress, setFormProgress] = useState(0);
  const [generalError, setGeneralError] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let progress = 0;
    if (formState.firstName) progress += 20;
    if (formState.email && validateEmail(formState.email)) progress += 20;
    if (formState.password && formState.password.length >= 6) progress += 20;
    if (formState.confirmPassword && formState.password === formState.confirmPassword) progress += 20;
    setFormProgress(progress);
  }, [formState.firstName, formState.email, formState.password, formState.confirmPassword]);

  const handleGithubLogin = async () => {
    setGeneralError('');
    
    try {
      await loginWithGithub();
      // Redirect is handled by Supabase OAuth flow
    } catch (error: any) {
      console.error('GitHub login error:', error);
      setGeneralError(error.message || 'GitHub signup failed. Please try again.');
    }
  };

  const handleGoogleLogin = async () => {
    setGeneralError('');
    
    try {
      await loginWithGoogle();
      // Redirect is handled by Supabase OAuth flow
    } catch (error: any) {
      console.error('Google login error:', error);
      setGeneralError(error.message || 'Google signup failed. Please try again.');
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const welcomeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, scale: 1.2, transition: { duration: 0.3 } },
  };

  const sparkleVariants = {
    initial: { scale: 0, rotate: 0 },
    animate: { scale: 1, rotate: 360, transition: { duration: 0.5 } },
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  const isAnyLoading = isLoading || loginWithGithub.isLoading || loginWithGoogle.isLoading;
  
  return (
    <div className="relative w-full max-w-md">
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            variants={welcomeVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 flex items-center justify-center bg-[#1a1a1a]/90 backdrop-blur-lg rounded-xl z-50"
          >
            <motion.div 
              className="text-center"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div
                variants={sparkleVariants}
                initial="initial"
                animate="animate"
                className="inline-block mb-4 text-[#0CF2A0]"
              >
                <Sparkles size={40} />
              </motion.div>
              <h2 className="text-2xl font-bold text-white">Join SkillLink</h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        variants={formVariants}
        initial="hidden"
        animate="visible"
        className="bg-[#1a1a1a]/80 backdrop-blur-md p-8 rounded-xl border border-gray-800/50 shadow-xl"
      >
        {/* Progress bar */}
        <motion.div 
          className="h-1 bg-gray-700 rounded-full mb-8 overflow-hidden"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div 
            className="h-full bg-[#0CF2A0]"
            initial={{ width: 0 }}
            animate={{ width: `${formProgress}%` }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>

        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-6">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="mr-2"
            >
              <Sparkles className="w-7 h-7 text-[#0CF2A0]" />
            </motion.div>
            <span className="text-2xl font-bold text-white">SkillLink</span>
          </Link>
          <motion.h1 
            className="text-2xl font-bold text-white mb-2"
            animate={{ 
              color: focusedField ? ['#ffffff', '#0CF2A0', '#ffffff'] : '#ffffff'
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Create your account
          </motion.h1>
          <p className="text-gray-400">
            Join thousands of professionals advancing their careers
          </p>
        </div>

        {generalError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Alert variant="destructive" className="bg-red-900/20 border-red-500/50">
              <AlertDescription className="text-red-300">
                {generalError}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.map((error) => (
            <Alert variant="destructive" key={error.field}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          ))}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                type="text"
                value={formState.firstName}
                onChange={(e) => setFormState({ ...formState, firstName: e.target.value })}
                placeholder="Enter your first name"
                className="mt-1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                type="text"
                value={formState.lastName}
                onChange={(e) => setFormState({ ...formState, lastName: e.target.value })}
                placeholder="Enter your last name"
                className="mt-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formState.email}
              onChange={(e) => setFormState({ ...formState, email: e.target.value })}
              placeholder="Enter your email"
              className="mt-1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formState.password}
              onChange={(e) => setFormState({ ...formState, password: e.target.value })}
              placeholder="Enter your password"
              className="mt-1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formState.confirmPassword}
              onChange={(e) => setFormState({ ...formState, confirmPassword: e.target.value })}
              placeholder="Confirm your password"
              className="mt-1"
            />
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <RadioGroup
              value={formState.role}
              onValueChange={(value) => setFormState({ ...formState, role: value as FormState['role'] })}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="student" id="student" />
                <Label htmlFor="student">Student</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="instructor" id="instructor" />
                <Label htmlFor="instructor">Instructor</Label>
              </div>
            </RadioGroup>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>
        
        {/* Sign in link */}
        <div className="mt-8 text-center">
          <p className="text-gray-400">
            Already have an account?{' '}
            <Link 
              href="/login" 
              className="text-[#0CF2A0] hover:underline font-medium relative group"
            >
              <span>Sign in</span>
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};