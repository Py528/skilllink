// Examples of content structure for different lesson types

export interface TextLessonContent {
  type: 'text';
  text: string;
  sections?: Array<{
    title: string;
    content: string;
  }>;
  formatting?: {
    allowHtml: boolean;
    allowMarkdown: boolean;
  };
}

export interface QuizLessonContent {
  type: 'quiz';
  title: string;
  description: string;
  questions: Array<{
    id: number;
    type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
    question: string;
    options?: string[];
    correctAnswer?: number | boolean | string;
    explanation?: string;
  }>;
  settings: {
    timeLimit?: number; // in seconds
    passingScore: number; // percentage
    allowRetake: boolean;
    showResults: boolean;
  };
}

export interface AssignmentLessonContent {
  type: 'assignment';
  title: string;
  description: string;
  instructions: string;
  requirements: string[];
  rubric: Array<{
    criterion: string;
    points: number;
    description: string;
  }>;
  submission: {
    type: 'file_upload' | 'text' | 'github_link';
    allowedFormats?: string[];
    maxFileSize?: string;
  };
  dueDate?: string;
}

export interface VideoLessonContent {
  type: 'video';
  transcript?: string;
  chapters?: Array<{
    time: number; // in seconds
    title: string;
  }>;
  notes?: string;
}

// Example content for each lesson type
export const contentExamples = {
  text: {
    type: 'text',
    text: `# Introduction to React

React is a JavaScript library for building user interfaces. It was developed by Facebook and is now one of the most popular frontend frameworks.

## Key Concepts

### Components
Components are the building blocks of React applications. They are reusable pieces of UI that can contain their own logic and styling.

### JSX
JSX is a syntax extension for JavaScript that allows you to write HTML-like code in your JavaScript files.

### State
State is data that can change over time and affects how a component renders.`,
    sections: [
      {
        title: "Introduction",
        content: "React is a JavaScript library for building user interfaces..."
      },
      {
        title: "Key Concepts",
        content: "Components, JSX, and State are fundamental concepts in React..."
      }
    ],
    formatting: {
      allowHtml: true,
      allowMarkdown: true
    }
  } as TextLessonContent,

  quiz: {
    type: 'quiz',
    title: 'React Fundamentals Quiz',
    description: 'Test your knowledge of React basics with this comprehensive quiz.',
    questions: [
      {
        id: 1,
        type: 'multiple_choice',
        question: 'What is the main purpose of React?',
        options: [
          'To create user interfaces',
          'To handle database operations',
          'To manage server-side logic',
          'To style web pages'
        ],
        correctAnswer: 0,
        explanation: 'React is primarily used for building user interfaces and creating interactive web applications.'
      },
      {
        id: 2,
        type: 'true_false',
        question: 'React components must always return JSX.',
        correctAnswer: false,
        explanation: 'React components can return null, strings, numbers, arrays, or JSX elements.'
      },
      {
        id: 3,
        type: 'short_answer',
        question: 'What hook would you use to manage state in a functional component?',
        correctAnswer: 'useState',
        explanation: 'The useState hook is used to add state to functional components.'
      }
    ],
    settings: {
      timeLimit: 600, // 10 minutes
      passingScore: 70,
      allowRetake: true,
      showResults: true
    }
  } as QuizLessonContent,

  assignment: {
    type: 'assignment',
    title: 'Build a Todo App',
    description: 'Create a simple todo application using React hooks and state management.',
    instructions: `In this assignment, you will build a todo application that demonstrates your understanding of React fundamentals.

## Requirements:
1. Create a new React project
2. Implement a todo list with add, delete, and toggle functionality
3. Use functional components with hooks
4. Add basic styling
5. Include error handling

## Steps:
1. Set up your development environment
2. Create the main App component
3. Implement the TodoList component
4. Add the TodoItem component
5. Implement state management with useState
6. Add styling and polish`,
    requirements: [
      'Use functional components with hooks',
      'Implement add, delete, and toggle functionality',
      'Store todos in local state',
      'Add basic styling with CSS',
      'Include error handling for edge cases',
      'Make the app responsive'
    ],
    rubric: [
      {
        criterion: 'Functionality',
        points: 40,
        description: 'All basic features work correctly (add, delete, toggle todos)'
      },
      {
        criterion: 'Code Quality',
        points: 30,
        description: 'Clean, readable, and well-structured code with proper component organization'
      },
      {
        criterion: 'Styling',
        points: 20,
        description: 'Basic styling and good user experience with responsive design'
      },
      {
        criterion: 'Documentation',
        points: 10,
        description: 'Clear comments, README, and code documentation'
      }
    ],
    submission: {
      type: 'github_link',
      allowedFormats: ['github_link', 'zip', 'rar'],
      maxFileSize: '10MB'
    },
    dueDate: '2024-01-15T23:59:59Z'
  } as AssignmentLessonContent,

  video: {
    type: 'video',
    transcript: `Welcome to this lesson on React fundamentals. In this video, we'll cover the basics of React including components, JSX, and state management.

Let's start by understanding what React is and why it's so popular for building user interfaces...`,
    chapters: [
      {
        time: 0,
        title: 'Introduction to React'
      },
      {
        time: 120,
        title: 'Setting up the development environment'
      },
      {
        time: 300,
        title: 'Creating your first component'
      },
      {
        time: 450,
        title: 'Understanding JSX'
      },
      {
        time: 600,
        title: 'State management with hooks'
      }
    ],
    notes: `Additional resources mentioned in the video:
- React Documentation: https://react.dev
- Create React App: https://create-react-app.dev
- React DevTools browser extension
- Code examples available in the resources section`
  } as VideoLessonContent
};

// Helper function to get default content for a lesson type
export function getDefaultContent(lessonType: string): any {
  switch (lessonType) {
    case 'text':
      return {
        type: 'text',
        text: '',
        sections: [],
        formatting: { allowHtml: true, allowMarkdown: true }
      };
    
    case 'quiz':
      return {
        type: 'quiz',
        title: '',
        description: '',
        questions: [],
        settings: {
          timeLimit: 600,
          passingScore: 70,
          allowRetake: true,
          showResults: true
        }
      };
    
    case 'assignment':
      return {
        type: 'assignment',
        title: '',
        description: '',
        instructions: '',
        requirements: [],
        rubric: [],
        submission: {
          type: 'file_upload',
          allowedFormats: ['zip', 'rar', 'github_link'],
          maxFileSize: '10MB'
        }
      };
    
    case 'video':
    default:
      return {
        type: 'video',
        transcript: '',
        chapters: [],
        notes: ''
      };
  }
} 