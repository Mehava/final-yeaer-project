
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PenTool, 
  Image as ImageIcon, 
  Sparkles, 
  Menu, 
  History,
  Info,
  Sun,
  Moon,
  Zap,
  User as UserIcon,
  ShieldAlert,
  ShieldCheck,
  Ghost,
  ArrowLeft
} from 'lucide-react';
import ScriptGenerator from './components/ScriptGenerator';
import VisualGenerator from './components/VisualGenerator';
import BrandDashboard from './components/BrandDashboard';
import ProjectHistory from './components/ProjectHistory';
import Auth from './components/Auth';
import Profile from './components/Profile';
import AdminDashboard from './components/AdminDashboard';
import { supabase } from './services/supabaseClient';

const SidebarLink: React.FC<{ to: string; icon: React.ReactNode; label: string; active?: boolean }> = ({ to, icon, label, active }) => (
  <Link 
    to={to} 
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${active ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'text-slate-600 dark:text-slate-400 hover:bg-brand-primary/10 hover:text-brand-primary'}`}
  >
    <span className="group-hover:scale-110 transition-transform">{icon}</span>
    <span className="font-black text-[10px] uppercase tracking-wider">{label}</span>
  </Link>
);

const SidebarAction: React.FC<{ onClick: () => void; icon: React.ReactNode; label: string }> = ({ onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
  >
    <span className="group-hover:-translate-x-1 transition-transform">{icon}</span>
    <span className="font-black text-[10px] uppercase tracking-wider">{label}</span>
  </button>
);

const AppContent: React.FC<{ 
  isSidebarOpen: boolean; 
  setIsSidebarOpen: (o: boolean) => void;
  theme: 'light' | 'dark';
  setTheme: React.Dispatch<React.SetStateAction<'light' | 'dark'>>;
  isAdmin: boolean;
  userName: string;
  handleLogout: () => void;
}> = ({ isSidebarOpen, setIsSidebarOpen, theme, setTheme, isAdmin, userName, handleLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className={`flex h-screen overflow-hidden ${theme === 'dark' ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
        
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 transform md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full">
            <div className="p-8 flex items-center gap-3 border-b dark:border-slate-800">
              <div className="bg-brand-primary p-2 rounded-xl shadow-lg shadow-brand-primary/20">
                <Zap className="text-white w-6 h-6" />
              </div>
              <h1 className="font-black text-2xl tracking-tighter bg-gradient-to-br from-brand-primary to-brand-secondary bg-clip-text text-transparent">
                AIVISION
              </h1>
            </div>

            <nav className="flex-1 p-4 space-y-2 mt-4">
              {/* Back Button Action */}
              <SidebarAction 
                onClick={() => navigate(-1)} 
                icon={<ArrowLeft size={18} />} 
                label="Step Back" 
              />
              
              <div className="h-px bg-slate-100 dark:bg-slate-800 my-4 opacity-50" />

              <SidebarLink to="/" icon={<LayoutDashboard size={18} />} label="Overview" active={location.pathname === '/'} />
              <SidebarLink to="/scripts" icon={<PenTool size={18} />} label="Script Engine" active={location.pathname === '/scripts'} />
              <SidebarLink to="/visuals" icon={<ImageIcon size={18} />} label="Visual Studio" active={location.pathname === '/visuals'} />
              <SidebarLink to="/history" icon={<History size={18} />} label="Archive" active={location.pathname === '/history'} />
              <SidebarLink to="/profile" icon={<UserIcon size={18} />} label="Identity" active={location.pathname === '/profile'} />
              
              {isAdmin && (
                <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
                  <SidebarLink to="/admin" icon={<ShieldAlert size={18} />} label="Admin View" active={location.pathname === '/admin'} />
                </div>
              )}
            </nav>

            <div className="p-4 border-t dark:border-slate-800 flex flex-col gap-2">
               <button 
                 onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
                 className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-600 dark:text-slate-400"
               >
                 {theme === 'light' ? <Moon size={18} /> : <Sun size={18} className="text-yellow-400" />}
                 <span className="font-black text-[10px] uppercase tracking-widest">Theme Mode</span>
               </button>
               <button 
                 onClick={handleLogout}
                 className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-all text-red-500"
               >
                 <UserIcon size={18} />
                 <span className="font-black text-[10px] uppercase tracking-widest">Sign Out</span>
               </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto relative z-10 selection:bg-brand-primary/20">
          <header className="sticky top-0 z-10 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md border-b dark:border-slate-800 px-6 py-4 flex items-center justify-between">
            <button className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-4">
              <div className={`hidden sm:flex items-center gap-2 px-4 py-1.5 ${isAdmin ? 'bg-brand-primary/10 border-brand-primary/20' : 'bg-slate-500/10 border-slate-500/20'} border rounded-full`}>
                  {isAdmin ? <ShieldCheck size={12} className="text-brand-primary" /> : <Ghost size={12} className="text-slate-500" />}
                  <span className={`text-[9px] ${isAdmin ? 'text-brand-primary' : 'text-slate-500'} font-black uppercase tracking-[0.2em]`}>
                    {isAdmin ? 'System Admin' : 'Guest Portal'}
                  </span>
               </div>
               <div className="flex items-center gap-3 px-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{userName}</span>
                  <div className="w-9 h-9 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary border border-brand-primary/20 shadow-inner">
                    <UserIcon size={18} />
                  </div>
               </div>
            </div>
          </header>

          <div className="p-6 max-w-7xl mx-auto pb-20">
            <Routes>
              <Route path="/" element={<BrandDashboard />} />
              <Route path="/scripts" element={<ScriptGenerator />} />
              <Route path="/visuals" element={<VisualGenerator />} />
              <Route path="/history" element={<ProjectHistory />} />
              <Route path="/profile" element={<Profile onLogout={handleLogout} />} />
              <Route path="/admin" element={isAdmin ? <AdminDashboard /> : <Navigate to="/" />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </main>
      </div>
  );
};

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('aivision_role'));
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('aivision_role') === 'admin');
  const [userName, setUserName] = useState(localStorage.getItem('aivision_user') || 'Guest');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const handleAuth = (adminStatus: boolean) => {
    setIsAuthenticated(true);
    setIsAdmin(adminStatus);
    setUserName(localStorage.getItem('aivision_user') || 'Guest');
  };

  const handleLogout = () => {
    localStorage.removeItem('aivision_role');
    localStorage.removeItem('aivision_user');
    setIsAuthenticated(false);
    setIsAdmin(false);
    setUserName('Guest');
  };

  if (!isAuthenticated) {
    return <Auth onAuth={handleAuth} />;
  }

  return (
    <HashRouter>
      <AppContent 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen}
        theme={theme}
        setTheme={setTheme}
        isAdmin={isAdmin}
        userName={userName}
        handleLogout={handleLogout}
      />
    </HashRouter>
  );
};

export default App;
