import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing } from '../../constants/theme';
import { SDG_BY_GOAL } from '../../data/sdgs';

type SdgBadgeProps = {
    goal: number;
    size: number; // width and height
};

// colored SDG square: number + short title on top, pictogram below (scales with `size`)
export function SdgBadge({ goal, size }: SdgBadgeProps) {
    const { t } = useTranslation();
    const sdg = SDG_BY_GOAL[goal];
    const scale = size / 100;
    const small = size < 60; // in lists: number + icon only, the title is next to it

    return (
        <View
            style={[styles.square, { width: size, height: size, backgroundColor: sdg.color, padding: 6 * scale }]}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
        >
            <View style={styles.header}>
                <Text style={[styles.number, { fontSize: 30 * scale, lineHeight: 32 * scale }]}>{goal}</Text>
                {!small && (
                    <Text style={[styles.title, { fontSize: 9 * scale, lineHeight: 11 * scale }]} numberOfLines={3}>
                        {t(`sdg.${goal}.tileTitle`)}
                    </Text>
                )}
            </View>
            <View style={styles.iconWrap}>
                <Ionicons name={sdg.icon} size={small ? size * 0.42 : 44 * scale} color={colors.brandText} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    square: { borderRadius: 3 },
    header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs },
    number: { color: colors.brandText, fontWeight: '800' },
    title: { flex: 1, color: colors.brandText, fontWeight: '700', textTransform: 'uppercase' },
    iconWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
