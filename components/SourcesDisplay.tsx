
import React from 'react';
import type { GroundingMetadata } from '../types';

interface SourcesDisplayProps {
  groundingMetadata: GroundingMetadata;
}

export const SourcesDisplay: React.FC<SourcesDisplayProps> = ({ groundingMetadata }) => {
  if (!groundingMetadata.groundingChunks || groundingMetadata.groundingChunks.length === 0) {
    return null;
  }
  
  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
      <h4 className="text-md font-bold text-green-700 dark:text-green-300 mb-3">
        Sources Used for Analysis
      </h4>
      <ul className="space-y-2">
        {groundingMetadata.groundingChunks.map((chunk, index) => (
          <li key={index}>
            <a 
              href={chunk.web.uri}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 hover:underline transition-colors block group"
            >
              <span className="font-semibold block truncate">{chunk.web.title || 'Untitled Source'}</span>
              <span className="text-xs text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-400 truncate">{chunk.web.uri}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};