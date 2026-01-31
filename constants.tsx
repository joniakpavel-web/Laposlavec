

import React from 'react';
import { ItemProperties, Attribute, RaceDef, ClassDef, BackgroundDef, LanguageModelOption } from './types';

export const COLORS = {
  bg: 'bg-stone-950',
  card: 'bg-stone-900',
  gold: 'text-amber-500',
  goldBorder: 'border-amber-700',
  burgundy: 'bg-red-950',
  burgundyText: 'text-red-200',
};

export const LANGUAGE_MODELS: LanguageModelOption[] = [
  { 
    id: 'gemini-3-flash-preview', 
    name: 'Flash (Rýchly)', 
    description: 'Pre základné textové úlohy, summarizáciu, korektúry a jednoduché otázky a odpovede. Nízka latencia.' 
  },
  { 
    id: 'gemini-3-pro-preview', 
    name: 'Pro (Presný)', 
    description: 'Pre komplexné textové úlohy, pokročilé uvažovanie, kódovanie, matematiku a STEM. Vyššia kvalita, mierne vyššia latencia.' 
  }
];

export const ABILITY_DESCRIPTIONS: Record<string, string> = {
  "Druhý dech": "Ve svém tahu můžeš použít bonusovou akci k obnově HP (1d10 + úroveň bojovníka). Použitelné jednou za krátký/dlouhý odpočinek.",
  "Akční vlna": "Ve svém tahu můžeš provést jednu dodatečnou akci. Použitelné jednou za krátký/dlouhý odpočinek.",
  "Bojový styl": "Specializuješ se na určitý styl boje (např. Obrana +1 k OČ, nebo Souboj +2 k poškození jednoruční zbraní).",
  "Mystická obnova": "Jednou za den si můžeš po krátkém odpočinku obnovit pozice kouzel, jejichž celková úroveň je rovna polovině tvé úrovně kouzelníka.",
  "Sesílání kouzel": "Schopnost využívat magickou energii k sesílání mocných efektů pomocí tvé inteligence nebo moudrosti.",
  "Nenápadný útok": "Jednou za tah můžeš udělit extra 1d6 poškození tvoru, kterého zasáhneš útokem s výhodou, nebo pokud je spojenec u cíle.",
  "Zlodějský slang": "Rozumíš tajnému jazyku zločinců a dokážeš v něm předávat skryté zprávy.",
  "Božský úder": "Když zasáhneš tvora útokem zbraní na blízko, můžeš utratit pozici kouzla a udělit extra zářivé poškození.",
  "Vkládání rukou": "Máš zásobu léčivé energie (5x úroveň paladina), kterou můžeš dotykem předat k léčení zranění nebo nemocí.",
  "Oblíbený nepřítel": "Máš výhodu při stopování a ověřování inteligence o určitém typu tvorů.",
  "Vidění ve tmě": "Vidíš v šeru jako v jasném světle a ve tmě jako v šeru do vzdálenosti 12 metrů.",
  "Fey původ": "Máš výhodu při záchranných hodech proti očarování a magie tě nemůže uspat.",
  "Trans": "Elfové nespí. Místo toho se na 4 hodiny ponoří do hluboké meditace.",
  "Štěstí": "Když ti padne 1 na d20 při útoku, ověření nebo záchranném hodu, můžeš si hod zopakovat.",
  "Odvážnost": "Máš výhodu při záchranných hodech proti vystrašení.",
  "Všestrannost": "Lidé získávají +1 ke všem vlastnostem.",
  "Trpasličí odolnost": "Máš výhodu při záchraně proti jedu a odolnost vůči jedovému poškození.",
  "Bardův dar": "Můžeš inspirovať ostatné pomocou d6, ktorú si môžu pridať k hodu.",
  "Průzkumník divočiny": "Jsi expert na navigaci a přežití v určitém typu terénu."
};

