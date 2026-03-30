import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zchat.ai',
  appName: 'VenCode',
  webDir: 'out',
  server: {
    // Fallback: try live server first, then local files
    url: 'https://preview-chat-23229de4-433d-4320-9de5-16c39534cd62.space.z.ai/',
    cleartext: true,
    // Allow local files when server unreachable
    androidScheme: 'https',
  },
  android: {
    backgroundColor: '#121212',
    allowMixedContent: true,
  },
};

export default config;
