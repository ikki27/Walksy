import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography } from '../../constants/theme';
import { PrimaryButton } from '../PrimaryButton';

// shown under every finished answer: ask more, or finish
export function FollowUpPrompt({ onReady }: { onReady: () => void }) {
    const { t } = useTranslation();

    return (
        <View style={styles.container}>
            <Text style={styles.question}>{t('assistant.anythingElse')}</Text>
            <PrimaryButton label={t('assistant.ready')} onPress={onReady} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { gap: spacing.md, marginTop: spacing.sm },
    question: { ...typography.body, color: colors.textSecondary },
});
