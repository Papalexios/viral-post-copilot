import React, { useState, useEffect } from 'react';
import type { GeneratedPost, PostVariation, Platform } from '../types';
import { PLATFORMS } from '../constants';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import { InfoIcon } from './icons/InfoIcon';
import { WordPressIcon } from './icons/WordPressIcon';
import { SkeletonLoader } from './SkeletonLoader';
import { SparklesIcon } from './icons/SparklesIcon';

const RedoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M23 4v6h-6"></path>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
  </svg>
);

const ShareIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
    <polyline points="16 6 12 2 8 6"></polyline>
    <line x1="12" y1="2" x2="12" y2="15"></line>
  </svg>
);

interface PostCardProps {
  post: GeneratedPost;
  onRegenerate: () => void;
  onPublish: (variationIndex: number) => void;
  isWordPressConfigured: boolean;
}

const ViralScoreIndicator: React.FC<{ score: number }> = ({ score }) => {
  const color = score > 95 ? 'bg-green-400/20 text-green-300 border-green-500/30' : score > 88 ? 'bg-yellow-400/20 text-yellow-300 border-yellow-500/30' : 'bg-orange-400/20 text-orange-300 border-orange-500/30';
  return (
    <div className={`text-sm font-bold px-3 py-1 rounded-full border ${color}`}>
        {score}
    </div>
  );
};

const ImageDisplay: React.FC<{ post: GeneratedPost; onRegenerate: () => void; }> = ({ post, onRegenerate }) => {
  return (
    <div className="relative aspect-square w-full rounded-lg group overflow-hidden bg-slate-900">
      {post.imageIsLoading && <SkeletonLoader />}
      {post.imageUrl && post.imageUrl !== 'error' && (
        <img src={post.imageUrl} alt={post.image_prompt} className="aspect-square w-full object-cover rounded-lg animate-fade-in" />
      )}
      {post.imageUrl === 'error' && (
        <div className="absolute inset-0 bg-red-900/20 flex flex-col items-center justify-center text-center p-4 rounded-lg border border-red-800">
          <p className="text-sm font-semibold text-red-300">Image Failed</p>
          <p className="mt-1 text-xs text-red-400">Could not generate image.</p>
        </div>
      )}
      {!post.imageIsLoading && (
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
          <button onClick={onRegenerate} className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 border border-slate-600 rounded-full text-white hover:bg-slate-700 transition-colors active:scale-95" aria-label="Regenerate Image">
            <RedoIcon className="w-4 h-4" />
            <span>Regenerate</span>
          </button>
        </div>
      )}
    </div>
  )
};

const PlatformPreview: React.FC<{ post: GeneratedPost, variation: PostVariation }> = ({ post, variation }) => {
    const BrandIcon = () => <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-green-400 flex-shrink-0"></div>;
    
    switch(post.platform) {
        case 'Twitter':
            return (
                <div className="bg-slate-950 text-white p-4 rounded-xl font-[Helvetica] border border-slate-700 w-full text-left">
                    <div className="flex items-center gap-3">
                        <BrandIcon/>
                        <div>
                            <p className="font-bold">Your Brand <span className="text-slate-500 font-normal">@yourbrand · 1m</span></p>
                        </div>
                    </div>
                    <p className="my-3 text-slate-200 whitespace-pre-wrap">{variation.post_text}</p>
                    {post.imageUrl && post.imageUrl !== 'error' && <img src={post.imageUrl} className="rounded-xl border border-slate-700 mt-2" />}
                </div>
            );
        case 'Instagram':
             return (
                <div className="bg-slate-950 text-white rounded-xl border border-slate-700 w-full text-left overflow-hidden">
                    <div className="p-3 flex items-center gap-3">
                       <BrandIcon/> <p className="font-bold">yourbrand</p>
                    </div>
                    {post.imageUrl && post.imageUrl !== 'error' ? 
                        <img src={post.imageUrl} className="w-full aspect-square object-cover" /> :
                        <div className="w-full aspect-square bg-slate-800 flex items-center justify-center text-slate-500">Image Preview</div>
                    }
                    <div className="p-3 text-sm">
                        <p><strong className="mr-1">yourbrand</strong>{variation.post_text}</p>
                        <p className="text-slate-500 mt-2">{variation.call_to_action}</p>
                    </div>
                </div>
            );
        default: // LinkedIn, Facebook, etc.
             return (
                <div className="bg-white text-slate-900 p-4 rounded-lg w-full text-left font-sans">
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
                </div>
            );
    }
};

