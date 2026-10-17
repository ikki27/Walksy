import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, radius, spacing, typography } from '../../constants/theme';
import type { ChatMessage } from '../../types/assistant';

export function ChatBubble({ message }: { message: ChatMessage }) {
    const { t } = useTranslation();
    const fromUser = message.role === 'user';
    // an empty assistant message means the answer hasn't started yet
    const waiting = !fromUser && message.content.length === 0;

    return (
        <View
            style={[styles.bubble, fromUser ? styles.user : styles.assistant]}
            accessibilityLiveRegion={fromUser ? 'none' : 'polite'}
        >
            <Text style={[styles.text, fromUser && styles.userText, waiting && styles.waitingText]}>
                {waiting ? t('assistant.thinking') : message.content}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    bubble: {
        maxWidth: '85%',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm + 4,
    },
    // the person's question looks like the suggestion card they tapped, on the right
    user: {
        alignSelf: 'flex-end',
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.borderCard,
        borderRadius: radius.sm,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.12,
        shadowRadius: 3,
        elevation: 2,
    },
    assistant: {
        alignSelf: 'flex-start',
        backgroundColor: colors.badgeSoft,
        borderRadius: radius.lg - 4,
        borderBottomLeftRadius: spacing.xs,
    },
    text: { ...typography.chat, color: colors.textPrimary },
    userText: { fontWeight: '600' },
    waitingText: { color: colors.textSecondary, fontStyle: 'italic' },
});
