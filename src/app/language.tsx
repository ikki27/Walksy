import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { LanguageListItem } from '../components/LanguageListItem';
import { PrimaryButton } from '../components/PrimaryButton';
import { SearchBar } from '../components/SearchBar';
import { LANGUAGES } from '../data/languages';
import { colors, spacing, typography } from '../constants/theme';
import { setAppLanguage } from '../i18n';

export default function LanguageScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState('');
  // start with the language the app is currently using
  const [selectedCode, setSelectedCode] = useState<string | null>(i18n.language);

  // recompute only when the query changes, not on every render
  const filteredLanguages = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return LANGUAGES;
    return LANGUAGES.filter((lang) => lang.name.toLowerCase().includes(q));
  }, [query]);

  const handleContinue = async () => {
    if (!selectedCode) return;
    // translates the app and remembers the choice for next launch
    await setAppLanguage(selectedCode);
    router.push('/create-account');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.subTitleFirst}>{t('language.title')}</Text>
          <Text style={styles.subTitleSecondary}>{t('language.subtitle')}</Text>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder={t('language.searchPlaceholder')}
          />
        </View>

        <FlatList
          data={filteredLanguages}
          keyExtractor={(item) => item.code}
          renderItem={({ item }) => (
            <LanguageListItem
              language={item}
              selected={item.code === selectedCode}
              onPress={setSelectedCode}
            />
          )}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={<Text style={styles.empty}>{t('language.empty')}</Text>}
        />

        <View style={styles.footer}>
          <PrimaryButton label={t('language.continue')} onPress={handleContinue} />
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={8}
          >
            <Text style={styles.backText}>{t('language.back')}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: spacing.lg },
  header: { paddingTop: spacing.md },
  subTitleFirst: {
    ...typography.subTitleFirst,
    color: colors.brand,
  },
  subTitleSecondary: {
    ...typography.subTitleSecondary,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  list: { flex: 1 },
  listContent: { paddingTop: spacing.lg, paddingBottom: spacing.sm },
  empty: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  footer: { paddingVertical: spacing.md },
  backButton: { alignSelf: 'center', paddingVertical: spacing.sm, marginTop: spacing.xs },
  backText: { ...typography.body, color: colors.textSecondary },
});