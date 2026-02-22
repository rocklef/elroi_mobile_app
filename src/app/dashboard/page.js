'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import TopNav from '@/components/TopNav'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const router = useRouter()
  const [thresholdTemp, setThresholdTemp] = useState(40.0)
  const [liveData, setLiveData] = useState({
    temperature: null,
    pressure: null,
    humidity: null,
    vibration: null
  })

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
      } else {
        setUser(session.user)
      }
    }

    checkUser()

    const loadLatestData = () => {
      try {
        const savedReports = localStorage.getItem('predictive_reports')
        if (savedReports) {
          const reports = JSON.parse(savedReports)
          if (reports.Temperature && reports.Temperature.length > 0) {
            const latestTemp = reports.Temperature[reports.Temperature.length - 1]
            if (latestTemp.values && latestTemp.values.length > 0) {
              const currentTemp = latestTemp.values[latestTemp.values.length - 1]
              const avgTemp = (latestTemp.values.reduce((a, b) => a + b, 0) / latestTemp.values.length).toFixed(1)
              setLiveData(prev => ({ ...prev, temperature: { current: currentTemp.toFixed(1), average: avgTemp } }))
            }
          }
        }
        const alertConfig = localStorage.getItem('alertConfig')
        if (alertConfig) {
          const config = JSON.parse(alertConfig)
          if (config.thresholdTemp) setThresholdTemp(config.thresholdTemp)
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      }
    }

    loadLatestData()
    const dataInterval = setInterval(loadLatestData, 5000)

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.push('/login')
      else setUser(session.user)
    })

    return () => {
      subscription.unsubscribe()
      clearInterval(dataInterval)
    }
  }, [router])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F6FA]">
        <div className="w-8 h-8 border-4 border-[#0B1E4A] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const getFirstName = (email) => {
    if (!email) return 'User'
    const name = email.split('@')[0]
    const parts = name.split(/[._-]/)
    return parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const parameters = [
    {
      id: 'temperature',
      title: 'Temperature',
      value: liveData.temperature ? liveData.temperature.current : thresholdTemp.toFixed(1),
      unit: '°C',
      subtext: liveData.temperature ? `Avg ${liveData.temperature.average}°C` : 'Threshold value',
      accentColor: '#3B82F6',
      bgLight: '#EFF6FF',
      status: 'normal',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z" />
        </svg>
      )
    },
    {
      id: 'pressure',
      title: 'Pressure',
      value: '2.1',
      unit: 'bar',
      subtext: '−0.2 predicted',
      accentColor: '#F97316',
      bgLight: '#FFF7ED',
      status: 'normal',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2a10 10 0 00-7.07 17.07M12 2a10 10 0 017.07 17.07M12 2v2m0 10l3.5-5" />
          <circle cx="12" cy="14" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      )
    },
    {
      id: 'humidity',
      title: 'Humidity',
      value: '58',
      unit: '%',
      subtext: 'Trending upward',
      accentColor: '#10B981',
      bgLight: '#ECFDF5',
      status: 'normal',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3c0 0-7 7-7 11a7 7 0 0014 0c0-4-7-11-7-11z" />
        </svg>
      )
    },
    {
      id: 'vibration',
      title: 'Vibration',
      value: '2.3',
      unit: 'mm/s',
      subtext: 'RMS velocity',
      accentColor: '#8B5CF6',
      bgLight: '#F5F3FF',
      status: 'normal',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      )
    }
  ]

  const statusMap = {
    normal: { dot: 'bg-green-400', label: 'Normal', text: 'text-green-600' },
    warning: { dot: 'bg-amber-400', label: 'Warning', text: 'text-amber-600' },
    critical: { dot: 'bg-red-500', label: 'Critical', text: 'text-red-600' },
  }

  return (
    <div className="flex min-h-screen bg-[#F2F2F7]">
      <Sidebar activeSection="dashboard" />

      <div className="flex-1 flex flex-col">
        <TopNav title="Dashboard" />

        <main className="flex-1 p-4 md:p-8 pb-28 md:pb-8 overflow-y-auto">
          <div className="max-w-2xl mx-auto md:max-w-none">

            {/* Greeting */}
            <div className="mb-5">
              <h2 className="text-xl font-bold text-gray-900">{getGreeting()}, {getFirstName(user.email)}</h2>
              <p className="text-sm text-gray-400 mt-0.5">Real-time system monitoring</p>
            </div>

            {/* System Status Banner */}
            <div className="bg-[#0B1E4A] rounded-2xl p-4 mb-5 flex items-center justify-between">
              <div>
                <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">System Status</p>
                <p className="text-white font-bold text-base mt-1">All Systems Operational</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-400"></span>
                </span>
                <span className="text-green-400 text-xs font-semibold">Live</span>
              </div>
            </div>

            {/* Section heading */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Parameters</h3>
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold active:scale-95 transition-transform"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>

            {/* 2x2 Parameter Cards Grid */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              {parameters.map((param) => {
                const s = statusMap[param.status]
                return (
                  <div
                    key={param.id}
                    onClick={() => router.push(`/dashboard/${param.id}`)}
                    className="bg-white rounded-2xl p-4 cursor-pointer active:scale-95 transition-all duration-150 shadow-sm border border-gray-100/80"
                  >
                    {/* Icon + Status row */}
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: param.bgLight, color: param.accentColor }}
                      >
                        {param.icon}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        <span className={`text-[10px] font-bold ${s.text}`}>{s.label}</span>
                      </div>
                    </div>

                    {/* Value */}
                    <div className="mb-1">
                      <span className="text-[26px] font-bold text-gray-900 leading-none">{param.value}</span>
                      <span className="text-sm font-medium text-gray-400 ml-1">{param.unit}</span>
                    </div>

                    {/* Title + subtext */}
                    <p className="text-xs font-bold text-gray-700">{param.title}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{param.subtext}</p>
                  </div>
                )
              })}
            </div>

            {/* Add Parameter Card */}
            <div
              className="bg-white rounded-2xl p-4 cursor-pointer active:scale-95 transition-all duration-150 border-2 border-dashed border-gray-200 flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-600">Add Parameter</p>
                <p className="text-xs text-gray-400">Configure a new sensor</p>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
