import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, radius, spacing, typography } from '../../constants/theme';
import { HelpButton } from './HelpButton';

type YouSaidCardProps = {
    text: string;
    onChangeText: (text: string) => void;
    onRecord: () => void;
};

// "YOU SAID": what the person wants to tell the staff, big enough to show them the screen.
// Typed for now; recording with the microphone needs a development build.
export function YouSaidCard({ text, onChangeText, onRecord }: YouSaidCardProps) {
    const { t } = useTranslation();

    return (
        <View style={styles.card}>
            <Text style={styles.label}>{t('help.youSaid')}</Text>
            <TextInput
                style={styles.input}
                value={text}
                onChangeText={onChangeText}
                placeholder={t('help.youSaidPlaceholder')}
                placeholderTextColor={colors.textSecondary}
                multiline
                maxLength={500}
                accessibilityLabel={t('help.youSaid')}
            />
            <HelpButton label={t('help.recordAgain')} icon="mic-outline" onPress={onRecord} />
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.softSurface,
        borderWidth: 1,
        borderColor: colors.borderCard,
        borderRadius: radius.lg - 4,
        padding: spacing.md + 2,
        gap: spacing.sm + 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.12,
        shadowRadius: 3,
        elevation: 2,
    },
    label: { ...typography.body, fontWeight: '600', color: colors.textSecondary, letterSpacing: 0.5 },
    input: {
        ...typography.chat,
        fontStyle: 'italic',
        minHeight: 72,
        padding: spacing.sm + 4,
        borderWidth: 1,
        borderColor: colors.borderCard,
        borderRadius: radius.sm,
        backgroundColor: colors.card,
        color: colors.textPrimary,
        textAlignVertical: 'top',
    },
});
