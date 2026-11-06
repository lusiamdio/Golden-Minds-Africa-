import React, { useState } from 'react';
import { Bell, Lock, Eye, Globe, Moon, Sun, Monitor, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../contexts/ThemeContext';

export default function Settings() {
  const [isSaving, setIsSaving] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleSave = async () => {
    setIsSaving(true);
    // Mock save operation
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Settings saved successfully.');
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold font-serif mb-2 text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Manage your account preferences and application settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8">
        {/* Settings Navigation */}
        <div className="md:col-span-1 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-left bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white rounded-xl font-medium">
            <Bell className="w-5 h-5" /> Notifications
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50 rounded-xl font-medium transition-colors">
            <Lock className="w-5 h-5" /> Privacy & Security
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50 rounded-xl font-medium transition-colors">
            <Eye className="w-5 h-5" /> Appearance
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50 rounded-xl font-medium transition-colors">
            <Globe className="w-5 h-5" /> Language & Region
          </button>
        </div>

        {/* Settings Content */}
        <div className="md:col-span-3 space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Notification Preferences</h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Email Notifications</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">Receive daily summaries and important updates.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-zinc-800 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#5A5A40]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5A5A40]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Push Notifications</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">Get real-time alerts for messages and events.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-zinc-800 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#5A5A40]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5A5A40]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Mentorship Alerts</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">Notifications about your mentoring sessions.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-zinc-800 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#5A5A40]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5A5A40]"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 p-6 sm:p-8">
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Appearance</h2>
            
            <div className="grid grid-cols-3 gap-4">
              <button 
                onClick={() => setTheme('light')}
                className={`flex flex-col items-center gap-3 p-4 border-2 rounded-xl transition-all cursor-pointer ${theme === 'light' ? 'border-[#5A5A40] bg-gray-50 dark:bg-zinc-800 text-[#5A5A40] dark:text-white' : 'border-transparent hover:border-gray-200 dark:hover:border-[#5A5A40]/30 text-gray-700 dark:text-gray-300'}`}
              >
                <Sun className="w-6 h-6" />
                <span className="text-sm font-medium">Light</span>
              </button>
              <button 
                onClick={() => setTheme('dark')}
                className={`flex flex-col items-center gap-3 p-4 border-2 rounded-xl transition-all cursor-pointer ${theme === 'dark' ? 'border-[#cca568] bg-zinc-800 text-[#cca568]' : 'border-transparent hover:border-gray-200 dark:hover:border-zinc-700 text-gray-700 dark:text-gray-300'}`}
              >
                <Moon className="w-6 h-6" />
                <span className="text-sm font-medium">Dark</span>
              </button>
              <button 
                onClick={() => {
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  setTheme(prefersDark ? 'dark' : 'light');
                }}
                className="flex flex-col items-center gap-3 p-4 border-2 border-transparent hover:border-gray-200 dark:hover:border-zinc-750 text-gray-700 dark:text-gray-300 rounded-xl cursor-pointer"
              >
                <Monitor className="w-6 h-6" />
                <span className="text-sm font-medium">System</span>
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#5A5A40] dark:bg-amber-600 text-white rounded-xl font-medium hover:bg-[#4A4A30] dark:hover:bg-amber-700 transition-colors disabled:opacity-70 cursor-pointer"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
