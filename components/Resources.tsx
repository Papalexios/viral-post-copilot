

import React from 'react';
import { RESOURCE_LINKS } from '../constants';
import { BookOpenIcon } from './icons/BookOpenIcon';

const ExternalLinkIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
        <polyline points="15 3 21 3 21 9"></polyline>
        <line x1="10" y1="14" x2="21" y2="3"></line>
    </svg>
);

export const Resources: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 mt-8 shadow-lg transition-all duration-300 animate-fade-in">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-slate-800 dark:text-slate-100 flex items-center gap-3">
          <BookOpenIcon className="w-7 h-7 text-green-500 dark:text-green-300" />
          Learn from the Experts
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-2xl">
            Dive deeper into affiliate marketing, SEO, and AI content creation with these hand-picked articles from <a href="https://affiliatemarketingforsuccess.com/blog/" target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-400 hover:underline font-semibold">AffiliateMarketingForSuccess.com</a>.
        </p>
        
        <div className="space-y-8">
            {RESOURCE_LINKS.map(category => (
                <div key={category.category}>
                    <h3 className="text-xl font-bold text-cyan-600 dark:text-cyan-300">{category.category}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4">{category.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {category.links.map(link => (
                            <a 
                                href={link.url} 
                                key={link.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg flex justify-between items-center transition-all duration-300 border border-slate-200 dark:border-slate-700 hover:border-green-400 dark:hover:border-green-500/50 hover:bg-white dark:hover:bg-slate-800/50 group"
                            >
                                <span className="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-green-600 dark:group-hover:text-green-300 pr-4">{link.title}</span>
                                <ExternalLinkIcon className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-green-500 dark:group-hover:text-green-400 transition-colors flex-shrink-0" />
                            </a>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};