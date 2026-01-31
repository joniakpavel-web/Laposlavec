
import React, { useState } from 'react';
import { InventoryItem, Character, EquipSlot } from '../types';
import { COLORS, Icons, SPELLBOOK } from '../constants';
import { calculateMaxPreparedSpells } from '../utils';

interface Props {
  character: Character;
  onCharacterUpdate: (character: Character) => void;
}

const InventorySpells: React.FC<Props> = ({ character, onCharacterUpdate }) => {
  const [isSpellbookOpen, setIsSpellbookOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  
  const inventory = character.inventory;

  const onInventoryUpdate = (newInventory: InventoryItem[]) => {
      onCharacterUpdate({ ...character, inventory: newInventory });
  }

  const handleEquip = (item: InventoryItem) => {
    if (!item.equipSlot) return;
    const newEquippedItems = { ...character.equippedItems };
    newEquippedItems[item.equipSlot] = item.id;
    onCharacterUpdate({ ...character, equippedItems: newEquippedItems });
  };

  const addItem = () => {
    if (!newItemName.trim()) return;

    let newItem: InventoryItem;
    // Check if it matches a known spell in the database
    const foundSpellKey = Object.keys(SPELLBOOK).find(key => key.toLowerCase() === newItemName.trim().toLowerCase());

    if (isSpellbookOpen && foundSpellKey) {
        // Adding to spellbook (must be a spell)
        const spellData = SPELLBOOK[foundSpellKey];
        newItem = {
          id: Date.now().toString(),
          name: foundSpellKey,
          quantity: 1,
          type: 'spell',
          properties: spellData.properties,
          description: spellData.description,
          prepared: false
        };
    } else if (isSpellbookOpen) {
        // Adding manual spell
        newItem = {
            id: Date.now().toString(),
            name: newItemName,
            quantity: 1,
            type: 'spell',
            prepared: false
        };
    } else {
        // Adding regular item
        newItem = {
          id: Date.now().toString(),
          name: newItemName,
          quantity: 1,
          type: 'item'
        };
    }

    onInventoryUpdate([...inventory, newItem]);
    setNewItemName('');
  };

  const removeItem = (id: string) => {
    onInventoryUpdate(inventory.filter(i => i.id !== id));
  };
  
  const togglePrepared = (id: string) => {
      const spells = inventory.filter(i => i.type === 'spell');
      const preparedCount = spells.filter(s => s.prepared).length;
      const maxPrepared = calculateMaxPreparedSpells(character);
      const targetItem = inventory.find(i => i.id === id);

      if (!targetItem) return;

      // Logic: If we are trying to prepare (currently false) AND we hit the limit
      if (!targetItem.prepared && preparedCount >= maxPrepared && maxPrepared < 90) {
          alert(`Nemôžeš pripraviť viac kúziel! Tvoj limit je ${maxPrepared} (Úroveň + Modifikátor).`);
          return;
      }

      const updatedInventory = inventory.map(item => {
          if (item.id === id) {
              return { ...item, prepared: !item.prepared };
          }
          return item;
      });
      onInventoryUpdate(updatedInventory);
  };
  
  const handleSlotChange = (level: string, amount: number) => {
      if (!character.spellSlots) return;
      const newSlots = { ...character.spellSlots };
      const currentVal = newSlots[level].current;
      const maxVal = newSlots[level].max;
      newSlots[level].current = Math.max(0, Math.min(maxVal, currentVal + amount));
      onCharacterUpdate({ ...character, spellSlots: newSlots });
  }

  // Filter items
  const spells = inventory.filter(i => i.type === 'spell');
  const items = inventory.filter(i => i.type === 'item');
  const equippedItemIds = Object.values(character.equippedItems);
  
  // Calculate Prep Stats
  const preparedCount = spells.filter(s => s.prepared).length;
  const maxPrepared = calculateMaxPreparedSpells(character);
  const showPrepLimit = maxPrepared < 90; // Don't show for non-prep classes (returns 99)
  
  // Is Character a Caster? (Has spell slots or spells)
  const isCaster = (character.spellSlots && Object.keys(character.spellSlots).length > 0) || spells.length > 0;

  // --- SPELLBOOK VIEW ---
  if (isSpellbookOpen) {
      return (
        <div className="space-y-4 flex flex-col h-full animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between border-b border-amber-900 pb-2">
                <div className="flex items-center space-x-2">
                    <button onClick={() => setIsSpellbookOpen(false)} className="text-amber-500 hover:text-amber-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                    <h2 className="text-xl font-serif-fantasy text-amber-500">Kniha Kúziel</h2>
                </div>
                {showPrepLimit ? (
                    <div className={`text-[10px] uppercase tracking-widest font-serif-fantasy border px-2 py-1 rounded ${preparedCount >= maxPrepared ? 'border-red-500 text-red-500' : 'border-amber-900/50 text-stone-500'}`}>
                        {preparedCount} / {maxPrepared} Pripravené
                    </div>
                ) : (
                    <div className="text-[10px] text-stone-500 uppercase tracking-widest font-serif-fantasy">
                       {preparedCount} Pripravené
                    </div>
                )}
            </div>

            {/* Spell Slots Tracker */}
            {character.spellSlots && Object.keys(character.spellSlots).length > 0 && (
                <div className="bg-stone-900/50 rounded-lg p-3 border border-stone-800 space-y-2">
                    <h3 className="text-[10px] font-serif-fantasy text-stone-500 uppercase tracking-widest">Pozície Kúziel (Mana)</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {Object.entries(character.spellSlots).sort(([a], [b]) => parseInt(a) - parseInt(b)).map(([level, slots]) => {
                            const slotData = slots as { current: number; max: number };
                            const percent = (slotData.current / slotData.max) * 100;
                            return (
                                <div key={level} className="flex flex-col bg-stone-950 border border-stone-800 rounded p-2">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-serif-fantasy text-amber-600">{level}. Kruh</span>
                                        <span className="text-xs font-mono text-stone-300">{slotData.current}/{slotData.max}</span>
                                    </div>
                                    <div className="w-full h-1 bg-stone-800 rounded-full overflow-hidden mb-2">
                                        <div className="h-full bg-amber-600 transition-all duration-500" style={{ width: `${percent}%` }}></div>
                                    </div>
                                    <div className="flex justify-between space-x-1">
                                         <button onClick={() => handleSlotChange(level, -1)} className="flex-1 bg-stone-800 hover:bg-red-900/50 text-stone-400 hover:text-red-400 rounded text-[10px] font-bold py-1 transition-colors">-</button>
                                         <button onClick={() => handleSlotChange(level, 1)} className="flex-1 bg-stone-800 hover:bg-green-900/50 text-stone-400 hover:text-green-400 rounded text-[10px] font-bold py-1 transition-colors">+</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Add Spell Input */}
            <div className="flex space-x-2">
                <input 
                type="text"
                value={newItemName}
                onChange={e => setNewItemName(e.target.value)}
                placeholder="Zapísať nové kúzlo..."
                className={`flex-1 bg-stone-900 border border-stone-800 rounded-lg p-3 text-stone-200 text-sm focus:outline-none focus:border-amber-700`}
                onKeyDown={e => e.key === 'Enter' && addItem()}
                />
                <button 
                onClick={addItem}
                className={`${COLORS.burgundy} ${COLORS.burgundyText} p-3 rounded-lg border border-red-900 active:scale-95 transition-transform`}
                >
                <Icons.Plus />
                </button>
            </div>

            {/* Spell List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {spells.length === 0 ? (
                    <div className="text-center text-stone-600 italic py-8">Kniha je prázdna.</div>
                ) : (
                    spells.map(spell => (
                        <div key={spell.id} className={`p-3 rounded-lg border transition-all duration-300 ${spell.prepared ? 'bg-amber-950/20 border-amber-600 shadow-[0_0_10px_rgba(217,119,6,0.1)]' : 'bg-stone-900/50 border-stone-800 opacity-80'}`}>
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2">
                                        <h4 className={`font-serif-fantasy text-sm ${spell.prepared ? 'text-amber-400' : 'text-stone-400'}`}>{spell.name}</h4>
                                        {spell.prepared && <span className="text-[9px] bg-amber-600 text-black px-1.5 rounded font-bold uppercase tracking-wider">Pripravené</span>}
                                    </div>
                                    {spell.description && <p className="text-[10px] text-stone-500 mt-1 leading-snug">{spell.description}</p>}
                                    {spell.properties?.damage && (
                                        <div className="mt-1 text-[10px] text-red-400 font-mono">
                                            {spell.properties.damage} {spell.properties.damageType}
                                        </div>
                                    )}
                                     {spell.properties?.healing && (
                                        <div className="mt-1 text-[10px] text-green-400 font-mono">
                                            Lieči: {spell.properties.healing}
                                        </div>
                                    )}
                                </div>
                                <button onClick={() => removeItem(spell.id)} className="text-stone-600 hover:text-red-500 p-1">
                                    <Icons.Trash />
                                </button>
                            </div>
                            <div className="mt-3 pt-2 border-t border-stone-800/50 flex">
                                <button 
                                    onClick={() => togglePrepared(spell.id)}
                                    className={`flex-1 py-1.5 text-xs font-serif-fantasy uppercase tracking-wider rounded transition-colors ${spell.prepared ? 'bg-amber-900/30 text-amber-500 hover:bg-amber-900/50' : 'bg-stone-800 text-stone-500 hover:bg-stone-700'}`}
                                >
                                    {spell.prepared ? 'Odpripraviť' : 'Pripraviť'}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
      );
  }

  // --- MAIN INVENTORY VIEW ---
  return (
    <div className="space-y-6 flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="border-b border-amber-900 pb-2">
        <h2 className="text-xl font-serif-fantasy text-amber-500">Inventár Postavy</h2>
        <p className="text-sm text-stone-500 uppercase tracking-wider font-serif-fantasy">{character.name}</p>
      </div>

      {/* Add New Item Input */}
      <div className="flex space-x-2">
        <input 
          type="text"
          value={newItemName}
          onChange={e => setNewItemName(e.target.value)}
          placeholder="Pridaj predmet..."
          className={`flex-1 bg-stone-900 border border-stone-800 rounded-lg p-3 text-stone-200 text-sm focus:outline-none focus:border-amber-700`}
          onKeyDown={e => e.key === 'Enter' && addItem()}
        />
        <button 
          onClick={addItem}
          className={`${COLORS.burgundy} ${COLORS.burgundyText} p-3 rounded-lg border border-red-900 active:scale-95 transition-transform`}
        >
          <Icons.Plus />
        </button>
      </div>
      
      {/* Grid List */}
      <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {/* Spellbook Card - Always first if caster */}
            {isCaster && (
                <div 
                    onClick={() => setIsSpellbookOpen(true)}
                    className={`relative bg-stone-900 border border-purple-900/50 p-3 rounded-lg group animate-in zoom-in duration-300 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-900/10 transition-all shadow-lg min-h-[120px]`}
                >
                    <div className="text-purple-500 mb-2">
                        <Icons.Book />
                    </div>
                    <span className="text-purple-300 text-sm font-serif-fantasy tracking-widest uppercase text-center leading-tight mb-1">Kniha Kúziel</span>
                    <span className="text-[9px] text-purple-600 uppercase tracking-tighter">
                        {spells.length} Známych • {spells.filter(s => s.prepared).length} Pripravených
                    </span>
                    {showPrepLimit && (
                        <div className="mt-1 w-3/4 h-1 bg-purple-900/30 rounded-full overflow-hidden">
                            <div 
                                className={`h-full ${preparedCount >= maxPrepared ? 'bg-red-500' : 'bg-purple-500'} transition-all duration-500`}
                                style={{ width: `${Math.min(100, (preparedCount / maxPrepared) * 100)}%` }}
                            ></div>
                        </div>
                    )}
                    <div className="absolute inset-0 border border-purple-500/20 rounded-lg pointer-events-none"></div>
                </div>
            )}

            {items.length === 0 && !isCaster ? (
                <div className="col-span-full text-center text-stone-700 italic py-8 border-2 border-dashed border-stone-900 rounded-xl">
                    <span>Tvoj vak je prázdny.</span>
                </div>
            ) : (
                items.map(item => {
                const isEquipped = equippedItemIds.includes(item.id);
                return (
                <div 
                    key={item.id} 
                    className={`relative ${COLORS.card} border ${isEquipped ? 'border-amber-500' : 'border-stone-800'} p-3 rounded-lg group animate-in fade-in duration-300 flex flex-col min-h-[120px]`}
                >
                    <button 
                    onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                    className="absolute top-1 right-1 text-stone-600 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                    <Icons.Trash />
                    </button>
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <span className="text-stone-200 text-sm font-body leading-tight">{item.name}</span>
                        {item.description && (
                        <p className="text-stone-500 text-[10px] mt-1 italic leading-tight line-clamp-2">{item.description}</p>
                        )}
                        <div className="mt-2 space-y-1">
                        {item.properties?.ac && (
                            <span className="block text-xs font-serif-fantasy text-sky-400 bg-sky-950/50 border border-sky-800/50 px-2 py-0.5 rounded-full">
                                AC +{item.properties.ac}
                            </span>
                        )}
                        {item.properties?.damage && (
                            <span className="block text-xs font-serif-fantasy text-red-400 bg-red-950/50 border border-red-800/50 px-2 py-0.5 rounded-full">
                                {item.properties.damage}
                            </span>
                        )}
                        </div>
                    </div>
                    <div className="text-right text-xs text-stone-600 font-serif-fantasy mt-2 self-end">
                        x{item.quantity}
                    </div>
                    {item.equipSlot && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleEquip(item); }}
                        disabled={isEquipped}
                        className="w-full text-center py-1 mt-2 text-[10px] font-serif-fantasy rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-amber-800 bg-amber-950/50 text-amber-500 hover:bg-amber-950 disabled:bg-stone-800 disabled:text-stone-600 disabled:border-stone-700"
                    >
                        {isEquipped ? 'Nasadené' : 'Nasadiť'}
                    </button>
                    )}
                </div>
                )})
            )}
          </div>
      </div>
    </div>
  );
};

export default InventorySpells;
