'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function TopNav({ title = "Dashboard" }) {
  const [notifications] = useState(2)
  const [mounted, setMounted] = useState(false)
  const [currentTime, setCurrentTime] = useState('')
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }))
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="bg-white/90 backdrop-blur-md border-b border-gray-200/80 sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 md:px-8 h-14">
        <h1 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h1>
        <div className="flex items-center gap-3">
          <span className="hidden md:block text-sm text-gray-400 font-medium">{mounted ? currentTime : ''}</span>
          <button
            onClick={() => router.push('/dashboard/alerts')}
            className="relative w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
          >
            <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {notifications > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {notifications}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
