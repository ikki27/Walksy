import { Pressable, StyleSheet, Text } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { colors, radius, spacing, typography } from '../constants/theme';

type PrimaryButtonProps = {
    label: string;
    onPress: () => void;
    style?: StyleProp<ViewStyle>;
};

export function PrimaryButton({ label, onPress, style }: PrimaryButtonProps) {
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={label}
            onPress={onPress}
            style={({ pressed }) => [styles.button, pressed && styles.pressed, style]}
        >
            <Text style={styles.label}>{label}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: colors.brand,
        borderRadius: radius.lg,
        paddingVertical: spacing.md + 2,
        alignItems: 'center',
        justifyContent: 'center',
        // soft shadow (iOS)
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        // soft shadow (Android)
        elevation: 1.5,
    },
    pressed: { opacity: 0.85 },
    label: { ...typography.button, color: colors.brandText },
});