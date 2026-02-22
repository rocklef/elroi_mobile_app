'use client';

import { WifiOff } from 'lucide-react';
import { usePWA } from './PWAProvider';

export default function OfflineIndicator() {
  const { isOnline } = usePWA();

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-amber-600 to-orange-600 text-white py-2 px-4">
      <div className="flex items-center justify-center gap-2 text-sm font-medium">
        <WifiOff className="w-4 h-4" />
        <span>You are offline. Some features may be unavailable.</span>
      </div>
    </div>
  );
}
