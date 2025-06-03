"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Mail, Lock, Github, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { FcGoogle } from "react-icons/fc";
import { useAuth } from '@/components/auth/useAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AuthError } from '@supabase/supabase-js';

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);
  const [generalError, setGeneralError] = useState('');
  
  const { login, loginWithGithub, loginWithGoogle } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setErrors({});
    setGeneralError('');
    
    const newErrors: {email?: string; password?: string} = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsLoading(true);
    
    try {
      await login(email, password);
      // Navigation is handled by the useAuth hook
    } catch (error) {
      console.error('Login error:', error);
      setGeneralError(error instanceof AuthError ? error.message : 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    if (isGithubLoading) return;
    
    setIsGithubLoading(true);
    setGeneralError('');
    
    try {
      await loginWithGithub();
      // Redirect is handled by Supabase OAuth flow
    } catch (error) {
      console.error('GitHub login error:', error);
      setGeneralError(error instanceof AuthError ? error.message : 'GitHub login failed. Please try again.');
      setIsGithubLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (isGoogleLoading) return;
    
    setIsGoogleLoading(true);
    setGeneralError('');
    
    try {
      await loginWithGoogle();
      // Redirect is handled by Supabase OAuth flow
    } catch (error) {
      console.error('Google login error:', error);
      setGeneralError(error instanceof AuthError ? error.message : 'Google login failed. Please try again.');
      setIsGoogleLoading(false);
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

  const isAnyLoading = isLoading || isGithubLoading || isGoogleLoading;
  
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
              <h2 className="text-2xl font-bold text-white">Welcome Back!</h2>
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
            Welcome back
          </motion.h1>
          <p className="text-gray-400">Sign in to your account to continue</p>
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
          <motion.div 
            className="space-y-2"
            whileTap={{ scale: 0.99 }}
          >
            <div className="relative">
              <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                focusedField === 'email' ? 'text-[#0CF2A0]' : 'text-gray-500'
              } h-5 w-5`} />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                disabled={isAnyLoading}
                className={`w-full bg-[#111111] border ${
                  errors.email ? 'border-red-500' : focusedField === 'email' ? 'border-[#0CF2A0]' : 'border-gray-700'
                } rounded-lg py-3 pl-10 pr-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0CF2A0]/30 focus:border-[#0CF2A0] transition-all duration-200 disabled:opacity-50`}
              />
              <motion.div
                initial={false}
                animate={{
                  opacity: focusedField === 'email' ? 1 : 0,
                  scale: focusedField === 'email' ? 1 : 0.8,
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <Sparkles className="h-4 w-4 text-[#0CF2A0]" />
              </motion.div>
            </div>
            {errors.email && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm"
              >
                {errors.email}
              </motion.p>
            )}
          </motion.div>
          
          <motion.div 
            className="space-y-2"
            whileTap={{ scale: 0.99 }}
          >
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                focusedField === 'password' ? 'text-[#0CF2A0]' : 'text-gray-500'
              } h-5 w-5`} />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                disabled={isAnyLoading}
                className={`w-full bg-[#111111] border ${
                  errors.password ? 'border-red-500' : focusedField === 'password' ? 'border-[#0CF2A0]' : 'border-gray-700'
                } rounded-lg py-3 pl-10 pr-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0CF2A0]/30 focus:border-[#0CF2A0] transition-all duration-200 disabled:opacity-50`}
              />
              <motion.div
                initial={false}
                animate={{
                  opacity: focusedField === 'password' ? 1 : 0,
                  scale: focusedField === 'password' ? 1 : 0.8,
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <Sparkles className="h-4 w-4 text-[#0CF2A0]" />
              </motion.div>
            </div>
            {errors.password && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm"
              >
                {errors.password}
              </motion.p>
            )}
          </motion.div>
          
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 cursor-pointer group">
              <motion.input 
                type="checkbox" 
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                disabled={isAnyLoading}
                className="form-checkbox h-4 w-4 rounded border-gray-700 bg-[#111111] text-[#0CF2A0] focus:ring-[#0CF2A0]/50 disabled:opacity-50"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              />
              <span className="text-sm text-gray-300 group-hover:text-[#0CF2A0] transition-colors duration-200">
                Remember me
              </span>
            </label>
            <Link 
              href="/forgot-password" 
              className="text-sm text-[#0CF2A0] hover:underline relative group"
            >
              <span>Forgot password?</span>
              <motion.span
                className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0CF2A0] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-200"
                initial={false}
              />
            </Link>
          </div>
          
          <motion.button
            type="submit"
            disabled={isAnyLoading}
            className="w-full flex items-center justify-center bg-[#0CF2A0] text-[#111111] rounded-lg py-3 font-medium hover:bg-[#0CF2A0]/90 transition-colors duration-200 disabled:opacity-70 relative overflow-hidden group"
            whileHover={{ scale: isAnyLoading ? 1 : 1.02 }}
            whileTap={{ scale: isAnyLoading ? 1 : 0.98 }}
          >
            <motion.div
              className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
            />
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Sign in
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
              </>
            )}
          </motion.button>
          
          <div className="relative flex items-center justify-center mt-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative z-10 px-4 bg-[#1a1a1a]">
              <span className="text-sm text-gray-400">Or continue with</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <motion.button
              type="button"
              onClick={handleGithubLogin}
              disabled={isAnyLoading}
              className="w-full flex items-center justify-center gap-2 bg-[#24292F] text-white rounded-lg py-3 font-medium hover:bg-[#24292F]/90 transition-colors duration-200 disabled:opacity-70 relative overflow-hidden group"
              whileHover={{ scale: isAnyLoading ? 1 : 1.02 }}
              whileTap={{ scale: isAnyLoading ? 1 : 0.98 }}
            >
              <motion.div
                className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
              />
              {isGithubLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Github className="h-5 w-5" />
              )}
              <span className="relative z-10">
                {isGithubLoading ? 'Connecting...' : 'Continue with GitHub'}
              </span>
            </motion.button>

            <motion.button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isAnyLoading}
              className="w-full flex items-center justify-center gap-2 bg-white text-gray-900 rounded-lg py-3 font-medium hover:bg-gray-50 transition-colors duration-200 disabled:opacity-70 relative overflow-hidden group"
              whileHover={{ scale: isAnyLoading ? 1 : 1.02 }}
              whileTap={{ scale: isAnyLoading ? 1 : 0.98 }}
            >
              <motion.div
                className="absolute inset-0 bg-gray-100/50 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
              />
              {isGoogleLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
              ) : (
                <FcGoogle className="h-5 w-5" />
              )}
              <span className="relative z-10">
                {isGoogleLoading ? 'Connecting...' : 'Continue with Google'}
              </span>
            </motion.button>
          </div>
        </form>
        
        <div className="mt-8 text-center">
          <p className="text-gray-400">
            Don&apos;t have an account?{' '}
            <Link 
              href="/register" 
              className="text-[#0CF2A0] hover:underline font-medium relative group"
            >
              <span>Sign up</span>
              <motion.span
                className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0CF2A0] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-200"
                initial={false}
              />
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}