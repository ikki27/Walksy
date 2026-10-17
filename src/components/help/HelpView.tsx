import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { colors, radius, spacing, typography } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useVisits } from '../../context/VisitsContext';
import { DEFAULT_COMPANION_NAME } from '../../data/accessibilityNeeds';
import { MAX_QUESTION_LENGTH, useAssistantChat } from '../../hooks/useAssistantChat';
import { ApiError } from '../../services/apiClient';
import type { AssistantContext } from '../../types/assistant';
import type { Visit } from '../../types/visit';
import { AskBar } from '../assistant/AskBar';
import { ChatBubble } from '../assistant/ChatBubble';
import { PrimaryButton } from '../PrimaryButton';
import { CurrentStepCard } from './CurrentStepCard';
import { StepProgress } from './StepProgress';
import { VisitCompletedView } from './VisitCompletedView';
import { YouSaidCard } from './YouSaidCard';

type HelpViewProps = {
    visitId: string;
    onPause: () => void; // back to the overview, progress is kept
    onReturn: () => void; // "Return to Visits" after "All done!"
};

type PrepareState = { status: 'loading' } | { status: 'ready' } | { status: 'error'; code: string };

// "Help Me": the visit's steps one at a time, then the "All done!" summary
export function HelpView({ visitId, onPause, onReturn }: HelpViewProps) {
    const { t } = useTranslation();
    const { visits, prepareHelp } = useVisits();
    const visit = visits.find((item) => item.id === visitId);

    // the visit needs its steps and must be running before we can guide
    const needsPreparing = !!visit && visit.status !== 'completed' && (!visit.guide || visit.status !== 'active');
    const [prepare, setPrepare] = useState<PrepareState>({ status: needsPreparing ? 'loading' : 'ready' });

    const runPrepare = useCallback(async () => {
        setPrepare({ status: 'loading' });
        try {
            await prepareHelp(visitId);
            setPrepare({ status: 'ready' });
        } catch (error) {
            setPrepare({ status: 'error', code: error instanceof ApiError ? error.code : 'unavailable' });
        }
    }, [prepareHelp, visitId]);

    useEffect(() => {
        if (needsPreparing) runPrepare();
        // only when the screen opens
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!visit) return <Message text={t('help.errors.notFound')} actionLabel={t('help.back')} onAction={onPause} />;
    if (visit.status === 'completed') return <VisitCompletedView visit={visit} onReturn={onReturn} />;

    if (prepare.status === 'loading' || !visit.guide) {
        return prepare.status === 'error' ? (
            <Message
                text={t(prepare.code === 'network' ? 'help.errors.network' : 'help.errors.prepare')}
                actionLabel={t('help.retry')}
                onAction={runPrepare}
                secondaryLabel={t('help.back')}
                onSecondary={onPause}
            />
        ) : (
            <Message text={t('help.preparing')} loading />
        );
    }

    return <GuidedSteps visit={visit as Visit & { guide: NonNullable<Visit['guide']> }} onPause={onPause} />;
}

type GuidedStepsProps = {
    visit: Visit & { guide: NonNullable<Visit['guide']> };
    onPause: () => void;
};

function GuidedSteps({ visit, onPause }: GuidedStepsProps) {
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const { saveProgress, completeVisit } = useVisits();
    const steps = visit.guide.steps;
    // shown right away, saved in the background
    const [stepIndex, setStepIndex] = useState(Math.min(visit.completedSteps, steps.length - 1));
    const [finishing, setFinishing] = useState(false);
    const [youSaid, setYouSaid] = useState('');
    const [question, setQuestion] = useState('');
    const scrollRef = useRef<ScrollView>(null);

    const context = useMemo<AssistantContext>(
        () => ({
            placeName: visit.place.name,
            category: visit.place.category,
            address: visit.place.address,
            accessibilityNeeds: user?.accessibilityNeeds ?? [],
            language: i18n.language,
            companionName: user?.companionName ?? DEFAULT_COMPANION_NAME,
        }),
        [visit.place, user, i18n.language],
    );
    const chat = useAssistantChat(context);

    const isLast = stepIndex === steps.length - 1;
    const currentStep = steps[stepIndex];

    const handleDone = async () => {
        if (!isLast) {
            const next = stepIndex + 1;
            setStepIndex(next);
            saveProgress(visit.id, next).catch(() => undefined); // the step is still shown as done
            scrollRef.current?.scrollTo({ y: 0, animated: true });
            return;
        }

        setFinishing(true);
        try {
            await completeVisit(visit.id); // the screen switches to "All done!"
        } catch {
            setFinishing(false);
            Alert.alert(t('visits.errors.title'), t('help.errors.finish'));
        }
    };

    const askForHelp = () => chat.send(t('help.needHelpQuestion', { step: currentStep, title: visit.title }));

    const handleSend = () => {
        chat.send(question);
        setQuestion('');
    };

    const comingSoon = (key: 'voice' | 'camera') =>
        Alert.alert(t(`help.soon.${key}.title`), t(`help.soon.${key}.text`));

    return (
        <View style={styles.flex}>
            <ScrollView
                ref={scrollRef}
                style={styles.flex}
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
                showsVerticalScrollIndicator={false}
                // keep Walksy's newest answer in view while it's being written
                onContentSizeChange={() => chat.messages.length > 0 && scrollRef.current?.scrollToEnd({ animated: true })}
            >
                <View style={styles.header}>
                    <Text style={styles.overline}>{t('help.overline')}</Text>
                    <Text style={styles.visitTitle} accessibilityRole="header">
                        {t('help.titleAt', { title: visit.title, place: visit.place.name })}
                    </Text>
                    <Text style={styles.hint}>{t('help.hint')}</Text>
                </View>

                <StepProgress current={stepIndex + 1} total={steps.length} />

                <CurrentStepCard
                    step={currentStep}
                    isLast={isLast}
                    finishing={finishing}
                    onDone={handleDone}
                    onNeedHelp={askForHelp}
                />

                <YouSaidCard text={youSaid} onChangeText={setYouSaid} onRecord={() => comingSoon('voice')} />

                {chat.messages.map((message) => (
                    <ChatBubble key={message.id} message={message} />
                ))}
                {chat.error && (
                    <Text style={styles.error} accessibilityRole="alert">
                        {t(`assistant.errors.${chat.error}`)}
                    </Text>
                )}

                <Pressable
                    accessibilityRole="button"
                    onPress={onPause}
                    style={({ pressed }) => [styles.pause, pressed && styles.pressed]}
                >
                    <Ionicons name="pause" size={18} color={colors.textPrimary} />
                    <Text style={styles.pauseText}>{t('help.pause')}</Text>
                </Pressable>
            </ScrollView>

            <View style={styles.askBar}>
                <AskBar
                    value={question}
                    onChangeText={setQuestion}
                    onSend={handleSend}
                    onStop={chat.stop}
                    onVoicePress={() => comingSoon('voice')}
                    onCameraPress={() => comingSoon('camera')}
                    busy={chat.busy}
                    maxLength={MAX_QUESTION_LENGTH}
                />
            </View>
        </View>
    );
}

type MessageProps = {
    text: string;
    loading?: boolean;
    actionLabel?: string;
    onAction?: () => void;
    secondaryLabel?: string;
    onSecondary?: () => void;
};

// full-screen state: preparing the steps, or something went wrong
function Message({ text, loading, actionLabel, onAction, secondaryLabel, onSecondary }: MessageProps) {
    return (
        <View style={styles.message}>
            {loading && <ActivityIndicator color={colors.brand} size="large" />}
            <Text style={styles.messageText} accessibilityLiveRegion="polite">
                {text}
            </Text>
            {actionLabel && onAction && <PrimaryButton label={actionLabel} onPress={onAction} />}
            {secondaryLabel && onSecondary && (
                <Pressable accessibilityRole="button" onPress={onSecondary} hitSlop={8}>
                    <Text style={styles.secondary}>{secondaryLabel}</Text>
                </Pressable>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    content: { paddingHorizontal: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.lg, gap: spacing.md },
    header: { gap: spacing.xs + 2 },
    overline: { ...typography.label, color: colors.brand, letterSpacing: 0.5 },
    visitTitle: { ...typography.label, fontSize: 17, color: colors.textPrimary },
    hint: { ...typography.body, color: colors.textSecondary, lineHeight: 20 },
    error: { ...typography.body, color: colors.error },
    pause: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        gap: spacing.xs + 2,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderWidth: 1,
        borderColor: colors.brand,
        borderRadius: radius.md,
        backgroundColor: colors.card,
        marginTop: spacing.xs,
    },
    pressed: { opacity: 0.7 },
    pauseText: { ...typography.label, color: colors.textPrimary },
    askBar: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.md },
    message: { flex: 1, justifyContent: 'center', padding: spacing.lg, gap: spacing.lg },
    messageText: { ...typography.subTitleSecondary, fontSize: 16, color: colors.textSecondary, textAlign: 'center' },
    secondary: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
});
