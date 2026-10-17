import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, spacing, typography } from '../../constants/theme';

type SuggestionChipProps = {
    label: string;
    onPress: () => void;
    disabled?: boolean;
};

export function SuggestionChip({ label, onPress, disabled }: SuggestionChipProps) {
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled }}
            onPress={onPress}
            disabled={disabled}
            style={({ pressed }) => [styles.chip, pressed && styles.pressed, disabled && styles.disabled]}
        >
            <Text style={styles.label}>{label}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    chip: {
        alignSelf: 'flex-start', // as wide as its text, like in the design
        paddingHorizontal: spacing.md + 2,
        paddingVertical: spacing.md - 2,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.borderCard,
        borderRadius: radius.sm,
        // same soft lift as the other cards
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.12,
        shadowRadius: 3,
        elevation: 2,
    },
    pressed: { opacity: 0.7 },
    disabled: { opacity: 0.5 },
    label: { ...typography.chip, color: colors.textPrimary },
});
