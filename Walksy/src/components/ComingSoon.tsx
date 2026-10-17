import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography } from '../constants/theme';

type ComingSoonProps = {
    title: string;
    showBack?: boolean;
};

// placeholder for screens that aren't built yet
export function ComingSoon({ title, showBack = false }: ComingSoonProps) {
    const { t } = useTranslation();
    const router = useRouter();

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.container}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.text}>{t('comingSoon.text')}</Text>
                {showBack && (
                    <Pressable accessibilityRole="button" onPress={() => router.back()} hitSlop={8} style={styles.back}>
                        <Text style={styles.backText}>{t('comingSoon.back')}</Text>
                    </Pressable>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
    title: { ...typography.subTitleFirst, color: colors.brand },
    text: { ...typography.subTitleSecondary, color: colors.textSecondary, marginTop: spacing.sm },
    back: { marginTop: spacing.lg, paddingVertical: spacing.sm },
    backText: { ...typography.body, color: colors.textSecondary },
});
