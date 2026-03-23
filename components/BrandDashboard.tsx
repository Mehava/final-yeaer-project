
import React, { useEffect, useState } from 'react';
import { TrendingUp, Users, Zap, ArrowRight, Globe, Shield, Search, Loader2, ExternalLink, Sparkles, Key } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchMarketTrends, MarketInsight } from '../services/marketService';
import { Region } from '../types';

/* 
 * Declaring the AIStudio interface and augmenting the Window object.
 * This ensures compatibility with the platform's predefined types while 
 * satisfying the project's functional requirements.
 */
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    // Restored readonly modifier to match the environment's existing definition of aistudio on the Window object.
    // This fix addresses the "All declarations of 'aistudio' must have identical modifiers" error.
    readonly aistudio: AIStudio;
  }
}

const BrandDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    scripts: 0,
    visuals: 0,
    projects: 1,
  });

  const [insight, setInsight] = useState<MarketInsight | null>(null);
  const [loadingTrends, setLoadingTrends] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<Region>(Region.PAN_INDIA);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const scripts = JSON.parse(localStorage.getItem('bharat_scripts') || '[]');
    const visuals = JSON.parse(localStorage.getItem('bharat_visuals') || '[]');
    setStats({
      scripts: scripts.length,
      visuals: visuals.length,
      projects: scripts.length + visuals.length
    });
  }, []);

  const handleGetTrends = async () => {
    setLoadingTrends(true);
    setError(null);
    try {
      // Mandatory API key check for gemini-3-pro-image-preview models
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
        // Proceeding after openSelectKey as per instructions to handle race conditions
      }

      const data = await fetchMarketTrends(selectedRegion);
      setInsight(data);
    } catch (err: any) {
      console.error("Scan Failed:", err);
      if (err.message?.includes("entity was not found")) {
        setError("API Key Error: Please reset and select a valid paid project key.");
        await window.aistudio.openSelectKey();
      } else {
        setError("Neural Scan Interrupted. Please check your connection or API key.");
      }
    } finally {
      setLoadingTrends(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-black rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl border border-white/5">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-brand-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-brand-secondary/10 rounded-full blur-[80px]" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-extrabold uppercase tracking-widest mb-8 text-brand-primary border border-white/5">
              <Shield size={14} /> Neural Studio Online
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tighter">
              Intelligence of <span className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">Creative Vision</span>.
            </h1>
            <p className="text-slate-400 text-xl mb-10 leading-relaxed font-medium">
              Unified generation for Indian regional branding. Script narratives and visual synthesis for a premium marketplace.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
              <Link to="/scripts" className="bg-brand-primary hover:bg-orange-600 text-white px-10 py-5 rounded-2xl font-extrabold flex items-center justify-center gap-3 transition-all shadow-2xl shadow-brand-primary/40 active:scale-95">
                Script Engine <ArrowRight size={20} />
              </Link>
              <Link to="/visuals" className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-10 py-5 rounded-2xl font-extrabold flex items-center justify-center transition-all backdrop-blur-md">
                Visual Studio
              </Link>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
             <StatCard label="Narratives" value={stats.scripts} color="orange" />
             <StatCard label="Synthesis" value={stats.visuals} color="red" />
             <StatCard label="Regions" value={6} color="green" />
             <StatCard label="Live Node" value="Active" color="blue" />
          </div>
        </div>
      </div>

      {/* Unique Feature: Live Market Trends */}
      <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h3 className="text-2xl font-extrabold tracking-tight flex items-center gap-3">
              <TrendingUp size={28} className="text-brand-primary" />
              Regional Intelligence
            </h3>
            <p className="text-slate-500 text-sm font-medium">Grounded market analysis using Gemini Search tools.</p>
          </div>
          <div className="flex items-center gap-3">
            <select 
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value as Region)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-none outline-none text-sm font-bold cursor-pointer"
            >
              {Object.values(Region).map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <button 
              onClick={handleGetTrends}
              disabled={loadingTrends}
              className="px-6 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold text-sm flex items-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-md active:scale-95"
            >
              {loadingTrends ? <Loader2 size={16} className="animate-spin" /> : <><Search size={16} /> Neural Scan</>}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-between animate-in shake duration-300">
            <p className="text-red-500 text-xs font-bold">{error}</p>
            <button onClick={() => window.aistudio.openSelectKey()} className="text-[10px] font-black uppercase text-red-500 hover:underline flex items-center gap-1">
              <Key size={12} /> Select Key
            </button>
          </div>
        )}

        {insight ? (
          <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
            <div className="p-6 bg-brand-primary/5 rounded-3xl border border-brand-primary/10">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={18} className="text-brand-primary" />
                <h4 className="font-black text-brand-primary uppercase text-[10px] tracking-widest">Grounding: {selectedRegion} Intelligence</h4>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm whitespace-pre-wrap font-medium">
                {insight.trend}
              </p>
            </div>
            {insight.sources.length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified Sources</p>
                <div className="flex flex-wrap gap-2">
                  {insight.sources.slice(0, 4).map((source, i) => (
                    <a 
                      key={i} 
                      href={source.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-black hover:bg-brand-primary hover:text-white transition-all border border-transparent hover:border-brand-primary shadow-sm"
                    >
                      <ExternalLink size={12} /> {source.title.length > 30 ? source.title.substring(0, 30) + '...' : source.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-16 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl group">
            <Globe size={48} className="mx-auto text-slate-200 dark:text-slate-800 mb-6 group-hover:text-brand-primary transition-colors duration-500" />
            <h4 className="text-slate-400 font-bold mb-1">Awaiting Regional Data</h4>
            <p className="text-slate-400 text-xs font-medium max-w-xs mx-auto">Select an Indian market region and run a Neural Scan to grounded your creative work in real-time trends.</p>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <FeatureCard 
          icon={<Globe className="text-brand-primary" />}
          title="Regional Resonance"
          desc="Tailored for Pan-Indian markets with optimized dialects and deep cultural sensitivity checks."
        />
        <FeatureCard 
          icon={<Users className="text-brand-secondary" />}
          title="Unified Synthesis"
          desc="Generate scripts, high-fidelity images, and professional audio narrations in a single dashboard."
        />
        <FeatureCard 
          icon={<Zap className="text-yellow-400" />}
          title="Neural Reliability"
          desc="Multimodal engine with automatic failover ensures 99.9% uptime for critical creative workflows."
        />
      </div>
    </div>
  );
};

const StatCard = ({ label, value, color }: { label: string, value: any, color: string }) => (
  <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-md hover:bg-white/10 transition-all group flex flex-col items-center lg:items-start min-w-[140px]">
    <div className="text-3xl font-black mb-1 group-hover:scale-110 transition-transform">{value}</div>
    <div className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{label}</div>
  </div>
);

const FeatureCard = ({ icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border dark:border-slate-800 hover:shadow-2xl transition-all group border-b-4 border-b-transparent hover:border-b-brand-primary">
    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform shadow-sm">
      {React.cloneElement(icon, { size: 28 })}
    </div>
    <h4 className="font-black text-xl mb-3 tracking-tight">{title}</h4>
    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{desc}</p>
  </div>
);

export default BrandDashboard;
