

import { GoogleGenAI, FunctionDeclaration, Type } from "@google/genai";
import { Message, Character, CampaignSettings, Attribute, LanguageModelId } from "./types";
import { calculateTotalAC } from './utils';
import { RACES, CLASSES, BACKGROUNDS } from './constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const gameTools: FunctionDeclaration[] = [
  {
    name: "addToInventory",
    description: "Pridá predmet/kúzlo do inventára postavy. Pre nositeľné veci VŽDY definuj 'equipSlot'.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        characterName: { type: Type.STRING },
        itemName: { type: Type.STRING },
        quantity: { type: Type.INTEGER },
        itemType: { type: Type.STRING, description: "'item' alebo 'spell'" },
        description: { type: Type.STRING },
        properties: { 
            type: Type.OBJECT,
            properties: {
                ac: { type: Type.NUMBER, description: "Bonus k AC (napr. 1 pre náhrdelník ochrany)" },
                damage: { type: Type.STRING, description: "Kocka zranenia (napr. 1d8)" },
                damageType: { type: Type.STRING }
            }
        }
      },
      required: ["characterName", "itemName", "quantity"],
    },
  },
  {
    name: "equipItem",
    description: "Nasadí predmet, ktorý už postava má v inventári, do slotu vybavenia.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        characterName: { type: Type.STRING },
        itemName: { type: Type.STRING },
        slot: { type: Type.STRING, description: "head, neck, armor, mainHand, offHand, back, hands, waist, feet, ring1, ring2" }
      },
      required: ["characterName", "itemName", "slot"]
    }
  },
  {
    name: "levelUpCharacter",
    description: "Technické zvýšenie úrovne a Max HP v systéme. Zavolaj ako prvé pri level-upe.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        characterName: { type: Type.STRING },
        newLevel: { type: Type.INTEGER },
        hpIncrease: { type: Type.INTEGER },
      },
      required: ["characterName", "newLevel", "hpIncrease"],
    },
  },
  {
    name: "addCharacterAbility",
    description: "Pridá novú schopnosť alebo rys do záložky schopností.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        characterName: { type: Type.STRING },
        abilityName: { type: Type.STRING },
        abilityDescription: { type: Type.STRING }
      },
      required: ["characterName", "abilityName", "abilityDescription"]
    }
  },
  {
    name: "updateCharacterStats",
    description: "Upraví základné atribúty (STR, DEX...). Použi po hráčovom výbere ASI bodov.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        characterName: { type: Type.STRING },
        statsToUpdate: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              stat: { type: Type.STRING, description: "STR, DEX, CON, INT, WIS alebo CHA" },
              newValue: { type: Type.INTEGER }
            },
            required: ["stat", "newValue"]
          }
        }
      },
      required: ["characterName", "statsToUpdate"]
    }
  },
  {
    name: "updateSpellSlots",
    description: "Aktualizuje maximálny a aktuálny počet pozícií kúziel pre postavu. Použi pri level-upe alebo dlhom odpočinku.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            characterName: { type: Type.STRING },
            spellSlots: {
                type: Type.ARRAY,
                description: "Kompletný zoznam všetkých pozícií, ktoré postava má.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        level: { type: Type.INTEGER, description: "Úroveň pozície (1-9)" },
                        current: { type: Type.INTEGER },
                        max: { type: Type.INTEGER }
                    },
                    required: ["level", "current", "max"]
                }
            }
        },
        required: ["characterName", "spellSlots"]
    }
  }
];

const formatPartySheetForPrompt = (party: Character[]): string => {
  return party.map(character => {
      const totalAC = calculateTotalAC(character);
      const abilitiesList = character.abilities.map(a => a.name).join(", ");
      return `
--- POSTAVA: ${character.name} ---
Level: ${character.level}, Povolanie: ${character.className}.
Staty: STR:${character.stats.STR}, DEX:${character.stats.DEX}, CON:${character.stats.CON}, INT:${character.stats.INT}, WIS:${character.stats.WIS}, CHA:${character.stats.CHA}
`;
  }).join('\n');
}

export const getDungeonMasterResponse = async (
  party: Character[],
  history: Message[],
  userPrompt: string,
  campaign: CampaignSettings,
  selectedModelId: LanguageModelId // Add selectedModelId parameter
): Promise<{ text: string; functionCalls?: any[] }> => {
  try {
    const partySheet = formatPartySheetForPrompt(party);
    
    const response = await ai.models.generateContent({
      model: selectedModelId, // Use the selected model ID here
      contents: [
        ...history.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
        { role: 'user', parts: [{ text: userPrompt }] }
      ],
      config: {
        systemInstruction: `Jsi Dungeon Master (DM) pro D&D 5e. Tvým úkolem je vést příběh a striktně hlídat level-up postav.

TABULKA ASI (ZVYŠOVÁNÍ VLASTNOSTÍ):
Každá postava získává ASI na úrovních: 4, 8, 12, 16, 19.
- BOJOVNÍK (Fighter): získává ASI navíc na 6. a 14. úrovni.
- TULÁK (Rogue): získává ASI navíc na 10. úrovni.

TABULKA POZIC KOUZEL (Kouzelník/Klerik):
- Lvl 1: 2x 1. kruh
- Lvl 2: 3x 1. kruh
- Lvl 3: 4x 1. kruh, 2x 2. kruh
- Lvl 4: 4x 1. kruh, 3x 2. kruh
- Lvl 5: 4x 1. kruh, 3x 2. kruh, 2x 3. kruh

LEVEL-UP PROTOKOL:
Když postava získá novú úroveň, MUSÍŠ postupovať takto:
1. Zavolej 'levelUpCharacter' (zvýšenie Levelu a Max HP).
2. Zkontroluj tabulku ASI. Pokud získala ASI, proveď ASI protokol.
3. Pro magická povolání ZKONTROLUJ TABULKU POZIC KOUZEL a zavolej 'updateSpellSlots' s novými maximálnymi hodnotami. Aktuální sloty nastav na nové maximum.
4. Přidej nové schopnosti třídy přes 'addCharacterAbility'.
5. Až hráč odpoví na ASI, zavolej 'updateCharacterStats'.

Při DLOUHÉM ODPOČINKU použij 'updateSpellSlots' k obnovení všetkých aktuálnych pozic na maximum.

AKTUÁLNY STAV DRUŽINY:
${partySheet}

Odpovídej slovensky, atmosféricky a proaktivně spravuj hárky.`,
        temperature: 0.7,
        tools: [{ functionDeclarations: gameTools }],
      },
    });

    return { 
      text: response.text || "",
      functionCalls: response.functionCalls 
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    return { text: "Spojenie s herným svetom bolo prerušené. Skús to znova." };
  }
};