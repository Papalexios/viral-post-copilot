import React from 'react';
import { HistoryIcon } from './icons/HistoryIcon';
import { KeyIcon } from './icons/KeyIcon';
import { PublishIcon } from './icons/PublishIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { LogoIcon } from './icons/LogoIcon';
import { ThemeSwitcher } from './ThemeSwitcher';
import type { Theme } from '../App';
import { TrendingUpIcon } from './icons/TrendingUpIcon';

interface HeaderProps {
    isLandingPage: boolean;
    theme: Theme;
    toggleTheme: () => void;
    onToggleHistory: () => void;
    onToggleApiConfig: () => void;
    onToggleWordPressConfig: () => void;
    onToggleResources: () => void;
    onToggleViralVault: () => void;
}

const HeaderActions: React.FC<Omit<HeaderProps, 'isLandingPage'>> = ({ 
    theme, toggleTheme, onToggleResources, onToggleWordPressConfig, onToggleApiConfig, onToggleHistory, onToggleViralVault
}) => (
    <div className="flex items-center gap-2">
        <ThemeSwitcher theme={theme} toggleTheme={toggleTheme} />
        <button
          onClick={onToggleViralVault}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
          aria-label="Viral Vault"
        >
          <TrendingUpIcon className="w-5 h-5" />
          <span className="hidden lg:inline">Viral Vault</span>
        </button>
        <button
          onClick={onToggleResources}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
          aria-label="Resources"
        >
          <BookOpenIcon className="w-5 h-5" />
          <span className="hidden lg:inline">Resources</span>
        </button>
        <button
          onClick={onToggleWordPressConfig}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
          aria-label="Publishing Settings"
        >
          <PublishIcon className="w-5 h-5" />
          <span className="hidden lg:inline">Publishing</span>
        </button>
        <button
          onClick={onToggleApiConfig}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
          aria-label="API Configuration"
        >
          <KeyIcon className="w-5 h-5" />
          <span className="hidden lg:inline">API Settings</span>
        </button>
        <button
          onClick={onToggleHistory}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
          aria-label="Campaign History"
        >
          <HistoryIcon className="w-5 h-5" />
          <span className="hidden lg:inline">History</span>
        </button>
    </div>
);


export const Header: React.FC<HeaderProps> = (props) => {
    const { isLandingPage } = props;

    if (isLandingPage) {
        return (
            <header className="sticky top-0 z-40 w-full backdrop-blur-sm bg-white/80 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700/50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <LogoIcon className="w-10 h-10 text-green-500 dark:text-green-400" />
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">AI Content Co-pilot</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                From the creators of <a href="https://affiliatemarketingforsuccess.com" target="_blank" rel="noopener noreferrer" className="font-semibold text-slate-600 dark:text-slate-300 hover:text-green-600 dark:hover:text-green-400 transition-colors">AffiliateMarketingForSuccess.com</a>
                            </p>
                        </div>
                    </div>
                    <div className="hidden md:flex">
                        <HeaderActions {...props} />
                    </div>
                </div>
            </header>
        );
    }

    return (
        <header className="relative text-center py-4 sm:py-6 border-b border-slate-200 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
                <a href="https://affiliatemarketingforsuccess.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
                    <LogoIcon className="w-10 h-10 sm:w-12 sm:h-12 text-green-500 dark:text-green-400 group-hover:text-green-600 dark:group-hover:text-green-300 transition-colors" />
                    <div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-green-600 dark:from-cyan-400 dark:to-green-400">
                            AI Content Co-pilot
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 hidden sm:block text-left transition-colors group-hover:text-slate-700 dark:group-hover:text-slate-200">
                            by AffiliateMarketingForSuccess.com
                        </p>
                    </div>
                </a>
                <p className="mt-2 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto px-2">
                    Your strategic partner for high-impact, SEO-driven affiliate content.
                </p>
            </div>
             <div className="absolute top-4 right-4 hidden md:flex">
                <HeaderActions {...props} />
             </div>
        </header>
    );
};