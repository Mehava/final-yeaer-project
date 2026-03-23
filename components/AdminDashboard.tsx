
import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { 
  ShieldAlert, 
  Users, 
  Search, 
  Loader2,
  Mail,
  Database,
  Copy,
  Check,
  Terminal,
  FileJson,
  Eye,
  EyeOff,
  Trash2,
  UserX,
  Clock
} from 'lucide-react';

interface AdminUser {
  id: string;
  email?: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
  company_name?: string;
  isLocal?: boolean;
}

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [projectsCount, setProjectsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'setup'>('users');
  const [copied, setCopied] = useState(false);

  const sqlCode = `-- 1. RESET AND INITIALIZE DATABASE (ADMIN OVERRIDE)
-- Use these commands to ensure you can see ALL data without security restrictions.

-- Drop existing policies if they block data visibility
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
drop policy if exists "Users can view their own projects" on public.projects;

-- ENABLE GLOBAL READ ACCESS (NO SECURITY)
-- This allows you to see all users and projects in the dashboard.
alter table public.profiles disable row level security;
alter table public.projects disable row level security;

-- 2. CREATE TABLES (IF NOT ALREADY CREATED)
create table if not exists public.profiles (
  id uuid primary key,
  full_name text,
  avatar_url text,
  company_name text,
  updated_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid,
  type text,
  content jsonb,
  created_at timestamp with time zone default now()
);`;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch profiles from Supabase
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      // 2. Fetch local guest accounts for management
      const localAccounts = JSON.parse(localStorage.getItem('aivision_local_accounts') || '{}');
      const localAccountMetadata = JSON.parse(localStorage.getItem('aivision_local_metadata') || '{}');
      
      const guestUsers: AdminUser[] = Object.keys(localAccounts).map(username => ({
        id: `local-${username}`,
        full_name: username,
        email: 'Local Guest Account',
        created_at: localAccountMetadata[username]?.created_at || new Date().toISOString(),
        isLocal: true,
        company_name: 'Independent Creative'
      }));

      const combinedUsers = [...(profilesData || []), ...guestUsers].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setUsers(combinedUsers);

      // 3. Fetch all projects count
      const { count, error: projectsError } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true });
      
      if (!projectsError) setProjectsCount(count || 0);

    } catch (err: any) {
      console.error("Admin Fetch Error:", err);
      setError("Database sync restricted. Use SQL Setup to enable global visibility.");
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string, isLocal?: boolean) => {
    if (!confirm("CRITICAL: This will permanently remove this user and all associated cloud project data. Continue?")) return;

    try {
      if (isLocal) {
        const username = userId.replace('local-', '');
        const accounts = JSON.parse(localStorage.getItem('aivision_local_accounts') || '{}');
        const metadata = JSON.parse(localStorage.getItem('aivision_local_metadata') || '{}');
        delete accounts[username];
        delete metadata[username];
        localStorage.setItem('aivision_local_accounts', JSON.stringify(accounts));
        localStorage.setItem('aivision_local_metadata', JSON.stringify(metadata));
      } else {
        const { error } = await supabase.from('profiles').delete().eq('id', userId);
        if (error) throw error;
      }
      
      setUsers(prev => prev.filter(u => u.id !== userId));
      alert("User successfully purged from the system.");
    } catch (err) {
      alert("Purge failed. Check database permissions.");
    }
  };

  const copySql = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tighter flex items-center gap-3">
            <Database className="text-brand-primary" size={32} />
            DATABASE CENTRAL
          </h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Infrastructure Control & User Governance</p>
        </div>
        
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border dark:border-slate-800">
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-white dark:bg-slate-800 shadow-md text-brand-primary' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Manage Users
          </button>
          <button 
            onClick={() => setActiveTab('setup')}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'setup' ? 'bg-white dark:bg-slate-800 shadow-md text-brand-primary' : 'text-slate-500 hover:text-slate-700'}`}
          >
            SQL Setup
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users size={80} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Node Population</p>
          <h4 className="text-4xl font-black text-brand-primary">{users.length}</h4>
          <div className="mt-4 flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
             <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Live Sync Enabled</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <FileJson size={80} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Synthesis Records</p>
          <h4 className="text-4xl font-black text-blue-500">{projectsCount}</h4>
          <p className="mt-4 text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Total Archived Assets</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border dark:border-slate-800 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                <Terminal size={18} />
             </div>
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Auth Protocol</p>
                <p className="text-xs font-bold uppercase text-green-600">Administrative Override</p>
             </div>
          </div>
        </div>
      </div>

      {activeTab === 'users' ? (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          <div className="p-8 border-b dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="font-black text-sm uppercase tracking-[0.2em] flex items-center gap-2">
              <Eye size={18} className="text-brand-primary" /> User Governance Table
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search Identity..." 
                className="pl-10 pr-6 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-xs font-bold outline-none focus:ring-2 focus:ring-brand-primary transition-all w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/30">
                  <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Identity & Role</th>
                  <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Registration Log</th>
                  <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Org Reference</th>
                  <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Action Node</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-slate-800">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group/row">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center overflow-hidden border border-brand-primary/20 shadow-inner">
                           {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" alt="" /> : <Users size={20} className="text-brand-primary" />}
                        </div>
                        <div className="flex flex-col">
                           <div className="flex items-center gap-2">
                              <span className="font-black text-xs uppercase tracking-tight">{user.full_name || 'Legacy Subject'}</span>
                              {user.isLocal && <span className="text-[8px] bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-md font-black uppercase text-slate-500">Local</span>}
                           </div>
                           <span className="text-[10px] text-slate-400 font-bold">{user.email || 'No Email Anchor'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-[10px] font-black">
                           <Clock size={12} className="text-brand-primary" />
                           {new Date(user.created_at).toLocaleDateString()}
                        </div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase pl-5">{new Date(user.created_at).toLocaleTimeString()}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className={`text-[10px] font-black uppercase ${user.isLocal ? 'text-slate-400' : 'text-slate-500'} bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full`}>
                         {user.company_name || 'Independent Unit'}
                       </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <button 
                        onClick={() => deleteUser(user.id, user.isLocal)}
                        className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover/row:opacity-100"
                        title="Purge Identity"
                       >
                         <UserX size={18} />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {loading ? (
             <div className="p-20 flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-brand-primary mb-4" size={32} />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scanning Global Identities...</p>
             </div>
          ) : filteredUsers.length === 0 && (
            <div className="p-20 text-center flex flex-col items-center">
              <EyeOff size={48} className="text-slate-200 dark:text-slate-800 mb-4" />
              <p className="text-slate-400 font-black text-xs uppercase tracking-widest">No matching population found</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 p-10 space-y-8 animate-in slide-in-from-right-4 duration-300">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="p-3 bg-brand-primary/20 rounded-2xl text-brand-primary shadow-lg shadow-brand-primary/10">
                 <Terminal size={24} />
               </div>
               <div>
                 <h3 className="text-white font-black text-xl tracking-tighter uppercase">Infrastructure Overrides</h3>
                 <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Global control over database security layers.</p>
               </div>
             </div>
             <button 
              onClick={copySql}
              className="px-6 py-3 bg-brand-primary hover:bg-orange-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-brand-primary/20"
             >
               {copied ? <Check size={16} /> : <Copy size={16} />}
               {copied ? 'Copied' : 'Copy Script'}
             </button>
          </div>

          <div className="relative group">
            <div className="absolute top-4 right-4 text-[9px] font-black text-slate-600 uppercase tracking-widest select-none bg-black/40 px-3 py-1 rounded-full border border-white/5 backdrop-blur-md">Administrative Core</div>
            <pre className="p-8 bg-black/40 rounded-[1.5rem] border border-slate-800 text-brand-primary font-mono text-xs overflow-x-auto leading-relaxed custom-scrollbar shadow-inner">
              {sqlCode}
            </pre>
          </div>

          <div className="p-6 bg-brand-primary/5 rounded-2xl border border-brand-primary/10 flex items-start gap-4">
             <ShieldAlert className="text-brand-primary shrink-0 mt-1" size={20} />
             <div>
                <h5 className="text-brand-primary font-black text-xs uppercase tracking-widest">Identity Visibility Note</h5>
                <p className="text-slate-400 text-[10px] font-medium mt-1 leading-relaxed">
                  Executing this script disables RLS, allowing you to monitor and manage all synthesized assets and user profiles across the entire Bharat region. Use with caution.
                </p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
