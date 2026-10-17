import type { Ref } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { TextInputProps } from 'react-native';
import { colors, radius, spacing, typography } from '../constants/theme';

type FormFieldProps = TextInputProps & {
    label: string;
    error?: string;
    ref?: Ref<TextInput>;
};

export function FormField({ label, error, style, ref, ...inputProps }: FormFieldProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                ref={ref}
                accessibilityLabel={label}
                placeholderTextColor={colors.textSecondary}
                style={[styles.input, error ? styles.inputError : null, style]}
                {...inputProps}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { marginBottom: spacing.md + 4 },
    label: { ...typography.label, color: colors.textPrimary, marginBottom: spacing.sm + 2 },
    input: {
        ...typography.input,
        height: 40,
        paddingHorizontal: spacing.md,
        paddingVertical: 0,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.pill,
        backgroundColor: colors.background,
        color: colors.textPrimary,
    },
    inputError: { borderColor: colors.error },
    error: { ...typography.error, color: colors.error, marginTop: spacing.xs, marginLeft: spacing.md },
});
