import { useState } from 'react';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, radius, spacing, typography } from '../../constants/theme';
import type { VisitGuide } from '../../types/assistant';
import { GuideCard } from './GuideCard';

type Section = 'documents' | 'steps';

// Walksy's answer to a suggestion card: two cards, only one open at a time
export function GuideMessage({ guide }: { guide: VisitGuide }) {
    const { t } = useTranslation();
    const [open, setOpen] = useState<Section | null>('documents');

    const toggle = (section: Section) => setOpen((current) => (current === section ? null : section));

    return (
        <View style={styles.container}>
            <Text style={styles.intro}>{t('assistant.preparedForYou')}</Text>

            <GuideCard
                title={t('assistant.documentsNeeded')}
                icon={<Ionicons name="document-outline" size={28} color={colors.brand} />}
                expanded={open === 'documents'}
                onToggle={() => toggle('documents')}
            >
                {guide.documents.length > 0 ? (
                    guide.documents.map((item, index) => (
                        <View key={`${index}-${item}`} style={styles.row}>
                            <View style={styles.dot} />
                            <Text style={styles.itemText}>{item}</Text>
                        </View>
                    ))
                ) : (
                    <Text style={styles.itemText}>{t('assistant.noDocuments')}</Text>
                )}
            </GuideCard>

            <GuideCard
                title={t('assistant.stepByStep')}
                icon={<MaterialCommunityIcons name="format-list-checks" size={28} color={colors.brand} />}
                expanded={open === 'steps'}
                onToggle={() => toggle('steps')}
            >
                {guide.steps.map((step, index) => (
                    <View key={`${index}-${step}`} style={styles.row}>
                        <Text style={styles.number}>{index + 1}.</Text>
                        <Text style={styles.itemText}>{step}</Text>
                    </View>
                ))}
            </GuideCard>

            <View style={styles.badge}>
                <Ionicons name="sparkles-outline" size={14} color={colors.brand} />
                <Text style={styles.badgeText}>{t('assistant.generatedBy')}</Text>
            </View>
        </View>
    );
}

const DOT_SIZE = 8;

const styles = StyleSheet.create({
    container: { gap: spacing.md },
    intro: { ...typography.body, color: colors.textSecondary },
    row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm + 4 },
    // centered on the first line of the text next to it (lineHeight 23)
    dot: { width: DOT_SIZE, height: DOT_SIZE, borderRadius: DOT_SIZE / 2, backgroundColor: colors.brand, marginTop: (23 - DOT_SIZE) / 2 },
    number: { ...typography.chat, fontWeight: '700', color: colors.textPrimary, minWidth: 18 },
    itemText: { ...typography.chat, color: colors.textPrimary, flex: 1 },
    badge: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs + 2,
        paddingHorizontal: spacing.sm + 4,
        paddingVertical: spacing.xs + 2,
        borderRadius: radius.pill,
        backgroundColor: colors.badgeSoft,
    },
    badgeText: { ...typography.error, color: colors.brand },
});
