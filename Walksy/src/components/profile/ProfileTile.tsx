import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, spacing, typography } from '../../constants/theme';

type ProfileTileProps = {
    label: string;
    icon: ComponentProps<typeof Ionicons>['name'];
    onPress: () => void;
};

// one card in "My stuff": orange icon above a bold label
export function ProfileTile({ label, icon, onPress }: ProfileTileProps) {
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={label}
            onPress={onPress}
            style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
        >
            <Ionicons name={icon} size={30} color={colors.brand} />
            <Text style={styles.label} numberOfLines={1}>
                {label}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    tile: {
        flexBasis: '40%', // two per row, both grow to fill the gap
        flexGrow: 1,
        height: 96,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm + 2,
        paddingHorizontal: spacing.sm,
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
    label: { ...typography.listItem, color: colors.textPrimary },
});
