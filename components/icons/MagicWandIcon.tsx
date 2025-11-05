import React from 'react';

export const MagicWandIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 3l-5 5"></path>
    <path d="M13 8l5 5"></path>
    <path d="M21 21 12 12"></path>
    <path d="m3 3 3 3"></path>
    <path d="m18 21 3-3"></path>
    <path d="m3 15 3 3"></path>
    <path d="m21 9-3-3"></path>
  </svg>
);
