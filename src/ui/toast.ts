import { $ } from '../utils/dom';

let toastTimer: ReturnType<typeof setTimeout> | null = null;

export function showToast(msg: string, isError = false): void {
  let el = $('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }

  el.textContent = msg;
  el.classList.toggle('error', isError);
  el.classList.add('show');

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el?.classList.remove('show');
  }, 3200);
}
