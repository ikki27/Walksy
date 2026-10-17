import type { ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../constants/theme';

type GuideCardProps = {
    title: string;
    icon: ReactNode;
    expanded: boolean;
    onToggle: () => void;
    children: ReactNode;
};

// card with a header that opens and closes its content
export function GuideCard({ title, icon, expanded, onToggle, children }: GuideCardProps) {
    return (
        <View style={styles.card}>
            <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded }}
                onPress={onToggle}
                style={({ pressed }) => [styles.header, pressed && styles.pressed]}
            >
                {icon}
                <Text style={styles.title}>{title}</Text>
                <Ionicons name={expanded ? 'chevron-down' : 'chevron-forward'} size={22} color={colors.textPrimary} />
            </Pressable>

            {expanded && <View style={styles.body}>{children}</View>}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        width: '82%',
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.borderCard,
        borderRadius: radius.sm,
        overflow: 'hidden', // keeps the tinted body inside the rounded corners
        // same soft lift as the other cards
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.12,
        shadowRadius: 3,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md + 2,
        backgroundColor: colors.card,
    },
    pressed: { opacity: 0.7 },
    title: { ...typography.label, color: colors.textPrimary, flex: 1 },
    body: {
        borderTopWidth: 1,
        borderTopColor: colors.borderCard,
        backgroundColor: colors.badgeSoft,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md - 2,
        gap: spacing.sm,
    },
});
