import React from 'react';

export const WordPressIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M11.72,13.92l-3-8.8L3.32,14.22A9.75,9.75,0,1,0,11.72,13.92ZM12,2a10,10,0,1,0,8.42,14.4L12,3.48,9.52,10.6l3.52,3.52,4-1.2-2.2-6.5Z"></path>
    <path d="M4.32,15.22l4.4,0L6.52,9.32,4.32,15.22Z"></path>
    <path d="M14.32,11.52,12.22,9l-1,3.1L15,14.62,14.32,11.52Z"></path>
  </svg>
);
