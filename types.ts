

export enum Attribute {
  STR = 'STR',
  DEX = 'DEX',
  CON = 'CON',
  INT = 'INT',
  WIS = 'WIS',
  CHA = 'CHA'
}

export type EquipSlot = 
  | 'mainHand' 
  | 'offHand' 
  | 'armor' 
  | 'head' 
  | 'neck' 
  | 'back' 
  | 'hands' 
  | 'waist' 
  | 'feet' 
  | 'ring1' 
  | 'ring2';

export interface CharacterStats {
  [Attribute.STR]: number;
  [Attribute.DEX]: number;
  [Attribute.CON]: number;
  [Attribute.INT]: number;
  [Attribute.WIS]: number;
  [Attribute.CHA]: number;
}

export interface RaceDef {
  name: string;
  asi: Partial<CharacterStats>;
  traits: string[];
  description: string;
}

export interface ClassDef {
  name: string;
  hitDie: number;
  primaryAbility: Attribute[];
  savingThrows: Attribute[];
  proficiencies: {
    armor: string[];
    weapons: string[];
  };
  features: string[];
  description: string;
}

export interface BackgroundDef {
  name: string;
  skillProficiencies: string[];
  toolProficiencies?: string[];
  languages?: number;
  featureName: string;
  featureDescription: string;
  equipment: string[];
  gold: number;
}

export interface AbilityChoice {
  id: string;
  label: string;
  options: string[];
}

export interface Ability {
  id: string;
  name: string;
  description: string;
  choices?: AbilityChoice[];
}

export interface ItemProperties {
  ac?: number;
  damage?: string;
  damageType?: string;
  healing?: string;
}

export interface Character {
  id: string;
  name: string;
  race: string;
  className: string;
  background: string;
  level: number;
  hp: {
    current: number;
    max: number;
  };
  ac: number;
  stats: CharacterStats;
  inventory: InventoryItem[];
  abilities: Ability[];
  notes: string;
  abilitySelections: Record<string, Record<string, string>>;
  spellSlots?: Record<string, { current: number; max: number; }>;
  equippedItems: Partial<Record<EquipSlot, string>>;
}

export interface InventoryItem {
  id:string;
  name: string;
  quantity: number;
  type: 'item' | 'spell';
  properties?: ItemProperties;
  description?: string;
  prepared?: boolean;
  equipSlot?: EquipSlot;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
}

export interface DiceRoll {
  id: string;
  die: number;
  result: number;
  timestamp: number;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  text: string;
}

export interface CampaignSettings {
  id: string;
  name: string;
  lastPlayed: number;
  description: string;
  customRules: string;
  rulesPdfName?: string;
  campaignPdfName?: string;
  party: Character[];
  messages: Message[];
  diceHistory: DiceRoll[];
  gameLog: LogEntry[];
  difficulty: 'story' | 'moderate' | 'hero';
}

export type LanguageModelId = 'gemini-3-flash-preview' | 'gemini-3-pro-preview';

export interface LanguageModelOption {
  id: LanguageModelId;
  name: string;
  description: string;
}