import React from 'react';
import { InputForm } from './InputForm';
import { type InputFormData } from '../types';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { BrainCircuitIcon } from './icons/BrainCircuitIcon';
import { ClipboardCopyIcon } from './icons/ClipboardCopyIcon';
import { MobileViewIcon } from './icons/MobileViewIcon';
import { TrendingUpIcon } from './icons/TrendingUpIcon';

interface LandingPageProps {
  onGenerate: (formData: InputFormData) => void;
  isLoading: boolean;
}

const KeyPrincipleCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="bg-white/50 dark:bg-slate-800/30 p-6 rounded-xl border border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
    <div className="flex items-center gap-4">
      <div className="bg-green-100 dark:bg-green-900/40 p-3 rounded-lg text-green-600 dark:text-green-300">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h3>
    </div>
    <p className="mt-3 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{children}</p>
  </div>
);

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700/50 transition-all duration-300 hover:shadow-lg hover:border-green-400/50 dark:hover:border-green-500/50 hover:-translate-y-1">
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

const FeaturesSection: React.FC = () => (
    <section>
        <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100">The Sizzle That Sets Us Apart</h2>
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
);

const TestimonialsSection: React.FC = () => (
    <section>
        <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100">Trusted by Marketing Professionals</h2>
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
);


export const LandingPage: React.FC<LandingPageProps> = ({ onGenerate, isLoading }) => {
  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative text-center pt-20 md:pt-28 pb-24 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-slate-50 dark:bg-slate-900"></div>
        <div aria-hidden="true" className="absolute inset-0 -z-10 grid-bg"></div>
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-slate-50 to-transparent dark:from-slate-900 dark:to-transparent"></div>
        
        <div className="container mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-slate-900 dark:text-slate-50">
              Go Beyond Generic AI
          </h1>
          <p className="max-w-3xl mx-auto mt-6 text-lg md:text-xl text-slate-600 dark:text-slate-300">
            Architect high-impact, credible social media campaigns that <span className="font-semibold text-green-600 dark:text-green-400">actually convert.</span>
          </p>

          <div className="mt-12 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
             <KeyPrincipleCard icon={<ShieldCheckIcon className="w-6 h-6" />} title="Verifiable Credibility">
                Our AI fact-checks claims to build authority and trust with your audience.
             </KeyPrincipleCard>
             <KeyPrincipleCard icon={<BrainCircuitIcon className="w-6 h-6" />} title="Transformative Value">
                Every post is crafted to provide a tangible benefit or a profound "Aha!" moment.
             </KeyPrincipleCard>
             <KeyPrincipleCard icon={<TrendingUpIcon className="w-6 h-6" />} title="Strategic Engagement">
                We embed psychological triggers to maximize virality and interaction.
             </KeyPrincipleCard>
          </div>
        </div>
      </section>

      {/* Input Form Section */}
      <section id="create-campaign" className="py-24 bg-white dark:bg-slate-900/50">
        <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100">Create Your First Campaign</h2>
                <p className="mt-3 max-w-xl mx-auto text-slate-600 dark:text-slate-400">Fill out the details below and let our AI build a high-impact campaign in minutes.</p>
            </div>
            <InputForm onGenerate={onGenerate} isLoading={isLoading} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900 text-center">
         <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-slate-100">Ready to Supercharge Your SEO?</h2>
            <p className="mt-3 max-w-xl mx-auto text-slate-600 dark:text-slate-400">This tool is just the beginning. Unlock our full suite of AI-powered tools to dominate search rankings, build topical authority, and automate your entire content workflow.</p>
            <div className="mt-8">
                <a
                  href="https://seo-hub.affiliatemarketingforsuccess.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-lg md:text-xl font-bold py-4 px-8 rounded-lg transition-all duration-300 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-400 hover:via-orange-400 hover:to-red-400 text-white transform hover:scale-105 active:scale-100 shadow-lg hover:shadow-2xl"
                >
                  Unlock Your Complete AI SEO Arsenal
                </a>
            </div>
        </div>
      </section>
      
      <div className="bg-white dark:bg-slate-900/50 py-24 md:py-32">
        <div className="container mx-auto px-4 max-w-4xl space-y-24 md:space-y-32">
            <FeaturesSection />
            <TestimonialsSection />
        </div>
      </div>
    </div>
  );
};