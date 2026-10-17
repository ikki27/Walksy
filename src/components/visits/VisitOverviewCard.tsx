import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, radius, spacing, typography } from '../../constants/theme';
import type { Visit, VisitTab } from '../../types/visit';
import { formatTimeAgo, formatTimeUntil } from '../../utils/relativeTime';
import { getPastDate, isOverdue, isStartingSoon } from '../../utils/visits';
import { PillButton } from '../PillButton';
import { VisitBadge } from './VisitBadge';
import type { VisitBadgeTone } from './VisitBadge';

export type VisitCardActions = {
    onMap: (visit: Visit) => void;
    onHelp: (visit: Visit) => void;
    onEnd: (visit: Visit) => void;
    onCancel: (visit: Visit) => void;
    onRestore: (visit: Visit) => void;
};

type VisitOverviewCardProps = VisitCardActions & {
    visit: Visit;
    tab: VisitTab;
    now: Date;
    busy: boolean; // an action on this visit is running
};

// One visit on the overview. What it shows depends on the tab:
// Active   → "In progress" / "Visit to end"   + Map · Help Me · End Visit
// Upcoming → soon: "In 15 minutes" (red)      + Map · Help Me
//            later: "In 1 hour"               + Map · Help Me (grey) · Cancel
// Past     → "1 day ago"                      + Restore visit
export function VisitOverviewCard({ visit, tab, now, busy, ...actions }: VisitOverviewCardProps) {
    const { t } = useTranslation();
    const badge = getBadge(visit, tab, now, t);
    const soon = tab === 'upcoming' && isStartingSoon(visit, now);

    return (
        <View style={styles.card}>
            <View style={styles.titleRow}>
                <Text style={styles.title} numberOfLines={2}>
                    {visit.title}
                </Text>
                <VisitBadge label={badge.label} tone={badge.tone} />
            </View>

            <View style={styles.placeRow}>
                <Ionicons name="location-outline" size={22} color={colors.brand} />
                <Text style={styles.placeText} numberOfLines={1}>
                    {visit.place.name}
                </Text>
            </View>

            <View style={styles.buttons}>
                {tab === 'past' ? (
                    <PillButton label={t('visits.restore')} onPress={() => actions.onRestore(visit)} />
                ) : (
                    <>
                        <PillButton label={t('visits.map')} onPress={() => actions.onMap(visit)} />
                        <PillButton
                            label={t('visits.helpMe')}
                            variant="primary"
                            // Walksy's help is for the visit at hand: upcoming only when it's soon
                            disabled={tab === 'upcoming' && !soon}
                            accessibilityHint={tab === 'upcoming' && !soon ? t('visits.helpLaterHint') : undefined}
                            onPress={() => actions.onHelp(visit)}
                        />
                        {tab === 'active' && (
                            <PillButton label={t('visits.end')} disabled={busy} onPress={() => actions.onEnd(visit)} />
                        )}
                        {tab === 'upcoming' && !soon && (
                            <PillButton
                                label={t('visits.cancel')}
                                variant="danger"
                                disabled={busy}
                                onPress={() => actions.onCancel(visit)}
                            />
                        )}
                    </>
                )}
            </View>
        </View>
    );
}

function getBadge(visit: Visit, tab: VisitTab, now: Date, t: ReturnType<typeof useTranslation>['t']) {
    let label: string;
    let tone: VisitBadgeTone;

    if (tab === 'active') {
        const overdue = isOverdue(visit, now);
        label = t(overdue ? 'visits.badge.toEnd' : 'visits.badge.inProgress');
        tone = overdue ? 'muted' : 'soft';
    } else if (tab === 'upcoming') {
        label = formatTimeUntil(new Date(visit.startsAt), now, t);
        tone = isStartingSoon(visit, now) ? 'urgent' : 'soft';
    } else {
        const ago = formatTimeAgo(getPastDate(visit), now, t);
        label = visit.status === 'cancelled' ? t('visits.badge.cancelled', { time: ago }) : ago;
        tone = 'soft';
    }
    return { label, tone };
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.borderCard,
        borderRadius: radius.lg - 4,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg - 4,
        paddingBottom: spacing.lg - 4,
        gap: spacing.md - 4,
        // same soft lift as the other cards
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.12,
        shadowRadius: 3,
        elevation: 2,
    },
    titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.sm },
    title: { ...typography.cardTitle, fontSize: 24, color: colors.textPrimary, flexShrink: 1 },
    placeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    placeText: { ...typography.cardBody, fontSize: 16, color: colors.textPrimary, flexShrink: 1 },
    buttons: { flexDirection: 'row', gap: spacing.xs + 2, marginTop: spacing.xs },
});
