/**
 * SKONGA AI — main entry (TypeScript)
 * Progressive migration: core modules first, then feature parity.
 */

import './styles/main.css';
import './auth';
import { initTheme } from './ui/theme';
import { showToast } from './ui/toast';
import { bindPayGlobals, updateProUI, isProActive } from './pay';
import { loadSessions, createSession, getSessions, setActiveId, getActiveId } from './chat/sessions';
import { $, on, fmtTime } from './utils/dom';
import { APP_VERSION } from './config';

console.log(`[SKONGA] v${APP_VERSION} TypeScript build`);

// ── Splash ──────────────────────────────────────────────
function dismissSplash(): void {
  const splash = $('splashScreen');
  if (!splash) return;
  splash.classList.add('fade-out');
  setTimeout(() => splash.remove(), 600);
}

// ── Offline banner ──────────────────────────────────────
function updateOfflineBanner(): void {
  const banner = $('offlineBanner');
  if (!banner) return;
  banner.classList.toggle('show', !navigator.onLine);
}

// ── Sidebar ─────────────────────────────────────────────
function openSidebar(): void {
  $('sidebar')?.classList.add('open');
  $('overlay')?.classList.add('show');
}
function closeSidebar(): void {
  $('sidebar')?.classList.remove('open');
  $('overlay')?.classList.remove('show');
}

function renderChatHistory(): void {
  const list = $('chatHistList');
  if (!list) return;
  const sessions = getSessions();
  list.innerHTML = sessions
    .map(
      (s) => `
    <div class="hist-item ${s.id === getActiveId() ? 'active-chat' : ''}" data-id="${s.id}">
      <div class="hist-title">${s.title || 'Chat'}</div>
      <div class="hist-preview">${s.preview || ''}</div>
    </div>`
    )
    .join('');

  list.querySelectorAll('.hist-item').forEach((el) => {
    el.addEventListener('click', () => {
      const id = (el as HTMLElement).dataset.id;
      if (id) {
        setActiveId(id);
        renderChatHistory();
        // TODO: load messages into chat-area
        closeSidebar();
      }
    });
  });
}

function newChat(): void {
  createSession();
  const area = $('chat-area');
  if (area) {
    const welcome = area.querySelector('.welcome');
    area.innerHTML = '';
    if (welcome) area.appendChild(welcome);
  }
  renderChatHistory();
  closeSidebar();
  showToast('New chat started');
}

// ── Settings / Profile stubs ────────────────────────────
function openSettings(): void {
  $('settingsSheet')?.classList.remove('hidden');
}
function closeSettings(): void {
  $('settingsSheet')?.classList.add('hidden');
}
function openProfile(): void {
  $('profileSheet')?.classList.remove('hidden');
}
function closeProfile(): void {
  $('profileSheet')?.classList.add('hidden');
}

// ── Chat send (minimal for now) ─────────────────────────
async function sendMessage(): Promise<void> {
  const input = $('msgInput') as HTMLTextAreaElement | null;
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;

  if (!isProActive()) {
    // Soft limit placeholder — real quota logic comes later
  }

  input.value = '';
  input.style.height = 'auto';

  const area = $('chat-area');
  if (area) {
    const welcome = area.querySelector('.welcome');
    if (welcome) welcome.remove();

    const bubble = document.createElement('div');
    bubble.className = 'bubble user';
    bubble.innerHTML = `<div class="md-content">${text}</div><div class="bubble-time">${fmtTime()}</div>`;
    area.appendChild(bubble);
    area.scrollTop = area.scrollHeight;
  }

  showTyping();

  try {
    await new Promise((r) => setTimeout(r, 800));
    hideTyping();
    addBotMessage(
      "I'm SKONGA AI (TypeScript build). Full chat backend + streaming will be re-wired next. Your message was received: **" +
        text.slice(0, 60) +
        (text.length > 60 ? '…' : '') +
        '**'
    );
  } catch {
    hideTyping();
    showToast('Failed to send. Check connection.', true);
  }
}

function showTyping(): void {
  const area = $('chat-area');
  if (!area || $('typingBubble')) return;
  const el = document.createElement('div');
  el.id = 'typingBubble';
  el.className = 'bubble bot typing';
  el.innerHTML = `<div class="typing-dots"><span></span><span></span><span></span></div>`;
  area.appendChild(el);
  area.scrollTop = area.scrollHeight;
}

function hideTyping(): void {
  $('typingBubble')?.remove();
}

function addBotMessage(text: string): void {
  const area = $('chat-area');
  if (!area) return;
  const bubble = document.createElement('div');
  bubble.className = 'bubble bot';
  bubble.innerHTML = `<div class="md-content">${text}</div><div class="bubble-time">${fmtTime()}</div>`;
  area.appendChild(bubble);
  area.scrollTop = area.scrollHeight;
}

// ── Global exposure for remaining HTML onclick handlers ─
function bindGlobals(): void {
  const w = window as any;
  w.newChat = newChat;
  w.openSidebar = openSidebar;
  w.closeSidebar = closeSidebar;
  w.openSettings = openSettings;
  w.closeSettings = closeSettings;
  w.openProfile = openProfile;
  w.closeProfile = closeProfile;
  w.sendMessage = sendMessage;
  bindPayGlobals();
}

// ── Boot ────────────────────────────────────────────────
function boot(): void {
  initTheme();
  loadSessions();
  if (getSessions().length === 0) createSession();
  renderChatHistory();
  updateProUI();
  updateOfflineBanner();
  bindGlobals();

  on($('menuBtn'), 'click', openSidebar);
  on($('sidebarClose'), 'click', closeSidebar);
  on($('overlay'), 'click', closeSidebar);
  on($('sendBtn'), 'click', () => sendMessage());

  const input = $('msgInput') as HTMLTextAreaElement | null;
  if (input) {
    on(input, 'keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
    on(input, 'input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 140) + 'px';
    });
  }

  window.addEventListener('offline', () => {
    updateOfflineBanner();
    showToast('You are offline — saved chats still available', true);
  });
  window.addEventListener('online', () => {
    updateOfflineBanner();
    showToast('Back online ✓');
  });

  setTimeout(dismissSplash, 1400);

  const name = localStorage.getItem('skonga_preferred_name');
  const greet = $('welcomeGreeting');
  if (greet) {
    greet.textContent = name
      ? `Habari ${name}! What can I help you learn today?`
      : 'Habari! What can I help you learn today?';
  }

  console.log('[SKONGA] boot complete');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
