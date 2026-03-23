
export enum Language {
  ENGLISH = 'English',
  HINDI = 'Hindi',
  MARATHI = 'Marathi',
  TAMIL = 'Tamil',
  TELUGU = 'Telugu',
  BENGALI = 'Bengali',
  KANNADA = 'Kannada',
  MALAYALAM = 'Malayalam',
  GUJARATI = 'Gujarati',
  PUNJABI = 'Punjabi'
}

export enum Mood {
  FESTIVE = 'Festive Mood',
  NOSTALGIC = 'Nostalgic',
  ENERGETIC = 'Energetic',
  LUXURY = 'Luxury',
  EMOTIONAL = 'Emotional',
  HUMOROUS = 'Humorous',
  PROFESSIONAL = 'Professional'
}

export enum Region {
  PAN_INDIA = 'Pan-India',
  NORTH = 'North India',
  SOUTH = 'South India',
  EAST = 'East India',
  WEST = 'West India',
  CENTRAL = 'Central India'
}

export interface ProjectEntry {
  id: string;
  type: 'script' | 'visual' | 'audio' | 'video';
  title?: string;
  content: any;
  url?: string;
  language?: Language;
  mood?: Mood;
  region?: Region;
  createdAt: number;
  prompt?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  company_name?: string;
}
