// Accessibility Widget for Kamakesef.com
// Vanilla JavaScript implementation of accessibility features

class AccessibilityWidget {
  constructor() {
    this.isOpen = false;
    this.settings = {
      highContrast: false,
      largeText: false,
      grayscale: false,
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
      <svg width="28" height="28" viewBox="0 0 483.2226563 551.4306641" fill="currentColor">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M161.9882813,98.1240234
          c24.9628906-2.3046875,44.3574219-23.8110352,44.3574219-48.9658203C206.3457031,22.0830078,184.2626953,0,157.1875,0
          s-49.1572266,22.0830078-49.1572266,49.1582031c0,8.2568359,2.3037109,16.7055664,6.1445313,23.8105469l17.515625,246.4667969
          l180.3964844,0.0488281l73.9912109,173.3652344l97.1445313-38.0976563l-15.0429688-35.8203125l-54.3662109,19.625
          l-71.5908203-165.2802734l-167.7294922,1.1269531l-2.3027344-31.2128906l121.4228516,0.0483398v-46.1831055l-126.0546875-0.0493164
          L161.9882813,98.1240234z"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M343.4199219,451.5908203
          c-30.4472656,60.1875-94.1748047,99.8398438-162.1503906,99.8398438C81.4296875,551.4306641,0,470.0009766,0,370.1611328
          c0-70.1005859,42.4853516-135.2436523,105.8818359-164.1210938l4.1025391,53.5375977
          c-37.4970703,23.628418-60.6123047,66.262207-60.6123047,110.9506836c0,72.4267578,59.0712891,131.4970703,131.4970703,131.4970703
          c66.2617188,0,122.7646484-50.8515625,130.4697266-116.0869141L343.4199219,451.5908203z"/>
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
      grayscale: 'גווני אפור',
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
  }

  resetSettings() {
    this.settings = {
      highContrast: false,
      largeText: false,
      grayscale: false,
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
    // Screen reader announcements removed as this feature was non-functional
    return;
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new AccessibilityWidget();
});