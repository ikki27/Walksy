import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import type { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, radius, spacing, typography } from '../../constants/theme';
import { safeLocale } from '../../utils/formatVisitTime';
import { TIME_STEP_MINUTES } from '../../utils/visitSchedule';

type DateTimeFieldProps = {
    mode: 'date' | 'time';
    value: Date;
    minimumDate?: Date;
    maximumDate?: Date;
    onChange: (date: Date) => void;
};

// a pill showing the date or time; tapping it opens the system picker
// (Android: a dialog, iPhone: a wheel below the pill)
export function DateTimeField({ mode, value, minimumDate, maximumDate, onChange }: DateTimeFieldProps) {
    const { t, i18n } = useTranslation();
    const [iosOpen, setIosOpen] = useState(false);
    const locale = safeLocale(i18n.language);

    const label =
        mode === 'date'
            ? value.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' })
            : value.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit' });

    const handleChange = (event: DateTimePickerEvent, picked?: Date) => {
        if (event.type === 'set' && picked) onChange(picked);
    };

    const open = () => {
        if (Platform.OS === 'android') {
            DateTimePickerAndroid.open({ mode, value, minimumDate, maximumDate, onChange: handleChange });
        } else {
            setIosOpen((current) => !current);
        }
    };

    return (
        <View style={iosOpen ? styles.fullWidth : undefined}>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${t(mode === 'date' ? 'schedule.pickDate' : 'schedule.pickTime')}: ${label}`}
                onPress={open}
                style={({ pressed }) => [styles.pill, pressed && styles.pressed]}
            >
                <Ionicons name={mode === 'date' ? 'calendar-outline' : 'time-outline'} size={18} color={colors.brand} />
                <Text style={styles.label}>{label}</Text>
            </Pressable>

            {Platform.OS === 'ios' && iosOpen && (
                <DateTimePicker
                    mode={mode}
                    value={value}
                    display="spinner"
                    minimumDate={minimumDate}
                    maximumDate={maximumDate}
                    minuteInterval={TIME_STEP_MINUTES}
                    locale={locale}
                    onChange={(event, picked) => picked && onChange(picked)}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    fullWidth: { width: '100%' },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: spacing.xs + 2,
        paddingHorizontal: spacing.md - 2,
        paddingVertical: spacing.sm,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: colors.brand,
        backgroundColor: colors.card,
    },
    pressed: { opacity: 0.7 },
    label: { ...typography.label, fontSize: 15, color: colors.textPrimary },
});
