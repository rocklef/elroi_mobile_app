'use client';

import { WifiOff, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#050A24] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* Offline Icon */}
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1E3A5F]/50 to-[#0A1628] flex items-center justify-center border border-[#00D4FF]/20">
            <WifiOff className="w-12 h-12 text-[#00D4FF]" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-white mb-4">
          You're Offline
        </h1>

        {/* Description */}
        <p className="text-[#8B9DC3] mb-8 leading-relaxed">
          It looks like you've lost your internet connection.
          Please check your network settings and try again.
        </p>

        {/* Retry Button */}
        <button
          onClick={handleRetry}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00D4FF] to-[#0088CC] text-[#050A24] font-semibold rounded-lg hover:opacity-90 transition-opacity"
        >
          <RefreshCw className="w-5 h-5" />
          Try Again
        </button>

        {/* Tips */}
        <div className="mt-12 text-left bg-[#0A1628]/50 rounded-lg p-4 border border-[#1E3A5F]/30">
          <h3 className="text-sm font-medium text-[#00D4FF] mb-3">
            Troubleshooting Tips:
          </h3>
          <ul className="text-sm text-[#8B9DC3] space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-[#00D4FF]">•</span>
              Check if WiFi or mobile data is enabled
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00D4FF]">•</span>
              Try moving closer to your router
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00D4FF]">•</span>
              Restart your device if the problem persists
            </li>
          </ul>
        </div>

        {/* ELROI Branding */}
        <div className="mt-8 text-sm text-[#4A5568]">
          ELROI Predictive Maintenance
        </div>
      </div>
    </div>
  );
}
