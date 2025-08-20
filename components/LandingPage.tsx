


import React from 'react';
import { InputForm } from './InputForm';
import { type InputFormData } from '../types';

interface LandingPageProps {
  onGenerate: (formData: InputFormData) => void;
  isLoading: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGenerate, isLoading }) => {
  return (
    <div className="space-y-24 md:space-y-32 animate-fade-in">
      {/* Hero Section */}
      <section className="text-center relative pt-12 md:pt-20">
        <div className="absolute inset-x-0 top-0 h-[500px] bg-gradient-to-br from-green-100/50 via-cyan-100/50 to-white dark:from-green-900/20 dark:via-cyan-900/20 dark:to-slate-900 blur-3xl -z-10 animate-[spin_20s_linear_infinite_reverse]"></div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-green-600 dark:from-cyan-400 dark:to-green-400">
            Go Beyond Generic AI
        </h1>
        <p className="max-w-3xl mx-auto text-lg md:text-xl font-medium text-slate-700 dark:text-slate-200 mt-4">
          Architect high-impact, credible social media campaigns that <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-cyan-500 font-bold">actually convert.</span>
        </p>

        {/* USP */}
        <div className="mt-8 max-w-2xl mx-auto p-4 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl backdrop-blur-sm">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">What makes this offer so special?</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
                Unlike other AI tools that generate repetitive content, our Viral Architect AI is built on three core principles: <strong>Verifiable Credibility</strong>, <strong>Transformative Value</strong>, and <strong>Psychological Triggers</strong>. We don't just write posts; we architect campaigns that build authority and drive results.
            </p>
        </div>
      </section>

      {/* New CTA Section */}
      <section className="text-center">
        <a
          href="https://viral-post.affiliatemarketingforsuccess.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-lg md:text-xl font-bold py-4 px-6 rounded-lg transition-all duration-300 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-400 hover:via-orange-400 hover:to-red-400 text-white transform hover:scale-105 active:scale-100 shadow-lg hover:shadow-2xl"
        >
          Dominate Your Niche – Unlock Your Complete AI-Powered SEO Arsenal
        </a>
      </section>

      {/* Input Form Section */}
      <section id="create-campaign">
        <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-green-600 dark:from-cyan-400 dark:to-green-400">Create Your First Campaign</h2>
            <p className="mt-3 max-w-xl mx-auto text-slate-600 dark:text-slate-400">Fill out the details below and let our AI build a high-impact campaign in minutes.</p>
        </div>
         <InputForm onGenerate={onGenerate} isLoading={isLoading} />
      </section>
    </div>
  );
};