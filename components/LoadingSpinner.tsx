
import React from 'react';

interface LoadingSpinnerProps {
  message: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => (
  <div className="flex flex-col items-center justify-center my-12 animate-fade-in" aria-live="polite">
    <div className="relative w-20 h-20">
      <div className="absolute inset-0 border-4 border-green-400/30 rounded-full animate-pulse"></div>
      <div className="absolute inset-0 border-4 border-transparent border-t-green-400 rounded-full animate-spin"></div>
    </div>
    <p className="mt-6 text-lg text-slate-300 tracking-wider text-center transition-opacity duration-500">
      {message}
    </p>
  </div>
);