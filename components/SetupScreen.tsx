
import React, { useState, useRef } from 'react';
import { CampaignSettings } from '../types';
import { COLORS } from '../constants';

interface Props {
  initialCampaign: CampaignSettings;
  onStart: (setupData: Partial<Pick<CampaignSettings, 'name' | 'description' | 'customRules' | 'rulesPdfName' | 'campaignPdfName'>>) => void;
  onBack: () => void;
}

const SetupScreen: React.FC<Props> = ({ initialCampaign, onStart, onBack }) => {
  const [campaignName, setCampaignName] = useState(initialCampaign.name);
  const [localDesc, setLocalDesc] = useState(initialCampaign.description);
  const [localRules, setLocalRules] = useState(initialCampaign.customRules);
  const [rulesFileName, setRulesFileName] = useState(initialCampaign.rulesPdfName || '');
  const [campaignFileName, setCampaignFileName] = useState(initialCampaign.campaignPdfName || '');

  const rulesInputRef = useRef<HTMLInputElement>(null);
  const campaignInputRef = useRef<HTMLInputElement>(null);

  const handleStart = () => {
    onStart({
      name: campaignName.trim() === '' ? 'Nové Dobrodružstvo' : campaignName,
      description: localDesc,
      customRules: localRules,
      rulesPdfName: rulesFileName,
      campaignPdfName: campaignFileName
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'rules' | 'campaign') => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      if (type === 'rules') setRulesFileName(file.name);
      else setCampaignFileName(file.name);
    } else if (file) {
      alert('Prosím, vložte súbor vo formáte PDF.');
    }
  };

  const removeFile = (e: React.MouseEvent, type: 'rules' | 'campaign') => {
    e.stopPropagation();
    if (type === 'rules') {
      setRulesFileName('');
      if (rulesInputRef.current) rulesInputRef.current.value = '';
    } else {
      setCampaignFileName('');
      if (campaignInputRef.current) campaignInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-stone-950 p-6 animate-in slide-in-from-right duration-500 overflow-y-auto">
      <div className="flex items-center space-x-4 mb-6">
        <button onClick={onBack} className="text-amber-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h2 className="text-2xl font-serif-fantasy text-stone-200 uppercase tracking-widest">Nová Hra</h2>
      </div>

      <div className="space-y-6 pb-24">
        {/* Campaign Name */}
        <section className="space-y-2">
           <h3 className="text-[10px] font-serif-fantasy text-amber-600 uppercase tracking-widest border-b border-amber-900/30 pb-1">Meno Kampane</h3>
           <input 
              type="text"
              value={campaignName}
              onChange={e => setCampaignName(e.target.value)}
              placeholder="Napr. Stratená baňa Fendelveru"
              className="w-full bg-stone-900 border border-stone-800 rounded-lg p-3 text-sm text-amber-100 focus:outline-none focus:border-amber-700"
            />
        </section>

        {/* Rules PDF */}
        <section className="space-y-2">
          <h3 className="text-[10px] font-serif-fantasy text-amber-600 uppercase tracking-widest border-b border-amber-900/30 pb-1">Nahraj PDF pravidlá</h3>
          <input type="file" ref={rulesInputRef} onChange={(e) => handleFileChange(e, 'rules')} accept=".pdf" className="hidden" />
          <div onClick={() => rulesInputRef.current?.click()} className={`p-4 border-2 border-dashed ${rulesFileName ? 'border-amber-500 bg-amber-900/10' : 'border-stone-800 bg-stone-900/30'} rounded-xl flex items-center justify-between cursor-pointer transition-all`}>
            <span className="text-[10px] text-stone-400 font-serif-fantasy uppercase tracking-tighter truncate max-w-[80%]">
              {rulesFileName || 'Vložiť PDF pravidiel'}
            </span>
            {rulesFileName && <button onClick={(e) => removeFile(e, 'rules')} className="text-red-500">×</button>}
          </div>
        </section>

        {/* Campaign PDF */}
        <section className="space-y-2">
          <h3 className="text-[10px] font-serif-fantasy text-amber-600 uppercase tracking-widest border-b border-amber-900/30 pb-1">Nahraj PDF kampaň</h3>
          <input type="file" ref={campaignInputRef} onChange={(e) => handleFileChange(e, 'campaign')} accept=".pdf" className="hidden" />
          <div onClick={() => campaignInputRef.current?.click()} className={`p-4 border-2 border-dashed ${campaignFileName ? 'border-amber-500 bg-amber-900/10' : 'border-stone-800 bg-stone-900/30'} rounded-xl flex items-center justify-between cursor-pointer transition-all`}>
            <span className="text-[10px] text-stone-400 font-serif-fantasy uppercase tracking-tighter truncate max-w-[80%]">
              {campaignFileName || 'Vložiť PDF kampane'}
            </span>
            {campaignFileName && <button onClick={(e) => removeFile(e, 'campaign')} className="text-red-500">×</button>}
          </div>
        </section>

        {/* Custom Rules Text */}
        <section className="space-y-2">
          <h3 className="text-[10px] font-serif-fantasy text-amber-600 uppercase tracking-widest border-b border-amber-900/30 pb-1">Uprav s: Pravidlá (Text)</h3>
          <textarea 
            value={localRules}
            onChange={(e) => setLocalRules(e.target.value)}
            placeholder="Dodatočné pravidlá..."
            className="w-full bg-stone-900 border border-stone-800 rounded-lg p-3 text-sm text-stone-300 focus:outline-none focus:border-amber-700 min-h-[80px] resize-none"
          />
        </section>

        {/* Campaign Text */}
        <section className="space-y-2">
          <h3 className="text-[10px] font-serif-fantasy text-amber-600 uppercase tracking-widest border-b border-amber-900/30 pb-1">Vytvor vlastné body kampane (Text)</h3>
          <textarea 
            value={localDesc}
            onChange={(e) => setLocalDesc(e.target.value)}
            placeholder="Popis sveta, postáv, lokalít..."
            className="w-full bg-stone-900 border border-stone-800 rounded-lg p-3 text-sm text-stone-300 focus:outline-none focus:border-amber-700 min-h-[120px] resize-none"
          />
        </section>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-stone-950 to-transparent">
        <button 
          onClick={handleStart}
          className={`w-full py-5 rounded-lg ${COLORS.burgundy} ${COLORS.burgundyText} font-serif-fantasy tracking-[0.2em] text-lg uppercase shadow-xl active:scale-95 transition-transform`}
        >
          Pokračovať na Tvorbu Postáv
        </button>
      </div>
    </div>
  );
};

export default SetupScreen;
