import { useState, useEffect } from 'react';
import { Sun, Moon, Monitor, Type, AlignLeft, Ruler, Eye } from 'lucide-react';
import { getSettings, saveSettings } from '../utils/storage';

export default function Settings() {
  const [settings, setSettings] = useState(getSettings());

  useEffect(() => {
    const saved = getSettings();
    setSettings(saved);
  }, []);

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveSettings(newSettings);
    
    if (key === 'theme') {
      if (value === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (value === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
      }
    }
  };

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  const maxWidthOptions = [
    { value: '45ch', label: 'Narrow' },
    { value: '55ch', label: 'Medium' },
    { value: '65ch', label: 'Wide' },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-serif font-semibold mb-8">Settings</h1>

      <div className="space-y-6">
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-sm font-medium text-muted-foreground mb-4">Theme</h2>
          <div className="grid grid-cols-3 gap-2">
            {themeOptions.map(({ value, label, icon: Icon }) => (
              <button key={value} onClick={() => updateSetting('theme', value)} className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${settings.theme === value ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-border hover:bg-muted'}`}>
                <Icon size={20} /><span className="text-sm">{label}</span>
                {settings.theme === value && <span className="w-2 h-2 rounded-full bg-primary-500" />}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2"><Type size={16} />Font Size</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm">A</span>
            <input type="range" min={14} max={20} value={settings.fontSize} onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))} className="flex-1 accent-primary-500" />
            <span className="text-lg">A</span>
            <span className="text-sm text-muted-foreground min-w-[2.5rem] text-center">{settings.fontSize}px</span>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2"><AlignLeft size={16} />Line Height</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm">Compact</span>
            <input type="range" min={1.5} max={2.0} step={0.1} value={settings.lineHeight} onChange={(e) => updateSetting('lineHeight', parseFloat(e.target.value))} className="flex-1 accent-primary-500" />
            <span className="text-sm">Spacious</span>
            <span className="text-sm text-muted-foreground min-w-[2.5rem] text-center">{settings.lineHeight.toFixed(1)}</span>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2"><Ruler size={16} />Reading Width</h2>
          <div className="grid grid-cols-3 gap-2">
            {maxWidthOptions.map(({ value, label }) => (
              <button key={value} onClick={() => updateSetting('maxWidth', value)} className={`p-3 rounded-xl border transition-all ${settings.maxWidth === value ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-border hover:bg-muted'}`}>
                <span className="text-sm">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2"><Eye size={16} />Display</h2>
          <label className="flex items-center justify-between cursor-pointer">
            <span>Show verse numbers</span>
            <div className="relative inline-flex items-center">
              <input type="checkbox" checked={settings.showVerseNumbers} onChange={(e) => updateSetting('showVerseNumbers', e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary-500 peer-focus:ring-2 peer-focus:ring-primary-500/20 transition-colors">
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${settings.showVerseNumbers ? 'translate-x-5' : ''}`} />
              </div>
            </div>
          </label>
        </div>
      </div>

      <div className="mt-8 p-4 bg-muted rounded-xl text-sm text-muted-foreground">
        <p>Settings are saved locally in your browser.</p>
      </div>
    </div>
  );
}
