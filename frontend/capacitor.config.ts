import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.islamagent.app',
  appName: 'Islam Agent',
  webDir: 'dist',
  server: {
    // During development, point to your Vite dev server:
    // url: 'http://192.168.x.x:5173',
    // cleartext: true,

    // In production, the app loads from the built files in webDir
    androidScheme: 'https',
  },
  android: {
    // Allow mixed content during dev if needed
    // allowMixedContent: true,
  },
  plugins: {
    // Permissions will be declared in AndroidManifest.xml
    // These are the permissions the app needs:
    // - INTERNET (default, for API calls)
    // - RECORD_AUDIO (for voice input / speech-to-text)
    // - ACCESS_NETWORK_STATE (check connectivity)
  },
}

export default config
