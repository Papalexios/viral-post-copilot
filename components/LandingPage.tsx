
import React from 'react';
import { InputForm } from './InputForm';
import { type InputFormData } from '../types';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { BrainCircuitIcon } from './icons/BrainCircuitIcon';
import { ClipboardCopyIcon } from './icons/ClipboardCopyIcon';
import { MobileViewIcon } from './icons/MobileViewIcon';

interface LandingPageProps {
  onGenerate: (formData: InputFormData) => void;
  isLoading: boolean;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700/50 transition-all duration-300 hover:shadow-xl hover:border-green-400/50 dark:hover:border-green-500/50 hover:-translate-y-1">
    <div className="flex items-center gap-4">
      <div className="bg-green-100 dark:bg-green-900/40 p-3 rounded-lg text-green-600 dark:text-green-300">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h3>
    </div>
    <p className="mt-3 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{children}</p>
  </div>
);

const TestimonialCard: React.FC<{ quote: string; author: string; role: string; }> = ({ quote, author, role }) => (
  <figure className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700/50">
    <blockquote className="text-slate-700 dark:text-slate-300 italic">
      <p>"{quote}"</p>
    </blockquote>
    <figcaption className="mt-4 text-right">
      <p className="font-semibold text-slate-800 dark:text-slate-100">{author}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400">{role}</p>
    </figcaption>
  </figure>
);


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

      {/* Features Section */}
      <section>
        <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300">The Sizzle That Sets Us Apart</h2>
            <p className="mt-3 max-w-xl mx-auto text-slate-600 dark:text-slate-400">Exclusive, industry-leading features designed for professional affiliate marketers.</p>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeatureCard icon={<ShieldCheckIcon className="w-6 h-6"/>} title="Credibility Engine">
                Every claim is fact-checked against real-time data, building unshakable trust with your audience.
            </FeatureCard>
            <FeatureCard icon={<BrainCircuitIcon className="w-6 h-6"/>} title="Viral Strategy AI">
                Goes beyond simple prompts to analyze trends and build a complete campaign strategy with defined goals.
            </FeatureCard>
            <FeatureCard icon={<ClipboardCopyIcon className="w-6 h-6"/>} title="A/B Test Variations">
                Generates multiple post variations testing different psychological triggers to see what resonates.
            </FeatureCard>
            <FeatureCard icon={<MobileViewIcon className="w-6 h-6"/>} title="Platform-Native Formatting">
                Content is perfectly formatted for each social network, complete with emojis, markdown, and platform-specific hooks.
            </FeatureCard>
        </div>
      </section>

      {/* Social Proof */}
      <section>
        <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300">Trusted by Marketing Professionals</h2>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            <TestimonialCard 
                quote="I was tired of the same old AI fluff. This tool's focus on credible, fact-checked content has been a game-changer for my blog's authority."
                author="Sarah J."
                role="SEO Consultant"
            />
            <TestimonialCard 
                quote="The strategic analysis is what sold me. It's not just a writer; it's a marketing partner. My engagement rates have doubled."
                author="Mike R."
                role="Niche Site Owner"
            />
        </div>
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
