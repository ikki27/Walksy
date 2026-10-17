import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, radius, spacing, typography } from '../../constants/theme';

type StepProgressProps = {
    current: number; // 1-based step number
    total: number;
};

// "Step 1 of 4" with a bar that fills up
export function StepProgress({ current, total }: StepProgressProps) {
    const { t } = useTranslation();
    const label = t('help.stepOf', { current, total });

    return (
        <View
            accessibilityRole="progressbar"
            accessibilityLabel={label}
            accessibilityValue={{ min: 0, max: total, now: current }}
        >
            <Text style={styles.label}>{label}</Text>
            <View style={styles.track}>
                <View style={[styles.fill, { width: `${(current / total) * 100}%` }]} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    label: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.sm },
    track: { height: 6, borderRadius: radius.pill, backgroundColor: colors.progressTrack, overflow: 'hidden' },
    fill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.brand },
});
