
import React, { useState } from 'react';
import { generateVisual } from '../services/geminiService';
import { saveProjectData } from '../services/supabaseClient';
import { Mood } from '../types';
import { Sparkles, Download, RefreshCw, Palette, Share2, Smile, Loader2 } from 'lucide-react';

const VisualGenerator: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [mood, setMood] = useState<Mood>(Mood.LUXURY);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    const result = await generateVisual(prompt, mood);
    setImageUrl(result);
    setLoading(false);

    if (result) {
      await saveProjectData('visual', { prompt, mood, imageUrl: result });
      
      const history = JSON.parse(localStorage.getItem('bharat_visuals') || '[]');
      history.unshift({
        id: Date.now().toString(),
        prompt,
        mood,
        url: result,
        createdAt: Date.now()
      });
      localStorage.setItem('bharat_visuals', JSON.stringify(history.slice(0, 20)));
    }
  };

  const downloadImage = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `aivision_${mood.toLowerCase()}_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm border dark:border-slate-800">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-brand-secondary rounded-full" />
            <h2 className="text-2xl font-bold tracking-tight">Visual Studio</h2>
          </div>
          <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center gap-2">
             <Palette size={12} className="text-brand-secondary" />
             <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Atmospheric Synthesis</span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid md:grid-cols-2 gap-4">
             <input 
              type="text"
              placeholder="A futuristic luxury car on the streets of Bangalore..."
              className="px-5 py-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-secondary outline-none transition-all dark:text-white text-sm"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
            <div className="relative">
              <Smile className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <select 
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-secondary outline-none transition-all dark:text-white text-sm"
                value={mood}
                onChange={(e) => setMood(e.target.value as Mood)}
              >
                {Object.values(Mood).map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <button 
            onClick={handleGenerate}
            disabled={loading || !prompt}
            className="bg-brand-secondary text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-600 disabled:opacity-50 transition-all shadow-lg active:scale-95"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <><Sparkles size={20} /> Generate {mood} Visual</>}
          </button>
        </div>
      </div>

      <div className="relative group">
        {imageUrl ? (
          <div className="space-y-6 animate-in zoom-in-95 duration-500">
            <div className="relative overflow-hidden rounded-[2.5rem] border dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-900 p-2">
              <img src={imageUrl} alt="Generated Visual" className="w-full h-auto rounded-[2rem] object-cover aspect-video shadow-inner" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4 backdrop-blur-sm">
                 <button onClick={downloadImage} className="bg-white text-slate-900 p-4 rounded-full hover:scale-110 transition-transform shadow-2xl" title="Download Image">
                   <Download size={32} />
                 </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
               <button onClick={downloadImage} className="flex-1 bg-brand-secondary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:opacity-90 shadow-xl transition-all">
                 <Download size={20} /> Download Final {mood} Asset
               </button>
            </div>
          </div>
        ) : (
          <div className="aspect-video border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-center bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm">
            <Palette size={48} className="opacity-10 text-brand-secondary mb-6" />
            <h3 className="font-bold text-slate-600 dark:text-slate-300 mb-2 text-xl">Awaiting Masterpiece</h3>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">Choose a mood category and describe your vision to unleash the AIVISION image synthesis engine.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisualGenerator;
