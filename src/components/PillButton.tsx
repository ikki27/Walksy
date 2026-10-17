import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, spacing, typography } from '../constants/theme';

export type PillButtonVariant = 'outline' | 'primary' | 'danger';

type PillButtonProps = {
    label: string;
    onPress: () => void;
    variant?: PillButtonVariant;
    disabled?: boolean; // grey and not tappable
    accessibilityHint?: string;
};

// small rounded button used in rows on cards (Map, Help Me, End Visit, Cancel, Restore visit)
export function PillButton({ label, onPress, variant = 'outline', disabled = false, accessibilityHint }: PillButtonProps) {
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled }}
            accessibilityHint={accessibilityHint}
            onPress={onPress}
            disabled={disabled}
            style={({ pressed }) => [
                styles.button,
                disabled ? styles.disabled : styles[variant],
                pressed && styles.pressed,
            ]}
        >
            <Text
                style={[styles.label, !disabled && variant === 'outline' ? styles.outlineLabel : styles.filledLabel]}
                numberOfLines={1}
            >
                {label}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        flex: 1,
        height: 42,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.sm,
        borderRadius: radius.pill,
        borderWidth: 1,
    },
    outline: { backgroundColor: colors.card, borderColor: colors.brand },
    primary: { backgroundColor: colors.brand, borderColor: colors.brand },
    danger: { backgroundColor: colors.sos, borderColor: colors.sos },
    disabled: { backgroundColor: colors.disabled, borderColor: colors.disabled },
    pressed: { opacity: 0.75 },
    label: { ...typography.label, fontSize: 16 },
    outlineLabel: { color: colors.textPrimary },
    filledLabel: { color: colors.brandText },
});
