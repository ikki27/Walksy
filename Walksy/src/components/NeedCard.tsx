import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { colors, radius, spacing, typography } from '../constants/theme';
import type { NeedIcon } from '../data/accessibilityNeeds';

const ICON_SIZE = 30;

function CardIcon({ icon }: { icon: NeedIcon }) {
    if (icon.set === 'image') {
        return <Image source={icon.source} style={styles.image} resizeMode="contain" />;
    }
    if (icon.set === 'material') {
        return <MaterialIcons name={icon.name} size={ICON_SIZE} color={colors.brand} />;
    }
    return <MaterialCommunityIcons name={icon.name} size={ICON_SIZE} color={colors.brand} />;
}

type NeedCardProps = {
    label: string;
    icon: NeedIcon;
    selected: boolean;
    onPress: () => void;
    style?: StyleProp<ViewStyle>;
};

export function NeedCard({ label, icon, selected, onPress, style }: NeedCardProps) {
    return (
        <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: selected }}
            accessibilityLabel={label}
            onPress={onPress}
            style={({ pressed }) => [
                styles.card,
                selected && styles.cardSelected,
                pressed && styles.pressed,
                style,
            ]}
        >
            <CardIcon icon={icon} />
            <Text style={styles.label} numberOfLines={2}>
                {label}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        height: 88,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.sm,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.borderCard,
        borderRadius: radius.sm,
        // same soft lift as the language cards
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
        elevation: 1.5,
    },
    cardSelected: { borderColor: colors.brand, borderWidth: 2 },
    pressed: { opacity: 0.7 },
    image: { width: ICON_SIZE, height: ICON_SIZE },
    label: { ...typography.listItem, color: colors.textPrimary, textAlign: 'center', marginTop: spacing.sm },
});
