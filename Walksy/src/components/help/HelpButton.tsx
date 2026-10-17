import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, spacing, typography } from '../../constants/theme';

type HelpButtonProps = {
    label: string;
    onPress: () => void;
    icon?: ComponentProps<typeof Ionicons>['name'];
    variant?: 'filled' | 'outline';
    loading?: boolean;
};

// full-width rounded button on the Help Me cards ("Done", "I still need help", "Record again")
export function HelpButton({ label, onPress, icon, variant = 'filled', loading = false }: HelpButtonProps) {
    const filled = variant === 'filled';
    const color = filled ? colors.brandText : colors.textPrimary;

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityState={{ busy: loading }}
            accessibilityLabel={label}
            onPress={onPress}
            disabled={loading}
            style={({ pressed }) => [styles.button, filled ? styles.filled : styles.outline, pressed && styles.pressed]}
        >
            {loading ? (
                <ActivityIndicator color={color} />
            ) : (
                <>
                    {icon && <Ionicons name={icon} size={18} color={filled ? colors.brandText : colors.brand} />}
                    <Text style={[styles.label, { color }]}>{label}</Text>
                </>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        height: 44,
        borderRadius: radius.md,
        borderWidth: 1,
    },
    filled: { backgroundColor: colors.brand, borderColor: colors.brand },
    outline: { backgroundColor: colors.card, borderColor: colors.brand },
    pressed: { opacity: 0.8 },
    label: { ...typography.label, fontSize: 16 },
});
