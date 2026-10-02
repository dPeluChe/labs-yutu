/**
 * Yush - Speed presets and keyboard shortcuts (Alt/Option + 1..5)
 */

export const PRESET_SPEEDS = [1, 1.15, 1.25, 1.5, 2];

export const SHORTCUTS_BY_CODE = {
  Digit1: 1,
  Digit2: 1.15,
  Digit3: 1.25,
  Digit4: 1.5,
  Digit5: 2
};

export function isMacPlatform() {
  const platform = navigator.platform || navigator.userAgentData?.platform || '';
  return /mac/i.test(platform);
}

export function getShortcutModifierLabel(isMac = isMacPlatform()) {
  return isMac ? '⌥' : 'Alt';
}

export function getShortcutHintText(isMac = isMacPlatform()) {
  return `${getShortcutModifierLabel(isMac)}+1..5`;
}

export function getShortcutLabel(speed, isMac = isMacPlatform()) {
  const entry = Object.entries(SHORTCUTS_BY_CODE).find(([, value]) => value === speed);
  if (!entry) return `${speed}x`;
  const digit = entry[0].replace('Digit', '');
  return `${speed}x (${getShortcutModifierLabel(isMac)}+${digit})`;
}

export function isTypingContext(target) {
  if (!target) return false;
  const tagName = target.tagName?.toLowerCase();
  if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') return true;
  return Boolean(target.isContentEditable);
}
