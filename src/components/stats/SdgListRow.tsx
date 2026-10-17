import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography } from '../../constants/theme';
import { SdgBadge } from './SdgBadge';

type SdgListRowProps = {
    goal: number;
    onPress: () => void;
    showDivider: boolean;
};

// "All SDGs" row: small square, full goal name, arrow
export function SdgListRow({ goal, onPress, showDivider }: SdgListRowProps) {
    const { t } = useTranslation();
    const title = t(`sdg.${goal}.title`);

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={title}
            onPress={onPress}
            style={({ pressed }) => [styles.row, showDivider && styles.divider, pressed && styles.pressed]}
        >
            <SdgBadge goal={goal} size={44} />
            <Text style={styles.title}>{title}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textPrimary} />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm + 1 },
    divider: { borderBottomWidth: 1, borderBottomColor: colors.divider },
    pressed: { opacity: 0.6 },
    title: { ...typography.cardBody, fontSize: 16, color: colors.textPrimary, flex: 1 },
});
