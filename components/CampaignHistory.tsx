
import React from 'react';
import type { ApiResponse } from '../types';
import { HistoryIcon } from './icons/HistoryIcon';
import { TrashIcon } from './icons/TrashIcon';

interface CampaignHistoryProps {
  isOpen: boolean;
  history: ApiResponse[];
  onLoad: (campaign: ApiResponse) => void;
  onDelete: (campaignId: string) => void;
  onClose: () => void;
}

export const CampaignHistory: React.FC<CampaignHistoryProps> = ({
  isOpen,
  history,
  onLoad,
  onDelete,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-40 flex justify-center items-start pt-20"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6 mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4 text-slate-100 flex items-center gap-3">
          <HistoryIcon className="w-6 h-6 text-cyan-300" />
          Campaign History
        </h2>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
          aria-label="Close"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>

        <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-2">
          {history.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No campaigns generated yet.</p>
          ) : (
            history.map(campaign => (
              <div 
                key={campaign.id}
                className="bg-slate-900/50 p-4 rounded-lg flex justify-between items-center transition-colors hover:bg-slate-700/50"
              >
                <div>
                  <p className="font-bold text-slate-200 truncate max-w-sm">{campaign.campaignTitle}</p>
                  <p className="text-xs text-slate-400">{new Date(campaign.timestamp).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onLoad(campaign)}
                    className="px-3 py-1.5 text-sm font-semibold bg-purple-600 text-white rounded-md hover:bg-purple-500 transition-colors"
                  >
                    Load
                  </button>
                  <button
                    onClick={() => onDelete(campaign.id)}
                    className="p-2 text-slate-400 hover:text-red-400 transition-colors"
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
    </div>
  );
};
