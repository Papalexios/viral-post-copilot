import React, { useState, useEffect, useRef, memo } from 'react';
import type { GeneratedPost, PostVariation, Platform, SchedulingSuggestion } from '../types';
import { PLATFORMS } from '../constants';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import { InfoIcon } from './icons/InfoIcon';
import { WordPressIcon } from './icons/WordPressIcon';
import { SkeletonLoader } from './SkeletonLoader';
import { SparklesIcon } from './icons/SparklesIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { MagicWandIcon } from './icons/MagicWandIcon';
import { VideoIcon } from './icons/VideoIcon';
import { LayersIcon } from './icons/LayersIcon';

const RedoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M23 4v6h-6"></path>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
  </svg>
);

const SEOMetaIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path>
  </svg>
);


interface PostCardProps {
  post: GeneratedPost;
  postIndex: number;
  schedulingSuggestions?: SchedulingSuggestion[];
  onRegenerate: () => void;
  onPublish: (variationIndex: number) => void;
  isWordPressConfigured: boolean;
  onNavigateToScheduler: () => void;
  onRewrite: (variationIndex: number, part: 'post_title' | 'post_text' | 'call_to_action' | 'image_prompt', instruction: string) => void;
  onGenerateMore: (variationIndex: number) => void;
  onSchedulePost: (postId: string, date: number) => void;
  onGenerateClipScript: (postIndex: number, variationIndex: number) => void;
}

const ViralScoreIndicator: React.FC<{ score: number }> = ({ score }) => {
  const color = score > 95 ? 'bg-green-100/80 dark:bg-green-400/20 text-green-700 dark:text-green-300 border-green-300 dark:border-green-500/30' 
  : score > 88 ? 'bg-yellow-100/80 dark:bg-yellow-400/20 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-500/30' 
  : 'bg-orange-100/80 dark:bg-orange-400/20 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-500/30';
  return (
    <div className={`text-sm font-bold px-3 py-1 rounded-full border ${color}`}>
        {score}
    </div>
  );
};

const ImageDisplay: React.FC<{ post: GeneratedPost; onRegenerate: () => void; }> = ({ post, onRegenerate }) => {
  return (
    <div className="relative aspect-square w-full rounded-lg group overflow-hidden bg-slate-200 dark:bg-slate-900">
      {post.imageIsLoading && <SkeletonLoader />}
      {post.imageUrl && post.imageUrl !== 'error' && (
        <img src={post.imageUrl} alt={post.image_prompt} className="aspect-square w-full object-cover rounded-lg animate-fade-in" />
      )}
      {post.imageUrl === 'error' && (
        <div className="absolute inset-0 bg-red-100 dark:bg-red-900/20 flex flex-col items-center justify-center text-center p-4 rounded-lg border border-red-300 dark:border-red-800">
          <p className="text-sm font-semibold text-red-700 dark:text-red-300">Image Failed</p>
          <p className="mt-1 text-xs text-red-600 dark:text-red-400 max-w-full px-2 truncate" title={post.imageError}>{post.imageError || 'Could not generate image.'}</p>
        </div>
      )}
      {!post.imageIsLoading && (
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-lg">
          <button onClick={onRegenerate} className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 border border-slate-600 rounded-full text-white hover:bg-slate-700 transition-colors active:scale-95" aria-label="Regenerate Image">
            <RedoIcon className="w-4 h-4" />
            <span>Regenerate</span>
          </button>
          {post.imageDataUrl && (
             <a 
                href={post.imageDataUrl} 
                download={`amfs-ai-campaign-image-${Date.now()}.webp`}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 border border-slate-600 rounded-full text-white hover:bg-slate-700 transition-colors active:scale-95" 
                aria-label="Download Image"
             >
              <DownloadIcon className="w-4 h-4" />
              <span>Download</span>
            </a>
          )}
        </div>
      )}
    </div>
  )
};

