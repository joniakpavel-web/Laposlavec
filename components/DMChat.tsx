

import React, { useState, useRef, useEffect } from 'react';
import { Message, Character, CampaignSettings, LogEntry, DiceRoll, InventoryItem, Ability, Attribute, EquipSlot, LanguageModelId } from '../types';
import { COLORS, Icons, SPELLBOOK } from '../constants';
import { getDungeonMasterResponse } from '../geminiService';

interface Props {
  messages: Message[];
  onMessagesUpdate: (messages: Message[]) => void;
  character: Character;
  party: Character[];
  onPartyUpdate: (party: Character[]) => void;
  campaign: CampaignSettings;
  onAddToLog: (messageText: string) => void;
  gameLog: LogEntry[];
  diceHistory: DiceRoll[];
  onHistoryUpdate: (history: DiceRoll[]) => void;
  onShowCharacters: () => void;
  onShowLogbook: () => void;
  onShowHelper: () => void;
  activeHeroIndex: number;
  setActiveHeroIndex: (index: number) => void;
  selectedLanguageModelId: LanguageModelId; // New prop
}

const DICE_TYPES = [4, 6, 8, 10, 12, 20, 100];

const DMChat: React.FC<Props> = ({ 
  messages, 
  onMessagesUpdate, 
  party,
  onPartyUpdate,
  campaign, 
  onAddToLog, 
  gameLog,
  diceHistory,
  onHistoryUpdate,
  onShowCharacters,
  onShowLogbook,
  onShowHelper,
  activeHeroIndex,
  setActiveHeroIndex,
  selectedLanguageModelId // Use the new prop
}) => {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeRoll, setActiveRoll] = useState<{ die: number, result: number | null, isRolling: boolean } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleFunctionCalls = (functionCalls: any[]): { updatedParty: Character[], systemMessages: string[] } => {
    let updatedParty = JSON.parse(JSON.stringify(party));
    let systemMessages: string[] = [];

    functionCalls.forEach(fc => {
        const { name, args } = fc;
        const { characterName } = args;

        if (!characterName) return;

        const charIndex = updatedParty.findIndex((c: Character) => c.name.toLowerCase() === characterName.toLowerCase());
        if (charIndex === -1) {
            systemMessages.push(`*Systémová chyba: Postava s menom "${characterName}" nebola nájdená.*`);
            return;
        }

        switch (name) {
            case 'addToInventory': {
                const { itemName, quantity, properties, description, itemType, equipSlot } = args;
                if (!itemName || !quantity) break;
                
                const inventory = updatedParty[charIndex].inventory;
                const existingItemIndex = inventory.findIndex((item: InventoryItem) => item.name.toLowerCase() === itemName.toLowerCase());
                
                const type = itemType || 'item';
                let finalDescription = description;
                let finalProperties = properties;
                
                if (type === 'spell') {
                     const dbSpellKey = Object.keys(SPELLBOOK).find(key => key.toLowerCase() === itemName.toLowerCase());
                     if (dbSpellKey) {
                         const dbSpell = SPELLBOOK[dbSpellKey];
                         if (!finalDescription) finalDescription = dbSpell.description;
                         if (!finalProperties) finalProperties = dbSpell.properties;
                     }
                }

                if (existingItemIndex > -1) {
                    inventory[existingItemIndex].quantity += quantity;
                    if (finalDescription) inventory[existingItemIndex].description = finalDescription;
                    if (finalProperties) inventory[existingItemIndex].properties = finalProperties;
                    if (equipSlot) inventory[existingItemIndex].equipSlot = equipSlot as EquipSlot;
                } else {
                    inventory.push({ 
                      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, 
                      name: itemName, 
                      quantity, 
                      type: type,
                      properties: finalProperties || undefined,
                      description: finalDescription || undefined,
                      prepared: type === 'spell' ? false : undefined,
                      equipSlot: equipSlot as EquipSlot || undefined
                    });
                }
                const msg = type === 'spell' 
                    ? `*${itemName} (Kúzlo) bolo zapísané do knihy kúziel postavy ${characterName}.*` 
                    : `*${itemName} (x${quantity}) bol pridaný do inventára postavy ${characterName}.*`;
                systemMessages.push(msg);
                break;
            }
            case 'equipItem': {
                const { itemName, slot } = args;
                if (!itemName || !slot) break;
                
                const inventory = updatedParty[charIndex].inventory;
                const itemToEquip = inventory.find((item: InventoryItem) => item.name.toLowerCase() === itemName.toLowerCase());
                
                if (itemToEquip) {
                    updatedParty[charIndex].equippedItems[slot as EquipSlot] = itemToEquip.id;
                    systemMessages.push(`*${characterName} si nasadil ${itemName} do slotu ${slot}.*`);
                } else {
                    systemMessages.push(`*Chyba: ${characterName} nemá v inventári ${itemName}.*`);
                }
                break;
            }
            case 'removeFromInventory': {
                const { itemName, quantity } = args;
                if (!itemName || !quantity) break;
                
                const inventory = updatedParty[charIndex].inventory;
                const existingItemIndex = inventory.findIndex((item: InventoryItem) => item.name.toLowerCase() === itemName.toLowerCase());

                if (existingItemIndex > -1) {
                    inventory[existingItemIndex].quantity -= quantity;
                    if (inventory[existingItemIndex].quantity <= 0) {
                        inventory.splice(existingItemIndex, 1);
                    }
                    systemMessages.push(`*${itemName} (x${quantity}) bol odobraný z inventára postavy ${characterName}.*`);
                }
                break;
            }
            case 'levelUpCharacter': {
                const { newLevel, hpIncrease } = args;
                if (typeof newLevel !== 'number' || typeof hpIncrease !== 'number') break;

                updatedParty[charIndex].level = newLevel;
                updatedParty[charIndex].hp.max += hpIncrease;
                updatedParty[charIndex].hp.current = updatedParty[charIndex].hp.max;
                systemMessages.push(`*${characterName} postúpil na úroveň ${newLevel}!*`);
                break;
            }
            case 'addCharacterAbility': {
                const { abilityName, abilityDescription } = args;
                if (!abilityName || !abilityDescription) break;
                
                updatedParty[charIndex].abilities.push({
                    id: `${abilityName.toLowerCase().replace(/\s/g, '_')}_${Date.now()}`,
                    name: abilityName,
                    description: abilityDescription,
                });
                systemMessages.push(`*${characterName} získal novú schopnosť: ${abilityName}.*`);
                break;
            }
            case 'updateCharacterStats': {
                const { statsToUpdate } = args as { statsToUpdate?: { stat: Attribute; newValue: number }[] };
                if (!statsToUpdate) break;

                let statChanges: string[] = [];
                statsToUpdate.forEach(({ stat, newValue }) => {
                    if (Object.values(Attribute).includes(stat) && typeof newValue === 'number') {
                        updatedParty[charIndex].stats[stat] = newValue;
                        statChanges.push(`${stat}: ${newValue}`);
                    }
                });
                if (statChanges.length > 0) {
                    systemMessages.push(`*Vlastnosti postavy ${characterName} boli upravené: ${statChanges.join(', ')}.*`);
                }
                break;
            }
            case 'updateSpellSlots': {
                const { spellSlots } = args as { spellSlots?: { level: number, current: number, max: number }[] };
                if (!spellSlots) break;

                const newSpellSlots: Character['spellSlots'] = {};
                spellSlots.forEach(slot => {
                    newSpellSlots[slot.level] = { current: slot.current, max: slot.max };
                });
                updatedParty[charIndex].spellSlots = newSpellSlots;
                systemMessages.push(`*Pozície kúziel pre postavu ${characterName} boli aktualizované.*`);
                break;
            }
            default:
                break;
        }
    });

    return { updatedParty, systemMessages };
  };


  const handleSend = async (messageText: string) => {
    if (!messageText.trim() || isTyping) return;

    const originalInput = messageText;
    setInput('');
    setIsTyping(true);

    const userMsg: Message = { role: 'user', text: originalInput };
    const newMessages = [...messages, userMsg];
    onMessagesUpdate(newMessages);

    const dmResponse = await getDungeonMasterResponse(party, newMessages.slice(0, -1), originalInput, campaign, selectedLanguageModelId);
    
    let finalMessages = [...newMessages];
    
    if (dmResponse.functionCalls && dmResponse.functionCalls.length > 0) {
        const { updatedParty, systemMessages } = handleFunctionCalls(dmResponse.functionCalls);
        onPartyUpdate(updatedParty);
        systemMessages.forEach(sm => {
            finalMessages.push({ role: 'model', text: sm });
        });
    }

    if (dmResponse.text) {
      finalMessages.push({ role: 'model', text: dmResponse.text });
    }

    onMessagesUpdate(finalMessages);
    setIsTyping(false);
  };

  const handleRollDie = (die: number) => {
    if (activeRoll?.isRolling) return;

    setActiveRoll({ die, result: null, isRolling: true });

    setTimeout(() => {
      const result = Math.floor(Math.random() * die) + 1;
      const newRoll: DiceRoll = {
        id: Date.now().toString(),
        die,
        result,
        timestamp: Date.now()
      };
      
      setActiveRoll({ die, result, isRolling: false });
      onHistoryUpdate([newRoll, ...diceHistory]);

      setTimeout(() => {
        setActiveRoll(prev => (prev?.result === result ? null : prev));
      }, 3000);
    }, 600);
  };

  return (
    <div className="flex flex-col h-full p-4 pb-0 relative">
      {activeRoll && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-300"
          onClick={() => setActiveRoll(null)}
        >
          <div className="bg-stone-900/90 border-2 border-amber-500 rounded-3xl p-8 shadow-[0_0_50px_rgba(245,158,11,0.4)] flex flex-col items-center justify-center min-w-[200px] animate-in zoom-in duration-300">
            <span className="text-stone-500 font-serif-fantasy text-xs uppercase tracking-[0.2em] mb-4">Hod d{activeRoll.die}</span>
            {activeRoll.isRolling ? (
              <div className="text-6xl font-serif-fantasy text-amber-500 animate-roll">
                d{activeRoll.die}
              </div>
            ) : (
              <div className="text-center">
                <div className="text-7xl font-serif-fantasy text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.6)] animate-in bounce-in duration-500">
                  {activeRoll.result}
                </div>
                {activeRoll.result === activeRoll.die && (
                  <div className="text-green-500 text-[10px] font-serif-fantasy uppercase tracking-widest mt-2 animate-pulse">Kritický úspech!</div>
                )}
                {activeRoll.result === 1 && (
                  <div className="text-red-500 text-[10px] font-serif-fantasy uppercase tracking-widest mt-2 animate-pulse">Kritické zlyhanie!</div>
                )}
              </div>
            )}
            <div className="mt-6 text-stone-600 text-[8px] uppercase tracking-tighter">Kliknutím zavrieť</div>
          </div>
        </div>
      )}

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 pr-2 mb-3 scroll-smooth"
      >
        {messages.map((m, i) => {
          const isLogged = m.role === 'model' && gameLog.some(entry => entry.text === m.text);
          const isSystemMessage = m.role === 'model' && m.text.startsWith('*') && m.text.endsWith('*');
          
          if (isSystemMessage) {
            return (
              <div key={i} className="text-center text-xs font-serif-fantasy text-amber-600/80 italic my-3">
                {m.text.slice(1, -1)}
              </div>
            )
          }

          return (
            <div key={i} className={`flex items-end group ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'model' && (
                <button 
                  onClick={() => !isLogged && onAddToLog(m.text)}
                  disabled={isLogged}
                  title={isLogged ? "Uložené v denníku" : "Uložiť do denníka"}
                  className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity mr-2
                    ${isLogged ? 'text-amber-500' : 'text-stone-600 hover:text-amber-400 hover:bg-stone-800'}`}
                >
                  <Icons.Bookmark />
                </button>
              )}
              <div 
                className={`max-w-[85%] p-3 rounded-lg border shadow-lg ${
                  m.role === 'user' 
                    ? `${COLORS.burgundy} border-red-900 ${COLORS.burgundyText} rounded-br-none` 
                    : `${COLORS.card} border-stone-800 text-stone-200 rounded-bl-none`
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: m.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></p>
              </div>
            </div>
          )
        })}
        {isTyping && (
          <div className="flex justify-start animate-pulse">
            <div className={`${COLORS.card} border-stone-800 p-3 rounded-lg text-xs text-stone-500 font-serif-fantasy italic`}>
              DM listuje v pravidlách...
            </div>
          </div>
        )}
      </div>

      <div className="flex-shrink-0">
        <div className="flex justify-between items-center px-4 py-2 border-t border-stone-800/50">
          <button onClick={onShowCharacters} className="font-serif-fantasy text-stone-400 hover:text-amber-500 uppercase tracking-widest text-[10px] py-1 px-2 rounded-lg hover:bg-stone-800/50 transition-colors">Postavy</button>
          
          <div className="flex-1 flex justify-center items-center space-x-2 px-2 overflow-x-auto scrollbar-hide">
            {party.length > 1 && party.map((hero, idx) => (
              <button 
                key={hero.id}
                onClick={() => setActiveHeroIndex(idx)}
                className={`px-3 py-1 rounded-md border text-[10px] whitespace-nowrap transition-all font-serif-fantasy
                  ${activeHeroIndex === idx ? 'bg-amber-900/30 border-amber-500 text-amber-500' : 'bg-stone-900 border-stone-800 text-stone-500'}`}
              >
                {hero.name}
              </button>
            ))}
          </div>

          <div className="flex space-x-1">
              <button onClick={onShowHelper} className="font-serif-fantasy text-amber-500/70 hover:text-amber-400 uppercase tracking-widest text-[10px] py-1 px-2 rounded-lg hover:bg-amber-900/20 transition-colors">Rady</button>
              <button onClick={onShowLogbook} className="font-serif-fantasy text-stone-400 hover:text-amber-500 uppercase tracking-widest text-[10px] py-1 px-2 rounded-lg hover:bg-stone-800/50 transition-colors">Denník</button>
          </div>
        </div>

        <div className="bg-stone-900/50 border-t border-stone-800 flex justify-around p-1 mt-1">
          {DICE_TYPES.map(die => (
            <button
              key={die}
              onClick={() => handleRollDie(die)}
              className="text-[10px] font-serif-fantasy text-stone-500 hover:text-amber-500 px-2 py-1 transition-colors uppercase"
            >
              d{die}
            </button>
          ))}
        </div>

        <div className="relative pt-1 pb-2">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Čo urobíte?"
              rows={2}
              disabled={isTyping}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(input);
                }
              }}
              className={`w-full bg-stone-900 border ${COLORS.goldBorder} rounded-xl p-3 pr-12 text-stone-200 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none`}
            />
            <button 
              onClick={() => handleSend(input)}
              disabled={!input.trim() || isTyping}
              className={`absolute top-3 right-2.5 p-2 rounded-lg ${COLORS.burgundy} ${COLORS.burgundyText} disabled:opacity-50 transition-all`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
        </div>
      </div>
    </div>
  );
};

export default DMChat;