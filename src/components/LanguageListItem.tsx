import CountryFlag from 'react-native-country-flag';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '@/constants/theme';
import type { Language } from '../data/languages';

type LanguageListItemProps = {
    language: Language;
    selected: boolean;
    onPress: (code: string) => void;
};

export function LanguageListItem({ language, selected, onPress }: LanguageListItemProps) {
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onPress(language.code)}
            style={({ pressed }) => [
                styles.card,
                selected && styles.cardSelected,
                pressed && styles.pressed,
            ]}
        >
            <View style={styles.flagWrapper}>
                <CountryFlag isoCode={language.isoCode} size={28} />
            </View>

            <Text style={styles.name}>{language.name}</Text>

            {selected && (
                <Ionicons name="checkmark-circle" size={22} color={colors.brand} />
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderCard,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    // subtle lift (matches the soft shadow in the mockup)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1.5,
  },
  cardSelected: {
    borderColor: colors.brand,
    borderWidth: 2,
  },
  pressed: { opacity: 0.7 },
  flagWrapper: {
    width: 40,
    height: 28,
    borderRadius: 5,
    overflow: 'hidden',       // guarantees rounded corners on the flag
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginRight: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1.5,
  },
  name: { ...typography.listItem, color: colors.textPrimary, flex: 1 },
});