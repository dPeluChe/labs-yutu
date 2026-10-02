// Yutu Labs - Popup status messages

let statusTimer = null;

export function flashStatus(el, message, type, duration = 2500) {
  clearTimeout(statusTimer);
  el.textContent = message;
  el.className = `save-status ${type}`;
  el.style.opacity = '1';
  if (duration > 0) {
    statusTimer = setTimeout(() => {
      el.style.opacity = '0';
      setTimeout(() => {
        if (el.style.opacity === '0') {
          el.textContent = '';
          el.className = 'save-status';
        }
      }, 300);
    }, duration);
  }
}
