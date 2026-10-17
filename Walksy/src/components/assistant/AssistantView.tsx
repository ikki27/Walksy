import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Keyboard, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { colors, spacing, typography } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { DEFAULT_COMPANION_NAME } from '../../data/accessibilityNeeds';
import { PLACE_SUGGESTIONS } from '../../data/placeSuggestions';
import { MAX_QUESTION_LENGTH, useAssistantChat } from '../../hooks/useAssistantChat';
import type { AssistantContext, ChatMessage, VisitGuide } from '../../types/assistant';
import type { Place } from '../../types/place';
import { AskBar } from './AskBar';
import { ChatBubble } from './ChatBubble';
import { FollowUpPrompt } from './FollowUpPrompt';
import { GuideMessage } from './GuideMessage';
import { SuggestionChip } from './SuggestionChip';

type AssistantViewProps = {
    place: Place;
    onClose: () => void; // X: back to the place search
    // "No, I'm ready": purpose = the last suggestion card tapped, e.g. "Pay bills",
    // guide = Walksy's steps for it, saved with the visit for "Help Me"
    onReady: (purpose: string | null, guide: VisitGuide | null) => void;
};

function MessageView({ message }: { message: ChatMessage }) {
    return message.guide ? <GuideMessage guide={message.guide} /> : <ChatBubble message={message} />;
}

// "How can I help?": suggestion cards and the Ask Walksy chat for one place
export function AssistantView({ place, onClose, onReady }: AssistantViewProps) {
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const [question, setQuestion] = useState('');
    const [purpose, setPurpose] = useState<string | null>(null);
    const scrollRef = useRef<ScrollView>(null);

    const context = useMemo<AssistantContext>(
        () => ({
            placeName: place.name,
            category: place.category,
            address: place.address,
            accessibilityNeeds: user?.accessibilityNeeds ?? [],
            language: i18n.language,
            companionName: user?.companionName ?? DEFAULT_COMPANION_NAME,
        }),
        [place, user, i18n.language],
    );

    const { messages, busy, error, send, askGuide, stop } = useAssistantChat(context);
    const conversationStarted = messages.length > 0;
    const lastMessage = messages[messages.length - 1];
    const answerFinished = !busy && !error && lastMessage?.role === 'assistant';

    // when the keyboard opens, show the newest messages right above the input bar
    useEffect(() => {
        const subscription = Keyboard.addListener('keyboardDidShow', () =>
            scrollRef.current?.scrollToEnd({ animated: true }),
        );
        return () => subscription.remove();
    }, []);

    const handleSend = () => {
        send(question);
        setQuestion('');
    };

    const handleSuggestion = (topic: string) => {
        setPurpose(topic);
        askGuide(topic);
    };

    return (
        <View style={styles.flex}>
            <View style={styles.titleRow}>
                <Text style={styles.title}>{t('assistant.title')}</Text>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('assistant.close')}
                    onPress={onClose}
                    hitSlop={10}
                    style={({ pressed }) => pressed && styles.pressed}
                >
                    <Ionicons name="close" size={30} color={colors.textPrimary} />
                </Pressable>
            </View>
            {!conversationStarted && <Text style={styles.subtitle}>{t('assistant.subtitle')}</Text>}

            <ScrollView
                ref={scrollRef}
                style={styles.flex}
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
                showsVerticalScrollIndicator={false}
                // keep the newest part of the answer in view while it's being written
                onContentSizeChange={() => conversationStarted && scrollRef.current?.scrollToEnd({ animated: true })}
            >
                {conversationStarted
                    ? messages.map((message) => <MessageView key={message.id} message={message} />)
                    : PLACE_SUGGESTIONS[place.category].map((key) => (
                          <SuggestionChip key={key} label={t(key)} onPress={() => handleSuggestion(t(key))} disabled={busy} />
                      ))}

                {error && (
                    <Text style={styles.error} accessibilityRole="alert">
                        {t(`assistant.errors.${error}`)}
                    </Text>
                )}

                {answerFinished && (
                    <FollowUpPrompt
                        onReady={() => onReady(purpose, [...messages].reverse().find((message) => message.guide)?.guide ?? null)}
                    />
                )}
            </ScrollView>

            <View style={styles.askBar}>
                <AskBar
                    value={question}
                    onChangeText={setQuestion}
                    onSend={handleSend}
                    onStop={stop}
                    onVoicePress={() => Alert.alert(t('assistant.voiceSoonTitle'), t('assistant.voiceSoonText'))}
                    busy={busy}
                    maxLength={MAX_QUESTION_LENGTH}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        marginTop: spacing.lg + 4,
    },
    title: { ...typography.subTitleFirst, fontSize: 22, color: colors.brand },
    pressed: { opacity: 0.6 },
    subtitle: {
        ...typography.subTitleSecondary,
        color: colors.textSecondary,
        paddingHorizontal: spacing.md,
        marginTop: spacing.sm,
    },
    content: { paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.lg, gap: spacing.md },
    error: { ...typography.body, color: colors.error },
    askBar: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.md },
});
