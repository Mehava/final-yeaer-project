
import React, { useState, useRef } from 'react';
import { generateScript } from '../services/openRouterService';
import { generateAudio, pcmToWav, checkCulturalSensitivity } from '../services/geminiService';
import { saveProjectData } from '../services/supabaseClient';
import { Language, Mood, Region } from '../types';
import { 
  Send, 
  Copy, 
  Check, 
  Download, 
  PenTool, 
  Volume2, 
  Zap,
  RotateCcw,
  Sparkles,
  Headphones,
  User,
  ShieldCheck,
  MapPin,
  Smile,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Layers
} from 'lucide-react';

const ScriptGenerator: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [checkingCulture, setCheckingCulture] = useState(false);
  
  const [brandName, setBrandName] = useState('');
  const [productDesc, setProductDesc] = useState('');
  const [audience, setAudience] = useState('');
  const [mood, setMood] = useState<Mood>(Mood.PROFESSIONAL);
  const [region, setRegion] = useState<Region>(Region.PAN_INDIA);
  const [voice, setVoice] = useState('Kore'); 
  const [language, setLanguage] = useState<Language>(Language.HINDI);
  
  const [variations, setVariations] = useState<string[]>([]);
  const [activeVariationIndex, setActiveVariationIndex] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [culturalReport, setCulturalReport] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentScript = variations[activeVariationIndex] || null;

  const handleGenerate = async () => {
    if (!brandName || !productDesc) return;
    setLoading(true);
    setAudioUrl(null);
    setVariations([]);
    setActiveVariationIndex(0);
    setCulturalReport(null);
    
    const results = await generateScript(brandName, productDesc, audience, language, mood, region);
    if (results && results.length > 0) {
      setVariations(results);
      // Persistent Save
      await saveProjectData('script', { 
        brandName, 
        scripts: results, 
        language, 
        mood, 
        region,
        productDesc
      });
      
      // Local Fallback Sync
      const history = JSON.parse(localStorage.getItem('bharat_scripts') || '[]');
      history.unshift({
        id: Date.now().toString(),
        type: 'script',
        content: { brandName, scripts: results, language, mood, region },
        created_at: new Date().toISOString()
      });
      localStorage.setItem('bharat_scripts', JSON.stringify(history.slice(0, 50)));
    }
    setLoading(false);
  };

  const handleGenerateAudio = async () => {
    if (!currentScript) return;
    setAudioLoading(true);
    const audioData = await generateAudio(currentScript, language, voice);
    if (audioData) {
      const wavUrl = pcmToWav(audioData);
      setAudioUrl(wavUrl);

      // Save Audio to Archive
      await saveProjectData('audio', {
        brandName,
        text: currentScript,
        audioBase64: audioData,
        language,
        voice,
        mood,
        region
      });

      const audioHistory = JSON.parse(localStorage.getItem('bharat_audio') || '[]');
      audioHistory.unshift({
        id: 'audio-' + Date.now().toString(),
        type: 'audio',
        content: { brandName, text: currentScript, audioBase64: audioData, language, voice, mood, region },
        created_at: new Date().toISOString()
      });
      localStorage.setItem('bharat_audio', JSON.stringify(audioHistory.slice(0, 50)));
    }
    setAudioLoading(false);
  };

  const handleCheckCulture = async () => {
    if (!currentScript) return;
    setCheckingCulture(true);
    const report = await checkCulturalSensitivity(currentScript, region, language);
    setCulturalReport(report);
    setCheckingCulture(false);
  };

  const downloadScript = () => {
    if (!currentScript) return;
    const element = document.createElement("a");
    const file = new Blob([currentScript], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${brandName.replace(/\s+/g, '_')}_variation_${activeVariationIndex + 1}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleVariationChange = (index: number) => {
    setActiveVariationIndex(index);
    setAudioUrl(null);
    setCulturalReport(null);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8 animate-in fade-in duration-700">
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm border dark:border-slate-800">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-8 bg-brand-primary rounded-full" />
            <h2 className="text-2xl font-bold tracking-tight">Script Engine</h2>
          </div>

          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Brand Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Bharat Brew"
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-primary outline-none transition-all dark:text-white"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Creative Mood</label>
                <div className="relative">
                  <Smile className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <select 
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-primary outline-none transition-all dark:text-white"
                    value={mood}
                    onChange={(e) => setMood(e.target.value as Mood)}
                  >
                    {Object.values(Mood).map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Target Region</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <select 
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-primary outline-none transition-all dark:text-white"
                  value={region}
                  onChange={(e) => setRegion(e.target.value as Region)}
                >
                  {Object.values(Region).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Product Context</label>
              <textarea 
                placeholder="What are we selling? What's the core message?"
                rows={3}
                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-primary outline-none transition-all dark:text-white"
                value={productDesc}
                onChange={(e) => setProductDesc(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Voice Profile</label>
                <select 
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-primary outline-none transition-all dark:text-white"
                  value={voice}
                  onChange={(e) => setVoice(e.target.value)}
                >
                  <option value="Kore">Female (Kore)</option>
                  <option value="Puck">Male (Puck)</option>
                  <option value="Charon">Deep Male (Charon)</option>
                  <option value="Zephyr">Neutral (Zephyr)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Language</label>
                <select 
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-primary outline-none transition-all dark:text-white"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                >
                  {Object.values(Language).map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={loading || !brandName || !productDesc}
              className="w-full bg-brand-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-600 disabled:opacity-50 transition-all shadow-lg active:scale-[0.98]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Sparkles size={18} /> Generate Variations</>
              )}
            </button>
          </div>
        </div>

        {currentScript && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border dark:border-slate-800">
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                   <ShieldCheck size={20} className="text-brand-primary" />
                   <h3 className="font-bold text-sm">Cultural Safety Check ({region})</h3>
                </div>
                {!culturalReport && (
                  <button onClick={handleCheckCulture} disabled={checkingCulture} className="text-[10px] font-bold text-brand-primary uppercase tracking-widest hover:underline">
                    {checkingCulture ? "Analyzing..." : "Analyze Nuance"}
                  </button>
                )}
             </div>
             
             {culturalReport ? (
               <div className="space-y-3 animate-in fade-in">
                  <div className="flex items-center gap-3">
                     <div className={`h-2 flex-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden`}>
                        <div className={`h-full ${culturalReport.score > 80 ? 'bg-green-500' : 'bg-yellow-500'} transition-all`} style={{width: `${culturalReport.score}%`}} />
                     </div>
                     <span className="text-xs font-bold">{culturalReport.score}/100</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed italic">"{culturalReport.feedback}"</p>
               </div>
             ) : (
               <p className="text-xs text-slate-400">Validate script effectiveness for the {region} market using AIVISION intelligence.</p>
             )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-6">
        {variations.length > 0 ? (
          <div className="bg-slate-900 text-slate-100 p-8 rounded-[2.5rem] shadow-2xl flex-1 flex flex-col border border-slate-800 animate-in slide-in-from-right-4 duration-500">
            <div className="flex items-center justify-between mb-8">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">{mood} Narrative</span>
                <div className="flex items-center gap-2">
                  <Layers size={14} className="text-brand-primary" />
                  <span className="text-xs font-bold text-slate-400">Variation {activeVariationIndex + 1} of {variations.length}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => { navigator.clipboard.writeText(currentScript || ''); setCopied(true); setTimeout(() => setCopied(false), 2000); }} 
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                  title="Copy Variation"
                >
                  {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16}/>}
                </button>
                <button 
                  onClick={downloadScript} 
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                  title="Download Variation"
                >
                  <Download size={16}/>
                </button>
              </div>
            </div>

            <div className="flex gap-2 mb-6 p-1 bg-slate-800/50 rounded-xl">
              {variations.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleVariationChange(idx)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeVariationIndex === idx ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  V{idx + 1}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar text-slate-300 leading-relaxed text-lg italic whitespace-pre-wrap font-medium">
              {currentScript}
            </div>

            <div className="mt-8 pt-8 border-t border-slate-800">
               {audioUrl ? (
                 <div className="space-y-4 animate-in fade-in">
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                         <Headphones size={14} className="text-brand-primary" /> Audio Synced & Archived
                       </span>
                       <button onClick={() => setAudioUrl(null)} className="text-[10px] text-slate-500 hover:text-white transition-colors flex items-center gap-1">
                          <RotateCcw size={10} /> Regenerate
                       </button>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                      <audio ref={audioRef} src={audioUrl} controls className="w-full h-8 opacity-90 brightness-110" />
                    </div>
                 </div>
               ) : (
                 <button onClick={handleGenerateAudio} disabled={audioLoading} className="w-full py-4 bg-slate-800 hover:bg-slate-700 rounded-xl flex items-center justify-center gap-3 transition-all text-sm font-bold text-slate-300 border border-slate-700 shadow-inner group">
                   {audioLoading ? <Loader2 className="animate-spin" size={18} /> : <><Volume2 size={18} className="text-brand-primary group-hover:scale-110 transition-transform" /> Generate {mood} Voiceover</>}
                 </button>
               )}
            </div>
          </div>
        ) : (
          <div className="flex-1 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem] flex flex-col items-center justify-center p-12 text-center bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm">
            <Zap size={48} className="opacity-10 text-brand-primary mb-6 animate-pulse" />
            <h3 className="font-bold text-slate-600 dark:text-slate-300 mb-2 text-xl">Core Processor Idle</h3>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">Choose your mood and region to generate multiple high-end narrative variations and matching professional audio.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScriptGenerator;
