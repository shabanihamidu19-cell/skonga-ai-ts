/** Core domain types for SKONGA AI */

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

export interface FbUserShape {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  providerData: { providerId: string }[];
}

export interface ChatMessage {
  role: 'user' | 'bot' | 'system';
  text: string;
  time?: string;
  sources?: Source[];
  imageSrc?: string;
  graphData?: GraphData;
  practiceQ?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  preview: string;
  time: number;
  messages: ChatMessage[];
}

export interface Source {
  title?: string;
  url?: string;
  snippet?: string;
  form?: string;
  subject?: string;
}

export interface GraphData {
  expression: string;
  type?: 'line' | 'bar' | 'scatter' | string;
  varName?: string;
  range?: [number, number];
  points?: { x: number; y: number }[];
}

export interface Note {
  id: string;
  title: string;
  body: string;
  createdAt: number;
  updatedAt: number;
  tags?: string[];
}

export interface ProState {
  active: boolean;
  plan?: string;
  until?: number; // timestamp
  phone?: string;
}

export type ThemeMode = 'dark' | 'light' | 'auto';

export interface AppSettings {
  theme: ThemeMode;
  preferredName: string;
  notificationsEnabled: boolean;
}

export interface PayPlan {
  id: string;
  name: string;
  priceTzs: number;
  durationDays: number;
  label: string;
}

export interface OfflineQueueItem {
  id: string;
  type: 'text' | 'image';
  text?: string;
  dataUrl?: string;
  name?: string;
  promptText?: string;
  createdAt: number;
}

export type AttachMode = 'camera' | 'image' | 'pdf' | 'file' | 'createImage';

export interface TrendingTopic {
  title: string;
  query?: string;
}
