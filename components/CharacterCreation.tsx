
import React, { useState } from 'react';
import { Character, Attribute, CharacterStats, InventoryItem, Ability } from '../types';
import { COLORS, RACES, CLASSES, BACKGROUNDS, SPELLBOOK, ABILITY_DESCRIPTIONS } from '../constants';
import { getModifierValue } from '../utils';

interface Props {
  onComplete: (characters: Character[]) => void;
  onBack: () => void;
}

const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

const getStarterPack = (className: string, backgroundName: string): InventoryItem[] => {
    const finalPack: Omit<InventoryItem, 'id'>[] = [];
    
    // Klasové vybavenie a kúzla
    switch(className) {
        case "Bojovník":
            finalPack.push({ name: "Chain Mail", quantity: 1, type: 'item', equipSlot: 'armor', properties: { ac: 16 } });
            finalPack.push({ name: "Dlouhý meč", quantity: 1, type: 'item', equipSlot: 'mainHand', properties: { damage: '1d8', damageType: 'sečné' } });
            finalPack.push({ name: "Štít", quantity: 1, type: 'item', equipSlot: 'offHand', properties: { ac: 2 } });
            break;
        case "Kouzelník":
            finalPack.push({ name: "Hůl", quantity: 1, type: 'item', equipSlot: 'mainHand', properties: { damage: '1d6', damageType: 'drvivé' } });
            finalPack.push({ name: "Ohnivá střela", quantity: 1, type: 'spell', ...SPELLBOOK["Ohnivá střela"], prepared: true });
            finalPack.push({ name: "Mágova ruka", quantity: 1, type: 'spell', ...SPELLBOOK["Mágova ruka"], prepared: true });
            finalPack.push({ name: "Mihotání", quantity: 1, type: 'spell', ...SPELLBOOK["Mihotání"], prepared: true });
            finalPack.push({ name: "Magická střela", quantity: 1, type: 'spell', ...SPELLBOOK["Magická střela"], prepared: false });
            finalPack.push({ name: "Spánek", quantity: 1, type: 'spell', ...SPELLBOOK["Spánek"], prepared: false });
            break;
        case "Klerik":
            finalPack.push({ name: "Palcát", quantity: 1, type: 'item', equipSlot: 'mainHand', properties: { damage: '1d6', damageType: 'drvivé' } });
            finalPack.push({ name: "Štít", quantity: 1, type: 'item', equipSlot: 'offHand', properties: { ac: 2 } });
            finalPack.push({ name: "Léčivé slovo", quantity: 1, type: 'spell', ...SPELLBOOK["Léčivé slovo"], prepared: true });
            break;
        case "Tulák":
            finalPack.push({ name: "Kožená zbroj", quantity: 1, type: 'item', equipSlot: 'armor', properties: { ac: 11 } });
            finalPack.push({ name: "Rapír", quantity: 1, type: 'item', equipSlot: 'mainHand', properties: { damage: '1d8', damageType: 'bodné' } });
            break;
        default:
            finalPack.push({ name: "Dýka", quantity: 1, type: 'item', equipSlot: 'mainHand', properties: { damage: '1d4', damageType: 'bodné' } });
    }

    // Zázemie vybavenie
    const bg = BACKGROUNDS[backgroundName];
    if (bg) {
        bg.equipment.forEach(item => {
            finalPack.push({ name: item, quantity: 1, type: 'item' });
        });
    }

    return finalPack.map(item => ({ ...item, id: Math.random().toString(36).substr(2, 9) }));
}

