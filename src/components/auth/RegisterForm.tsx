"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { User, Mail, Lock, Github, ArrowRight, Loader2, Sparkles, CheckCircle2, Briefcase, GraduationCap } from 'lucide-react';
import { FcGoogle } from "react-icons/fc";
import { useAuth } from '@/components/auth/useAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';

type UserRole = 'job_seeker' | 'employer';

export default function RegisterForm() {
  const [step, setStep] = useState<'details' | 'role'>('details');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    role?: string;
    terms?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [focusedField, setFocusedField] = useState<'name' | 'email' | 'password' | 'confirmPassword' | null>(null);
  const [formProgress, setFormProgress] = useState(0);
  const [generalError, setGeneralError] = useState('');
  
  const { register, loginWithGithub, loginWithGoogle } = useAuth();
  const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let progress = 0;
    if (step === 'details') {
      if (name) progress += 20;
      if (email && validateEmail(email)) progress += 20;
      if (password && password.length >= 6) progress += 20;
      if (confirmPassword && password === confirmPassword) progress += 20;
      if (acceptTerms) progress += 20;
    } else {
      progress = 80; // Base progress when on role step
      if (role) progress += 20;
    }
    setFormProgress(progress);
  }, [name, email, password, confirmPassword, acceptTerms, role, step]);

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const newErrors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
      terms?: string;
    } = {};
    
    if (!name) {
      newErrors.name = 'Name is required';
    }
    
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
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!acceptTerms) {
      newErrors.terms = 'You must accept the terms and conditions';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setStep('role');
  };

  const handleFinalSubmit = async () => {
    if (!role) {
      setErrors({ role: 'Please select your role' });
      return;
    }

    setIsLoading(true);
    setGeneralError('');
    
    try {
      await register(name, email, password, role);
      // Navigation is handled by the useAuth hook
    } catch (error: any) {
      console.error('Registration error:', error);
      setGeneralError(error.message || 'Registration failed. Please try again.');
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
    } catch (error: any) {
      console.error('GitHub login error:', error);
      setGeneralError(error.message || 'GitHub signup failed. Please try again.');
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
    } catch (error: any) {
      console.error('Google login error:', error);
      setGeneralError(error.message || 'Google signup failed. Please try again.');
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
            {step === 'details' ? 'Create your account' : 'Choose your role'}
          </motion.h1>
          <p className="text-gray-400">
            {step === 'details' 
              ? 'Join thousands of professionals advancing their careers'
              : 'Tell us how you plan to use SkillLink'
            }
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

        <AnimatePresence mode="wait" custom={step === 'role' ? 1 : -1}>
          {step === 'details' ? (
            <motion.div
              key="details"
              custom={-1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <form onSubmit={handleDetailsSubmit} className="space-y-5">
                {/* Name field */}
                <motion.div 
                  className="space-y-2"
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="relative">
                    <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                      focusedField === 'name' ? 'text-[#0CF2A0]' : 'text-gray-500'
                    } h-5 w-5`} />
                    <input
                      type="text"
                      placeholder="Full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      disabled={isAnyLoading}
                      className={`w-full bg-[#111111] border ${
                        errors.name ? 'border-red-500' : focusedField === 'name' ? 'border-[#0CF2A0]' : 'border-gray-700'
                      } rounded-lg py-3 pl-10 pr-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0CF2A0]/30 focus:border-[#0CF2A0] transition-all duration-200 disabled:opacity-50`}
                    />
                    <AnimatePresence>
                      {name && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          <CheckCircle2 className="h-4 w-4 text-[#0CF2A0]" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  {errors.name && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm"
                    >
                      {errors.name}
                    </motion.p>
                  )}
                </motion.div>

                {/* Email field */}
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
                    <AnimatePresence>
                      {email && validateEmail(email) && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          <CheckCircle2 className="h-4 w-4 text-[#0CF2A0]" />
                        </motion.div>
                      )}
                    </AnimatePresence>
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

                {/* Password field */}
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
                    <AnimatePresence>
                      {password && password.length >= 6 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          <CheckCircle2 className="h-4 w-4 text-[#0CF2A0]" />
                        </motion.div>
                      )}
                    </AnimatePresence>
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

                {/* Confirm Password field */}
                <motion.div 
                  className="space-y-2"
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="relative">
                    <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                      focusedField === 'confirmPassword' ? 'text-[#0CF2A0]' : 'text-gray-500'
                    } h-5 w-5`} />
                    <input
                      type="password"
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onFocus={() => setFocusedField('confirmPassword')}
                      onBlur={() => setFocusedField(null)}
                      disabled={isAnyLoading}
                      className={`w-full bg-[#111111] border ${
                        errors.confirmPassword ? 'border-red-500' : focusedField === 'confirmPassword' ? 'border-[#0CF2A0]' : 'border-gray-700'
                      } rounded-lg py-3 pl-10 pr-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0CF2A0]/30 focus:border-[#0CF2A0] transition-all duration-200 disabled:opacity-50`}
                    />
                    <AnimatePresence>
                      {confirmPassword && password === confirmPassword && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          <CheckCircle2 className="h-4 w-4 text-[#0CF2A0]" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  {errors.confirmPassword && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm"
                    >
                      {errors.confirmPassword}
                    </motion.p>
                  )}
                </motion.div>

                {/* Terms checkbox */}
                <motion.div 
                  className="space-y-2"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <label className="flex items-start space-x-2 cursor-pointer group">
                    <motion.input 
                      type="checkbox" 
                      checked={acceptTerms}
                      onChange={() => setAcceptTerms(!acceptTerms)}
                      disabled={isAnyLoading}
                      className="form-checkbox h-4 w-4 mt-0.5 rounded border-gray-700 bg-[#111111] text-[#0CF2A0] focus:ring-[#0CF2A0]/50 disabled:opacity-50"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    />
                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors duration-200">
                      I agree to the{' '}
                      <Link href="/terms" className="text-[#0CF2A0] hover:underline relative group">
                        <span>Terms of Service</span>
                        <motion.span
                          className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0CF2A0] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-200"
                          initial={false}
                        />
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-[#0CF2A0] hover:underline relative group">
                        <span>Privacy Policy</span>
                        <motion.span
                          className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0CF2A0] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-200"
                          initial={false}
                        />
                      </Link>
                    </span>
                  </label>
                  {errors.terms && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm"
                    >
                      {errors.terms}
                    </motion.p>
                  )}
                </motion.div>

                {/* Continue button */}
                <motion.button
                  type="submit"
                  disabled={isAnyLoading}
                  className="w-full flex items-center justify-center bg-[#0CF2A0] text-[#111111] rounded-lg py-3 font-medium hover:bg-[#0CF2A0]/90 transition-colors duration-200 disabled:opacity-70 relative overflow-hidden group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                  />
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                </motion.button>

                {/* Divider */}
                <div className="relative flex items-center justify-center mt-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700"></div>
                  </div>
                  <div className="relative z-10 px-4 bg-[#1a1a1a]">
                    <span className="text-sm text-gray-400">Or sign up with</span>
                  </div>
                </div>

                {/* OAuth buttons */}
                <div className="space-y-3">
                  {/* GitHub button */}
                  <motion.button
                    type="button"
                    onClick={handleGithubLogin}
                    disabled={isAnyLoading}
                    className="w-full flex items-center justify-center gap-2 bg-[#24292F] text-white rounded-lg py-3 font-medium hover:bg-[#24292F]/90 transition-colors duration-200 disabled:opacity-70 relative overflow-hidden group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                    />
                    {isGithubLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Github className="h-5 w-5" />
                    )}
                    <span className="relative z-10">Sign up with GitHub</span>
                  </motion.button>
                  {/* Google button */}
                  <motion.button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isAnyLoading}
                    className="w-full flex items-center justify-center gap-2 bg-white text-gray-900 rounded-lg py-3 font-medium hover:bg-gray-100 transition-colors duration-200 disabled:opacity-70 relative overflow-hidden group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gray-200/50 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                    />
                    {isGoogleLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <FcGoogle className="h-5 w-5" />
                    )}
                    <span className="relative z-10">Sign up with Google</span>
                  </motion.button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="role"
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Role selection */}
              <div className="space-y-4">
                <motion.button
                  type="button"
                  onClick={() => setRole('job_seeker')}
                  className={`w-full p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                    role === 'job_seeker' 
                      ? 'border-[#0CF2A0] bg-[#0CF2A0]/10' 
                      : 'border-gray-700 bg-[#111111] hover:border-gray-600'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${
                      role === 'job_seeker' ? 'bg-[#0CF2A0]/20' : 'bg-gray-800'
                    }`}>
                      <GraduationCap className={`h-6 w-6 ${
                        role === 'job_seeker' ? 'text-[#0CF2A0]' : 'text-gray-400'
                      }`} />
                    </div>
                    <div>
                      <h3 className={`font-semibold text-lg ${
                        role === 'job_seeker' ? 'text-[#0CF2A0]' : 'text-white'
                      }`}>
                        Job Seeker
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Looking for opportunities to advance your career
                      </p>
                    </div>
                  </div>
                </motion.button>

                <motion.button
                  type="button"
                  onClick={() => setRole('employer')}
                  className={`w-full p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                    role === 'employer' 
                      ? 'border-[#0CF2A0] bg-[#0CF2A0]/10' 
                      : 'border-gray-700 bg-[#111111] hover:border-gray-600'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${
                      role === 'employer' ? 'bg-[#0CF2A0]/20' : 'bg-gray-800'
                    }`}>
                      <Briefcase className={`h-6 w-6 ${
                        role === 'employer' ? 'text-[#0CF2A0]' : 'text-gray-400'
                      }`} />
                    </div>
                    <div>
                      <h3 className={`font-semibold text-lg ${
                        role === 'employer' ? 'text-[#0CF2A0]' : 'text-white'
                      }`}>
                        Employer
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Hire talented professionals for your organization
                      </p>
                    </div>
                  </div>
                </motion.button>
              </div>

              {errors.role && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm text-center"
                >
                  {errors.role}
                </motion.p>
              )}

              {/* Action buttons */}
              <div className="flex space-x-3">
                <motion.button
                  type="button"
                  onClick={() => setStep('details')}
                  disabled={isAnyLoading}
                  className="flex-1 flex items-center justify-center bg-gray-700 text-white rounded-lg py-3 font-medium hover:bg-gray-600 transition-colors duration-200 disabled:opacity-70"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Back
                </motion.button>

                <motion.button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={isLoading || !role}
                  className="flex-2 flex items-center justify-center bg-[#0CF2A0] text-[#111111] rounded-lg py-3 font-medium hover:bg-[#0CF2A0]/90 transition-colors duration-200 disabled:opacity-70 relative overflow-hidden group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                  />
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Sign in link */}
        <div className="mt-8 text-center">
          <p className="text-gray-400">
            Already have an account?{' '}
            <Link 
              href="/login" 
              className="text-[#0CF2A0] hover:underline font-medium relative group"
            >
              <span>Sign in</span>
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