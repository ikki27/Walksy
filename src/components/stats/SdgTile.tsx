import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, radius, spacing, typography } from '../../constants/theme';
import { SdgBadge } from './SdgBadge';

type SdgTileProps = {
    goal: number;
    visits: number;
    onPress: () => void;
};

const TILE = 104;

// "Top SDGs" card: the SDG square with the visit count below
export function SdgTile({ goal, visits, onPress }: SdgTileProps) {
    const { t } = useTranslation();

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${t(`sdg.${goal}.title`)}, ${t('stats.visitsCount', { count: visits })}`}
            onPress={onPress}
            style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
        >
            <SdgBadge goal={goal} size={TILE} />
            <View style={styles.count}>
                <Text style={styles.number}>{visits}</Text>
                <Text style={styles.label}>{t(visits === 1 ? 'stats.visit' : 'stats.visits')}</Text>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    tile: {
        flex: 1,
        maxWidth: TILE + 2,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.borderCard,
        borderRadius: radius.sm,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.12,
        shadowRadius: 3,
        elevation: 2,
    },
    pressed: { opacity: 0.75 },
    count: { alignItems: 'center', paddingVertical: spacing.sm + 2 },
    number: { ...typography.label, fontSize: 17, color: colors.textPrimary },
    label: { ...typography.cardBody, fontSize: 16, color: colors.textPrimary },
});
