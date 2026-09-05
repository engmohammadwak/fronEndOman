// js/utils/helpers.js - دوال مساعدة مشتركة

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  
  let bgClass = 'bg-inverse-surface text-inverse-on-surface border-outline-variant/30';
  let icon = 'info';
  
  if (type === 'success') {
    bgClass = 'bg-tertiary text-on-tertiary border-tertiary-fixed';
    icon = 'check_circle';
  } else if (type === 'error') {
    bgClass = 'bg-error text-on-error border-error-container';
    icon = 'error';
  }

  toast.className = `pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-bold transition-all duration-300 translate-y-2 opacity-0 ${bgClass}`;
  toast.innerHTML = `
    <span class="material-symbols-outlined text-xl" aria-hidden="true">${icon}</span>
    <span class="flex-1">${message}</span>
  `;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  }, 10);

  setTimeout(() => {
    toast.classList.add('translate-y-2', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function initCountdown() {
  let totalSeconds = 14 * 3600 + 38 * 60 + 42;
  const hoursEl = document.getElementById('timer-hours');
  const minutesEl = document.getElementById('timer-minutes');
  const secondsEl = document.getElementById('timer-seconds');

  if (!hoursEl || !minutesEl || !secondsEl) return;

  setInterval(() => {
    if (totalSeconds <= 0) {
      totalSeconds = 24 * 3600;
    }
    totalSeconds--;

    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    hoursEl.textContent = String(h).padStart(2, '0');
    minutesEl.textContent = String(m).padStart(2, '0');
    secondsEl.textContent = String(s).padStart(2, '0');
  }, 1000);
}