const PlatformPreview: React.FC<{ post: GeneratedPost, variation: PostVariation }> = ({ post, variation }) => {
    const BrandIcon = () => <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-green-400 flex-shrink-0"></div>;
    const hashtagsText = Array.isArray(variation.hashtags) ? variation.hashtags.join(' ') : variation.hashtags;
    
    switch(post.platform) {
        case 'Twitter':
        case 'Bluesky':
            return (
                <div className="bg-white dark:bg-slate-950 text-black dark:text-white p-4 rounded-xl font-[Helvetica] border border-slate-200 dark:border-slate-700 w-full text-left">
                    <div className="flex items-center gap-3">
                        <BrandIcon/>
                        <div>
                            <p className="font-bold">Your Brand <span className="text-slate-500 font-normal">@yourbrand · 1m</span></p>
                        </div>
                    </div>
                    <p className="my-3 text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{variation.post_text}</p>
                    {hashtagsText && <p className="text-cyan-600 dark:text-cyan-400 mt-2 text-sm">{hashtagsText}</p>}
                    {post.imageUrl && post.imageUrl !== 'error' && <img src={post.imageUrl} className="rounded-xl border border-slate-200 dark:border-slate-700 mt-2" />}
                    {post.paa_block_html && <div className="mt-4 text-sm" dangerouslySetInnerHTML={{ __html: post.paa_block_html }} />}
                </div>
            );
        case 'Instagram':
        case 'Threads':
             return (
                <div className="bg-white dark:bg-slate-950 text-black dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 w-full text-left overflow-hidden">
                    <div className="p-3 flex items-center gap-3">
                       <BrandIcon/> <p className="font-bold">yourbrand</p>
                    </div>
                    {post.imageUrl && post.imageUrl !== 'error' ? 
                        <img src={post.imageUrl} className="w-full aspect-square object-cover" /> :
                        <div className="w-full aspect-square bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">Image Preview</div>
                    }
                    <div className="p-3 text-sm">
                        <p><strong className="mr-1">yourbrand</strong>{variation.post_text}</p>
                        <p className="text-slate-500 mt-2">{variation.call_to_action}</p>
                        {hashtagsText && <p className="text-cyan-600 dark:text-cyan-400 mt-2">{hashtagsText}</p>}
                        {post.paa_block_html && <div className="mt-4" dangerouslySetInnerHTML={{ __html: post.paa_block_html }} />}
                    </div>
                </div>
            );
        default: // LinkedIn, Facebook, YouTube Shorts etc.
             return (
                <div className="bg-white text-slate-900 p-4 rounded-lg w-full text-left font-sans border border-slate-200">
                    <div className="flex items-center gap-3">
                       <BrandIcon/>
                        <div>
                            <p className="font-bold">Your Brand</p>
                            <p className="text-slate-500 text-xs">1,234 followers · 1h</p>
                        </div>
                    </div>
                     <p className="my-3 text-slate-800 font-bold text-lg">{variation.post_title}</p>
                    <p className="my-3 text-slate-800 whitespace-pre-wrap">{variation.post_text}</p>
                     {post.imageUrl && post.imageUrl !== 'error' && <img src={post.imageUrl} className="rounded-lg" />}
                     <p className="text-slate-600 mt-3 font-semibold">{variation.call_to_action}</p>
                     {hashtagsText && <p className="text-cyan-600 dark:text-cyan-400 mt-2 text-sm">{hashtagsText}</p>}
                     {post.paa_block_html && <div className="mt-4 text-sm" dangerouslySetInnerHTML={{ __html: post.paa_block_html }} />}
                </div>
            );
    }
};

