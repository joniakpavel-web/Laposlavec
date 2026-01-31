
import React, { useState, useEffect } from 'react';
import { DiceRoll } from '../types';
import { COLORS } from '../constants';

interface Props {
  history: DiceRoll[];
  onHistoryUpdate: (history: DiceRoll[]) => void;
}

const DICE_TYPES = [4, 6, 8, 10, 12, 20, 100];

const DiceRoller: React.FC<Props> = ({ history, onHistoryUpdate }) => {
  const [rolling, setRolling] = useState<number | null>(null);
  const [lastResult, setLastResult] = useState<number | null>(null);

  const rollDie = (die: number) => {
    setRolling(die);
    setLastResult(null);
    
    // Artificial delay for animation
    setTimeout(() => {
      const result = Math.floor(Math.random() * die) + 1;
      const newRoll: DiceRoll = {
        id: Date.now().toString(),
        die,
        result,
        timestamp: Date.now()
      };
      setLastResult(result);
      setRolling(null);
      onHistoryUpdate([newRoll, ...history.slice(0, 49)]);
    }, 400);
  };

  return (
    <div className="space-y-6 flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-300">
      <h2 className="text-xl font-serif-fantasy text-amber-500 border-b border-amber-900 pb-2">Hádzač kociek</h2>
      
      {/* Dice Selection */}
      <div className="grid grid-cols-4 gap-3">
        {DICE_TYPES.map(d => (
          <button
            key={d}
            disabled={rolling !== null}
            onClick={() => rollDie(d)}
            className={`${COLORS.card} border ${COLORS.goldBorder} rounded-lg p-3 flex flex-col items-center justify-center active:scale-95 transition-transform disabled:opacity-50`}
          >
            <span className="text-[10px] text-stone-500 uppercase mb-1">D{d}</span>
            <div className="w-8 h-8 rounded bg-amber-900/20 flex items-center justify-center border border-amber-700/50">
               <span className="font-serif-fantasy text-amber-500">d{d}</span>
            </div>
          </button>
        ))}
        <button
            onClick={() => onHistoryUpdate([])}
            className="col-span-1 bg-stone-800 border border-stone-700 rounded-lg text-xs uppercase text-stone-400 font-serif-fantasy"
          >
            Clear
          </button>
      </div>

      {/* Animated Result Area */}
      <div className={`h-32 flex items-center justify-center border-y border-stone-800 bg-stone-900/50 rounded-xl relative overflow-hidden`}>
        {rolling ? (
          <div className="text-4xl font-serif-fantasy text-amber-500 animate-roll">
            d{rolling}
          </div>
        ) : lastResult ? (
          <div className="text-center animate-in zoom-in duration-300">
             <span className="text-xs text-stone-500 uppercase block mb-1">Výsledok</span>
             <span className="text-6xl font-serif-fantasy text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">
               {lastResult}
             </span>
          </div>
        ) : (
          <span className="text-stone-600 font-serif-fantasy italic">Hoď si kockou...</span>
        )}
      </div>

      {/* History */}
      <div className="flex-1 overflow-y-auto">
        <h3 className="text-xs font-serif-fantasy text-stone-500 uppercase tracking-widest mb-2 px-1">História hodov</h3>
        <div className="space-y-2">
          {history.length === 0 ? (
            <div className="text-center text-stone-700 text-sm italic py-4">Žiadne predošlé hody</div>
          ) : (
            history.map(roll => (
              <div key={roll.id} className="flex justify-between items-center bg-stone-900 border border-stone-800 p-3 rounded-lg animate-in slide-in-from-left-4 duration-300">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded bg-amber-900/10 border border-amber-900 flex items-center justify-center text-xs font-serif-fantasy text-amber-600">
                    d{roll.die}
                  </div>
                  <span className="text-sm text-stone-400">{new Date(roll.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                </div>
                <span className={`text-xl font-serif-fantasy ${roll.result === roll.die ? 'text-green-500 font-bold' : roll.result === 1 ? 'text-red-500' : 'text-stone-200'}`}>
                  {roll.result}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DiceRoller;
