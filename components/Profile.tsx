
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { User, Mail, Camera, Save, LogOut, Building, ShieldCheck, Loader2 } from 'lucide-react';

const Profile: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [avatar, setAvatar] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getProfile();
  }, []);

  async function getProfile() {
    try {
      // Cast to any to bypass potential Supabase version-specific type mismatches for getUser
      const { data: { user } } = await (supabase.auth as any).getUser();
      if (user) {
        setProfile(user);
        setFullName(user.user_metadata?.full_name || '');
        setCompany(user.user_metadata?.company_name || '');
        setAvatar(user.user_metadata?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.id);
      }
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile() {
    setSaving(true);
    try {
      // Cast to any to bypass potential Supabase version-specific type mismatches for updateUser
      const { error } = await (supabase.auth as any).updateUser({
        data: { 
          full_name: fullName,
          company_name: company,
          avatar_url: avatar
        }
      });
      if (error) throw error;
      alert('Profile updated successfully!');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <Loader2 className="animate-spin text-brand-primary" size={40} />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-bold tracking-tight">Identity Center</h2>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-500/10 px-6 py-3 rounded-xl transition-all"
          >
            <LogOut size={20} /> Logout Session
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-12">
          <div className="flex flex-col items-center gap-6">
            <div className="relative group">
              <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-brand-primary/20 shadow-xl">
                <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <label className="absolute bottom-2 right-2 bg-brand-primary text-white p-3 rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform">
                <Camera size={20} />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>
            <div className="text-center">
              <p className="font-bold text-xl">{fullName || 'Professional User'}</p>
              <p className="text-slate-500 text-sm flex items-center gap-1 justify-center mt-1">
                <ShieldCheck size={14} className="text-green-500" /> Neural Studio verified
              </p>
            </div>
          </div>

          <div className="flex-1 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Display Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Organization</label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Email (Immutable)</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="email"
                  disabled
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-100 dark:bg-slate-800/50 text-slate-500 border-none cursor-not-allowed"
                  value={profile?.email || ''}
                />
              </div>
            </div>

            <button
              onClick={updateProfile}
              disabled={saving}
              className="w-full bg-brand-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-brand-primary/20 hover:bg-orange-600 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Commit Profile Changes</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
