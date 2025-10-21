'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wifi, WifiOff, CheckCircle, AlertCircle, 
  RefreshCw, Cloud, CloudOff, Database, RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { enhancedToast } from '@/components/ui/enhanced-toast';

interface OfflineData {
  courses: Record<string, unknown>[];
  progress: Record<string, unknown>[];
  userActions: Record<string, unknown>[];
  lastRotateCcw: string;
}

interface OfflineSupportProps {
  onRotateCcw: () => Promise<void>;
  // onDownloadCourse: (courseId: string) => Promise<void>;
  className?: string;
}

export const OfflineSupport: React.FC<OfflineSupportProps> = ({
  onRotateCcw,
  // onDownloadCourse,
  className
}) => {
  const [isOnline, setIsOnline] = useState(true);
  const [offlineData, setOfflineData] = useState<OfflineData>({
    courses: [],
    progress: [],
    userActions: [],
    lastRotateCcw: ''
  });
  const [isRotateCcwing, setIsRotateCcwing] = useState(false);
  // const [downloadProgress, setDownloadProgress] = useState<Record<string, number>>({});
  const [showOfflineIndicator, setShowOfflineIndicator] = useState(false);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineIndicator(false);
      enhancedToast.success('You are back online!');
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineIndicator(true);
      enhancedToast.warning('You are offline. Some features may be limited.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial status
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getStoredData = useCallback((db: IDBDatabase, storeName: string) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }, []);

  const openDB = useCallback(() => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('skilllink-offline', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('courses')) {
          db.createObjectStore('courses', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('progress')) {
          db.createObjectStore('progress', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('userActions')) {
          db.createObjectStore('userActions', { keyPath: 'id' });
        }
      };
    });
  }, []);

  const loadOfflineData = useCallback(async () => {
    try {
      if ('indexedDB' in window) {
        const db = await openDB() as IDBDatabase;
        const courses = await getStoredData(db, 'courses');
        const progress = await getStoredData(db, 'progress');
        const userActions = await getStoredData(db, 'userActions');
        
        setOfflineData({
          courses: (courses as Record<string, unknown>[]) || [],
          progress: (progress as Record<string, unknown>[]) || [],
          userActions: (userActions as Record<string, unknown>[]) || [],
          lastRotateCcw: localStorage.getItem('lastRotateCcw') || ''
        });
      }
    } catch (error) {
      console.error('Failed to load offline data:', error);
    }
  }, [getStoredData, openDB]);

  // Load offline data
  useEffect(() => {
    loadOfflineData();
  }, [loadOfflineData]);

  // const storeData = useCallback(async (storeName: string, data: Record<string, unknown>) => {
  //   try {
  //     const db = await openDB();
  //     const transaction = db.transaction([storeName], 'readwrite');
  //     const store = transaction.objectStore(storeName);
  //     await store.put(data);
  //   } catch (error) {
  //     console.error('Failed to store data:', error);
  //   }
  // }, [openDB]);

  const handleRotateCcw = useCallback(async () => {
    if (!isOnline) {
      enhancedToast.error('Cannot sync while offline');
      return;
    }

    setIsRotateCcwing(true);
    
    try {
      await onRotateCcw();
      
      // Update last sync time
      const now = new Date().toISOString();
      localStorage.setItem('lastRotateCcw', now);
      
      setOfflineData(prev => ({
        ...prev,
        lastRotateCcw: now
      }));
      
      enhancedToast.success('Data synced successfully!');
    } catch {
      enhancedToast.error('Failed to sync data. Please try again.');
    } finally {
      setIsRotateCcwing(false);
    }
  }, [isOnline, onRotateCcw]);

  // const handleDownloadCourse = useCallback(async (courseId: string) => {
  //   if (!isOnline) {
  //     enhancedToast.error('Cannot download while offline');
  //     return;
  //   }

  //   setDownloadProgress(prev => ({ ...prev, [courseId]: 0 }));
    
  //   try {
  //     // Simulate download progress
  //     for (let i = 0; i <= 100; i += 10) {
  //       setDownloadProgress(prev => ({ ...prev, [courseId]: i }));
  //       await new Promise(resolve => setTimeout(resolve, 100));
  //     }
      
  //     await onDownloadCourse(courseId);
      
  //     // Store course data for offline access
  //     const courseData = {
  //       id: courseId,
  //       downloadedAt: new Date().toISOString(),
  //       status: 'downloaded'
  //     };
      
  //     await storeData('courses', courseData);
  //     await loadOfflineData();
      
  //     enhancedToast.success('Course downloaded for offline access!');
  //   } catch (error) {
  //     enhancedToast.error('Failed to download course');
  //   } finally {
  //     setDownloadProgress(prev => {
  //       const newProgress = { ...prev };
  //       delete newProgress[courseId];
  //       return newProgress;
  //     });
  //   }
  // }, [isOnline, onDownloadCourse, storeData, loadOfflineData]);

  const formatLastRotateCcw = useCallback((timestamp: string) => {
    if (!timestamp) return 'Never';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  }, []);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Online/Offline Indicator */}
      <AnimatePresence>
        {showOfflineIndicator && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white p-3 text-center"
          >
            <div className="flex items-center justify-center space-x-2">
              <WifiOff className="h-4 w-4" />
              <span className="font-medium">You are offline. Some features may be limited.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offline Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-green-600" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-600" />
            )}
            <span>Connection Status</span>
            <Badge variant={isOnline ? 'default' : 'destructive'}>
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Last sync: {formatLastRotateCcw(offlineData.lastRotateCcw)}
              </span>
              <Button
                onClick={handleRotateCcw}
                disabled={!isOnline || isRotateCcwing}
                size="sm"
                className="flex items-center space-x-2"
              >
                {isRotateCcwing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RotateCcw className="h-4 w-4" />
                )}
                <span>{isRotateCcwing ? 'RotateCcwing...' : 'RotateCcw Now'}</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Offline Data Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Database className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Offline Courses</p>
                <p className="text-2xl font-bold">{offlineData.courses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Progress Saved</p>
                <p className="text-2xl font-bold">{offlineData.progress.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full">
                <Cloud className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Pending Actions</p>
                <p className="text-2xl font-bold">{offlineData.userActions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Download Progress */}
      {/* {Object.keys(downloadProgress).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Download className="h-5 w-5" />
              <span>Download Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(downloadProgress).map(([courseId, progress]) => (
                <div key={courseId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Course {courseId}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )} */}

      {/* Offline Features Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CloudOff className="h-5 w-5" />
            <span>Offline Features</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">View downloaded courses</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Track learning progress</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Take notes and bookmarks</span>
            </div>
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <span className="text-sm">Limited video streaming</span>
            </div>
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <span className="text-sm">No real-time updates</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OfflineSupport;
