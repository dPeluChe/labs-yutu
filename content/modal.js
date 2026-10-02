/**
 * Yush - Modal System
 * Custom modal dialogs to replace native browser alerts
 * Better UX with auto-dismiss, icons, and consistent styling
 */

export class Modal {
  static hideTimeout = null;

  /**
   * Show a custom modal dialog
   * @param {Object} options - Modal options
   * @param {string} options.title - Modal title
   * @param {string} options.message - Modal message
   * @param {string} options.type - Modal type: 'info', 'error', 'success'
   * @param {number} options.duration - Auto-dismiss duration (ms), 0 for no auto-dismiss
   * @returns {HTMLElement} - The modal element
   */
  static show(options) {
    const {
      title = 'Yush',
      message,
      type = 'info', // 'info', 'error', 'success'
      duration = 3000
    } = options;

    // Remove existing modal if any
    this.hide();

    // Create modal container
    const modal = document.createElement('div');
    modal.className = `yutu-modal yutu-modal--${type}`;

    const icon = this.getIcon(type);

    const content = document.createElement('div');
    content.className = 'yutu-modal__content';

    const iconEl = document.createElement('div');
    iconEl.className = 'yutu-modal__icon';
    iconEl.textContent = icon;

    const textEl = document.createElement('div');
    textEl.className = 'yutu-modal__text';

    const titleEl = document.createElement('div');
    titleEl.className = 'yutu-modal__title';
    titleEl.textContent = title;

    const messageEl = document.createElement('div');
    messageEl.className = 'yutu-modal__message';
    messageEl.textContent = message;

    textEl.appendChild(titleEl);
    textEl.appendChild(messageEl);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'yutu-modal__close';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.textContent = '\u00d7';

    content.appendChild(iconEl);
    content.appendChild(textEl);
    content.appendChild(closeBtn);
    modal.appendChild(content);

    document.body.appendChild(modal);

    // Animate in
    requestAnimationFrame(() => {
      modal.classList.add('yutu-modal--visible');
    });

    // Setup close handlers
    closeBtn.onclick = () => this.hide();

    // Click outside to close
    modal.onclick = (e) => {
      if (e.target === modal) {
        this.hide();
      }
    };

    // Auto-hide after duration
    if (duration > 0) {
      this.hideTimeout = setTimeout(() => this.hide(), duration);
    }

    return modal;
  }

  /**
   * Hide the current modal
   */
  static hide() {
    const existingModal = document.querySelector('.yutu-modal');
    if (existingModal) {
      existingModal.classList.remove('yutu-modal--visible');
      setTimeout(() => existingModal.remove(), 300);
    }
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }

  /**
   * Get icon for modal type
   */
  static getIcon(type) {
    const icons = {
      error: '⚠️',
      success: '✓',
      info: 'ℹ️'
    };
    return icons[type] || icons.info;
  }

  /**
   * Show error modal
   * @param {string} message - Error message
   * @param {number} duration - Auto-dismiss duration (ms)
   */
  static showError(message, duration = 4000) {
    return this.show({
      title: 'Error',
      message,
      type: 'error',
      duration
    });
  }

  /**
   * Show success modal
   * @param {string} message - Success message
   * @param {number} duration - Auto-dismiss duration (ms)
   */
  static showSuccess(message, duration = 2000) {
    return this.show({
      title: 'Success',
      message,
      type: 'success',
      duration
    });
  }

  /**
   * Show info modal
   * @param {string} message - Info message
   * @param {number} duration - Auto-dismiss duration (ms)
   */
  static showInfo(message, duration = 3000) {
    return this.show({
      title: 'Info',
      message,
      type: 'info',
      duration
    });
  }
}
