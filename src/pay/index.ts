/**
 * SKONGA Pro payment flow (STK Push UI)
 * Backend integration still needed for live STK.
 */

import type { PayPlan, ProState } from '../types';
import { PAY_PLANS, STORAGE_KEYS } from '../config';
import { loadJson, saveJson } from '../utils/storage';
import { $, on } from '../utils/dom';
import { showToast } from '../ui/toast';

const PRO_KEY = STORAGE_KEYS.PRO;

let selectedPlan: PayPlan | null = null;
let payPhone = '';

export function getPro(): ProState {
  const raw = loadJson<ProState | null>(PRO_KEY, null);
  if (!raw) return { active: false };
  if (raw.until && Date.now() > raw.until) {
    saveJson(PRO_KEY, { active: false });
    return { active: false };
  }
  return raw;
}

export function setPro(state: ProState): void {
  saveJson(PRO_KEY, state);
  updateProUI();
}

export function isProActive(): boolean {
  return getPro().active === true;
}

export function updateProUI(): void {
  const pro = getPro();
  const btn = $('headerProBtn');
  if (btn) {
    btn.classList.toggle('pro-active', pro.active);
    btn.textContent = pro.active ? 'Pro ✓' : 'Pro';
  }
}

export function openSkongaPay(): void {
  const sheet = $('paySheet');
  if (!sheet) return;
  sheet.classList.remove('hidden');
  payGoPlans();
  renderPlans();
}

export function closeSkongaPay(): void {
  $('paySheet')?.classList.add('hidden');
}

function renderPlans(): void {
  const grid = $('payPlansGrid');
  if (!grid) return;
  grid.innerHTML = PAY_PLANS.map(
    (p) => `
    <button type="button" class="pay-plan" data-plan="${p.id}">
      <div class="pay-plan-name">${p.name}</div>
      <div class="pay-plan-price">${p.label}</div>
    </button>`
  ).join('');

  grid.querySelectorAll('.pay-plan').forEach((btn) => {
    btn.addEventListener('click', () => {
      grid.querySelectorAll('.pay-plan').forEach((b) => b.classList.remove('selected'));
      btn.classList.add('selected');
      const id = (btn as HTMLElement).dataset.plan;
      selectedPlan = PAY_PLANS.find((p) => p.id === id) || null;
      const next = $('payNextFromPlans') as HTMLButtonElement | null;
      if (next) next.disabled = !selectedPlan;
    });
  });
}

function showStep(stepId: string): void {
  document.querySelectorAll('.pay-step').forEach((s) => s.classList.remove('active'));
  $(stepId)?.classList.add('active');
}

export function payGoPlans(): void {
  showStep('payStepPlans');
}

export function payGoPhone(): void {
  if (!selectedPlan) {
    showToast('Please choose a plan first', true);
    return;
  }
  showStep('payStepPhone');
}

export function payOnPhoneInput(): void {
  const input = $('payPhone') as HTMLInputElement | null;
  const badge = $('payNetBadge');
  const next = $('payNextFromPhone') as HTMLButtonElement | null;
  if (!input) return;

  const raw = input.value.replace(/\D/g, '');
  payPhone = raw;

  // Simple Tanzania mobile detection
  let net = '';
  if (/^(255|0)?6[2-9]/.test(raw) || /^(255|0)?7[1-9]/.test(raw)) {
    if (/^(255|0)?65[0-9]|^(255|0)?67[0-9]|^(255|0)?71[0-9]|^(255|0)?76[0-9]|^(255|0)?77[0-9]/.test(raw))
      net = 'Tigo';
    else if (/^(255|0)?68[0-9]|^(255|0)?69[0-9]|^(255|0)?78[0-9]/.test(raw)) net = 'Airtel';
    else if (/^(255|0)?62[0-9]|^(255|0)?74[0-9]/.test(raw)) net = 'Halo';
    else net = 'M-Pesa / Vodacom';
  }

  if (badge) badge.textContent = net ? `Detected: ${net}` : '';
  if (next) next.disabled = raw.length < 9;
}

export function payGoConfirm(): void {
  if (!selectedPlan || payPhone.length < 9) {
    showToast('Enter a valid phone number', true);
    return;
  }
  const summary = $('paySummary');
  if (summary) {
    summary.innerHTML = `
      <div><strong>Plan:</strong> ${selectedPlan.name}</div>
      <div><strong>Price:</strong> ${selectedPlan.label}</div>
      <div><strong>Phone:</strong> ${payPhone}</div>
    `;
  }
  showStep('payStepConfirm');
}

export async function paySubmit(): Promise<void> {
  if (!selectedPlan) return;

  const btn = $('paySubmitBtn') as HTMLButtonElement | null;
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Sending…';
  }

  // TODO: call real STK API (ClickPesa / Selcom / etc.)
  // For now simulate success path for UI
  try {
    await new Promise((r) => setTimeout(r, 1200));

    const until = Date.now() + selectedPlan.durationDays * 24 * 60 * 60 * 1000;
    setPro({
      active: true,
      plan: selectedPlan.id,
      until,
      phone: payPhone,
    });

    showStep('payStepResult');
    const title = $('payResultTitle');
    const sub = $('payResultSub');
    if (title) title.textContent = 'Pro activated!';
    if (sub) sub.textContent = `Enjoy unlimited messages until ${new Date(until).toLocaleDateString()}.`;
    showToast('Welcome to SKONGA Pro 🎉');
  } catch (e) {
    showToast('Payment failed. Try again.', true);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Confirm & Send STK';
    }
  }
}

/** Expose for legacy onclick handlers in HTML */
export function bindPayGlobals(): void {
  (window as any).openSkongaPay = openSkongaPay;
  (window as any).closeSkongaPay = closeSkongaPay;
  (window as any).payGoPlans = payGoPlans;
  (window as any).payGoPhone = payGoPhone;
  (window as any).payGoConfirm = payGoConfirm;
  (window as any).payOnPhoneInput = payOnPhoneInput;
  (window as any).paySubmit = paySubmit;
}
