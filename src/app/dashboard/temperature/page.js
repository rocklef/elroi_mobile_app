'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import TopNav from '@/components/TopNav'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Area, ComposedChart } from 'recharts'
import { useToast } from '@/components/ui/ToastContext'

// Temperature Gauge Component
function TemperatureGauge({ value = 41.9, min = 25, max = 60, threshold = 31.7, onThresholdChange }) {
  const { addToast } = useToast()
  const [showThresholdInput, setShowThresholdInput] = useState(false)
  const [tempThreshold, setTempThreshold] = useState(threshold)

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
  const mapTempToAngle = (t) => {
    const clamped = clamp(t, min, max)
    const ratio = (clamped - min) / (max - min)
    return 180 - (180 * ratio)
  }
  const polarToCartesian = (cx, cy, r, angleDeg) => {
    const rad = (Math.PI * angleDeg) / 180
    return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) }
  }
  const describeArc = (cx, cy, r, startAngle, endAngle) => {
    const start = polarToCartesian(cx, cy, r, startAngle)
    const end = polarToCartesian(cx, cy, r, endAngle)
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`
  }

  const width = 360
  const height = 220
  const cx = width / 2
  const cy = height
  const radius = 160

  const safeStart = mapTempToAngle(max)
  const safeEnd = mapTempToAngle(threshold)
  const dangerStart = mapTempToAngle(threshold)
  const dangerEnd = mapTempToAngle(min)
  const needleAngle = mapTempToAngle(value)
  const needleEnd = polarToCartesian(cx, cy, radius - 16, needleAngle)
  const thEnd = polarToCartesian(cx, cy, radius - 8, mapTempToAngle(threshold))
  const exceeded = value <= threshold

  const handleApplyThreshold = () => {
    const newValue = parseFloat(tempThreshold)
    if (!isNaN(newValue)) {
      onThresholdChange?.(newValue)
      setShowThresholdInput(false)
    } else {
      addToast('Please enter a valid number', 'error')
    }
  }

  useEffect(() => {
    setTempThreshold(threshold)
  }, [threshold])

  return (
    <div className={`rounded-2xl p-6 backdrop-blur-md shadow-xl border ${exceeded ? 'border-red-600 ring-8 ring-red-500/60 shadow-[0_0_40px_rgba(239,68,68,0.6)] bg-gradient-to-br from-red-50 via-red-100/40 to-red-50/60' : 'bg-gradient-to-br from-blue-50 via-white to-cyan-50/60 border-blue-100'
      }`}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-sm">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
              <path d="M12 2C10.9 2 10 2.9 10 4v9.17c-1.17.41-2 1.52-2 2.83 0 1.66 1.34 3 3 3 .35 0 .69-.06 1-.17.31.11.65.17 1 .17 1.66 0 3-1.34 3-3 0-1.31-.83-2.42-2-2.83V4c0-1.1-.9-2-2-2z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-gray-700">Temperature Gauge</span>
        </div>
      </div>

      <div className="relative flex items-center justify-center">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <path d={describeArc(cx, cy, radius, 0, 180)} stroke="#E5F3FA" strokeWidth="20" fill="none" />
          <path d={describeArc(cx, cy, radius, safeStart, safeEnd)} stroke="#15803d" strokeWidth="20" fill="none" />
          <path d={describeArc(cx, cy, radius, dangerStart, dangerEnd)} stroke="#b91c1c" strokeWidth="26" fill="none" opacity="1.0" />
          <path d={describeArc(cx, cy, radius, dangerStart, dangerEnd)} stroke="#dc2626" strokeWidth="22" fill="none" opacity="1.0" />
          <path d={describeArc(cx, cy, radius, dangerStart, dangerEnd)} stroke="#ef4444" strokeWidth="24" fill="none" opacity="0.6" />
          <path d={describeArc(cx, cy, radius, dangerStart, dangerEnd)} stroke="#fca5a5" strokeWidth="32" fill="none" opacity="0.3" />
          {/* Threshold line (orange dashed) */}
          <line x1={cx} y1={cy} x2={thEnd.x} y2={thEnd.y} stroke="#f97316" strokeWidth="2" strokeDasharray="4 4" />
          {/* Target line at 40°C (red dashed) */}
          <line
            x1={cx}
            y1={cy}
            x2={polarToCartesian(cx, cy, radius - 8, mapTempToAngle(40)).x}
            y2={polarToCartesian(cx, cy, radius - 8, mapTempToAngle(40)).y}
            stroke="#ef4444"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
          <line x1={cx} y1={cy} x2={needleEnd.x} y2={needleEnd.y} stroke="#0ea5e9" strokeWidth="4" strokeLinecap="round" className="transition-all duration-300 ease-out" />
          <circle cx={cx} cy={cy} r="8" fill="#0ea5e9" stroke="#38bdf8" strokeWidth="3" />
        </svg>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-baseline space-x-2">
          <span className="text-4xl font-black text-gray-900 tracking-tight">{value.toFixed(3)}</span>
          <span className="text-lg font-bold text-gray-700">°C</span>
        </div>
        <div className="text-xs text-gray-600 flex flex-col gap-1">
          <div>Threshold: <span className="font-semibold text-orange-600">{threshold.toFixed(1)}°C</span></div>
          <div>Target: <span className="font-semibold text-red-600">40.0°C</span></div>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowThresholdInput(!showThresholdInput)}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white text-sm font-semibold rounded-lg shadow-sm transition-all duration-200"
          >
            {showThresholdInput ? 'Cancel' : 'Set Threshold'}
          </button>
          {exceeded && (
            <span className="flex-1 inline-flex items-center justify-center px-3 py-2 rounded-lg text-xs font-bold bg-red-600 text-white border-2 border-red-700 shadow-lg shadow-red-500/50 animate-pulse">
              🚨 DANGER: Below Threshold!
            </span>
          )}
        </div>

        {showThresholdInput && (
          <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <label className="block text-xs font-semibold text-gray-700 mb-2">Enter New Threshold (°C)</label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                step="0.1"
                value={tempThreshold}
                onChange={(e) => setTempThreshold(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter threshold"
              />
              <button
                onClick={handleApplyThreshold}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all duration-200"
              >
                Apply
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">Current: {threshold.toFixed(1)}°C</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function TemperaturePage() {
  const { addToast } = useToast()
  const [user, setUser] = useState(null)
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('live')
  const [currentTemp, setCurrentTemp] = useState(42.5)
  const [userThreshold, setUserThreshold] = useState(31.7)
  const [currentTime, setCurrentTime] = useState(null)
  const [series, setSeries] = useState({ times: [], current: [], predicted: [], threshold: 31.7 })
  const fileInputRef = useRef(null)
  const [uploadedData, setUploadedData] = useState(null)
  const [analysisData, setAnalysisData] = useState(null)
  const [insights, setInsights] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [showFullReport, setShowFullReport] = useState(false)
  const [showAnalysisTransition, setShowAnalysisTransition] = useState(false)
  const [currentRowIndex, setCurrentRowIndex] = useState(0)
  const [showAlertModal, setShowAlertModal] = useState(false)
  const [recipients, setRecipients] = useState([])
  const [alertLeadTime, setAlertLeadTime] = useState(10)
  const [alertStatus, setAlertStatus] = useState('inactive')
  const [showThresholdModal, setShowThresholdModal] = useState(false)
  const [tempThresholdInput, setTempThresholdInput] = useState('')
  const [uploadForm, setUploadForm] = useState({
    param1: 'Time: 00:00 to 24:59 | Sensor: Temp-A1',
    param2: 'Sample Rate: Every 5 seconds | Location: Zone-B',
    param3: 'Source: Production Line 3 | Date: 2025-06-04'
  })

  // Predictive Alert State
  const [tempHistory, setTempHistory] = useState([])
  const [alertSent, setAlertSent] = useState(false) // 5-minute alert
  const [alert10MinSent, setAlert10MinSent] = useState(false) // 10-minute alert
  const [predictedTime, setPredictedTime] = useState(null)

  // Alert Modal State
  const [showAlertPopup, setShowAlertPopup] = useState(false)
  const [alertPopupData, setAlertPopupData] = useState(null)
  const [showDangerModal, setShowDangerModal] = useState(false)
  const [dangerModalData, setDangerModalData] = useState(null)

  // Top Countdown Bar State (appears after acknowledging modal)
  const [showTopCountdownBar, setShowTopCountdownBar] = useState(false)
  const [topBarAlertType, setTopBarAlertType] = useState(null) // 'warning' | 'danger'
  const [topBarMessage, setTopBarMessage] = useState('') // Alert message text
  const [topBarContact, setTopBarContact] = useState({ name: '', email: '' }) // Contact info
  const [thresholdAlertSent, setThresholdAlertSent] = useState(false) // separate flag for threshold

  // Live Excel Data State
  const [isLiveMode, setIsLiveMode] = useState(false)
  const [temperatureReadings, setTemperatureReadings] = useState([])

  // Prediction Monitoring State
  const [isPredicting, setIsPredicting] = useState(false)
  const [predictionStatus, setPredictionStatus] = useState('idle')
  const [countdown, setCountdown] = useState(1200) // 20 minutes in seconds

  // Target Temperature (fixed at 40°C)
  const TARGET_TEMP = 40.0
  const [targetAlertSent, setTargetAlertSent] = useState(false)

  // Load threshold from settings (localStorage)
  useEffect(() => {
    const loadThreshold = () => {
      const savedSettings = localStorage.getItem('systemSettings')
      if (savedSettings) {
        const settings = JSON.parse(savedSettings)
        const newThreshold = settings.thresholdTemp || 31.7
        setUserThreshold(newThreshold)
        setSeries(prev => ({ ...prev, threshold: newThreshold }))
      }
    }

    // Load on mount
    loadThreshold()

    // Listen for storage changes (when settings are updated)
    const handleStorageChange = () => {
      loadThreshold()
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // Fetch live temperature from Excel file
  useEffect(() => {
    setCurrentTime(new Date())

    const fetchLiveData = async () => {
      try {
        // Add timestamp to prevent caching
        const res = await fetch(`/api/live-temperature?t=${Date.now()}`, {
          cache: 'no-store'
        })
        const data = await res.json()

        if (data.isLive && data.temperature !== undefined) {
          setCurrentTemp(data.temperature)
          setIsLiveMode(true)
          if (data.readings) setTemperatureReadings(data.readings)

          // Update tempHistory for prediction
          setTempHistory(prev => {
            const newHistory = [...prev, { temp: data.temperature, timestamp: Date.now() }]
            return newHistory.slice(-10)
          })
        } else {
          setIsLiveMode(false)
        }
      } catch (error) {
        console.error('Error fetching live data:', error)
        setIsLiveMode(false)
      }
      setCurrentTime(new Date())
    }

    fetchLiveData() // Initial fetch
    const interval = setInterval(fetchLiveData, 5000) // Poll every 5 seconds

    return () => clearInterval(interval)
  }, [])

  // Alert function - sends email via Resend API
  // toastType: 'alert-warning' (light orange) or 'alert-danger' (dark red)
  const sendAlert = async (recipientList, currentTemp, thresholdTemp, message, toastType = 'alert-danger') => {
    try {
      // Extract emails from recipients (recipients can be objects with email property or strings)
      const emails = recipientList.map(r => typeof r === 'string' ? r : r.email)
      const recipientNames = recipientList.map(r => typeof r === 'string' ? 'User' : (r.name || 'User'))

      console.log('[ALERT] Sending to:', emails)

      const response = await fetch('/api/send-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emails: emails,
          recipientNames: recipientNames,
          currentTemp: currentTemp,
          threshold: thresholdTemp,
          etaMinutes: predictedTime ? Math.floor(predictedTime / 60) : 0,
          customMessage: message,
          isDanger: currentTemp < thresholdTemp
        })
      })

      const result = await response.json()
      console.log('[ALERT] Response:', result)

      // Show detailed popup notification
      if (result.success) {
        setAlertPopupData({
          type: toastType,
          recipients: 1, // Resend free tier only sends to verified email
          currentTemp: currentTemp,
          threshold: thresholdTemp,
          eta: predictedTime ? `~${Math.floor(predictedTime / 60)}m` : 'N/A',
          emailSentTo: emails[0], // Only show first email (Resend limitation)
          coolingRate: tempHistory.length >= 2
            ? `${((tempHistory[0]?.temp - tempHistory[tempHistory.length - 1]?.temp) / tempHistory.length * 12).toFixed(2)}°C/min`
            : 'Calculating...',
          message: message
        })
        setShowAlertPopup(true)
        // Auto-hide after 6 seconds
        setTimeout(() => setShowAlertPopup(false), 6000)
      } else {
        addToast(`⚠️ Alert failed: ${result.error || 'Unknown error'}`, 'error')
      }
    } catch (error) {
      console.error('Error sending alert:', error)
      addToast(`❌ Alert failed: ${error.message}`, 'error')
    }
  }

  // Monitor temperature for threshold and target breaches - sends ONCE only
  useEffect(() => {
    if (!isLiveMode || recipients.length === 0) return

    // Check threshold breach - send only ONCE - BIG RED MODAL
    if (currentTemp < userThreshold && !thresholdAlertSent) {
      console.log(`🚨 THRESHOLD ALERT: Temp ${currentTemp}°C below threshold ${userThreshold}°C`)
      sendAlert(
        recipients,
        currentTemp,
        userThreshold,
        `⚠️ ALERT: Temperature dropped below threshold! Current: ${currentTemp}°C, Threshold: ${userThreshold}°C`,
        'alert-danger'
      )
      // Show BIG RED modal for threshold breach
      setDangerModalData({
        type: 'danger', // RED color
        currentTemp: currentTemp,
        target: userThreshold,
        emailSentTo: recipients[0]?.email || 'configured recipient',
        title: '🚨 THRESHOLD BREACH',
        subtitle: `Temperature has dropped below ${userThreshold}°C threshold!`
      })
      setShowDangerModal(true)
      setThresholdAlertSent(true)
    }

    // Check target breach (40°C) - send only ONCE - BIG RED MODAL
    if (currentTemp < TARGET_TEMP && !targetAlertSent) {
      console.log(`🚨 TARGET ALERT: Temp ${currentTemp}°C below target ${TARGET_TEMP}°C`)
      sendAlert(
        recipients,
        currentTemp,
        TARGET_TEMP,
        `🎯 ALERT: Temperature dropped below target! Current: ${currentTemp}°C, Target: ${TARGET_TEMP}°C`,
        'alert-danger'
      )
      // Show BIG RED modal for target breach
      setDangerModalData({
        type: 'danger', // RED color
        currentTemp: currentTemp,
        target: TARGET_TEMP,
        emailSentTo: recipients[0]?.email || 'configured recipient',
        title: '🎯 TARGET TEMPERATURE REACHED',
        subtitle: 'System has reached the critical 40°C target!'
      })
      setShowDangerModal(true)
      setTargetAlertSent(true)
    }
    // NOTE: Alert flags are NOT auto-reset. They only reset when user clicks Start Monitoring again.
  }, [currentTemp])

  // Poll prediction status when prediction is running
  useEffect(() => {
    if (!isPredicting) return

    const checkPrediction = async () => {
      try {
        const res = await fetch(`/api/prediction-status?t=${Date.now()}`)
        const data = await res.json()

        setPredictionStatus(data.status)

        if (data.status === 'complete' && data.predicted_minutes) {
          // Store predicted time in SECONDS for countdown
          setPredictedTime(Math.round(data.predicted_minutes * 60))
          setIsPredicting(false)
        }
      } catch (error) {
        console.error('Error checking prediction:', error)
      }
    }

    checkPrediction()
    const interval = setInterval(checkPrediction, 5000)
    return () => clearInterval(interval)
  }, [isPredicting])

  // Countdown timer for Time to Threshold (after prediction)
  useEffect(() => {
    if (predictedTime === null || predictedTime <= 0) return

    const timer = setInterval(() => {
      setPredictedTime(prev => prev > 0 ? prev - 1 : 0)
    }, 1000) // Decrement every second

    return () => clearInterval(timer)
  }, [predictedTime !== null && predictedTime > 0])

  // Alert triggers when Time to Threshold reaches 10 minutes and 5 minutes
  useEffect(() => {
    if (recipients.length === 0) return

    // Trigger alert at exactly 10 minutes (600 seconds) remaining - BIG ORANGE MODAL
    if (predictedTime === 600 && !alert10MinSent) {
      console.log('🚨 AUTO ALERT: 10 minutes remaining to threshold!')
      sendAlert(
        recipients,
        currentTemp,
        userThreshold,
        `⏰ ALERT: Temperature will reach ${userThreshold}°C in 10 minutes!`,
        'alert-warning'
      )
      // Show BIG ORANGE modal for 10-minute warning
      setDangerModalData({
        type: 'warning', // ORANGE color
        currentTemp: currentTemp,
        target: userThreshold,
        emailSentTo: recipients[0]?.email || 'configured recipient',
        title: '⏰ 10 MINUTES REMAINING',
        subtitle: 'Temperature approaching threshold - Take action now',
        timeRemaining: 600
      })
      setShowDangerModal(true)
      setAlert10MinSent(true)
    }

    // Trigger alert at exactly 5 minutes (300 seconds) remaining - BIG RED DANGER MODAL
    if (predictedTime === 300 && !alertSent) {
      console.log('🚨 AUTO ALERT: 5 minutes remaining to threshold!')
      sendAlert(
        recipients,
        currentTemp,
        userThreshold,
        `⏰ ALERT: Temperature will reach ${userThreshold}°C in 5 minutes!`,
        'alert-danger'
      )
      // Show BIG RED modal for 5-minute warning
      setDangerModalData({
        type: 'danger', // RED color
        currentTemp: currentTemp,
        target: userThreshold,
        emailSentTo: recipients[0]?.email || 'configured recipient',
        title: '🚨 5 MINUTES REMAINING',
        subtitle: 'CRITICAL: Temperature will reach threshold soon!',
        timeRemaining: 300
      })
      setShowDangerModal(true)
      setAlertSent(true)
    }
  }, [predictedTime])

  // Start prediction function
  const startPrediction = async () => {
    try {
      console.log('[DEBUG] Starting prediction...')
      setPredictedTime(null)
      setIsPredicting(true)
      setPredictionStatus('waiting')
      setCountdown(1200) // Reset to 20 minutes
      // Reset all alert flags for new monitoring session
      setAlertSent(false)
      setAlert10MinSent(false)
      setTargetAlertSent(false)
      setThresholdAlertSent(false)
      // Hide top countdown bar from previous session
      setShowTopCountdownBar(false)

      const res = await fetch('/api/start-prediction', { method: 'POST' })
      console.log('[DEBUG] API response status:', res.status)
      const data = await res.json()
      console.log('[DEBUG] API response data:', data)

      if (!data.started) {
        console.error('[ERROR] Prediction failed to start:', data)
        setIsPredicting(false)
        setPredictionStatus('error')
      } else {
        console.log('[SUCCESS] Prediction started successfully')
      }
    } catch (error) {
      console.error('Error starting prediction:', error)
      setIsPredicting(false)
    }
  }

  // Countdown timer for data collection
  useEffect(() => {
    if (!isPredicting || predictionStatus === 'complete') return

    const timer = setInterval(() => {
      setCountdown(prev => prev > 0 ? prev - 1 : 0)
    }, 1000)

    return () => clearInterval(timer)
  }, [isPredicting, predictionStatus])

  // Auto-cycle through temperature data every 5 seconds (for analysis view)
  useEffect(() => {
    if (analysisData && analysisData.current.length > 0) {
      const interval = setInterval(() => {
        setCurrentRowIndex(prev => {
          const nextIndex = prev + 1
          // Loop back to start when reaching the end
          return nextIndex >= analysisData.current.length ? 0 : nextIndex
        })
      }, 5000) // Update every 5 seconds to match Excel data intervals

      return () => clearInterval(interval)
    } else {
      setCurrentRowIndex(0) // Reset when no data
    }
  }, [analysisData])

  // Load alert configuration on mount
  useEffect(() => {
    const loadAlertConfig = () => {
      const savedAlertConfig = localStorage.getItem('alertConfig')
      if (savedAlertConfig) {
        try {
          const config = JSON.parse(savedAlertConfig)
          setRecipients(config.recipients || [])
          setAlertLeadTime(config.leadTimeMinutes || 15)
          setAlertStatus((config.recipients && config.recipients.length > 0) ? 'active' : 'inactive')
        } catch (e) {
          console.error('Error parsing alert config:', e)
        }
      }
    }

    loadAlertConfig()
    // Listen for storage changes to sync with Alert Management page
    window.addEventListener('storage', loadAlertConfig)
    return () => window.removeEventListener('storage', loadAlertConfig)
  }, [])

  // Send Email Alert
  const sendPredictiveAlert = async (recipientList, temperature, threshold, timeToThreshold, customMessage = null) => {
    if (!recipientList || recipientList.length === 0) {
      console.warn('No recipients configured for alert')
      return
    }

    try {
      console.log('📧 Sending alert email to:', recipientList.map(r => r.email))
      const response = await fetch('/api/send-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emails: recipientList.map(r => r.email),
          recipientNames: recipientList.map(r => r.name),
          currentTemp: temperature,
          threshold: threshold,
          etaMinutes: (timeToThreshold / 60).toFixed(1),
          isDanger: true,
          customMessage: customMessage || `Predicted to reach threshold in ${Math.round(timeToThreshold)} seconds.`
        }),
      })

      const result = await response.json()

      if (response.ok) {
        console.log('✅ Alert email sent successfully:', result)
        addToast('Alert sent', 'success', 'send')

        // Log to Alert History in localStorage
        const newAlerts = recipientList.map(recipient => ({
          email: recipient.email,
          name: recipient.name,
          currentTemp: temperature,
          threshold: threshold,
          etaMinutes: (timeToThreshold / 60).toFixed(1),
          customMessage: customMessage || `Predicted to reach threshold in ${Math.round(timeToThreshold)} seconds.`,
          timestamp: new Date().toLocaleString()
        }))

        const existingHistory = JSON.parse(localStorage.getItem('alertHistory') || '[]')
        const updatedHistory = [...existingHistory, ...newAlerts]
        localStorage.setItem('alertHistory', JSON.stringify(updatedHistory))

        // Dispatch storage event to update other tabs/components
        window.dispatchEvent(new Event('storage'))

      } else {
        console.error('❌ Failed to send alert:', result)
        addToast('Failed to send alert email. Check console for details.', 'error')
      }
    } catch (error) {
      console.error('❌ Error sending alert:', error)
      addToast('Error sending alert email: ' + error.message, 'error')
    }
  }

  // Predictive Algorithm & Alert Trigger
  useEffect(() => {
    // 1. Immediate Threshold Breach Check (No history needed)
    if (currentTemp <= userThreshold && !alertSent) {
      if (recipients.length > 0) {
        console.log('🚨 CRITICAL ALERT: Threshold breached!')
        sendPredictiveAlert(recipients, currentTemp, userThreshold, 0, `CRITICAL: Temperature reached threshold (${userThreshold}°C)!`)
        setAlertSent(true)
      }
      return
    }

    // 2. Predictive Check (Needs history) - Only for alerts, NOT for Time to Threshold display
    // Time to Threshold is now set ONLY by the Python ML prediction (validation2.py)
    if (tempHistory.length < 5) return

    const recentReadings = tempHistory.slice(-5)
    const firstReading = recentReadings[0]
    const lastReading = recentReadings[recentReadings.length - 1]

    // Calculate rate of change (°C per second)
    const tempChange = lastReading.temp - firstReading.temp
    const timeChange = (lastReading.timestamp - firstReading.timestamp) / 1000

    if (timeChange === 0) return

    const rateOfChange = tempChange / timeChange

    // If temperature is increasing or stable, reset alert
    if (rateOfChange >= 0) {
      if (currentTemp > userThreshold + 2) {
        setAlertSent(false)
        // Note: Do NOT reset predictedTime here - it comes from Python prediction only
      }
      return
    }

    // Calculate time to threshold for alert purposes only
    const tempDifference = currentTemp - userThreshold
    const timeToThreshold = tempDifference / Math.abs(rateOfChange)

    // Check if we should alert (Predictive only here)
    if (timeToThreshold <= alertLeadTime && timeToThreshold > 0 && !alertSent) {
      if (recipients.length > 0) {
        console.log('🚨 PREDICTIVE ALERT TRIGGERED!')
        sendPredictiveAlert(recipients, currentTemp, userThreshold, timeToThreshold)
        setAlertSent(true)
      }
    }
  }, [tempHistory, currentTemp, userThreshold, alertSent, recipients, alertLeadTime])

  // Save alert settings (Only lead time, recipients managed in Alerts page)
  const handleSaveAlertSettings = () => {
    const savedAlertConfig = localStorage.getItem('alertConfig')
    let config = {}
    if (savedAlertConfig) {
      config = JSON.parse(savedAlertConfig)
    }

    config.leadTimeMinutes = alertLeadTime

    localStorage.setItem('alertConfig', JSON.stringify(config))
    setShowAlertModal(false)
    addToast('Alert settings saved successfully!', 'success')
  }

  // Handle threshold change and sync with settings
  const handleSetThreshold = () => {
    const newThreshold = parseFloat(tempThresholdInput)
    if (isNaN(newThreshold) || newThreshold <= 0) {
      alert('Please enter a valid threshold temperature')
      return
    }

    // Update local state
    setUserThreshold(newThreshold)
    setSeries(prev => ({ ...prev, threshold: newThreshold }))

    // Save to localStorage (settings page also reads from here)
    const savedSettings = localStorage.getItem('systemSettings')
    const settings = savedSettings ? JSON.parse(savedSettings) : {}
    settings.thresholdTemp = newThreshold
    localStorage.setItem('systemSettings', JSON.stringify(settings))

    // Trigger storage event for other components
    window.dispatchEvent(new Event('storage'))

    setShowThresholdModal(false)
    setTempThresholdInput('')
    alert(`✅ Threshold updated to ${newThreshold.toFixed(1)}°C successfully!`)
  }

  const parseCsv = (text) => {
    const [header, ...lines] = text.trim().split(/\r?\n/)
    const cols = header.split(',').map(h => h.trim().toLowerCase())
    const idx = {
      timestamp: cols.indexOf('timestamp'),
      current: cols.indexOf('current'),
      predicted: cols.indexOf('predicted'),
      threshold: cols.indexOf('threshold')
    }
    const rows = lines.map(line => {
      const c = line.split(',')
      return {
        timestamp: idx.timestamp >= 0 ? c[idx.timestamp] : undefined,
        current: idx.current >= 0 ? parseFloat(c[idx.current]) : undefined,
        predicted: idx.predicted >= 0 ? parseFloat(c[idx.predicted]) : undefined,
        threshold: idx.threshold >= 0 ? parseFloat(c[idx.threshold]) : undefined,
      }
    })
    return rows
  }

  const parseXlsx = async (buffer) => {
    try {
      const XLSX = await import('xlsx')
      const wb = XLSX.read(buffer, { type: 'array' })
      const sheetName = wb.SheetNames[0]
      const ws = wb.Sheets[sheetName]
      const json = XLSX.utils.sheet_to_json(ws, { defval: '' })

      return json.map(row => {
        const keys = Object.keys(row)
        const timeKey = keys.find(k => k.toLowerCase().includes('date') || k.toLowerCase().includes('time'))
        const tempKey = keys.find(k => k.toLowerCase() === 'temp' || k.toLowerCase() === 'temperature' || k.toLowerCase() === 'current')
        const predKey = keys.find(k => k.toLowerCase() === 'predicted')
        const threshKey = keys.find(k => k.toLowerCase() === 'threshold')

        let timestamp = timeKey ? row[timeKey] : undefined
        if (typeof timestamp === 'number') {
          const fractionalDay = timestamp - Math.floor(timestamp)
          const totalMinutes = Math.round(fractionalDay * 24 * 60)
          const hours = Math.floor(totalMinutes / 60)
          const minutes = totalMinutes % 60
          timestamp = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
        }

        return {
          timestamp,
          current: tempKey ? parseFloat(row[tempKey]) : undefined,
          predicted: predKey ? parseFloat(row[predKey]) : undefined,
          threshold: threshKey ? parseFloat(row[threshKey]) : undefined,
        }
      })
    } catch (e) {
      console.error('XLSX parsing error:', e)
      alert('Error parsing XLSX file: ' + e.message)
      return []
    }
  }

  const parseXlsxWithHeaders = async (buffer) => {
    try {
      const XLSX = await import('xlsx')
      const wb = XLSX.read(buffer, { type: 'array' })
      const sheetName = wb.SheetNames[0]
      const ws = wb.Sheets[sheetName]
      const rowsJson = XLSX.utils.sheet_to_json(ws, { defval: '' })
      const matrix = XLSX.utils.sheet_to_json(ws, { header: 1 })
      const headers = Array.isArray(matrix[0]) ? matrix[0].map(h => String(h)) : []

      const mapped = rowsJson.map(row => {
        const keys = Object.keys(row)
        const timeKey = keys.find(k => k.toLowerCase().includes('date') || k.toLowerCase().includes('time'))
        const tempKey = keys.find(k => k.toLowerCase() === 'temp' || k.toLowerCase() === 'temperature' || k.toLowerCase() === 'current')
        const predKey = keys.find(k => k.toLowerCase() === 'predicted' || k.toLowerCase().includes('forecast'))
        const threshKey = keys.find(k => k.toLowerCase().includes('threshold') || k.toLowerCase().includes('limit'))

        let timestamp = timeKey ? row[timeKey] : undefined
        if (typeof timestamp === 'number') {
          const fractionalDay = timestamp - Math.floor(timestamp)
          const totalMinutes = Math.round(fractionalDay * 24 * 60)
          const hours = Math.floor(totalMinutes / 60)
          const minutes = totalMinutes % 60
          timestamp = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
        }

        return {
          timestamp,
          current: tempKey ? parseFloat(row[tempKey]) : undefined,
          predicted: predKey ? parseFloat(row[predKey]) : undefined,
          threshold: threshKey ? parseFloat(row[threshKey]) : undefined,
        }
      })

      const sample = rowsJson[0] || {}
      const sampleKeys = Object.keys(sample)
      const timeKey = sampleKeys.find(k => k.toLowerCase().includes('date') || k.toLowerCase().includes('time'))
      const tempKey = sampleKeys.find(k => ['temp', 'temperature', 'current'].includes(k.toLowerCase()))
      const predKey = sampleKeys.find(k => k.toLowerCase() === 'predicted' || k.toLowerCase().includes('forecast'))
      const threshKey = sampleKeys.find(k => k.toLowerCase().includes('threshold') || k.toLowerCase().includes('limit'))

      return { rows: mapped, headers, detected: { timeKey, tempKey, predKey, threshKey } }
    } catch (e) {
      console.error('XLSX parsing error:', e)
      alert('Error parsing XLSX file: ' + e.message)
      return { rows: [], headers: [], detected: {} }
    }
  }

  const handleFileUpload = async (file) => {
    if (!file) return

    const fileName = file.name.toLowerCase()

    if (fileName.endsWith('.csv')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const rows = parseCsv(e.target.result)
        const times = rows.map(r => r.timestamp)
        const current = rows.map(r => r.current).filter(v => typeof v === 'number')
        const predicted = rows.map(r => r.predicted ?? undefined).filter(v => typeof v === 'number')
        const threshold = rows.find(r => typeof r.threshold === 'number')?.threshold ?? 31.7

        setUploadedData({
          fileName: file.name,
          times,
          current,
          predicted,
          threshold,
          stats: {
            dataPoints: current.length,
            min: Math.min(...current),
            max: Math.max(...current),
            avg: (current.reduce((a, b) => a + b, 0) / current.length),
            timeRange: times.length > 0 ? `${times[0]} - ${times[times.length - 1]}` : 'N/A'
          }
        })

        if (fileInputRef.current) fileInputRef.current.value = ''
      }
      reader.readAsText(file)
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      try {
        const buffer = await file.arrayBuffer()
        const { rows, headers, detected } = await parseXlsxWithHeaders(buffer)
        const times = rows.map(r => r.timestamp).filter(t => t !== undefined)
        const current = rows.map(r => r.current).filter(v => typeof v === 'number')
        const predicted = rows.map(r => r.predicted ?? undefined).filter(v => typeof v === 'number')
        const threshold = rows.find(r => typeof r.threshold === 'number')?.threshold ?? 31.7

        setUploadedData({
          fileName: file.name,
          times,
          current,
          predicted,
          threshold,
          detectedHeaders: headers,
          mapping: {
            xKey: detected?.timeKey || 'timestamp',
            yKey: detected?.tempKey || 'current',
            predKey: detected?.predKey || null
          },
          stats: {
            dataPoints: current.length,
            min: Math.min(...current),
            max: Math.max(...current),
            avg: (current.reduce((a, b) => a + b, 0) / current.length),
            timeRange: times.length > 0 ? `${times[0]} - ${times[times.length - 1]}` : 'N/A'
          }
        })

        if (fileInputRef.current) fileInputRef.current.value = ''
      } catch (error) {
        console.error('Error parsing Excel file:', error)
      }
    }
  }

  const processDataForAnalysis = () => {
    if (!uploadedData) return

    setIsProcessing(true)

    // Use setTimeout to prevent UI blocking
    setTimeout(() => {
      const insights = [
        `Data points analyzed: ${uploadedData.stats.dataPoints}`,
        `Temperature range: ${uploadedData.stats.min.toFixed(2)}°C to ${uploadedData.stats.max.toFixed(2)}°C`,
        `Average temperature: ${uploadedData.stats.avg.toFixed(2)}°C`,
        `Time period: ${uploadedData.stats.timeRange}`
      ]

      if (uploadedData.current.length > 1) {
        const first = uploadedData.current[0]
        const last = uploadedData.current[uploadedData.current.length - 1]
        const trend = last > first ? 'increasing' : last < first ? 'decreasing' : 'stable'
        insights.push(`Temperature trend: ${trend}`)
      }

      // Smart sampling: For graph, sample data to max 200 points for performance
      // But keep ALL data for table display
      let graphTimes = uploadedData.times
      let graphCurrent = uploadedData.current
      let graphPredicted = uploadedData.predicted

      if (uploadedData.times.length > 200) {
        const step = Math.ceil(uploadedData.times.length / 200)
        graphTimes = uploadedData.times.filter((_, idx) => idx % step === 0)
        graphCurrent = uploadedData.current.filter((_, idx) => idx % step === 0)
        graphPredicted = uploadedData.predicted.filter((_, idx) => idx % step === 0)
      }

      setAnalysisData({
        ...uploadedData,
        graphTimes,    // Sampled data for graph (max 200 points)
        graphCurrent,
        graphPredicted
      })
      setInsights(insights)
      setIsProcessing(false)
    }, 100)
  }

  const handleFormChange = (field, value) => {
    setUploadForm(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav user={user} />
        <main className={`flex-1 overflow-y-auto p-6 ${showTopCountdownBar ? 'pt-24' : ''}`}>
          <div className="max-w-[1600px] mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Temperature Monitoring</h1>
                <p className="text-sm text-gray-500 mt-1">Real-time predictive maintenance dashboard</p>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-amber-100 rounded-lg border border-orange-200">
                <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-sm font-bold text-orange-800">Threshold: {series.threshold.toFixed(1)}°C</span>
              </div>
            </div>

            <div className="flex mb-6 gap-3">
              <button
                className={`py-3 px-8 font-bold text-sm rounded-xl transition-all shadow-lg ${activeTab === 'live'
                  ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-700 text-white shadow-blue-500/50 scale-105'
                  : 'bg-white text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:text-blue-700 hover:shadow-xl'
                  }`}
                onClick={() => setActiveTab('live')}
              >
                📊 Live Data
              </button>
              <button
                className={`py-3 px-8 font-bold text-sm rounded-xl transition-all shadow-lg ${activeTab === 'analysis'
                  ? 'bg-gradient-to-r from-purple-600 via-purple-700 to-fuchsia-700 text-white shadow-purple-500/50 scale-105'
                  : 'bg-white text-gray-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-fuchsia-50 hover:text-purple-700 hover:shadow-xl'
                  }`}
                onClick={() => setActiveTab('analysis')}
              >
                🔬 Data Analysis
              </button>
            </div>

            {activeTab === 'live' && (
              <div className="space-y-6">
                {/* Three Metric Boxes - Current Time, Temperature, Time to Threshold */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Current Time Box */}
                  <div className="p-6 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-indigo-200/50">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Current Time</div>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-6xl font-black text-indigo-700" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        {currentTime ? currentTime.getHours().toString().padStart(2, '0') : '00'}
                      </span>
                      <span className="text-5xl font-black text-indigo-500">:</span>
                      <span className="text-6xl font-black text-indigo-700" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        {currentTime ? currentTime.getMinutes().toString().padStart(2, '0') : '00'}
                      </span>
                      <span className="text-5xl font-black text-indigo-500">:</span>
                      <span className="text-6xl font-black text-indigo-700" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        {currentTime ? currentTime.getSeconds().toString().padStart(2, '0') : '00'}
                      </span>
                    </div>
                  </div>

                  {/* Temperature Reading Box */}
                  <div className="p-6 bg-gradient-to-br from-blue-100 via-blue-50 to-cyan-50 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-blue-200/50">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C10.9 2 10 2.9 10 4v9.17c-1.17.41-2 1.52-2 2.83 0 1.66 1.34 3 3 3s3-1.34 3-3c0-1.31-.83-2.42-2-2.83V4c0-1.1-.9-2-2-2z" />
                        </svg>
                      </div>
                      <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">Temperature</div>
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                      <span className="text-6xl font-black text-blue-700" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>{Math.floor(currentTemp / 10)}</span>
                      <span className="text-6xl font-black text-blue-700" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>{Math.floor(currentTemp % 10)}</span>
                      <span className="text-5xl font-black text-blue-500">.</span>
                      <span className="text-6xl font-black text-blue-700" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>{Math.floor((currentTemp * 10) % 10)}</span>
                      <span className="text-6xl font-black text-blue-700" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>{Math.floor((currentTemp * 100) % 10)}</span>
                      <span className="text-4xl font-black text-blue-600 ml-1">°C</span>
                    </div>
                  </div>

                  {/* Time to Threshold Box */}
                  <div className="p-6 bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-50 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-orange-200/50">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="text-xs font-bold text-orange-600 uppercase tracking-wider">Time to Threshold</div>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      {predictedTime !== null && predictedTime > 0 ? (
                        <>
                          <div className="text-6xl font-black text-orange-700" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                            {Math.floor(predictedTime / 60)}:{(predictedTime % 60).toString().padStart(2, '0')}
                          </div>
                          <div className="text-sm text-orange-600 font-semibold mt-2">to reach 40°C</div>
                        </>
                      ) : isPredicting ? (
                        <>
                          <div className="text-4xl font-black text-amber-600 animate-pulse" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                            ⏳
                          </div>
                          <div className="text-sm text-amber-600 font-semibold mt-2">Collecting data...</div>
                          <div className="text-xs text-gray-500 mt-1">~20 min remaining</div>
                        </>
                      ) : (
                        <>
                          <div className="text-6xl font-black text-gray-400" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                            --:--
                          </div>
                          <div className="text-sm text-gray-500 font-semibold mt-2">Click Start Monitoring</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Temperature Profile and Status */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/40 rounded-2xl p-6 shadow-2xl border-2 border-blue-100 hover:shadow-blue-200/50 transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Temperature Profile</h2>
                        <p className="text-sm text-gray-500 mt-1">Actual vs Predicted Cooling Trajectory</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center px-3 py-1.5 bg-blue-100 rounded-lg border border-blue-200">
                          <span className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 mr-2 shadow-lg shadow-blue-500/50"></span>
                          <span className="text-xs font-bold text-blue-700">Actual Data</span>
                        </div>
                        <div className="flex items-center px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100">
                          <span className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-300 to-blue-400 mr-2 shadow-md shadow-blue-300/40"></span>
                          <span className="text-xs font-bold text-blue-600">AI Prediction</span>
                        </div>
                        <div className="flex items-center px-3 py-1.5 bg-pink-100 rounded-lg border border-pink-200">
                          <span className="w-3 h-3 rounded-full bg-gradient-to-r from-pink-500 to-pink-600 mr-2 shadow-lg shadow-pink-500/50"></span>
                          <span className="text-xs font-bold text-pink-700">Threshold</span>
                        </div>
                      </div>
                    </div>

                    {/* System Status Metrics - Moved here */}
                    <div className={`mb-6 p-4 rounded-xl border-2 shadow-lg ${isPredicting ? 'bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-50 border-amber-200' : 'bg-gradient-to-br from-green-100 via-emerald-50 to-teal-50 border-green-200'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-600 uppercase">Status</span>
                            {isPredicting ? (
                              <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg shadow-amber-500/40 animate-pulse">
                                COLLECTING DATA
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold rounded-full shadow-lg shadow-green-500/40">
                                COOLING
                              </span>
                            )}
                          </div>
                          {isPredicting && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-amber-700">⏱️ Time Left</span>
                              <span className="text-sm font-bold text-amber-800 bg-amber-200 px-2 py-0.5 rounded">
                                {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">Threshold</span>
                            <span className="text-sm font-bold text-gray-900">{series.threshold.toFixed(1)}°C</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">Progress</span>
                            <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{Math.max(0, Math.min(100, ((70 - currentTemp) / (70 - series.threshold) * 100))).toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <TemperatureGauge
                      value={currentTemp}
                      threshold={series.threshold}
                      onThresholdChange={(newThreshold) => {
                        setUserThreshold(newThreshold)
                        setSeries(prev => ({ ...prev, threshold: newThreshold }))
                      }}
                    />

                    {/* Control Buttons */}
                    <div className="mt-8 grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setShowAlertModal(true)}
                        className="py-3 px-4 bg-gradient-to-r from-purple-600 via-purple-700 to-fuchsia-700 text-white font-bold rounded-xl hover:from-purple-700 hover:to-fuchsia-800 transition-all shadow-lg shadow-purple-500/40 hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2"
                      >
                        <span>⚙️</span> Configure Alert Email
                      </button>
                      <button
                        onClick={startPrediction}
                        disabled={isPredicting}
                        className={`py-3 px-4 font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 ${isPredicting
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white animate-pulse cursor-wait'
                          : 'bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-700 text-white shadow-blue-500/40 hover:from-blue-700 hover:to-cyan-800'
                          }`}
                      >
                        {isPredicting ? '⏳ Collecting Data...' : '▶️ Start Monitoring'}
                      </button>
                      <button className="py-3 px-4 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 font-bold rounded-xl hover:from-gray-300 hover:to-gray-400 transition-all shadow-md hover:shadow-lg hover:scale-105">
                        Pause
                      </button>
                      <button
                        onClick={() => setSeries(prev => ({ ...prev, threshold: userThreshold }))}
                        className="py-3 px-4 bg-gradient-to-r from-pink-200 via-pink-300 to-pink-400 text-pink-800 font-bold rounded-xl hover:from-pink-300 hover:to-pink-500 transition-all shadow-md hover:shadow-lg hover:scale-105"
                      >
                        Update Threshold
                      </button>
                    </div>
                  </div>

                  {/* Temperature Data Table - Replaces System Status */}
                  <div className="bg-gradient-to-br from-white via-purple-50/30 to-pink-50/40 rounded-2xl p-6 shadow-2xl border-2 border-purple-100 hover:shadow-purple-200/50 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center shadow-lg">
                        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">Temperature Data</h2>
                        <p className="text-sm text-gray-500 mt-1">Live readings log</p>
                      </div>
                    </div>

                    {/* Table Header */}
                    <div className="bg-gradient-to-r from-purple-100 to-fuchsia-100 rounded-t-xl px-4 py-3 border-b-2 border-purple-200">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-xs font-bold text-purple-800 uppercase">Timestamp</div>
                        <div className="text-xs font-bold text-purple-800 uppercase text-center">Temp (°C)</div>
                        <div className="text-xs font-bold text-purple-800 uppercase text-center">Status</div>
                      </div>
                    </div>

                    {/* Table Body - Scrollable */}
                    <div className="bg-white rounded-b-xl max-h-[400px] overflow-y-auto">
                      {[...Array(10)].map((_, idx) => {
                        const time = new Date(Date.now() - idx * 60000);
                        const temp = (currentTemp + (Math.random() - 0.5) * 0.5).toFixed(2);
                        const isNormal = parseFloat(temp) > series.threshold;

                        return (
                          <div key={idx} className={`grid grid-cols-3 gap-2 px-4 py-3 border-b border-gray-100 hover:bg-purple-50/50 transition-colors ${idx % 2 === 0 ? 'bg-gray-50/50' : ''}`}>
                            <div className="text-sm text-gray-700 font-medium">
                              {time.getHours().toString().padStart(2, '0')}:{time.getMinutes().toString().padStart(2, '0')}
                            </div>
                            <div className="text-sm font-bold text-blue-600 text-center">
                              {temp}
                            </div>
                            <div className="flex justify-center">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${isNormal ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {isNormal ? '✓ Normal' : '⚠ Alert'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer */}
                    <div className="mt-4 text-center">
                      <p className="text-xs text-gray-500">Showing last 10 readings</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analysis' && (
              <div>
                {!uploadedData ? (
                  <div className="space-y-6">
                    {/* Upload Section - Show First */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                      <div className="grid grid-cols-1">
                        {/* Left Side - Upload Box */}
                        <div className="p-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
                          <div className="flex items-center mb-6">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mr-4 shadow-lg shadow-indigo-500/30">
                              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">Upload Dataset</h3>
                              <p className="text-sm text-gray-600 mt-1">Import temperature data files</p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-20"></div>
                              <div className="relative p-8 bg-white rounded-xl border-2 border-dashed border-indigo-300 hover:border-indigo-500 transition-all cursor-pointer">
                                <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={(e) => handleFileUpload(e.target.files[0])}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                <div className="text-center">
                                  <svg className="w-12 h-12 text-indigo-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <p className="text-sm font-semibold text-gray-700 mb-1">Click to upload or drag and drop</p>
                                  <p className="text-xs text-gray-500">CSV, XLSX, XLS (MAX. 10MB)</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right Side - Info */}
                        <div className="p-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
                          <div className="mb-4">
                            <p className="text-sm text-gray-600 text-center">No additional parameters needed. Upload your file to begin analysis.</p>
                          </div>

                          <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                            <p className="text-sm text-gray-600 text-center">
                              <span className="font-semibold">Supported formats:</span><br />
                              CSV, XLSX, XLS files<br />
                              <span className="text-xs text-gray-500 mt-2 block">Maximum file size: 10MB</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : !analysisData ? (
                  <div className="space-y-6">
                    {/* File Upload Success - Show file info and analysis button */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mr-4 shadow-lg shadow-green-500/30">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">File Uploaded Successfully</h3>
                            <p className="text-sm text-gray-600 mt-1">{uploadedData.fileName} • {uploadedData.stats.dataPoints} data points</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setUploadedData(null)
                            if (fileInputRef.current) fileInputRef.current.value = ''
                          }}
                          className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          ← Upload Different File
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="p-6 bg-gradient-to-br from-blue-200 via-blue-100 to-cyan-100 rounded-xl border-2 border-blue-200 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                          <p className="text-xs font-bold text-blue-800 uppercase mb-2">Data Points</p>
                          <p className="text-4xl font-black text-blue-900">{uploadedData.stats.dataPoints}</p>
                        </div>
                        <div className="p-6 bg-gradient-to-br from-purple-200 via-purple-100 to-fuchsia-100 rounded-xl border-2 border-purple-200 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                          <p className="text-xs font-bold text-purple-800 uppercase mb-2">Avg Temperature</p>
                          <p className="text-4xl font-black text-purple-900">{uploadedData.stats.avg.toFixed(2)}°C</p>
                        </div>
                        <div className="p-6 bg-gradient-to-br from-orange-200 via-orange-100 to-amber-100 rounded-xl border-2 border-orange-200 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                          <p className="text-xs font-bold text-orange-800 uppercase mb-2">Temp Range</p>
                          <p className="text-2xl font-black text-orange-900">{uploadedData.stats.min.toFixed(1)} - {uploadedData.stats.max.toFixed(1)}°C</p>
                        </div>
                      </div>



                      <button onClick={processDataForAnalysis} disabled={isProcessing}
                        className={`w-full py-4 text-white font-bold text-lg rounded-xl transition-all shadow-lg ${isProcessing
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-500/30'
                          }`}>
                        {isProcessing ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </span>
                        ) : '🔬 Start Analysis →'}
                      </button>

                      {/* Detected Columns & Recommended Mapping (moved below the button) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                          <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Detected Columns</p>
                          <div className="text-sm text-gray-700">
                            {(uploadedData.detectedHeaders || []).length > 0 ? (
                              <ul className="list-disc list-inside">
                                {uploadedData.detectedHeaders.map((h, i) => (
                                  <li key={i} className="text-gray-800">{h}</li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-gray-500">Headers not available</p>
                            )}
                          </div>
                        </div>
                        <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                          <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Recommended Graph</p>
                          <p className="text-sm text-gray-700">X: {uploadedData.mapping?.xKey || 'timestamp'}</p>
                          <p className="text-sm text-gray-700">Y: {uploadedData.mapping?.yKey || 'temperature'}</p>
                          {uploadedData.mapping?.predKey && (
                            <p className="text-sm text-gray-700">Overlay: {uploadedData.mapping.predKey}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Stats Cards Row - Show ONLY in analysis results */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Stat card 1 - Current Temperature (Auto-cycling) */}
                      <div className="bg-gradient-to-br from-blue-200 via-blue-100 to-cyan-100 rounded-2xl p-6 shadow-xl border-2 border-blue-200 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 flex items-center justify-center shadow-lg shadow-blue-500/60">
                            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                          </div>
                          <span className="text-xs font-bold px-3 py-1.5 bg-blue-600 text-white rounded-full shadow-md animate-pulse">Live</span>
                        </div>
                        <div className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-2">Current Reading</div>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-5xl font-black text-blue-900 transition-all duration-500">{analysisData.current[currentRowIndex]?.toFixed(2)}</span>
                          <span className="text-2xl font-bold text-blue-700">°C</span>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center text-sm text-blue-700 font-semibold">
                            <svg className="w-5 h-5 mr-1 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>Row {currentRowIndex + 1}/{analysisData.current.length}</span>
                          </div>
                          <span className="text-xs text-blue-600 font-bold">{analysisData.times[currentRowIndex]}</span>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-orange-200 via-orange-100 to-red-100 rounded-2xl p-6 shadow-xl border-2 border-orange-200 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-600 via-orange-700 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/60">
                            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <span className="text-xs font-bold px-3 py-1.5 bg-orange-600 text-white rounded-full shadow-md">Target</span>
                        </div>
                        <div className="text-xs font-bold text-orange-800 uppercase tracking-wide mb-2">Target Temperature</div>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-5xl font-black text-orange-900">32.4</span>
                          <span className="text-2xl font-bold text-orange-700">°C</span>
                        </div>
                        <div className="mt-3 flex items-center text-sm text-orange-700 font-semibold">
                          <span className="w-3 h-3 bg-orange-600 rounded-full mr-2 animate-pulse shadow-lg"></span>
                          <span>{(currentTemp - 32.4).toFixed(1)}°C above target</span>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-emerald-200 via-teal-100 to-cyan-100 rounded-2xl p-6 shadow-xl border-2 border-emerald-200 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-700 flex items-center justify-center shadow-lg shadow-emerald-500/60">
                            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                          </div>
                          <span className="text-xs font-bold px-3 py-1.5 bg-emerald-600 text-white rounded-full shadow-md">Safe ✓</span>
                        </div>
                        <div className="text-xs font-bold text-emerald-800 uppercase tracking-wide mb-2">Threshold Limit</div>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-5xl font-black text-emerald-900">{series.threshold.toFixed(1)}</span>
                          <span className="text-2xl font-bold text-emerald-700">°C</span>
                        </div>
                        <div className="mt-3 flex items-center text-sm text-emerald-700 font-semibold">
                          <span className="w-3 h-3 bg-emerald-600 rounded-full mr-2 shadow-lg"></span>
                          <span>Within safe range</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-900">Analysis Results</h2>
                      <button onClick={() => setAnalysisData(null)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">← Back to Upload</button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                      {/* Graph Section - LEFT SIDE */}
                      <div className="bg-gradient-to-br from-blue-50 via-white to-cyan-50 rounded-2xl p-6 shadow-xl border-2 border-blue-100">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-700 flex items-center justify-center mr-3 shadow-lg shadow-indigo-500/50">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Temperature Graph</h3>
                            <p className="text-xs text-gray-500">Trend visualization over time</p>
                          </div>
                        </div>

                        {/* Enhanced Chart with Better Formatting & Optimized Data */}
                        <div className="h-96 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart
                              data={(analysisData.graphTimes || analysisData.times).map((time, idx) => ({
                                timestamp: time,
                                temperature: (analysisData.graphCurrent || analysisData.current)[idx],
                                predicted: (analysisData.graphPredicted || analysisData.predicted)[idx] || null
                              }))}
                              margin={{ top: 15, right: 40, left: 25, bottom: 50 }}
                            >
                              <defs>
                                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                              <XAxis
                                dataKey="timestamp"
                                tick={{ fontSize: 10, fill: '#374151' }}
                                stroke="#9ca3af"
                                tickLine={{ stroke: '#d1d5db' }}
                                interval={Math.floor((analysisData.graphTimes || analysisData.times).length / 8)}
                                angle={-45}
                                textAnchor="end"
                                height={60}
                                label={{
                                  value: 'Time (HH:MM)',
                                  position: 'insideBottom',
                                  offset: -15,
                                  style: { fontSize: 11, fontWeight: 600, fill: '#4b5563' }
                                }}
                              />
                              <YAxis
                                tick={{ fontSize: 11, fill: '#374151' }}
                                stroke="#9ca3af"
                                tickLine={{ stroke: '#d1d5db' }}
                                domain={[(dataMin) => Math.floor(dataMin - 2), (dataMax) => Math.ceil(dataMax + 2)]}
                                tickCount={8}
                                label={{
                                  value: 'Temperature (°C)',
                                  angle: -90,
                                  position: 'insideLeft',
                                  offset: 10,
                                  style: { fontSize: 12, fontWeight: 600, fill: '#4b5563' }
                                }}
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: 'rgba(255, 255, 255, 0.98)',
                                  border: '2px solid #3b82f6',
                                  borderRadius: '10px',
                                  fontSize: '13px',
                                  fontWeight: 500,
                                  padding: '10px 14px',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                }}
                                labelStyle={{ color: '#1f2937', fontWeight: 700, marginBottom: '6px' }}
                                formatter={(value) => [`${value?.toFixed(3)} °C`, '']}
                              />
                              <Legend
                                wrapperStyle={{ fontSize: '13px', fontWeight: 500 }}
                                iconType="line"
                                align="right"
                                verticalAlign="top"
                                layout="vertical"
                              />
                              <ReferenceLine
                                y={analysisData.stats.avg}
                                stroke="#f59e0b"
                                strokeDasharray="8 4"
                                strokeWidth={2}
                                label={{
                                  value: `Avg: ${analysisData.stats.avg.toFixed(2)}°C`,
                                  position: 'right',
                                  fill: '#f59e0b',
                                  fontSize: 11,
                                  fontWeight: 600
                                }}
                              />
                              {analysisData.threshold && (
                                <ReferenceLine
                                  y={analysisData.threshold}
                                  stroke="#ef4444"
                                  strokeDasharray="5 5"
                                  strokeWidth={2}
                                  label={{
                                    value: `Threshold: ${analysisData.threshold.toFixed(1)}°C`,
                                    position: 'right',
                                    fill: '#ef4444',
                                    fontSize: 11,
                                    fontWeight: 700
                                  }}
                                />
                              )}
                              <Area
                                type="monotone"
                                dataKey="temperature"
                                fill="url(#tempGradient)"
                                stroke="none"
                              />
                              <Line
                                type="monotone"
                                dataKey="temperature"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                dot={{ fill: '#3b82f6', r: 2, strokeWidth: 0 }}
                                activeDot={{ r: 5, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }}
                                name="Temperature"
                              />
                              {analysisData.predicted.some(v => v !== undefined) && (
                                <Line
                                  type="monotone"
                                  dataKey="predicted"
                                  stroke="#a855f7"
                                  strokeWidth={2.5}
                                  strokeDasharray="8 4"
                                  dot={{ fill: '#a855f7', r: 2 }}
                                  activeDot={{ r: 4, fill: '#9333ea', stroke: '#fff', strokeWidth: 2 }}
                                  name="Predicted"
                                />
                              )}
                            </ComposedChart>
                          </ResponsiveContainer>
                        </div>

                        <div className="mt-4 grid grid-cols-3 gap-3">
                          <div className="p-4 bg-gradient-to-br from-blue-200 via-blue-100 to-cyan-100 rounded-xl border-2 border-blue-200 shadow-lg">
                            <p className="text-xs font-bold text-blue-800 uppercase mb-1">Graph Points</p>
                            <p className="text-2xl font-black text-blue-900">{(analysisData.graphTimes || analysisData.times).length}</p>
                          </div>
                          <div className="p-4 bg-gradient-to-br from-orange-200 via-orange-100 to-amber-100 rounded-xl border-2 border-orange-200 shadow-lg">
                            <p className="text-xs font-bold text-orange-800 uppercase mb-1">Avg Temp</p>
                            <p className="text-2xl font-black text-orange-900">{analysisData.stats.avg.toFixed(2)}°C</p>
                          </div>
                          <div className="p-4 bg-gradient-to-br from-emerald-200 via-teal-100 to-cyan-100 rounded-xl border-2 border-emerald-200 shadow-lg">
                            <p className="text-xs font-bold text-emerald-800 uppercase mb-1">Variance</p>
                            <p className="text-2xl font-black text-emerald-900">{(analysisData.stats.max - analysisData.stats.min).toFixed(2)}°C</p>
                          </div>
                        </div>

                        {/* Alert Button */}
                        <div className="mt-4">
                          <button
                            onClick={() => setShowAlertModal(true)}
                            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                          >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <span>Configure Alert Settings</span>
                          </button>
                        </div>
                      </div>

                      {/* Data Table Section - RIGHT SIDE - ALL ROWS */}
                      <div className="bg-gradient-to-br from-purple-50 via-white to-pink-50 rounded-2xl p-6 shadow-xl border-2 border-purple-100">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 via-fuchsia-700 to-pink-700 flex items-center justify-center mr-3 shadow-lg shadow-purple-500/50">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Temperature Data</h3>
                            <p className="text-xs text-gray-500">All {analysisData.times.length} entries</p>
                          </div>
                        </div>

                        {/* Scrollable table with LIMITED rows (50-100) */}
                        <div className="overflow-y-auto max-h-[450px] rounded-xl border border-gray-200">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Timestamp</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Temp (°C)</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                              {analysisData.times.slice(0, 100).map((time, index) => {
                                const temp = analysisData.current[index]
                                const isAlert = temp < series.threshold  // COOLING: Alert when BELOW threshold
                                return (
                                  <tr key={index} className="hover:bg-blue-50 transition-colors">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{time}</td>
                                    <td className="px-4 py-3 text-sm">
                                      <span className="font-bold text-blue-600">{temp?.toFixed(2)}</span>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                      {isAlert ? (
                                        <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full border border-red-300">🚨 ALERT</span>
                                      ) : (
                                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-300">✓ Normal</span>
                                      )}
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>

                        <div className="mt-4 text-center">
                          <p className="text-xs text-gray-500 mb-3">
                            Showing first 100 of {analysisData.times.length} entries from {analysisData.fileName}
                          </p>
                          <button
                            onClick={() => setShowFullReport(true)}
                            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                          >
                            📊 View Full Excel Report ({analysisData.times.length} entries)
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mr-3 shadow-lg shadow-orange-500/30">
                          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">Insights Analysis</h3>
                          <p className="text-xs text-gray-500">Data summary and trends</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {insights.map((insight, index) => (
                          <div key={index} className="flex items-start">
                            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <p className="text-sm text-gray-700 leading-relaxed">{insight}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main >
      </div >

      {/* Full Report Modal/Popup */}
      {
        showFullReport && analysisData && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col animate-slideUp">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 p-6 rounded-t-2xl flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">Full Excel Report</h2>
                    <p className="text-sm text-white/80 mt-1">{analysisData.fileName} • {analysisData.times.length} Total Entries</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFullReport(false)}
                  className="w-10 h-10 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center transition-all hover:scale-110"
                >
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body - Scrollable Table */}
              <div className="flex-1 overflow-auto p-6">
                <div className="rounded-xl border-2 border-gray-200 overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-100 to-gray-200 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-black text-gray-800 uppercase tracking-wider">#</th>
                        <th className="px-4 py-3 text-left text-xs font-black text-gray-800 uppercase tracking-wider">Timestamp</th>
                        <th className="px-4 py-3 text-left text-xs font-black text-gray-800 uppercase tracking-wider">Temperature (°C)</th>
                        {analysisData.predicted && analysisData.predicted.some(v => v !== undefined) && (
                          <th className="px-4 py-3 text-left text-xs font-black text-gray-800 uppercase tracking-wider">Predicted (°C)</th>
                        )}
                        <th className="px-4 py-3 text-center text-xs font-black text-gray-800 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {analysisData.times.map((time, index) => {
                        const temp = analysisData.current[index]
                        const predicted = analysisData.predicted?.[index]
                        const isAlert = temp < series.threshold  // COOLING: Alert when BELOW threshold
                        return (
                          <tr key={index} className={`hover:bg-blue-50 transition-colors ${isAlert ? 'bg-red-50/30' : ''
                            }`}>
                            <td className="px-4 py-3 text-sm font-bold text-gray-600">{index + 1}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{time}</td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`font-black text-lg ${isAlert ? 'text-red-600' : 'text-blue-600'
                                }`}>
                                {temp?.toFixed(3)}
                              </span>
                            </td>
                            {analysisData.predicted && analysisData.predicted.some(v => v !== undefined) && (
                              <td className="px-4 py-3 text-sm">
                                {predicted ? (
                                  <span className="font-semibold text-purple-600">{predicted.toFixed(3)}</span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                            )}
                            <td className="px-4 py-3 text-center">
                              {isAlert ? (
                                <div className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-black rounded-lg shadow-lg shadow-red-500/30">
                                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                  ALERT
                                </div>
                              ) : (
                                <div className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-black rounded-lg shadow-lg shadow-green-500/30">
                                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  Normal
                                </div>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 p-4 rounded-b-2xl border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="px-4 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg border border-blue-200">
                      <span className="text-xs font-bold text-blue-800">Total: {analysisData.times.length} entries</span>
                    </div>
                    <div className="px-4 py-2 bg-gradient-to-r from-red-100 to-orange-100 rounded-lg border border-red-200">
                      <span className="text-xs font-bold text-red-800">Alerts: {analysisData.current.filter(t => t < series.threshold).length}</span>
                    </div>
                    <div className="px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border border-green-200">
                      <span className="text-xs font-bold text-green-800">Normal: {analysisData.current.filter(t => t >= series.threshold).length}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowFullReport(false)}
                    className="px-6 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold text-sm rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all shadow-lg"
                  >
                    Close
                  </button>
                </div>

                {/* Set Threshold Button */}
                <button
                  onClick={() => {
                    setTempThresholdInput(series.threshold.toString())
                    setShowThresholdModal(true)
                  }}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 hover:from-purple-600 hover:via-indigo-600 hover:to-blue-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  <span>Set Threshold Temperature</span>
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Set Threshold Modal */}
      {
        showThresholdModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  <h2 className="text-2xl font-black text-white">Set Threshold Temperature</h2>
                </div>
                <button
                  onClick={() => setShowThresholdModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-all"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Info */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm font-semibold text-blue-800">
                      Set the threshold temperature for alerts. Temperature below this value will trigger warnings.
                    </p>
                  </div>
                </div>

                {/* Current Threshold Display */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-600 uppercase mb-2">Current Threshold</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-gray-900">{series.threshold.toFixed(1)}</span>
                    <span className="text-xl font-bold text-gray-700">°C</span>
                  </div>
                </div>

                {/* Threshold Input */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">New Threshold Temperature (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={tempThresholdInput}
                    onChange={(e) => setTempThresholdInput(e.target.value)}
                    placeholder="Enter threshold (e.g., 31.7)"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-gray-900 text-lg font-bold focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                  />
                </div>

                {/* Preview */}
                {tempThresholdInput && !isNaN(parseFloat(tempThresholdInput)) && (
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <p className="text-sm font-bold text-purple-900">Preview:</p>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-purple-700">{parseFloat(tempThresholdInput).toFixed(1)}</span>
                      <span className="text-lg font-bold text-purple-600">°C</span>
                    </div>
                    <p className="text-xs text-purple-700 mt-2 font-semibold">
                      ⚠️ This will update the threshold across the entire system (Settings page included)
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 p-6 flex items-center justify-between gap-4">
                <button
                  onClick={() => setShowThresholdModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSetThreshold}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Apply Threshold
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Email Alert Settings Modal */}
      {
        showAlertModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-in fade-in zoom-in duration-300">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <h2 className="text-2xl font-black text-white">Email Alert Settings</h2>
                </div>
                <button
                  onClick={() => setShowAlertModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-all"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Recipients Display */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Recipients ({recipients.length})
                  </label>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 max-h-32 overflow-y-auto">
                    {recipients.length > 0 ? (
                      <ul className="space-y-2">
                        {recipients.map((r, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            <span className="font-semibold">{r.name}</span>
                            <span className="text-gray-500 text-xs">({r.email})</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No recipients configured</p>
                    )}
                  </div>
                  <button
                    onClick={() => router.push('/dashboard/alerts')}
                    className="text-sm text-blue-600 font-semibold hover:text-blue-800 hover:underline flex items-center gap-1"
                  >
                    Manage recipients in Alert Settings →
                  </button>
                </div>

                {/* Lead Time Selection */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">Alert Lead Time (seconds)</label>
                  <p className="text-xs text-gray-600 mb-3">Send alert this many seconds before reaching threshold temperature</p>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setAlertLeadTime(5)}
                      className={`px-4 py-3 rounded-xl font-bold transition-all ${alertLeadTime === 5
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      5 sec
                    </button>
                    <button
                      onClick={() => setAlertLeadTime(10)}
                      className={`px-4 py-3 rounded-xl font-bold transition-all ${alertLeadTime === 10
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      10 sec
                    </button>
                    <button
                      onClick={() => setAlertLeadTime(15)}
                      className={`px-4 py-3 rounded-xl font-bold transition-all ${alertLeadTime === 15
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      15 sec
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowAlertModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      if (recipients.length === 0) {
                        alert('Please configure recipients first')
                        return
                      }
                      const btn = document.getElementById('test-email-btn')
                      if (btn) {
                        const originalText = btn.innerText
                        btn.innerText = 'Sending...'
                        btn.disabled = true
                      }

                      try {
                        await sendPredictiveAlert(recipients, currentTemp, userThreshold, 15, 'Test Alert from Configuration')
                      } catch (e) {
                        console.error(e)
                        alert('Test failed: ' + e.message)
                      } finally {
                        if (btn) {
                          btn.innerText = 'Test Email'
                          btn.disabled = false
                        }
                      }
                    }}
                    id="test-email-btn"
                    className="px-6 py-3 bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold rounded-xl transition-all border border-blue-200 flex items-center justify-center gap-2"
                  >
                    <span className="text-lg">📧</span> Test
                  </button>
                  <button
                    onClick={handleSaveAlertSettings}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Alert Popup Modal */}
      {showAlertPopup && alertPopupData && (
        <div className="fixed top-28 right-4 z-[999999] animate-in slide-in-from-right-5 fade-in duration-300">
          <div className={`w-[420px] rounded-2xl shadow-2xl overflow-hidden ${alertPopupData.type === 'alert-warning'
            ? 'bg-gradient-to-br from-orange-400 via-amber-500 to-orange-500 ring-8 ring-orange-400/60 shadow-[0_0_40px_rgba(251,146,60,0.6)]'
            : 'bg-gradient-to-br from-red-500 via-rose-600 to-red-600 ring-8 ring-red-500/60 shadow-[0_0_40px_rgba(239,68,68,0.6)]'
            }`}>
            {/* Header */}
            <div className="px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-white text-2xl">🚨</span>
                <span className="text-white font-bold text-lg">REAL-TIME ALERT SENT!</span>
              </div>
              <button
                onClick={() => setShowAlertPopup(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="text-white/90 text-sm px-5 pb-3">Temperature threshold approaching</div>

            {/* Content */}
            <div className="bg-white rounded-t-2xl p-5 space-y-4">
              {/* Stats Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm text-gray-500">📊 Recipients</div>
                  <div className="text-lg font-bold text-gray-800">{alertPopupData.recipients}/{alertPopupData.recipients}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm text-gray-500">🌡️ Current</div>
                  <div className="text-lg font-bold text-blue-600">{alertPopupData.currentTemp?.toFixed(1)}°C</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm text-gray-500">⚠️ Threshold</div>
                  <div className="text-lg font-bold text-red-600">{alertPopupData.threshold?.toFixed(1)}°C</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm text-gray-500">⏱️ ETA</div>
                  <div className="text-lg font-bold text-gray-800">{alertPopupData.eta}</div>
                </div>
              </div>

              {/* Email Sent To */}
              <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                <div className="text-sm text-red-600 font-semibold">📧 Email Sent To:</div>
                <div className="text-sm text-red-700 font-medium truncate">{alertPopupData.emailSentTo}</div>
              </div>

              {/* Status */}
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                <div className="text-sm text-blue-600 font-semibold">❄️ Status:</div>
                <div className="text-sm text-blue-700 font-medium">Cooling</div>
              </div>

              {/* Success Message */}
              <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Alert successfully delivered to all recipients
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BIG ALERT MODAL - Dynamic Orange (warning) or Red (danger) */}
      {showDangerModal && dangerModalData && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
          <div className={`w-[520px] max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl 
            ${dangerModalData.type === 'warning'
              ? 'bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 ring-[10px] ring-orange-400/70 shadow-[0_0_60px_rgba(251,146,60,0.8)]'
              : 'bg-gradient-to-br from-red-600 via-red-700 to-rose-800 ring-[10px] ring-red-500/70 shadow-[0_0_60px_rgba(220,38,38,0.8)]'
            }`}>
            {/* Header */}
            <div className={`px-6 py-4 text-center border-b ${dangerModalData.type === 'warning' ? 'border-orange-400/30' : 'border-red-500/30'}`}>
              <div className="text-5xl mb-2 animate-pulse">{dangerModalData.title?.includes('10') ? '⏰' : dangerModalData.title?.includes('5') ? '⏰' : '🚨'}</div>
              <h1 className="text-white font-black text-2xl tracking-wide">{dangerModalData.title || 'ALERT!'}</h1>
              <p className={`text-base mt-1 ${dangerModalData.type === 'warning' ? 'text-orange-100' : 'text-red-200'}`}>{dangerModalData.subtitle || 'System alert triggered'}</p>
            </div>

            {/* Content */}
            <div className={`p-6 space-y-4 ${dangerModalData.type === 'warning' ? 'bg-orange-800/50' : 'bg-red-900/50'}`}>
              {/* Big Temperature Display */}
              <div className={`text-center rounded-2xl p-6 border-2 ${dangerModalData.type === 'warning' ? 'bg-orange-900/60 border-orange-400/50' : 'bg-red-950/60 border-red-500/50'}`}>
                <div className={`text-lg font-semibold mb-1 ${dangerModalData.type === 'warning' ? 'text-orange-200' : 'text-red-300'}`}>CURRENT TEMPERATURE</div>
                <div className="text-white text-6xl font-black" style={{ textShadow: dangerModalData.type === 'warning' ? '0 0 30px rgba(251,146,60,0.5)' : '0 0 30px rgba(255,0,0,0.5)' }}>
                  {dangerModalData.currentTemp?.toFixed(1)}°C
                </div>
                <div className={`text-base mt-2 ${dangerModalData.type === 'warning' ? 'text-orange-300' : 'text-red-400'}`}>
                  Target: <span className="font-bold text-white">{dangerModalData.target}°C</span>
                </div>
              </div>

              {/* Status */}
              <div className="grid grid-cols-2 gap-3">
                <div className={`rounded-xl p-3 border ${dangerModalData.type === 'warning' ? 'bg-orange-900/60 border-orange-400/30' : 'bg-red-950/60 border-red-500/30'}`}>
                  <div className={`text-xs font-semibold ${dangerModalData.type === 'warning' ? 'text-orange-200' : 'text-red-300'}`}>📧 Alert Sent To</div>
                  <div className="text-white text-base font-bold truncate">{dangerModalData.emailSentTo}</div>
                </div>
                <div className={`rounded-xl p-3 border ${dangerModalData.type === 'warning' ? 'bg-orange-900/60 border-orange-400/30' : 'bg-red-950/60 border-red-500/30'}`}>
                  <div className={`text-xs font-semibold ${dangerModalData.type === 'warning' ? 'text-orange-200' : 'text-red-300'}`}>⏱️ Time Remaining</div>
                  <div className="text-white text-base font-bold">{dangerModalData.timeRemaining ? `${Math.floor(dangerModalData.timeRemaining / 60)}:${(dangerModalData.timeRemaining % 60).toString().padStart(2, '0')}` : 'N/A'}</div>
                </div>
              </div>

              {/* Success Message */}
              <div className="flex items-center justify-center gap-2 text-green-400 text-base font-semibold bg-green-900/30 rounded-xl p-3 border border-green-500/30">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                Alert successfully delivered!
              </div>

              {/* Acknowledge Button - Collapses to Top Bar */}
              <button
                onClick={() => {
                  setShowDangerModal(false)
                  setShowTopCountdownBar(true)
                  setTopBarAlertType(dangerModalData.type)
                  setTopBarMessage(dangerModalData.title || 'Alert Active')
                  setTopBarContact({
                    name: recipients[0]?.name || 'Recipient',
                    email: dangerModalData.emailSentTo || recipients[0]?.email || ''
                  })
                }}
                className={`w-full py-3 font-bold text-lg rounded-xl transition-all shadow-lg ${dangerModalData.type === 'warning' ? 'bg-white text-orange-700 hover:bg-orange-50' : 'bg-white text-red-700 hover:bg-red-50'}`}
              >
                ACKNOWLEDGE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GLOWING TOP COUNTDOWN BAR - Color changes: ORANGE (>5min) → RED (≤5min) */}
      {showTopCountdownBar && (() => {
        const isUrgent = predictedTime !== null && predictedTime <= 300;
        return (
          <div className={`fixed top-0 left-80 right-0 z-[99998] shadow-2xl animate-in slide-in-from-top duration-300
            ${isUrgent
              ? 'bg-gradient-to-r from-red-700 via-red-600 to-red-700'
              : 'bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600'
            }`}
          >
            <div className="flex items-center justify-between py-4 px-8">
              {/* Left: Alert Message */}
              <div className="flex items-center gap-4 min-w-[280px]">
                <span className="text-white text-3xl animate-pulse">{isUrgent ? '🚨' : '⏰'}</span>
                <div>
                  <div className="text-white font-black text-xl">{topBarMessage}</div>
                  <div className="text-white/80 text-sm">Temperature monitoring active</div>
                </div>
              </div>

              {/* Center: Countdown + Current Temp */}
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-white/70 text-xs uppercase tracking-wider mb-1">Time Remaining</div>
                  <span className={`inline-block text-white text-4xl font-black px-8 py-3 rounded-xl animate-pulse
                    ${isUrgent
                      ? 'bg-red-900/60 shadow-[0_0_40px_rgba(239,68,68,0.9)] ring-2 ring-red-300/50'
                      : 'bg-orange-800/60 shadow-[0_0_40px_rgba(251,146,60,0.9)] ring-2 ring-orange-300/50'
                    }`}
                  >
                    {predictedTime !== null && predictedTime >= 0
                      ? `${Math.floor(predictedTime / 60).toString().padStart(2, '0')}:${(predictedTime % 60).toString().padStart(2, '0')}`
                      : '00:00'
                    }
                  </span>
                </div>
                <div className="text-center border-l border-white/30 pl-6">
                  <div className="text-white/70 text-xs uppercase tracking-wider mb-1">Current Temp</div>
                  <div className="text-white text-2xl font-bold">{currentTemp?.toFixed(1)}°C</div>
                </div>
              </div>

              {/* Right: Contact Info + Close */}
              <div className="flex items-center gap-6 min-w-[250px] justify-end">
                <div className="text-right">
                  <div className="text-white/70 text-xs uppercase tracking-wider">Alert sent to:</div>
                  <div className="text-white text-base font-bold">{topBarContact.name}</div>
                  <div className="text-white/80 text-sm">{topBarContact.email}</div>
                </div>
                <button
                  onClick={() => setShowTopCountdownBar(false)}
                  className="text-white/70 hover:text-white text-2xl font-bold transition-colors p-2 hover:bg-white/10 rounded-lg"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  )
}
