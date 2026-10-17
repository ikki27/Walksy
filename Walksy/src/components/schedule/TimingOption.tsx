import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../constants/theme';

type TimingOptionProps = {
    title: string;
    subtitle: string;
    selected: boolean;
    onPress: () => void;
    children?: ReactNode; // date/time fields, shown only when selected
};

// one answer to "When is your visit?" (Now, Today, This week, Later)
export function TimingOption({ title, subtitle, selected, onPress, children }: TimingOptionProps) {
    return (
        <View style={[styles.card, selected && styles.cardSelected]}>
            <Pressable
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={`${title}, ${subtitle}`}
                onPress={onPress}
                style={({ pressed }) => [styles.header, pressed && styles.pressed]}
            >
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
            </Pressable>

            {selected && children ? <View style={styles.fields}>{children}</View> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
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
    cardSelected: { backgroundColor: colors.badgeSoft, borderColor: colors.brand },
    header: { paddingHorizontal: spacing.md, paddingVertical: spacing.md, gap: spacing.xs + 2 },
    pressed: { opacity: 0.7 },
    title: { ...typography.label, color: colors.textPrimary },
    subtitle: { ...typography.body, color: colors.textSecondary },
    fields: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingHorizontal: spacing.md, paddingBottom: spacing.md },
});
