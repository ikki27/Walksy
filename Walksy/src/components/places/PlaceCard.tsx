import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../constants/theme';
import { PLACE_CATEGORY_ICONS } from '../../data/placeCategories';
import type { Place } from '../../types/place';

type PlaceCardProps = {
    place: Place;
    onPress: (place: Place) => void;
};

export function PlaceCard({ place, onPress }: PlaceCardProps) {
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${place.name}, ${place.address}`}
            onPress={() => onPress(place)}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
        >
            <MaterialCommunityIcons name={PLACE_CATEGORY_ICONS[place.category]} size={34} color={colors.brand} />
            <View style={styles.texts}>
                <Text style={styles.name} numberOfLines={1}>
                    {place.name}
                </Text>
                <Text style={styles.address} numberOfLines={1}>
                    {place.address}
                </Text>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md + 2,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.borderCard,
        borderRadius: radius.sm,
        // same soft lift as the other cards
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.12,
        shadowRadius: 3,
        elevation: 2,
    },
    pressed: { opacity: 0.7 },
    texts: { flex: 1, gap: spacing.xs + 2 },
    name: { ...typography.label, fontSize: 17, color: colors.textPrimary },
    address: { ...typography.body, color: colors.textSecondary },
});
