import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { colors, radius, spacing, typography } from '../../constants/theme';
import type { SdgGoalStats } from '../../types/stats';
import { safeLocale } from '../../utils/formatVisitTime';
import { PrimaryButton } from '../PrimaryButton';
import { SdgBadge } from './SdgBadge';

type SdgDetailSheetProps = {
    goal: SdgGoalStats | null; // null = closed
    onClose: () => void;
    onViewVisits: () => void;
};

// bottom sheet: what the goal means and what the person's visits did for it
export function SdgDetailSheet({ goal, onClose, onViewVisits }: SdgDetailSheetProps) {
    const { t, i18n } = useTranslation();

    return (
        <Modal visible={goal !== null} transparent animationType="slide" onRequestClose={onClose}>
            {/* tapping the dimmed area closes the sheet */}
            <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel={t('stats.close')} />
            {goal && (
                <SafeAreaView edges={['bottom']} style={styles.sheet}>
                    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                        <View style={styles.headerRow}>
                            <SdgBadge goal={goal.goal} size={88} />
                            <Text style={styles.title} accessibilityRole="header">
                                {t(`sdg.${goal.goal}.title`)}
                            </Text>
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={t('stats.close')}
                                onPress={onClose}
                                hitSlop={10}
                            >
                                <Ionicons name="close" size={26} color={colors.textPrimary} />
                            </Pressable>
                        </View>
                        <Text style={styles.body}>{t(`sdg.${goal.goal}.description`)}</Text>

                        <View style={styles.impact}>
                            <Text style={styles.impactTitle}>{t('stats.yourImpact')}</Text>
                            <ImpactRow icon="location-outline" value={String(goal.visits)} label={t('stats.relatedVisits')} />
                            <ImpactRow icon="map-outline" value={String(goal.locations)} label={t('stats.locations')} />
                            <ImpactRow
                                icon="calendar-outline"
                                value={t('stats.lastActivity')}
                                label={new Date(goal.lastActivity).toLocaleDateString(safeLocale(i18n.language), {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                })}
                            />
                        </View>

                        <Text style={styles.subtitle}>{t('stats.howItConnects')}</Text>
                        <Text style={styles.body}>{t(`sdg.${goal.goal}.connection`)}</Text>

                        <PrimaryButton label={t('stats.viewVisits')} onPress={onViewVisits} />
                    </ScrollView>
                </SafeAreaView>
            )}
        </Modal>
    );
}

type ImpactRowProps = { icon: ComponentProps<typeof Ionicons>['name']; value: string; label: string };

function ImpactRow({ icon, value, label }: ImpactRowProps) {
    return (
        <View style={styles.impactRow} accessible accessibilityLabel={`${value}, ${label}`}>
            <Ionicons name={icon} size={28} color={colors.brand} />
            <View style={styles.impactTexts}>
                <Text style={styles.impactValue}>{value}</Text>
                <Text style={styles.impactLabel}>{label}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.35)' },
    sheet: {
        maxHeight: '85%',
        backgroundColor: colors.background,
        borderTopLeftRadius: radius.lg,
        borderTopRightRadius: radius.lg,
    },
    content: { padding: spacing.lg, gap: spacing.md },
    headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
    title: { ...typography.subTitleFirst, fontWeight: '700', color: colors.textPrimary, flex: 1, marginTop: spacing.xs },
    body: { ...typography.chat, color: colors.textPrimary },
    impact: { backgroundColor: colors.softSurface, borderRadius: radius.md, padding: spacing.md, gap: spacing.md },
    impactTitle: { ...typography.label, color: colors.textPrimary },
    impactRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    impactTexts: { flex: 1 },
    impactValue: { ...typography.label, color: colors.textPrimary },
    impactLabel: { ...typography.body, color: colors.textSecondary },
    subtitle: { ...typography.subTitleFirst, fontWeight: '700', color: colors.textPrimary, marginTop: spacing.sm },
});
