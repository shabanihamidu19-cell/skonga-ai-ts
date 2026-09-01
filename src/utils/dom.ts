/** Small DOM helpers */

export const $ = <T extends HTMLElement = HTMLElement>(id: string): T | null =>
  document.getElementById(id) as T | null;

export const $$ = <T extends HTMLElement = HTMLElement>(sel: string): T[] =>
  Array.from(document.querySelectorAll(sel)) as T[];

export function on<K extends keyof HTMLElementEventMap>(
  el: HTMLElement | null | Document | Window,
  type: K,
  handler: (ev: HTMLElementEventMap[K]) => void,
  opts?: boolean | AddEventListenerOptions
): void {
  el?.addEventListener(type, handler as EventListener, opts);
}

export function fmtTime(d?: Date | number): string {
  const date = d instanceof Date ? d : new Date(d ?? Date.now());
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#39;');
}

export function fmtFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
