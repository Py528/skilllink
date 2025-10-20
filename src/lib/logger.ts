/**
 * Logger utility for SkillLink
 * Provides structured logging with different levels and environment-aware output
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
  context?: string;
}

class Logger {
  private isDevelopment: boolean;
  private isProduction: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  private formatMessage(level: LogLevel, message: string, data?: any, context?: string): LogEntry {
    return {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      context,
    };
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) {
      return true; // Log everything in development
    }
    
    if (this.isProduction) {
      // In production, only log warnings and errors
      return level === 'warn' || level === 'error';
    }
    
    return true;
  }

  private output(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) {
      return;
    }

    const { level, message, data, timestamp, context } = entry;
    const prefix = `[${timestamp}] [${level.toUpperCase()}]${context ? ` [${context}]` : ''}`;
    
    switch (level) {
      case 'debug':
        if (this.isDevelopment) {
          console.log(prefix, message, data ? data : '');
        }
        break;
      case 'info':
        if (this.isDevelopment) {
          console.info(prefix, message, data ? data : '');
        }
        break;
      case 'warn':
        console.warn(prefix, message, data ? data : '');
        break;
      case 'error':
        console.error(prefix, message, data ? data : '');
        break;
    }
  }

  debug(message: string, data?: any, context?: string): void {
    this.output(this.formatMessage('debug', message, data, context));
  }

  info(message: string, data?: any, context?: string): void {
    this.output(this.formatMessage('info', message, data, context));
  }

  warn(message: string, data?: any, context?: string): void {
    this.output(this.formatMessage('warn', message, data, context));
  }

  error(message: string, data?: any, context?: string): void {
    this.output(this.formatMessage('error', message, data, context));
  }

  // Convenience methods for common use cases
  s3(message: string, data?: any): void {
    this.info(message, data, 'S3');
  }

  auth(message: string, data?: any): void {
    this.info(message, data, 'AUTH');
  }

  video(message: string, data?: any): void {
    this.info(message, data, 'VIDEO');
  }

  course(message: string, data?: any): void {
    this.info(message, data, 'COURSE');
  }

  api(message: string, data?: any): void {
    this.info(message, data, 'API');
  }
}

// Export singleton instance
export const logger = new Logger();

// Export types for use in other files
export type { LogLevel, LogEntry };
