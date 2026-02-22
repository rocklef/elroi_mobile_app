'use client'

import { useState, useEffect, useRef } from 'react'
import Sidebar from '@/components/Sidebar'
import TopNav from '@/components/TopNav'
import { useToast } from '@/components/ui/ToastContext'
import { Thermometer, Clock, AlertTriangle, TrendingDown, Activity, Upload, X, Settings } from 'lucide-react'
import PullToRefresh from '@/components/PullToRefresh'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'

// Simplified Temperature Gauge Component
function TemperatureGauge({ value = 42.5, threshold = 31.7, target = 40.0, onThresholdChange }) {
  const { addToast } = useToast()
  const [showThresholdInput, setShowThresholdInput] = useState(false)
  const [tempThreshold, setTempThreshold] = useState(threshold)

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v))
  const min = 25
  const max = 60

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
  const targetEnd = polarToCartesian(cx, cy, radius - 8, mapTempToAngle(target))
  const exceeded = value <= threshold

  const handleApplyThreshold = () => {
    const newValue = parseFloat(tempThreshold)
    if (!isNaN(newValue)) {
      onThresholdChange?.(newValue)
      setShowThresholdInput(false)
      addToast('Threshold updated successfully', 'success')
    } else {
      addToast('Please enter a valid number', 'error')
    }
  }

  useEffect(() => {
    setTempThreshold(threshold)
  }, [threshold])

  return (
    <div className={`rounded-2xl p-5 shadow-lg border-2 transition-all ${exceeded
      ? 'border-red-500 bg-red-50 shadow-red-200'
      : 'border-gray-200 bg-white'
      }`}>
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Thermometer className="w-5 h-5 text-blue-600" />
          Temperature Gauge
        </h3>
      </div>

      <div className="relative flex items-center justify-center">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          {/* SVG Definitions for gradients and filters */}
          <defs>
            <linearGradient id="safeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>
            <linearGradient id="dangerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
            <filter id="needleGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="centerDot" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </radialGradient>
          </defs>

          <path d={describeArc(cx, cy, radius, 0, 180)} stroke="#E5F3FA" strokeWidth="20" fill="none" />
          <path d={describeArc(cx, cy, radius, safeStart, safeEnd)} stroke="url(#safeGradient)" strokeWidth="20" fill="none" strokeLinecap="round" />
          <path d={describeArc(cx, cy, radius, dangerStart, dangerEnd)} stroke="url(#dangerGradient)" strokeWidth="20" fill="none" strokeLinecap="round" />
          <line x1={cx} y1={cy} x2={thEnd.x} y2={thEnd.y} stroke="#f97316" strokeWidth="2" strokeDasharray="4 4" />
          <line x1={cx} y1={cy} x2={targetEnd.x} y2={targetEnd.y} stroke="#ef4444" strokeWidth="2" strokeDasharray="4 4" />
          <line x1={cx} y1={cy} x2={needleEnd.x} y2={needleEnd.y} stroke="#0ea5e9" strokeWidth="4" strokeLinecap="round" filter="url(#needleGlow)" />
          <circle cx={cx} cy={cy} r="10" fill="url(#centerDot)" stroke="#38bdf8" strokeWidth="3" />
        </svg>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-black text-gray-900">{value.toFixed(1)}</span>
          <span className="text-2xl font-bold text-gray-700">°C</span>
        </div>
        <div className="text-right space-y-1">
          <div className="text-sm text-gray-600">
            Threshold: <span className="font-bold text-orange-600">{threshold.toFixed(1)}°C</span>
          </div>
          <div className="text-sm text-gray-600">
            Target: <span className="font-bold text-red-600">{target.toFixed(1)}°C</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => setShowThresholdInput(!showThresholdInput)}
          className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-semibold rounded-lg transition-all"
        >
          {showThresholdInput ? 'Cancel' : 'Set Threshold'}
        </button>
        {exceeded && (
          <div className="flex-1 px-3 py-2 bg-red-600 text-white text-sm font-bold rounded-lg text-center animate-pulse">
            DANGER!
          </div>
        )}
      </div>

      {showThresholdInput && (
        <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Enter New Threshold (°C)</label>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.1"
              value={tempThreshold}
              onChange={(e) => setTempThreshold(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-base text-gray-900 bg-white focus:ring-2 focus:ring-blue-500"
              placeholder="Enter threshold"
            />
            <button
              onClick={handleApplyThreshold}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg"
            >
              Apply
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-500">Current: {threshold.toFixed(1)}°C</p>
        </div>
      )}
    </div>
  )
}

