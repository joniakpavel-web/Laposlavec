
import React, { useState } from 'react';
import { LogEntry } from '../types';
import { COLORS, Icons } from '../constants';

interface Props {
  log: LogEntry[];
  onLogUpdate: (newLog: LogEntry[]) => void;
}

const GameLog: React.FC<Props> = ({ log, onLogUpdate }) => {
  const [newNote, setNewNote] = useState('');

  const handleDelete = (id: string) => {
    onLogUpdate(log.filter(entry => entry.id !== id));
  };

  const handleAddNote = () => {
      if (!newNote.trim()) return;
      
      const newEntry: LogEntry = {
          id: `manual_${Date.now()}`,
          timestamp: Date.now(),
          text: newNote.trim()
      };
      
      onLogUpdate([newEntry, ...log]);
      setNewNote('');
  };

  return (
    <div className="flex flex-col h-full">
       <div className="flex-shrink-0 mb-4 bg-stone-900/30 p-3 rounded-lg border border-stone-800">
            <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Napíš vlastnú poznámku..."
                className="w-full bg-stone-950 border border-stone-800 rounded p-3 text-sm text-stone-300 focus:outline-none focus:border-amber-700 resize-none h-20 mb-2 placeholder:text-stone-700"
            />
            <button 
                onClick={handleAddNote}
                disabled={!newNote.trim()}
                className={`w-full py-2 rounded text-xs font-serif-fantasy uppercase tracking-wider transition-colors 
                    ${!newNote.trim() 
                        ? 'bg-stone-800 text-stone-600 cursor-not-allowed' 
                        : `${COLORS.burgundy} ${COLORS.burgundyText} border border-red-900/50 hover:bg-red-900`
                    }`}
            >
                Pridať záznam
            </button>
       </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {log.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center text-stone-600 p-4 border-2 border-dashed border-stone-900 rounded-xl">
                <Icons.Book />
                <h3 className="text-sm font-serif-fantasy text-stone-500 mt-2">Denník je zatiaľ prázdny</h3>
                <p className="text-[10px] mt-1 max-w-xs opacity-60">
                Ukladaj správy z chatu alebo si píš vlastné poznámky.
                </p>
            </div>
        ) : (
            log.map(entry => (
                <div 
                key={entry.id} 
                className="bg-stone-950/50 border border-stone-800 p-4 rounded-lg flex items-start justify-between group hover:border-amber-900/30 transition-colors"
                >
                <div className="flex-1 min-w-0">
                    <p className="text-stone-300 text-sm leading-relaxed pr-4 whitespace-pre-wrap">{entry.text}</p>
                    <span className="text-[10px] text-stone-500 font-serif-fantasy uppercase tracking-wider mt-2 block">
                    {new Date(entry.timestamp).toLocaleString('sk-SK', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
                <button 
                    onClick={() => handleDelete(entry.id)} 
                    className="text-stone-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 p-1"
                    title="Odstrániť záznam"
                >
                    <Icons.Trash />
                </button>
                </div>
            ))
        )}
      </div>
    </div>
  );
};

export default GameLog;
