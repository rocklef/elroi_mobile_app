'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import TopNav from '@/components/TopNav'
import { useToast } from '@/components/ui/ToastContext'

export default function AlertsPage() {
  const { addToast } = useToast()
  const [activeTab, setActiveTab] = useState('history')
  const [alertHistory, setAlertHistory] = useState([])
  const [alertConfig, setAlertConfig] = useState({
    leadTimeMinutes: 15,
    customMessage: '',
    thresholdTemp: 31.7,
    currentTemp: 35.2,
    recipients: [
      {
        name: 'Admin',
        position: 'System Administrator',
        email: 'tb2138@srmist.edu.in'
      }
    ]
  })
  const [editingRecipient, setEditingRecipient] = useState(null)
  const [newRecipient, setNewRecipient] = useState({ name: '', position: '', email: '' })
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    const savedHistory = localStorage.getItem('alertHistory')
    if (savedHistory) {
      try { setAlertHistory(JSON.parse(savedHistory)) } catch (e) { console.error(e) }
    }

    const savedConfig = localStorage.getItem('alertConfig')
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig)
        if (config.emails && !config.recipients) {
          config.recipients = config.emails.map(email => ({
            name: email.split('@')[0], position: '', email
          }))
          delete config.emails
        }
        setAlertConfig(config)
      } catch (e) { console.error(e) }
    } else {
      const defaultConfig = {
        leadTimeMinutes: 15, customMessage: '', thresholdTemp: 31.7, currentTemp: 35.2,
        recipients: [{ name: 'Admin', position: 'System Administrator', email: 'tb2138@srmist.edu.in' }]
      }
      localStorage.setItem('alertConfig', JSON.stringify(defaultConfig))
    }
  }, [])

  const saveConfig = () => {
    localStorage.setItem('alertConfig', JSON.stringify(alertConfig))
    addToast('Configuration saved successfully!', 'success')
  }

  const handleAddRecipient = () => {
    if (!newRecipient.name.trim() || !newRecipient.email.trim()) {
      addToast('Please fill in Name and Email fields', 'warning')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newRecipient.email)) {
      addToast('Please enter a valid email address', 'warning')
      return
    }
    if (alertConfig.recipients.some(r => r.email === newRecipient.email)) {
      addToast('This email already exists', 'warning')
      return
    }
    setAlertConfig(prev => ({ ...prev, recipients: [...prev.recipients, { ...newRecipient }] }))
    setNewRecipient({ name: '', position: '', email: '' })
    setShowAddForm(false)
  }

  const handleUpdateRecipient = (index, updatedRecipient) => {
    const updated = [...alertConfig.recipients]
    updated[index] = updatedRecipient
    setAlertConfig(prev => ({ ...prev, recipients: updated }))
  }

  const handleDeleteRecipient = (index) => {
    if (window.confirm('Remove this recipient?')) {
      setAlertConfig(prev => ({ ...prev, recipients: prev.recipients.filter((_, i) => i !== index) }))
    }
  }

  const handleResendAlert = async (recipient) => {
    try {
      const response = await fetch('/api/send-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emails: [recipient.email],
          currentTemp: alertConfig.currentTemp,
          threshold: alertConfig.thresholdTemp,
          etaMinutes: 12,
          customMessage: alertConfig.customMessage,
          recipientNames: [recipient.name],
          isDanger: alertConfig.currentTemp <= alertConfig.thresholdTemp
        })
      })
      const data = await response.json()
      if (data.success) {
        const history = JSON.parse(localStorage.getItem('alertHistory') || '[]')
        history.push({
          email: recipient.email, name: recipient.name,
          currentTemp: alertConfig.currentTemp, threshold: alertConfig.thresholdTemp,
          etaMinutes: 12, customMessage: alertConfig.customMessage,
          timestamp: new Date().toLocaleString()
        })
        localStorage.setItem('alertHistory', JSON.stringify(history))
        setAlertHistory(history)
        addToast('Alert sent successfully', 'success', 'send')
      }
    } catch (error) {
      console.error('Error resending alert:', error)
      addToast('Failed to send alert', 'error')
    }
  }

  const handleClearHistory = () => {
    if (window.confirm('Clear all alert history?')) {
      setAlertHistory([])
      localStorage.removeItem('alertHistory')
    }
  }

  return (
    <div className="flex h-screen bg-[#F2F2F7]">
      <Sidebar activeSection="alerts" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav title="Alerts" />

        <div className="flex-1 overflow-auto pb-28 md:pb-6">
          <div className="max-w-2xl mx-auto px-4 py-5 md:max-w-4xl md:px-8">

            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Total Alerts</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{alertHistory.length}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Recipients</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{alertConfig.recipients.length}</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-100 mb-5">
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'history' ? 'bg-[#0B1E4A] text-white shadow-sm' : 'text-gray-400 hover:text-gray-700'}`}
              >
                History
              </button>
              <button
                onClick={() => setActiveTab('config')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'config' ? 'bg-[#0B1E4A] text-white shadow-sm' : 'text-gray-400 hover:text-gray-700'}`}
              >
                Configuration
              </button>
            </div>

            {/* HISTORY TAB */}
            {activeTab === 'history' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-gray-900">Alert Log</h2>
                  {alertHistory.length > 0 && (
                    <button
                      onClick={handleClearHistory}
                      className="flex items-center gap-1.5 text-xs text-red-500 font-semibold active:scale-95 transition-transform px-3 py-1.5 rounded-lg bg-red-50"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Clear All
                    </button>
                  )}
                </div>

                {alertHistory.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-16 px-8 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                      <svg className="h-7 w-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <p className="text-gray-700 font-bold text-base">No alerts yet</p>
                    <p className="text-gray-400 text-sm mt-1">Alerts will appear here once sent</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {alertHistory.map((alert, idx) => (
                      <div key={idx} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-sm font-bold text-gray-900">{alert.name || alert.email}</p>
                            <p className="text-xs text-gray-400">{alert.email}</p>
                          </div>
                          <span className="text-xs text-gray-400 mt-0.5 text-right">{alert.timestamp}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-50">
                          <div className="flex-1 bg-red-50 rounded-xl px-3 py-2 text-center">
                            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Temp</p>
                            <p className="text-sm font-bold text-red-600">{alert.currentTemp?.toFixed(1)}°C</p>
                          </div>
                          <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2 text-center">
                            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Threshold</p>
                            <p className="text-sm font-bold text-gray-700">{alert.threshold?.toFixed(1)}°C</p>
                          </div>
                          <div className="flex-1 bg-amber-50 rounded-xl px-3 py-2 text-center">
                            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">ETA</p>
                            <p className="text-sm font-bold text-amber-600">{alert.etaMinutes} min</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* CONFIGURATION TAB */}
            {activeTab === 'config' && (
              <div className="space-y-4">

                {/* Recipients Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="flex items-center justify-between p-4 border-b border-gray-50">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">Alert Recipients</h3>
                      <p className="text-xs text-gray-400 mt-0.5">{alertConfig.recipients.length} recipient{alertConfig.recipients.length !== 1 ? 's' : ''}</p>
                    </div>
                    <button
                      onClick={() => setShowAddForm(!showAddForm)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-[#0B1E4A] text-white text-xs font-semibold rounded-xl active:scale-95 transition-transform"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                      Add
                    </button>
                  </div>

                  {/* Add Form */}
                  {showAddForm && (
                    <div className="p-4 bg-gray-50 border-b border-gray-100">
                      <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">New Recipient</p>
                      <div className="space-y-2.5">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Name</label>
                          <input
                            type="text"
                            value={newRecipient.name}
                            onChange={(e) => setNewRecipient(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Full name"
                            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B1E4A]/20 focus:border-[#0B1E4A]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Position</label>
                          <input
                            type="text"
                            value={newRecipient.position}
                            onChange={(e) => setNewRecipient(prev => ({ ...prev, position: e.target.value }))}
                            placeholder="Job title (optional)"
                            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B1E4A]/20 focus:border-[#0B1E4A]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
                          <input
                            type="email"
                            value={newRecipient.email}
                            onChange={(e) => setNewRecipient(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="email@example.com"
                            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0B1E4A]/20 focus:border-[#0B1E4A]"
                          />
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={handleAddRecipient}
                            className="flex-1 py-2.5 bg-[#0B1E4A] text-white text-sm font-bold rounded-xl active:scale-95 transition-transform"
                          >
                            Add Recipient
                          </button>
                          <button
                            onClick={() => setShowAddForm(false)}
                            className="px-4 py-2.5 bg-gray-200 text-gray-600 text-sm font-bold rounded-xl active:scale-95 transition-transform"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recipients List */}
                  {alertConfig.recipients.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-gray-400 text-sm">No recipients added yet</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {alertConfig.recipients.map((recipient, idx) => (
                        <div key={idx} className="p-4">
                          {editingRecipient === idx ? (
                            <div className="space-y-2.5">
                              <input
                                type="text"
                                value={recipient.name}
                                onChange={(e) => handleUpdateRecipient(idx, { ...recipient, name: e.target.value })}
                                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0B1E4A]/20 focus:border-[#0B1E4A]"
                              />
                              <input
                                type="text"
                                value={recipient.position}
                                onChange={(e) => handleUpdateRecipient(idx, { ...recipient, position: e.target.value })}
                                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0B1E4A]/20 focus:border-[#0B1E4A]"
                              />
                              <input
                                type="email"
                                value={recipient.email}
                                onChange={(e) => handleUpdateRecipient(idx, { ...recipient, email: e.target.value })}
                                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0B1E4A]/20 focus:border-[#0B1E4A]"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setEditingRecipient(null)}
                                  className="flex-1 py-2 bg-green-500 text-white text-sm font-bold rounded-xl active:scale-95 transition-transform"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingRecipient(null)}
                                  className="flex-1 py-2 bg-gray-200 text-gray-600 text-sm font-bold rounded-xl active:scale-95 transition-transform"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-xl bg-[#0B1E4A]/10 flex items-center justify-center flex-shrink-0">
                                  <span className="text-sm font-bold text-[#0B1E4A]">
                                    {recipient.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-bold text-gray-900 truncate">{recipient.name}</p>
                                  <p className="text-xs text-gray-400 truncate">{recipient.email}</p>
                                  {recipient.position && (
                                    <p className="text-xs text-gray-400 truncate">{recipient.position}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                                <button
                                  onClick={() => handleResendAlert(recipient)}
                                  className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center active:scale-90 transition-transform"
                                  title="Resend alert"
                                >
                                  <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => setEditingRecipient(idx)}
                                  className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center active:scale-90 transition-transform"
                                  title="Edit"
                                >
                                  <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteRecipient(idx)}
                                  className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center active:scale-90 transition-transform"
                                  title="Delete"
                                >
                                  <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Save Button */}
                <button
                  onClick={saveConfig}
                  className="w-full py-4 bg-[#0B1E4A] text-white font-bold text-sm rounded-2xl active:scale-95 transition-transform shadow-sm"
                >
                  Save Configuration
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
