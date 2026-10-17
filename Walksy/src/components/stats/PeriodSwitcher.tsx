import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, radius, spacing, typography } from '../../constants/theme';

type PeriodSwitcherProps = {
    label: string;
    onPrevious: () => void;
    onNext: () => void;
    canGoNext: boolean; // no future months
};

// "<  This month  >"
export function PeriodSwitcher({ label, onPrevious, onNext, canGoNext }: PeriodSwitcherProps) {
    const { t } = useTranslation();

    return (
        <View style={styles.card}>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('stats.previousMonth')}
                onPress={onPrevious}
                hitSlop={12}
                style={({ pressed }) => pressed && styles.pressed}
            >
                <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
            </Pressable>
            <Text style={styles.label} accessibilityLiveRegion="polite">
                {label}
            </Text>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('stats.nextMonth')}
                accessibilityState={{ disabled: !canGoNext }}
                onPress={onNext}
                disabled={!canGoNext}
                hitSlop={12}
                style={({ pressed }) => pressed && styles.pressed}
            >
                <Ionicons name="chevron-forward" size={22} color={canGoNext ? colors.textPrimary : colors.disabled} />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md + 2,
        height: 56,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.borderCard,
        borderRadius: radius.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.12,
        shadowRadius: 3,
        elevation: 2,
    },
    pressed: { opacity: 0.6 },
    label: { ...typography.label, fontSize: 17, color: colors.textPrimary },
});
