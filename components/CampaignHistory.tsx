

import React from 'react';
import type { ApiResponse } from '../types';
import { HistoryIcon } from './icons/HistoryIcon';
import { TrashIcon } from './icons/TrashIcon';

interface CampaignHistoryProps {
  history: ApiResponse[];
  onLoad: (campaign: ApiResponse) => void;
  onDelete: (campaignId: string) => void;
}

const EmptyState: React.FC = () => (
    <div className="text-center py-12 px-4">
        <div className="mx-auto w-16 h-16 flex items-center justify-center bg-slate-200 dark:bg-slate-700/50 rounded-full text-cyan-500 dark:text-cyan-400">
            <HistoryIcon className="w-8 h-8"/>
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-800 dark:text-white">No Campaigns Yet</h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Your generated campaigns will appear here for you to review and reload.</p>
    </div>
);

export const CampaignHistory: React.FC<CampaignHistoryProps> = ({
  history,
  onLoad,
  onDelete,
}) => {
  return (
      <div 
        className="relative w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-4 sm:p-6 mt-8 animate-fade-in"
      >
        <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100 flex items-center gap-3">
          <HistoryIcon className="w-6 h-6 text-cyan-500 dark:text-cyan-300" />
          Campaign History
        </h2>
        
        <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-2">
          {history.length === 0 ? (
            <EmptyState />
          ) : (
            history.map(campaign => (
              <div 
                key={campaign.id}
                className="bg-slate-50 dark:bg-slate-900/50 p-3 sm:p-4 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:ring-2 hover:ring-purple-500/50 gap-3 sm:gap-0"
              >
                <div className="flex-grow">
                  <p className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-sm">{campaign.campaignTitle}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(campaign.timestamp).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => onLoad(campaign)}
                    className="px-3 py-1.5 text-sm font-semibold bg-purple-600 text-white rounded-md hover:bg-purple-500 transition-colors active:scale-95"
                  >
                    Load
                  </button>
                  <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(campaign.id);
                    }}
                    className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-md hover:bg-red-500/10 active:scale-95"
                    aria-label={`Delete campaign ${campaign.campaignTitle}`}
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
  );
};