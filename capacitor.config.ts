import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.elroi.predictive',
  appName: 'ELROI',
  webDir: 'out',
  server: {
    // For Android emulator: 10.0.2.2 maps to host machine's localhost
    // For physical device: use your machine's local IP (e.g., 192.168.1.5)
    url: 'http://10.0.2.2:3000',
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
