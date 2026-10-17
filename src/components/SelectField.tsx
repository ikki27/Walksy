import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing, typography } from '../constants/theme';

export type SelectOption<T extends string> = { value: T; label: string };

type SelectFieldProps<T extends string> = {
    label: string;
    value: T;
    options: SelectOption<T>[];
    onChange: (value: T) => void;
};

export function SelectField<T extends string>({ label, value, options, onChange }: SelectFieldProps<T>) {
    const [open, setOpen] = useState(false);
    const selected = options.find((option) => option.value === value);

    const handleSelect = (next: T) => {
        onChange(next);
        setOpen(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>

            <Pressable
                accessibilityRole="button"
                accessibilityLabel={label}
                accessibilityValue={{ text: selected?.label }}
                onPress={() => setOpen(true)}
                style={({ pressed }) => [styles.field, pressed && styles.pressed]}
            >
                <Text style={styles.value}>{selected?.label}</Text>
                <Ionicons name="chevron-down" size={20} color={colors.textPrimary} />
            </Pressable>

            <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
                <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
                    <SafeAreaView edges={['bottom']} style={styles.sheet}>
                        <Text style={styles.sheetTitle}>{label}</Text>
                        {options.map((option) => {
                            const isSelected = option.value === value;
                            return (
                                <Pressable
                                    key={option.value}
                                    accessibilityRole="button"
                                    accessibilityState={{ selected: isSelected }}
                                    onPress={() => handleSelect(option.value)}
                                    style={({ pressed }) => [styles.option, pressed && styles.pressed]}
                                >
                                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                                        {option.label}
                                    </Text>
                                    {isSelected && <Ionicons name="checkmark" size={20} color={colors.brand} />}
                                </Pressable>
                            );
                        })}
                    </SafeAreaView>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginBottom: spacing.md + 4 },
    label: { ...typography.label, color: colors.textPrimary, marginBottom: spacing.sm + 2 },
    field: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 48,
        paddingHorizontal: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.pill,
        backgroundColor: colors.background,
    },
    value: { ...typography.input, color: colors.textSecondary },
    pressed: { opacity: 0.7 },
    backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.35)' },
    sheet: {
        backgroundColor: colors.background,
        borderTopLeftRadius: radius.lg,
        borderTopRightRadius: radius.lg,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: spacing.md,
    },
    sheetTitle: { ...typography.label, color: colors.textPrimary, marginBottom: spacing.sm },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.md,
    },
    optionText: { ...typography.input, color: colors.textPrimary },
    optionTextSelected: { color: colors.brand, fontWeight: '600' },
});
