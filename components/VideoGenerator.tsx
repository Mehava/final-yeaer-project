
import React, { useState } from 'react';
import { generateVideo } from '../services/geminiService';
import { saveProjectData } from '../services/supabaseClient';
import { Video, Sparkles, Key, Loader2, Download, Monitor, Smartphone, Play, Clapperboard, Info } from 'lucide-react';

const VideoGenerator: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setError(null);
    setVideoUrl(null);
    setStatus('Initializing Veo engine...');

    try {
      // Veo models require a paid API key
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
      }

      const result = await generateVideo(prompt, aspectRatio, resolution, (msg) => setStatus(msg));
      
      if (result) {
        setVideoUrl(result);
        await saveProjectData('video', { prompt, aspectRatio, resolution, videoUrl: result });
        
        const history = JSON.parse(localStorage.getItem('bharat_videos') || '[]');
        history.unshift({
          id: Date.now().toString(),
          prompt,
          aspectRatio,
          url: result,
          createdAt: Date.now()
        });
        localStorage.setItem('bharat_videos', JSON.stringify(history.slice(0, 20)));
      }
    } catch (err: any) {
      console.error("Video Generation failed:", err);
      if (err.message?.includes("entity was not found")) {
        setError("API Key Error: Please select a valid paid project key.");
        await window.aistudio.openSelectKey();
      } else {
        setError("Synthesis failed. Ensure you have selected a paid API key and try again.");
      }
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  const downloadVideo = () => {
    if (!videoUrl) return;
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `aivision_veo_${Date.now()}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm border dark:border-slate-800">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-brand-primary rounded-full" />
            <h2 className="text-2xl font-bold tracking-tight">Cinema Studio</h2>
          </div>
          <div className="flex items-center gap-3">
             <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center gap-2">
                <Clapperboard size={12} className="text-brand-primary" />
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Veo 3.1 Synthesis</span>
             </div>
             <button 
                onClick={() => window.aistudio.openSelectKey()} 
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-400"
                title="Change API Key"
              >
                <Key size={16} />
              </button>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Cinematic Prompt</label>
            <textarea 
              placeholder="Describe the motion, lighting, and narrative... e.g. A traditional Indian wedding scene in slow motion, vibrant colors, bokeh background."
              className="w-full px-5 py-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-primary outline-none transition-all dark:text-white text-sm"
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Canvas Aspect</label>
              <div className="flex gap-2">
                <button 
                  onClick={() => setAspectRatio('16:9')}
                  className={`flex-1 py-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${aspectRatio === '16:9' ? 'border-brand-primary bg-brand-primary/5 text-brand-primary font-bold' : 'border-slate-100 dark:border-slate-800 text-slate-400 font-medium'}`}
                >
                  <Monitor size={16} /> 16:9 (Landscape)
                </button>
                <button 
                  onClick={() => setAspectRatio('9:16')}
                  className={`flex-1 py-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${aspectRatio === '9:16' ? 'border-brand-primary bg-brand-primary/5 text-brand-primary font-bold' : 'border-slate-100 dark:border-slate-800 text-slate-400 font-medium'}`}
                >
                  <Smartphone size={16} /> 9:16 (Portrait)
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Target Resolution</label>
              <div className="flex gap-2">
                <button 
                  onClick={() => setResolution('720p')}
                  className={`flex-1 py-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${resolution === '720p' ? 'border-brand-primary bg-brand-primary/5 text-brand-primary font-bold' : 'border-slate-100 dark:border-slate-800 text-slate-400 font-medium'}`}
                >
                  720p High
                </button>
                <button 
                  onClick={() => setResolution('1080p')}
                  className={`flex-1 py-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${resolution === '1080p' ? 'border-brand-primary bg-brand-primary/5 text-brand-primary font-bold' : 'border-slate-100 dark:border-slate-800 text-slate-400 font-medium'}`}
                >
                  1080p Ultra
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-500 text-xs font-bold flex items-center gap-2">
              <Info size={16} /> {error}
            </div>
          )}

          <button 
            onClick={handleGenerate}
            disabled={loading || !prompt}
            className="bg-brand-primary text-white px-8 py-5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-orange-600 disabled:opacity-50 transition-all shadow-xl shadow-brand-primary/20 active:scale-95"
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <Loader2 className="animate-spin" size={20} />
                <span>{status}</span>
              </div>
            ) : (
              <><Sparkles size={20} /> Synthesize Cinematic Motion</>
            )}
          </button>
        </div>
      </div>

      <div className="relative group">
        {videoUrl ? (
          <div className="space-y-6 animate-in zoom-in-95 duration-500">
            <div className="relative overflow-hidden rounded-[2.5rem] border dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-900 p-2">
              <video 
                src={videoUrl} 
                controls 
                autoPlay 
                loop 
                className="w-full h-auto rounded-[2rem] shadow-inner bg-black"
              />
              <div className="absolute top-8 right-8 flex gap-2">
                 <button onClick={downloadVideo} className="bg-white/90 backdrop-blur-md text-slate-900 px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform shadow-2xl flex items-center gap-2">
                   <Download size={20} /> Export MP4
                 </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="aspect-video border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-center bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm relative overflow-hidden">
             {loading && (
               <div className="absolute inset-0 bg-white/10 dark:bg-black/10 backdrop-blur-md flex flex-col items-center justify-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
                    <Clapperboard className="absolute inset-0 m-auto text-brand-primary animate-pulse" size={32} />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-black tracking-tight">{status}</h4>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Generation may take several minutes</p>
                  </div>
               </div>
             )}
            <Play size={48} className="opacity-10 text-brand-primary mb-6" />
            <h3 className="font-black text-slate-600 dark:text-slate-300 mb-2 text-xl uppercase tracking-tighter">Director's Slate Empty</h3>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed font-bold">Note: Video generation requires a paid API key and takes a few minutes to render. High-fidelity motion vectors are calculated in real-time.</p>
          </div>
        )}
      </div>
      
      <div className="p-6 bg-brand-primary/5 rounded-3xl border border-brand-primary/10 flex items-start gap-4">
         <Info className="text-brand-primary shrink-0 mt-1" size={20} />
         <div>
            <h5 className="text-brand-primary font-black text-[10px] uppercase tracking-widest mb-1">Billing Requirement</h5>
            <p className="text-slate-500 text-[10px] font-bold leading-relaxed">
              Video generation is powered by Google Veo 3.1. This feature requires a API key from a paid GCP project. You can manage your keys by clicking the key icon at the top right. 
              Documentation: <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline hover:text-brand-primary">ai.google.dev/gemini-api/docs/billing</a>
            </p>
         </div>
      </div>
    </div>
  );
};

export default VideoGenerator;
