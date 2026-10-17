import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography } from '../../constants/theme';
import { SDG_BY_GOAL } from '../../data/sdgs';
import type { SdgGoalStats } from '../../types/stats';

// colored dot + name + count for every segment: the chart is never color-only
export function SdgLegend({ goals }: { goals: SdgGoalStats[] }) {
    const { t } = useTranslation();

    return (
        <View style={styles.list}>
            {goals.map((goal) => (
                <View key={goal.goal} style={styles.row}>
                    <View style={[styles.dot, { backgroundColor: SDG_BY_GOAL[goal.goal].color }]} />
                    <Text style={styles.name} numberOfLines={1}>
                        {t(`sdg.${goal.goal}.short`)}
                    </Text>
                    <Text style={styles.count}>{goal.visits}</Text>
                </View>
            ))}
        </View>
    );
}

const DOT = 18;

const styles = StyleSheet.create({
    list: { flex: 1, gap: spacing.sm + 2 },
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm + 2 },
    dot: { width: DOT, height: DOT, borderRadius: DOT / 2 },
    name: { ...typography.cardBody, fontSize: 16, color: colors.textPrimary, flex: 1 },
    count: { ...typography.cardBody, fontSize: 16, color: colors.textPrimary },
});
