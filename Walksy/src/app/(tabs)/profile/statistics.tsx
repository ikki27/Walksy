import { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ScreenHeader } from '../../../components/ScreenHeader';
import { DonutChart } from '../../../components/stats/DonutChart';
import { PeriodSwitcher } from '../../../components/stats/PeriodSwitcher';
import { SdgDetailSheet } from '../../../components/stats/SdgDetailSheet';
import { SdgLegend } from '../../../components/stats/SdgLegend';
import { SdgListRow } from '../../../components/stats/SdgListRow';
import { SdgTile } from '../../../components/stats/SdgTile';
import { colors, spacing, typography } from '../../../constants/theme';
import { SDG_BY_GOAL, SDGS } from '../../../data/sdgs';
import { useSdgStats } from '../../../hooks/useSdgStats';
import type { SdgGoalStats } from '../../../types/stats';
import { safeLocale } from '../../../utils/formatVisitTime';

const TOP_COUNT = 3;

// Statistics: how the person's completed visits contribute to the UN Sustainable Development Goals
export default function StatisticsScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [monthOffset, setMonthOffset] = useState(0);
  const [selected, setSelected] = useState<SdgGoalStats | null>(null);
  const stats = useSdgStats(monthOffset);

  const periodLabel =
    monthOffset === 0
      ? t('stats.thisMonth')
      : monthOffset === -1
        ? t('stats.lastMonth')
        : stats.from.toLocaleDateString(safeLocale(i18n.language), { month: 'long', year: 'numeric' });

  // chart + legend follow the fixed SDG order (keeps similar colors apart); lists follow the counts
  const goals = stats.status === 'ready' ? stats.stats.goals : [];
  const chartGoals = useMemo(
    () => SDGS.map((sdg) => goals.find((goal) => goal.goal === sdg.goal)).filter((goal): goal is SdgGoalStats => !!goal),
    [goals],
  );

  const viewRelatedVisits = () => {
    setSelected(null);
    router.navigate({ pathname: '/visits', params: { tab: 'past' } });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />
      <ScreenHeader
        title={t('profile.sections.statistics')}
        onBack={() => router.back()}
        onNotificationsPress={() => {
          // TODO: open notifications once the screen exists
        }}
        onSosPress={() => {
          // TODO: emergency flow
        }}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <PeriodSwitcher
          label={periodLabel}
          onPrevious={() => setMonthOffset((offset) => offset - 1)}
          onNext={() => setMonthOffset((offset) => Math.min(offset + 1, 0))}
          canGoNext={monthOffset < 0}
        />

        {stats.status === 'loading' && <ActivityIndicator color={colors.brand} style={styles.loading} />}

        {stats.status === 'error' && (
          <Text style={styles.error} accessibilityRole="alert">
            {t(stats.code === 'network' ? 'stats.errors.network' : 'stats.errors.load')}
          </Text>
        )}

        {stats.status === 'ready' && stats.stats.totalVisits === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>{t('stats.emptyTitle')}</Text>
            <Text style={styles.emptyText}>{t('stats.emptyText')}</Text>
          </View>
        )}

        {stats.status === 'ready' && stats.stats.totalVisits > 0 && (
          <>
            <Text style={styles.sectionTitle} accessibilityRole="header">
              {t('stats.distribution')}
            </Text>
            <View style={styles.distribution}>
              <DonutChart
                segments={chartGoals.map((goal) => ({
                  key: String(goal.goal),
                  value: goal.visits,
                  color: SDG_BY_GOAL[goal.goal].color,
                }))}
                centerValue={String(stats.stats.totalVisits)}
                centerLabel={t('stats.totalVisits')}
                accessibilityLabel={t('stats.chartLabel', {
                  total: stats.stats.totalVisits,
                  goals: chartGoals.map((goal) => `${t(`sdg.${goal.goal}.short`)} ${goal.visits}`).join(', '),
                })}
              />
              <SdgLegend goals={chartGoals} />
            </View>
            <Text style={styles.note}>{t('stats.multipleNote')}</Text>

            <Text style={styles.sectionTitle} accessibilityRole="header">
              {t('stats.top')}
            </Text>
            <View style={styles.tiles}>
              {goals.slice(0, TOP_COUNT).map((goal) => (
                <SdgTile key={goal.goal} goal={goal.goal} visits={goal.visits} onPress={() => setSelected(goal)} />
              ))}
            </View>

            <Text style={styles.sectionTitle} accessibilityRole="header">
              {t('stats.all')}
            </Text>
            <View>
              {goals.map((goal, index) => (
                <SdgListRow
                  key={goal.goal}
                  goal={goal.goal}
                  onPress={() => setSelected(goal)}
                  showDivider={index < goals.length - 1}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <SdgDetailSheet goal={selected} onClose={() => setSelected(null)} onViewVisits={viewRelatedVisits} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.lg },
  loading: { marginTop: spacing.xl },
  error: { ...typography.body, color: colors.error, textAlign: 'center', marginTop: spacing.xl },
  empty: { alignItems: 'center', marginTop: spacing.xl, gap: spacing.sm, paddingHorizontal: spacing.md },
  emptyTitle: { ...typography.label, fontSize: 17, color: colors.textPrimary, textAlign: 'center' },
  emptyText: { ...typography.subTitleSecondary, color: colors.textSecondary, textAlign: 'center' },
  sectionTitle: {
    ...typography.subTitleFirst,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.md - 4,
  },
  distribution: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  note: { ...typography.error, color: colors.textSecondary, marginTop: spacing.sm },
  tiles: { flexDirection: 'row', gap: spacing.sm + 4 },
});
