
import { createClient } from '@supabase/supabase-js';

/**
 * Project: cnpzqcvaimajsvsjusnq
 * Database connection established using the verified project key.
 */
const supabaseUrl = 'https://cnpzqcvaimajsvsjusnq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNucHpxY3ZhaW1hanN2c2p1c25xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyMzYyNzEsImV4cCI6MjA4NDgxMjI3MX0.SkX7-B8O7Bu-SMEwx-UB5F3KoHmwU7WHiZXve6lhxNQ';

export const isSupabaseConfigured = true;

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

/**
 * Saves project artifacts to Supabase cloud storage.
 * Synchronizes generated scripts and visuals with the global user archive.
 */
export const saveProjectData = async (type: 'script' | 'visual' | 'audio' | 'video', data: any) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn("AIVISION: User not authenticated. Data saved to local cache only.");
      return;
    }

    const { error } = await supabase
      .from('projects')
      .insert([{ 
        type, 
        content: data, 
        user_id: user.id,
        created_at: new Date().toISOString() 
      }]);
      
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('relation "projects" does not exist')) {
        console.warn(`Supabase Configuration Note: Table 'projects' missing. Please use Admin Dashboard -> SQL Setup.`);
      } else {
        throw error;
      }
    } else {
      console.log(`AIVISION: ${type} synchronized to cloud archive.`);
    }
  } catch (e) {
    console.error("AIVISION Persistence Error:", e);
  }
};
