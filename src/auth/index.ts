/**
 * SKONGA Auth — talks to auth-content-service
 * Keeps the same window._fb bridge shape so UI code stays compatible.
 */

import type { AuthUser, FbUserShape } from '../types';
import { loadJson, saveJson, removeKey } from '../utils/storage';

const AUTH_BASE = 'https://skonga-auth-content-service.onrender.com';
const LS_TOKEN = 'skonga_auth_token';
const LS_USER = 'skonga_auth_user';

const AUTH_ERRORS: Record<string, string> = {
  INVALID_EMAIL: 'Invalid email address.',
  WEAK_PASSWORD: 'Password must be at least 6 characters.',
  EMAIL_EXISTS: 'This email already has an account.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  UNAUTHORIZED: 'Session expired. Please sign in again.',
  NETWORK: 'No network connection. Check your internet.',
};

export const authErr = (code: string, fallback?: string): string =>
  AUTH_ERRORS[code] || fallback || 'An error occurred. Please try again.';

function loadStored(): { token: string | null; user: AuthUser | null } {
  const token = localStorage.getItem(LS_TOKEN);
  const user = loadJson<AuthUser | null>(LS_USER, null);
  return { token, user };
}

function saveSession(token: string | null, user: AuthUser | null): void {
  if (token) localStorage.setItem(LS_TOKEN, token);
  else removeKey(LS_TOKEN);
  if (user) saveJson(LS_USER, user);
  else removeKey(LS_USER);
}

function toFbUser(user: AuthUser | null): FbUserShape | null {
  if (!user) return null;
  return {
    uid: user.id,
    email: user.email,
    displayName: user.name || (user.email ? user.email.split('@')[0] : 'User'),
    photoURL: null,
    providerData: [{ providerId: 'password' }],
  };
}

function emitAuth(user: FbUserShape | null): void {
  window._fb.currentUser = user;
  window.dispatchEvent(new CustomEvent('fbAuthChanged', { detail: user }));
}

async function api<T = unknown>(
  path: string,
  opts: { method?: string; body?: unknown; token?: string | null } = {}
): Promise<T> {
  const { method = 'GET', body, token } = opts;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (token) headers.Authorization = 'Bearer ' + token;

  let res: Response;
  try {
    res = await fetch(AUTH_BASE + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    const err = new Error('network') as Error & { code: string };
    err.code = 'NETWORK';
    throw err;
  }

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const err = new Error((data.error as string) || 'Request failed') as Error & {
      code: string;
      status: number;
    };
    err.code = (data.code as string) || 'ERROR';
    err.status = res.status;
    throw err;
  }
  return data as T;
}

export interface AuthBridge {
  ready: boolean;
  currentUser: FbUserShape | null;
  idToken: string | null;
  authBase: string;
  err: (code: string) => string;
  signIn: (email: string, pass: string) => Promise<{ user: FbUserShape }>;
  signUp: (name: string, email: string, pass: string) => Promise<{ user: FbUserShape }>;
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

declare global {
  interface Window {
    _fb: AuthBridge;
  }
}

const stored = loadStored();

window._fb = {
  ready: true,
  currentUser: toFbUser(stored.user),
  idToken: stored.token || null,
  authBase: AUTH_BASE,
  err: (code) => authErr(code),

  async signIn(email: string, pass: string) {
    const data = await api<{ token: string; user: AuthUser }>('/api/auth/login', {
      method: 'POST',
      body: {
        email: String(email || '').trim().toLowerCase(),
        password: String(pass || ''),
      },
    });
    saveSession(data.token, data.user);
    window._fb.idToken = data.token;
    const u = toFbUser(data.user)!;
    emitAuth(u);
    return { user: u };
  },

  async signUp(name: string, email: string, pass: string) {
    const data = await api<{ token: string; user: AuthUser }>('/api/auth/signup', {
      method: 'POST',
      body: {
        name: String(name || '').trim(),
        email: String(email || '').trim().toLowerCase(),
        password: String(pass || ''),
      },
    });
    saveSession(data.token, data.user);
    window._fb.idToken = data.token;
    const u = toFbUser(data.user)!;
    emitAuth(u);
    return { user: u };
  },

  async signOut() {
    saveSession(null, null);
    window._fb.idToken = null;
    emitAuth(null);
  },

  async getIdToken() {
    return window._fb.idToken;
  },
};

export { AUTH_BASE, LS_TOKEN, LS_USER };
