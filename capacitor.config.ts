import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zchat.ai',
  appName: 'ZChat',
  webDir: 'out',
  server: {
    url: 'https://preview-chat-23229de4-433d-4320-9de5-16c39534cd62.space.z.ai/',
    cleartext: true,
  },
  android: {
    backgroundColor: '#0a0a0a',
    allowMixedContent: true,
  },
};

export default config;
