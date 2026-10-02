// Yutu Labs - Popup tabs

export function setupTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('tab-btn--active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('tab-panel--hidden'));
      btn.classList.add('tab-btn--active');
      document.getElementById(`tab-${btn.dataset.tab}`).classList.remove('tab-panel--hidden');
    });
  });
}
