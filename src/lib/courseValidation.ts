'use client';

import { CourseData, Module } from '@/types/index';

export interface ValidationError {
  field: string;
  message: string;
  step: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export class CourseValidationService {
  static validateBasicInfo(data: Partial<CourseData>): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Required fields
    if (!data.title?.trim()) {
      errors.push({
        field: 'title',
        message: 'Course title is required',
        step: 1
      });
    } else if (data.title.length < 10) {
      warnings.push({
        field: 'title',
        message: 'Consider a more descriptive title (10+ characters)',
        step: 1
      });
    }

    if (!data.description?.trim()) {
      errors.push({
        field: 'description',
        message: 'Course description is required',
        step: 1
      });
    } else if (data.description.length < 50) {
      warnings.push({
        field: 'description',
        message: 'Description should be at least 50 characters for better SEO',
        step: 1
      });
    }

    if (!data.category) {
      errors.push({
        field: 'category',
        message: 'Course category is required',
        step: 1
      });
    }

    if (!data.level) {
      errors.push({
        field: 'level',
        message: 'Course level is required',
        step: 1
      });
    }

    // SEO optimization
    if (data.title && data.title.length > 60) {
      warnings.push({
        field: 'title',
        message: 'Title should be under 60 characters for better SEO',
        step: 1
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validateContent(data: Partial<CourseData>): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    if (!data.modules || data.modules.length === 0) {
      errors.push({
        field: 'modules',
        message: 'At least one module is required',
        step: 2
      });
    } else {
      // Validate each module
      data.modules.forEach((module, moduleIndex) => {
        if (!module.title?.trim()) {
          errors.push({
            field: `modules[${moduleIndex}].title`,
            message: `Module ${moduleIndex + 1} title is required`,
            step: 2
          });
        }

        if (!module.lessons || module.lessons.length === 0) {
          errors.push({
            field: `modules[${moduleIndex}].lessons`,
            message: `Module ${moduleIndex + 1} must have at least one lesson`,
            step: 2
          });
        } else {
          // Validate each lesson
          module.lessons.forEach((lesson, lessonIndex) => {
            if (!lesson.title?.trim()) {
              errors.push({
                field: `modules[${moduleIndex}].lessons[${lessonIndex}].title`,
                message: `Lesson ${lessonIndex + 1} in Module ${moduleIndex + 1} needs a title`,
                step: 2
              });
            }

            if (!lesson.video_url && !lesson.videoFile) {
              errors.push({
                field: `modules[${moduleIndex}].lessons[${lessonIndex}].video`,
                message: `Lesson ${lessonIndex + 1} in Module ${moduleIndex + 1} needs a video`,
                step: 2
              });
            }

            if (!lesson.description?.trim()) {
              warnings.push({
                field: `modules[${moduleIndex}].lessons[${lessonIndex}].description`,
                message: `Lesson ${lessonIndex + 1} description helps students understand what they'll learn`,
                step: 2
              });
            }
          });
        }
      });

      // Check total content duration
      const totalDuration = this.calculateTotalDuration(data.modules);
      if (totalDuration < 30) {
        warnings.push({
          field: 'duration',
          message: 'Consider adding more content (minimum 30 minutes recommended)',
          step: 2
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validatePricing(data: Partial<CourseData>): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    if (data.is_paid === undefined) {
      errors.push({
        field: 'is_paid',
        message: 'Please specify if this is a paid or free course',
        step: 3
      });
    }

    if (data.is_paid) {
      if (!data.price || data.price <= 0) {
        errors.push({
          field: 'price',
          message: 'Price must be greater than $0 for paid courses',
          step: 3
        });
      } else if (data.price < 9.99) {
        warnings.push({
          field: 'price',
          message: 'Consider pricing at $9.99+ for better perceived value',
          step: 3
        });
      }

      if (!data.preview_lessons || data.preview_lessons.length === 0) {
        warnings.push({
          field: 'preview_lessons',
          message: 'Free preview lessons help increase conversions',
          step: 3
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validateAll(data: Partial<CourseData>): ValidationResult {
    const basicValidation = this.validateBasicInfo(data);
    const contentValidation = this.validateContent(data);
    const pricingValidation = this.validatePricing(data);

    const allErrors = [
      ...basicValidation.errors,
      ...contentValidation.errors,
      ...pricingValidation.errors
    ];

    const allWarnings = [
      ...basicValidation.warnings,
      ...contentValidation.warnings,
      ...pricingValidation.warnings
    ];

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings
    };
  }

  private static calculateTotalDuration(modules: Module[]): number {
    return modules.reduce((total, module) => {
      return total + module.lessons.reduce((moduleTotal, lesson) => {
        return moduleTotal + (lesson.duration || 0);
      }, 0);
    }, 0);
  }

  static getStepValidation(data: Partial<CourseData>, step: number): ValidationResult {
    switch (step) {
      case 1:
        return this.validateBasicInfo(data);
      case 2:
        return this.validateContent(data);
      case 3:
        return this.validatePricing(data);
      default:
        return { isValid: true, errors: [], warnings: [] };
    }
  }

  static getCompletionPercentage(data: Partial<CourseData>): number {
    let completed = 0;
    let total = 0;

    // Basic info (40% weight)
    total += 40;
    if (data.title?.trim()) completed += 10;
    if (data.description?.trim()) completed += 10;
    if (data.category) completed += 10;
    if (data.level) completed += 10;

    // Content (40% weight)
    total += 40;
    if (data.modules && data.modules.length > 0) {
      completed += 20;
      const hasLessons = data.modules.some(m => m.lessons && m.lessons.length > 0);
      if (hasLessons) completed += 20;
    }

    // Pricing (20% weight)
    total += 20;
    if (data.is_paid !== undefined) {
      completed += 10;
      if (data.is_paid === false || (data.is_paid && data.price && data.price > 0)) {
        completed += 10;
      }
    }

    return Math.round((completed / total) * 100);
  }
}

