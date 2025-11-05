

import React, { useState } from 'react';
import type { GroundingMetadata, GroundingChunk, WebGroundingSource, MapsGroundingSource } from '../types';

const GenericFavicon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
    </svg>
);

const MapPinIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>
    </svg>
);


const WebSourceItem: React.FC<{ source: WebGroundingSource }> = ({ source }) => {
    const [hasError, setHasError] = useState(false);
    const faviconUrl = `https://www.google.com/s2/favicons?sz=32&domain_url=${encodeURIComponent(source.title || source.uri)}`;

    return (
        <a
            href={source.uri}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors group flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-md border border-slate-200 dark:border-slate-700 hover:border-cyan-400 dark:hover:border-cyan-500 hover:shadow-sm"
        >
            {hasError ? (
                <GenericFavicon className="w-4 h-4 rounded-full flex-shrink-0 text-slate-400" />
            ) : (
                <img
                    src={faviconUrl}
                    alt=""
                    className="w-4 h-4 flex-shrink-0"
                    onError={() => setHasError(true)}
                />
            )}
            <span className="font-semibold truncate">{source.title || 'Untitled Source'}</span>
        </a>
    )
}

const MapSourceItem: React.FC<{ source: MapsGroundingSource }> = ({ source }) => (
    <a 
        href={source.uri} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-sm transition-colors group flex flex-col items-start gap-1 bg-white dark:bg-slate-800 p-2 rounded-md border border-slate-200 dark:border-slate-700 hover:border-red-400 dark:hover:border-red-500 hover:shadow-sm"
    >
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300">
            <MapPinIcon className="w-4 h-4 flex-shrink-0"/>
            <span className="font-semibold truncate">{source.title || 'Untitled Place'}</span>
        </div>
        {source.placeAnswerSources?.reviewSnippets?.slice(0, 1).map((snippet, i) => (
            <p key={i} className="text-xs italic text-slate-500 dark:text-slate-400 pl-6 w-full">"{snippet.text}"</p>
        ))}
    </a>
);


export const SourcesDisplay: React.FC<{ groundingMetadata: GroundingMetadata }> = ({ groundingMetadata }) => {
  if (!groundingMetadata.groundingChunks || groundingMetadata.groundingChunks.length === 0) {
    return null;
  }

  const uniqueSources = Array.from(
      new Map(groundingMetadata.groundingChunks.map((item: GroundingChunk) => [(item.web?.title || item.maps?.title), item])).values()
  ).filter((chunk: GroundingChunk) => chunk.web || chunk.maps);

  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
      <h4 className="text-md font-bold text-green-700 dark:text-green-300 mb-3">
        Sources Used for Analysis
      </h4>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {/* FIX: Explicitly type 'chunk' as GroundingChunk to resolve type inference error where it was being treated as 'unknown'. */}
        {uniqueSources.map((chunk: GroundingChunk, index) => (
          <li key={index}>
            {chunk.web && <WebSourceItem source={chunk.web} />}
            {chunk.maps && <MapSourceItem source={chunk.maps} />}
          </li>
        ))}
      </ul>
    </div>
  );
};