export default function TemperaturePage() {
  const { addToast } = useToast()
  const [activeTab, setActiveTab] = useState('live')
  const [currentTemp, setCurrentTemp] = useState(42.5)
  const [userThreshold, setUserThreshold] = useState(31.7)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isLiveMode, setIsLiveMode] = useState(false)
  const [temperatureReadings, setTemperatureReadings] = useState([])
  const [predictedTime, setPredictedTime] = useState(null)
  const [isPredicting, setIsPredicting] = useState(false)

  // Alert configuration
  const [showAlertModal, setShowAlertModal] = useState(false)
  const [recipients, setRecipients] = useState([])
  const [alertLeadTime, setAlertLeadTime] = useState(10)

  // Update Threshold Modal
  const [showUpdateThresholdModal, setShowUpdateThresholdModal] = useState(false)
  const [newThresholdValue, setNewThresholdValue] = useState(31.7)

  // Alert flags - track if alerts have been sent this session
  const alertFlags = useRef({ warningSent: false, criticalSent: false })

  // Data analysis
  const fileInputRef = useRef(null)
  const [uploadedData, setUploadedData] = useState(null)
  const [analysisData, setAnalysisData] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    param1: 'Time: 00:00 to 24:59 | Sensor: Temp-A1',
    param2: 'Sample Rate: Every 5 seconds | Location: Zone-B',
    param3: 'Source: Production Line 3 | Date: 2025-06-04'
  })

  const TARGET_TEMP = 40.0

  // Load settings
  useEffect(() => {
    const savedSettings = localStorage.getItem('systemSettings')
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setUserThreshold(settings.thresholdTemp || 31.7)
    }

    const savedAlertConfig = localStorage.getItem('alertConfig')
    if (savedAlertConfig) {
      const config = JSON.parse(savedAlertConfig)
      setRecipients(config.recipients || [])
      setAlertLeadTime(config.leadTimeMinutes || 10)
    }
  }, [])

  // Fetch live temperature data
  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        const res = await fetch(`/api/live-temperature?t=${Date.now()}`, {
          cache: 'no-store'
        })
        const data = await res.json()

        if (data.isLive && data.temperature !== undefined) {
          setCurrentTemp(data.temperature)
          setIsLiveMode(true)
          if (data.readings) setTemperatureReadings(data.readings)
        } else {
          setIsLiveMode(false)
        }
      } catch (error) {
        console.error('Error fetching live data:', error)
        setIsLiveMode(false)
      }
      setCurrentTime(new Date())
    }

    fetchLiveData()
    const interval = setInterval(fetchLiveData, 1000)
    return () => clearInterval(interval)
  }, [])

  // Prediction functions
  const startPrediction = async () => {
    try {
      setIsPredicting(true)
      setPredictedTime(null)
      alertFlags.current = { warningSent: false, criticalSent: false }

      const res = await fetch('/api/start-prediction', { method: 'POST' })
      const data = await res.json()

      if (data.started) {
        addToast('Prediction monitoring started', 'success')
      } else {
        setIsPredicting(false)
        addToast('Failed to start prediction', 'error')
      }
    } catch (error) {
      console.error('Error starting prediction:', error)
      setIsPredicting(false)
      addToast('Error starting prediction', 'error')
    }
  }

  const stopPrediction = async () => {
    try {
      await fetch('/api/stop-prediction', { method: 'POST' })
      setIsPredicting(false)
      setPredictedTime(null)
      addToast('Prediction monitoring stopped', 'info')
    } catch (error) {
      console.error('Error stopping prediction:', error)
    }
  }

  useEffect(() => {
    if (!isPredicting) return

    const checkPrediction = async () => {
      try {
        const res = await fetch('/api/check-prediction')
        const data = await res.json()

        if (data.timeToThreshold !== null && data.timeToThreshold > 0) {
          setPredictedTime(data.timeToThreshold)
        }
      } catch (error) {
        console.error('Error checking prediction:', error)
      }
    }

    checkPrediction()
    const interval = setInterval(checkPrediction, 5000)
    return () => clearInterval(interval)
  }, [isPredicting])

  useEffect(() => {
    if (predictedTime === null || predictedTime <= 0) return

    const timer = setInterval(() => {
      setPredictedTime(prev => prev > 0 ? prev - 1 : 0)
    }, 1000)

    return () => clearInterval(timer)
  }, [predictedTime])

  // Automatic time-based email alerts
  useEffect(() => {
    if (predictedTime === null || predictedTime <= 0) return
    if (recipients.length === 0) return

    const sendAlert = async (etaMinutes, isDanger) => {
      try {
        await fetch('/api/send-alert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            emails: recipients.map(r => r.email),
            currentTemp: currentTemp,
            threshold: userThreshold,
            etaMinutes,
            isDanger,
            recipientNames: recipients.map(r => r.name)
          })
        })
      } catch (error) {
        console.error(`Failed to send ${etaMinutes}-min alert:`, error)
      }
    }

    // 10-minute warning
    if (predictedTime <= 600 && !alertFlags.current.warningSent) {
      alertFlags.current.warningSent = true
      addToast(`⚠️ Warning: Temperature will reach threshold in ~10 minutes!`, 'warning')
      sendAlert(10, false)
    }

    // 5-minute critical
    if (predictedTime <= 300 && !alertFlags.current.criticalSent) {
      alertFlags.current.criticalSent = true
      addToast(`🚨 Critical: Temperature will reach threshold in ~5 minutes!`, 'error')
      sendAlert(5, true)
    }
  }, [predictedTime, recipients, currentTemp, userThreshold, addToast])

  // File upload and analysis
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('param1', uploadForm.param1)
    formData.append('param2', uploadForm.param2)
    formData.append('param3', uploadForm.param3)

    try {
      const res = await fetch('/api/upload-temperature-data', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (data.success) {
        setUploadedData(data.data)
        processAnalysis(data.data)
        addToast('File uploaded and analyzed successfully!', 'success')
      } else {
        addToast('Failed to upload file', 'error')
        setIsProcessing(false)
      }
    } catch (error) {
      console.error('Upload error:', error)
      addToast('Error uploading file', 'error')
      setIsProcessing(false)
    }
  }

  const processAnalysis = (data) => {
    setTimeout(() => {
      const chartData = data.times.map((time, idx) => ({
        time,
        actual: data.current[idx],
        predicted: data.predicted[idx],
        threshold: userThreshold
      }))

      setAnalysisData({
        ...data,
        chartData
      })
      setIsProcessing(false)
    }, 500)
  }

  const handleThresholdChange = (newThreshold) => {
    setUserThreshold(newThreshold)

    const savedSettings = localStorage.getItem('systemSettings')
    const settings = savedSettings ? JSON.parse(savedSettings) : {}
    settings.thresholdTemp = newThreshold
    localStorage.setItem('systemSettings', JSON.stringify(settings))

    window.dispatchEvent(new Event('storage'))
  }

  const handleSaveAlertSettings = () => {
    const config = {
      recipients,
      leadTimeMinutes: alertLeadTime
    }
    localStorage.setItem('alertConfig', JSON.stringify(config))
    setShowAlertModal(false)
    addToast('Alert settings saved!', 'success')
  }

  const formatTime = (seconds) => {
    if (!seconds) return '--:--'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex h-screen bg-[#F2F2F7]">
      <Sidebar activeSection="reporting" />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopNav title="Temperature" />

        <PullToRefresh>
          <div className="max-w-7xl mx-auto px-4 py-5 pb-24 md:px-8 md:py-10 md:pb-10">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Temperature Monitoring</h1>
                  {isPredicting && (
                    <span className="relative flex h-3 w-3">
                      <span className="animate-live-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-base mt-2">Real-time predictive maintenance dashboard</p>
              </div>
              <button
                onClick={() => setShowAlertModal(true)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm font-semibold">Alert Settings</span>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 bg-white rounded-xl p-1.5 shadow-sm border border-gray-200 w-fit">
              <button
                onClick={() => setActiveTab('live')}
                className={`cursor-pointer px-6 py-2.5 font-semibold text-sm rounded-lg transition-all ${activeTab === 'live'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                Live Data
              </button>
              <button
                onClick={() => setActiveTab('analysis')}
                className={`cursor-pointer px-6 py-2.5 font-semibold text-sm rounded-lg transition-all ${activeTab === 'analysis'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                Data Analysis
              </button>
            </div>

            {/* LIVE DATA TAB */}
            {activeTab === 'live' && (
              <div className="space-y-6">
                {/* Three Metric Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 border-l-4 border-l-indigo-500">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-5 h-5 text-indigo-600" />
                      <span className="text-sm font-semibold text-gray-600 uppercase">Time</span>
                    </div>
                    <div className="text-4xl md:text-5xl font-black text-indigo-700">
                      {currentTime.getHours().toString().padStart(2, '0')}:
                      {currentTime.getMinutes().toString().padStart(2, '0')}
                    </div>
                    <div className="text-lg text-indigo-500 font-semibold mt-1">
                      :{currentTime.getSeconds().toString().padStart(2, '0')}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 border-l-4 border-l-blue-500">
                    <div className="flex items-center gap-2 mb-3">
                      <Thermometer className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-semibold text-gray-600 uppercase">Temperature</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl md:text-5xl font-black text-blue-700">{currentTemp.toFixed(1)}</span>
                      <span className="text-2xl font-bold text-blue-600">°C</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      {isLiveMode ? (
                        <span className="text-green-600 font-semibold flex items-center gap-1.5">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-live-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                          </span>
                          Live
                        </span>
                      ) : (
                        <span className="text-gray-400">Simulated</span>
                      )}
                    </div>
                  </div>

                  <div className={`bg-white rounded-xl p-5 shadow-sm border border-gray-200 border-l-4 ${
                    predictedTime !== null && predictedTime > 0 && predictedTime <= 300
                      ? 'border-l-red-500'
                      : predictedTime !== null && predictedTime > 0 && predictedTime <= 600
                        ? 'border-l-orange-500'
                        : 'border-l-orange-500'
                  }`}>
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className={`w-5 h-5 ${
                        predictedTime !== null && predictedTime > 0 && predictedTime <= 300
                          ? 'text-red-600'
                          : 'text-orange-600'
                      }`} />
                      <span className="text-sm font-semibold text-gray-600 uppercase">ETA to 40°C</span>
                    </div>
                    {predictedTime !== null && predictedTime > 0 ? (
                      <>
                        <div className={`text-4xl md:text-5xl font-black ${
                          predictedTime <= 300
                            ? 'text-red-600 animate-pulse'
                            : predictedTime <= 600
                              ? 'text-orange-600'
                              : 'text-green-600'
                        }`}>
                          {formatTime(predictedTime)}
                        </div>
                        <div className={`text-sm font-semibold mt-2 ${
                          predictedTime <= 300
                            ? 'text-red-600'
                            : predictedTime <= 600
                              ? 'text-orange-600'
                              : 'text-green-600'
                        }`}>
                          {Math.floor(predictedTime / 60)} minutes remaining
                          {predictedTime <= 300 && ' — CRITICAL'}
                          {predictedTime > 300 && predictedTime <= 600 && ' — WARNING'}
                        </div>
                      </>
                    ) : isPredicting ? (
                      <>
                        <div className="text-4xl font-black text-amber-600 animate-pulse">...</div>
                        <div className="text-sm text-amber-600 font-semibold mt-2">Collecting data</div>
                      </>
                    ) : (
                      <>
                        <div className="text-4xl font-black text-gray-400">--:--</div>
                        <div className="text-sm text-gray-500 font-semibold mt-2">Start monitoring to see</div>
                      </>
                    )}
                  </div>
                </div>

                {/* Temperature Gauge */}
                <TemperatureGauge
                  value={currentTemp}
                  threshold={userThreshold}
                  target={TARGET_TEMP}
                  onThresholdChange={handleThresholdChange}
                />

                {/* Action Buttons Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Configure Alert Email */}
                  <button
                    onClick={() => setShowAlertModal(true)}
                    style={{ background: 'linear-gradient(135deg, #9333ea, #7c3aed)' }}
                    className="min-h-[80px] flex flex-col items-center justify-center gap-2 p-4 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-transform"
                  >
                    <Settings className="w-7 h-7" />
                    <span className="text-sm font-semibold">Configure Alert</span>
                  </button>

                  {/* Start/Stop Monitoring */}
                  {!isPredicting ? (
                    <button
                      onClick={startPrediction}
                      style={{ background: 'linear-gradient(135deg, #3b82f6, #14b8a6)' }}
                      className="min-h-[80px] flex items-center justify-center gap-3 p-4 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-transform hover:shadow-xl"
                    >
                      <div className="w-8 h-8 bg-white/30 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xl">▶</span>
                      </div>
                      <span className="text-base font-semibold">Start Monitoring</span>
                    </button>
                  ) : (
                    <button
                      onClick={stopPrediction}
                      style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
                      className="min-h-[80px] flex flex-col items-center justify-center gap-2 p-4 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-transform"
                    >
                      <Activity className="w-7 h-7" />
                      <span className="text-sm font-semibold">Stop Monitoring</span>
                    </button>
                  )}

                  {/* Pause */}
                  <button
                    onClick={() => {
                      if (isPredicting) {
                        stopPrediction()
                        addToast('Monitoring paused', 'info')
                      }
                    }}
                    className="min-h-[80px] flex flex-col items-center justify-center gap-2 p-4 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-2xl shadow-sm active:scale-95 transition-transform hover:border-gray-300"
                  >
                    <svg className="h-6 w-6 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="5" y="4" width="4" height="16" rx="1.5" />
                      <rect x="15" y="4" width="4" height="16" rx="1.5" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-700">Pause</span>
                  </button>

                  {/* Update Threshold */}
                  <button
                    onClick={() => setShowUpdateThresholdModal(true)}
                    style={{ background: 'linear-gradient(135deg, #ec4899, #f43f5e)' }}
                    className="min-h-[80px] flex flex-col items-center justify-center gap-2 p-4 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-transform"
                  >
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <circle cx="12" cy="12" r="9" strokeWidth="2" />
                      <circle cx="12" cy="12" r="4" strokeWidth="2" />
                      <line x1="12" y1="2" x2="12" y2="8" strokeWidth="2" strokeLinecap="round" />
                      <line x1="12" y1="16" x2="12" y2="22" strokeWidth="2" strokeLinecap="round" />
                      <line x1="2" y1="12" x2="8" y2="12" strokeWidth="2" strokeLinecap="round" />
                      <line x1="16" y1="12" x2="22" y2="12" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <span className="text-sm font-semibold">Update Threshold</span>
                  </button>
                </div>

                {/* Monitoring Status */}
                {isPredicting && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 justify-center">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-live-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                    </span>
                    <p className="text-sm text-amber-800 font-semibold">
                      Monitoring active - Collecting temperature data for prediction
                    </p>
                  </div>
                )}

                {/* Temperature Data Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-50 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                        <Thermometer className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-purple-800">Temperature Data</h3>
                        <p className="text-sm text-gray-600">Live readings log</p>
                      </div>
                    </div>
                  </div>

                  {temperatureReadings.length > 0 ? (
                    <>
                      <div className="overflow-x-auto">
                        <table className="w-full table-striped">
                          <thead>
                            <tr className="bg-purple-50 border-b border-purple-100">
                              <th className="text-left py-3 px-4 text-sm font-bold text-purple-800 uppercase tracking-wider">Timestamp</th>
                              <th className="text-center py-3 px-4 text-sm font-bold text-purple-800 uppercase tracking-wider">Temp (°C)</th>
                              <th className="text-right py-3 px-4 text-sm font-bold text-purple-800 uppercase tracking-wider">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {temperatureReadings.slice(-10).reverse().map((reading, idx) => (
                              <tr key={idx} className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors">
                                <td className="py-3 px-4 text-base text-gray-700">{reading.timestamp}</td>
                                <td className="py-3 px-4 text-center text-lg font-bold text-blue-600">{reading.temperature?.toFixed(2)}</td>
                                <td className="py-3 px-4 text-right">
                                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${reading.temperature <= userThreshold
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-green-100 text-green-700'
                                    }`}>
                                    {reading.temperature <= userThreshold ? 'Alert' : 'Normal'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <p className="text-sm text-gray-500 py-3 text-center bg-gray-50">Showing last 10 readings</p>
                    </>
                  ) : (
                    <div className="py-12 text-center text-gray-500">
                      <p className="text-base">No readings available</p>
                      <p className="text-sm mt-1">Start monitoring to see live data</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* DATA ANALYSIS TAB */}
            {activeTab === 'analysis' && (
              <div className="space-y-6">
                {/* Upload Section - Simple */}
                {!analysisData && (
                  <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="cursor-pointer border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-500 hover:bg-blue-50 transition-all"
                    >
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-xl font-bold text-gray-900 mb-2">
                        {isProcessing ? 'Processing...' : 'Upload files here'}
                      </p>
                      <p className="text-base text-gray-500">
                        Supports .xlsx, .xls, .csv files
                      </p>
                    </div>
                  </div>
                )}

                {/* Analysis Results */}
                {analysisData && (
                  <>
                    {/* Chart */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Temperature Profile</h3>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={analysisData.chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Legend />
                            <ReferenceLine y={userThreshold} stroke="#f97316" strokeDasharray="3 3" label="Threshold" />
                            <Line type="monotone" dataKey="actual" stroke="#2563eb" strokeWidth={2} dot={false} name="Actual" />
                            <Line type="monotone" dataKey="predicted" stroke="#60a5fa" strokeWidth={2} dot={false} name="Predicted" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Data Table */}
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Data Table</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full table-striped">
                          <thead>
                            <tr className="border-b-2 border-gray-200">
                              <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 uppercase">Time</th>
                              <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 uppercase">Actual (°C)</th>
                              <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 uppercase">Predicted (°C)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {analysisData.times.slice(0, 20).map((time, idx) => (
                              <tr key={idx} className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors">
                                <td className="py-3 px-4 text-base text-gray-900">{time}</td>
                                <td className="py-3 px-4 text-base font-bold text-blue-700">{analysisData.current[idx]?.toFixed(2)}</td>
                                <td className="py-3 px-4 text-base font-bold text-cyan-700">{analysisData.predicted[idx]?.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <p className="text-sm text-gray-500 mt-3 text-center">
                        Showing first 20 of {analysisData.times.length} rows
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </PullToRefresh>
      </div>

      {/* Alert Settings Modal */}
      {
        showAlertModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Alert Settings</h3>
                  <button
                    onClick={() => setShowAlertModal(false)}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-all"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Lead Time (minutes)
                  </label>
                  <input
                    type="number"
                    value={alertLeadTime}
                    onChange={(e) => setAlertLeadTime(parseInt(e.target.value) || 10)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-base text-gray-900 bg-white focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Alert will be sent {alertLeadTime} minutes before threshold
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Recipients ({recipients.length})
                  </label>
                  <p className="text-sm text-gray-600">
                    Manage recipients in the Alerts page
                  </p>
                </div>

                <button
                  onClick={handleSaveAlertSettings}
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all shadow-md text-base"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Update Threshold Modal */}
      {showUpdateThresholdModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-pink-500 to-orange-500 px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Update Threshold</h3>
                <button
                  onClick={() => setShowUpdateThresholdModal(false)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-all"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Enter New Threshold (°C)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={newThresholdValue}
                    onChange={(e) => setNewThresholdValue(e.target.value)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-base text-gray-900 bg-white focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => {
                      const newValue = parseFloat(newThresholdValue)
                      if (!isNaN(newValue)) {
                        handleThresholdChange(newValue)
                        setShowUpdateThresholdModal(false)
                        addToast('Threshold updated successfully!', 'success')
                      } else {
                        addToast('Please enter a valid number', 'error')
                      }
                    }}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all"
                  >
                    Apply
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Current: {userThreshold.toFixed(1)}°C
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div >
  )
}
