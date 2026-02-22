'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import TopNav from '@/components/TopNav'
import { useToast } from '@/components/ui/ToastContext'
import { useTheme } from '@/components/ThemeProvider'
import { Check } from 'lucide-react'

function IOSToggle({ checked, onChange }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
      <div className="w-[51px] h-[31px] bg-gray-300 rounded-full peer peer-checked:bg-[#34C759] transition-colors duration-200 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-[27px] after:w-[27px] after:transition-all after:duration-200 after:shadow-md peer-checked:after:translate-x-[20px]"></div>
    </label>
  )
}

function SectionHeader({ title }) {
  return <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2 mt-6">{title}</p>
}

function SettingsRow({ label, children, last = false }) {
  return (
    <div className={`flex items-center justify-between px-4 py-3.5 bg-white ${!last ? 'border-b border-gray-100' : ''}`}>
      <span className="text-[15px] text-gray-900 font-medium">{label}</span>
      <div className="flex-shrink-0 ml-4">{children}</div>
    </div>
  )
}
export default function SettingsPage() {
  const { addToast } = useToast()
  const { setTheme } = useTheme()
  const [saveState, setSaveState] = useState('idle')
  const [settings, setSettings] = useState({
    profile: { name: 'Admin User', email: 'admin@elroi.com', role: 'System Administrator', phone: '+1 234 567 8900' },
    notifications: { emailAlerts: true, smsAlerts: false, pushNotifications: true, alertFrequency: 'immediate' },
    preferences: { theme: 'light', language: 'en', timezone: 'UTC', dateFormat: 'MM/DD/YYYY' }
  })

  useEffect(() => {
    const saved = localStorage.getItem('appSettings')
    if (saved) {
      try { setSettings(JSON.parse(saved)) } catch (e) { console.error(e) }
    }
  }, [])

  const handleSave = () => {
    setSaveState('saving')
    localStorage.setItem('appSettings', JSON.stringify(settings))
    setTheme(settings.preferences.theme)
    setTimeout(() => {
      setSaveState('saved')
      addToast('Settings saved successfully!', 'success')
      setTimeout(() => setSaveState('idle'), 2000)
    }, 400)
  }

  const updateProfile = (field, value) => setSettings(prev => ({ ...prev, profile: { ...prev.profile, [field]: value } }))
  const updateNotifications = (field, value) => setSettings(prev => ({ ...prev, notifications: { ...prev.notifications, [field]: value } }))
  const updatePreferences = (field, value) => setSettings(prev => ({ ...prev, preferences: { ...prev.preferences, [field]: value } }))

  const selectClass = "text-[15px] text-gray-500 bg-transparent border-none outline-none text-right appearance-none cursor-pointer"
  const inputClass = "text-[15px] text-gray-500 bg-transparent border-none outline-none text-right w-40 placeholder-gray-300"

  return (
    <div className="flex min-h-screen bg-[#F2F2F7]">
      <Sidebar activeSection="settings" />

      <div className="flex-1 flex flex-col">
        <TopNav title="Settings" />

        <div className="flex-1 overflow-y-auto pb-28 md:pb-8">
          <div className="max-w-2xl mx-auto md:max-w-3xl">

            {/* Profile Card */}
            <div className="px-4 mt-6">
              <div className="bg-white rounded-2xl flex items-center gap-4 p-4">
                <div className="w-14 h-14 rounded-full bg-[#0B1E4A] flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xl font-bold">
                    {settings.profile.name.charAt(0)}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-base truncate">{settings.profile.name}</p>
                  <p className="text-gray-400 text-sm truncate">{settings.profile.email}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{settings.profile.role}</p>
                </div>
              </div>
            </div>
            {/* Account Section */}
            <SectionHeader title="Account" />
            <div className="px-4">
              <div className="rounded-2xl overflow-hidden">
                <SettingsRow label="Full Name">
                  <input type="text" value={settings.profile.name} onChange={(e) => updateProfile('name', e.target.value)} className={inputClass} />
                </SettingsRow>
                <SettingsRow label="Email">
                  <input type="email" value={settings.profile.email} onChange={(e) => updateProfile('email', e.target.value)} className={inputClass} />
                </SettingsRow>
                <SettingsRow label="Role">
                  <input type="text" value={settings.profile.role} onChange={(e) => updateProfile('role', e.target.value)} className={inputClass} />
                </SettingsRow>
                <SettingsRow label="Phone" last>
                  <input type="tel" value={settings.profile.phone} onChange={(e) => updateProfile('phone', e.target.value)} className={inputClass} />
                </SettingsRow>
              </div>
            </div>

            {/* Notifications Section */}
            <SectionHeader title="Notifications" />
            <div className="px-4">
              <div className="rounded-2xl overflow-hidden">
                <SettingsRow label="Email Alerts">
                  <IOSToggle checked={settings.notifications.emailAlerts} onChange={(v) => updateNotifications('emailAlerts', v)} />
                </SettingsRow>
                <SettingsRow label="SMS Alerts">
                  <IOSToggle checked={settings.notifications.smsAlerts} onChange={(v) => updateNotifications('smsAlerts', v)} />
                </SettingsRow>
                <SettingsRow label="Push Notifications">
                  <IOSToggle checked={settings.notifications.pushNotifications} onChange={(v) => updateNotifications('pushNotifications', v)} />
                </SettingsRow>
                <SettingsRow label="Alert Frequency" last>
                  <select value={settings.notifications.alertFrequency} onChange={(e) => updateNotifications('alertFrequency', e.target.value)} className={selectClass}>
                    <option value="immediate">Immediate</option>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </SettingsRow>
              </div>
            </div>
            {/* Preferences Section */}
            <SectionHeader title="Preferences" />
            <div className="px-4">
              <div className="rounded-2xl overflow-hidden">
                <SettingsRow label="Theme">
                  <select value={settings.preferences.theme} onChange={(e) => updatePreferences('theme', e.target.value)} className={selectClass}>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                </SettingsRow>
                <SettingsRow label="Language">
                  <select value={settings.preferences.language} onChange={(e) => updatePreferences('language', e.target.value)} className={selectClass}>
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </SettingsRow>
                <SettingsRow label="Timezone">
                  <select value={settings.preferences.timezone} onChange={(e) => updatePreferences('timezone', e.target.value)} className={selectClass}>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern</option>
                    <option value="America/Chicago">Central</option>
                    <option value="America/Denver">Mountain</option>
                    <option value="America/Los_Angeles">Pacific</option>
                  </select>
                </SettingsRow>
                <SettingsRow label="Date Format" last>
                  <select value={settings.preferences.dateFormat} onChange={(e) => updatePreferences('dateFormat', e.target.value)} className={selectClass}>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </SettingsRow>
              </div>
            </div>
            {/* Security Section */}
            <SectionHeader title="Security" />
            <div className="px-4">
              <div className="rounded-2xl overflow-hidden">
                <button className="w-full flex items-center justify-between px-4 py-3.5 bg-white active:bg-gray-50 transition-colors">
                  <span className="text-[15px] text-gray-900 font-medium">Change Password</span>
                  <svg className="h-4 w-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Save Button */}
            <div className="px-4 mt-8 mb-4">
              <button
                onClick={handleSave}
                disabled={saveState === 'saving'}
                className={`w-full py-4 font-semibold text-base rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-[0.98] ${saveState === 'saved' ? 'bg-[#34C759] text-white' : 'bg-[#007AFF] text-white'} ${saveState === 'saving' ? 'opacity-70' : ''}`}
              >
                {saveState === 'saved' ? (
                  <><Check className="w-5 h-5" />Saved!</>
                ) : saveState === 'saving' ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
                ) : 'Save Changes'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
