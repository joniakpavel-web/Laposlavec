
import React, { useState, useEffect, useRef } from 'react';
import { Character, InventoryItem, Message, DiceRoll, Attribute, CampaignSettings, LogEntry, LanguageModelId } from './types';
import { Icons, COLORS, LANGUAGE_MODELS } from './constants';
import CharacterSheet from './components/CharacterSheet';
import DMChat from './components/DMChat';
import MainMenu from './components/MainMenu';
import SetupScreen from './components/SetupScreen';
import CharacterCreation from './components/CharacterCreation';
import LoadScreen from './components/LoadScreen';
import Modal from './components/Modal';
import GameLog from './components/GameLog';
import Helper from './components/Helper';
// import SettingsModal from './components/SettingsModal'; // Removed

const createNewCampaign = (): CampaignSettings => ({
  id: `campaign_${Date.now()}`,
  name: "Nové Dobrodružstvo",
  lastPlayed: Date.now(),
  description: "Začínaš v hlbokých lesoch neďaleko dediny Phandalin.",
  customRules: "Používaj pravidlá z Úvodnej sady D&D 5e.",
  party: [],
  messages: [
      { role: 'model', text: 'Vitajte v temnom kraji, cestovatelia. Váš príbeh začína práve teraz.' }
  ],
  diceHistory: [],
  gameLog: [],
  difficulty: 'moderate',
});

type ModalView = 'none' | 'characters' | 'logbook' | 'helper'; // Removed 'settings' from ModalView

