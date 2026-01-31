
import React, { useRef, useState } from 'react';
import { CampaignSettings } from '../types';
import { COLORS, Icons } from '../constants';

interface Props {
  campaigns: CampaignSettings[];
  onLoad: (campaignId: string) => void;
  onDelete: (campaignId: string) => void;
  onImport: (campaign: CampaignSettings) => void;
  onBack: () => void;
}

const LoadScreen: React.FC<Props> = ({ campaigns, onLoad, onDelete, onImport, onBack }) => {
  const importInputRef = useRef<HTMLInputElement>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const sortedCampaigns = [...campaigns].sort((a, b) => b.lastPlayed - a.lastPlayed);

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error("File is not readable");
        const importedCampaign = JSON.parse(text);

        // Basic validation
        if (importedCampaign.id && importedCampaign.name && Array.isArray(importedCampaign.party)) {
          onImport(importedCampaign);
        } else {
          alert('Chyba: Súbor nespĺňa formát kampane.');
        }
      } catch (error) {
        console.error("Failed to import campaign:", error);
        alert('Chyba pri importe súboru. Uistite sa, že je to platný súbor kampane.');
      }
    };
    reader.readAsText(file);
    // Reset file input value to allow re-importing the same file
    if(importInputRef.current) {
        importInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-stone-950 p-6 animate-in slide-in-from-right duration-500 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
            <button onClick={onBack} className="text-amber-500 p-2 -ml-2 rounded-full hover:bg-stone-900">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <h2 className="text-2xl font-serif-fantasy text-stone-200 uppercase tracking-widest">Načítať Hru</h2>
        </div>
        <button onClick={handleImportClick} title="Importovať kampaň" className="text-amber-500 p-3 rounded-full hover:bg-amber-900/20 active:scale-95 transition-transform">
            <Icons.Upload />
        </button>
        <input 
            type="file" 
            ref={importInputRef} 
            className="hidden" 
            accept=".json"
            onChange={handleFileImport}
        />
      </div>

      <div className="space-y-4 pb-12">
        {sortedCampaigns.length === 0 ? (
          <div className="text-center text-stone-600 italic py-16 border-2 border-dashed border-stone-800 rounded-xl">
            <p className="font-serif-fantasy text-lg">Žiadne uložené kampane.</p>
            <p className="text-xs mt-2">Vytvor novú hru z hlavného menu alebo importuj existujúcu.</p>
          </div>
        ) : (
          sortedCampaigns.map(campaign => {
            const isConfirming = confirmDeleteId === campaign.id;
            
            return (
              <div 
                key={campaign.id} 
                onClick={() => { if(isConfirming) setConfirmDeleteId(null); }}
                className={`${COLORS.card} border ${isConfirming ? 'border-red-800 bg-red-950/10' : COLORS.goldBorder} p-4 rounded-lg grid grid-cols-[1fr_auto] items-center gap-4 relative overflow-hidden transition-all duration-300`}
              >
                <div className="min-w-0">
                  <h3 className={`text-lg font-serif-fantasy truncate pr-2 ${isConfirming ? 'text-red-400' : 'text-amber-500'}`}>
                    {campaign.name}
                  </h3>
                  <p className="text-xs text-stone-500 truncate">
                    {campaign.party.length} {campaign.party.length === 1 ? 'hrdina' : campaign.party.length > 1 && campaign.party.length < 5 ? 'hrdinovia' : 'hrdinov'} | {campaign.lastPlayed ? new Date(campaign.lastPlayed).toLocaleDateString() : 'Nikdy'}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 z-20">
                  {isConfirming ? (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-200">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(campaign.id);
                          setConfirmDeleteId(null);
                        }}
                        className="px-3 py-2 rounded bg-red-600 text-white text-xs font-bold font-serif-fantasy uppercase tracking-wider hover:bg-red-500 shadow-lg"
                      >
                        Zmazať
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteId(null);
                        }}
                        className="px-3 py-2 rounded bg-stone-700 text-stone-300 text-xs font-serif-fantasy uppercase tracking-wider hover:bg-stone-600"
                      >
                        Zrušiť
                      </button>
                    </div>
                  ) : (
                    <>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onLoad(campaign.id);
                        }}
                        className={`px-4 py-3 rounded font-serif-fantasy uppercase tracking-widest text-xs ${COLORS.burgundy} ${COLORS.burgundyText} border border-red-900/50 hover:bg-red-900 hover:text-white transition-colors flex-shrink-0 active:scale-95`}
                      >
                        Načítať
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteId(campaign.id);
                        }}
                        className="p-3 text-stone-500 hover:text-red-500 hover:bg-stone-800 rounded-full transition-colors active:scale-95"
                        title="Odstrániť kampaň"
                      >
                        <Icons.Trash />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LoadScreen;
