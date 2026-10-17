import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, spacing, typography } from '../constants/theme';

type OutlineButtonProps = {
    label: string;
    onPress: () => void;
    icon?: ComponentProps<typeof Ionicons>['name'];
    accessibilityLabel?: string;
    // full width and as tall as the primary button (e.g. "Sign out")
    block?: boolean;
};

// secondary button: orange outline on white (small "Book", or block "Sign out")
export function OutlineButton({ label, onPress, icon, accessibilityLabel, block = false }: OutlineButtonProps) {
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel ?? label}
            onPress={onPress}
            hitSlop={6}
            style={({ pressed }) => [styles.button, block && styles.block, pressed && styles.pressed]}
        >
            {icon && <Ionicons name={icon} size={block ? 20 : 16} color={colors.brand} />}
            <Text style={[styles.label, block && styles.blockLabel]}>{label}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.md + 2,
        paddingVertical: spacing.sm,
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: colors.brand,
        backgroundColor: colors.card,
    },
    block: {
        alignSelf: 'stretch',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        borderRadius: radius.lg - 4,
    },
    pressed: { opacity: 0.7 },
    label: { ...typography.label, fontSize: 15, color: colors.brand },
    blockLabel: { ...typography.button, fontWeight: '600' },
});
