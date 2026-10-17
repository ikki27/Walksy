import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing } from '../../constants/theme';

const STARS = [1, 2, 3, 4, 5];

type StarRatingProps = {
    value: number | null;
    onChange: (value: number) => void;
};

// five big stars, tap one to rate
export function StarRating({ value, onChange }: StarRatingProps) {
    const { t } = useTranslation();

    return (
        <View
            style={styles.row}
            accessibilityRole="adjustable"
            accessibilityLabel={t('help.rateLabel')}
            accessibilityValue={{ min: 1, max: 5, now: value ?? 0 }}
        >
            {STARS.map((star) => {
                const filled = value !== null && star <= value;
                return (
                    <Pressable
                        key={star}
                        accessibilityRole="button"
                        accessibilityLabel={t('help.stars', { count: star })}
                        accessibilityState={{ selected: value === star }}
                        onPress={() => onChange(star)}
                        hitSlop={4}
                    >
                        <Ionicons
                            name={filled ? 'star' : 'star-outline'}
                            size={42}
                            color={filled ? colors.star : colors.textPrimary}
                        />
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.xs },
});
