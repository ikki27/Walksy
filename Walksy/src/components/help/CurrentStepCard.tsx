import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, radius, spacing, typography } from '../../constants/theme';
import { HelpButton } from './HelpButton';

type CurrentStepCardProps = {
    step: string;
    isLast: boolean;
    finishing: boolean; // the last "Done" is saving + Walksy writes the summary
    onDone: () => void;
    onNeedHelp: () => void;
};

// "CURRENT STEP": what to do now, then Done or ask for more help
export function CurrentStepCard({ step, isLast, finishing, onDone, onNeedHelp }: CurrentStepCardProps) {
    const { t } = useTranslation();

    return (
        <View style={styles.card}>
            <Text style={styles.label}>{t('help.currentStep')}</Text>
            <Text style={styles.step} accessibilityLiveRegion="polite">
                {step}
            </Text>
            <View style={styles.buttons}>
                <HelpButton
                    label={t(isLast ? 'help.finish' : 'help.done')}
                    icon="checkmark"
                    onPress={onDone}
                    loading={finishing}
                />
                <HelpButton label={t('help.needHelp')} icon="sparkles-outline" variant="outline" onPress={onNeedHelp} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.borderCard,
        borderRadius: radius.lg - 4,
        padding: spacing.md + 2,
        gap: spacing.sm,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.12,
        shadowRadius: 3,
        elevation: 2,
    },
    label: { ...typography.body, fontWeight: '600', color: colors.textSecondary, letterSpacing: 0.5 },
    step: { ...typography.subTitleFirst, color: colors.textPrimary },
    buttons: { gap: spacing.sm + 2, marginTop: spacing.xs },
});
