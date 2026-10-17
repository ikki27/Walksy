import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography } from '../constants/theme';
import { SosButton } from './SosButton';

type ScreenHeaderProps = {
    title: string;
    onNotificationsPress: () => void;
    onSosPress: () => void;
    onBack?: () => void; // sub-pages (e.g. Statistics) get a back arrow before the title
};

// header for the white tab screens (Visits, Map, ...): title, bell and SOS
export function ScreenHeader({ title, onNotificationsPress, onSosPress, onBack }: ScreenHeaderProps) {
    const { t } = useTranslation();

    return (
        <View style={styles.header}>
            <View style={styles.titleRow}>
                {onBack && (
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={t('comingSoon.back')}
                        onPress={onBack}
                        hitSlop={10}
                        style={({ pressed }) => pressed && styles.pressed}
                    >
                        <Ionicons name="chevron-back" size={28} color={colors.textPrimary} />
                    </Pressable>
                )}
                <Text style={styles.title} accessibilityRole="header">
                    {title}
                </Text>
            </View>

            <View style={styles.actions}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('home.notifications')}
                    onPress={onNotificationsPress}
                    hitSlop={8}
                    style={({ pressed }) => pressed && styles.pressed}
                >
                    <Ionicons name="notifications-outline" size={28} color={colors.textPrimary} />
                </Pressable>
                <SosButton onPress={onSosPress} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md + 8,
    },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexShrink: 1 },
    title: { ...typography.screenTitle, color: colors.textPrimary },
    actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    pressed: { opacity: 0.7 },
});
