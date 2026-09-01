/** App-wide constants */

export const API_BASE = 'https://skonga-backend-v2.onrender.com';
export const APP_VERSION = '1.5.0';

export const CHANGELOG = [
  {
    version: '1.5.0',
    date: '2026-09-01',
    notes: [
      'Migrated core logic to TypeScript + Vite',
      'Clean module structure (auth, chat, pay, ui)',
      'Same features, better maintainability',
    ],
  },
  {
    version: '1.4',
    date: '2026-08-31',
    notes: ['Pro auto-unlock + ClickPesa live', 'Direct APK from GitHub Releases'],
  },
];

export const PAY_PLANS = [
  { id: '1d', name: '1 Day', priceTzs: 620, durationDays: 1, label: 'TSh 620' },
  { id: '1w', name: '1 Week', priceTzs: 3500, durationDays: 7, label: 'TSh 3,500' },
  { id: '1m', name: '1 Month', priceTzs: 5000, durationDays: 30, label: 'TSh 5,000' },
  { id: '1y', name: '1 Year', priceTzs: 45000, durationDays: 365, label: 'TSh 45,000' },
] as const;

export const STORAGE_KEYS = {
  TOKEN: 'skonga_auth_token',
  USER: 'skonga_auth_user',
  CHAT_SESSIONS: 'skonga_chat_sessions_v1',
  OFFLINE_QUEUE: 'skonga_offline_queue_v1',
  PRO: 'skonga_pro',
  THEME: 'skonga_theme',
  PREFERRED_NAME: 'skonga_preferred_name',
  SESSION_ID: 'skonga_device_session_id',
  NOTES: 'skonga_notes_v1',
  RATIONALE_SHOWN: 'skonga_permission_rationale_shown',
} as const;

export const EXTERNAL_LEGAL = {
  terms: 'https://skonga-ai.web.app/terms.html',
  privacy: 'https://skonga-ai.web.app/privacy.html',
};
