import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { colors, spacing, typography } from '../../constants/theme';
import { usePlaceSearch } from '../../hooks/usePlaceSearch';
import { MIN_SEARCH_LENGTH } from '../../services/placesApi';
import type { Place } from '../../types/place';
import { SearchBar } from '../SearchBar';
import { PlaceCard } from './PlaceCard';

type PlaceSearchViewProps = {
    recentPlaces: Place[];
    onSelect: (place: Place) => void;
    onClose: () => void;
};

// "Create a new visit": search a place, or pick one visited before
export function PlaceSearchView({ recentPlaces, onSelect, onClose }: PlaceSearchViewProps) {
    const { t, i18n } = useTranslation();
    const [query, setQuery] = useState('');
    const search = usePlaceSearch(query, i18n.language);

    const showingResults = search.active;
    const places = showingResults ? (search.status === 'done' ? search.results : []) : recentPlaces;

    return (
        <View style={styles.container}>
            <View style={styles.titleRow}>
                <Text style={styles.title}>{t('places.title')}</Text>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('places.close')}
                    onPress={onClose}
                    hitSlop={10}
                    style={({ pressed }) => pressed && styles.pressed}
                >
                    <Ionicons name="close" size={30} color={colors.textPrimary} />
                </Pressable>
            </View>

            <SearchBar value={query} onChangeText={setQuery} placeholder={t('places.searchPlaceholder')} />

            <FlatList
                data={places}
                keyExtractor={(place) => place.id}
                renderItem={({ item }) => <PlaceCard place={item} onPress={onSelect} />}
                style={styles.list}
                contentContainerStyle={styles.listContent}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <Text style={styles.sectionTitle}>
                        {showingResults ? t('places.results') : t('places.recent')}
                    </Text>
                }
                ListEmptyComponent={<SearchStatus search={search} showingResults={showingResults} />}
                // LocationIQ / OpenStreetMap data may only be shown with this credit
                ListFooterComponent={
                    showingResults && places.length > 0 ? (
                        <Text style={styles.attribution}>{t('places.attribution')}</Text>
                    ) : null
                }
            />
        </View>
    );
}

type SearchStatusProps = {
    search: ReturnType<typeof usePlaceSearch>;
    showingResults: boolean;
};

// what to show when there is no list: hints, loading, nothing found, errors
function SearchStatus({ search, showingResults }: SearchStatusProps) {
    const { t } = useTranslation();

    if (!showingResults) return <Text style={styles.hint}>{t('places.noRecent')}</Text>;

    switch (search.status) {
        case 'idle':
            return <Text style={styles.hint}>{t('places.typeMore', { count: MIN_SEARCH_LENGTH })}</Text>;
        case 'loading':
            return <ActivityIndicator color={colors.brand} style={styles.loading} />;
        case 'error':
            return (
                <Text style={styles.error} accessibilityRole="alert">
                    {t(`places.errors.${search.code}`)}
                </Text>
            );
        case 'done':
            return <Text style={styles.hint}>{t('places.noResults')}</Text>;
    }
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: spacing.md },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: spacing.lg + 4,
        marginBottom: spacing.md,
    },
    title: { ...typography.subTitleFirst, fontSize: 22, color: colors.brand },
    pressed: { opacity: 0.6 },
    list: { flex: 1 },
    listContent: { paddingBottom: spacing.lg, gap: spacing.md },
    sectionTitle: { ...typography.label, color: colors.textPrimary, marginTop: spacing.md },
    hint: { ...typography.body, color: colors.textSecondary },
    error: { ...typography.body, color: colors.error },
    loading: { marginTop: spacing.md },
    attribution: { ...typography.error, color: colors.textMuted, textAlign: 'center' },
});