export const BACKGROUNDS: Record<string, BackgroundDef> = {
  "Akolyta": {
    name: "Akolyta",
    skillProficiencies: ["Mystika", "Náboženství"],
    languages: 2,
    featureName: "Úkryt u věřících",
    featureDescription: "Můžeš zajistit bezplatné léčení a péči v chrámech tvého božstva.",
    equipment: ["Svatý symbol", "Modlitební kniha", "Měšec s 15 zl."],
    gold: 15
  },
  "Zločinec": {
    name: "Zločinec",
    skillProficiencies: ["Čachry", "Nenápadnost"],
    toolProficiencies: ["Zlodějské náčiní"],
    featureName: "Zločinecké kontakty",
    featureDescription: "Máš kontakt na síť zločinců, kteří ti mohou zajistit pomoc.",
    equipment: ["Páčidlo", "Tmavé oblečení", "Měšec s 15 zl."],
    gold: 15
  },
  "Hrdina z lidu": {
    name: "Hrdina z lidu",
    skillProficiencies: ["Ovládání zvířat", "Přežití"],
    toolProficiencies: ["Vozidla"],
    featureName: "Venkovská pohostinnost",
    featureDescription: "Obyčejní lidé tě rádi ubytují a skryjí tě před zákonem.",
    equipment: ["Železný hrnec", "Běžné oblečení", "Měšec s 10 zl."],
    gold: 10
  },
  "Šlechtic": {
    name: "Šlechtic",
    skillProficiencies: ["Historie", "Přesvědčování"],
    languages: 1,
    featureName: "Rodová výsada",
    featureDescription: "Lidé tě automaticky respektují a máš přístup do vyšší společnosti.",
    equipment: ["Pečetní prsten", "Jemné oblečení", "Měšec s 25 zl."],
    gold: 25
  },
  "Mudrc": {
    name: "Mudrc",
    skillProficiencies: ["Historie", "Mystika"],
    languages: 2,
    featureName: "Výzkumník",
    featureDescription: "Když něco nevíš, obvykle víš, kde tu informaci najít.",
    equipment: ["Láhev inkoustu", "Brk", "Dopis od kolegy", "Měšec s 10 zl."],
    gold: 10
  },
  "Voják": {
    name: "Voják",
    skillProficiencies: ["Atletika", "Zastrašování"],
    featureName: "Vojenská hodnost",
    featureDescription: "Vojáci stejné nebo nižší hodnosti tě respektují a plní tvé rozkazy.",
    equipment: ["Odznak hodnosti", "Trofey", "Měšec s 10 zl."],
    gold: 10
  }
};

export const RACES: Record<string, RaceDef> = {
  "Člověk": {
    name: "Člověk",
    asi: { STR: 1, DEX: 1, CON: 1, INT: 1, WIS: 1, CHA: 1 },
    traits: ["Všestrannost"],
    description: "Lidé jsou ambiciózní a nejvíce přizpůsobiví ze všech ras."
  },
  "Elf": {
    name: "Elf",
    asi: { DEX: 2 },
    traits: ["Vidění ve tmě", "Fey původ", "Trans"],
    description: "Kouzelný lid nadpozemské milosti, žijící v lesích a městech."
  },
  "Trpaslík": {
    name: "Trpaslík",
    asi: { CON: 2 },
    traits: ["Vidění ve tmě", "Trpasličí odolnost"],
    description: "Mistři kovu a kamene, hrdí válečníci z hor."
  },
  "Hobit": {
    name: "Hobit",
    asi: { DEX: 2 },
    traits: ["Štěstí", "Odvážnost"],
    description: "Malí lidé s velkým srdcem, milující klid domova."
  },
  "Drakorozený": {
    name: "Drakorozený",
    asi: { STR: 2, CHA: 1 },
    traits: ["Dračí původ", "Odolnost vůči poškození"],
    description: "Humanoidní draci s hrdou tradicí."
  },
  "Gnome": {
    name: "Gnome",
    asi: { INT: 2 },
    traits: ["Vidění ve tmě", "Gnomí chytrost"],
    description: "Vynalézaví a energičtí učenci a řemeslníci."
  }
};

export const CLASSES: Record<string, ClassDef> = {
  "Bojovník": {
    name: "Bojovník",
    hitDie: 10,
    primaryAbility: [Attribute.STR],
    savingThrows: [Attribute.STR, Attribute.CON],
    proficiencies: {
      armor: ["Všechny zbroje", "Štíty"],
      weapons: ["Všechny zbraně"]
    },
    features: ["Druhý dech", "Bojový styl"],
    description: "Mistr boje se zbraněmi a zbrojí."
  },
  "Kouzelník": {
    name: "Kouzelník",
    hitDie: 6,
    primaryAbility: [Attribute.INT],
    savingThrows: [Attribute.INT, Attribute.WIS],
    proficiencies: {
      armor: ["Žádná"],
      weapons: ["Dýky", "Hole", "Kuše"]
    },
    features: ["Sesílání kouzel", "Mystická obnova"],
    description: "Učenec ovládající magii skrze studium."
  },
  "Tulák": {
    name: "Tulák",
    hitDie: 8,
    primaryAbility: [Attribute.DEX],
    savingThrows: [Attribute.DEX, Attribute.INT],
    proficiencies: {
      armor: ["Lehké zbroje"],
      weapons: ["Rapíry", "Krátké meče", "Luky"]
    },
    features: ["Nenápadný útok", "Zlodějský slang"],
    description: "Mistr lsti, nenápadnosti a přesných zásahů."
  },
  "Klerik": {
    name: "Klerik",
    hitDie: 8,
    primaryAbility: [Attribute.WIS],
    savingThrows: [Attribute.WIS, Attribute.CHA],
    proficiencies: {
      armor: ["Lehké a střední zbroje", "Štíty"],
      weapons: ["Jednoduché zbraně"]
    },
    features: ["Sesílání kouzel", "Božská doména"],
    description: "Válečník víry ovládající božskou magii."
  },
  "Paladin": {
    name: "Paladin",
    hitDie: 10,
    primaryAbility: [Attribute.STR, Attribute.CHA],
    savingThrows: [Attribute.WIS, Attribute.CHA],
    proficiencies: {
      armor: ["Všechny zbroje", "Štíty"],
      weapons: ["Všechny zbraně"]
    },
    features: ["Božský úder", "Vkládání rukou"],
    description: "Svatý bojovník vázaný přísahou."
  },
  "Bard": {
    name: "Bard",
    hitDie: 8,
    primaryAbility: [Attribute.CHA],
    savingThrows: [Attribute.DEX, Attribute.CHA],
    proficiencies: {
      armor: ["Lehké zbroje"],
      weapons: ["Jednoduché zbraně", "Kordy"]
    },
    features: ["Sesílání kouzel", "Bardův dar"],
    description: "Umělec, jehož hudba je protkána magiou."
  }
};

