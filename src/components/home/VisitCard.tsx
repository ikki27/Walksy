import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, radius, spacing, typography } from '../../constants/theme';
import type { Visit } from '../../types/visit';
import { formatVisitTime } from '../../utils/formatVisitTime';
import type { FeaturedState } from '../../utils/visits';

type VisitCardProps = {
    visit: Visit;
    status: FeaturedState;
    now: Date;
    onPress?: () => void;
};

export function VisitCard({ visit, status, now, onPress }: VisitCardProps) {
    const { t, i18n } = useTranslation();
    const time = formatVisitTime(new Date(visit.startsAt), now, i18n.language, t);

    return (
        <Pressable
            accessibilityRole="button"
            onPress={onPress}
            disabled={!onPress}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        >
            <View style={styles.titleRow}>
                <Text style={styles.title} numberOfLines={1}>
                    {visit.title}
                </Text>
                <StatusBadge status={status} />
            </View>

            <InfoRow icon="location-outline" text={visit.place.name} />
            <View style={styles.divider} />
            <InfoRow icon="time-outline" text={time} />
        </Pressable>
    );
}

// shown when there is nothing planned
export function NoVisitCard() {
    const { t } = useTranslation();

    return (
        <View style={styles.card}>
            <Text style={styles.title}>{t('home.noVisitTitle')}</Text>
            <Text style={[styles.infoText, styles.emptyText]}>{t('home.noVisitText')}</Text>
        </View>
    );
}

function StatusBadge({ status }: { status: FeaturedState }) {
    const { t } = useTranslation();
    const inProgress = status === 'inProgress';

    return (
        <View style={[styles.badge, inProgress ? styles.badgeSoft : styles.badgeStrong]}>
            <Text style={[styles.badgeText, inProgress ? styles.badgeTextSoft : styles.badgeTextStrong]}>
                {t(inProgress ? 'home.inProgress' : 'home.nextVisit')}
            </Text>
        </View>
    );
}

function InfoRow({ icon, text }: { icon: ComponentProps<typeof Ionicons>['name']; text: string }) {
    return (
        <View style={styles.infoRow}>
            <Ionicons name={icon} size={22} color={colors.brand} />
            <Text style={styles.infoText} numberOfLines={1}>
                {text}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.card,
        borderRadius: radius.lg - 4,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg - 4,
        paddingBottom: spacing.md + 2,
    },
    pressed: { opacity: 0.9 },
    titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
    title: { ...typography.cardTitle, color: colors.textPrimary, flexShrink: 1 },
    badge: { paddingHorizontal: spacing.sm + 4, paddingVertical: spacing.xs, borderRadius: radius.pill },
    badgeSoft: { backgroundColor: colors.badgeSoft },
    badgeStrong: { backgroundColor: colors.speechBubble },
    badgeText: typography.badge,
    badgeTextSoft: { color: colors.brand },
    badgeTextStrong: { color: colors.brandText },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm + 2, marginTop: spacing.sm + 4 },
    infoText: { ...typography.cardBody, color: colors.textPrimary, flexShrink: 1 },
    divider: { height: 1, backgroundColor: colors.divider, marginTop: spacing.md - 2 },
    emptyText: { color: colors.textSecondary, marginTop: spacing.sm },
});
