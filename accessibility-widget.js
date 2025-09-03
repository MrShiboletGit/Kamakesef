// Accessibility Widget for Kamakesef.com
// Vanilla JavaScript implementation of accessibility features

class AccessibilityWidget {
  constructor() {
    this.isOpen = false;
    this.settings = {
      highContrast: false,
      largeText: false,
      screenReader: false,
      reducedMotion: false,
      grayscale: false,
      focusIndicator: true,
      keyboardNavigation: true,
      colorBlind: false,
    };
    
    this.init();
  }

  init() {
    this.loadSettings();
    this.createWidget();
    this.applySettings();
    this.bindEvents();
  }

  createWidget() {
    // Create the accessibility toggle button
    const toggleButton = document.createElement('button');
    toggleButton.className = 'accessibility-toggle';
    toggleButton.innerHTML = `
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
        <path d="M12 1a11 11 0 1 0 11 11"/>
      </svg>
    `;
    toggleButton.setAttribute('aria-label', 'פתח תפריט נגישות');
    toggleButton.setAttribute('aria-expanded', 'false');
    
    // Create the accessibility panel
    const panel = document.createElement('div');
    panel.className = 'accessibility-panel';
    panel.innerHTML = `
      <div class="accessibility-content">
        <h3>הגדרות נגישות</h3>
        
        <div class="accessibility-options">
          <!-- High Contrast -->
          <button class="accessibility-option" data-setting="highContrast">
            <span class="option-content">
              <svg class="option-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              ניגודיות גבוהה
            </span>
            <span class="option-status">כבוי</span>
          </button>

          <!-- Large Text -->
          <button class="accessibility-option" data-setting="largeText">
            <span class="option-content">
              <svg class="option-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="4,7 4,4 20,4 20,7"/>
                <line x1="9" y1="20" x2="15" y2="20"/>
                <line x1="12" y1="4" x2="12" y2="20"/>
              </svg>
              טקסט גדול
            </span>
            <span class="option-status">כבוי</span>
          </button>

          <!-- Focus Indicator -->
          <button class="accessibility-option" data-setting="focusIndicator">
            <span class="option-content">
              <svg class="option-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/>
                <path d="M13 13l6 6"/>
              </svg>
              מחוון מיקוד
            </span>
            <span class="option-status">פועל</span>
          </button>

          <!-- Keyboard Navigation -->
          <button class="accessibility-option" data-setting="keyboardNavigation">
            <span class="option-content">
              <svg class="option-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
              ניווט מקלדת
            </span>
            <span class="option-status">פועל</span>
          </button>

          <!-- Screen Reader -->
          <button class="accessibility-option" data-setting="screenReader">
            <span class="option-content">
              <svg class="option-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
              </svg>
              הודעות קורא מסך
            </span>
            <span class="option-status">כבוי</span>
          </button>

          <!-- Reduced Motion -->
          <button class="accessibility-option" data-setting="reducedMotion">
            <span class="option-content">
              <svg class="option-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
              </svg>
              הפחתת תנועה
            </span>
            <span class="option-status">כבוי</span>
          </button>

          <!-- Color Blind Support -->
          <button class="accessibility-option" data-setting="colorBlind">
            <span class="option-content">
              <svg class="option-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="13.5" cy="6.5" r=".5"/>
                <circle cx="17.5" cy="10.5" r=".5"/>
                <circle cx="8.5" cy="7.5" r=".5"/>
                <circle cx="6.5" cy="12.5" r=".5"/>
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
              </svg>
              תמיכה בעיוורון צבעים
            </span>
            <span class="option-status">כבוי</span>
          </button>

          <!-- Grayscale -->
          <button class="accessibility-option" data-setting="grayscale">
            <span class="option-content">
              <svg class="option-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="13.5" cy="6.5" r=".5"/>
                <circle cx="17.5" cy="10.5" r=".5"/>
                <circle cx="8.5" cy="7.5" r=".5"/>
                <circle cx="6.5" cy="12.5" r=".5"/>
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
              </svg>
              גווני אפור
            </span>
            <span class="option-status">כבוי</span>
          </button>

          <!-- Reset Button -->
          <button class="accessibility-reset">
            אופס הגדרות
          </button>
        </div>

        <div class="accessibility-footer">
          <p>הגדרות אלו נשמרות אוטומטית</p>
        </div>
      </div>
    `;

    // Add to DOM
    document.body.appendChild(toggleButton);
    document.body.appendChild(panel);

    // Store references
    this.toggleButton = toggleButton;
    this.panel = panel;
  }