export const SPELLBOOK: Record<string, { description: string; properties: ItemProperties; level: number }> = {
  "Ohnivá střela": {
    level: 0,
    description: "Vystřelíš paprsek ohně na cíl.",
    properties: { damage: "1d10", damageType: "ohnivé" }
  },
  "Mágova ruka": {
    level: 0,
    description: "Vytvoříš neviditelnou ruku k manipulaci s předměty.",
    properties: {}
  },
  "Mihotání": {
    level: 0,
    description: "Drobné magické triky pro pobavení nebo užitek.",
    properties: {}
  },
  "Mágova zbroj": {
    level: 1,
    description: "Tvé OČ se zvýší na 13 + Obratnost na 8 hodin.",
    properties: { ac: 3 }
  },
  "Magická střela": {
    level: 1,
    description: "Tři magické šipky, které vždy zasáhnou cíl.",
    properties: { damage: "3d4+3", damageType: "silové" }
  },
  "Spánek": {
    level: 1,
    description: "Uspíš skupinu slabších nepřátel.",
    properties: { damage: "5d8" }
  },
  "Léčivé slovo": {
    level: 1,
    description: "Rychle vyléčíš spojence v dohledu.",
    properties: { healing: "1d4" }
  }
};

export const SKILL_MAPPING: Record<string, Attribute> = {
  "Atletika": Attribute.STR, "Akrobacie": Attribute.DEX, "Čachry": Attribute.DEX, "Nenápadnost": Attribute.DEX,
  "Historie": Attribute.INT, "Mystika": Attribute.INT, "Náboženství": Attribute.INT, "Pátrání": Attribute.INT,
  "Lékařství": Attribute.WIS, "Ovládání zvířat": Attribute.WIS, "Přežití": Attribute.WIS, "Vnímání": Attribute.WIS,
  "Klamání": Attribute.CHA, "Přesvědčování": Attribute.CHA, "Zastrašování": Attribute.CHA
};

export const SCHOOLS_OF_MAGIC: Record<string, string> = {
  "Abjurace": "Ochranná magie.",
  "Konjurace": "Vyvolávání předmětů.",
  "Divinace": "Věštění a odhalování.",
  "Očarování": "Ovlivňování mysli.",
  "Evokace": "Uvolňování ničivé energie.",
  "Iluze": "Klamání smyslů.",
  "Nekromancie": "Síly života a smrti.",
  "Transmutace": "Změna fyzické podstaty."
};

export const Icons = {
  User: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  ),
  Sword: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" y1="19" x2="19" y2="13"/><line x1="16" y1="16" x2="20" y2="20"/><line x1="19" y1="21" x2="20" y2="20"/></svg>
  ),
  Dice: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M7 7h.01"/><path d="M17 7h.01"/><path d="M7 17h.01"/><path d="M17 17h.01"/><path d="M12 12h.01"/></svg>
  ),
  Message: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
  ),
  Plus: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
  ),
  Trash: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
  ),
  Edit: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
  ),
  Book: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20v-1H6.5A2.5 2.5 0 0 1 4 13.5V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
  ),
  Bookmark: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
  ),
  Menu: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
  ),
  Upload: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
  ),
  Settings: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.78 1.28a2 2 0 0 0 .73 2.73l.15.08a2 2 0 0 1 1 1.73v.56a2 2 0 0 1-1 1.73l-.15.08a2 2 0 0 0-.73 2.73l.78 1.28a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.78-1.28a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.73v-.56a2 2 0 0 1 1-1.73l.15-.08a2 2 0 0 0 .73-2.73l-.78-1.28a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
  )
};