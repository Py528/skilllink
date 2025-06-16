"use client";

import { useState } from 'react';
import { CourseNavigation } from './course-navigation';
import { VideoPlayer } from './video-player';
import { LessonContent } from './lesson-content';
import { ThemeToggle } from '../../components/theme-toggle';
import { motion } from 'framer-motion';
import { useMediaQuery } from '../../hooks/use-media-query';


const COURSE_DATA = {
  title: "Advanced React Patterns",
  modules: [
    {
      id: 1,
      title: "Getting Started",
      lessons: [
        {
          id: 1,
          title: "Course Introduction",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          duration: "5:20",
          completed: true,
          content: {
            description: "Welcome to the Advanced React Patterns course! In this course, you'll learn how to build reusable and composable components using advanced React patterns.",
            codeSnippets: [
              {
                language: "jsx",
                code: "import React from 'react';\n\nfunction App() {\n  return <h1>Hello, Advanced React!</h1>;\n}\n\nexport default App;"
              }
            ],
            assignment: "Set up your development environment and create a new React project."
          }
        },
        {
          id: 2,
          title: "Prerequisites",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          duration: "8:45",
          completed: true,
          content: {
            description: "Before diving into advanced patterns, let's make sure you have a solid understanding of React fundamentals.",
            codeSnippets: [
              {
                language: "jsx",
                code: "// Basic React component\nfunction Counter() {\n  const [count, setCount] = useState(0);\n  \n  return (\n    <div>\n      <p>Count: {count}</p>\n      <button onClick={() => setCount(count + 1)}>Increment</button>\n    </div>\n  );\n}"
              }
            ],
            assignment: "Create a simple counter component with increment and decrement buttons."
          }
        }
      ]
    },
    {
      id: 2,
      title: "Component Composition",
      lessons: [
        {
          id: 3,
          title: "Compound Components",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          duration: "12:30",
          completed: false,
          content: {
            description: "Learn how to create compound components that share state implicitly.",
            codeSnippets: [
              {
                language: "jsx",
                code: "import React, { createContext, useContext, useState } from 'react';\n\nconst ToggleContext = createContext();\n\nfunction Toggle({ children }) {\n  const [on, setOn] = useState(false);\n  const toggle = () => setOn(!on);\n  \n  return (\n    <ToggleContext.Provider value={{ on, toggle }}>\n      {children}\n    </ToggleContext.Provider>\n  );\n}\n\nfunction ToggleOn({ children }) {\n  const { on } = useContext(ToggleContext);\n  return on ? children : null;\n}\n\nfunction ToggleOff({ children }) {\n  const { on } = useContext(ToggleContext);\n  return on ? null : children;\n}\n\nfunction ToggleButton() {\n  const { on, toggle } = useContext(ToggleContext);\n  return <button onClick={toggle}>{on ? 'ON' : 'OFF'}</button>;\n}\n\nToggle.On = ToggleOn;\nToggle.Off = ToggleOff;\nToggle.Button = ToggleButton;\n\nexport { Toggle };"
              }
            ],
            assignment: "Implement a compound component for a custom dropdown menu."
          }
        },
        {
          id: 4,
          title: "Render Props Pattern",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          duration: "15:15",
          completed: false,
          locked: true,
          content: {
            description: "The render props pattern is a powerful technique for sharing code between React components.",
            codeSnippets: [
              {
                language: "jsx",
                code: "import React, { useState } from 'react';\n\nfunction Toggle({ render }) {\n  const [on, setOn] = useState(false);\n  const toggle = () => setOn(!on);\n  \n  return render({ on, toggle });\n}\n\n// Usage\nfunction App() {\n  return (\n    <Toggle\n      render={({ on, toggle }) => (\n        <div>\n          {on ? 'The toggle is on' : 'The toggle is off'}\n          <button onClick={toggle}>Toggle</button>\n        </div>\n      )}\n    />\n  );\n}"
              }
            ],
            assignment: "Create a mouse position tracker using the render props pattern."
          }
        }
      ]
    },
    {
      id: 3,
      title: "State Management",
      lessons: [
        {
          id: 5,
          title: "Context API",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          duration: "18:22",
          completed: false,
          locked: true,
          content: {
            description: "Learn how to use the Context API for global state management.",
            codeSnippets: [
              {
                language: "jsx",
                code: "import React, { createContext, useContext, useReducer } from 'react';\n\n// Create a context\nconst ThemeContext = createContext();\n\n// Initial state\nconst initialState = { theme: 'light' };\n\n// Reducer function\nfunction themeReducer(state, action) {\n  switch (action.type) {\n    case 'TOGGLE_THEME':\n      return { theme: state.theme === 'light' ? 'dark' : 'light' };\n    default:\n      return state;\n  }\n}\n\n// Provider component\nfunction ThemeProvider({ children }) {\n  const [state, dispatch] = useReducer(themeReducer, initialState);\n  \n  return (\n    <ThemeContext.Provider value={{ state, dispatch }}>\n      {children}\n    </ThemeContext.Provider>\n  );\n}\n\n// Custom hook for consuming the context\nfunction useTheme() {\n  const context = useContext(ThemeContext);\n  if (context === undefined) {\n    throw new Error('useTheme must be used within a ThemeProvider');\n  }\n  return context;\n}\n\nexport { ThemeProvider, useTheme };"
              }
            ],
            assignment: "Implement a theme switcher using the Context API."
          }
        }
      ]
    }
  ]
};

