import React, { useState } from 'react';
import type { ViralPost } from '../types';
import { TrendingUpIcon } from './icons/TrendingUpIcon';
import { LoadingSpinner } from './LoadingSpinner';
import { PLATFORMS } from '../constants';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';

interface ViralVaultProps {
  onGenerate: (niche: string) => void;
  trends: ViralPost[] | null;
  isLoading: boolean;
  error: string | null;
}

const TrendCard: React.FC<{ trend: ViralPost }> = ({ trend }) => {
    const [isCopied, setIsCopied] = useState(false);
    const platformInfo = PLATFORMS.find(p => p.name.toLowerCase() === trend.platform.toLowerCase());
    const IconComponent = platformInfo?.icon;
    
    const handleCopy = () => {
        navigator.clipboard.writeText(trend.post_text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="bg-white dark:bg-slate-800/60 p-5 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between transition-all duration-300 hover:border-green-400/50 dark:hover:border-green-500/50 hover:shadow-lg dark:hover:shadow-green-900/40">
            <div>
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                        {IconComponent && <div className="w-6 h-6 text-slate-500 dark:text-slate-400"><IconComponent/></div>}
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{trend.platform}</span>
                    </div>
                     <div className="text-right">
                        <p className="text-xs text-slate-500 dark:text-slate-400">Neuro Score</p>
                        <p className="font-bold text-lg text-green-600 dark:text-green-400">{trend.neuro_score}</p>
                    </div>
                </div>
                <p className="text-slate-800 dark:text-slate-200 text-base leading-relaxed">{trend.post_text}</p>
                 <p className="mt-3 text-xs font-semibold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/50 px-2 py-1 rounded-full inline-block">
                    Trigger: {trend.viral_trigger}
                </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/50">
                <button
                    onClick={handleCopy}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors active:scale-95"
                >
                    {isCopied ? <CheckIcon className="w-4 h-4 text-green-500"/> : <CopyIcon className="w-4 h-4" />}
                    {isCopied ? 'Copied Hook!' : 'Copy Post Hook'}
                </button>
            </div>
        </div>
    );
};

export const ViralVault: React.FC<ViralVaultProps> = ({ onGenerate, trends, isLoading, error }) => {
    const [niche, setNiche] = useState<string>('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (niche.trim()) {
            onGenerate(niche.trim());
        }
    };

    return (
        <div className="p-4 sm:p-6 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 mt-8 shadow-lg transition-all duration-300 animate-fade-in">
            <div className="text-center mb-8">
                <div className="inline-block p-4 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl mb-4 text-white">
                     <TrendingUpIcon className="w-8 h-8"/>
                </div>
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Viral Vault</h2>
                <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                    Unlock emerging trends and SOTA viral hooks. Enter a niche to scout for the next big thing.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-lg mx-auto mb-10">
                <input
                    type="text"
                    value={niche}
                    onChange={e => setNiche(e.target.value)}
                    placeholder="e.g., AI startups, vegan cooking, retro gaming"
                    className="flex-grow bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-3 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading || !niche.trim()}
                    className="font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white disabled:opacity-50 disabled:cursor-not-allowed transform enabled:hover:scale-105 enabled:active:scale-100"
                >
                    {isLoading ? 'Scouting...' : 'Find Trends'}
                </button>
            </form>

            {isLoading && <LoadingSpinner message="Analyzing the digital zeitgeist..." />}
            
            {error && (
                <div className="mt-4 bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-center">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
            )}
            
            {trends && (
                 <div className="animate-fade-in">
                    <h3 className="text-xl font-bold text-center mb-6 text-slate-800 dark:text-slate-200">Top 5 Emerging Hooks for "{niche}"</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {trends.map((trend, index) => (
                            <TrendCard key={index} trend={trend} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
