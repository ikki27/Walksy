import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, radius, spacing, typography } from '../constants/theme';

export function SosButton({ onPress }: { onPress: () => void }) {
    const { t } = useTranslation();

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('home.sosLabel')}
            onPress={onPress}
            style={({ pressed }) => [styles.sos, pressed && styles.pressed]}
        >
            <Ionicons name="warning-outline" size={16} color={colors.onImage} />
            <Text style={styles.text}>{t('home.sos')}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    sos: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        height: 32,
        paddingHorizontal: spacing.md - 4,
        borderRadius: radius.pill,
        backgroundColor: colors.sos,
    },
    text: { ...typography.badge, fontWeight: '700', color: colors.onImage },
    pressed: { opacity: 0.7 },
});
