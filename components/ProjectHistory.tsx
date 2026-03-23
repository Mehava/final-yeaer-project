
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { pcmToWav } from '../services/geminiService';
import { 
  FileText, 
  Image as ImageIcon, 
  Trash2, 
  Calendar, 
  Cloud, 
  Loader2,
  Layers,
  Sparkles,
  Volume2,
  Video as VideoIcon,
  Clapperboard,
  Monitor,
  Smartphone
} from 'lucide-react';

const ProjectHistory: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'script' | 'visual' | 'audio' | 'video'>('all');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      // 1. Fetch from Supabase cloud
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Normalize Supabase data to match local structure
      const cloudItems = (data || []).map(item => ({
        ...item,
        createdAt: new Date(item.created_at).getTime()
      }));

      // 2. Local Fallback/Aggregation
      const scripts = JSON.parse(localStorage.getItem('bharat_scripts') || '[]').map((s: any) => ({ ...s, type: 'script' }));
      const visuals = JSON.parse(localStorage.getItem('bharat_visuals') || '[]').map((v: any) => ({ ...v, type: 'visual' }));
      const audio = JSON.parse(localStorage.getItem('bharat_audio') || '[]').map((a: any) => ({ ...a, type: 'audio' }));
      const video = JSON.parse(localStorage.getItem('bharat_videos') || '[]').map((v: any) => ({ ...v, type: 'video' }));
      
      // Filter out items that already exist in cloud to avoid duplicates if possible, 
      // or just merge and sort by date for a unified view.
      const allItems = [...cloudItems, ...scripts, ...visuals, ...audio, ...video]
        .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i) // Simple dedupe by ID
        .sort((a, b) => {
          const dateA = a.createdAt || new Date(a.created_at).getTime();
          const dateB = b.createdAt || new Date(b.created_at).getTime();
          return dateB - dateA;
        });
      
      setItems(allItems);
    } catch (err) {
      console.warn("Supabase Fetch Restricted, showing local assets only.");
      const scripts = JSON.parse(localStorage.getItem('bharat_scripts') || '[]').map((s: any) => ({ ...s, type: 'script' }));
      const visuals = JSON.parse(localStorage.getItem('bharat_visuals') || '[]').map((v: any) => ({ ...v, type: 'visual' }));
      const audio = JSON.parse(localStorage.getItem('bharat_audio') || '[]').map((a: any) => ({ ...a, type: 'audio' }));
      const video = JSON.parse(localStorage.getItem('bharat_videos') || '[]').map((v: any) => ({ ...v, type: 'video' }));
      
      const allItems = [...scripts, ...visuals, ...audio, ...video].sort((a, b) => {
        const dateA = a.createdAt || new Date(a.created_at).getTime();
        const dateB = b.createdAt || new Date(b.created_at).getTime();
        return dateB - dateA;
      });
      setItems(allItems);
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id: string, type: string) => {
    if (!confirm("Are you sure you want to delete this asset from the archive?")) return;

    try {
      await supabase.from('projects').delete().eq('id', id);
      
      // Also delete from local storage
      const storageKeys: Record<string, string> = {
        'script': 'bharat_scripts',
        'visual': 'bharat_visuals',
        'audio': 'bharat_audio',
        'video': 'bharat_videos'
      };
      const key = storageKeys[type];
      if (key) {
        const history = JSON.parse(localStorage.getItem(key) || '[]');
        const updated = history.filter((h: any) => h.id !== id);
        localStorage.setItem(key, JSON.stringify(updated));
      }
      
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (e) {
      setItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const filteredItems = items.filter(item => filter === 'all' || item.type === filter);

  const renderAudioPlayer = (audioBase64: string) => {
    try {
      const url = pcmToWav(audioBase64);
      return (
        <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center gap-3">
          <audio src={url} controls className="w-full h-8 brightness-90 opacity-80" />
        </div>
      );
    } catch (e) {
      return <div className="text-[10px] text-red-400 mt-2">Audio data corrupted</div>;
    }
  };

  if (loading) return (
    <div className="h-96 flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-brand-primary" size={40} />
      <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Accessing Neural Archive...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tighter flex items-center gap-3">
            <Cloud className="text-brand-primary" size={32} />
            Asset Library
          </h2>
          <p className="text-slate-500 text-sm font-medium mt-1">Unified cloud storage for your regional creative variations.</p>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 md:pb-0">
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border dark:border-slate-800">
            {(['all', 'script', 'visual', 'video', 'audio'] as const).map(type => (
              <button 
                key={type}
                onClick={() => setFilter(type)} 
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === type ? 'bg-white dark:bg-slate-800 shadow-sm text-brand-primary' : 'text-slate-500'}`}
              >
                {type === 'all' ? 'Everything' : type === 'video' ? 'Cinema' : type + 's'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div key={item.id} className="group bg-white dark:bg-slate-900 rounded-[2rem] border dark:border-slate-800 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all overflow-hidden relative flex flex-col">
            
            {(item.type === 'visual' || item.type === 'video') && (
              <div className="aspect-video relative overflow-hidden bg-slate-200 dark:bg-slate-800">
                {item.type === 'video' ? (
                  <video 
                    src={item.content?.videoUrl || item.url} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    muted 
                    onMouseOver={e => e.currentTarget.play()} 
                    onMouseOut={e => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }} 
                  />
                ) : (
                  <img src={item.content?.imageUrl || item.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                   <div className="flex items-center gap-2 text-white/70 text-[10px] font-bold uppercase tracking-widest">
                      {item.type === 'video' ? <Clapperboard size={14} /> : <ImageIcon size={14} />} 
                      {item.type === 'video' ? 'Cinematic Asset' : 'Synthetic Asset'}
                   </div>
                </div>
                {item.type === 'video' && (
                  <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md p-1.5 rounded-lg border border-white/10">
                    {item.content?.aspectRatio === '16:9' ? <Monitor size={12} className="text-white" /> : <Smartphone size={12} className="text-white" />}
                  </div>
                )}
              </div>
            )}

            {item.type === 'audio' && (
              <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-950 flex flex-col items-center justify-center text-white p-6">
                <div className="w-16 h-16 rounded-full bg-brand-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                   <Volume2 size={32} className="text-brand-primary animate-pulse" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Voiceover Synthesis</span>
                <div className="absolute inset-x-0 bottom-0 h-1 bg-brand-primary/30" />
              </div>
            )}

            {item.type === 'script' && (
              <div className="aspect-video relative overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 border-b dark:border-slate-800">
                <FileText size={48} className="text-brand-primary/10 group-hover:scale-110 transition-transform" />
                <div className="mt-4 flex gap-1">
                  {[1, 2, 3].map(i => <div key={i} className="w-6 h-1 bg-brand-primary/20 rounded-full" />)}
                </div>
              </div>
            )}

            <div className="p-8 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                  item.type === 'script' ? 'bg-orange-500/10 text-orange-500' : 
                  item.type === 'audio' ? 'bg-purple-500/10 text-purple-500' :
                  item.type === 'video' ? 'bg-brand-primary/10 text-brand-primary' :
                  'bg-blue-500/10 text-blue-500'
                }`}>
                   {item.type === 'script' ? 'Script Variation' : item.type === 'audio' ? 'Audio Narration' : item.type === 'video' ? 'Cinema Draft' : 'Visual Concept'}
                </span>
                <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                  <Calendar size={12} /> {new Date(item.createdAt || item.created_at).toLocaleDateString()}
                </span>
              </div>

              <h4 className="font-extrabold text-lg mb-3 line-clamp-1">
                {item.content?.brandName || item.content?.prompt || item.prompt || 'Project Artifact'}
              </h4>

              <div className="text-slate-500 dark:text-slate-400 text-sm line-clamp-3 mb-6 font-medium leading-relaxed italic flex-1">
                {item.type === 'script' ? (item.content?.scripts?.[0] || 'Narrative content') : 
                 item.type === 'audio' ? (item.content?.text || 'Audio narration context') :
                 item.type === 'video' ? (item.content?.prompt || item.prompt || 'Cinematic synthesis') :
                 `Atmospheric generation for ${item.content?.mood || 'Professional'} intent.`}
              </div>

              {item.type === 'audio' && item.content?.audioBase64 && renderAudioPlayer(item.content.audioBase64)}

              <div className="flex items-center justify-between pt-6 mt-auto border-t dark:border-slate-800">
                <div className="flex items-center gap-2">
                   <div className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[8px] font-black text-slate-500 uppercase tracking-widest">
                      {item.content?.language || item.content?.resolution || 'EN'}
                   </div>
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{item.content?.region || 'Global'}</span>
                </div>
                <div className="flex gap-2">
                   <button onClick={() => deleteItem(item.id, item.type)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all" title="Delete Permanent">
                      <Trash2 size={16} />
                   </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="py-32 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
           <Layers size={64} className="text-slate-200 dark:text-slate-800 mb-6" />
           <h3 className="text-xl font-bold text-slate-600 dark:text-slate-300">Archive Empty</h3>
           <p className="text-sm text-slate-400 mt-2 max-w-xs leading-relaxed">Generated scripts, visuals, cinema, and voiceovers will appear here once synthesized.</p>
           <button onClick={fetchHistory} className="mt-8 flex items-center gap-2 text-brand-primary font-bold text-sm uppercase tracking-widest hover:underline">
              <Sparkles size={16} /> Sync with Cloud
           </button>
        </div>
      )}
    </div>
  );
};

export default ProjectHistory;
