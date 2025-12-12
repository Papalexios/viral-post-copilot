
import React from 'react';
import type { TopicAnalysis, GroundingMetadata, CompetitorAnalysis, AudiencePersona, PredictiveMetrics } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { SourcesDisplay } from './SourcesDisplay';
import { TrendingUpIcon } from './icons/TrendingUpIcon';
import { UsersIcon } from './icons/UsersIcon';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { MagnetIcon } from './icons/MagnetIcon';
import { KeyIcon } from './icons/KeyIcon';
import { QuestionMarkCircleIcon } from './icons/QuestionMarkCircleIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';

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
  'Competitor Analysis': ShieldCheckIcon,
  'Audience Persona': UsersIcon,
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

const SWOTDisplay: React.FC<{ swot: CompetitorAnalysis }> = ({ swot }) => {
    const renderList = (items?: string[]) => (
        <ul className="list-disc list-inside text-xs text-slate-700 dark:text-slate-300">
            {(items || []).length > 0 ? (
                (items || []).map((item, i) => <li key={i}>{item}</li>)
            ) : (
                <li className="list-none italic text-slate-500">None identified.</li>
            )}
        </ul>
    );

    return (
      <div className="space-y-3 text-sm">
        <p className="italic text-slate-600 dark:text-slate-400 text-xs">{swot.summary || 'No summary available.'}</p>
        <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 dark:bg-green-900/50 p-2 rounded">
                <p className="font-bold text-green-700 dark:text-green-300 text-xs">Strengths</p>
                {renderList(swot.strengths)}
            </div>
            <div className="bg-red-50 dark:bg-red-900/50 p-2 rounded">
                <p className="font-bold text-red-700 dark:text-red-300 text-xs">Weaknesses</p>
                {renderList(swot.weaknesses)}
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/50 p-2 rounded">
                <p className="font-bold text-blue-700 dark:text-blue-300 text-xs">Opportunities</p>
                {renderList(swot.opportunities)}
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/50 p-2 rounded">
                <p className="font-bold text-orange-700 dark:text-orange-300 text-xs">Threats</p>
                {renderList(swot.threats)}
            </div>
        </div>
      </div>
    );
};

const PersonaDisplay: React.FC<{ persona: AudiencePersona }> = ({ persona }) => (
    <div className="space-y-2 text-sm">
        <div className="text-center py-2">
            <h5 className="font-bold text-lg text-slate-800 dark:text-slate-200">{persona.name || 'Unnamed Persona'}</h5>
            <p className="text-xs text-slate-500 dark:text-slate-400">{persona.demographics || 'No demographic data'}</p>
        </div>
        <p className="italic text-slate-600 dark:text-slate-400 text-xs">{persona.summary || 'No summary available.'}</p>
        <div>
            <p className="font-semibold text-slate-600 dark:text-slate-400 text-xs mt-2">Goals:</p>
            <ul className="list-disc list-inside text-xs text-slate-700 dark:text-slate-300">
                {(persona.goals || []).map((item, i) => <li key={i}>{item}</li>)}
            </ul>
        </div>
        <div>
            <p className="font-semibold text-slate-600 dark:text-slate-400 text-xs mt-2">Pain Points:</p>
            <ul className="list-disc list-inside text-xs text-slate-700 dark:text-slate-300">
                {(persona.pain_points || []).map((item, i) => <li key={i}>{item}</li>)}
            </ul>
        </div>
    </div>
);

const MetricsDisplay: React.FC<{ metrics: PredictiveMetrics }> = ({ metrics }) => (
    <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Eng. Rate</p>
            <p className="text-green-600 dark:text-green-400 font-bold">{metrics.estimated_engagement_rate}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Virality Prob.</p>
            <p className="text-purple-600 dark:text-purple-400 font-bold">{metrics.virality_probability}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Sentiment</p>
            <p className="text-cyan-600 dark:text-cyan-400 font-bold">{metrics.audience_sentiment_forecast}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase">Est. CTR</p>
            <p className="text-orange-600 dark:text-orange-400 font-bold">{metrics.predicted_ctr}</p>
        </div>
    </div>
);

export const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysis, groundingMetadata }) => {
  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl shadow-slate-300/30 dark:shadow-slate-950/50">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 flex items-center justify-center gap-3 bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-green-600 dark:from-cyan-400 dark:to-green-400">
        <SparklesIcon className="w-7 h-7 sm:w-8 sm:h-8"/>
        AI Analysis & Strategy
      </h2>

      <div className="mb-6 bg-slate-50 dark:bg-slate-900/50 p-4 sm:p-5 rounded-lg border border-green-300 dark:border-green-700/50">
          <h3 className="text-lg sm:text-xl font-bold text-green-700 dark:text-green-300 mb-2">Overall Campaign Strategy</h3>
          <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap text-sm sm:text-base leading-relaxed">{analysis.campaign_strategy}</p>
      </div>

      <div className="space-y-4">
        {analysis.predictive_metrics && (
             <AnalysisItem title="Predictive Performance Engine">
                <MetricsDisplay metrics={analysis.predictive_metrics} />
             </AnalysisItem>
        )}

        {analysis.audience_persona_details && (
             <AnalysisItem title="Audience Persona">
                <PersonaDisplay persona={analysis.audience_persona_details} />
             </AnalysisItem>
        )}

        {analysis.competitor_analysis && (
            <AnalysisItem title="Competitor Analysis">
                <SWOTDisplay swot={analysis.competitor_analysis} />
            </AnalysisItem>
        )}
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
                {analysis.viral_hooks?.map((item, index) => <li key={index}>{item}</li>)}
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
         {analysis.answer_engine_strategy?.suggested_faqs && analysis.answer_engine_strategy.suggested_faqs.length > 0 && (
            <AnalysisItem title="Answer Engine Strategy">
                 <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 text-sm">
                    {analysis.answer_engine_strategy.suggested_faqs.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
            </AnalysisItem>
        )}
      
       {analysis.publishing_cadence && analysis.publishing_cadence.length > 0 && (
            <AnalysisItem title="Publishing Cadence">
                 <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 text-sm">
                    {analysis.publishing_cadence.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
            </AnalysisItem>
      )}
      </div>

      {groundingMetadata && groundingMetadata.groundingChunks.length > 0 && (
          <div className="mt-6">
            <SourcesDisplay groundingMetadata={groundingMetadata} />
          </div>
      )}
    </div>
  );
};
