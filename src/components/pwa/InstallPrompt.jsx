'use client';

import { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { usePWA } from './PWAProvider';

export default function InstallPrompt() {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);

    // Check if dismissed recently (24 hours)
    const dismissedTime = localStorage.getItem('pwa-install-dismissed');
    if (dismissedTime) {
      const hoursSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60);
      if (hoursSinceDismissed < 24) {
        setDismissed(true);
      }
    }

    // Show prompt after a delay
    const timer = setTimeout(() => {
      if (!dismissed && !isInstalled) {
        setShowPrompt(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [dismissed, isInstalled]);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
    } else {
      const success = await installApp();
      if (success) {
        setShowPrompt(false);
      }
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Don't show if already installed or not installable (and not iOS)
  if (isInstalled || (!isInstallable && !isIOS) || !showPrompt) {
    return null;
  }

  return (
    <>
      {/* Install Prompt Banner */}
      <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 animate-slide-up">
        <div className="bg-gradient-to-r from-[#0A1628] to-[#1E3A5F] rounded-xl border border-[#00D4FF]/30 shadow-lg shadow-[#00D4FF]/10 p-4">
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 text-[#8B9DC3] hover:text-white transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#00D4FF]/20 to-[#0088CC]/20 flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-6 h-6 text-[#00D4FF]" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-sm mb-1">
                Install ELROI App
              </h3>
              <p className="text-[#8B9DC3] text-xs mb-3 leading-relaxed">
                Add to your home screen for quick access and offline support
              </p>

              <button
                onClick={handleInstall}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00D4FF] to-[#0088CC] text-[#050A24] text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity w-full justify-center"
              >
                <Download className="w-4 h-4" />
                Install Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* iOS Instructions Modal */}
      {showIOSInstructions && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70">
          <div className="bg-[#0A1628] rounded-xl border border-[#1E3A5F] max-w-sm w-full p-5">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-white font-semibold text-lg">
                Install on iOS
              </h3>
              <button
                onClick={() => setShowIOSInstructions(false)}
                className="p-1 text-[#8B9DC3] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#00D4FF]/20 flex items-center justify-center flex-shrink-0 text-[#00D4FF] font-bold text-sm">
                  1
                </div>
                <p className="text-[#8B9DC3] text-sm pt-1">
                  Tap the <span className="text-white font-medium">Share</span> button at the bottom of Safari
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#00D4FF]/20 flex items-center justify-center flex-shrink-0 text-[#00D4FF] font-bold text-sm">
                  2
                </div>
                <p className="text-[#8B9DC3] text-sm pt-1">
                  Scroll down and tap <span className="text-white font-medium">"Add to Home Screen"</span>
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#00D4FF]/20 flex items-center justify-center flex-shrink-0 text-[#00D4FF] font-bold text-sm">
                  3
                </div>
                <p className="text-[#8B9DC3] text-sm pt-1">
                  Tap <span className="text-white font-medium">"Add"</span> to install the app
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSInstructions(false)}
              className="mt-6 w-full py-2.5 bg-[#1E3A5F] text-white font-medium rounded-lg hover:bg-[#2A4A6F] transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
