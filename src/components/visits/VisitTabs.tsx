import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography } from '../../constants/theme';
import type { VisitTab } from '../../types/visit';

const TABS: VisitTab[] = ['active', 'upcoming', 'past'];

type VisitTabsProps = {
    selected: VisitTab;
    onSelect: (tab: VisitTab) => void;
};

// Active · Upcoming · Past, the selected one orange and underlined
export function VisitTabs({ selected, onSelect }: VisitTabsProps) {
    const { t } = useTranslation();

    return (
        <View style={styles.row} accessibilityRole="tablist">
            {TABS.map((tab) => {
                const isSelected = tab === selected;
                return (
                    <Pressable
                        key={tab}
                        accessibilityRole="tab"
                        accessibilityState={{ selected: isSelected }}
                        onPress={() => onSelect(tab)}
                        style={[styles.tab, isSelected && styles.tabSelected]}
                    >
                        <Text style={[styles.label, isSelected && styles.labelSelected]}>{t(`visits.tabs.${tab}`)}</Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.borderCard },
    tab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: spacing.sm + 2,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
        marginBottom: -1, // the underline sits on top of the grey line
    },
    tabSelected: { borderBottomColor: colors.brand },
    label: { ...typography.subTitleFirst, fontWeight: '400', color: colors.textSecondary },
    labelSelected: { fontWeight: '700', color: colors.brand },
});
