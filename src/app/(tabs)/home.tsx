import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { HomeHeader } from '../../components/home/HomeHeader';
import { QuickActionTile } from '../../components/home/QuickActionTile';
import { NoVisitCard, VisitCard } from '../../components/home/VisitCard';
import { spacing } from '../../constants/theme';
import { useVisits } from '../../context/VisitsContext';
import { useNow } from '../../hooks/useNow';
import { getFeaturedVisit } from '../../utils/visits';

const backgroundImage = require('../../../assets/images/Background.png');
const companionImage = require('../../../assets/images/Frame 113.png');
const achievementsIcon = require('../../../assets/images/Achievements.png');
const shoppingBagIcon = require('../../../assets/images/Shopping bag.png');


// height of the dark fade below the status bar, covers the header
const HEADER_SHADE_HEIGHT = 140;
// height of the dark fade above the tab bar, starts a bit above the visit card
const FOOTER_SHADE_HEIGHT = 340;

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { visits } = useVisits();
  const now = useNow();

  const featured = useMemo(() => getFeaturedVisit(visits, now), [visits, now]);

  return (
    <View style={styles.screen}>
      {/* expo-image keeps large pictures sharp (ImageBackground can downscale them on Android) */}
      <Image source={backgroundImage} style={StyleSheet.absoluteFill} contentFit="cover" />

      {/* dark fade at the top so the white logo, bell and status bar stay readable */}
      <LinearGradient
        colors={['rgba(0, 0, 0, 1)', 'rgba(0, 0, 0, 0.6)', 'transparent']}
        locations={[0, 0.55, 1]}
        style={[styles.headerShade, { height: insets.top + HEADER_SHADE_HEIGHT }]}
        pointerEvents="none"
      />

      {/* dark fade at the bottom, behind the cards */}
      <LinearGradient
        colors={['transparent', 'rgba(0, 0, 0, 0.70)', 'rgba(0, 0, 0, 0.9)']}
        locations={[0, 0.45, 1]}
        style={styles.footerShade}
        pointerEvents="none"
      />

      <StatusBar style="light" />

      {/* bottom inset is handled by the tab bar */}
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <HomeHeader
          onNotificationsPress={() => {
            // TODO: open notifications once the screen exists
          }}
          onSosPress={() => {
            // TODO: emergency flow
          }}
        />

        {/* takes all space between header and cards, the companion stands on the cards */}
        <View style={styles.companionArea}>
          <Image
            source={companionImage}
            style={styles.companion}
            contentFit="contain"
            contentPosition="bottom"
            accessibilityLabel={t('home.companionLabel')}
          />
        </View>

        <View style={styles.cards}>
          {featured ? (
            <VisitCard
              visit={featured.visit}
              status={featured.state}
              now={now}
              onPress={() => router.push('/visits')}
            />
          ) : (
            <NoVisitCard />
          )}

          <View style={styles.tiles}>
            <QuickActionTile
              label={t('home.accessoriesShop')}
              image={shoppingBagIcon}
              onPress={() => router.push('/shop')}
            />
            <QuickActionTile
              label={t('home.achievements')}
              image={achievementsIcon}
              onPress={() => router.push('/achievements')}
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safeArea: { flex: 1 },
  headerShade: { position: 'absolute', top: 0, left: 0, right: 0 },
  footerShade: { position: 'absolute', bottom: 0, left: 0, right: 0, height: FOOTER_SHADE_HEIGHT },
  companionArea: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  // ~60% of the screen width, shrinks on short screens so it never overlaps the header
  // translateY nudges it down onto the card edge without changing the layout around it
  companion: { width: '60%', maxHeight: '100%', aspectRatio: 984 / 1424, transform: [{ translateY: 6 }] },
  cards: { paddingHorizontal: spacing.md, paddingBottom: spacing.md, gap: spacing.sm + 3 },
  tiles: { flexDirection: 'row', gap: spacing.md },
});
