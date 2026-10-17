import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography } from '../../constants/theme';
import { SosButton } from '../SosButton';

type HomeHeaderProps = {
    onNotificationsPress: () => void;
    onSosPress: () => void;
};

export function HomeHeader({ onNotificationsPress, onSosPress }: HomeHeaderProps) {
    const { t } = useTranslation();

    return (
        <View style={styles.header}>
            <Text style={styles.logo} accessibilityRole="header">
                Walksy
            </Text>

            <View style={styles.actions}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('home.notifications')}
                    onPress={onNotificationsPress}
                    hitSlop={8}
                    style={({ pressed }) => pressed && styles.pressed}
                >
                    <Ionicons name="notifications" size={28} color={colors.onImage} />
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
    logo: {
        ...typography.logo,
        color: colors.onImage,
        // keeps the white logo readable on bright parts of the background
        textShadowColor: 'rgba(0, 0, 0, 0.25)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    pressed: { opacity: 0.7 },
});