const App: React.FC = () => {
  const [view, setView] = useState<'menu' | 'setup' | 'creation' | 'game' | 'load'>('menu');
  const [modalView, setModalView] = useState<ModalView>('none');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const [campaigns, setCampaigns] = useState<CampaignSettings[]>(() => {
    const saved = localStorage.getItem('mythic_campaigns');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(() => {
    return localStorage.getItem('mythic_active_campaign_id');
  });

  const [selectedLanguageModelId, setSelectedLanguageModelId] = useState<LanguageModelId>(() => {
    const savedModel = localStorage.getItem('mythic_language_model');
    return (savedModel as LanguageModelId) || 'gemini-3-flash-preview';
  });

  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const importHeroesInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('mythic_campaigns', JSON.stringify(campaigns));
    if (activeCampaignId) {
      localStorage.setItem('mythic_active_campaign_id', activeCampaignId);
    } else {
      localStorage.removeItem('mythic_active_campaign_id');
    }
  }, [campaigns, activeCampaignId]);
  
  useEffect(() => {
    localStorage.setItem('mythic_language_model', selectedLanguageModelId);
  }, [selectedLanguageModelId]);

  const activeCampaign = campaigns.find(c => c.id === activeCampaignId);
  
  const updateActiveCampaign = (updates: Partial<CampaignSettings>) => {
    if (!activeCampaignId) return;
    setCampaigns(prev => prev.map(c => 
      c.id === activeCampaignId ? { ...c, ...updates, lastPlayed: Date.now() } : c
    ));
  };
  
  const handleNewGame = () => {
    const newCampaign = createNewCampaign();
    setCampaigns(prev => [newCampaign, ...prev]);
    setActiveCampaignId(newCampaign.id);
    setActiveHeroIndex(0);
    setView('setup');
  };

  const onSetupComplete = (setupData: Partial<CampaignSettings>) => {
    updateActiveCampaign(setupData);
    setView('creation');
  };

  const onCreationComplete = (createdCharacters: Character[]) => {
    const existingParty = activeCampaign?.party || [];
    const newParty = [...existingParty, ...createdCharacters];
    
    // Create notification message
    const names = createdCharacters.map(c => c.name).join(", ");
    const messageText = existingParty.length > 0 
        ? `K družine sa pripojili noví hrdinovia: ${names}.`
        : `Vaša družina (${names}) sa vydáva na cestu. Dungeon Master je pripravený.`;

    updateActiveCampaign({ 
      party: newParty,
      messages: [...(activeCampaign?.messages || []), { role: 'model', text: messageText }],
    });
    
    // If starting fresh, clear logs, otherwise keep them
    if (existingParty.length === 0) {
        updateActiveCampaign({ diceHistory: [], gameLog: [] });
    }
    
    setActiveHeroIndex(0);
    setView('game');
  };
  
  const handleLoadCampaign = (campaignId: string) => {
    setActiveCampaignId(campaignId);
    setActiveHeroIndex(0);
    updateActiveCampaign({});
    setView('game');
  }

  const handleDeleteCampaign = (campaignId: string) => {
    const isDeletingActive = activeCampaignId === campaignId;
    setCampaigns(prev => prev.filter(c => c.id !== campaignId));
    if (isDeletingActive) {
      setActiveCampaignId(null);
    }
  }

  const handleExportCampaign = () => {
    if (!activeCampaign) return;
    const campaignJson = JSON.stringify(activeCampaign, null, 2);
    const blob = new Blob([campaignJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mythic_tome_kampaň_${activeCampaign.name.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsMenuOpen(false);
  };

  const handleImportCampaign = (importedCampaign: CampaignSettings) => {
    // Check for ID collision
    if (campaigns.some(c => c.id === importedCampaign.id)) {
      importedCampaign.id = `campaign_${Date.now()}`;
    }
    setCampaigns(prev => [importedCampaign, ...prev]);
    alert(`Kampaň "${importedCampaign.name}" bola úspešne importovaná!`);
  };
  
  const handleAddToLog = (messageText: string) => {
    if (!activeCampaignId) return;
    setCampaigns(prev => prev.map(c => {
      if (c.id === activeCampaignId) {
        if (c.gameLog.some(entry => entry.text === messageText)) return c;
        const newLogEntry: LogEntry = {
          id: `log_${Date.now()}`,
          timestamp: Date.now(),
          text: messageText,
        };
        return { ...c, gameLog: [newLogEntry, ...c.gameLog], lastPlayed: Date.now() };
      }
      return c;
    }));
  };

  // --- Hero Management Features ---

  const handleExportHeroes = () => {
    if (!activeCampaign) return;
    const heroesJson = JSON.stringify(activeCampaign.party, null, 2);
    const blob = new Blob([heroesJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hrdinovia_${activeCampaign.name.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsMenuOpen(false);
  };

  const handleImportHeroesClick = () => {
      importHeroesInputRef.current?.click();
  };

  const handleImportHeroesFile = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !activeCampaign) return;

      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const text = e.target?.result;
              if (typeof text !== 'string') throw new Error("File not readable");
              const importedData = JSON.parse(text);

              // Validate if it is an array of characters
              if (!Array.isArray(importedData) || importedData.length === 0 || !importedData[0].name || !importedData[0].stats) {
                  alert("Chyba: Súbor neobsahuje platné dáta hrdinov.");
                  return;
              }

              // Regenerate IDs to avoid conflicts
              const newHeroes: Character[] = importedData.map((hero: Character) => ({
                  ...hero,
                  id: `hero_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
              }));

              const newParty = [...activeCampaign.party, ...newHeroes];
              updateActiveCampaign({ 
                  party: newParty,
                  messages: [...activeCampaign.messages, { role: 'model', text: `Do družiny sa pripojili noví hrdinovia (Import): ${newHeroes.map(h => h.name).join(', ')}.` }]
              });
              alert(`Úspešne importovaných ${newHeroes.length} hrdinov.`);
              setIsMenuOpen(false);

          } catch (error) {
              console.error(error);
              alert("Chyba pri čítaní súboru.");
          }
      };
      reader.readAsText(file);
      if(importHeroesInputRef.current) importHeroesInputRef.current.value = '';
  };

  const handleRemoveHero = (heroId: string) => {
      if (!activeCampaign) return;
      const heroToRemove = activeCampaign.party.find(c => c.id === heroId);
      
      const newParty = activeCampaign.party.filter(c => c.id !== heroId);
      updateActiveCampaign({ 
          party: newParty,
          messages: [...activeCampaign.messages, { role: 'model', text: `${heroToRemove?.name || 'Hrdina'} opustil družinu.` }]
      });
      
      // Reset index to safe value
      setActiveHeroIndex(0);
      
      // Close modal if open (since CharacterSheet is inside modal)
      setModalView('none');
  };


  // Render Logic
  if (view === 'menu') {
    return <MainMenu 
      onContinue={() => activeCampaign ? setView('game') : handleNewGame()} 
      onNewGame={handleNewGame} 
      onShowLoad={() => setView('load')}
      // Removed onShowSettings prop
    />;
  }

  if(view === 'load') {
    return <LoadScreen 
      campaigns={campaigns}
      onLoad={handleLoadCampaign}
      onDelete={handleDeleteCampaign}
      onImport={handleImportCampaign}
      onBack={() => setView('menu')}
    />
  }
  
  if (!activeCampaign && (view === 'game' || view === 'setup' || view === 'creation')) {
     return <MainMenu onContinue={() => {}} onNewGame={handleNewGame} onShowLoad={() => setView('load')} />; // Removed onShowSettings
  }

  if (view === 'setup' && activeCampaign) {
    return <SetupScreen 
      initialCampaign={activeCampaign}
      onStart={onSetupComplete} 
      onBack={() => setView('menu')}
    />;
  }

  if (view === 'creation' && activeCampaign) {
    return <CharacterCreation 
      onComplete={onCreationComplete} 
      onBack={() => setView('setup')}
    />;
  }

  const currentCharacter = activeCampaign ? (activeCampaign.party[activeHeroIndex] || activeCampaign.party[0]) : null;

  if (activeCampaign && !currentCharacter && activeCampaign.party.length > 0) {
      setActiveHeroIndex(0);
  }

  if (activeCampaign && view === 'game' && !currentCharacter) {
      return <CharacterCreation onComplete={onCreationComplete} onBack={() => setView('setup')} />;
  }
  
  const handleCharacterUpdate = (char: Character) => {
    updateActiveCampaign({ party: activeCampaign!.party.map(c => c.id === char.id ? char : c)})
  };
  
  const handlePartyUpdate = (party: Character[]) => {
      updateActiveCampaign({ party });
  };

  if (view === 'game' && activeCampaign && currentCharacter) {
    return (
      <div className="flex flex-col h-screen max-h-screen overflow-hidden animate-in fade-in duration-500">
        <header className={`py-3 px-4 border-b ${COLORS.goldBorder} flex justify-between items-center ${COLORS.card} flex-shrink-0`}>
          <div className="relative">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-stone-400 hover:text-amber-500">
              <Icons.Menu />
            </button>
            {isMenuOpen && (
              <div className="absolute left-0 mt-2 w-80 bg-stone-800 border border-stone-700 rounded-lg shadow-xl z-20 animate-in fade-in zoom-in-95">
                <div className="p-2 space-y-1">
                   <button onClick={() => { setView('menu'); setIsMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-stone-300 hover:bg-stone-700 rounded-md font-serif-fantasy tracking-wider">Návrat do Hl. menu</button>
                   
                   {/* Divider moved to here */}
                   <div className="border-t border-stone-700 mx-2 my-1"></div>

                   {/* Export Kampane - updated styling and added icon */}
                   <button onClick={handleExportCampaign} className="w-full text-left px-3 py-2 text-sm text-amber-200 hover:bg-amber-900/30 rounded-md font-serif-fantasy tracking-wider flex justify-between items-center">
                       Export Kampane <Icons.Upload />
                   </button>
                   
                   {/* Export Hrdinov - already had icon and amber styling */}
                   <button onClick={handleExportHeroes} className="w-full text-left px-3 py-2 text-sm text-amber-200 hover:bg-amber-900/30 rounded-md font-serif-fantasy tracking-wider flex justify-between items-center">
                       Export Hrdinov <Icons.Upload />
                   </button>
                   {/* Import Hrdinov - added icon */}
                   <button onClick={handleImportHeroesClick} className="w-full text-left px-3 py-2 text-sm text-amber-200 hover:bg-amber-900/30 rounded-md font-serif-fantasy tracking-wider flex justify-between items-center">
                       Import Hrdinov <Icons.Upload />
                   </button>
                   <input 
                       type="file" 
                       ref={importHeroesInputRef} 
                       className="hidden" 
                       accept=".json" 
                       onChange={handleImportHeroesFile} 
                   />

                   <div className="border-t border-stone-700 mx-2 my-1"></div>

                   {/* Difficulty Setting */}
                   <div className="px-3 pt-2 pb-1 text-xs font-serif-fantasy text-stone-400 uppercase">Obtiažnosť</div>
                   <div className="flex p-1 bg-stone-900/50 rounded-md mx-2">
                      <button onClick={() => updateActiveCampaign({ difficulty: 'story' })} className={`flex-1 text-xs py-1 rounded-sm transition-colors font-serif-fantasy ${activeCampaign.difficulty === 'story' ? 'bg-green-800 text-white shadow' : 'text-stone-300'}`}>Príbeh</button>
                      <button onClick={() => updateActiveCampaign({ difficulty: 'moderate' })} className={`flex-1 text-xs py-1 rounded-sm transition-colors font-serif-fantasy ${activeCampaign.difficulty === 'moderate' ? 'bg-amber-700 text-white shadow' : 'text-stone-300'}`}>Výzva</button>
                      <button onClick={() => updateActiveCampaign({ difficulty: 'hero' })} className={`flex-1 text-xs py-1 rounded-sm transition-colors font-serif-fantasy ${activeCampaign.difficulty === 'hero' ? 'bg-red-800 text-white shadow' : 'text-stone-300'}`}>Hero</button>
                   </div>
                   
                   <div className="border-t border-stone-700 mx-2 my-1"></div>

                   {/* Language Model Selection */}
                   <h3 className="px-3 pt-2 pb-1 text-xs font-serif-fantasy text-amber-600 uppercase">Jazykový Model DM</h3>
                   <div className="space-y-2 px-2 pb-2">
                        {LANGUAGE_MODELS.map((model) => (
                            <div key={model.id} className="flex items-start space-x-2">
                                <input
                                    type="radio"
                                    id={`model_${model.id}`}
                                    name="language_model"
                                    value={model.id}
                                    checked={selectedLanguageModelId === model.id}
                                    onChange={() => setSelectedLanguageModelId(model.id)}
                                    className="mt-1.5 h-4 w-4 text-amber-500 bg-stone-700 border-stone-600 focus:ring-amber-500"
                                />
                                <div className="flex-1">
                                    <label htmlFor={`model_${model.id}`} className="block text-sm font-serif-fantasy text-stone-200 cursor-pointer">
                                        {model.name}
                                    </label>
                                    <p className="text-xs text-stone-400 mt-0.5 font-serif-fantasy">
                                        {model.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                   </div>
                </div>
              </div>
            )}
          </div>
          <div className="text-center font-serif-fantasy text-amber-600/50 text-sm truncate px-2">{activeCampaign.name}</div>
          <div className="w-5"></div>
        </header>
        
        {isMenuOpen && <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)}></div>}

        <main className="flex-1 overflow-hidden">
          <DMChat 
              messages={activeCampaign.messages} 
              onMessagesUpdate={(m) => updateActiveCampaign({ messages: m })} 
              character={currentCharacter} 
              party={activeCampaign.party}
              onPartyUpdate={handlePartyUpdate}
              campaign={activeCampaign} 
              onAddToLog={handleAddToLog}
              gameLog={activeCampaign.gameLog}
              diceHistory={activeCampaign.diceHistory}
              onHistoryUpdate={(h) => updateActiveCampaign({ diceHistory: h })}
              onShowCharacters={() => setModalView('characters')}
              onShowLogbook={() => setModalView('logbook')}
              onShowHelper={() => setModalView('helper')}
              activeHeroIndex={activeHeroIndex}
              setActiveHeroIndex={setActiveHeroIndex}
              selectedLanguageModelId={selectedLanguageModelId} // Pass selected model
          />
        </main>

        <Modal isOpen={modalView === 'characters'} onClose={() => setModalView('none')} title="Postavy">
          <CharacterSheet 
            character={currentCharacter} 
            onCharacterUpdate={handleCharacterUpdate}
            party={activeCampaign.party}
            activeHeroIndex={activeHeroIndex}
            setActiveHeroIndex={setActiveHeroIndex}
            onInventoryUpdate={(inv) => {
                const newParty = [...activeCampaign.party];
                newParty[activeHeroIndex].inventory = inv;
                updateActiveCampaign({party: newParty});
            }}
            onRemoveCharacter={handleRemoveHero}
          />
        </Modal>
        
        <Modal isOpen={modalView === 'logbook'} onClose={() => setModalView('none')} title="Herný denník">
          <GameLog
            log={activeCampaign.gameLog}
            onLogUpdate={(newLog) => updateActiveCampaign({ gameLog: newLog })}
          />
        </Modal>

        <Modal isOpen={modalView === 'helper'} onClose={() => setModalView('none')} title="Pomocník & Rady">
          <Helper />
        </Modal>
        
        {/* SettingsModal removed */}

      </div>
    );
  }

  return <MainMenu onContinue={() => {}} onNewGame={handleNewGame} onShowLoad={() => setView('load')} />; // Removed onShowSettings
};

export default App;