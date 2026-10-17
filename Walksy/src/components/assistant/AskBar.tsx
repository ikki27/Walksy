import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, radius, spacing, typography } from '../../constants/theme';

type AskBarProps = {
    value: string;
    onChangeText: (text: string) => void;
    onSend: () => void;
    onStop: () => void;
    onVoicePress: () => void;
    // optional camera button left of the main button (e.g. photo of a document on "Help Me")
    onCameraPress?: () => void;
    busy: boolean; // an answer is being written
    maxLength: number;
};

export function AskBar({ value, onChangeText, onSend, onStop, onVoicePress, onCameraPress, busy, maxLength }: AskBarProps) {
    const { t } = useTranslation();
    const hasText = value.trim().length > 0;

    // one round button: stop while answering, send when there's text, microphone otherwise
    const action = busy
        ? { icon: 'stop' as const, label: t('assistant.stop'), onPress: onStop }
        : hasText
          ? { icon: 'arrow-up' as const, label: t('assistant.send'), onPress: onSend }
          : { icon: 'mic-outline' as const, label: t('assistant.voice'), onPress: onVoicePress };

    return (
        <View style={styles.bar}>
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                placeholder={t('assistant.placeholder')}
                placeholderTextColor={colors.textSecondary}
                maxLength={maxLength}
                returnKeyType="send"
                submitBehavior="blurAndSubmit"
                onSubmitEditing={() => hasText && !busy && onSend()}
                accessibilityLabel={t('assistant.placeholder')}
            />
            {onCameraPress && (
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('assistant.camera')}
                    onPress={onCameraPress}
                    hitSlop={6}
                    style={({ pressed }) => [styles.button, pressed && styles.pressed]}
                >
                    <Ionicons name="camera-outline" size={22} color={colors.brandText} />
                </Pressable>
            )}
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={action.label}
                onPress={action.onPress}
                hitSlop={6}
                style={({ pressed }) => [styles.button, pressed && styles.pressed]}
            >
                <Ionicons name={action.icon} size={22} color={colors.brandText} />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    bar: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 56,
        paddingLeft: spacing.md + 2,
        paddingRight: spacing.sm,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.borderCard,
        borderRadius: radius.pill,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        elevation: 3,
    },
    input: { ...typography.input, flex: 1, color: colors.textPrimary, paddingVertical: 0 },
    button: {
        width: 40,
        height: 40,
        borderRadius: radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.brand,
        marginLeft: spacing.sm,
    },
    pressed: { opacity: 0.8 },
});
