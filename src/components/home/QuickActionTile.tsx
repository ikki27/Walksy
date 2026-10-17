import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import type { ImageSource } from 'expo-image';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, spacing, typography } from '../../constants/theme';

const ICON_SIZE = 30;

// either an Ionicons name or our own picture from assets/images
type TileIcon =
    | { icon: ComponentProps<typeof Ionicons>['name']; image?: never }
    | { image: ImageSource | number; icon?: never };

type QuickActionTileProps = TileIcon & {
    label: string;
    onPress: () => void;
};

export function QuickActionTile({ label, icon, image, onPress }: QuickActionTileProps) {
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={label}
            onPress={onPress}
            style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
        >
            {image ? (
                <Image source={image} style={styles.image} contentFit="contain" />
            ) : (
                <Ionicons name={icon} size={ICON_SIZE} color={colors.brand} />
            )}
            <Text style={styles.label} numberOfLines={1}>
                {label}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    tile: {
        flex: 1,
        height: 92,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.sm,
        backgroundColor: colors.card,
        borderRadius: radius.lg - 4,
    },
    pressed: { opacity: 0.85 },
    image: { width: ICON_SIZE, height: ICON_SIZE },
    label: { ...typography.tile, color: colors.textPrimary, marginTop: spacing.sm },
});
