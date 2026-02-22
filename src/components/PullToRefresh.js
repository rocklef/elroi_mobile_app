'use client'

import { useState, useRef, useEffect } from 'react'

export default function PullToRefresh({ children, onRefresh }) {
    const [isPulling, setIsPulling] = useState(false)
    const [pullDistance, setPullDistance] = useState(0)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const containerRef = useRef(null)
    const startY = useRef(0)
    const THRESHOLD = 80

    const handleTouchStart = (e) => {
        if (containerRef.current?.scrollTop === 0) {
            startY.current = e.touches[0].clientY
            setIsPulling(true)
        }
    }

    const handleTouchMove = (e) => {
        if (!isPulling || isRefreshing) return

        const currentY = e.touches[0].clientY
        const diff = currentY - startY.current

        if (diff > 0 && containerRef.current?.scrollTop === 0) {
            setPullDistance(Math.min(diff * 0.5, THRESHOLD + 20))
        }
    }

    const handleTouchEnd = async () => {
        if (pullDistance >= THRESHOLD && !isRefreshing) {
            setIsRefreshing(true)
            setPullDistance(THRESHOLD)

            if (onRefresh) {
                await onRefresh()
            } else {
                // Default: reload the page
                window.location.reload()
            }

            setTimeout(() => {
                setIsRefreshing(false)
                setPullDistance(0)
            }, 500)
        } else {
            setPullDistance(0)
        }
        setIsPulling(false)
    }

    return (
        <div
            ref={containerRef}
            className="flex-1 overflow-auto relative"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Pull indicator */}
            {pullDistance > 0 && (
                <div
                    className="absolute left-0 right-0 flex items-center justify-center z-50 transition-all"
                    style={{ top: pullDistance - 50, height: 50 }}
                >
                    <div className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full shadow-lg ${isRefreshing ? 'animate-pulse' : ''}`}>
                        <svg
                            className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : pullDistance >= THRESHOLD ? 'rotate-180' : ''} transition-transform`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                        <span className="text-sm font-semibold">
                            {isRefreshing ? 'Refreshing...' : pullDistance >= THRESHOLD ? 'Release to refresh' : 'Pull to refresh'}
                        </span>
                    </div>
                </div>
            )}

            {/* Content with pull offset */}
            <div style={{ transform: `translateY(${pullDistance}px)`, transition: isPulling ? 'none' : 'transform 0.2s' }}>
                {children}
            </div>
        </div>
    )
}
