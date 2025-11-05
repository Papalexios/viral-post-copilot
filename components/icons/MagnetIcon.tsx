
import React from 'react';

export const MagnetIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 2l4 4"></path>
    <path d="M12 20v-4"></path>
    <path d="m6 6 4 4"></path>
    <path d="M12 20a8 8 0 0 0 8-8"></path>
    <path d="M12 20a8 8 0 0 1-8-8"></path>
    <path d="M4 12V6a2 2 0 0 1 2-2h4"></path>
    <path d="M14 4h4a2 2 0 0 1 2 2v6"></path>
  </svg>
);
