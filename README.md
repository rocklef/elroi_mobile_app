# ELROI Predictive Maintenance Platform

A full-stack predictive maintenance platform built with Next.js 16, React 19, Tailwind CSS v4, Supabase, and Capacitor for Android. Features real-time temperature monitoring, AI-powered insights via Google Gemini, PyTorch-based ML predictions, a 4-tier alert system with email notifications, and a native Android app.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Python ML Backend](#python-ml-backend)
- [Progressive Web App (PWA)](#progressive-web-app-pwa)
- [Android App (Capacitor)](#android-app-capacitor)
- [Authentication](#authentication)
- [Pages & Routes](#pages--routes)
- [Components](#components)
- [Alert System](#alert-system)
- [Design System](#design-system)
- [Deployment](#deployment)

---

## Features

- Real-time temperature monitoring from Excel data sources
- AI-powered temperature analysis using Google Gemini Pro
- PyTorch ML model for predictive maintenance (ResidualBlock with dilated convolutions)
- 4-tier alert system (10-min, 5-min, threshold, target) with email notifications via Resend
- Interactive dashboard with live gauge, charts (Recharts), and countdown timers
- Supabase authentication (Email/Password + Google OAuth)
- Progressive Web App with offline support and install prompt
- Native Android app via Capacitor (runs on emulator and physical devices)
- Responsive design for mobile and desktop
- Protected routes with middleware authentication

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16.0.1 (App Router) |
| UI | React 19.2.0, Tailwind CSS v4 |
| Charts | Recharts 2.10.3 |
| Icons | Lucide React, React Icons |
| 3D | Three.js 0.181.1 |
| Auth | Supabase (Auth Helpers + SSR) |
| AI | Google Generative AI (Gemini Pro) |
| ML | Python, PyTorch 2.7.1, scikit-learn |
| Email | Resend API |
| Data | XLSX parsing, Excel file reading |
| Mobile | Capacitor 8.x (Android) |
| PWA | Service Worker, Web App Manifest |

---

## Project Structure

```
Elroi_AG_New1/
├── src/
│   ├── app/
│   │   ├── layout.js                    # Root layout (PWA + Toast providers)
│   │   ├── page.js                      # Home page (/)
│   │   ├── globals.css                  # Global styles
│   │   ├── login/                       # Login page + UI components
│   │   │   ├── page.js
│   │   │   ├── LoginPanel.jsx
│   │   │   ├── FloatingShell.jsx
│   │   │   ├── HeroLeft.jsx
│   │   │   ├── SplitBackground.jsx
│   │   │   ├── Layer2Container.jsx
│   │   │   ├── Layer2Left.jsx
│   │   │   └── Layer2Right.jsx
│   │   ├── dashboard/
│   │   │   ├── page.js                  # Main dashboard
│   │   │   ├── temperature/page.js      # Temperature monitoring
│   │   │   ├── alerts/page.js           # Alert management
│   │   │   ├── reporting/page.js        # Reports
│   │   │   └── settings/page.js         # Settings
│   │   ├── sensors/
│   │   │   ├── temperature/page.js
│   │   │   ├── humidity/page.js
│   │   │   ├── pressure/page.js
│   │   │   └── vibration/page.js
│   │   ├── alerts/page.js               # Alerts overview
│   │   ├── demo/page.js                 # Demo page
│   │   ├── offline/page.js              # PWA offline fallback
│   │   └── api/
│   │       ├── analyze-temperature/     # Gemini AI analysis
│   │       ├── live-temperature/        # Live Excel data reader
│   │       ├── start-prediction/        # Spawns Python ML script
│   │       ├── prediction-status/       # Prediction result polling
│   │       └── send-alert/              # Email alerts via Resend
│   ├── components/
│   │   ├── Button.js, Card.js, Input.js # Core UI components
│   │   ├── Sidebar.js                   # Sidebar navigation
│   │   ├── TopNav.js                    # Top navigation bar
│   │   ├── PageTransitionWrapper.jsx    # Route transition animations
│   │   ├── pwa/
│   │   │   ├── PWAProvider.jsx          # PWA context (install, online status)
│   │   │   ├── InstallPrompt.jsx        # Install banner (Android + iOS)
│   │   │   └── OfflineIndicator.jsx     # Offline status bar
│   │   └── ui/
│   │       ├── MobileNav.js             # Bottom mobile navigation
│   │       ├── ToastContext.js           # Toast notification system
│   │       ├── GlowButton.jsx           # Glow effect button
│   │       ├── animated-shader-background.jsx
│   │       └── ...                      # Other UI components
│   ├── lib/
│   │   └── supabase.js                  # Supabase client
│   └── middleware.js                    # Auth route protection
├── backend/
│   ├── validation2.py                   # Primary prediction script (PyTorch)
│   ├── training20.py                    # Model training
│   ├── trainingloocv.py                 # LOOCV training
│   ├── scaler.save                      # Serialized feature scaler
│   ├── prediction_result.json           # Prediction output
│   ├── predicted_future.csv             # Forecast results
│   ├── requirements.txt                 # Python dependencies
│   └── python_log.txt                   # Execution logs
├── public/
│   ├── logo.png                         # Main ELROI logo
│   ├── backgroundless_logo.png          # Transparent logo
│   ├── manifest.json                    # PWA manifest
│   └── sw.js                            # Service Worker
├── android/                             # Capacitor Android project
│   ├── app/src/main/
│   │   ├── java/com/elroi/predictive/   # MainActivity.java
│   │   ├── res/                         # Icons, styles, colors, layouts
│   │   └── assets/public/               # Bundled web assets
│   ├── build.gradle
│   ├── local.properties                 # SDK path
│   └── gradlew                          # Gradle wrapper
├── capacitor.config.ts                  # Capacitor config (server URL, app ID)
├── next.config.mjs                      # Next.js config
├── package.json
├── .env                                 # Environment variables
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+ (for ML backend)
- **Android Studio** (for Android app, optional)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root (see [Environment Variables](#environment-variables)).

### 3. Set Up Python Backend

```bash
cd backend
pip install -r requirements.txt
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Resend (Email Alerts)
RESEND_API_KEY=your_resend_api_key
```

---

## API Endpoints

### POST `/api/analyze-temperature`
Sends temperature data to Google Gemini Pro for AI-powered analysis. Returns 3 actionable insights about the temperature trends.

### GET `/api/live-temperature`
Reads live temperature data from an Excel file. Returns current temperature, timestamp, total readings, and the last 10 readings. Caching is disabled for real-time data.

### POST `/api/start-prediction`
Spawns the Python ML prediction script (`validation2.py`) as a detached process. The script collects 20 minutes of sensor data, runs predictions through the PyTorch model, and writes results to `prediction_result.json`.

### GET `/api/prediction-status`
Polls the prediction result file to return the current status: `idle`, `waiting`, `completed`, or `error`. Used by the dashboard to show prediction progress.

### POST `/api/send-alert`
Sends email alerts via the Resend API. Supports danger/warning modes, custom messages, and multiple recipients with HTML-formatted emails.

---

## Python ML Backend

The ML backend is in the `backend/` directory and uses a PyTorch model for temperature prediction.

### Model Architecture
- **ResidualBlock-based neural network** with dilated convolutions
- Feature preprocessing with joblib scaler (`scaler.save`)
- Trained on historical sensor data

### Key Scripts

| Script | Purpose |
|--------|---------|
| `validation2.py` | Primary prediction script (called by API) |
| `training20.py` | Model training |
| `trainingloocv.py` | Leave-One-Out Cross-Validation training |
| `testing20.py` | Model testing/inference |

### Running Predictions

Predictions are triggered from the dashboard UI, which calls `/api/start-prediction`. The API spawns `validation2.py` as a background process that:
1. Collects 240 rows (~20 minutes) of live sensor data
2. Preprocesses features using the saved scaler
3. Runs inference through the trained PyTorch model
4. Writes results to `prediction_result.json` and `predicted_future.csv`

### Python Dependencies

Install with:
```bash
pip install -r backend/requirements.txt
```

Key packages: `torch`, `pytorch-lightning`, `scikit-learn`, `pandas`, `numpy`, `openpyxl`

---

## Progressive Web App (PWA)

The app is a fully configured PWA with offline support.

### Components

| Component | File | Purpose |
|-----------|------|---------|
| `PWAProvider` | `src/components/pwa/PWAProvider.jsx` | Context provider managing install state, online/offline status, and service worker registration |
| `InstallPrompt` | `src/components/pwa/InstallPrompt.jsx` | Install banner that appears after 5 seconds. Supports Android (native prompt) and iOS (manual instructions) |
| `OfflineIndicator` | `src/components/pwa/OfflineIndicator.jsx` | Amber status bar shown when the device loses internet |

### Service Worker (`public/sw.js`)

- **Navigation requests**: Network-first with cache fallback, redirects to `/offline` page when offline
- **Static assets** (CSS, JS, images): Cache-first with background network update (stale-while-revalidate)
- **API calls**: Network-only, returns `503` JSON response when offline
- **Precached assets**: `/`, `/dashboard`, `/login`, `/offline`, `/manifest.json`, logos

### Manifest (`public/manifest.json`)

- App name: **ELROI Predictive Maintenance**
- Display: Standalone (no browser chrome)
- Theme: Dark (`#050A24`)
- Icons: 192x192 and 512x512 (regular + maskable)
- Shortcuts: Dashboard, Temperature, Alerts

---

## Android App (Capacitor)

The web app is wrapped into a native Android app using **Capacitor 8.x**. The Android app runs a WebView that loads the Next.js app from a server URL.

### Architecture

```
[Android App (Capacitor Shell)]
        |
        v
[WebView loads http://10.0.2.2:3000]
        |
        v
[Next.js Dev Server on host machine]
```

- **Emulator**: Uses `10.0.2.2:3000` (Android emulator maps this to host's `localhost`)
- **Physical device**: Use your machine's local IP (e.g., `192.168.1.5:3000`)
- **Production**: Point to your deployed URL

### Configuration

**`capacitor.config.ts`**:
- App ID: `com.elroi.predictive`
- App Name: `ELROI`
- Server URL: `http://10.0.2.2:3000` (dev mode)
- Cleartext traffic enabled for local development

**Android customizations**:
- Network security config allows cleartext to `10.0.2.2`, `localhost`, and local IP
- Status bar and navigation bar: Dark theme (`#050A24`)
- App icon: ELROI logo with dark background
- Splash screen: Dark background matching app theme

### Prerequisites

- **Android Studio** installed (provides the JDK and SDK)
- **Android SDK** at `C:\Users\<USER>\AppData\Local\Android\Sdk`
- **Android Emulator** with a device configured (e.g., Pixel 6)

### Build & Run on Emulator

**Step 1: Start the Next.js dev server** (must stay running):
```bash
npm run dev
```

**Step 2: Launch the emulator**:
```bash
# List available emulators
%LOCALAPPDATA%\Android\Sdk\emulator\emulator.exe -list-avds

# Launch (example: Pixel_6)
%LOCALAPPDATA%\Android\Sdk\emulator\emulator.exe -avd Pixel_6
```

**Step 3: Build the debug APK**:
```bash
# Set JAVA_HOME to Android Studio's bundled JDK
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr

# Build
cd android
gradlew assembleDebug
```

The APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

**Step 4: Install and launch on emulator**:
```bash
# Install
%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe install -r android\app\build\outputs\apk\debug\app-debug.apk

# Launch
%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe shell am start -n com.elroi.predictive/com.elroi.predictive.MainActivity
```

### Run on Physical Device

1. Enable **Developer Options** and **USB Debugging** on your Android phone
2. Connect via USB and verify with `adb devices`
3. Change the server URL in `capacitor.config.ts`:
   ```ts
   server: {
     url: 'http://192.168.1.5:3000', // your machine's local IP
     cleartext: true,
   }
   ```
4. Rebuild and install:
   ```bash
   cd android && gradlew assembleDebug
   adb install -r app/build/outputs/apk/debug/app-debug.apk
   ```

### Capacitor Commands Reference

```bash
# Sync web assets to Android project
npx cap sync android

# Open in Android Studio
npx cap open android

# Add a Capacitor plugin
npm install @capacitor/plugin-name
npx cap sync
```

---

## Authentication

The app uses **Supabase** for authentication:

- **Email/Password** login
- **Google OAuth** login

### Protected Routes

All routes under these paths require authentication (enforced by `middleware.js`):
- `/dashboard/*`
- `/sensors/*`
- `/alerts/*`

Unauthenticated users are redirected to `/login`. Authenticated users accessing `/login` are redirected to `/dashboard`.

---

## Pages & Routes

| Route | Description |
|-------|-------------|
| `/` | Home / Landing page |
| `/login` | Authentication page (email + Google OAuth) |
| `/dashboard` | Main dashboard with system overview |
| `/dashboard/temperature` | Temperature monitoring with live data, gauge, and predictions |
| `/dashboard/alerts` | Alert management and history |
| `/dashboard/reporting` | Report generation |
| `/dashboard/settings` | System settings and threshold configuration |
| `/sensors/temperature` | Temperature sensor detail page |
| `/sensors/humidity` | Humidity sensor detail page |
| `/sensors/pressure` | Pressure sensor detail page |
| `/sensors/vibration` | Vibration sensor detail page |
| `/alerts` | Alerts overview |
| `/demo` | Demo / showcase page |
| `/offline` | PWA offline fallback page |

---

## Components

### Core Components
| Component | Description |
|-----------|-------------|
| `Button.js` | Reusable button with variants |
| `Card.js` | Card container component |
| `Input.js` | Form input component |
| `Sidebar.js` | Desktop sidebar navigation |
| `TopNav.js` | Top navigation bar |
| `PageTransitionWrapper.jsx` | Animated page transitions |

### UI Components (`src/components/ui/`)
| Component | Description |
|-----------|-------------|
| `MobileNav.js` | Bottom navigation bar for mobile |
| `ToastContext.js` | Toast notification system (context + provider) |
| `GlowButton.jsx` | Button with glow hover effect |
| `animated-shader-background.jsx` | WebGL animated background |
| `shader-background.jsx` | Static shader background |

### PWA Components (`src/components/pwa/`)
| Component | Description |
|-----------|-------------|
| `PWAProvider.jsx` | Context for install/online state + service worker registration |
| `InstallPrompt.jsx` | Install banner with iOS instructions modal |
| `OfflineIndicator.jsx` | Amber offline status bar |

---

## Alert System

The platform uses a **4-tier alert system** for temperature monitoring:

| Alert | Trigger | Severity |
|-------|---------|----------|
| 10-minute warning | 10 minutes before predicted threshold breach | Info |
| 5-minute warning | 5 minutes before predicted threshold breach | Warning (modal) |
| Threshold alert | Temperature crosses configured threshold | Danger (modal) |
| Target alert | Temperature reaches target value | Critical (modal) |

- Alerts appear as **popup notifications** and **centered danger modals** for critical events
- Dynamic **top bar** changes color based on current alert severity
- Email notifications sent to configured recipients via Resend API
- Alert thresholds are configurable in the settings page

---

## Design System

### Color Palette
| Color | Hex | Usage |
|-------|-----|-------|
| Deep Navy | `#050A24` | Background, status bar |
| Dark Blue | `#0A1628` | Cards, panels |
| Medium Blue | `#1E3A5F` | Borders, secondary backgrounds |
| Accent Cyan | `#00D4FF` | Primary accent, buttons, highlights |
| Dark Cyan | `#0088CC` | Gradient endpoints |
| Light Gray | `#E6E9F0` | Primary text |
| Muted Gray | `#8B9DC3` | Secondary text |
| Dim Gray | `#4A5568` | Tertiary text |

### Design Principles
- Dark theme throughout for industrial/monitoring aesthetic
- Gradient accents (`#00D4FF` to `#0088CC`) for interactive elements
- Rounded components (`rounded-lg`, `rounded-xl`)
- Smooth hover transitions
- Responsive: mobile-first with bottom navigation, desktop sidebar

---

## Deployment

### Web (Vercel)

1. Push code to GitHub
2. Connect repository to [Vercel](https://vercel.com)
3. Set environment variables in the Vercel dashboard
4. Deploy

### Android (Production APK)

For production, update `capacitor.config.ts` to point to your deployed URL:

```ts
server: {
  url: 'https://your-deployed-app.vercel.app',
}
```

Then build a release APK:
```bash
cd android
gradlew assembleRelease
```

The release APK can be distributed directly or published to the Google Play Store.

---

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [PyTorch Documentation](https://pytorch.org/docs)
- [Resend Documentation](https://resend.com/docs)
