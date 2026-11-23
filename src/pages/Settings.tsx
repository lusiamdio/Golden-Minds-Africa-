import React, { useState } from 'react';
import { Bell, Lock, Eye, Globe, Moon, Sun, Monitor, Save, Loader2, Shield, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../contexts/ThemeContext';

type SettingsTab = 'notifications' | 'privacy' | 'appearance' | 'language' | 'contact';

export default function Settings() {
  const [activeSection, setActiveSection] = useState<SettingsTab>('notifications');
  const [isSaving, setIsSaving] = useState(false);
  const { theme, setTheme } = useTheme();

  const [prefs, setPrefs] = useState(() => {
    try {
      const saved = localStorage.getItem('gma_user_settings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      emailNotifications: true,
      pushNotifications: true,
      mentorshipAlerts: true,
      profileVisibility: 'fellows',
      showEmailPublicly: false,
      twoFactorReminders: true,
      language: 'en',
      timezone: 'Africa/Johannesburg',
    };
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('gma_user_settings', JSON.stringify(prefs));
    } catch {}
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Settings saved successfully.');
    }, 500);
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
          {[
            { id: 'notifications' as const, label: 'Notifications', icon: Bell },
            { id: 'privacy' as const, label: 'Privacy & Security', icon: Lock },
            { id: 'appearance' as const, label: 'Appearance', icon: Eye },
            { id: 'language' as const, label: 'Language & Region', icon: Globe },
            { id: 'contact' as const, label: 'Contact Secretariat', icon: Mail },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-xl font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white font-semibold'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50'
                }`}
              >
                <Icon className="w-5 h-5" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Settings Content */}
        <div className="md:col-span-3 space-y-6">
          {activeSection === 'notifications' && (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 p-6 sm:p-8">
              <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Notification Preferences</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Email Notifications</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">Receive daily summaries and important updates.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={prefs.emailNotifications}
                      onChange={(e) => setPrefs((p: any) => ({ ...p, emailNotifications: e.target.checked }))}
                    />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-zinc-800 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#5A5A40]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5A5A40]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Push Notifications</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">Get real-time alerts for messages and events.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={prefs.pushNotifications}
                      onChange={(e) => setPrefs((p: any) => ({ ...p, pushNotifications: e.target.checked }))}
                    />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-zinc-800 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#5A5A40]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5A5A40]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Mentorship Alerts</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-normal">Notifications about your mentoring sessions.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={prefs.mentorshipAlerts}
                      onChange={(e) => setPrefs((p: any) => ({ ...p, mentorshipAlerts: e.target.checked }))}
                    />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-zinc-800 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#5A5A40]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5A5A40]"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'privacy' && (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#5A5A40] dark:text-[#cca568]" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Privacy & Security</h2>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Directory Visibility</label>
                  <select
                    value={prefs.profileVisibility}
                    onChange={(e) => setPrefs((p: any) => ({ ...p, profileVisibility: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-gray-900 dark:text-white"
                  >
                    <option value="public">Public Showcase Directory</option>
                    <option value="fellows">Fellowship Cohort Only</option>
                    <option value="private">Private (Administrators Only)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Display Email on Fellow Profile</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Allow accredited fellows and mentors to view your email address.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={prefs.showEmailPublicly}
                      onChange={(e) => setPrefs((p: any) => ({ ...p, showEmailPublicly: e.target.checked }))}
                    />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5A5A40]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Session Security Alerts</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Alert me when new devices sign into my fellowship account.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={prefs.twoFactorReminders}
                      onChange={(e) => setPrefs((p: any) => ({ ...p, twoFactorReminders: e.target.checked }))}
                    />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-zinc-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5A5A40]"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'appearance' && (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 p-6 sm:p-8">
              <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Appearance</h2>
              <div className="grid grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`flex flex-col items-center gap-3 p-4 border-2 rounded-xl transition-all cursor-pointer ${theme === 'light' ? 'border-[#5A5A40] bg-gray-50 dark:bg-zinc-800 text-[#5A5A40] dark:text-white' : 'border-transparent hover:border-gray-200 dark:hover:border-[#5A5A40]/30 text-gray-700 dark:text-gray-300'}`}
                >
                  <Sun className="w-6 h-6" />
                  <span className="text-sm font-medium">Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`flex flex-col items-center gap-3 p-4 border-2 rounded-xl transition-all cursor-pointer ${theme === 'dark' ? 'border-[#cca568] bg-zinc-800 text-[#cca568]' : 'border-transparent hover:border-gray-200 dark:hover:border-zinc-700 text-gray-700 dark:text-gray-300'}`}
                >
                  <Moon className="w-6 h-6" />
                  <span className="text-sm font-medium">Dark</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    setTheme(prefersDark ? 'dark' : 'light');
                  }}
                  className="flex flex-col items-center gap-3 p-4 border-2 border-transparent hover:border-gray-200 dark:hover:border-zinc-700 text-gray-700 dark:text-gray-300 rounded-xl cursor-pointer"
                >
                  <Monitor className="w-6 h-6" />
                  <span className="text-sm font-medium">System</span>
                </button>
              </div>
            </div>
          )}

          {activeSection === 'language' && (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 p-6 sm:p-8 space-y-5">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Language & Region</h2>
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Primary Language</label>
                <select
                  value={prefs.language}
                  onChange={(e) => setPrefs((p: any) => ({ ...p, language: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-gray-900 dark:text-white"
                >
                  <option value="en">English (Continental Standard)</option>
                  <option value="fr">Français</option>
                  <option value="pt">Português</option>
                  <option value="ar">العربية</option>
                  <option value="sw">Kiswahili</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Time Zone</label>
                <select
                  value={prefs.timezone}
                  onChange={(e) => setPrefs((p: any) => ({ ...p, timezone: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-sm text-gray-900 dark:text-white"
                >
                  <option value="Africa/Johannesburg">SAST (Johannesburg / Kigali / Harare)</option>
                  <option value="Africa/Lagos">WAT (Lagos / Abuja / Kinshasa)</option>
                  <option value="Africa/Nairobi">EAT (Nairobi / Addis Ababa / Kampala)</option>
                  <option value="Africa/Accra">GMT (Accra / Dakar)</option>
                  <option value="Africa/Cairo">EET (Cairo)</option>
                </select>
              </div>
            </div>
          )}

          {activeSection === 'contact' && (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 p-6 sm:p-8 space-y-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Secretariat & Official Contact Desks</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Connect directly with the Golden Minds Africa offices below.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    title: 'Protocol & Diplomatic Affairs',
                    email: 'protocol@goldenmindsafrica.co.za',
                    desc: 'Official delegations, summits, and diplomatic matters.'
                  },
                  {
                    title: 'General Enquiries',
                    email: 'enquire@goldenmindsafrica.co.za',
                    desc: 'Fellowship support, accreditation, and general inquiries.'
                  },
                  {
                    title: 'Continental Chapters',
                    email: 'chapters@goldenmindsafrica.co.za',
                    desc: 'National chapters, local hubs, and chapter coordination.'
                  },
                  {
                    title: 'Partnerships & Alliances',
                    email: 'partnership@goldenmindsafrica.co.za',
                    desc: 'Institutional alliances, sponsors, and MoU requests.'
                  },
                ].map((item) => (
                  <a
                    key={item.email}
                    href={`mailto:${item.email}`}
                    className="p-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/60 hover:border-[#cca568] transition-colors block"
                  >
                    <p className="text-xs font-bold uppercase tracking-wider text-[#5A5A40] dark:text-[#cca568]">{item.title}</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1 break-all">{item.email}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">{item.desc}</p>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
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
