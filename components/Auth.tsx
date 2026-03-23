
import React, { useState } from 'react';
import { 
  Zap, User, Lock, ArrowRight, ShieldCheck, 
  UserPlus, AlertCircle, Sparkles, Key, CheckCircle2 
} from 'lucide-react';

interface AuthProps {
  onAuth: (isAdmin: boolean) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuth }) => {
  const [activeTab, setActiveTab] = useState<'admin' | 'guest'>('guest');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Hardcoded Admin Credentials as requested
    if (username === 'mehavarshini' && password === '123') {
      setTimeout(() => {
        localStorage.setItem('aivision_role', 'admin');
        localStorage.setItem('aivision_user', 'Mehavarshini');
        onAuth(true);
      }, 800);
    } else {
      setTimeout(() => {
        setError("Invalid Admin Credentials.");
        setLoading(false);
      }, 500);
    }
  };

  const handleGuestLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    setLoading(true);
    setError(null);

    setTimeout(() => {
      try {
        // Fetch existing guest accounts from local storage
        const storedUsers = JSON.parse(localStorage.getItem('aivision_local_accounts') || '{}');
        const metadata = JSON.parse(localStorage.getItem('aivision_local_metadata') || '{}');
        
        if (storedUsers[username]) {
          // Existing user check
          if (storedUsers[username] === password) {
            localStorage.setItem('aivision_role', 'guest');
            localStorage.setItem('aivision_user', username);
            onAuth(false);
          } else {
            setError("Incorrect password for this guest account.");
            setLoading(false);
          }
        } else {
          // New guest registration
          storedUsers[username] = password;
          metadata[username] = { created_at: new Date().toISOString() };
          
          localStorage.setItem('aivision_local_accounts', JSON.stringify(storedUsers));
          localStorage.setItem('aivision_local_metadata', JSON.stringify(metadata));
          localStorage.setItem('aivision_role', 'guest');
          localStorage.setItem('aivision_user', username);
          
          setSuccess("Local account created successfully!");
          setTimeout(() => onAuth(false), 1000);
        }
      } catch (err) {
        setError("Local storage access failed.");
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 selection:bg-brand-primary/30">
      {/* Background FX */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-secondary/10 rounded-full blur-[120px] animate-pulse-slow" />
      </div>

      <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 p-1 rounded-[3.5rem] shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-slate-900/50 p-10 rounded-[3rem] border border-white/5">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="bg-brand-primary p-4 rounded-2xl shadow-lg mb-6 group hover:scale-110 transition-transform cursor-pointer">
              <Zap className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter mb-2">
              AIVISION <span className="text-brand-primary">STUDIO</span>
            </h1>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Neural Creative Gateway</p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-black/40 p-1.5 rounded-2xl mb-8 border border-white/5">
            <button 
              onClick={() => { setActiveTab('guest'); setError(null); setUsername(''); setPassword(''); }}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'guest' ? 'bg-white/10 text-white shadow-inner' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <User size={14} /> Guest Portal
            </button>
            <button 
              onClick={() => { setActiveTab('admin'); setError(null); setUsername(''); setPassword(''); }}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'admin' ? 'bg-brand-primary/20 text-brand-primary' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <ShieldCheck size={14} /> Admin Node
            </button>
          </div>

          <form onSubmit={activeTab === 'admin' ? handleAdminLogin : handleGuestLogin} className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="text"
                placeholder={activeTab === 'admin' ? "Admin Username" : "Guest Username"}
                required
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-white text-sm outline-none transition-all placeholder:text-slate-600"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="password"
                placeholder="Secure Key"
                required
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary text-white text-sm outline-none transition-all placeholder:text-slate-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[10px] font-black uppercase tracking-widest animate-in shake duration-300">
                <AlertCircle size={14} className="shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-400 text-[10px] font-black uppercase tracking-widest">
                <CheckCircle2 size={14} className="shrink-0" />
                {success}
              </div>
            )}

            <button
              disabled={loading}
              className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 mt-6 ${activeTab === 'admin' ? 'bg-brand-primary text-white shadow-brand-primary/20' : 'bg-white/10 text-white hover:bg-white/15'}`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {activeTab === 'admin' ? 'Initialize Admin' : 'Enter Neural Studio'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.2em]">
              {activeTab === 'guest' 
                ? "Guest accounts are stored locally on this device." 
                : "Protected by AIVISION Security Protocol."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
