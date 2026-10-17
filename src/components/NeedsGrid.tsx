import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { spacing } from '../constants/theme';
import { ACCESSIBILITY_NEEDS } from '../data/accessibilityNeeds';
import type { AccessibilityNeed } from '../types/account';
import { NeedCard } from './NeedCard';

type NeedsGridProps = {
    selected: AccessibilityNeed[];
    onToggle: (need: AccessibilityNeed) => void;
};

export function NeedsGrid({ selected, onToggle }: NeedsGridProps) {
    const { t } = useTranslation();

    return (
        <View style={styles.grid}>
            {ACCESSIBILITY_NEEDS.map((need) => (
                <NeedCard
                    key={need.value}
                    label={t(need.labelKey)}
                    icon={need.icon}
                    selected={selected.includes(need.value)}
                    onPress={() => onToggle(need.value)}
                    style={styles.cell}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
    // two equal columns: under half the row each, then both grow to fill the gap
    cell: { flexBasis: '40%', flexGrow: 1 },
});
