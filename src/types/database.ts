export interface Relationship {
  id: number;
  start_date: string;
  created_at: string;
}

export interface Anniversary {
  id: number;
  title: string;
  date: string;
  type: 'normal' | 'lunar';
  is_recurring: boolean;
  created_at: string;
}

export interface Diary {
  id: number;
  content: string;
  mood: string | null;
  author: string;
  created_at: string;
}

export interface Mission {
  id: number;
  title: string;
  description: string | null;
  frequency: 'daily' | 'weekly' | 'custom';
  created_by: string;
  is_active: boolean;
  created_at: string;
}

export interface MissionLog {
  id: number;
  mission_id: number;
  completed_by: string;
  completed_at: string;
}

export interface Photo {
  id: number;
  url: string;
  thumbnail_url: string | null;
  caption: string | null;
  uploaded_by: string;
  taken_at: string | null;
  is_backed_up: boolean;
  created_at: string;
}

export type Author = '我' | 'TA';
