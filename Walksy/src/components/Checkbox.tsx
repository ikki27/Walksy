import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../constants/theme';

type CheckboxProps = {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
    error?: string;
};

export function Checkbox({ checked, onChange, label, error }: CheckboxProps) {
    return (
        <View>
            <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked }}
                accessibilityLabel={label}
                onPress={() => onChange(!checked)}
                style={styles.row}
                hitSlop={8}
            >
                <View style={[styles.box, checked && styles.boxChecked, error ? styles.boxError : null]}>
                    {checked && <Ionicons name="checkmark" size={14} color={colors.brandText} />}
                </View>
                <Text style={styles.label}>{label}</Text>
            </Pressable>
            {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
    );
}

const BOX_SIZE = 18;

const styles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'flex-start', paddingLeft: spacing.sm + 3 },
    box: {
        width: BOX_SIZE,
        height: BOX_SIZE,
        borderRadius: 3,
        borderWidth: 1.5,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        marginRight: spacing.lg + 4,
    },
    boxChecked: { backgroundColor: colors.brand, borderColor: colors.brand },
    boxError: { borderColor: colors.error },
    label: { ...typography.consent, color: colors.textPrimary, flex: 1 },
    error: { ...typography.error, color: colors.error, marginTop: spacing.sm, marginLeft: spacing.sm + 3 },
});
