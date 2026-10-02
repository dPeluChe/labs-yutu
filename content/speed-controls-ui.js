/**
 * Yutu Labs - Speed controls widget DOM
 */

import { PRESET_SPEEDS, getShortcutHintText, getShortcutLabel } from './speed-shortcuts.js';

export const CONTROL_ID = 'yutu-floating-speed-controls';
export const CLOSE_INPUT_ID = 'yutu-close-on-finish';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/**
 * Build the widget: shortcut hint, preset buttons and the "Close on finish" toggle
 * (the toggle is hidden outside extension-created popup windows).
 */
export function buildSpeedControls({ isPopupWindow, closeOnFinish, onSpeed, onCloseChange }) {
  const root = el('div', 'yutu-floating-speed');
  root.id = CONTROL_ID;
  if (!isPopupWindow) root.classList.add('yutu-floating-speed--regular');

  const label = el('div', 'yutu-floating-speed__label');
  const kbdIcon = el('span', 'yutu-floating-speed__kbd-icon', '⌨');
  kbdIcon.setAttribute('aria-hidden', 'true');
  label.append(kbdIcon, el('span', 'yutu-floating-speed__kbd-text', getShortcutHintText()));

  const buttons = el('div', 'yutu-floating-speed__buttons');
  for (const speed of PRESET_SPEEDS) {
    const btn = el('button', 'yutu-floating-speed__btn', `${speed}x`);
    btn.type = 'button';
    btn.dataset.speed = String(speed);
    btn.title = getShortcutLabel(speed);
    btn.addEventListener('click', () => onSpeed(speed));
    buttons.appendChild(btn);
  }

  const closeToggle = el('label', 'yutu-floating-speed__close-wrap');
  const closeInput = el('input', 'yutu-floating-speed__close-input');
  closeInput.type = 'checkbox';
  closeInput.id = CLOSE_INPUT_ID;
  closeInput.checked = closeOnFinish;
  closeInput.addEventListener('change', (event) => onCloseChange(Boolean(event.target.checked)));
  closeToggle.append(closeInput, el('span', 'yutu-floating-speed__close-text', 'Close on finish'));
  if (!isPopupWindow) closeToggle.style.display = 'none';

  root.append(label, buttons, closeToggle);
  return root;
}