  bindEvents() {
    // Toggle button click
    this.toggleButton.addEventListener('click', () => {
      this.togglePanel();
    });

    // Option buttons click
    this.panel.addEventListener('click', (e) => {
      const option = e.target.closest('.accessibility-option');
      if (option) {
        const setting = option.dataset.setting;
        this.toggleSetting(setting);
      }

      // Reset button
      if (e.target.classList.contains('accessibility-reset')) {
        this.resetSettings();
      }
    });

    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.panel.contains(e.target) && !this.toggleButton.contains(e.target)) {
        this.closePanel();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closePanel();
      }
    });
  }

  togglePanel() {
    this.isOpen = !this.isOpen;
    this.panel.style.display = this.isOpen ? 'block' : 'none';
    this.toggleButton.setAttribute('aria-expanded', this.isOpen.toString());
    
    if (this.isOpen) {
      this.announceToScreenReader('תפריט נגישות נפתח');
    }
  }

  closePanel() {
    this.isOpen = false;
    this.panel.style.display = 'none';
    this.toggleButton.setAttribute('aria-expanded', 'false');
  }

  toggleSetting(setting) {
    this.settings[setting] = !this.settings[setting];
    this.updateUI();
    this.applySettings();
    this.saveSettings();
    
    const settingNames = {
      highContrast: 'ניגודיות גבוהה',
      largeText: 'טקסט גדול',
      screenReader: 'הודעות קורא מסך',
      reducedMotion: 'הפחתת תנועה',
      grayscale: 'גווני אפור',
      focusIndicator: 'מחוון מיקוד',
      keyboardNavigation: 'ניווט מקלדת',
      colorBlind: 'תמיכה בעיוורון צבעים'
    };
    
    const status = this.settings[setting] ? 'הופעל' : 'כובה';
    this.announceToScreenReader(`${settingNames[setting]} ${status}`);
  }

  updateUI() {
    const options = this.panel.querySelectorAll('.accessibility-option');
    options.forEach(option => {
      const setting = option.dataset.setting;
      const status = option.querySelector('.option-status');
      const isActive = this.settings[setting];
      
      option.classList.toggle('active', isActive);
      status.textContent = isActive ? 'פועל' : 'כבוי';
    });
  }

  applySettings() {
    const root = document.documentElement;
    let filter = '';
    
    // High contrast
    if (this.settings.highContrast) {
      filter += 'contrast(150%) brightness(120%) ';
    }
    
    // Grayscale
    if (this.settings.grayscale) {
      filter += 'grayscale(100%) ';
    }
    
    // Color blind support
    if (this.settings.colorBlind) {
      filter += 'saturate(150%) hue-rotate(180deg) ';
    }
    
    root.style.filter = filter.trim();
    
    // Large text
    if (this.settings.largeText) {
      root.style.fontSize = '120%';
    } else {
      root.style.fontSize = '';
    }
    
    // Reduced motion
    if (this.settings.reducedMotion) {
      root.style.setProperty('--reduced-motion', 'reduce');
    } else {
      root.style.removeProperty('--reduced-motion');
    }
    
    // Focus indicator
    if (this.settings.focusIndicator) {
      root.style.setProperty('--focus-visible', '2px solid #0066cc');
    } else {
      root.style.removeProperty('--focus-visible');
    }
  }

  resetSettings() {
    this.settings = {
      highContrast: false,
      largeText: false,
      screenReader: false,
      reducedMotion: false,
      grayscale: false,
      focusIndicator: true,
      keyboardNavigation: true,
      colorBlind: false,
    };
    
    this.updateUI();
    this.applySettings();
    this.saveSettings();
    this.announceToScreenReader('הגדרות נגישות אופסו');
  }

  saveSettings() {
    localStorage.setItem('accessibility-settings', JSON.stringify(this.settings));
  }

  loadSettings() {
    const saved = localStorage.getItem('accessibility-settings');
    if (saved) {
      this.settings = { ...this.settings, ...JSON.parse(saved) };
    }
  }

  announceToScreenReader(message) {
    if (!this.settings.screenReader) return;
    
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      if (announcement.parentNode) {
        document.body.removeChild(announcement);
      }
    }, 1000);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new AccessibilityWidget();
});
