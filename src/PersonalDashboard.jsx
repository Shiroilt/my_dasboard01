// PersonalDashboard.jsx
// With 5-minute background rotation and coordinated color scheme

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiPlus, FiClock, FiSettings, FiTrash2, FiX, FiExternalLink, FiCheck, FiList, FiStar, FiHome } from 'react-icons/fi';

function useSettings() {
  const [settings, setSettings] = useState(() => {
    // Initialize from localStorage with defaults
    const defaultSettings = {
      darkMode: false,
      themeColor: 'primary',
      backgroundBlur: 'medium',
      glassEffect: true,
      fontSize: 'medium',
      animationSpeed: 'normal',
      bgRotationSpeed: '5min',
      autoClearTasks: false,
      defaultSearch: 'both',
      startupPage: 'dashboard',
      keyboardShortcuts: true,
      weatherWidget: false,
      quickNotes: true,
      desktopNotifications: false,
      taskSounds: true,
      browserAlerts: true,
      dailyReports: false,
      autoBackup: 'never',
      dataEncryption: false,
      privacyMode: false,
      developerMode: false,
      experimentalFeatures: false,
      performanceMode: false,
      customCSS: '',
      apiConfig: {}
    };

    const savedSettings = {};
    Object.keys(defaultSettings).forEach(key => {
      try {
        const saved = localStorage.getItem(key);
        if (saved !== null) {
          if (typeof defaultSettings[key] === 'boolean') {
            savedSettings[key] = saved === 'true';
          } else if (typeof defaultSettings[key] === 'object') {
            savedSettings[key] = JSON.parse(saved);
          } else {
            savedSettings[key] = saved;
          }
        }
      } catch (error) {
        console.warn(`Error loading setting ${key}:`, error);
        savedSettings[key] = defaultSettings[key];
      }
    });

    return { ...defaultSettings, ...savedSettings };
  });

  const updateSetting = (key, value) => {
    console.log(`Updating setting: ${key} =`, value);
    
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      
      // Save to localStorage
      try {
        localStorage.setItem(key, typeof value === 'object' ? JSON.stringify(value) : value);
      } catch (error) {
        console.error(`Error saving setting ${key}:`, error);
      }
      
      // Apply immediately
      applySettingImmediately(key, value, newSettings);
      
      return newSettings;
    });
  };

  // Apply all current settings on mount
  useEffect(() => {
    Object.entries(settings).forEach(([key, value]) => {
      applySettingImmediately(key, value, settings);
    });
  }, []);

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key && settings.hasOwnProperty(e.key)) {
        try {
          let value = e.newValue;
          
          // Handle boolean values
          if (value === 'true') value = true;
          else if (value === 'false') value = false;
          
          // Try to parse as JSON if it looks like an object
          try {
            if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
              value = JSON.parse(value);
            }
          } catch (parseError) {
            // Not JSON, keep as string
          }
          
          setSettings(prev => ({ ...prev, [e.key]: value }));
        } catch (error) {
          console.warn(`Error processing storage change for ${e.key}:`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [settings]);

  return { settings, updateSetting };
}
const applySettingImmediately = (key, value, allSettings = {}) => {
  console.log(`Applying setting immediately: ${key} =`, value);
  
  switch (key) {
    case 'darkMode':
      if (value) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      break;
      
    case 'themeColor':
      // Dispatch event for BackgroundSlideshow and other components
      console.log('Dispatching theme change event:', value);
      window.dispatchEvent(new CustomEvent('themeChange', { detail: value }));
      
      // Also update localStorage immediately
      localStorage.setItem('themeColor', value);
      break;
      
    case 'fontSize':
      const fontSize = 
        value === 'small' ? '14px' :
        value === 'large' ? '18px' : '16px';
      document.documentElement.style.fontSize = fontSize;
      break;
      
    case 'bgRotationSpeed':
      window.dispatchEvent(new CustomEvent('bgRotationSpeedChange', { detail: value }));
      break;
      
    case 'backgroundBlur':
      // Apply background blur to the backdrop elements
      const blurValue = 
        value === 'low' ? '2px' :
        value === 'high' ? '12px' : '6px';
      
      // Apply to CSS custom property
      document.documentElement.style.setProperty('--backdrop-blur', blurValue);
      
      // Also apply directly to backdrop elements for immediate effect
      const backdropElements = document.querySelectorAll('.backdrop-blur-sm, .backdrop-blur-lg, [class*="backdrop-blur"]');
      backdropElements.forEach(el => {
        el.style.backdropFilter = `blur(${blurValue})`;
      });
      
      console.log('Applied background blur:', blurValue);
      break;
      
    case 'glassEffect':
      if (value) {
        document.documentElement.style.setProperty('--glass-effect', 'blur(10px) saturate(180%)');
        // Apply to glass elements
        const glassElements = document.querySelectorAll('.bg-white\\/95, .bg-white\\/90, .bg-white\\/80, .dark\\:bg-gray-800\\/95, .dark\\:bg-gray-800\\/90, .dark\\:bg-gray-800\\/80');
        glassElements.forEach(el => {
          el.style.backdropFilter = 'blur(10px) saturate(180%)';
        });
      } else {
        document.documentElement.style.setProperty('--glass-effect', 'none');
        // Remove from glass elements
        const glassElements = document.querySelectorAll('.bg-white\\/95, .bg-white\\/90, .bg-white\\/80, .dark\\:bg-gray-800\\/95, .dark\\:bg-gray-800\\/90, .dark\\:bg-gray-800\\/80');
        glassElements.forEach(el => {
          el.style.backdropFilter = 'none';
        });
      }
      break;
      
    case 'animationSpeed':
      const speedValue = 
        value === 'slow' ? '0.5s' :
        value === 'fast' ? '0.2s' : '0.3s';
      document.documentElement.style.setProperty('--animation-speed', speedValue);
      break;
      
    case 'customCSS':
      applyCustomCSS(value);
      break;
      
    case 'performanceMode':
      if (value) {
        document.documentElement.style.setProperty('--animation-speed', '0.1s');
      } else {
        const normalSpeed = allSettings.animationSpeed === 'slow' ? '0.5s' : 
                          allSettings.animationSpeed === 'fast' ? '0.2s' : '0.3s';
        document.documentElement.style.setProperty('--animation-speed', normalSpeed);
      }
      break;
      
    default:
      break;
  }
};
const applyCustomCSS = (css) => {
  let styleElement = document.getElementById('custom-css');
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = 'custom-css';
    document.head.appendChild(styleElement);
  }
  styleElement.textContent = css;
};



