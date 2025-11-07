import React from 'react';
import type { TopicAnalysis, GroundingMetadata } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { SourcesDisplay } from './SourcesDisplay';
import { TrendingUpIcon } from './icons/TrendingUpIcon';
import { UsersIcon } from './icons/UsersIcon';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { MagnetIcon } from './icons/MagnetIcon';
import { KeyIcon } from './icons/KeyIcon';
import { QuestionMarkCircleIcon } from './icons/QuestionMarkCircleIcon';
import { CalendarIcon } from './icons/CalendarIcon';

interface AnalysisDisplayProps {
  analysis: TopicAnalysis;
  groundingMetadata?: GroundingMetadata;
}

const titleToIconMap: { [key: string]: React.FC<{ className?: string }> } = {
  'Trend Alignment': TrendingUpIcon,
  'Audience Resonance': UsersIcon,
  'Content Gaps Identified': LightbulbIcon,
  'Top Viral Hooks': MagnetIcon,
  'SEO Keyword Clusters': KeyIcon,
  'Answer Engine Strategy': QuestionMarkCircleIcon,
  'Publishing Cadence': CalendarIcon,
};

const AnalysisItem: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => {
    const Icon = titleToIconMap[title];
    return (
        <div className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <h4 className="text-md font-bold text-cyan-600 dark:text-cyan-300 mb-2 flex items-center gap-2">
                {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
                <span>{title}</span>
            </h4>
            {children}
        </div>
    );
};

export const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysis, groundingMetadata }) => {
  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl shadow-slate-300/30 dark:shadow-slate-950/50">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 flex items-center justify-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-green-600 dark:from-cyan-400 dark:to-green-400">
        <SparklesIcon className="w-7 h-7 sm:w-8 sm:h-8"/>
        AI Analysis & Strategy
        <SparklesIcon className="w-7 h-7 sm:w-8 sm:h-8"/>
      </h2>

      <div className="mb-6 bg-slate-50 dark:bg-slate-900/50 p-4 sm:p-5 rounded-lg border border-green-300 dark:border-green-700/50">
          <h3 className="text-lg sm:text-xl font-bold text-green-700 dark:text-green-300 mb-2">Overall Campaign Strategy</h3>
          <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap text-sm sm:text-base leading-relaxed">{analysis.campaign_strategy}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnalysisItem title="Trend Alignment">
            <p className="text-slate-700 dark:text-slate-300 text-sm">{analysis.trend_alignment}</p>
        </AnalysisItem>
        <AnalysisItem title="Audience Resonance">
            <p className="text-slate-700 dark:text-slate-300 text-sm">{analysis.audience_resonance}</p>
        </AnalysisItem>
        <AnalysisItem title="Content Gaps Identified">
            <p className="text-slate-700 dark:text-slate-300 text-sm">{analysis.content_gaps}</p>
        </AnalysisItem>
        <AnalysisItem title="Top Viral Hooks">
             <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 text-sm">
                {analysis.viral_hooks.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
        </AnalysisItem>

        {analysis.seo_keywords && (
            <AnalysisItem title="SEO Keyword Clusters">
                <div className="space-y-2 text-sm">
                    <div>
                        <p className="font-semibold text-slate-600 dark:text-slate-400 text-xs">PRIMARY</p>
                        <p className="text-slate-700 dark:text-slate-300">{analysis.seo_keywords.primary?.join(', ')}</p>
                    </div>
                     <div>
                        <p className="font-semibold text-slate-600 dark:text-slate-400 text-xs">SECONDARY</p>
                        <p className="text-slate-700 dark:text-slate-300">{analysis.seo_keywords.secondary?.join(', ')}</p>
                    </div>
                     <div>
                        <p className="font-semibold text-slate-600 dark:text-slate-400 text-xs">LSI / LONG-TAIL</p>
                        <p className="text-slate-700 dark:text-slate-300">{analysis.seo_keywords.lsi?.join(', ')}</p>
                    </div>
                </div>
            </AnalysisItem>
        )}
         {analysis.answer_engine_strategy?.suggested_faqs && (
            <AnalysisItem title="Answer Engine Strategy">
                 <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 text-sm">
                    {analysis.answer_engine_strategy.suggested_faqs.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
            </AnalysisItem>
        )}
      </div>
      
       {analysis.publishing_cadence && analysis.publishing_cadence.length > 0 && (
         <div className="mt-4">
            <AnalysisItem title="Publishing Cadence">
                 <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 text-sm">
                    {analysis.publishing_cadence.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
            </AnalysisItem>
        </div>
      )}

      {groundingMetadata && groundingMetadata.groundingChunks.length > 0 && (
          <div className="mt-6">
            <SourcesDisplay groundingMetadata={groundingMetadata} />
          </div>
      )}
    </div>
  );
};