export function CourseView() {
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const currentModule = COURSE_DATA.modules[currentModuleIndex];
  const currentLesson = currentModule.lessons[currentLessonIndex];

  const handleLessonCompletion = (moduleId: number, lessonId: number) => {
    // Mark the current lesson as completed
    const moduleIndex = COURSE_DATA.modules.findIndex(module => module.id === moduleId);
    const lessonIndex = COURSE_DATA.modules[moduleIndex].lessons.findIndex(lesson => lesson.id === lessonId);
    
    // In a real app, we would update this in a database
    COURSE_DATA.modules[moduleIndex].lessons[lessonIndex].completed = true;
    
    // Unlock the next lesson if available
    const nextLessonIndex = lessonIndex + 1;
    if (nextLessonIndex < COURSE_DATA.modules[moduleIndex].lessons.length) {
      if ('locked' in COURSE_DATA.modules[moduleIndex].lessons[nextLessonIndex]) {
        COURSE_DATA.modules[moduleIndex].lessons[nextLessonIndex].locked = false;
      }
    } else {
      // If this was the last lesson in the module, unlock the first lesson of the next module
      const nextModuleIndex = moduleIndex + 1;
      if (nextModuleIndex < COURSE_DATA.modules.length) {
        if (COURSE_DATA.modules[nextModuleIndex].lessons.length > 0) {
          if ('locked' in COURSE_DATA.modules[nextModuleIndex].lessons[0]) {
            COURSE_DATA.modules[nextModuleIndex].lessons[0].locked = false;
          }
        }
      }
    }
  };

  const handleSelectLesson = (moduleIndex: number, lessonIndex: number) => {
    const lesson = COURSE_DATA.modules[moduleIndex].lessons[lessonIndex];
    if (lesson.locked) return;
    
    setCurrentModuleIndex(moduleIndex);
    setCurrentLessonIndex(lessonIndex);
    
    if (isDesktop === false) {
      setShowMobileNav(false);
    }
  };

  const toggleMobileNav = () => {
    setShowMobileNav(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-background relative">
      <header className="h-16 border-b border-border flex items-center justify-between px-4 lg:px-8">
        <div className="flex items-center">
          <button 
            className="lg:hidden mr-4 p-2 rounded-md bg-secondary"
            onClick={toggleMobileNav}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold">{COURSE_DATA.title}</h1>
        </div>
        <ThemeToggle />
      </header>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
        {/* Navigation (only visible on desktop or when toggled on mobile) */}
        <motion.div 
          className={`lg:w-80 border-r border-border overflow-hidden ${showMobileNav ? 'fixed inset-0 z-50 bg-background' : 'hidden lg:block'}`}
          initial={{ width: isDesktop ? "20rem" : 0 }}
          animate={{ 
            width: isDesktop ? "20rem" : (showMobileNav ? "100%" : 0),
            opacity: isDesktop || showMobileNav ? 1 : 0
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <CourseNavigation 
            modules={COURSE_DATA.modules}
            currentModuleIndex={currentModuleIndex}
            currentLessonIndex={currentLessonIndex}
            onSelectLesson={handleSelectLesson}
            onClose={toggleMobileNav}
          />
        </motion.div>
        
        {/* Main content */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          {/* Video Player */}
          <motion.div 
            className="lg:w-3/5 h-64 lg:h-auto flex-shrink-0 bg-black"
            layoutId="video-container"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <VideoPlayer 
              url={currentLesson.videoUrl} 
              title={currentLesson.title} 
              onComplete={() => handleLessonCompletion(currentModule.id, currentLesson.id)}
            />
          </motion.div>
          
          {/* Content Panel */}
          <motion.div 
            className="flex-1 overflow-y-auto p-4 lg:p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <LessonContent 
              lesson={currentLesson}
              moduleTitle={currentModule.title}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}