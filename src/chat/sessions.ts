import type { ChatSession, ChatMessage } from '../types';
import { STORAGE_KEYS } from '../config';
import { loadJson, saveJson } from '../utils/storage';

const KEY = STORAGE_KEYS.CHAT_SESSIONS;

let sessions: ChatSession[] = [];
let activeId: string | null = null;

export function loadSessions(): ChatSession[] {
  sessions = loadJson<ChatSession[]>(KEY, []);
  return sessions;
}

export function persistSessions(): void {
  saveJson(KEY, sessions);
}

export function getSessions(): ChatSession[] {
  return sessions;
}

export function getActiveId(): string | null {
  return activeId;
}

export function setActiveId(id: string | null): void {
  activeId = id;
}

export function getActiveSession(): ChatSession | null {
  return sessions.find((s) => s.id === activeId) || null;
}

export function createSession(title = 'New chat'): ChatSession {
  const s: ChatSession = {
    id: 'c_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
    title,
    preview: '',
    time: Date.now(),
    messages: [],
  };
  sessions.unshift(s);
  activeId = s.id;
  persistSessions();
  return s;
}

export function deleteSession(id: string): void {
  sessions = sessions.filter((s) => s.id !== id);
  if (activeId === id) activeId = sessions[0]?.id || null;
  persistSessions();
}

export function addMessageToActive(msg: ChatMessage): void {
  let s = getActiveSession();
  if (!s) s = createSession();
  s.messages.push(msg);
  s.preview = msg.text.slice(0, 80);
  s.time = Date.now();
  if (s.title === 'New chat' && msg.role === 'user') {
    s.title = msg.text.slice(0, 40) || 'New chat';
  }
  persistSessions();
}

export function clearAllSessions(): void {
  sessions = [];
  activeId = null;
  persistSessions();
}