const FunnelStageBadge: React.FC<{ stage?: string }> = ({ stage }) => {
    if (!stage) return null;
    const colors = {
        'Awareness': 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700/50',
        'Engagement': 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-700/50',
        'Conversion': 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700/50',
    };
    const stageColor = colors[stage as keyof typeof colors] || 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-300';
    
    return (
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${stageColor}`}>
            {stage}
        </span>
    );
};

// #region Editable Components
interface RewritePopoverProps {
    onRewrite: (instruction: string) => void;
    onClose: () => void;
}
const RewritePopover: React.FC<RewritePopoverProps> = ({ onRewrite, onClose }) => {
    const popoverRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const actions = ["Shorter", "Longer", "More Witty", "More Professional", "More Casual"];

    return (
        <div ref={popoverRef} className="absolute z-10 bottom-full mb-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl animate-fade-in-up">
            <div className="p-1">
                {actions.map(action => (
                    <button key={action} onClick={() => { onRewrite(action); onClose(); }} className="w-full text-left px-3 py-1.5 text-sm rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200">
                        {action}
                    </button>
                ))}
            </div>
        </div>
    );
};


interface EditableTextBlockProps {
    text: string;
    isLoading: boolean;
    onRewrite: (instruction: string) => void;
    className?: string;
    isMono?: boolean;
}

const EditableTextBlock: React.FC<EditableTextBlockProps> = ({ text, isLoading, onRewrite, className, isMono = false }) => {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    return (
        <div className={`relative group ${isMono ? 'font-mono' : ''}`}>
            {isLoading && <SkeletonLoader />}
            <p className={`${className} ${isLoading ? 'opacity-50' : ''}`}>{text}</p>
            {!isLoading && (
                 <button 
                    onClick={() => setIsPopoverOpen(true)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-cyan-100 dark:hover:bg-cyan-800/50 hover:text-cyan-600 dark:hover:text-cyan-300"
                    aria-label="Rewrite text"
                 >
                    <MagicWandIcon className="w-4 h-4" />
                </button>
            )}
            {isPopoverOpen && <RewritePopover onRewrite={onRewrite} onClose={() => setIsPopoverOpen(false)} />}
        </div>
    );
};
// #endregion

const PostCardComponent: React.FC<PostCardProps> = ({ post, postIndex, schedulingSuggestions, onRegenerate, onPublish, isWordPressConfigured, onNavigateToScheduler, onRewrite, onGenerateMore, onSchedulePost, onGenerateClipScript }) => {
  const [copyStates, setCopyStates] = useState<{ [key: string]: boolean }>({});
  const [showDetails, setShowDetails] = useState(false);
  const [activeVariationIndex, setActiveVariationIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'content' | 'preview' | 'video' | 'seo'>('content');

  const platformInfo = PLATFORMS.find(p => p.name === post.platform);
  const IconComponent = platformInfo?.icon;
  
  const suggestion = schedulingSuggestions?.find(s => s.platform === post.platform);
  let suggestedDate: Date | null = null;
  if (suggestion) {
    const getNextDateForDay = (dayName: string, timeStr: string): Date | null => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const targetDay = days.indexOf(dayName);
        if (targetDay === -1) return null;

        const timeMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!timeMatch) return null;
        
        let [, hoursStr, minutesStr, period] = timeMatch;
        let hours = parseInt(hoursStr, 10);
        const minutes = parseInt(minutesStr, 10);

        if (period.toUpperCase() === 'PM' && hours < 12) hours += 12;
        if (period.toUpperCase() === 'AM' && hours === 12) hours = 0;

        const today = new Date();
        const resultDate = new Date();
        resultDate.setDate(today.getDate() + (targetDay + 7 - today.getDay()) % 7);
        
        if (resultDate.getTime() < today.getTime() && resultDate.toDateString() === today.toDateString()) {
             resultDate.setDate(resultDate.getDate() + 7);
        } else if (resultDate < today) {
             resultDate.setDate(resultDate.getDate() + 7);
        }

        resultDate.setHours(hours, minutes, 0, 0);
        return resultDate;
    };
    const timeToParse = suggestion.timeOfDay.split(' - ')[0]; // "9:00 AM"
    suggestedDate = getNextDateForDay(suggestion.dayOfWeek, timeToParse);
  }


  if (!post.variations || post.variations.length === 0) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl shadow-lg p-5 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 flex items-center justify-center bg-red-100 dark:bg-red-900/50 rounded-full text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        </div>
        <h3 className="mt-4 font-bold text-red-800 dark:text-red-200">Content Generation Failed</h3>
        <p className="mt-1 text-sm text-red-600 dark:text-red-300">
            The AI was unable to generate content for this post. This can be due to overly restrictive content filters or an ambiguous topic. Please try regenerating the campaign with a different input.
        </p>
      </div>
    );
  }

  const activeVariation = post.variations[activeVariationIndex];
  const hashtagsText = Array.isArray(activeVariation.hashtags) ? activeVariation.hashtags.join(' ') : activeVariation.hashtags;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopyStates(prev => ({ ...prev, [id]: true }));
    setTimeout(() => setCopyStates(prev => ({ ...prev, [id]: false })), 2000);
  };
  
  const CopyButton: React.FC<{ text: string, id: string, label: string }> = ({ text, id, label }) => {
    const isCopied = copyStates[id] || false;
    return (
        <button onClick={() => handleCopy(text, id)} className="relative group flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors active:scale-95">
            {isCopied ? <CheckIcon className="w-4 h-4 text-green-500 dark:text-green-400"/> : <CopyIcon className="w-4 h-4" />}
            {isCopied ? 'Copied!' : 'Copy'}
            <span className="absolute bottom-full mb-2 w-max bg-slate-800 dark:bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">{label}</span>
        </button>
    );
  };
  
  const repurposePrompt = `Repurpose the following social media post into a 5-part Twitter thread, a script for a 30-second TikTok/Reels video, and three questions for a LinkedIn poll.

POST TITLE:
${activeVariation.post_title}

POST BODY:
${activeVariation.post_text}

HASHTAGS:
${hashtagsText}
`;

  const PublishButton: React.FC = () => {
    if (!isWordPressConfigured || post.platform === 'Twitter' || post.platform === 'Instagram') return null;

    const isDisabled = post.imageIsLoading || !post.imageDataUrl || post.imageUrl === 'error' || post.wordpressStatus === 'publishing';
    
    switch (post.wordpressStatus) {
        case 'publishing':
            return <button disabled className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded-lg cursor-wait"><div className="w-4 h-4 border-2 border-slate-400 dark:border-slate-500 border-t-slate-700 dark:border-t-white rounded-full animate-spin"></div>Publishing...</button>;
        case 'published':
            return <a href={post.wordpressUrl} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors">View Post</a>;
        case 'error':
             return (
                <div className="w-full">
                    <button onClick={() => onPublish(activeVariationIndex)} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors active:scale-95">Retry Publish</button>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1 text-center truncate" title={post.wordpressError}>{post.wordpressError}</p>
                </div>
            );
        default: // idle
            return <button onClick={() => onPublish(activeVariationIndex)} disabled={isDisabled} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold bg-slate-500 dark:bg-slate-600 hover:bg-slate-600 dark:hover:bg-slate-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"><WordPressIcon className="w-4 h-4" /> Publish</button>;
    }
  };

  const RepurposeButton: React.FC = () => {
    const isCopied = copyStates['repurpose-prompt'] || false;
    return (
      <button onClick={() => handleCopy(repurposePrompt, 'repurpose-prompt')} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors active:scale-95">
        {isCopied ? <CheckIcon className="w-4 h-4"/> : <LayersIcon className="w-4 h-4" />}
        {isCopied ? 'Copied!' : 'Repurpose'}
      </button>
    )
  };


  return (
    <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg dark:shadow-2xl flex flex-col overflow-hidden transition-all duration-300 hover:border-green-400/50 dark:hover:border-green-500/50 hover:shadow-green-300/30 dark:hover:shadow-green-900/40">
      <div className="p-5 flex justify-between items-start bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 text-slate-600 dark:text-slate-300">
            {IconComponent ? <IconComponent /> : <span className="font-bold text-lg">?</span>}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">{post.platform} Post</h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
                 <FunnelStageBadge stage={post.funnel_stage} />
                 {post.isScheduled && post.scheduledDate && (
                    <button onClick={onNavigateToScheduler} className="flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold rounded-full border bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-700/50 hover:bg-purple-200 dark:hover:bg-purple-900">
                       <CalendarIcon className="w-3 h-3"/>
                       Scheduled: {new Date(post.scheduledDate).toLocaleDateString()}
                    </button>
                 )}
                 {!post.isScheduled && suggestedDate && (
                    <button
                        onClick={() => onSchedulePost(post.id, suggestedDate!.getTime())}
                        className="flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold rounded-full border bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700/50 hover:bg-purple-200 dark:hover:bg-purple-900"
                      >
                       <SparklesIcon className="w-3 h-3"/>
                        AI Slot: {suggestedDate.toLocaleDateString('en-US', { weekday: 'short', hour: 'numeric', minute: 'numeric' })}
                      </button>
                 )}
            </div>
          </div>
        </div>
        <div className="text-right">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Viral Score</p>
            <ViralScoreIndicator score={post.viral_score} />
        </div>
      </div>
       <div className="p-1.5 bg-slate-100 dark:bg-slate-900/50 flex border-b border-slate-200 dark:border-slate-700">
          <button onClick={() => setViewMode('content')} className={`w-1/4 py-2 text-sm font-semibold rounded-md transition-colors active:scale-95 ${viewMode === 'content' ? 'bg-green-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/50'}`}>Content</button>
          <button onClick={() => setViewMode('preview')} className={`w-1/4 py-2 text-sm font-semibold rounded-md transition-colors active:scale-95 ${viewMode === 'preview' ? 'bg-green-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/50'}`}>Preview</button>
          <button onClick={() => setViewMode('video')} className={`w-1/4 py-2 text-sm font-semibold rounded-md transition-colors active:scale-95 ${viewMode === 'video' ? 'bg-green-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/50'}`}>Video</button>
          <button onClick={() => setViewMode('seo')} className={`w-1/4 py-2 text-sm font-semibold rounded-md transition-colors active:scale-95 ${viewMode === 'seo' ? 'bg-green-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700/50'}`}>SEO</button>
      </div>

      <div className="p-5 space-y-4 flex-grow">
        {viewMode === 'preview' ? (
          <div className="flex items-center justify-center bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
            <PlatformPreview post={post} variation={activeVariation} />
          </div>
        ) : viewMode === 'video' ? (
             <div className="space-y-4">
                <h4 className="text-lg font-bold text-center">30-Second Video Clip Script</h4>
                {post.clipScriptIsLoading && <SkeletonLoader />}
                {post.clipScript ? (
                     <div className="text-sm bg-slate-100 dark:bg-slate-900/50 p-4 rounded-md whitespace-pre-wrap font-mono">{post.clipScript}</div>
                ) : (
                    <button onClick={() => onGenerateClipScript(postIndex, activeVariationIndex)} disabled={post.clipScriptIsLoading} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors active:scale-95 disabled:opacity-50">
                        <VideoIcon className="w-4 h-4" />
                        {post.clipScriptIsLoading ? 'Generating Script...' : 'Generate Video Script'}
                    </button>
                )}
             </div>
        ) : viewMode === 'seo' ? (
            <div className="space-y-4">
                <h4 className="text-lg font-bold text-center flex items-center justify-center gap-2"><SEOMetaIcon className="w-5 h-5" /> SEO & AEO Assets</h4>
                {post.internal_links_html && (
                    <div>
                        <h5 className="font-semibold mb-2">Internal Linking Strategy</h5>
                        <div className="text-sm bg-slate-100 dark:bg-slate-900/50 p-3 rounded-md prose-sm prose-a:text-cyan-600 dark:prose-a:text-cyan-400" dangerouslySetInnerHTML={{ __html: post.internal_links_html }} />
                    </div>
                )}
                {post.schema_org_jsonld && (
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h5 className="font-semibold">Schema.org JSON-LD</h5>
                            <CopyButton text={post.schema_org_jsonld} id={`schema-${post.id}`} label="Copy Schema" />
                        </div>
                        <pre className="text-xs bg-slate-100 dark:bg-slate-900/50 p-3 rounded-md overflow-x-auto">
                            <code>{post.schema_org_jsonld}</code>
                        </pre>
                    </div>
                )}
                 {(!post.internal_links_html && !post.schema_org_jsonld) && (
                    <p className="text-center text-sm text-slate-500 dark:text-slate-400 py-4">No SEO assets were generated for this post.</p>
                 )}
            </div>
        ) : (
          <>
            <ImageDisplay post={post} onRegenerate={onRegenerate} />
            <div className="flex bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-1 space-x-1">
                {post.variations.map((variation, index) => (
                    <button
                        key={index}
                        onClick={() => setActiveVariationIndex(index)}
                        className={`w-full text-center px-3 py-2 rounded-md transition-colors duration-300 font-semibold text-sm active:scale-95 ${
                            activeVariationIndex === index ? 'bg-green-600 text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                        {variation.variation_name.split(':')[0]}
                    </button>
                ))}
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-cyan-700 dark:text-cyan-300">{activeVariation.variation_name}</h4>
                <div className="flex items-center gap-4">
                    <CopyButton text={activeVariation.post_title} id={`title-${activeVariationIndex}`} label="Copy Title" />
                    <CopyButton text={activeVariation.post_text} id={`post-${activeVariationIndex}`} label="Copy Body Text" />
                </div>
              </div>
               <EditableTextBlock
                    text={activeVariation.post_title}
                    isLoading={post.rewritingPart === 'post_title'}
                    onRewrite={(instruction) => onRewrite(activeVariationIndex, 'post_title', instruction)}
                    className="text-slate-800 dark:text-slate-200 font-bold bg-slate-100 dark:bg-slate-900/50 p-3 rounded-md text-base"
                />
                <EditableTextBlock
                    text={activeVariation.post_text}
                    isLoading={post.rewritingPart === 'post_text'}
                    onRewrite={(instruction) => onRewrite(activeVariationIndex, 'post_text', instruction)}
                    className="text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900/50 p-3 rounded-md text-sm whitespace-pre-wrap mt-2"
                />
                 <EditableTextBlock
                    text={activeVariation.call_to_action}
                    isLoading={post.rewritingPart === 'call_to_action'}
                    onRewrite={(instruction) => onRewrite(activeVariationIndex, 'call_to_action', instruction)}
                    className="text-slate-600 dark:text-slate-400 mt-2 text-xs italic"
                />
              {hashtagsText && (
                <div className="mt-3">
                    <div className="flex justify-between items-center mb-1">
                        <h5 className="text-xs font-semibold text-slate-500 dark:text-slate-400">Suggested Hashtags</h5>
                        <CopyButton text={hashtagsText} id={`hashtags-${activeVariationIndex}`} label="Copy Hashtags" />
                    </div>
                    <p className="text-cyan-600 dark:text-cyan-400 bg-slate-100 dark:bg-slate-900/50 p-2 rounded-md font-mono text-xs">
                        {hashtagsText}
                    </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="p-4 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-200 dark:border-slate-700/50 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <PublishButton />
            <RepurposeButton />
          </div>
          <div className="grid grid-cols-2 gap-2">
             <button onClick={() => onGenerateMore(activeVariationIndex)} className="w-full flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors py-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95">
                <SparklesIcon className="w-4 h-4" />
                <span>Generate More</span>
             </button>
             <button onClick={() => setShowDetails(s => !s)} className="w-full flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors py-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95">
                <InfoIcon className="w-4 h-4" />
                <span>{showDetails ? 'Hide' : 'Show'} Analysis</span>
                <svg className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
          </div>
        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showDetails ? 'max-h-[30rem] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="mt-4 space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700/50">
                <div>
                    <h4 className="font-semibold text-cyan-700 dark:text-cyan-300 mb-2 flex items-center gap-2"><SparklesIcon className="w-4 h-4" /> Primary Viral Trigger</h4>
                    <p className="text-slate-700 dark:text-slate-300 text-sm bg-slate-100 dark:bg-slate-900/50 p-3 rounded-md font-medium">{activeVariation.viral_trigger || 'Not specified'}</p>
                </div>
                <div>
                    <h4 className="font-semibold text-cyan-700 dark:text-cyan-300 mb-2">A/B Test Rationale</h4>
                    <p className="text-slate-600 dark:text-slate-400 text-xs italic bg-slate-100 dark:bg-slate-900/50 p-3 rounded-md">{post.optimization_notes}</p>
                </div>
                <div>
                    <h4 className="font-semibold text-cyan-700 dark:text-cyan-300 mb-2">Original Image Prompt</h4>
                    <EditableTextBlock
                        text={post.image_prompt}
                        isLoading={post.rewritingPart === 'image_prompt'}
                        onRewrite={(instruction) => onRewrite(activeVariationIndex, 'image_prompt', instruction)}
                        className="text-slate-600 dark:text-slate-400 text-xs italic bg-slate-100 dark:bg-slate-900/50 p-3 rounded-md"
                        isMono
                    />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export const PostCard = memo(PostCardComponent);