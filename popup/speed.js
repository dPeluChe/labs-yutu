// Yush - Popup playback speed controls

const speedButtons = document.querySelectorAll('.speed-btn');
const speedStatus = document.getElementById('speed-status');

export async function syncCurrentSpeed() {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length === 0 || !tabs[0].url?.includes('youtube.com')) return;

    const response = await chrome.tabs.sendMessage(tabs[0].id, {
      action: 'getPlaybackSpeed'
    });

    if (response?.success) {
      const currentSpeed = response.speed;
      speedButtons.forEach(btn => {
        const btnSpeed = parseFloat(btn.getAttribute('data-speed'));
        btn.classList.toggle('speed-btn--active', Math.abs(btnSpeed - currentSpeed) < 0.01);
      });
    }
  } catch {
    // Content script may not be loaded yet
  }
}

export function setupSpeedControls() {
  speedButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const speed = parseFloat(btn.getAttribute('data-speed'));

      speedStatus.textContent = `Setting speed to ${speed}x...`;
      speedStatus.className = 'speed-status speed-status--loading';

      try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });

        if (tabs.length === 0 || !tabs[0].url.includes('youtube.com')) {
          speedStatus.textContent = 'Please open YouTube first';
          speedStatus.className = 'speed-status speed-status--error';
          return;
        }

        const response = await chrome.tabs.sendMessage(tabs[0].id, {
          action: 'setPlaybackSpeed',
          speed
        });

        if (response?.success) {
          speedStatus.textContent = `Speed set to ${speed}x`;
          speedStatus.className = 'speed-status speed-status--success';

          speedButtons.forEach(b => b.classList.remove('speed-btn--active'));
          btn.classList.add('speed-btn--active');

          setTimeout(() => {
            if (speedStatus.classList.contains('speed-status--success')) {
              speedStatus.textContent = '';
              speedStatus.className = 'speed-status';
            }
          }, 2000);
        } else {
          speedStatus.textContent = 'Failed to set speed';
          speedStatus.className = 'speed-status speed-status--error';
        }
      } catch (error) {
        console.error('Error setting playback speed:', error);
        speedStatus.textContent = 'Error setting speed';
        speedStatus.className = 'speed-status speed-status--error';
      }
    });
  });
}
