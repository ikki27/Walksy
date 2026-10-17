import Constants from 'expo-constants';

const API_PORT = 3000;

// The phone can't use "localhost" (that's the phone itself), it needs the PC's IP address.
// 1. EXPO_PUBLIC_API_URL from Walksy/.env wins, if set
// 2. otherwise in development: the same IP Expo Go uses to load the app, with the backend port
function resolveApiUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  const devHost = Constants.expoConfig?.hostUri?.split(':')[0];
  if (devHost) return `http://${devHost}:${API_PORT}`;

  return `http://localhost:${API_PORT}`;
}

export const API_URL = resolveApiUrl();
