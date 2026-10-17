import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../constants/theme';

// soft: "In progress", "In 1 hour", "1 day ago" · urgent: "In 15 minutes" · muted: "Visit to end"
export type VisitBadgeTone = 'soft' | 'urgent' | 'muted';

export function VisitBadge({ label, tone }: { label: string; tone: VisitBadgeTone }) {
    return (
        <View style={[styles.badge, styles[tone]]}>
            <Text style={[styles.text, styles[`${tone}Text`]]} numberOfLines={1}>
                {label}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: spacing.sm + 4,
        paddingVertical: spacing.xs,
        borderRadius: radius.pill,
        flexShrink: 0,
    },
    soft: { backgroundColor: colors.badgeSoft },
    urgent: { backgroundColor: colors.sos },
    muted: { backgroundColor: colors.badgeMuted },
    text: typography.badge,
    softText: { color: colors.brand },
    urgentText: { color: colors.brandText },
    mutedText: { color: colors.textSecondary },
});
