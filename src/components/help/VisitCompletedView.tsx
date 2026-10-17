import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors, radius, spacing, typography } from '../../constants/theme';
import { useVisits } from '../../context/VisitsContext';
import type { Visit } from '../../types/visit';
import { PrimaryButton } from '../PrimaryButton';
import { SectionCard } from './SectionCard';
import { StarRating } from './StarRating';

type VisitCompletedViewProps = {
    visit: Visit;
    onReturn: () => void;
};

// "All done!": Walksy's summary, reminders, documents and the rating
export function VisitCompletedView({ visit, onReturn }: VisitCompletedViewProps) {
    const { t } = useTranslation();
    const { saveFeedback } = useVisits();
    // shown right away, saved in the background
    const [rating, setRating] = useState(visit.rating);
    const [reminders, setReminders] = useState(visit.reminders.map((reminder) => reminder.enabled));

    const save = async (feedback: Parameters<typeof saveFeedback>[1]) => {
        try {
            await saveFeedback(visit.id, feedback);
        } catch {
            Alert.alert(t('visits.errors.title'), t('help.errors.feedback'));
        }
    };

    const rate = (value: number) => {
        setRating(value);
        save({ rating: value });
    };

    const toggleReminder = (index: number, enabled: boolean) => {
        const next = reminders.map((value, i) => (i === index ? enabled : value));
        setReminders(next);
        save({ reminders: next });
    };

    return (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.title} accessibilityRole="header">
                {t('help.allDone')}
            </Text>
            <Text style={styles.visitTitle}>{t('help.titleAt', { title: visit.title, place: visit.place.name })}</Text>
            <Text style={styles.hint}>{t('help.summaryHint')}</Text>

            <View style={styles.badge}>
                <Ionicons name="checkmark" size={18} color={colors.brandText} />
                <Text style={styles.badgeText}>{t('help.completed')}</Text>
            </View>

            <SectionCard title={t('help.smartSummary')} icon="sparkles-outline">
                <Text style={styles.body}>{visit.summary ?? t('help.noSummary')}</Text>
            </SectionCard>

            {visit.reminders.length > 0 && (
                <SectionCard title={t('help.reminders')} icon="notifications-outline">
                    {visit.reminders.map((reminder, index) => (
                        <View key={`${index}-${reminder.text}`} style={styles.reminderRow}>
                            <Text style={[styles.body, styles.reminderText]}>{reminder.text}</Text>
                            <Switch
                                value={reminders[index]}
                                onValueChange={(enabled) => toggleReminder(index, enabled)}
                                trackColor={{ false: colors.switchOff, true: colors.switchOn }}
                                thumbColor={colors.card}
                                ios_backgroundColor={colors.switchOff}
                                accessibilityLabel={reminder.text}
                            />
                        </View>
                    ))}
                    <Text style={styles.note}>{t('help.remindersNote')}</Text>
                </SectionCard>
            )}

            {/* photos of receipts and documents need file storage, coming later */}
            <SectionCard title={t('help.documentVault')} icon="folder-outline">
                <Text style={styles.note}>{t('help.documentVaultEmpty')}</Text>
            </SectionCard>

            <SectionCard title={t('help.rate')}>
                <StarRating value={rating} onChange={rate} />
            </SectionCard>

            <View style={styles.footer}>
                <PrimaryButton label={t('help.returnToVisits')} onPress={onReturn} />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    content: { paddingHorizontal: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.lg, gap: spacing.md },
    title: { ...typography.subTitleFirst, fontSize: 22, color: colors.brand },
    visitTitle: { ...typography.label, fontSize: 17, color: colors.textPrimary, marginTop: -spacing.xs },
    hint: { ...typography.body, color: colors.textSecondary, marginTop: -spacing.sm },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: spacing.xs + 2,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.md,
        backgroundColor: colors.brand,
    },
    badgeText: { ...typography.label, color: colors.brandText },
    body: { ...typography.chat, color: colors.textPrimary },
    reminderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    reminderText: { flex: 1 },
    note: { ...typography.body, color: colors.textSecondary },
    footer: { marginTop: spacing.sm },
});
