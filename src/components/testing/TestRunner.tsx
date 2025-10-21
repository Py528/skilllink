'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, RotateCcw, CheckCircle, XCircle, 
  AlertTriangle, Clock, Code, Bug, Zap, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface TestResult {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  coverage?: number;
}

interface TestSuite {
  id: string;
  name: string;
  tests: TestResult[];
  status: 'pending' | 'running' | 'passed' | 'failed';
  duration: number;
}

interface TestRunnerProps {
  onRunTests: () => Promise<TestSuite[]>;
  onRunSingleTest: (testId: string) => Promise<TestResult>;
  onDebugTest: (testId: string) => void;
  className?: string;
}

export const TestRunner: React.FC<TestRunnerProps> = ({
  onRunTests,
  onRunSingleTest,
  onDebugTest,
  className
}) => {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedSuite, setSelectedSuite] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, TestResult[]>>({});
  const [coverage, setCoverage] = useState<number>(0);
  const [runTime, setRunTime] = useState<number>(0);

  const runAllTests = useCallback(async () => {
    setIsRunning(true);
    setRunTime(0);
    
    const startTime = Date.now();
    
    try {
      const suites = await onRunTests();
      setTestSuites(suites);
      
      // Calculate coverage
      const totalTests = suites.reduce((sum, suite) => sum + suite.tests.length, 0);
      const passedTests = suites.reduce((sum, suite) => 
        sum + suite.tests.filter(test => test.status === 'passed').length, 0
      );
      setCoverage((passedTests / totalTests) * 100);
      
      // Group test results by suite
      const results: Record<string, TestResult[]> = {};
      suites.forEach(suite => {
        results[suite.id] = suite.tests;
      });
      setTestResults(results);
      
    } catch (error) {
      console.error('Test run failed:', error);
    } finally {
      setRunTime(Date.now() - startTime);
      setIsRunning(false);
    }
  }, [onRunTests]);

  const runSingleTest = useCallback(async (testId: string) => {
    try {
      const result = await onRunSingleTest(testId);
      
      // Update the specific test result
      setTestResults(prev => {
        const newResults = { ...prev };
        Object.keys(newResults).forEach(suiteId => {
          const testIndex = newResults[suiteId].findIndex(test => test.id === testId);
          if (testIndex !== -1) {
            newResults[suiteId][testIndex] = result;
          }
        });
        return newResults;
      });
      
    } catch (error) {
      console.error('Single test run failed:', error);
    }
  }, [onRunSingleTest]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'running':
        return <Clock className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'skipped':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'running':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'skipped':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const totalTests = testSuites.reduce((sum, suite) => sum + suite.tests.length, 0);
  const passedTests = testSuites.reduce((sum, suite) => 
    sum + suite.tests.filter(test => test.status === 'passed').length, 0
  );
  const failedTests = testSuites.reduce((sum, suite) => 
    sum + suite.tests.filter(test => test.status === 'failed').length, 0
  );

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Test Runner</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Run and monitor your test suite
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={runAllTests}
            disabled={isRunning}
            className="flex items-center space-x-2"
          >
            {isRunning ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            <span>{isRunning ? 'Running...' : 'Run All Tests'}</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setTestSuites([])}
            disabled={isRunning}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      {/* Test Summary */}
      {testSuites.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <Code className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Total Tests</p>
                  <p className="text-2xl font-bold">{totalTests}</p>
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
                  <p className="text-sm font-medium">Passed</p>
                  <p className="text-2xl font-bold text-green-600">{passedTests}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-full">
                  <XCircle className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{failedTests}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <Shield className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Coverage</p>
                  <p className="text-2xl font-bold">{coverage.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Test Suites */}
      <div className="space-y-4">
        {testSuites.map((suite) => (
          <Card key={suite.id} className="overflow-hidden">
            <CardHeader
              className="cursor-pointer"
              onClick={() => setSelectedSuite(selectedSuite === suite.id ? null : suite.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(suite.status)}
                  <CardTitle className="text-lg">{suite.name}</CardTitle>
                  <Badge className={getStatusColor(suite.status)}>
                    {suite.status}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDuration(suite.duration)}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {suite.tests.length} tests
                  </span>
                </div>
              </div>
            </CardHeader>

            <AnimatePresence>
              {selectedSuite === suite.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {testResults[suite.id]?.map((test) => (
                        <div
                          key={test.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                        >
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(test.status)}
                            <span className="font-medium">{test.name}</span>
                            {test.coverage && (
                              <Badge variant="outline">
                                {test.coverage}% coverage
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {formatDuration(test.duration)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => runSingleTest(test.id)}
                              disabled={test.status === 'running'}
                            >
                              <Play className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDebugTest(test.id)}
                            >
                              <Bug className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        ))}
      </div>

      {/* Run Time */}
      {runTime > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Test Run Completed</span>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {formatDuration(runTime)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TestRunner;
