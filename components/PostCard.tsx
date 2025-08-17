


import React, { useState } from 'react';
import type { GeneratedPost, PostVariation, Platform } from '../types';
import { PLATFORMS } from '../constants';
import { CopyIcon } from './icons/CopyIcon';
import { InfoIcon } from './icons/InfoIcon';

// Inlined SVG icons to avoid creating new files
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
}

const ViralScoreIndicator: React.FC<{ score: number }> = ({ score }) => {
  const circumference = 2 * Math.PI * 20;
  const offset = circumference - (score / 100) * circumference;
  const color = score > 95 ? 'text-green-400' : score > 88 ? 'text-yellow-400' : 'text-orange-400';

  return (
    <div className="relative flex items-center justify-center">
      <svg className="w-12 h-12 transform -rotate-90">
        <circle className="text-slate-700" strokeWidth="4" stroke="currentColor" fill="transparent" r="20" cx="24" cy="24" />
        <circle
          className={color}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r="20"
          cx="24"
          cy="24"
          style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
        />
      </svg>
      <span className={`absolute text-sm font-bold ${color}`}>{score}</span>
    </div>
  );
};

const ImageDisplay: React.FC<{ post: GeneratedPost; onRegenerate: () => void; }> = ({ post, onRegenerate }) => {
  return (
    <div className="relative aspect-square w-full rounded-lg group">
      {post.imageIsLoading && (
        <div className="absolute inset-0 bg-slate-900/50 flex flex-col items-center justify-center text-center p-4 rounded-lg z-10">
          <div className="w-8 h-8 border-2 border-slate-600 border-t-purple-400 rounded-full animate-spin"></div>
          <p className="mt-2 text-xs text-slate-400">Generating Image...</p>
        </div>
      )}
      {post.imageUrl && post.imageUrl !== 'error' && (
        <img src={post.imageUrl} alt={post.image_prompt} className="aspect-square w-full object-cover rounded-lg" />
      )}
      {post.imageUrl === 'error' && (
        <div className="absolute inset-0 bg-red-900/20 flex flex-col items-center justify-center text-center p-4 rounded-lg border border-red-800">
          <p className="text-sm font-semibold text-red-300">Image Failed</p>
          <p className="mt-1 text-xs text-red-400">Could not generate image.</p>
        </div>
      )}
      {!post.imageIsLoading && (
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
          <button onClick={onRegenerate} className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 border border-slate-600 rounded-full text-white hover:bg-slate-700 transition-colors" aria-label="Regenerate Image">
            <RedoIcon className="w-4 h-4" />
            <span>Regenerate</span>
          </button>
        </div>
      )}
    </div>
  )
};

const PlatformPreview: React.FC<{ post: GeneratedPost, variation: PostVariation }> = ({ post, variation }) => {
    const BrandIcon = () => <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-400 flex-shrink-0"></div>;
    
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


export const PostCard: React.FC<PostCardProps> = ({ post, onRegenerate }) => {
  const [copiedStates, setCopiedStates] = useState<{ [key: number]: boolean }>({});
  const [shareCopied, setShareCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [activeVariationIndex, setActiveVariationIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'content' | 'preview'>('content');

  const platformInfo = PLATFORMS.find(p => p.name === post.platform);
  const IconComponent = platformInfo?.icon;
  const activeVariation = post.variations[activeVariationIndex];

  const handleCopyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStates(prev => ({ ...prev, [index]: true }));
    setTimeout(() => setCopiedStates(prev => ({ ...prev, [index]: false })), 2000);
  };
  
  const handleShare = () => {
    const textToCopy = `${activeVariation.share_snippet}\n\n${activeVariation.post_text}\n\n---\n✨ Generated with Viral Post Co-pilot AI`;
    navigator.clipboard.writeText(textToCopy);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };
  

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl shadow-lg flex flex-col overflow-hidden transition-all duration-300 hover:border-purple-500/50 hover:shadow-purple-900/40">
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
          <button onClick={() => setViewMode('content')} className={`w-1/2 py-2 text-sm font-semibold rounded-md transition-colors ${viewMode === 'content' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:bg-slate-700/50'}`}>Content</button>
          <button onClick={() => setViewMode('preview')} className={`w-1/2 py-2 text-sm font-semibold rounded-md transition-colors ${viewMode === 'preview' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:bg-slate-700/50'}`}>Preview</button>
      </div>

      <div className="p-5 space-y-4 flex-grow">
        {viewMode === 'preview' ? (
          <div className="flex items-center justify-center bg-slate-800 p-4 rounded-lg">
            <PlatformPreview post={post} variation={activeVariation} />
          </div>
        ) : (
          <>
            {/* Image Display */}
            <ImageDisplay post={post} onRegenerate={onRegenerate} />

            {/* A/B Test Tabs */}
            <div className="flex bg-slate-900/50 border border-slate-700 rounded-lg p-1 space-x-1">
                {post.variations.map((variation, index) => (
                    <button
                        key={index}
                        onClick={() => setActiveVariationIndex(index)}
                        className={`w-full text-center px-3 py-2 rounded-md transition-colors duration-300 font-semibold text-sm ${
                            activeVariationIndex === index ? 'bg-purple-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                        }`}
                    >
                        {variation.variation_name.split(':')[0]}
                    </button>
                ))}
            </div>

            {/* Post Content */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-purple-300">{activeVariation.variation_name}</h4>
                <div className="flex items-center gap-4">
                  <button onClick={handleShare} className="relative group flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
                      <ShareIcon className="w-4 h-4" /> {shareCopied ? 'Copied!' : 'Share'}
                      <span className="absolute bottom-full mb-2 w-max bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Copy share text</span>
                  </button>
                   <button onClick={() => handleCopyText(activeVariation.post_text, activeVariationIndex)} className="relative group flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
                      <CopyIcon className="w-4 h-4" /> {copiedStates[activeVariationIndex] ? 'Copied!' : 'Copy'}
                       <span className="absolute bottom-full mb-2 w-max bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">Copy post text only</span>
                  </button>
                </div>
              </div>
              <p className="text-slate-300 bg-slate-900/50 p-3 rounded-md text-sm whitespace-pre-wrap">{activeVariation.post_text}</p>
              <p className="text-slate-400 mt-2 text-xs italic"><strong>CTA:</strong> {activeVariation.call_to_action}</p>
            </div>
          </>
        )}
      </div>
      <div className="p-5 border-t border-slate-700/50">
        <button onClick={() => setShowDetails(!showDetails)} className="w-full flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-white transition-colors py-2 bg-slate-800 rounded-lg border border-slate-700 hover:bg-slate-700">
            <InfoIcon className="w-4 h-4" />
            <span>{showDetails ? 'Hide' : 'Show'} Full Analysis</span>
        </button>
        {showDetails && (
            <div className="mt-4 space-y-4 pt-4 border-t border-slate-700/50">
                <div>
                    <h4 className="font-semibold text-cyan-300 mb-2">A/B Test Rationale</h4>
                    <p className="text-slate-400 text-xs italic bg-slate-900/50 p-3 rounded-md">{post.optimization_notes}</p>
                </div>
                <div>
                    <h4 className="font-semibold text-cyan-300 mb-2">Original Image Prompt</h4>
                    <p className="text-slate-400 text-xs italic bg-slate-900/50 p-3 rounded-md font-mono">{post.image_prompt}</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