const CharacterCreation: React.FC<Props> = ({ onComplete, onBack }) => {
  const [heroCount, setHeroCount] = useState<number | null>(null);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [createdList, setCreatedList] = useState<Character[]>([]);

  const raceKeys = Object.keys(RACES);
  const classKeys = Object.keys(CLASSES);
  const backgroundKeys = Object.keys(BACKGROUNDS);

  const [formData, setFormData] = useState({
    name: "",
    race: raceKeys[0],
    className: classKeys[0],
    background: backgroundKeys[0],
    stats: {
      [Attribute.STR]: 10, [Attribute.DEX]: 10, [Attribute.CON]: 10,
      [Attribute.INT]: 10, [Attribute.WIS]: 10, [Attribute.CHA]: 10,
    } as CharacterStats
  });

  const handleStatChange = (attr: Attribute, val: number) => {
    setFormData({
      ...formData,
      stats: { ...formData.stats, [attr]: Math.max(3, Math.min(20, val)) }
    });
  };

  const applyStandardArray = () => {
    const stats: CharacterStats = { ...formData.stats };
    const attributes = Object.values(Attribute);
    STANDARD_ARRAY.forEach((val, idx) => {
      stats[attributes[idx]] = val;
    });
    setFormData({ ...formData, stats });
  };

  const handleNext = () => {
    if (!heroCount) return;

    const finalStats = { ...formData.stats };
    const selectedRace = RACES[formData.race];
    Object.entries(selectedRace.asi).forEach(([stat, bonus]) => {
      finalStats[stat as Attribute] += bonus;
    });

    const selectedClass = CLASSES[formData.className];

    // Automatický prevod Features na Abilities objekty
    const initialAbilities: Ability[] = [
      ...selectedClass.features.map(f => ({
        id: `feat_${f.toLowerCase().replace(/\s/g, '_')}`,
        name: f,
        description: ABILITY_DESCRIPTIONS[f] || "Schopnost tvého povolání."
      })),
      ...selectedRace.traits.map(t => ({
        id: `trait_${t.toLowerCase().replace(/\s/g, '_')}`,
        name: t,
        description: ABILITY_DESCRIPTIONS[t] || "Rys tvé rasy."
      }))
    ];

    const newChar: Character = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name || `Hrdina ${currentHeroIndex + 1}`,
      race: formData.race,
      className: formData.className,
      background: formData.background,
      level: 1,
      hp: { 
        current: selectedClass.hitDie + getModifierValue(finalStats[Attribute.CON]), 
        max: selectedClass.hitDie + getModifierValue(finalStats[Attribute.CON])
      },
      ac: 10 + getModifierValue(finalStats[Attribute.DEX]),
      stats: finalStats,
      inventory: getStarterPack(formData.className, formData.background),
      abilities: initialAbilities,
      notes: `${selectedRace.description}\n\nRys zázemia: ${BACKGROUNDS[formData.background].featureName}`,
      abilitySelections: {},
      equippedItems: {},
      spellSlots: (formData.className === 'Kouzelník' || formData.className === 'Klerik' || formData.className === 'Bard') ? { "1": { current: 2, max: 2 } } : undefined
    };

    const updatedList = [...createdList, newChar];

    if (currentHeroIndex < heroCount - 1) {
      setCreatedList(updatedList);
      setCurrentHeroIndex(prev => prev + 1);
      setFormData({
        name: "", race: raceKeys[0], className: classKeys[0], background: backgroundKeys[0],
        stats: { [Attribute.STR]: 10, [Attribute.DEX]: 10, [Attribute.CON]: 10, [Attribute.INT]: 10, [Attribute.WIS]: 10, [Attribute.CHA]: 10 }
      });
    } else {
      onComplete(updatedList);
    }
  };

  if (heroCount === null) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-stone-950 p-8 space-y-12">
        <h2 className="text-3xl font-serif-fantasy text-amber-500 uppercase tracking-widest">Veľkosť Družiny</h2>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(num => (
            <button key={num} onClick={() => setHeroCount(num)} className="w-24 h-24 border-2 border-stone-800 rounded-xl text-3xl font-serif-fantasy hover:border-amber-500 transition-all">{num}</button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-stone-950 overflow-hidden">
      <header className="p-4 border-b border-amber-900/30 text-center">
        <h2 className="text-xl font-serif-fantasy text-stone-200">Tvorba Postavy ({currentHeroIndex + 1}/{heroCount})</h2>
      </header>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
        <div className="space-y-4">
          <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Meno hrdinu..." className="w-full bg-stone-900 border border-stone-800 rounded p-3 text-amber-100" />
          
          <div className="space-y-1">
            <label className="text-[10px] text-stone-500 uppercase font-serif-fantasy">Rasa</label>
            <select value={formData.race} onChange={e => setFormData({...formData, race: e.target.value})} className="w-full bg-stone-900 border border-stone-800 rounded p-3 text-stone-300">
              {raceKeys.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-stone-500 uppercase font-serif-fantasy">Povolanie</label>
            <select value={formData.className} onChange={e => setFormData({...formData, className: e.target.value})} className="w-full bg-stone-900 border border-stone-800 rounded p-3 text-stone-300">
              {classKeys.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-stone-500 uppercase font-serif-fantasy">Zázemí (Minulost)</label>
            <select value={formData.background} onChange={e => setFormData({...formData, background: e.target.value})} className="w-full bg-stone-900 border border-stone-800 rounded p-3 text-stone-300">
              {backgroundKeys.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
             <h3 className="text-xs font-serif-fantasy text-amber-600 uppercase">Atribúty</h3>
             <button onClick={applyStandardArray} className="text-[10px] border border-amber-900/50 px-2 py-1 rounded">Auto-priradenie</button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(Object.entries(formData.stats) as [Attribute, number][]).map(([attr, val]) => (
              <div key={attr} className="bg-stone-900 border border-stone-800 rounded p-2 flex flex-col items-center">
                <span className="text-[9px] text-stone-500 uppercase mb-1">{attr}</span>
                <div className="flex items-center space-x-2">
                  <button onClick={() => handleStatChange(attr, val - 1)} className="text-stone-500">-</button>
                  <span className="text-lg font-serif-fantasy">{val}</span>
                  <button onClick={() => handleStatChange(attr, val + 1)} className="text-stone-500">+</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 bg-stone-950 border-t border-amber-900/20">
        <button onClick={handleNext} className="w-full py-4 rounded bg-red-950 text-red-200 font-serif-fantasy uppercase tracking-widest border border-red-900/50">
          {currentHeroIndex < heroCount - 1 ? 'Ďalší hrdina' : 'Dokončiť družinu'}
        </button>
      </div>
    </div>
  );
};

export default CharacterCreation;
