"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { User, Mail, Lock, Github, ArrowRight, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/components/auth/useAuth';
import { validateEmail } from '@/components/auth/authUtils';

export default function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [focusedField, setFocusedField] = useState<'name' | 'email' | 'password' | 'confirmPassword' | null>(null);
  const [formProgress, setFormProgress] = useState(0);
  
  const { register, loginWithGithub } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let progress = 0;
    if (name) progress += 25;
    if (email && validateEmail(email)) progress += 25;
    if (password && password.length >= 6) progress += 25;
    if (confirmPassword && password === confirmPassword) progress += 25;
    setFormProgress(progress);
  }, [name, email, password, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
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
    
    setIsLoading(true);
    
    try {
      await register(name, email, password);
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ email: 'This email is already registered' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGithub();
    } catch (error) {
      console.error('GitHub login error:', error);
    } finally {
      setIsLoading(false);
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
          <p className="text-gray-400">Join thousands of professionals advancing their careers</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
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
                className={`w-full bg-[#111111] border ${
                  errors.name ? 'border-red-500' : focusedField === 'name' ? 'border-[#0CF2A0]' : 'border-gray-700'
                } rounded-lg py-3 pl-10 pr-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0CF2A0]/30 focus:border-[#0CF2A0] transition-all duration-200`}
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
                className={`w-full bg-[#111111] border ${
                  errors.email ? 'border-red-500' : focusedField === 'email' ? 'border-[#0CF2A0]' : 'border-gray-700'
                } rounded-lg py-3 pl-10 pr-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0CF2A0]/30 focus:border-[#0CF2A0] transition-all duration-200`}
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
                className={`w-full bg-[#111111] border ${
                  errors.password ? 'border-red-500' : focusedField === 'password' ? 'border-[#0CF2A0]' : 'border-gray-700'
                } rounded-lg py-3 pl-10 pr-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0CF2A0]/30 focus:border-[#0CF2A0] transition-all duration-200`}
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
                className={`w-full bg-[#111111] border ${
                  errors.confirmPassword ? 'border-red-500' : focusedField === 'confirmPassword' ? 'border-[#0CF2A0]' : 'border-gray-700'
                } rounded-lg py-3 pl-10 pr-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0CF2A0]/30 focus:border-[#0CF2A0] transition-all duration-200`}
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
                className="form-checkbox h-4 w-4 mt-0.5 rounded border-gray-700 bg-[#111111] text-[#0CF2A0] focus:ring-[#0CF2A0]/50"
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
          
          {/* Submit button */}
          <motion.button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center bg-[#0CF2A0] text-[#111111] rounded-lg py-3 font-medium hover:bg-[#0CF2A0]/90 transition-colors duration-200 disabled:opacity-70 relative overflow-hidden group"
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
                Create account
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
              </>
            )}
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
          
          {/* GitHub button */}
          <motion.button
            type="button"
            onClick={handleGithubLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-[#24292F] text-white rounded-lg py-3 font-medium hover:bg-[#24292F]/90 transition-colors duration-200 disabled:opacity-70 relative overflow-hidden group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
            />
            <Github className="h-5 w-5" />
            <span className="relative z-10">Sign up with GitHub</span>
          </motion.button>
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