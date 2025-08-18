
import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { HistoryIcon } from './icons/HistoryIcon';
import { KeyIcon } from './icons/KeyIcon';
import { PublishIcon } from './icons/PublishIcon';

interface HeaderProps {
    onToggleHistory: () => void;
    onToggleApiConfig: () => void;
    onToggleWordPressConfig: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleHistory, onToggleApiConfig, onToggleWordPressConfig }) => (
  <header className="relative text-center py-4 sm:py-6 border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
    <div className="flex justify-center items-center gap-2 sm:gap-4">
       <SparklesIcon className="w-8 h-8 sm:w-10 sm:h-10 text-purple-400" />
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400">
        Viral Post Co-pilot
      </h1>
       <SparklesIcon className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-400" />
    </div>
    <p className="mt-2 sm:mt-3 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto px-2">
      Your strategic AI partner for creating high-impact, viral social media campaigns.
    </p>
     <div className="absolute top-4 right-4 hidden md:flex items-center gap-2">
        <button
          onClick={onToggleWordPressConfig}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          aria-label="Publishing Settings"
        >
          <PublishIcon className="w-5 h-5" />
          <span className="hidden lg:inline">Publishing</span>
        </button>
        <button
          onClick={onToggleApiConfig}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          aria-label="API Configuration"
        >
          <KeyIcon className="w-5 h-5" />
          <span className="hidden lg:inline">API Settings</span>
        </button>
        <button
          onClick={onToggleHistory}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
          aria-label="Campaign History"
        >
          <HistoryIcon className="w-5 h-5" />
          <span className="hidden lg:inline">History</span>
        </button>
      </div>
  </header>
);