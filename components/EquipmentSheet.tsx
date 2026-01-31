
import React from 'react';
import { Character, InventoryItem, EquipSlot } from '../types';
import { COLORS, Icons } from '../constants';

interface Props {
  character: Character;
  onCharacterUpdate: (character: Character) => void;
}

const EquipmentSheet: React.FC<Props> = ({ character, onCharacterUpdate }) => {
  
  const handleUnequip = (slot: EquipSlot) => {
    const newEquippedItems = { ...character.equippedItems };
    delete newEquippedItems[slot];
    onCharacterUpdate({ ...character, equippedItems: newEquippedItems });
  };

  const renderSlot = (slot: EquipSlot, slotLabel: string, icon?: React.ReactNode) => {
    const equippedItemId = character.equippedItems[slot];
    const equippedItem = character.inventory.find(item => item.id === equippedItemId);

    return (
      <div className={`group relative bg-stone-900/40 border ${equippedItem ? 'border-amber-900/50 bg-amber-900/5' : 'border-stone-800'} p-2 rounded-lg transition-all hover:border-amber-700/50`}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[8px] text-stone-500 font-serif-fantasy uppercase tracking-widest">{slotLabel}</span>
          {equippedItem && (
            <button
              onClick={() => handleUnequip(slot)}
              className="text-[9px] text-red-500/50 hover:text-red-500 font-serif-fantasy uppercase transition-colors"
            >
              Odložiť
            </button>
          )}
        </div>
        
        {equippedItem ? (
          <div className="flex items-center space-x-2">
            <div className="flex-1 min-w-0">
              <p className="text-amber-500 font-serif-fantasy text-xs truncate">{equippedItem.name}</p>
              <div className="flex gap-2">
                {equippedItem.properties?.ac && (
                  <span className="text-[9px] font-bold text-sky-400">AC +{equippedItem.properties.ac}</span>
                )}
                {equippedItem.properties?.damage && (
                  <span className="text-[9px] font-bold text-red-400">{equippedItem.properties.damage}</span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-2 opacity-20">
             <span className="text-[10px] text-stone-600 font-serif-fantasy italic">Prázdne</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in h-full overflow-y-auto pr-1 pb-8">
      <div className="border-b border-amber-900 pb-2">
        <h2 className="text-xl font-serif-fantasy text-amber-500">Nasadené Vybavenie</h2>
        <p className="text-xs text-stone-500 uppercase tracking-widest font-serif-fantasy">{character.name}</p>
      </div>

      {/* Group: Combat */}
      <section className="space-y-2">
        <h3 className="text-[9px] text-stone-600 uppercase font-bold tracking-widest ml-1">Zbrane & Obrana</h3>
        <div className="grid grid-cols-2 gap-2">
          {renderSlot('mainHand', 'Hlavná ruka')}
          {renderSlot('offHand', 'Vedľajšia ruka')}
          <div className="col-span-2">
            {renderSlot('armor', 'Brnenie / Odev')}
          </div>
        </div>
      </section>

      {/* Group: Accessories */}
      <section className="space-y-2">
        <h3 className="text-[9px] text-stone-600 uppercase font-bold tracking-widest ml-1">Doplnky & Magické predmety</h3>
        <div className="grid grid-cols-2 gap-2">
          {renderSlot('head', 'Hlava')}
          {renderSlot('neck', 'Krk / Amulet')}
          {renderSlot('back', 'Plášť')}
          {renderSlot('waist', 'Opasok')}
          {renderSlot('hands', 'Ruky / Nátepníky')}
          {renderSlot('feet', 'Nohy / Čižmy')}
        </div>
      </section>

      {/* Group: Rings */}
      <section className="space-y-2">
        <h3 className="text-[9px] text-stone-600 uppercase font-bold tracking-widest ml-1">Prstene</h3>
        <div className="grid grid-cols-2 gap-2">
          {renderSlot('ring1', 'Prsteň 1')}
          {renderSlot('ring2', 'Prsteň 2')}
        </div>
      </section>

      <div className="bg-amber-950/10 border border-amber-900/20 rounded-xl p-4 mt-6">
          <p className="text-[10px] text-stone-500 leading-relaxed text-center italic">
            Všetky bonusy z nasadených predmetov (ako napr. Náhrdelník ochrany) sú automaticky pripočítané k tvojmu OČ v denníku postavy.
          </p>
      </div>
    </div>
  );
};

export default EquipmentSheet;
