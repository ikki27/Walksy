import type { ComponentProps } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { OutlineButton } from '../../../components/OutlineButton';
import { Avatar } from '../../../components/profile/Avatar';
import { ProfileTile } from '../../../components/profile/ProfileTile';
import { SettingsRow } from '../../../components/profile/SettingsRow';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { colors, spacing, typography } from '../../../constants/theme';
import { useAuth } from '../../../context/AuthContext';
import { safeLocale } from '../../../utils/formatVisitTime';

type IconName = ComponentProps<typeof Ionicons>['name'];
type ProfileLink = { key: string; icon: IconName; href: Href };

// a profile page that isn't built yet: opens the shared "Coming soon" screen
const section = (name: string): Href => ({ pathname: '/profile/[section]', params: { section: name } });

// "My stuff" cards, two per row
const MY_STUFF: ProfileLink[] = [
  { key: 'visits', icon: 'location-outline', href: '/visits' },
  { key: 'documents', icon: 'document-outline', href: section('documents') },
  { key: 'customize', icon: 'pencil-outline', href: { pathname: '/personalize', params: { mode: 'edit' } } },
  { key: 'statistics', icon: 'bar-chart', href: section('statistics') },
];

// "Settings" list
const SETTINGS: ProfileLink[] = [
  { key: 'editProfile', icon: 'create-outline', href: section('editProfile') },
  { key: 'preferences', icon: 'options-outline', href: section('preferences') },
  { key: 'notifications', icon: 'notifications-outline', href: section('notifications') },
  { key: 'privacy', icon: 'shield-outline', href: section('privacy') },
  { key: 'help', icon: 'help-circle-outline', href: section('help') },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();

  const joined = user
    ? new Date(user.createdAt).toLocaleDateString(safeLocale(i18n.language), { month: 'long', year: 'numeric' })
    : null;

  const signOut = () =>
    Alert.alert(t('profile.signOutConfirm.title'), t('profile.signOutConfirm.text'), [
      { text: t('profile.signOutConfirm.no'), style: 'cancel' },
      {
        text: t('profile.signOut'),
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/');
        },
      },
    ]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />
      <ScreenHeader
        title={t('tabs.profile')}
        onNotificationsPress={() => {
          // TODO: open notifications once the screen exists
        }}
        onSosPress={() => {
          // TODO: emergency flow
        }}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {user && (
          <View style={styles.person}>
            <Avatar firstName={user.firstName} lastName={user.lastName} />
            <Text style={styles.name} accessibilityRole="header">
              {user.firstName} {user.lastName}
            </Text>
            <Text style={styles.detail}>{user.email}</Text>
            {joined && <Text style={styles.detail}>{t('profile.joined', { date: joined })}</Text>}
          </View>
        )}

        <Text style={styles.sectionTitle} accessibilityRole="header">
          {t('profile.myStuff')}
        </Text>
        <View style={styles.tiles}>
          {MY_STUFF.map((item) => (
            <ProfileTile
              key={item.key}
              label={t(`profile.tiles.${item.key}`)}
              icon={item.icon}
              onPress={() => router.push(item.href)}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle} accessibilityRole="header">
          {t('profile.settings')}
        </Text>
        <View>
          {SETTINGS.map((item, index) => (
            <SettingsRow
              key={item.key}
              label={t(`profile.sections.${item.key}`)}
              icon={item.icon}
              onPress={() => router.push(item.href)}
              showDivider={index < SETTINGS.length - 1}
            />
          ))}
        </View>

        <View style={styles.signOut}>
          <OutlineButton label={t('profile.signOut')} onPress={signOut} block />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.md, paddingBottom: spacing.lg },
  person: { alignItems: 'center', marginTop: spacing.lg, gap: spacing.xs },
  name: { ...typography.subTitleFirst, color: colors.brand, marginTop: spacing.sm },
  detail: { ...typography.cardBody, color: colors.textSecondary },
  sectionTitle: { ...typography.subTitleFirst, fontWeight: '700', color: colors.textPrimary, marginTop: spacing.lg, marginBottom: spacing.md - 4 },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  signOut: { marginTop: spacing.lg },
});
