import { Stack } from 'expo-router';

// the Profile tab has its own pages (Statistics, ...) that keep the tab bar visible
export default function ProfileLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
