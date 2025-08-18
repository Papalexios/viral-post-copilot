
import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { HistoryIcon } from './icons/HistoryIcon';
import { KeyIcon } from './icons/KeyIcon';
import { PublishIcon } from './icons/PublishIcon';
import type { ActiveView } from '../App';


interface BottomNavBarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
}

const NavItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
        isActive ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
      }`}
    >
        {isActive && <div className="absolute top-0 h-0.5 w-full bg-cyan-400"></div>}
        {icon}
        <span className={`text-xs mt-1 font-medium ${isActive ? 'text-cyan-400' : 'text-slate-500'}`}>{label}</span>
    </button>
);


export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeView, setActiveView }) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-900/80 backdrop-blur-lg border-t border-slate-700/50 z-50 flex items-center justify-around">
        <NavItem
            icon={<SparklesIcon className="w-6 h-6" />}
            label="New"
            isActive={activeView === 'generator'}
            onClick={() => setActiveView('generator')}
        />
        <NavItem
            icon={<HistoryIcon className="w-6 h-6" />}
            label="History"
            isActive={activeView === 'history'}
            onClick={() => setActiveView('history')}
        />
        <NavItem
            icon={<PublishIcon className="w-6 h-6" />}
            label="Publishing"
            isActive={activeView === 'wordpress'}
            onClick={() => setActiveView('wordpress')}
        />
        <NavItem
            icon={<KeyIcon className="w-6 h-6" />}
            label="API"
            isActive={activeView === 'config'}
            onClick={() => setActiveView('config')}
        />
    </nav>
  );
};