const FunnelStageBadge: React.FC<{ stage?: string }> = ({ stage }) => {
    if (!stage) return null;
    const colors = {
        'Awareness': 'bg-blue-900/50 text-blue-300 border-blue-700/50',
        'Engagement': 'bg-purple-900/50 text-purple-300 border-purple-700/50',
        'Conversion': 'bg-green-900/50 text-green-300 border-green-700/50',
    };
    const stageColor = colors[stage as keyof typeof colors] || 'bg-slate-700 text-slate-300';
    
    return (
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${stageColor}`}>
            {stage}
        </span>
    );
};

export const PostCard: React.FC<PostCardProps> = ({ post, onRegenerate, onPublish, isWordPressConfigured }) => {
  const [copyStates, setCopyStates] = useState<{ [key: string]: boolean }>({});
  const [showDetails, setShowDetails] = useState(false);
  const [activeVariationIndex, setActiveVariationIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'content' | 'preview'>('content');

  const platformInfo = PLATFORMS.find(p => p.name === post.platform);
  const IconComponent = platformInfo?.icon;
  const activeVariation = post.variations[activeVariationIndex];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopyStates(prev => ({ ...prev, [id]: true }));
    setTimeout(() => setCopyStates(prev => ({ ...prev, [id]: false })), 2000);
  };
  
  const CopyButton: React.FC<{ text: string, id: string, label: string }> = ({ text, id, label }) => {
    const isCopied = copyStates[id] || false;
    return (
        <button onClick={() => handleCopy(text, id)} className="relative group flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors active:scale-95">
            {isCopied ? <CheckIcon className="w-4 h-4 text-green-400"/> : <CopyIcon className="w-4 h-4" />}
            {isCopied ? 'Copied!' : 'Copy'}
            <span className="absolute bottom-full mb-2 w-max bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">{label}</span>
        </button>
    );
  };

  const PublishButton: React.FC = () => {
    if (!isWordPressConfigured || post.platform === 'Twitter' || post.platform === 'Instagram') return null;

    const isDisabled = post.imageIsLoading || !post.imageUrl || post.imageUrl === 'error' || post.wordpressStatus === 'publishing';
    
    switch (post.wordpressStatus) {
        case 'publishing':
            return <button disabled className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold bg-slate-700 text-slate-300 rounded-lg cursor-wait"><div className="w-4 h-4 border-2 border-slate-500 border-t-white rounded-full animate-spin"></div>Publishing...</button>;
        case 'published':
            return <a href={post.wordpressUrl} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors">View Post</a>;
        case 'error':
             return (
                <div className="w-full">
                    <button onClick={() => onPublish(activeVariationIndex)} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors active:scale-95">Retry Publish</button>
                    <p className="text-xs text-red-400 mt-1 text-center truncate" title={post.wordpressError}>{post.wordpressError}</p>
                </div>
            );
        default: // idle
            return <button onClick={() => onPublish(activeVariationIndex)} disabled={isDisabled} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"><WordPressIcon className="w-4 h-4" /> Publish to WordPress</button>;
    }
  };


  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl shadow-lg flex flex-col overflow-hidden transition-all duration-300 hover:border-green-500/50 hover:shadow-green-900/40">
      <div className="p-5 flex justify-between items-start bg-slate-900/50 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 text-slate-300">
            {IconComponent && <IconComponent />}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-200">{post.platform} Post</h3>
            <FunnelStageBadge stage={post.funnel_stage} />
          </div>
        </div>
        <div className="text-right">
            <p className="text-xs text-slate-400 mb-1">Viral Score</p>
            <ViralScoreIndicator score={post.viral_score} />
        </div>
      </div>
       <div className="p-1.5 bg-slate-900/50 flex border-b border-slate-700">
          <button onClick={() => setViewMode('content')} className={`w-1/2 py-2 text-sm font-semibold rounded-md transition-colors active:scale-95 ${viewMode === 'content' ? 'bg-green-600 text-white' : 'text-slate-400 hover:bg-slate-700/50'}`}>Content</button>
          <button onClick={() => setViewMode('preview')} className={`w-1/2 py-2 text-sm font-semibold rounded-md transition-colors active:scale-95 ${viewMode === 'preview' ? 'bg-green-600 text-white' : 'text-slate-400 hover:bg-slate-700/50'}`}>Preview</button>
      </div>

      <div className="p-5 space-y-4 flex-grow">
        {viewMode === 'preview' ? (
          <div className="flex items-center justify-center bg-slate-800 p-4 rounded-lg">
            <PlatformPreview post={post} variation={activeVariation} />
          </div>
        ) : (
          <>
            <ImageDisplay post={post} onRegenerate={onRegenerate} />
            <div className="flex bg-slate-900/50 border border-slate-700 rounded-lg p-1 space-x-1">
                {post.variations.map((variation, index) => (
                    <button
                        key={index}
                        onClick={() => setActiveVariationIndex(index)}
                        className={`w-full text-center px-3 py-2 rounded-md transition-colors duration-300 font-semibold text-sm active:scale-95 ${
                            activeVariationIndex === index ? 'bg-green-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                        }`}
                    >
                        {variation.variation_name.split(':')[0]}
                    </button>
                ))}
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-cyan-300">{activeVariation.variation_name}</h4>
                <div className="flex items-center gap-4">
                    <CopyButton text={activeVariation.post_title} id={`title-${activeVariationIndex}`} label="Copy Title" />
                    <CopyButton text={activeVariation.post_text} id={`post-${activeVariationIndex}`} label="Copy Body Text" />
                </div>
              </div>
              <h5 className="text-slate-200 font-bold bg-slate-900/50 p-3 rounded-md text-base">{activeVariation.post_title}</h5>
              <p className="text-slate-300 bg-slate-900/50 p-3 rounded-md text-sm whitespace-pre-wrap mt-2">{activeVariation.post_text}</p>
              <p className="text-slate-400 mt-2 text-xs italic"><strong>CTA:</strong> {activeVariation.call_to_action}</p>
            </div>
          </>
        )}
      </div>

      <div className="p-4 bg-slate-900/30 border-t border-slate-700/50 space-y-4">
          <PublishButton />
          <button onClick={() => setShowDetails(s => !s)} className="w-full flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-white transition-colors py-2 bg-slate-800 rounded-lg border border-slate-700 hover:bg-slate-700 active:scale-95">
            <InfoIcon className="w-4 h-4" />
            <span>{showDetails ? 'Hide' : 'Show'} Full Analysis</span>
            <svg className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showDetails ? 'max-h-[30rem] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="mt-4 space-y-4 pt-4 border-t border-slate-700/50">
                <div>
                    <h4 className="font-semibold text-cyan-300 mb-2 flex items-center gap-2"><SparklesIcon className="w-4 h-4" /> Primary Viral Trigger</h4>
                    <p className="text-slate-300 text-sm bg-slate-900/50 p-3 rounded-md font-medium">{activeVariation.viral_trigger || 'Not specified'}</p>
                </div>
                <div>
                    <h4 className="font-semibold text-cyan-300 mb-2">A/B Test Rationale</h4>
                    <p className="text-slate-400 text-xs italic bg-slate-900/50 p-3 rounded-md">{post.optimization_notes}</p>
                </div>
                <div>
                    <h4 className="font-semibold text-cyan-300 mb-2">Original Image Prompt</h4>
                    <p className="text-slate-400 text-xs italic bg-slate-900/50 p-3 rounded-md font-mono">{post.image_prompt}</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};