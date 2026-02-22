import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/ToastContext";
import MobileNav from "@/components/ui/MobileNav";
import { PWAProvider, InstallPrompt, OfflineIndicator } from "@/components/pwa";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "ELROI Predictive Maintenance",
  description: "Predictive maintenance platform by ELROI",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ELROI",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#050A24",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* iOS Icons */}
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/logo.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/logo.png" />

        {/* iOS Splash Screens - Basic */}
        <link rel="apple-touch-startup-image" href="/logo.png" />

        {/* Favicon */}
        <link rel="icon" type="image/png" href="/logo.png" />
        <link rel="shortcut icon" href="/logo.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-[#050A24] text-[#E6E9F0] pb-16 md:pb-0`}
      >
        <ThemeProvider>
          <PWAProvider>
            <ToastProvider>
              <OfflineIndicator />
              {children}
              <InstallPrompt />
            </ToastProvider>
            <MobileNav />
          </PWAProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}