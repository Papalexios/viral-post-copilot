
import React from 'react';
import type { TopicAnalysis, GroundingMetadata } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { SourcesDisplay } from './SourcesDisplay';

interface AnalysisDisplayProps {
  analysis: TopicAnalysis;
  groundingMetadata?: GroundingMetadata;
}

const AnalysisItem: React.FC<{ title: string, content: string | string[] }> = ({ title, content }) => (
    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
        <h4 className="text-md font-bold text-cyan-300 mb-2">{title}</h4>
        {Array.isArray(content) ? (
            <ul className="list-disc list-inside space-y-1">
                {content.map((item, index) => (
                    <li key={index} className="text-slate-300 text-sm">{item}</li>
                ))}
            </ul>
        ) : (
            <p className="text-slate-300 text-sm">{content}</p>
        )}
    </div>
);

export const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysis, groundingMetadata }) => {
  return (
    <div className="p-4 sm:p-6 bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl shadow-slate-950/50">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 flex items-center justify-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-pink-400">
        <SparklesIcon className="w-7 h-7 sm:w-8 sm:h-8"/>
        AI Analysis & Strategy
        <SparklesIcon className="w-7 h-7 sm:w-8 sm:h-8"/>
      </h2>

      <div className="mb-6 bg-slate-900/50 p-4 sm:p-5 rounded-lg border border-purple-700/50">
          <h3 className="text-lg sm:text-xl font-bold text-purple-300 mb-2">Overall Campaign Strategy</h3>
          <p className="text-slate-300 whitespace-pre-wrap text-sm sm:text-base leading-relaxed">{analysis.campaign_strategy}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnalysisItem title="Trend Alignment" content={analysis.trend_alignment} />
        <AnalysisItem title="Audience Resonance" content={analysis.audience_resonance} />
        <AnalysisItem title="Content Gaps Identified" content={analysis.content_gaps} />
        <AnalysisItem title="Top Viral Hooks" content={analysis.viral_hooks} />
      </div>

      {groundingMetadata && groundingMetadata.groundingChunks.length > 0 && (
          <div className="mt-6">
            <SourcesDisplay groundingMetadata={groundingMetadata} />
          </div>
      )}
    </div>
  );
};