
import React, { useState } from 'react';
import { Character, Attribute, InventoryItem } from '../types';
import { COLORS, Icons, SCHOOLS_OF_MAGIC, SKILL_MAPPING } from '../constants';
import InventorySpells from './InventorySpells';
import EquipmentSheet from './EquipmentSheet';
import { getModifierValue, formatModifier, calculateTotalAC } from '../utils';


interface Props {
  character: Character;
  onCharacterUpdate: (char: Character) => void;
  party?: Character[];
  activeHeroIndex?: number;
  setActiveHeroIndex?: (index: number) => void;
  onInventoryUpdate: (inventory: InventoryItem[]) => void;
  onRemoveCharacter?: (characterId: string) => void;
}

type SheetView = 'stats' | 'equipment' | 'inventory' | 'abilities';

const CharacterSheet: React.FC<Props> = ({ 
  character, 
  onCharacterUpdate, 
  party = [], 
  activeHeroIndex = 0, 
  setActiveHeroIndex,
  onInventoryUpdate,
  onRemoveCharacter
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(character);
  const [sheetView, setSheetView] = useState<SheetView>('stats');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [inspiration, setInspiration] = useState(false);

  const handleSave = () => {
    onCharacterUpdate(editForm);
    setIsEditing(false);
  };
  
  const handleHpChange = (amount: number) => {
      const newHp = character.hp.current + amount;
      onCharacterUpdate({
          ...character,
          hp: { ...character.hp, current: Math.max(0, Math.min(character.hp.max, newHp)) }
      });
  }
  
  const confirmDelete = () => {
      if (onRemoveCharacter) {
          onRemoveCharacter(character.id);
      }
  };
  
  const displayAC = calculateTotalAC(character);
  const proficiencyBonus = Math.ceil(character.level / 4) + 1;
  const initiative = formatModifier(getModifierValue(character.stats.DEX));
  
  // Get equipped weapons for Attacks section
  const equippedWeapons = character.inventory.filter(i => 
      (character.equippedItems.mainHand === i.id || character.equippedItems.offHand === i.id) &&
      (i.type === 'item' && i.properties?.damage)
  );
  
  // Get prepared attack spells (simplified)
  const attackSpells = character.inventory.filter(i => 
      i.type === 'spell' && i.prepared && i.properties?.damage
  );

  const attacks = [...equippedWeapons, ...attackSpells];

  if (isEditing) {
    return (
      <div className="space-y-4 p-1 animate-in fade-in duration-300">
        <h2 className="text-xl font-serif-fantasy text-amber-500 border-b border-amber-900 pb-2">Upraviť Postavu</h2>
        {/* ... edit form ... */}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2"><label className="text-xs text-stone-500 uppercase">Meno</label><input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className={`w-full ${COLORS.bg} border ${COLORS.goldBorder} rounded p-2 text-amber-100 focus:outline-none focus:ring-1 focus:ring-amber-500`}/></div>
          <div><label className="text-xs text-stone-500 uppercase">Rasa</label><input type="text" value={editForm.race} onChange={e => setEditForm({...editForm, race: e.target.value})} className={`w-full ${COLORS.bg} border ${COLORS.goldBorder} rounded p-2 text-amber-100 focus:outline-none focus:ring-1 focus:ring-amber-500`}/></div>
          <div><label className="text-xs text-stone-500 uppercase">Trieda</label><input type="text" value={editForm.className} onChange={e => setEditForm({...editForm, className: e.target.value})} className={`w-full ${COLORS.bg} border ${COLORS.goldBorder} rounded p-2 text-amber-100 focus:outline-none focus:ring-1 focus:ring-amber-500`}/></div>
          <div><label className="text-xs text-stone-500 uppercase">HP (Max)</label><input type="number" value={editForm.hp.max} onChange={e => setEditForm({...editForm, hp: {...editForm.hp, max: parseInt(e.target.value) || 0}})} className={`w-full ${COLORS.bg} border ${COLORS.goldBorder} rounded p-2 text-amber-100 focus:outline-none focus:ring-1 focus:ring-amber-500`}/></div>
          <div><label className="text-xs text-stone-500 uppercase">AC (Základ)</label><input type="number" value={editForm.ac} onChange={e => setEditForm({...editForm, ac: parseInt(e.target.value) || 0})} className={`w-full ${COLORS.bg} border ${COLORS.goldBorder} rounded p-2 text-amber-100 focus:outline-none focus:ring-1 focus:ring-amber-500`}/></div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(Object.entries(editForm.stats) as [string, number][]).map(([attr, val]) => (
            <div key={attr}>
              <label className="text-xs text-stone-500 uppercase">{attr}</label>
              <input type="number" value={val} onChange={e => setEditForm({...editForm, stats: {...editForm.stats, [attr]: Math.min(30, Math.max(1, parseInt(e.target.value) || 0))}})} className={`w-full ${COLORS.bg} border ${COLORS.goldBorder} rounded p-2 text-amber-100 text-center focus:outline-none focus:ring-1 focus:ring-amber-500`}/>
            </div>
          ))}
        </div>
        <div className="flex space-x-2 pt-4">
          <button onClick={handleSave} className={`flex-1 ${COLORS.burgundy} ${COLORS.burgundyText} py-3 rounded font-serif-fantasy uppercase tracking-widest border border-amber-900/50`}>Uložiť</button>
          <button onClick={() => setIsEditing(false)} className="flex-1 bg-stone-800 text-stone-300 py-3 rounded font-serif-fantasy uppercase tracking-widest border border-stone-700">Zrušiť</button>
        </div>
        
        {onRemoveCharacter && (
            <div className="pt-6 border-t border-stone-800 mt-6">
                {!deleteConfirm ? (
                    <button 
                        onClick={() => setDeleteConfirm(true)} 
                        className="w-full border border-red-900/30 text-red-500/70 hover:text-red-500 hover:bg-red-900/10 py-3 rounded font-serif-fantasy uppercase tracking-widest text-xs transition-colors flex items-center justify-center space-x-2"
                    >
                        <Icons.Trash />
                        <span>Odstrániť postavu z kampane</span>
                    </button>
                ) : (
                    <div className="bg-red-950/20 border border-red-900/50 rounded-lg p-4 animate-in fade-in zoom-in-95">
                        <p className="text-red-400 text-xs text-center font-serif-fantasy mb-3 uppercase tracking-wider">
                            Naozaj vymazať? Je to nezvratné.
                        </p>
                        <div className="flex gap-3">
                            <button 
                                onClick={confirmDelete}
                                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded font-serif-fantasy text-xs uppercase tracking-widest shadow-lg"
                            >
                                Áno, Zmazať
                            </button>
                            <button 
                                onClick={() => setDeleteConfirm(false)}
                                className="flex-1 bg-stone-700 hover:bg-stone-600 text-stone-300 py-2 rounded font-serif-fantasy text-xs uppercase tracking-widest"
                            >
                                Zrušiť
                            </button>
                        </div>
                    </div>
                )}
            </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Party Switcher */}
      {party.length > 1 && setActiveHeroIndex && (
        <div className="flex-shrink-0 flex space-x-2 overflow-x-auto pb-3 mb-3 border-b border-stone-800 scrollbar-hide">
          {party.map((hero, idx) => (
            <button key={hero.id} onClick={() => setActiveHeroIndex(idx)} className={`px-4 py-2 rounded-lg border font-serif-fantasy text-xs whitespace-nowrap transition-all ${activeHeroIndex === idx ? 'bg-amber-900/30 border-amber-500 text-amber-500' : 'bg-stone-900 border-stone-800 text-stone-500'}`}>
              {hero.name}
            </button>
          ))}
        </div>
      )}

      {/* View Toggle */}
      <div className="flex-shrink-0 flex bg-stone-950 border border-stone-800 rounded-lg p-1 mb-4">
        <button onClick={() => setSheetView('stats')} className={`flex-1 py-2 text-xs font-serif-fantasy uppercase tracking-wider rounded transition-all ${sheetView === 'stats' ? 'bg-stone-800 text-amber-500 shadow-inner' : 'text-stone-500'}`}>Denník</button>
        <button onClick={() => setSheetView('equipment')} className={`flex-1 py-2 text-xs font-serif-fantasy uppercase tracking-wider rounded transition-all ${sheetView === 'equipment' ? 'bg-stone-800 text-amber-500 shadow-inner' : 'text-stone-500'}`}>Vybavenie</button>
        <button onClick={() => setSheetView('inventory')} className={`flex-1 py-2 text-xs font-serif-fantasy uppercase tracking-wider rounded transition-all ${sheetView === 'inventory' ? 'bg-stone-800 text-amber-500 shadow-inner' : 'text-stone-500'}`}>Inventár</button>
        <button onClick={() => setSheetView('abilities')} className={`flex-1 py-2 text-xs font-serif-fantasy uppercase tracking-wider rounded transition-all ${sheetView === 'abilities' ? 'bg-stone-800 text-amber-500 shadow-inner' : 'text-stone-500'}`}>Schopnosti</button>
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {sheetView === 'stats' ? (
          <div className="flex flex-col flex-1 overflow-y-auto">
             {/* HEADER - Name & Basic Info */}
             <div className="flex items-start justify-between bg-stone-900 border border-stone-800 p-3 rounded-lg mb-4 shadow-md">
                 <div className="flex-1">
                     <h2 className="text-xl font-serif-fantasy text-amber-500 leading-none">{character.name}</h2>
                     <div className="flex flex-wrap gap-2 mt-1 text-[10px] text-stone-400 font-serif-fantasy uppercase tracking-wider">
                         <span>{character.className} {character.level}</span>
                         <span>•</span>
                         <span>{character.race}</span>
                         <span>•</span>
                         <span>{character.background}</span>
                     </div>
                 </div>
                 <button onClick={() => { setEditForm(character); setIsEditing(true); setDeleteConfirm(false); }} className="text-stone-600 hover:text-amber-500 p-1"><Icons.Edit /></button>
             </div>

             {/* MAIN LAYOUT GRID */}
             <div className="grid grid-cols-[80px_1fr] gap-3">
                 
                 {/* LEFT COLUMN: ATTRIBUTES */}
                 <div className="flex flex-col gap-3">
                     {(Object.entries(character.stats) as [string, number][]).map(([attr, val]) => (
                        <div key={attr} className="bg-stone-900 border border-stone-800 rounded-lg flex flex-col items-center justify-center p-2 h-20 shadow-sm relative group">
                            <span className="text-[9px] text-stone-500 font-bold uppercase tracking-widest mb-1">{attr}</span>
                            <span className="text-xl font-serif-fantasy text-stone-200">{formatModifier(getModifierValue(val))}</span>
                            <div className="w-8 h-6 bg-stone-950 border border-stone-800 rounded-full flex items-center justify-center absolute -bottom-3 text-[10px] font-bold text-stone-400 group-hover:border-amber-700 group-hover:text-amber-500 transition-colors">
                                {val}
                            </div>
                        </div>
                     ))}
                 </div>

                 {/* RIGHT COLUMN: EVERYTHING ELSE */}
                 <div className="flex flex-col gap-4">
                     
                     {/* Row 1: Proficiency & Inspiration */}
                     <div className="flex gap-2">
                         <div className="flex-1 bg-stone-900 border border-stone-800 rounded px-2 py-1 flex items-center justify-between">
                             <span className="text-lg font-serif-fantasy text-stone-200">+{proficiencyBonus}</span>
                             <span className="text-[8px] text-stone-500 uppercase tracking-tighter text-right leading-none">Zdatnostní<br/>Bonus</span>
                         </div>
                         <div 
                            onClick={() => setInspiration(!inspiration)}
                            className={`flex-1 border rounded px-2 py-1 flex items-center justify-between cursor-pointer transition-colors ${inspiration ? 'bg-amber-900/30 border-amber-600' : 'bg-stone-900 border-stone-800'}`}
                        >
                             <div className={`w-3 h-3 rounded-full border ${inspiration ? 'bg-amber-500 border-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.8)]' : 'bg-stone-950 border-stone-700'}`}></div>
                             <span className="text-[8px] text-stone-500 uppercase tracking-tighter text-right">Inspirace</span>
                         </div>
                     </div>

                     {/* Row 2: Combat Stats (AC, Init, Speed) */}
                     <div className="grid grid-cols-3 gap-2">
                         {/* AC - Shield Shape */}
                         <div className="relative flex items-center justify-center h-20 w-full">
                            <svg className="absolute inset-0 w-full h-full text-stone-900 fill-current drop-shadow-lg" viewBox="0 0 100 120" preserveAspectRatio="none">
                                <path d="M10,10 L90,10 L90,30 C90,70 50,110 50,110 C50,110 10,70 10,30 Z" stroke="#78350f" strokeWidth="2" />
                            </svg>
                            <div className="z-10 flex flex-col items-center">
                                <span className="text-[8px] text-stone-500 uppercase font-bold mb-1">OČ</span>
                                <span className="text-2xl font-serif-fantasy text-amber-500 font-bold">{displayAC}</span>
                            </div>
                         </div>
                         
                         {/* Initiative */}
                         <div className="bg-stone-900 border-2 border-stone-800 rounded-lg flex flex-col items-center justify-center h-20">
                             <span className="text-[8px] text-stone-500 uppercase tracking-widest mb-1">Iniciativa</span>
                             <span className="text-xl font-serif-fantasy text-stone-300">{initiative}</span>
                         </div>
                         
                         {/* Speed */}
                         <div className="bg-stone-900 border-2 border-stone-800 rounded-lg flex flex-col items-center justify-center h-20">
                             <span className="text-[8px] text-stone-500 uppercase tracking-widest mb-1">Rychlost</span>
                             <span className="text-xl font-serif-fantasy text-stone-300">9m</span>
                         </div>
                     </div>

                     {/* Row 3: HP Section */}
                     <div className="bg-stone-900 border border-stone-800 rounded-lg p-3">
                         <div className="flex justify-between items-center mb-2">
                             <span className="text-[9px] text-stone-500 uppercase tracking-widest">Aktuální životy</span>
                             <span className="text-[9px] text-stone-600">Max: {character.hp.max}</span>
                         </div>
                         <div className="flex items-center justify-between">
                             <div className="font-serif-fantasy text-3xl text-stone-200">{character.hp.current}</div>
                             <div className="flex space-x-2">
                                <button onClick={() => handleHpChange(-1)} className="w-8 h-8 rounded bg-red-950/50 border border-red-900 text-red-400 hover:bg-red-900 flex items-center justify-center font-bold transition-colors">-</button>
                                <button onClick={() => handleHpChange(1)} className="w-8 h-8 rounded bg-green-950/50 border border-green-900 text-green-400 hover:bg-green-900 flex items-center justify-center font-bold transition-colors">+</button>
                             </div>
                         </div>
                         {/* HP Bar */}
                         <div className="w-full h-1.5 bg-stone-950 rounded-full mt-3 overflow-hidden border border-stone-800">
                             <div className="h-full bg-red-700 transition-all duration-500" style={{ width: `${(character.hp.current / character.hp.max) * 100}%` }}></div>
                         </div>
                     </div>

                     {/* Row 4: Attacks & Spells */}
                     <div className="bg-stone-900 border border-stone-800 rounded-lg p-2 min-h-[100px]">
                         <h3 className="text-[9px] text-stone-500 uppercase tracking-widest mb-2 border-b border-stone-800 pb-1 mx-1">Útoky a Kouzla</h3>
                         {attacks.length === 0 ? (
                             <p className="text-[10px] text-stone-600 italic text-center py-4">Žádné vybavené zbraně ani útočná kouzla.</p>
                         ) : (
                             <div className="space-y-1">
                                 {attacks.map(attack => (
                                     <div key={attack.id} className="flex justify-between items-center bg-stone-950/50 rounded px-2 py-1.5">
                                         <span className="text-xs font-serif-fantasy text-stone-300 truncate max-w-[40%]">{attack.name}</span>
                                         <div className="flex items-center space-x-2">
                                             <span className="text-[10px] text-stone-500 bg-stone-900 px-1 rounded">
                                                 {/* Approximate attack bonus logic for display purposes */}
                                                {formatModifier(getModifierValue(character.stats[attack.type === 'spell' ? Attribute.INT : Attribute.STR]) + proficiencyBonus)}
                                             </span>
                                             <span className="text-[10px] font-mono text-stone-400">{attack.properties?.damage} {attack.properties?.damageType?.slice(0,3)}</span>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                         )}
                     </div>
                     
                     {/* Row 5: Skills List */}
                     <div className="bg-stone-900 border border-stone-800 rounded-lg p-2">
                         <h3 className="text-[9px] text-stone-500 uppercase tracking-widest mb-2 border-b border-stone-800 pb-1 mx-1">Dovednosti</h3>
                         <div className="grid grid-cols-1 gap-1">
                             {Object.entries(SKILL_MAPPING).sort().map(([skillName, attr]) => {
                                 const mod = getModifierValue(character.stats[attr]);
                                 // Check if character has proficiency (mocked for now as we don't store proficiencies explicitly yet, can be added later)
                                 const isProficient = false; 
                                 const total = mod + (isProficient ? proficiencyBonus : 0);
                                 
                                 return (
                                     <div key={skillName} className="flex items-center text-xs">
                                         <span className="w-4 h-4 rounded-full border border-stone-700 mr-2 flex-shrink-0"></span>
                                         <span className={`font-mono w-6 text-right mr-2 ${total >= 0 ? 'text-stone-300' : 'text-stone-500'}`}>{formatModifier(total)}</span>
                                         <span className="text-stone-400 truncate">{skillName} <span className="text-[9px] text-stone-600">({attr})</span></span>
                                     </div>
                                 )
                             })}
                         </div>
                     </div>

                 </div>
             </div>

             {/* Bottom: Notes */}
            <div className="flex-1 flex flex-col space-y-2 pt-4 min-h-[200px]">
                <h3 className="text-xs font-serif-fantasy text-stone-500 uppercase tracking-widest px-1 flex-shrink-0 border-b border-stone-800 pb-1">Vlastnosti a Rysy</h3>
                <textarea
                    value={character.notes || ''}
                    onChange={(e) => onCharacterUpdate({ ...character, notes: e.target.value })}
                    placeholder="Ideály, Pouta, Vady, Příběh..."
                    className="w-full flex-1 bg-stone-950 border border-stone-800 rounded-lg p-3 text-sm text-stone-300 focus:outline-none focus:border-amber-700 resize-none min-h-[150px]"
                />
            </div>
          </div>
        ) : sheetView === 'equipment' ? (
          <EquipmentSheet
            character={character}
            onCharacterUpdate={onCharacterUpdate}
          />
        ) : sheetView === 'abilities' ? (
          <div className="space-y-4 animate-in fade-in overflow-y-auto pr-2">
              <div className="border-b border-amber-900 pb-2">
                <h2 className="text-xl font-serif-fantasy text-amber-500">Schopnosti & Vlastnosti</h2>
                <p className="text-sm text-stone-500 uppercase tracking-wider font-serif-fantasy">{character.className}</p>
              </div>
              {character.abilities.length > 0 ? (
                  <div className="space-y-3">
                      {character.abilities.map((ability) => {
                           const selections = character.abilitySelections?.[ability.id] || {};
                           const chosenSchool = selections.school_choice;
                          return (
                          <div key={ability.id} className="bg-stone-950/50 border border-stone-800 p-3 rounded-lg">
                            <h4 className="text-amber-500 font-serif-fantasy text-sm">{ability.name}</h4>
                            <p className="text-stone-400 text-xs mt-1">{ability.description}</p>
                             {ability.choices && (
                              <div className="mt-4 border-t border-stone-700 pt-3">
                                {ability.choices.map((choice) => {
                                  const currentSelection = selections[choice.id];
                                  const otherSelections = Object.entries(selections)
                                    .filter(([key]) => key !== choice.id)
                                    .map(([, value]) => value);
                                  const availableOptions = choice.options.filter(opt => !otherSelections.includes(opt));
                                  
                                  const handleSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
                                    const newSelection = e.target.value;
                                    const newSelections = {
                                      ...character.abilitySelections,
                                      [ability.id]: {
                                        ...(character.abilitySelections?.[ability.id] || {}),
                                        [choice.id]: newSelection
                                      }
                                    };
                                    onCharacterUpdate({ ...character, abilitySelections: newSelections });
                                  };

                                  return (
                                    <div key={choice.id}>
                                      <label className="text-[10px] text-stone-500 font-serif-fantasy uppercase tracking-tighter block mb-1">{choice.label}</label>
                                      <select 
                                        value={currentSelection || ''}
                                        onChange={handleSelectionChange}
                                        className={`w-full ${COLORS.burgundy} border border-red-800 rounded-lg p-2 text-xs ${COLORS.burgundyText} focus:outline-none appearance-none font-serif-fantasy`}
                                      >
                                        <option value="">-- Vyber --</option>
                                        {currentSelection && !availableOptions.includes(currentSelection) && (
                                            <option value={currentSelection}>{currentSelection}</option>
                                        )}
                                        {availableOptions.map(option => (
                                          <option key={option} value={option}>{option}</option>
                                        ))}
                                      </select>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                            {chosenSchool && SCHOOLS_OF_MAGIC[chosenSchool] && (
                                <div className="mt-3 pt-3 border-t border-amber-900/50">
                                    <p className="text-stone-400 text-xs">{SCHOOLS_OF_MAGIC[chosenSchool]}</p>
                                </div>
                            )}
                          </div>
                      )})}
                  </div>
              ) : (
                  <div className="text-center text-stone-600 italic py-8 border-2 border-dashed border-stone-900 rounded-xl h-full flex flex-col justify-center items-center">
                    <span>Táto postava zatiaľ nemá žiadne špeciálne schopnosti.</span>
                  </div>
              )}
          </div>
        ) : (
          <InventorySpells 
            character={character}
            onCharacterUpdate={onCharacterUpdate}
          />
        )}
      </div>
    </div>
  );
};

export default CharacterSheet;
