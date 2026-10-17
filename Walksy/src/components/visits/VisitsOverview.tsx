import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors, spacing, typography } from '../../constants/theme';
import { useVisits } from '../../context/VisitsContext';
import { useNow } from '../../hooks/useNow';
import type { VisitAction } from '../../services/visitsApi';
import type { Visit, VisitTab } from '../../types/visit';
import { groupVisitsByTab } from '../../utils/visits';
import { PrimaryButton } from '../PrimaryButton';
import { VisitOverviewCard } from './VisitOverviewCard';
import { VisitTabs } from './VisitTabs';

type VisitsOverviewProps = {
    tab: VisitTab;
    onTabChange: (tab: VisitTab) => void;
    onCreate: () => void;
    onHelp: (visit: Visit) => void;
    onMap: (visit: Visit) => void;
    onRestore: (visit: Visit) => void;
};

// start page of the Visits tab: Active / Upcoming / Past + "Create a new visit"
export function VisitsOverview({ tab, onTabChange, onCreate, onHelp, onMap, onRestore }: VisitsOverviewProps) {
    const { t } = useTranslation();
    const { visits, loadState, errorCode, refresh, changeVisit } = useVisits();
    const now = useNow(30 * 1000); // badges like "In 15 minutes" keep counting
    const [busyId, setBusyId] = useState<string | null>(null);

    const groups = useMemo(() => groupVisitsByTab(visits, now), [visits, now]);
    const list = groups[tab];

    const runAction = async (visit: Visit, action: VisitAction) => {
        setBusyId(visit.id);
        try {
            await changeVisit(visit.id, action);
        } catch {
            Alert.alert(t('visits.errors.title'), t('visits.errors.action'));
        } finally {
            setBusyId(null);
        }
    };

    // ending or cancelling can't be undone by accident: ask first
    const confirm = (visit: Visit, action: 'end' | 'cancel') =>
        Alert.alert(t(`visits.confirm.${action}.title`), t(`visits.confirm.${action}.text`, { title: visit.title }), [
            { text: t('visits.confirm.no'), style: 'cancel' },
            { text: t(`visits.confirm.${action}.yes`), style: 'destructive', onPress: () => runAction(visit, action) },
        ]);

    return (
        <View style={styles.flex}>
            <VisitTabs selected={tab} onSelect={onTabChange} />

            <FlatList
                data={list}
                keyExtractor={(visit) => visit.id}
                renderItem={({ item }) => (
                    <VisitOverviewCard
                        visit={item}
                        tab={tab}
                        now={now}
                        busy={busyId === item.id}
                        onMap={onMap}
                        onHelp={onHelp}
                        onEnd={(visit) => confirm(visit, 'end')}
                        onCancel={(visit) => confirm(visit, 'cancel')}
                        onRestore={onRestore}
                    />
                )}
                style={styles.flex}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={loadState === 'loading' && visits.length > 0} onRefresh={refresh} tintColor={colors.brand} />
                }
                ListEmptyComponent={
                    loadState === 'loading' ? (
                        <ActivityIndicator color={colors.brand} style={styles.loading} />
                    ) : loadState === 'error' ? (
                        <Text style={styles.error} accessibilityRole="alert">
                            {t(errorCode === 'network' ? 'visits.errors.network' : 'visits.errors.load')}
                        </Text>
                    ) : (
                        <Text style={styles.empty}>{t(`visits.empty.${tab}`)}</Text>
                    )
                }
            />

            <View style={styles.footer}>
                <PrimaryButton label={t('visits.create')} onPress={onCreate} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    listContent: { padding: spacing.md, gap: spacing.md, flexGrow: 1 },
    loading: { marginTop: spacing.xl },
    empty: { ...typography.subTitleSecondary, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.xl },
    error: { ...typography.body, color: colors.error, textAlign: 'center', marginTop: spacing.xl },
    footer: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.md },
});
