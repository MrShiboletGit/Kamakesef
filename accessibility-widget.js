import { useState, useEffect } from 'react';
import { Accessibility, Eye, EyeOff, Volume2, VolumeX, Type, Palette, RotateCcw, MousePointer, Keyboard } from 'lucide-react';

interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
  reducedMotion: boolean;
  grayscale: boolean;
  focusIndicator: boolean;
  keyboardNavigation: boolean;
  colorBlind: boolean;
}

const AccessibilityWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    largeText: false,
    screenReader: false,
    reducedMotion: false,
    grayscale: false,
    focusIndicator: true,
    keyboardNavigation: true,
    colorBlind: false,
  });

  // Debug log
  console.log('AccessibilityWidget rendered');

  // Apply accessibility settings to the document
  useEffect(() => {
    const root = document.documentElement;
    
    if (settings.highContrast) {
      root.style.filter = 'contrast(150%) brightness(120%)';
    } else {
      root.style.filter = '';
    }

    if (settings.largeText) {
      root.style.fontSize = '120%';
    } else {
      root.style.fontSize = '';
    }

    if (settings.reducedMotion) {
      root.style.setProperty('--reduced-motion', 'reduce');
    } else {
      root.style.removeProperty('--reduced-motion');
    }

    if (settings.grayscale) {
      root.style.filter = root.style.filter + ' grayscale(100%)';
    }

    if (settings.focusIndicator) {
      root.style.setProperty('--focus-visible', '2px solid #0066cc');
    } else {
      root.style.removeProperty('--focus-visible');
    }

    if (settings.colorBlind) {
      root.style.filter = root.style.filter + ' saturate(150%) hue-rotate(180deg)';
    }

    // Store settings in localStorage
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
  }, [settings]);

  // Load saved settings on mount
  useEffect(() => {
    const saved = localStorage.getItem('accessibility-settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const toggleSetting = (key: keyof AccessibilitySettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const resetSettings = () => {
    setSettings({
      highContrast: false,
      largeText: false,
      screenReader: false,
      reducedMotion: false,
      grayscale: false,
      focusIndicator: true,
      keyboardNavigation: true,
      colorBlind: false,
    });
  };

  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  };

  return (
    <>
      {/* Accessibility Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 left-4 md:top-4 md:left-4 md:bottom-auto z-[9999] bg-blue-400 text-white p-4 rounded-full shadow-xl hover:bg-blue-500 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-200 border-2 border-white"
        aria-label="פתח תפריט נגישות"
        aria-expanded={isOpen}
      >
        <Accessibility size={28} />
      </button>

      {/* Accessibility Panel */}
      {isOpen && (
        <div className="fixed md:top-20 md:left-4 bottom-20 left-4 right-4 md:right-auto z-[9998] bg-white rounded-lg shadow-2xl border-2 border-gray-200 p-6 md:min-w-80 max-h-[80vh] overflow-y-auto">
          <div className="text-right">
            <h3 className="text-lg font-bold text-primary mb-4">הגדרות נגישות</h3>
            
            <div className="space-y-4">
              {/* High Contrast */}
              <button
                onClick={() => {
                  toggleSetting('highContrast');
                  announceToScreenReader(settings.highContrast ? 'ניגודיות גבוהה כובתה' : 'ניגודיות גבוהה הופעלה');
                }}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                  settings.highContrast 
                    ? 'bg-primary text-white border-primary' 
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
                aria-pressed={settings.highContrast}
              >
                <span className="flex items-center gap-2">
                  {settings.highContrast ? <Eye size={20} /> : <EyeOff size={20} />}
                  ניגודיות גבוהה
                </span>
                <span className="text-sm">{settings.highContrast ? 'פועל' : 'כבוי'}</span>
              </button>

              {/* Large Text */}
              <button
                onClick={() => {
                  toggleSetting('largeText');
                  announceToScreenReader(settings.largeText ? 'טקסט גדול כובה' : 'טקסט גדול הופעל');
                }}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                  settings.largeText 
                    ? 'bg-primary text-white border-primary' 
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
                aria-pressed={settings.largeText}
              >
                <span className="flex items-center gap-2">
                  <Type size={20} />
                  טקסט גדול
                </span>
                <span className="text-sm">{settings.largeText ? 'פועל' : 'כבוי'}</span>
              </button>

              {/* Focus Indicator */}
              <button
                onClick={() => {
                  toggleSetting('focusIndicator');
                  announceToScreenReader(settings.focusIndicator ? 'מחוון מיקוד כובה' : 'מחוון מיקוד הופעל');
                }}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                  settings.focusIndicator 
                    ? 'bg-primary text-white border-primary' 
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
                aria-pressed={settings.focusIndicator}
              >
                <span className="flex items-center gap-2">
                  <MousePointer size={20} />
                  מחוון מיקוד
                </span>
                <span className="text-sm">{settings.focusIndicator ? 'פועל' : 'כבוי'}</span>
              </button>

              {/* Keyboard Navigation */}
              <button
                onClick={() => {
                  toggleSetting('keyboardNavigation');
                  announceToScreenReader(settings.keyboardNavigation ? 'ניווט מקלדת כובה' : 'ניווט מקלדת הופעל');
                }}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                  settings.keyboardNavigation 
                    ? 'bg-primary text-white border-primary' 
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
                aria-pressed={settings.keyboardNavigation}
              >
                <span className="flex items-center gap-2">
                  <Keyboard size={20} />
                  ניווט מקלדת
                </span>
                <span className="text-sm">{settings.keyboardNavigation ? 'פועל' : 'כבוי'}</span>
              </button>

              {/* Screen Reader Announcements */}
              <button
                onClick={() => {
                  toggleSetting('screenReader');
                  announceToScreenReader(settings.screenReader ? 'הודעות קורא מסך כובות' : 'הודעות קורא מסך הופעלו');
                }}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                  settings.screenReader 
                    ? 'bg-primary text-white border-primary' 
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
                aria-pressed={settings.screenReader}
              >
                <span className="flex items-center gap-2">
                  {settings.screenReader ? <Volume2 size={20} /> : <VolumeX size={20} />}
                  הודעות קורא מסך
                </span>
                <span className="text-sm">{settings.screenReader ? 'פועל' : 'כבוי'}</span>
              </button>

              {/* Reduced Motion */}
              <button
                onClick={() => {
                  toggleSetting('reducedMotion');
                  announceToScreenReader(settings.reducedMotion ? 'הפחתת תנועה כובה' : 'הפחתת תנועה הופעלה');
                }}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                  settings.reducedMotion 
                    ? 'bg-primary text-white border-primary' 
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
                aria-pressed={settings.reducedMotion}
              >
                <span className="flex items-center gap-2">
                  <RotateCcw size={20} />
                  הפחתת תנועה
                </span>
                <span className="text-sm">{settings.reducedMotion ? 'פועל' : 'כבוי'}</span>
              </button>

              {/* Color Blind Support */}
              <button
                onClick={() => {
                  toggleSetting('colorBlind');
                  announceToScreenReader(settings.colorBlind ? 'תמיכה בעיוורון צבעים כובה' : 'תמיכה בעיוורון צבעים הופעלה');
                }}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                  settings.colorBlind 
                    ? 'bg-primary text-white border-primary' 
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
                aria-pressed={settings.colorBlind}
              >
                <span className="flex items-center gap-2">
                  <Palette size={20} />
                  תמיכה בעיוורון צבעים
                </span>
                <span className="text-sm">{settings.colorBlind ? 'פועל' : 'כבוי'}</span>
              </button>

              {/* Grayscale */}
              <button
                onClick={() => {
                  toggleSetting('grayscale');
                  announceToScreenReader(settings.grayscale ? 'גווני אפור כובות' : 'גווני אפור הופעלו');
                }}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                  settings.grayscale 
                    ? 'bg-primary text-white border-primary' 
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
                aria-pressed={settings.grayscale}
              >
                <span className="flex items-center gap-2">
                  <Palette size={20} />
                  גווני אפור
                </span>
                <span className="text-sm">{settings.grayscale ? 'פועל' : 'כבוי'}</span>
              </button>

              {/* Reset Button */}
              <button
                onClick={() => {
                  resetSettings();
                  announceToScreenReader('הגדרות נגישות אופסו');
                }}
                className="w-full bg-gray-200 text-gray-700 p-3 rounded-lg hover:bg-gray-300 transition-colors"
              >
                אופס הגדרות
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                הגדרות אלו נשמרות אוטומטית
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Screen Reader Only Announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true"></div>
    </>
  );
};

export default AccessibilityWidget; 