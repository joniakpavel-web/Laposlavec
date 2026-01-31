
import { Character, CharacterStats, Attribute } from './types';

/**
 * Calculates the raw modifier for a given ability score.
 */
export const getModifierValue = (score: number): number => {
    return Math.floor((score - 10) / 2);
};

/**
 * Formats a modifier value into a string with a sign.
 */
export const formatModifier = (modifier: number): string => {
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
};

/**
 * Calculates a character's total Armor Class (AC).
 * Now sums up ALL bonuses from equipped items.
 */
export const calculateTotalAC = (character: Character): number => {
    let baseAc = 0;
    let bonusAc = 0;
    const dexMod = getModifierValue(character.stats.DEX);

    // 1. Determine Base AC
    const equippedArmorId = character.equippedItems.armor;
    const equippedArmor = character.inventory.find(item => item.id === equippedArmorId);

    if (equippedArmor) {
        baseAc = equippedArmor.properties?.ac || 0;
        // Simple logic for Dex bonus based on name/keywords (mocking armor types)
        const armorName = equippedArmor.name.toLowerCase();
        if (armorName.includes('kožená') || armorName.includes('leather') || armorName.includes('róba')) {
             baseAc += dexMod; // Light armor: full DEX
        } else if (armorName.includes('krúžková') || armorName.includes('chain') || armorName.includes('šupinová')) {
             baseAc += Math.min(2, dexMod); // Medium armor: max +2 DEX
        }
        // Heavy armor: no DEX (baseAc is just base)
    } else {
        baseAc = 10 + dexMod; // Unarmored
    }

    // 2. Sum up bonuses from ALL OTHER equipped slots
    Object.entries(character.equippedItems).forEach(([slot, itemId]) => {
        if (slot === 'armor') return; // Skip base armor since it's already handled

        const item = character.inventory.find(i => i.id === itemId);
        if (item && item.properties?.ac) {
            bonusAc += item.properties.ac;
        }
    });

    return baseAc + bonusAc;
};

/**
 * Calculates the maximum number of spells a character can prepare.
 */
export const calculateMaxPreparedSpells = (character: Character): number => {
    const level = character.level;
    
    if (character.className === 'Kouzelník') {
        const intMod = getModifierValue(character.stats.INT);
        return Math.max(1, level + intMod);
    }
    
    if (character.className === 'Klerik') {
        const wisMod = getModifierValue(character.stats.WIS);
        return Math.max(1, level + wisMod);
    }

    if (character.className === 'Paladin') {
        const chaMod = getModifierValue(character.stats.CHA);
        return Math.max(1, Math.floor(level / 2) + chaMod);
    }

    return 99; 
};
