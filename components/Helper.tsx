
import React, { useState } from 'react';
import { SCHOOLS_OF_MAGIC, ABILITY_DESCRIPTIONS } from '../constants';

const Helper: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'magic' | 'stats' | 'combat' | 'basics'>('magic');

    return (
        <div className="flex flex-col h-full space-y-4">
            {/* Tabs */}
            <div className="flex bg-stone-900 p-1 rounded-lg border border-stone-800 flex-shrink-0">
                <button 
                    onClick={() => setActiveTab('magic')} 
                    className={`flex-1 py-1.5 text-[10px] font-serif-fantasy uppercase tracking-wider rounded transition-all ${activeTab === 'magic' ? 'bg-amber-900/30 text-amber-500' : 'text-stone-500'}`}
                >
                    Mágia
                </button>
                <button 
                    onClick={() => setActiveTab('stats')} 
                    className={`flex-1 py-1.5 text-[10px] font-serif-fantasy uppercase tracking-wider rounded transition-all ${activeTab === 'stats' ? 'bg-amber-900/30 text-amber-500' : 'text-stone-500'}`}
                >
                    Staty
                </button>
                <button 
                    onClick={() => setActiveTab('combat')} 
                    className={`flex-1 py-1.5 text-[10px] font-serif-fantasy uppercase tracking-wider rounded transition-all ${activeTab === 'combat' ? 'bg-amber-900/30 text-amber-500' : 'text-stone-500'}`}
                >
                    Boj
                </button>
                <button 
                    onClick={() => setActiveTab('basics')} 
                    className={`flex-1 py-1.5 text-[10px] font-serif-fantasy uppercase tracking-wider rounded transition-all ${activeTab === 'basics' ? 'bg-amber-900/30 text-amber-500' : 'text-stone-500'}`}
                >
                    Základy
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
                {activeTab === 'magic' && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <div className="border-l-2 border-purple-500 pl-3 py-1">
                            <h3 className="text-sm font-serif-fantasy text-purple-400 uppercase mb-1">Školy Mágie</h3>
                            <p className="text-[10px] text-stone-500 italic">Každé kúzlo patrí do jednej z ôsmich škôl. Tu je ich význam:</p>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                            {Object.entries(SCHOOLS_OF_MAGIC).map(([school, desc]) => (
                                <div key={school} className="bg-stone-900/50 border border-stone-800 p-3 rounded-lg group hover:border-purple-900/50 transition-colors">
                                    <h4 className="text-amber-500 font-serif-fantasy text-xs mb-1">{school}</h4>
                                    <p className="text-[11px] text-stone-300 leading-relaxed">{desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'stats' && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <div className="border-l-2 border-blue-500 pl-3 py-1">
                            <h3 className="text-sm font-serif-fantasy text-blue-400 uppercase mb-1">Atribúty (Vlastnosti)</h3>
                            <p className="text-[10px] text-stone-500 italic">Tieto čísla určujú, v čom si dobrý:</p>
                        </div>
                        <div className="space-y-3">
                            <div className="bg-stone-900/50 border border-stone-800 p-3 rounded-lg">
                                <h4 className="text-amber-500 font-serif-fantasy text-xs mb-1">Sila (STR)</h4>
                                <p className="text-[11px] text-stone-300">Fyzická sila, nosenie, skákanie, útoky zbraňami na blízko.</p>
                            </div>
                            <div className="bg-stone-900/50 border border-stone-800 p-3 rounded-lg">
                                <h4 className="text-amber-500 font-serif-fantasy text-xs mb-1">Obratnosť (DEX)</h4>
                                <p className="text-[11px] text-stone-300">Reflexy, rovnováha, nenápadnosť, útoky na diaľku a OČ (obranné číslo).</p>
                            </div>
                            <div className="bg-stone-900/50 border border-stone-800 p-3 rounded-lg">
                                <h4 className="text-amber-500 font-serif-fantasy text-xs mb-1">Odolnosť (CON)</h4>
                                <p className="text-[11px] text-stone-300">Zdravie a výdrž. Určuje tvoje maximum životov (HP).</p>
                            </div>
                            <div className="bg-stone-900/50 border border-stone-800 p-3 rounded-lg">
                                <h4 className="text-amber-500 font-serif-fantasy text-xs mb-1">Inteligencia (INT)</h4>
                                <p className="text-[11px] text-stone-300">Pamäť, logika a vzdelanie. Kľúčové pre Kúzelníkov.</p>
                            </div>
                            <div className="bg-stone-900/50 border border-stone-800 p-3 rounded-lg">
                                <h4 className="text-amber-500 font-serif-fantasy text-xs mb-1">Múdrosť (WIS)</h4>
                                <p className="text-[11px] text-stone-300">Vnímanie okolia, intuícia a skúsenosť. Kľúčové pre Klerikov a Hraničiarov.</p>
                            </div>
                            <div className="bg-stone-900/50 border border-stone-800 p-3 rounded-lg">
                                <h4 className="text-amber-500 font-serif-fantasy text-xs mb-1">Charizma (CHA)</h4>
                                <p className="text-[11px] text-stone-300">Sila osobnosti, presvedčovanie a velenie. Kľúčové pre Bardov a Paladinov.</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'combat' && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <div className="border-l-2 border-red-500 pl-3 py-1">
                            <h3 className="text-sm font-serif-fantasy text-red-400 uppercase mb-1">Bojové Mechaniky</h3>
                            <p className="text-[10px] text-stone-500 italic">Čo robiť v boji:</p>
                        </div>
                        <div className="space-y-3">
                            <div className="bg-stone-900/50 border border-stone-800 p-3 rounded-lg">
                                <h4 className="text-red-400 font-serif-fantasy text-xs mb-1">Iniciatíva</h4>
                                <p className="text-[11px] text-stone-300">Hod d20 + Obratnosť. Určuje poradie, v akom postavy hrajú.</p>
                            </div>
                            <div className="bg-stone-900/50 border border-stone-800 p-3 rounded-lg">
                                <h4 className="text-red-400 font-serif-fantasy text-xs mb-1">Útok vs. OČ</h4>
                                <p className="text-[11px] text-stone-300">Hádžeš d20. Ak výsledok rovná alebo prevyšuje Obranné číslo (OČ) nepriateľa, zasiahneš.</p>
                            </div>
                            <div className="bg-stone-900/50 border border-stone-800 p-3 rounded-lg">
                                <h4 className="text-red-400 font-serif-fantasy text-xs mb-1">Zranenie</h4>
                                <p className="text-[11px] text-stone-300">Po zásahu hádžeš kockami zbrane (napr. 1d8) a odpočítaš výsledok od HP nepriateľa.</p>
                            </div>
                            <div className="bg-stone-900/50 border border-stone-800 p-3 rounded-lg">
                                <h4 className="text-red-400 font-serif-fantasy text-xs mb-1">Výhoda & Nevýhoda</h4>
                                <p className="text-[11px] text-stone-300">Hádžeš d20 dvakrát. Pri výhode berieš vyššie číslo, pri nevýhode nižšie.</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'basics' && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <div className="border-l-2 border-green-500 pl-3 py-1">
                            <h3 className="text-sm font-serif-fantasy text-green-400 uppercase mb-1">Základy D&D</h3>
                            <p className="text-[10px] text-stone-500 italic">Pravidlá v skratke:</p>
                        </div>
                        <div className="space-y-3">
                             {Object.entries(ABILITY_DESCRIPTIONS).slice(0, 5).map(([name, desc]) => (
                                <div key={name} className="bg-stone-900/50 border border-stone-800 p-3 rounded-lg">
                                    <h4 className="text-amber-500 font-serif-fantasy text-xs mb-1">{name}</h4>
                                    <p className="text-[11px] text-stone-300 leading-relaxed">{desc}</p>
                                </div>
                            ))}
                            <div className="bg-stone-900/50 border border-stone-800 p-3 rounded-lg">
                                <h4 className="text-amber-500 font-serif-fantasy text-xs mb-1">Odpočinok</h4>
                                <p className="text-[11px] text-stone-300"><strong>Krátky (1h):</strong> Môžeš si doliečiť HP cez Kocky života. <br/><strong>Dlhý (8h):</strong> Plne obnoví HP a pozície kúziel.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-amber-950/10 border border-amber-900/20 rounded-xl p-3 flex-shrink-0">
                <p className="text-[10px] text-amber-500/70 leading-relaxed italic text-center">
                    "Najlepší spôsob, ako sa naučiť D&D, je začať hrať. Neboj sa pýtať DM na čokoľvek v chate!"
                </p>
            </div>
        </div>
    );
};

export default Helper;
