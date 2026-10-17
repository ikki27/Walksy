import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { colors, spacing, typography } from '../../constants/theme';
import { useVisits } from '../../context/VisitsContext';
import { useVisitSchedule } from '../../hooks/useVisitSchedule';
import { ApiError } from '../../services/apiClient';
import type { VisitGuide } from '../../types/assistant';
import type { Place } from '../../types/place';
import type { Visit, VisitTiming } from '../../types/visit';
import { OutlineButton } from '../OutlineButton';
import { PrimaryButton } from '../PrimaryButton';
import { DateTimeField } from './DateTimeField';
import { TimingOption } from './TimingOption';

const TIMINGS: VisitTiming[] = ['now', 'today', 'thisWeek', 'later'];

type ScheduleViewProps = {
    place: Place;
    purpose: string | null; // what Walksy helped with, e.g. "Pay bills"
    guide: VisitGuide | null; // Walksy's steps for it, used later by "Help Me"
    onClose: () => void; // X: back to Walksy
    onCreated: (visit: Visit, action: 'start' | 'schedule') => void;
};

// keep the time of `base` and take the day from `day` (and the other way round)
const withDay = (base: Date, day: Date) =>
    new Date(day.getFullYear(), day.getMonth(), day.getDate(), base.getHours(), base.getMinutes());
const withTime = (base: Date, time: Date) =>
    new Date(base.getFullYear(), base.getMonth(), base.getDate(), time.getHours(), time.getMinutes());

// last step of creating a visit: when, notify the place, ride
export function ScheduleView({ place, purpose, guide, onClose, onCreated }: ScheduleViewProps) {
    const { t } = useTranslation();
    const { createVisit } = useVisits();
    const schedule = useVisitSchedule();
    const [saving, setSaving] = useState(false);
    const [errorCode, setErrorCode] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (saving) return;
        setSaving(true);
        setErrorCode(null);

        try {
            const visit = await createVisit({
                place,
                title: purpose ?? place.name,
                startsAt: schedule.startsAt.toISOString(),
                notifyPlace: schedule.notifyPlace,
                rideRequested: schedule.rideRequested,
                start: schedule.action === 'start',
                guide: guide ?? undefined,
            });
            onCreated(visit, schedule.action);
        } catch (error) {
            setErrorCode(error instanceof ApiError ? error.code : 'unavailable');
        } finally {
            setSaving(false);
        }
    };

    return (
        <View style={styles.flex}>
            <View style={styles.titleRow}>
                <Text style={styles.title}>{t('schedule.title')}</Text>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('schedule.close')}
                    onPress={onClose}
                    hitSlop={10}
                    style={({ pressed }) => pressed && styles.pressed}
                >
                    <Ionicons name="close" size={30} color={colors.textPrimary} />
                </Pressable>
            </View>
            <Text style={styles.subtitle}>{t('schedule.subtitle')}</Text>

            <ScrollView style={styles.flex} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View accessibilityRole="radiogroup" style={styles.options}>
                    {TIMINGS.map((timing) => (
                        <TimingOption
                            key={timing}
                            title={t(`schedule.timing.${timing}.title`)}
                            subtitle={t(`schedule.timing.${timing}.subtitle`)}
                            selected={schedule.timing === timing}
                            onPress={() => schedule.setTiming(timing)}
                        >
                            {timing !== 'now' && (
                                <>
                                    {timing !== 'today' && (
                                        <DateTimeField
                                            mode="date"
                                            value={schedule.startsAt}
                                            minimumDate={schedule.limits.min}
                                            maximumDate={schedule.limits.max}
                                            onChange={(day) => schedule.setStartsAt(withDay(schedule.startsAt, day))}
                                        />
                                    )}
                                    <DateTimeField
                                        mode="time"
                                        value={schedule.startsAt}
                                        onChange={(time) => schedule.setStartsAt(withTime(schedule.startsAt, time))}
                                    />
                                </>
                            )}
                        </TimingOption>
                    ))}
                </View>

                <View style={styles.row}>
                    <Text style={styles.sectionTitle}>{t('schedule.notifyTitle')}</Text>
                    <Switch
                        value={schedule.notifyPlace}
                        onValueChange={schedule.setNotifyPlace}
                        trackColor={{ false: colors.switchOff, true: colors.switchOn }}
                        thumbColor={colors.card}
                        ios_backgroundColor={colors.switchOff}
                        accessibilityLabel={t('schedule.notifyTitle')}
                        style={styles.switch}
                    />
                </View>
                <Text style={styles.hint}>{t('schedule.notifyHint')}</Text>

                <View style={[styles.row, styles.rideRow]}>
                    <Text style={styles.sectionTitle}>{t('schedule.rideTitle')}</Text>
                    <OutlineButton
                        label={schedule.rideRequested ? t('schedule.rideRequested') : t('schedule.rideBook')}
                        icon={schedule.rideRequested ? 'checkmark' : undefined}
                        accessibilityLabel={schedule.rideRequested ? t('schedule.rideCancelLabel') : t('schedule.rideBookLabel')}
                        onPress={schedule.toggleRide}
                    />
                </View>
                {schedule.rideRequested && <Text style={styles.hint}>{t('schedule.rideHint')}</Text>}
            </ScrollView>

            <View style={styles.footer}>
                {errorCode && (
                    <Text style={styles.error} accessibilityRole="alert">
                        {t(
                            errorCode === 'network'
                                ? 'schedule.errors.network'
                                : errorCode === 'starts_in_past'
                                  ? 'schedule.errors.startsInPast'
                                  : 'schedule.errors.save',
                        )}
                    </Text>
                )}
                <PrimaryButton
                    label={schedule.action === 'start' ? t('schedule.start') : t('schedule.done')}
                    onPress={handleSubmit}
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
    switch: { transform: [{ scale: 1.4 }] },
    content: { paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.lg },
    options: { gap: spacing.md },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.lg + 4 },
    rideRow: { marginTop: spacing.lg },
    sectionTitle: { ...typography.subTitleFirst, color: colors.brand, flexShrink: 1 },
    hint: { ...typography.body, color: colors.textSecondary, marginTop: spacing.sm },
    footer: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.md },
    error: { ...typography.body, color: colors.error, textAlign: 'center', marginBottom: spacing.sm },
});
