'use client';

import { useState } from 'react';

interface CommentWrapperProps {
  children: React.ReactNode;
  commentCount: number;
}

export function CommentWrapper({ children, commentCount }: CommentWrapperProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col">
      {/* Mobile Toggle Button */}
      <div className="lg:hidden mb-4">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 dark:bg-dark-800 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-700 transition-colors"
        >
            <span className="font-bold text-gray-900 dark:text-white">
                {isOpen ? 'Hide Comments' : `Show Comments (${commentCount})`}
            </span>
            <svg 
                className={`w-5 h-5 text-gray-500 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </button>
      </div>

      {/* Content */}
      <div className={`${isOpen ? 'block' : 'hidden'} lg:block`}>
          {children}
      </div>
    </div>
  );
}
