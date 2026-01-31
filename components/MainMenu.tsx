

import React from 'react';
import { COLORS, Icons } from '../constants';

interface Props {
  onContinue: () => void;
  onNewGame: () => void;
  onShowLoad: () => void;
  // onShowSettings: () => void; // Removed
}

const MainMenu: React.FC<Props> = ({ onContinue, onNewGame, onShowLoad /*, onShowSettings*/ }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-stone-950 p-8 space-y-12">
      <div className="text-center space-y-2">
        <h1 className="text-5xl font-serif-fantasy text-amber-500 font-bold tracking-widest drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]">
          MYTHIC TOME
        </h1>
        <p className="text-stone-500 font-serif-fantasy text-sm uppercase tracking-[0.3em]">AI Companion & DM</p>
      </div>

      <div className="w-full max-w-xs space-y-4">
        <MenuButton onClick={onContinue} label="POKRAČOVAŤ" sub="Načítať poslednú hru" highlight />
        <MenuButton onClick={onNewGame} label="NOVÁ HRA" sub="Začať nové dobrodružstvo" />
        <MenuButton onClick={onShowLoad} label="NAČÍTAŤ / SPRAVOVAŤ" sub="Vybrať zo zoznamu hier" />
        {/* Removed settings button */}
        {/* <MenuButton onClick={onShowSettings} label="NASTAVENIA" sub="Jazyk, modely, vizuál" /> */}
      </div>

      <div className="absolute bottom-8 text-stone-700 text-[10px] tracking-widest uppercase font-serif-fantasy">
        Powered by Gemini Pro
      </div>
    </div>
  );
};

const MenuButton: React.FC<{ onClick: () => void; label: string; sub: string; highlight?: boolean }> = ({ onClick, label, sub, highlight }) => (
  <button 
    onClick={onClick}
    className={`w-full group py-4 px-6 border ${highlight ? 'border-amber-700 bg-amber-900/10' : 'border-stone-800 bg-stone-900/50'} rounded-lg transition-all active:scale-95 hover:border-amber-500`}
  >
    <span className={`block text-lg font-serif-fantasy ${highlight ? 'text-amber-500' : 'text-stone-300'} tracking-widest group-hover:text-amber-400 transition-colors`}>
      {label}
    </span>
    <span className="block text-[8px] text-stone-600 uppercase tracking-tighter mt-1 group-hover:text-stone-500 transition-colors">
      {sub}
    </span>
  </button>
);

export default MainMenu;