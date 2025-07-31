'use client';

import { useEffect, useState } from 'react';

interface AccessibilityEnhancerProps {
  children: React.ReactNode;
}

export const AccessibilityEnhancer = ({ children }: AccessibilityEnhancerProps) => {
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [fontSize, setFontSize] = useState('normal');

  useEffect(() => {
    // Check user preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    setReducedMotion(prefersReducedMotion);
    setHighContrast(prefersHighContrast);

    // Load saved preferences
    const savedFontSize = localStorage.getItem('threadcraft-font-size');
    if (savedFontSize) {
      setFontSize(savedFontSize);
    }

    // Apply accessibility classes
    const applyAccessibilitySettings = () => {
      const root = document.documentElement;
      
      if (prefersReducedMotion) {
        root.classList.add('reduce-motion');
      }
      
      if (prefersHighContrast) {
        root.classList.add('high-contrast');
      }
      
      root.setAttribute('data-font-size', fontSize);
    };

    applyAccessibilitySettings();

    // Keyboard navigation enhancement
    const enhanceKeyboardNavigation = () => {
      // Add visible focus indicators for keyboard users
      let isUsingKeyboard = false;

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          isUsingKeyboard = true;
          document.body.classList.add('keyboard-navigation');
        }
      });

      document.addEventListener('mousedown', () => {
        isUsingKeyboard = false;
        document.body.classList.remove('keyboard-navigation');
      });

      // Skip to main content link
      const skipLink = document.createElement('a');
      skipLink.href = '#main-content';
      skipLink.textContent = 'Skip to main content';
      skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50';
      document.body.insertBefore(skipLink, document.body.firstChild);
    };

    // Screen reader announcements
    const createAnnouncementRegion = () => {
      const announcer = document.createElement('div');
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      announcer.id = 'accessibility-announcer';
      document.body.appendChild(announcer);
    };

    enhanceKeyboardNavigation();
    createAnnouncementRegion();

    // Cleanup
    return () => {
      const skipLink = document.querySelector('a[href="#main-content"]');
      const announcer = document.getElementById('accessibility-announcer');
      if (skipLink) skipLink.remove();
      if (announcer) announcer.remove();
    };
  }, [fontSize]);

  return (
    <div className="accessibility-wrapper">
      {/* Accessibility Controls */}
      <div className="fixed bottom-4 right-4 z-40">
        <details className="group">
          <summary className="bg-white border border-gray-300 rounded-lg p-3 shadow-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 list-none">
            <span className="sr-only">Accessibility Options</span>
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
          </summary>
          
          <div className="absolute bottom-full right-0 mb-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 min-w-[200px] group-open:block hidden">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Accessibility</h3>
            
            <div className="space-y-3">
              {/* Font Size */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Font Size
                </label>
                <select
                  value={fontSize}
                  onChange={(e) => {
                    setFontSize(e.target.value);
                    localStorage.setItem('threadcraft-font-size', e.target.value);
                    document.documentElement.setAttribute('data-font-size', e.target.value);
                  }}
                  className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                >
                  <option value="small">Small</option>
                  <option value="normal">Normal</option>
                  <option value="large">Large</option>
                  <option value="extra-large">Extra Large</option>
                </select>
              </div>

              {/* High Contrast */}
              <div>
                <label className="flex items-center text-xs">
                  <input
                    type="checkbox"
                    checked={highContrast}
                    onChange={(e) => {
                      setHighContrast(e.target.checked);
                      document.documentElement.classList.toggle('high-contrast', e.target.checked);
                    }}
                    className="mr-2"
                  />
                  High Contrast
                </label>
              </div>

              {/* Reduced Motion */}
              <div>
                <label className="flex items-center text-xs">
                  <input
                    type="checkbox"
                    checked={reducedMotion}
                    onChange={(e) => {
                      setReducedMotion(e.target.checked);
                      document.documentElement.classList.toggle('reduce-motion', e.target.checked);
                    }}
                    className="mr-2"
                  />
                  Reduce Motion
                </label>
              </div>
            </div>
          </div>
        </details>
      </div>

      {children}
    </div>
  );
};

// Utility function to announce to screen readers
export const announceToScreenReader = (message: string) => {
  const announcer = document.getElementById('accessibility-announcer');
  if (announcer) {
    announcer.textContent = message;
    // Clear after announcement
    setTimeout(() => {
      announcer.textContent = '';
    }, 1000);
  }
};

// Hook for managing focus
export const useFocusManagement = () => {
  const focusElement = (selector: string) => {
    const element = document.querySelector(selector) as HTMLElement;
    if (element) {
      element.focus();
    }
  };

  const trapFocus = (containerSelector: string) => {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: Event) => {
      const keyboardEvent = e as KeyboardEvent;
      if (keyboardEvent.key === 'Tab') {
        if (keyboardEvent.shiftKey) {
          if (document.activeElement === firstElement) {
            keyboardEvent.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            keyboardEvent.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  };

  return { focusElement, trapFocus };
};