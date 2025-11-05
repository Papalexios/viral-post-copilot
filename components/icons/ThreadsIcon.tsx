
import React from 'react';

export const ThreadsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20Z"></path>
        <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z"></path>
        <path d="M12 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z"></path>
    </svg>
);
