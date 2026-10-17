import type { ComponentProps, ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../constants/theme';

type SectionCardProps = {
    title: string;
    icon?: ComponentProps<typeof Ionicons>['name'];
    children: ReactNode;
};

// white card with an orange icon + bold title ("Smart summary", "Suggested reminders", ...)
export function SectionCard({ title, icon, children }: SectionCardProps) {
    return (
        <View style={styles.card}>
            <View style={styles.titleRow}>
                {icon && <Ionicons name={icon} size={20} color={colors.brand} />}
                <Text style={styles.title} accessibilityRole="header">
                    {title}
                </Text>
            </View>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.borderCard,
        borderRadius: radius.lg - 4,
        padding: spacing.md + 2,
        gap: spacing.sm + 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.12,
        shadowRadius: 3,
        elevation: 2,
    },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    title: { ...typography.label, color: colors.textPrimary },
});
