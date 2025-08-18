
import React, { useState } from 'react';
import { Tone, Platform, CampaignGoal, InputMode, type InputFormData } from '../types';
import { PLATFORMS, TONES, CAMPAIGN_GOALS } from '../constants';
import { SparklesIcon } from './icons/SparklesIcon';

interface InputFormProps {
  onGenerate: (formData: InputFormData) => void;
  isLoading: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({ onGenerate, isLoading }) => {
  const [inputMode, setInputMode] = useState<InputMode>(InputMode.Topic);
  const [topic, setTopic] = useState<string>('');
  const [sourceUrl, setSourceUrl] = useState<string>('');
  const [postCount, setPostCount] = useState<number>(3);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([Platform.Twitter, Platform.LinkedIn]);
  const [tone, setTone] = useState<Tone>(Tone.Professional);
  const [campaignGoal, setCampaignGoal] = useState<CampaignGoal>(CampaignGoal.BrandAwareness);

  const handlePlatformToggle = (platformName: Platform) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformName)
        ? prev.filter(p => p !== platformName)
        : [...prev, platformName]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({ inputMode, topic, sourceUrl, selectedPlatforms, tone, campaignGoal, postCount });
  };
  
  const isGenerateDisabled = isLoading || selectedPlatforms.length === 0 || (inputMode === InputMode.Topic && !topic.trim()) || (inputMode === InputMode.URLSitemap && !sourceUrl.trim());

  return (
    <form onSubmit={handleSubmit} className="p-4 sm:p-8 bg-white/60 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/50 space-y-6 sm:space-y-8 mt-12 backdrop-blur-sm">
      {/* Step 1: Source */}
      <div>
        <label className="block text-base font-bold mb-3 text-slate-800 dark:text-slate-200">
          1. Content Source
        </label>
        <div className="flex bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 rounded-lg p-1 space-x-1 mb-4">
            <button type="button" onClick={() => setInputMode(InputMode.Topic)} className={`w-full text-center px-3 py-2 rounded-md transition-all duration-300 font-semibold text-sm active:scale-95 ${inputMode === InputMode.Topic ? 'bg-cyan-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                Topic / Keyword
            </button>
            <button type="button" onClick={() => setInputMode(InputMode.URLSitemap)} className={`w-full text-center px-3 py-2 rounded-md transition-all duration-300 font-semibold text-sm active:scale-95 ${inputMode === InputMode.URLSitemap ? 'bg-cyan-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                URL / Sitemap
            </button>
        </div>
        {inputMode === InputMode.Topic ? (
             <input
                id="topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., The future of renewable energy"
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-3 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300"
                required
              />
        ) : (
            <textarea
                id="sourceUrl"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="Enter one or more URLs, or a sitemap.xml. One per line."
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-3 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 h-24"
                required
             />
        )}
      </div>

      {/* Step 2: Platform Selection */}
      <div>
        <label className="block text-base font-bold mb-3 text-slate-800 dark:text-slate-200">
          2. Target Platforms
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4">
          {PLATFORMS.map(({ name, icon: Icon }) => (
            <button
              key={name}
              type="button"
              onClick={() => handlePlatformToggle(name)}
              className={`flex flex-col items-center justify-center p-3 sm:p-4 border-2 rounded-xl transition-all duration-300 transform hover:-translate-y-1 active:scale-95 ${
                selectedPlatforms.includes(name)
                  ? 'bg-green-50 dark:bg-green-600/30 border-green-500 text-slate-900 dark:text-white'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-green-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <div className="h-7 w-7 sm:h-8 sm:w-8"><Icon /></div>
              <span className="mt-2 font-semibold text-xs sm:text-sm">{name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Step 3, 4, 5 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        <div>
           <label htmlFor="campaignGoal" className="block text-base font-bold mb-3 text-slate-800 dark:text-slate-200">
            3. Campaign Goal
          </label>
          <select
            id="campaignGoal"
            value={campaignGoal}
            onChange={(e) => setCampaignGoal(e.target.value as CampaignGoal)}
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
          >
            {CAMPAIGN_GOALS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="tone" className="block text-base font-bold mb-3 text-slate-800 dark:text-slate-200">
            4. Voice & Tone
          </label>
          <select
            id="tone"
            value={tone}
            onChange={(e) => setTone(e.target.value as Tone)}
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300"
          >
            {TONES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
         <div>
          <label htmlFor="postCount" className="block text-base font-bold mb-3 text-slate-800 dark:text-slate-200">
            5. Number of Posts
          </label>
           <input
            id="postCount"
            type="number"
            value={postCount}
            onChange={(e) => setPostCount(Math.max(1, Math.min(12, parseInt(e.target.value, 10) || 1)))}
            min="1"
            max="12"
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900 focus:ring-pink-500 focus:border-pink-500 transition-all duration-300"
          />
        </div>
      </div>
      
      {/* Step 6: Generate */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-700/50">
         <button
          type="submit"
          disabled={isGenerateDisabled}
          className="w-full text-lg font-bold py-4 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-600 to-green-500 hover:from-cyan-500 hover:to-green-400 text-white disabled:opacity-50 disabled:cursor-not-allowed transform enabled:hover:scale-105 enabled:active:scale-100 disabled:transform-none"
        >
          {isLoading ? (
            <>
                <div className="w-5 h-5 border-2 border-slate-400 border-t-white rounded-full animate-spin"></div>
                <span>Generating...</span>
            </>
          ) : (
             <>
                <SparklesIcon className="w-6 h-6"/>
                <span>Generate Campaign</span>
             </>
          )}
        </button>
      </div>
    </form>
  );
};
