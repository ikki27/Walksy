import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, spacing, typography } from '../../constants/theme';

type SettingsRowProps = {
    label: string;
    icon: ComponentProps<typeof Ionicons>['name'];
    onPress: () => void;
    showDivider: boolean; // line under the row, not under the last one
};

// one line in "Settings": icon, label, arrow
export function SettingsRow({ label, icon, onPress, showDivider }: SettingsRowProps) {
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={label}
            onPress={onPress}
            style={({ pressed }) => [styles.row, showDivider && styles.divider, pressed && styles.pressed]}
        >
            <Ionicons name={icon} size={22} color={colors.brand} />
            <Text style={styles.label}>{label}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textPrimary} />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.md + 2,
        paddingHorizontal: spacing.md,
    },
    divider: { borderBottomWidth: 1, borderBottomColor: colors.divider },
    pressed: { opacity: 0.6 },
    label: { ...typography.cardBody, fontSize: 16, color: colors.textPrimary, flex: 1 },
});
