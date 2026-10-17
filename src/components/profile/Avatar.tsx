import { StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '../../constants/theme';

type AvatarProps = {
    firstName: string;
    lastName: string;
    size?: number;
};

// round avatar with the person's initials (profile photos come later)
export function Avatar({ firstName, lastName, size = 120 }: AvatarProps) {
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

    return (
        <View
            style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}
            accessibilityRole="image"
            accessibilityLabel={`${firstName} ${lastName}`}
        >
            <Text style={[styles.initials, { fontSize: size * 0.36 }]}>{initials}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    circle: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.avatar },
    initials: { ...typography.logo, color: colors.brandText },
});