// Fixed Settings Modal - single source of truth = settings.*
function SettingsModal({ isOpen, onClose, settings, updateSetting }) {
  const [activeTab, setActiveTab] = useState('appearance');

  // 🔹 Use theme from settings, not props like currentTheme
  const themeGradient = colorThemes[settings.themeColor] || colorThemes.primary;

  // 🔹 Every setting change goes through this (instant apply)
  const handleSettingChange = (key, value) => {
    updateSetting(key, value);
  };

  const tabs = [
    { id: 'appearance', name: '🎨 Appearance', icon: '🎨' },
    { id: 'functionality', name: '⚙️ Functionality', icon: '⚙️' },
  ];

  // Quick actions
  const quickActions = [
    { icon: '📋', label: 'Export All Data', action: () => exportAllData() },
    { icon: '📥', label: 'Import Data', action: () => importData() },
    { icon: '🔄', label: 'Refresh Dashboard', action: () => window.location.reload() },
    { icon: '🧹', label: 'Clear All Data', action: () => clearAllData() },
    { icon: '📊', label: 'View Statistics', action: () => showStatistics() },
    { icon: '🐞', label: 'Debug Info', action: () => showDebugInfo() },
  ];

  const exportAllData = () => {
    const data = {
      tasks: lsGet('dash_todos', []),
      shortcuts: lsGet('dash_shortcuts', []),
      settings: settings,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (data.tasks) lsSet('dash_todos', data.tasks);
          if (data.shortcuts) lsSet('dash_shortcuts', data.shortcuts);
          if (data.settings) {
            Object.entries(data.settings).forEach(([key, value]) => {
              localStorage.setItem(
                key,
                typeof value === 'object' ? JSON.stringify(value) : value
              );
            });
          }
          alert('Data imported successfully! Page will reload.');
          window.location.reload();
        } catch (error) {
          alert('Error importing data: Invalid file format');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear ALL data? This cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const showStatistics = () => {
    const tasks = lsGet('dash_todos', []);
    const shortcuts = lsGet('dash_shortcuts', []);
    const completedTasks = tasks.filter(t => t.done).length;
    
    alert(
      `📊 Dashboard Statistics:\n\n` +
      `✅ Total Tasks: ${tasks.length}\n` +
      `🎯 Completed: ${completedTasks}\n` +
      `🔗 Shortcuts: ${shortcuts.length}\n` +
      `🎨 Theme: ${settings.themeColor}\n` +
      `🌙 Dark Mode: ${settings.darkMode ? 'On' : 'Off'}\n` +
      `💾 Storage Used: ${JSON.stringify(localStorage).length} bytes`
    );
  };

  const showDebugInfo = () => {
    console.log('🔧 Debug Info:', {
      settings,
      tasks: lsGet('dash_todos', []),
      shortcuts: lsGet('dash_shortcuts', []),
      userAgent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`
    });
    alert('Debug info logged to console!');
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white/95 dark:bg-gray-800/95 rounded-3xl w-full max-w-4xl shadow-2xl backdrop-blur-sm border border-white/30 max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl bg-gradient-to-r ${themeGradient}`}>
              <FiSettings className="text-white text-lg" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Dashboard Settings</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Customize your experience</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors duration-200"
          >
            <FiX size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="flex h-[60vh]">
          {/* Sidebar Tabs */}
          <div className="w-48 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <div className="p-4 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r ${themeGradient} text-white shadow-md`
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span>{tab.icon}</span>
                    <span className="font-medium">{tab.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Settings Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h4 className="text-lg font-bold text-gray-800 dark:text-white">Appearance</h4>
                
                {/* Theme Color */}
                <div className="space-y-3">
                  <h5 className="font-semibold text-gray-800 dark:text-white">Theme Color</h5>
                  <div className="grid grid-cols-4 gap-3">
                    {Object.entries(colorThemes).map(([key, gradient]) => (
                      <button
                        key={key}
                        onClick={() => handleSettingChange('themeColor', key)}
                        className={`p-4 rounded-2xl bg-gradient-to-r ${gradient} transition-all duration-200 ${
                          settings.themeColor === key
                            ? 'ring-4 ring-blue-500 ring-opacity-50 scale-105'
                            : 'hover:scale-105'
                        }`}
                      >
                        <div className="text-white text-sm font-medium capitalize">
                          {key}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Background Blur */}
                <div className="space-y-3">
                  <h5 className="font-semibold text-gray-800 dark:text-white">Background Blur</h5>
                  <div className="grid grid-cols-3 gap-3">
                    {['low', 'medium', 'high'].map((level) => (
                      <button
                        key={level}
                        onClick={() => handleSettingChange('backgroundBlur', level)}
                        className={`p-3 rounded-2xl border-2 transition-all duration-200 ${
                          settings.backgroundBlur === level
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-blue-300'
                        }`}
                      >
                        <div className="font-semibold text-gray-800 dark:text-white capitalize">
                          {level}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Glass Effect */}
                <SettingToggle
                  icon="🔮"
                  title="Glass Morphism"
                  description="Enable translucent glass effects"
                  value={settings.glassEffect}
                  onChange={(v) => handleSettingChange('glassEffect', v)}
                />

                {/* Font Size */}
                <div className="space-y-3">
                  <h5 className="font-semibold text-gray-800 dark:text-white">Font Size</h5>
                  <div className="grid grid-cols-3 gap-3">
                    {['small', 'medium', 'large'].map((size) => (
                      <button
                        key={size}
                        onClick={() => handleSettingChange('fontSize', size)}
                        className={`p-3 rounded-2xl border-2 transition-all duration-200 ${
                          settings.fontSize === size
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-blue-300'
                        }`}
                      >
                        <div className="font-semibold text-gray-800 dark:text-white capitalize">
                          {size}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Animation Speed */}
                <div className="space-y-3">
                  <h5 className="font-semibold text-gray-800 dark:text-white">Animation Speed</h5>
                  <div className="grid grid-cols-3 gap-3">
                    {['slow', 'normal', 'fast'].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => handleSettingChange('animationSpeed', speed)}
                        className={`p-3 rounded-2xl border-2 transition-all duration-200 ${
                          settings.animationSpeed === speed
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-blue-300'
                        }`}
                      >
                        <div className="font-semibold text-gray-800 dark:text-white capitalize">
                          {speed}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'functionality' && (
              <div className="space-y-6">
                <h4 className="text-lg font-bold text-gray-800 dark:text-white">Functionality</h4>
                
                <SettingToggle
                  icon="🔄"
                  title="Auto-clear Completed Tasks"
                  description="Automatically remove completed tasks at midnight"
                  value={settings.autoClearTasks}
                  onChange={(v) => handleSettingChange('autoClearTasks', v)}
                />

                <SettingToggle
                  icon="⌨️"
                  title="Keyboard Shortcuts"
                  description="Enable keyboard shortcuts for quick actions"
                  value={settings.keyboardShortcuts}
                  onChange={(v) => handleSettingChange('keyboardShortcuts', v)}
                />

                <SettingToggle
                  icon="📝"
                  title="Quick Notes"
                  description="Enable quick notes panel"
                  value={settings.quickNotes}
                  onChange={(v) => handleSettingChange('quickNotes', v)}
                />

                {/* Background Rotation Speed */}
                <div className="space-y-3">
                  <h5 className="font-semibold text-gray-800 dark:text-white">Background Rotation</h5>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: '2min', label: '2 min', desc: 'Fast' },
                      { value: '5min', label: '5 min', desc: 'Normal' },
                      { value: '10min', label: '10 min', desc: 'Slow' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleSettingChange('bgRotationSpeed', option.value)}
                        className={`p-3 rounded-2xl border-2 transition-all duration-200 ${
                          settings.bgRotationSpeed === option.value
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-blue-300'
                        }`}
                      >
                        <div className="font-semibold text-gray-800 dark:text-white">
                          {option.label}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {option.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Default Search Engine */}
                <div className="space-y-3">
                  <h5 className="font-semibold text-gray-800 dark:text-white">Default Search Engine</h5>
                  <div className="grid grid-cols-3 gap-3">
                    {['google', 'ai', 'both'].map((engine) => (
                      <button
                        key={engine}
                        onClick={() => handleSettingChange('defaultSearch', engine)}
                        className={`p-3 rounded-2xl border-2 transition-all duration-200 ${
                          settings.defaultSearch === engine
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-blue-300'
                        }`}
                      >
                        <div className="font-semibold text-gray-800 dark:text-white capitalize">
                          {engine === 'both' ? 'Both' : engine}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <div className="flex space-x-3">
              <button 
                onClick={exportAllData}
                className="text-blue-500 hover:text-blue-600 transition-colors duration-200"
              >
                Export All
              </button>
              <button 
                onClick={clearAllData}
                className="text-red-500 hover:text-red-600 transition-colors duration-200"
              >
                Reset All
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}


// Reusable Toggle Component
function SettingToggle({ icon, title, description, value, onChange }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
      <div className="flex items-center space-x-3">
        <div className="text-2xl">
          {icon}
        </div>
        <div>
          <h5 className="font-semibold text-gray-800 dark:text-white">{title}</h5>
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
          value ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
            value ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
// Background images array - using images from public/backgrounds folder
const backgroundImages = [
  '/backgrounds/bg1.jpeg',
  '/backgrounds/bg2.jpeg',
  '/backgrounds/bg3.jpeg',
  '/backgrounds/bg4.jpeg',
  '/backgrounds/bg5.jpeg',
  '/backgrounds/bg6.jpeg',
  '/backgrounds/bg7.jpeg',
  '/backgrounds/bg8.jpeg',
  '/backgrounds/bg9.jpeg',
  '/backgrounds/bg10.jpeg',
  '/backgrounds/bg11.jpeg',
  '/backgrounds/bg12.jpeg',
  '/backgrounds/bg13.jpeg',
  '/backgrounds/bg14.jpeg',
  '/backgrounds/bg15.jpeg'
];

// Color themes that match common background colors
const colorThemes = {
  primary: 'from-blue-500 to-purple-600',
  secondary: 'from-emerald-500 to-teal-600',
  accent: 'from-orange-500 to-red-500',
  neutral: 'from-gray-500 to-slate-600'
};

// Background Component with Coordinated Colors - Simplified
// Background Component with Coordinated Colors - Fixed Version
// Background Component with Coordinated Colors - Fixed
// Fixed BackgroundSlideshow - Respects manual theme selection
// Simplified BackgroundSlideshow - Fixed version
function BackgroundSlideshow({ onThemeChange }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [rotationSpeed, setRotationSpeed] = useState(localStorage.getItem('bgRotationSpeed') || '5min');

  // Preload images
  useEffect(() => {
    let isMounted = true;
    
    const loadImages = async () => {
      try {
        // Load at least the first image
        const img = new Image();
        img.src = backgroundImages[0];
        await new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
        
        if (isMounted) {
          setImagesLoaded(true);
        }
      } catch (error) {
        console.error('Error loading images:', error);
        if (isMounted) {
          setImagesLoaded(true);
        }
      }
    };

    loadImages();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Set initial theme when images load
  useEffect(() => {
    if (imagesLoaded) {
      // Check if there's a saved theme first
      const savedTheme = localStorage.getItem('themeColor');
      if (savedTheme) {
        onThemeChange(savedTheme);
      } else {
        // Fallback to background-based theme
        const themes = ['primary', 'secondary', 'accent', 'neutral'];
        const theme = themes[currentImageIndex % themes.length];
        onThemeChange(theme);
      }
    }
  }, [imagesLoaded, currentImageIndex, onThemeChange]);

  // Listen for settings changes
  useEffect(() => {
    const handleStorageChange = () => {
      const newSpeed = localStorage.getItem('bgRotationSpeed') || '5min';
      setRotationSpeed(newSpeed);
    };

    const handleThemeChange = (event) => {
      console.log('Theme change event received:', event.detail);
      // Don't call onThemeChange here to avoid loops
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('themeChange', handleThemeChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('themeChange', handleThemeChange);
    };
  }, []);

  // Background rotation effect
  useEffect(() => {
    if (!imagesLoaded) return;

    const intervalTime = 
      rotationSpeed === '2min' ? 120000 :
      rotationSpeed === '10min' ? 600000 : 300000;

    console.log(`Background rotation: ${rotationSpeed}, ${intervalTime}ms`);

    const interval = setInterval(() => {
      setCurrentImageIndex(prev => {
        const newIndex = (prev + 1) % backgroundImages.length;
        console.log(`Changing to background ${newIndex}`);
        return newIndex;
      });
    }, intervalTime);

    return () => {
      clearInterval(interval);
    };
  }, [imagesLoaded, rotationSpeed]);

  if (!imagesLoaded) {
    return (
      <div className="fixed inset-0 z-0 bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading backgrounds...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-0">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentImageIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${backgroundImages[currentImageIndex]})`,
          }}
        />
      </AnimatePresence>
      
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-500/15 to-emerald-400/10 backdrop-blur-[1px]"></div>
    </div>
  );
}
// Helper: localStorage with JSON
const lsGet = (key, fallback) => {
  try { 
    const v = localStorage.getItem(key); 
    return v ? JSON.parse(v) : fallback; 
  } catch(e){ 
    return fallback; 
  }
};

const lsSet = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};
// Perfect World Clock Component
function Clock({ currentTheme }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedCountry, setSelectedCountry] = useState('local');
  const [isExpanded, setIsExpanded] = useState(false);

  const themeGradient = colorThemes[currentTheme] || colorThemes.primary;

  // Country timezone data with proper formatting
  const countries = [
    { code: 'local', name: 'Local', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, emoji: '🏠', offset: 'NOW' },
    { code: 'US', name: 'New York', timezone: 'America/New_York', emoji: '🇺🇸', offset: '-5h' },
    { code: 'GB', name: 'London', timezone: 'Europe/London', emoji: '🇬🇧', offset: '+0h' },
    { code: 'JP', name: 'Tokyo', timezone: 'Asia/Tokyo', emoji: '🇯🇵', offset: '+9h' },
    { code: 'IN', name: 'Delhi', timezone: 'Asia/Kolkata', emoji: '🇮🇳', offset: '+5.5h' },
    { code: 'AE', name: 'Dubai', timezone: 'Asia/Dubai', emoji: '🇦🇪', offset: '+4h' },
    { code: 'SG', name: 'Singapore', timezone: 'Asia/Singapore', emoji: '🇸🇬', offset: '+8h' },
    { code: 'DE', name: 'Berlin', timezone: 'Europe/Berlin', emoji: '🇩🇪', offset: '+1h' },
    { code: 'AU', name: 'Sydney', timezone: 'Australia/Sydney', emoji: '🇦🇺', offset: '+11h' },
    { code: 'CA', name: 'Toronto', timezone: 'America/Toronto', emoji: '🇨🇦', offset: '-5h' },
    { code: 'BR', name: 'São Paulo', timezone: 'America/Sao_Paulo', emoji: '🇧🇷', offset: '-3h' },
    { code: 'ZA', name: 'Johannesburg', timezone: 'Africa/Johannesburg', emoji: '🇿🇦', offset: '+2h' }
  ];

  // Get time for specific timezone
  const getTimeForTimezone = (timezone) => {
    return new Date(currentTime.toLocaleString("en-US", { timeZone: timezone }));
  };

  const selectedCountryData = countries.find(c => c.code === selectedCountry);
  const displayTime = getTimeForTimezone(selectedCountryData.timezone);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getDayPeriod = (date) => {
    const hours = date.getHours();
    if (hours < 5) return 'Late Night';
    if (hours < 12) return 'Morning';
    if (hours < 17) return 'Afternoon';
    if (hours < 21) return 'Evening';
    return 'Night';
  };

  const getDayPeriodEmoji = (date) => {
    const hours = date.getHours();
    if (hours < 5) return '🌙';
    if (hours < 12) return '☀️';
    if (hours < 17) return '🌞';
    if (hours < 21) return '🌆';
    return '🌙';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative"
    >
      {/* Main Clock Display */}
      <div 
        className={`px-4 py-3 bg-gradient-to-r ${themeGradient} rounded-2xl shadow-lg text-white backdrop-blur-sm cursor-pointer transition-all duration-300 hover:shadow-xl ${
          isExpanded ? 'rounded-b-none' : ''
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-xl">
              {selectedCountryData.emoji}
            </div>
            <div>
              <div className="font-mono text-base font-bold tracking-wider">
                {formatTime(displayTime)}
              </div>
              <div className="text-xs opacity-90 flex items-center space-x-2">
                <span>{selectedCountryData.name}</span>
                <span>•</span>
                <span>{getDayPeriodEmoji(displayTime)} {getDayPeriod(displayTime)}</span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-xs opacity-90">
              {displayTime.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric'
              })}
            </div>
            <div className="text-xs opacity-70 mt-1">
              {isExpanded ? '▲' : '▼'} Zones
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Timezone Selector */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-full left-0 right-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-b-2xl shadow-xl border border-white/30 z-20 overflow-hidden"
          >
            <div className="p-4 max-h-80 overflow-y-auto">
              <div className="space-y-2">
                {countries.map((country) => {
                  const countryTime = getTimeForTimezone(country.timezone);
                  const timeString = formatTime(countryTime);
                  const period = getDayPeriod(countryTime);
                  const periodEmoji = getDayPeriodEmoji(countryTime);
                  
                  return (
                    <motion.button
                      key={country.code}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCountry(country.code);
                        setIsExpanded(false);
                      }}
                      className={`w-full p-3 rounded-xl text-left transition-all duration-200 ${
                        selectedCountry === country.code
                          ? 'bg-blue-100 dark:bg-blue-900/50 border-2 border-blue-500'
                          : 'bg-gray-100/80 dark:bg-gray-700/80 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        {/* Left Side - Country Info */}
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="text-lg flex-shrink-0">
                            {country.emoji}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-2">
                              <div className="font-semibold text-gray-800 dark:text-white text-sm truncate">
                                {country.name}
                              </div>
                              <div className="text-xs bg-gray-200 dark:bg-gray-600 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300 font-mono">
                                {country.code}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center space-x-1 mt-0.5">
                              <span>{periodEmoji}</span>
                              <span className="truncate">{period}</span>
                            </div>
                          </div>
                        </div>

                        {/* Right Side - Time Info */}
                        <div className="text-right flex-shrink-0 ml-3">
                          <div className="font-mono font-bold text-gray-800 dark:text-white text-sm">
                            {timeString}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                            {country.offset}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
              
              {/* Footer Info */}
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>🌍 World Clock</span>
                  <span>{countries.length} locations</span>
                  <span>Real-time</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop click to close */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/5 backdrop-blur-sm z-10"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Enhanced SearchBar with AI search engines
function SearchBar({ currentTheme }) {
  const [q, setQ] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [searchEngine, setSearchEngine] = useState('both'); // 'google', 'ai', 'both'
  
  const themeGradient = colorThemes[currentTheme] || colorThemes.primary;

  const searchEngines = {
    google: {
      name: 'Google',
      url: 'https://www.google.com/search?q=',
      icon: '🔍'
    },
    perplexity: {
      name: 'Perplexity AI',
      url: 'https://www.perplexity.ai/search?q=',
      icon: '🤖'
    },
    you: {
      name: 'You.com',
      url: 'https://you.com/search?q=',
      icon: '🌐'
    },
    phind: {
      name: 'Phind',
      url: 'https://www.phind.com/search?q=',
      icon: '💻'
    },
    bing: {
      name: 'Bing AI',
      url: 'https://www.bing.com/search?q=',
      icon: '🔵'
    }
  };
  
  const onSearch = (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    
    const enc = encodeURIComponent(q.trim());
    
    // Open searches based on selected engine
    switch(searchEngine) {
      case 'google':
        window.open(`${searchEngines.google.url}${enc}`, '_blank');
        break;
      case 'ai':
        // Open multiple AI search engines
        window.open(`${searchEngines.perplexity.url}${enc}`, '_blank');
        window.open(`${searchEngines.you.url}${enc}`, '_blank');
        window.open(`${searchEngines.phind.url}${enc}`, '_blank');
        window.open(`${searchEngines.you.url}${enc}`, '_blank');
        break;
      case 'both':
      default:
        // Open traditional + AI search
        window.open(`${searchEngines.google.url}${enc}`, '_blank');
        window.open(`${searchEngines.perplexity.url}${enc}`, '_blank');
        break;
    }
    
    setQ('');
  };

  // Quick AI search examples that work even with typos
  const quickSearches = [
    { name: 'AI', query: 'artifishal inteligence' },
    { name: 'React', query: 'rect hooks tutorial' },
    { name: 'Python', query: 'pythn data science' },
    { name: 'Space', query: 'nasa mars mission' }
  ];

  const handleQuickSearch = (query) => {
    const enc = encodeURIComponent(query);
    // AI engines will correct the spelling automatically
    window.open(`${searchEngines.perplexity.url}${enc}`, '_blank');
    window.open(`${searchEngines.you.url}${enc}`, '_blank');
  };

  const handleEngineQuickSelect = (engine) => {
    if (!q.trim()) return;
    const enc = encodeURIComponent(q.trim());
    window.open(`${searchEngines[engine].url}${enc}`, '_blank');
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="w-full max-w-4xl"
    >
      <form onSubmit={onSearch} className="mb-4">
        <div className="flex items-center gap-3">
          {/* Search Engine Selector */}
          <div className="relative">
            <select
              value={searchEngine}
              onChange={(e) => setSearchEngine(e.target.value)}
              className="appearance-none px-4 py-3 rounded-2xl bg-white/90 dark:bg-gray-800/90 border-2 border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 backdrop-blur-sm text-sm font-medium min-w-32"
            >
              <option value="both">🌐 Google + AI</option>
              <option value="google">🔍 Google Only</option>
              <option value="ai">🤖 AI Only</option>
            </select>
            <FiExternalLink className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs" />
          </div>

          {/* Search Input */}
          <div className={`flex items-center flex-1 rounded-2xl border-2 transition-all duration-300 ${
            isFocused 
              ? `border-blue-500 shadow-lg bg-white/95 dark:bg-gray-800/95` 
              : 'border-white/30 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm'
          }`}>
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={`🔍 ${
                searchEngine === 'both' ? 'Search Google + AI...' : 
                searchEngine === 'ai' ? 'Search AI engines...' : 
                'Search Google...'
              }`}
              className="flex-1 px-6 py-4 bg-transparent focus:outline-none text-lg rounded-2xl placeholder-gray-600 dark:placeholder-gray-400"
            />
            <button 
              type="submit"
              className={`p-3 m-1 rounded-xl bg-gradient-to-r ${themeGradient} text-white hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg`}
              aria-label="search"
            >
              <FiSearch size={20} />
            </button>
          </div>
        </div>
      </form>

      {/* Quick Search Shortcuts */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap gap-2 justify-center mb-3"
      >
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium mr-2">
          Try with typos:
        </span>
        {quickSearches.map((item, index) => (
          <button
            key={item.name}
            onClick={() => handleQuickSearch(item.query)}
            className="text-xs px-3 py-2 bg-white/80 dark:bg-gray-700/80 rounded-xl hover:bg-white dark:hover:bg-gray-600 transition-all duration-300 backdrop-blur-sm border border-white/30 hover:border-blue-300 shadow-sm hover:shadow-md"
          >
            {item.name}
          </button>
        ))}
      </motion.div>

      {/* AI Engine Quick Select */}
      {q.trim() && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-wrap gap-2 justify-center mb-3"
        >
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium mr-2">
            Search on:
          </span>
          {Object.entries(searchEngines).map(([key, engine]) => (
            <button
              key={key}
              onClick={() => handleEngineQuickSelect(key)}
              className="text-xs px-3 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all duration-300 backdrop-blur-sm border border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md flex items-center space-x-1"
            >
              <span>{engine.icon}</span>
              <span>{engine.name}</span>
            </button>
          ))}
        </motion.div>
      )}

      {/* Search Engine Info */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <div className="inline-flex flex-wrap justify-center gap-3 text-xs text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 rounded-2xl px-4 py-2 backdrop-blur-sm">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Google</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>Perplexity AI</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>You.com</span>
          </div>
          <div className="text-xs text-gray-400">
            • AI engines understand typos •
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Enhanced Shortcuts with dynamic theme
function Shortcuts({ shortcuts, onAdd, onRemove, currentTheme }){
  const themeGradient = colorThemes[currentTheme] || colorThemes.primary;
  
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
      {shortcuts.map((s, i) => (
        <motion.div
          key={s.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          whileHover={{ 
            scale: 1.1, 
            y: -5,
            transition: { type: "spring", stiffness: 400, damping: 17 }
          }}
          whileTap={{ scale: 0.95 }}
          className="relative group"
        >
          <a
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center p-4 bg-white/95 dark:bg-gray-800/95 rounded-2xl shadow-lg hover:shadow-2xl backdrop-blur-sm border border-white/30 transition-all duration-300"
          >
            <div className="text-3xl mb-2 transform group-hover:scale-110 transition-transform duration-300">
              {s.icon || '🔗'}
            </div>
            <div className="text-xs font-medium text-center truncate w-full text-gray-700 dark:text-gray-200">
              {s.title}
            </div>
            <FiExternalLink className="absolute top-2 right-2 text-gray-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </a>
          <button 
            onClick={(e) => { e.preventDefault(); onRemove(s.id); }}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600 shadow-lg transform scale-0 group-hover:scale-100"
          >
            <FiX />
          </button>
        </motion.div>
      ))}
      
      <motion.button 
        onClick={onAdd}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-2xl hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-300 group backdrop-blur-sm bg-white/90 dark:bg-gray-800/90`}
      >
        <FiPlus size={24} className="text-gray-400 group-hover:text-blue-500 mb-2 transition-colors duration-300" />
        <div className="text-xs text-gray-500 group-hover:text-blue-500 transition-colors duration-300">Add</div>
      </motion.button>
    </div>
  );
}

// Enhanced To-Do Panel with dynamic theme
function TodoPanel({ currentTheme }){
  const [todos, setTodos] = useState(() => lsGet('dash_todos', []));
  const [text, setText] = useState('');

  const themeGradient = colorThemes[currentTheme] || colorThemes.primary;

  // Auto-clear once per day
  useEffect(() => {
    const lastReset = localStorage.getItem('dash_last_reset');
    const today = new Date().toISOString().slice(0,10);
    if (lastReset !== today) {
      lsSet('dash_todos', []);
      localStorage.setItem('dash_last_reset', today);
      setTodos([]);
    }
  }, []);

  useEffect(() => lsSet('dash_todos', todos), [todos]);

  const add = () => {
    if (!text.trim()) return; 
    setTodos(prev => [...prev, { id: Date.now(), text: text.trim(), done: false }]); 
    setText('');
  };

  const toggle = (id) => setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const remove = (id) => setTodos(prev => prev.filter(t => t.id !== id));

  const completedCount = todos.filter(t => t.done).length;
  const totalCount = todos.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full p-8 bg-white/95 dark:bg-gray-800/95 rounded-3xl shadow-2xl backdrop-blur-sm border border-white/30"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className={`p-3 bg-gradient-to-r ${themeGradient} rounded-2xl`}>
            <FiList className="text-white text-2xl" />
          </div>
          <div>
            <h3 className="font-bold text-2xl text-gray-800 dark:text-white">Today's Tasks</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {completedCount} of {totalCount} completed
            </p>
          </div>
        </div>
        <button 
          onClick={() => { setTodos([]); }}
          className="text-base text-red-500 hover:text-red-600 transition-colors duration-200 px-4 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 font-medium"
        >
          Clear All
        </button>
      </div>

      {/* Progress Bar with Dynamic Theme */}
      {totalCount > 0 && (
        <div className="mb-8">
          <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-4">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={`bg-gradient-to-r ${themeGradient} h-4 rounded-full shadow-lg`}
            />
          </div>
        </div>
      )}

      {/* Todo List */}
      <div className="space-y-4 max-h-96 overflow-y-auto pr-3">
        {todos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">📝</div>
            <p className="text-gray-500 dark:text-gray-400 text-lg">No tasks yet. Add your first task below!</p>
          </motion.div>
        ) : (
          todos.map((t, index) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center justify-between p-5 rounded-2xl transition-all duration-300 border-2 ${
                t.done 
                  ? 'bg-green-50/80 dark:bg-green-900/30 border-green-200 dark:border-green-800' 
                  : 'bg-white/70 dark:bg-gray-700/70 border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg'
              }`}
            >
              <label className="flex items-center space-x-4 flex-1 cursor-pointer">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    checked={t.done} 
                    onChange={() => toggle(t.id)} 
                    className="sr-only"
                  />
                  <div className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${
                    t.done 
                      ? `bg-gradient-to-r ${themeGradient} border-transparent shadow-md` 
                      : 'border-gray-400 dark:border-gray-500 hover:border-blue-500 hover:scale-110'
                  }`}>
                    {t.done && <FiCheck className="text-white text-lg font-bold" />}
                  </div>
                </div>
                <span className={`select-none transition-all duration-300 text-lg ${
                  t.done 
                    ? 'line-through text-gray-500 dark:text-gray-500' 
                    : 'text-gray-800 dark:text-gray-200 font-medium'
                }`}>
                  {t.text}
                </span>
              </label>
              <button 
                onClick={() => remove(t.id)}
                className="p-2 text-gray-500 hover:text-red-500 transition-colors duration-200 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 ml-3"
              >
                <FiTrash2 size={18} />
              </button>
            </motion.div>
          ))
        )}
        
        {/* Add Task Input */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex space-x-3 pt-6"
        >
          <input 
            className="flex-1 px-5 py-4 rounded-2xl bg-white/80 dark:bg-gray-700/80 border-2 border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 text-lg shadow-lg"
            value={text} 
            onChange={e => setText(e.target.value)} 
            placeholder="✏️ What needs to be done?" 
            onKeyDown={e => e.key === 'Enter' && add()} 
          />
          <button 
            onClick={add}
            disabled={!text.trim()}
            className={`px-6 py-4 rounded-2xl bg-gradient-to-r ${themeGradient} text-white font-semibold hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg min-w-20`}
          >
            Add
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Enhanced Add Shortcut Modal with dynamic theme
function AddShortcutModal({ isOpen, onClose, onAdd, currentTheme }) {
  const [form, setForm] = useState({ title: '', url: '', icon: '🔗' });
  
  const themeGradient = colorThemes[currentTheme] || colorThemes.primary;
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.url.trim()) return;
    
    const newItem = { 
      id: Date.now(), 
      title: form.title.trim(), 
      url: form.url.trim().startsWith('http') ? form.url.trim() : `https://${form.url.trim()}`,
      icon: form.icon || '🔗'
    };
    
    onAdd(newItem);
    setForm({ title: '', url: '', icon: '🔗' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white/95 dark:bg-gray-800/95 rounded-3xl p-6 w-full max-w-md shadow-2xl backdrop-blur-sm border border-white/30"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">Add New Shortcut</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors duration-200">
            <FiX size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white/80 dark:bg-gray-700/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              placeholder="e.g., Gmail"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">URL</label>
            <input
              type="url"
              value={form.url}
              onChange={e => setForm(prev => ({ ...prev, url: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white/80 dark:bg-gray-700/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              placeholder="https://..."
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Icon (Emoji)</label>
            <input
              type="text"
              value={form.icon}
              onChange={e => setForm(prev => ({ ...prev, icon: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white/80 dark:bg-gray-700/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-center text-2xl"
              placeholder="🔗"
              maxLength={2}
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`flex-1 px-4 py-3 rounded-xl bg-gradient-to-r ${themeGradient} text-white font-medium hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg`}
            >
              Add Shortcut
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function useShortcuts() {
  const [shortcuts, setShortcuts] = useState(() => lsGet('dash_shortcuts', getDefaultShortcuts()));
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  useEffect(() => lsSet('dash_shortcuts', shortcuts), [shortcuts]);
  
  const add = (newItem) => {
    setShortcuts(prev => [newItem, ...prev]);
  };
  
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  
  const remove = (id) => setShortcuts(prev => prev.filter(s => s.id !== id));
  
  return { 
    shortcuts, 
    add, 
    remove, 
    isModalOpen, 
    openModal, 
    closeModal 
  };
}

function getDefaultShortcuts(){
  return [
    { id: 'gpt', title: 'ChatGPT', url: 'https://chat.openai.com', icon: '🤖' },
    { id: 'yt', title: 'YouTube', url: 'https://www.youtube.com', icon: '▶️' },
    { id: 'gmail', title: 'Gmail', url: 'https://mail.google.com', icon: '📧' },
    { id: 'moodle', title: 'Moodle', url: 'https://moodle.org', icon: '🎓' },
    { id: 'github', title: 'GitHub', url: 'https://github.com', icon: '🐙' },
    { id: 'docs', title: 'Google Docs', url: 'https://docs.google.com', icon: '📄' },
    { id: 'drive', title: 'Google Drive', url: 'https://drive.google.com', icon: '☁️' },
    { id: 'figma', title: 'Figma', url: 'https://figma.com', icon: '🎨' },
  ];
}

// Enhanced NewsPage with working news feeds
function NewsPage({ currentTheme }){
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('technology');
  const navigate = useNavigate();

  const themeGradient = colorThemes[currentTheme] || colorThemes.primary;

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [page]);

  const load = async () => {
    setLoading(true);
    
    try {
      // Try multiple news sources
      await fetchNewsData();
    } catch (error) {
      console.error('Error loading news:', error);
      // Fallback to sample data
      if (articles.length === 0) {
        setArticles(sampleArticles());
      }
    }
    
    setLoading(false);
  };

  const fetchNewsData = async () => {
    // Method 1: RSS Feed Parser (No API key needed)
    try {
      await fetchRSSFeeds();
      return;
    } catch (error) {
      console.log('RSS method failed, trying alternatives...');
    }

    // Method 2: Fallback to sample data
    if (articles.length === 0) {
      setArticles(sampleArticles());
    }
  };

  const fetchRSSFeeds = async () => {
    const rssFeeds = [
      {
        name: 'BBC News',
        url: 'https://feeds.bbci.co.uk/news/rss.xml',
        category: 'general'
      },
      {
        name: 'CNN',
        url: 'https://rss.cnn.com/rss/edition.rss', 
        category: 'general'
      },
      {
        name: 'TechCrunch',
        url: 'https://techcrunch.com/feed/',
        category: 'technology'
      }
    ];

    const allArticles = [];
    
    for (const feed of rssFeeds) {
      try {
        // Using a CORS proxy to avoid cross-origin issues
        const proxyUrl = 'https://api.allorigins.win/raw?url=';
        const response = await fetch(`${proxyUrl}${encodeURIComponent(feed.url)}`);
        
        if (response.ok) {
          const text = await response.text();
          const parsedArticles = parseRSSFeed(text, feed.name);
          allArticles.push(...parsedArticles);
        }
      } catch (error) {
        console.log(`Failed to fetch ${feed.name}:`, error);
      }
    }
    
    if (allArticles.length > 0) {
      // Remove duplicates and limit to 15 articles
      const uniqueArticles = allArticles
        .filter((article, index, self) => 
          index === self.findIndex(a => a.title === article.title)
        )
        .slice(0, 15);
      
      setArticles(prev => page === 1 ? uniqueArticles : [...prev, ...uniqueArticles]);
    } else {
      throw new Error('No articles found from RSS feeds');
    }
  };

  const parseRSSFeed = (rssText, sourceName) => {
    const articles = [];
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(rssText, 'text/xml');
    
    const items = xmlDoc.getElementsByTagName('item');
    
    for (let i = 0; i < Math.min(items.length, 10); i++) {
      const item = items[i];
      const title = item.getElementsByTagName('title')[0]?.textContent || 'No title';
      const link = item.getElementsByTagName('link')[0]?.textContent || '#';
      const description = item.getElementsByTagName('description')[0]?.textContent || 'No description available.';
      const pubDate = item.getElementsByTagName('pubDate')[0]?.textContent || new Date().toISOString();
      
      // Extract image from description or use placeholder
      const imageMatch = description.match(/<img[^>]+src="([^">]+)"/);
      const imageUrl = imageMatch ? imageMatch[1] : getPlaceholderImage();
      
      articles.push({
        title: title.replace(/<[^>]*>/g, ''), // Remove HTML tags
        url: link,
        description: description.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
        publishedAt: pubDate,
        source: { name: sourceName },
        urlToImage: imageUrl
      });
    }
    
    return articles;
  };

  const getPlaceholderImage = () => {
    const placeholders = [
      'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=400&h=300&fit=crop'
    ];
    return placeholders[Math.floor(Math.random() * placeholders.length)];
  };

  const handleSearch = () => {
    setArticles([]);
    setPage(1);
    load();
  };

  // Enhanced sample articles with better data
  function sampleArticles() {
    const sampleNews = [
      { 
        title: 'AI Breakthrough: New Model Achieves Human-Level Reasoning', 
        url: 'https://example.com/ai-breakthrough', 
        source: { name: 'Tech News' }, 
        publishedAt: new Date().toISOString(), 
        description: 'Researchers have developed a new artificial intelligence system that demonstrates unprecedented reasoning capabilities, marking a significant milestone in AI development.',
        urlToImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop'
      },
      { 
        title: 'Web Development Trends 2024: What to Expect', 
        url: 'https://example.com/web-dev-trends', 
        source: { name: 'Dev Weekly' }, 
        publishedAt: new Date(Date.now() - 2 * 86400000).toISOString(), 
        description: 'From advanced frameworks to new programming paradigms, explore the technologies that will shape web development in the coming year.',
        urlToImage: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=300&fit=crop'
      },
      { 
        title: 'Renewable Energy Investments Reach Record High', 
        url: 'https://example.com/energy-investments', 
        source: { name: 'Green Tech' }, 
        publishedAt: new Date(Date.now() - 86400000).toISOString(), 
        description: 'Global investments in renewable energy sources have surpassed all previous records, signaling a major shift towards sustainable power generation worldwide.',
        urlToImage: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400&h=300&fit=crop'
      },
      { 
        title: 'Space Exploration: New Mission to Study Jupiter Moons', 
        url: 'https://example.com/space-mission', 
        source: { name: 'Space Daily' }, 
        publishedAt: new Date(Date.now() - 3 * 86400000).toISOString(), 
        description: 'International space agencies collaborate on ambitious mission to explore the icy moons of Jupiter, searching for signs of extraterrestrial life.',
        urlToImage: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=300&fit=crop'
      },
      { 
        title: 'Healthcare Technology Revolutionizes Patient Care', 
        url: 'https://example.com/healthcare-tech', 
        source: { name: 'Medical Innovations' }, 
        publishedAt: new Date(Date.now() - 4 * 86400000).toISOString(), 
        description: 'Advanced technologies including AI diagnostics and telemedicine are transforming healthcare delivery and improving patient outcomes globally.',
        urlToImage: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop'
      }
    ];
    
    // Add more variety
    const additionalNews = [
      'Global Markets Show Strong Recovery Signs',
      'Climate Summit Reaches Historic Agreement',
      'Breakthrough in Quantum Computing Announced',
      'New Educational Platform Transforms Online Learning',
      'Automotive Industry Shifts to Electric Vehicles',
      'Cybersecurity Measures Enhanced Amid Rising Threats',
      'Sustainable Agriculture Practices Gain Traction',
      'Virtual Reality Transforms Entertainment Industry'
    ];
    
    additionalNews.forEach((title, index) => {
      sampleNews.push({
        title,
        url: `https://example.com/news-${index}`,
        source: { name: ['World News', 'Business Daily', 'Tech Review', 'Science Journal'][index % 4] },
        publishedAt: new Date(Date.now() - (index + 5) * 86400000).toISOString(),
        description: `This is a sample article about ${title.toLowerCase()}. It demonstrates the news feed functionality with engaging content and relevant information.`,
        urlToImage: getPlaceholderImage()
      });
    });
    
    return sampleNews;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen"
    >
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-white/20">
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r ${themeGradient} text-white font-medium hover:opacity-90 transition-all duration-300 shadow-md`}
            >
              <FiHome size={18} />
              <span>Back to Dashboard</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white/80 dark:bg-gray-700/80 px-4 py-2 rounded-2xl shadow-sm backdrop-blur-sm">
                <FiStar className="text-yellow-500" />
                <span className="font-medium">News Feed</span>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                  Live
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 mt-4">
            <div className="flex-1 relative">
              <input 
                value={q} 
                onChange={e => setQ(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="w-full px-6 py-4 rounded-2xl border border-white/30 bg-white/80 dark:bg-gray-700/80 focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-300 text-lg shadow-sm backdrop-blur-sm" 
                placeholder="🔍 Search for technology, science, business..."
              />
            </div>
            <button 
              onClick={handleSearch}
              disabled={loading}
              className={`px-6 py-4 rounded-2xl bg-gradient-to-r ${themeGradient} text-white font-medium hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
      </div>

      {/* News Content */}
      <div className="relative z-10 w-full px-6 py-8">
        {/* News Stats */}
        <div className="flex items-center justify-between mb-6 px-2">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {articles.length} articles
          </div>
          <div className="text-xs px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
            Updated just now
          </div>
        </div>

        <AnimatePresence>
          <div className="space-y-6">
            {articles.map((a, i) => (
              <motion.a
                key={`${a.url}-${i}`}
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ 
                  scale: 1.02,
                  transition: { type: "spring", stiffness: 400, damping: 17 }
                }}
                className="block p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl border border-white/30 transition-all duration-300 group"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-6">
                    <h4 className="font-bold text-lg text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 line-clamp-2">
                      {a.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 flex items-center space-x-2">
                      <span className="font-medium">{a.source?.name}</span>
                      <span>•</span>
                      <span>{new Date(a.publishedAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                        {a.source?.name.includes('Tech') ? 'Technology' : 'General'}
                      </span>
                    </p>
                    <p className="mt-3 text-gray-700 dark:text-gray-300 line-clamp-3">
                      {a.description}
                    </p>
                    <div className="flex items-center space-x-2 mt-4">
                      <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                        Read Full Story
                      </span>
                      <FiExternalLink className="text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
                    </div>
                  </div>
                  {a.urlToImage && (
                    <img 
                      src={a.urlToImage} 
                      alt={a.title}
                      className="w-32 h-24 object-cover rounded-2xl ml-4 shadow-md group-hover:shadow-lg transition-shadow duration-300" 
                      onError={(e) => {
                        e.target.src = getPlaceholderImage();
                      }}
                    />
                  )}
                </div>
              </motion.a>
            ))}
          </div>
        </AnimatePresence>
        
        {loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center space-x-3 px-6 py-4 bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-lg backdrop-blur-sm">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
              <span className="text-gray-700 dark:text-gray-300 font-medium">Loading latest news...</span>
            </div>
          </div>
        )}
        
        {!loading && articles.length === 0 && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto bg-white/90 dark:bg-gray-800/90 rounded-3xl p-8 backdrop-blur-sm shadow-lg">
              <div className="text-6xl mb-4">📰</div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">News Feed Ready</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Click the search button to load the latest news articles.
              </p>
              <button 
                onClick={load}
                className={`px-6 py-3 rounded-xl bg-gradient-to-r ${themeGradient} text-white font-medium hover:opacity-90 transition-all duration-300`}
              >
                Load News
              </button>
            </div>
          </div>
        )}

        {/* Load More Button */}
        {articles.length > 0 && !loading && (
          <div className="text-center mt-8">
            <button 
              onClick={() => setPage(prev => prev + 1)}
              className={`px-6 py-3 rounded-xl bg-gradient-to-r ${themeGradient} text-white font-medium hover:opacity-90 transition-all duration-300 shadow-md`}
            >
              Load More Articles
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Main Dashboard page - Updated to accept settings props
function Dashboard({ currentTheme, settings, updateSetting }){
  const { shortcuts, add, remove, isModalOpen, openModal, closeModal } = useShortcuts();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  return (
    <>
      {/* BackgroundSlideshow is handled in App component */}
      <AnimatePresence>
        {isModalOpen && (
          <AddShortcutModal 
            isOpen={isModalOpen} 
            onClose={closeModal} 
            onAdd={add}
            currentTheme={currentTheme}
          />
        )}
      </AnimatePresence>

      {/* Settings Modal - UPDATED with settings props */}
      <AnimatePresence>
        {isSettingsOpen && (
          <SettingsModal 
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            settings={settings}  // Add this line
            updateSetting={updateSetting}  // Add this line
          />
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen w-full relative z-10"
      >
        <div className="w-full min-h-screen px-6 py-6">
          {/* Header */}
          <motion.header 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex-1 max-w-2xl">
              <SearchBar currentTheme={currentTheme} />
            </div>
            <div className="flex items-center gap-4">
              <Clock currentTheme={currentTheme} />
              <Link 
                to="/news" 
                className={`flex items-center space-x-2 px-4 py-3 rounded-2xl bg-gradient-to-r ${colorThemes[currentTheme] || colorThemes.primary} text-white font-medium hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg`}
              >
                <FiStar size={18} />
                <span>News Feed</span>
              </Link>
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-3 rounded-2xl bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 hover:bg-white dark:hover:bg-gray-600 group"
              >
                <FiSettings size={20} className="text-gray-600 dark:text-gray-300 group-hover:scale-110 transition-transform duration-200" />
              </button>
            </div>
          </motion.header>

          {/* Shortcuts Section */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Your Shortcuts</h3>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {shortcuts.length} shortcuts
              </div>
            </div>
            <Shortcuts shortcuts={shortcuts} onAdd={openModal} onRemove={remove} currentTheme={currentTheme} />
          </motion.section>

          {/* Main Content - Wide Todo Panel */}
          <div className="grid grid-cols-1 xl:grid-cols-1 gap-8">
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="xl:col-span-3"
            >
              <TodoPanel currentTheme={currentTheme} />
            </motion.aside>
          </div>
        </div>
      </motion.div>
    </>
  );
}
export default function App(){
  const { settings, updateSetting } = useSettings();
  
  const handleThemeChange = useCallback((theme) => {
    console.log('App: Theme changed to', theme);
    updateSetting('themeColor', theme);
  }, [updateSetting]);

  const handleDarkModeChange = useCallback((mode) => {
    updateSetting('darkMode', mode);
  }, [updateSetting]);

  // Apply settings on app start only
  useEffect(() => {
    console.log('App: Initial settings applied', settings);
    
    // Apply dark mode
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Apply font size
    document.documentElement.style.fontSize = 
      settings.fontSize === 'small' ? '14px' :
      settings.fontSize === 'large' ? '18px' : '16px';
      
    // Ensure theme is applied on startup
    if (settings.themeColor) {
      console.log('App: Initial theme applied:', settings.themeColor);
    }
  }, []); // Empty dependency array - run only once on mount

  return (
    <Router>
      <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <BackgroundSlideshow onThemeChange={handleThemeChange} />
        <Routes>
          <Route path="/" element={
            <Dashboard 
              currentTheme={settings.themeColor} 
              onThemeChange={handleThemeChange}
              darkMode={settings.darkMode}
              onDarkModeChange={handleDarkModeChange}
              settings={settings}
              updateSetting={updateSetting}
            />
          } />
          <Route path="/news" element={<NewsPage currentTheme={settings.themeColor} />} />
        </Routes>
      </div>
    </Router>
  );
}