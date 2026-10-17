import { Redirect, Tabs } from 'expo-router';
// "Map as MapIcon": don't hide JavaScript's built-in Map in this file
import { CirclePlus, House, Map as MapIcon, MessageCircle, User } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { colors, spacing, typography } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

// order here = order in the tab bar
const TABS: { name: string; labelKey: string; Icon: LucideIcon }[] = [
  { name: 'home', labelKey: 'tabs.home', Icon: House },
  { name: 'map', labelKey: 'tabs.map', Icon: MapIcon },
  { name: 'visits', labelKey: 'tabs.visits', Icon: CirclePlus },
  { name: 'chats', labelKey: 'tabs.chats', Icon: MessageCircle },
  { name: 'profile', labelKey: 'tabs.profile', Icon: User },
];

const ICON_SIZE = 23;
// line thickness of the tab icons (Lucide default is 2): higher = bolder
const ICON_STROKE = 2.5;
// icon + label block, the white space below it comes from the bottom padding
const TAB_CONTENT_HEIGHT = 50;
const TOP_SPACE = spacing.xs;
// minimum white space under the labels (phones without a home indicator report 0)
const MIN_BOTTOM_SPACE = 20;
// extra white under the labels so the icons sit near the top, not in the middle
const EXTRA_BOTTOM_SPACE = 12;

export default function TabsLayout() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { status } = useAuth();
  const bottomSpace = Math.max(insets.bottom, MIN_BOTTOM_SPACE) + EXTRA_BOTTOM_SPACE;

  // the main app is only for logged-in users (also after the token expired)
  if (status === 'signedOut') return <Redirect href="/" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarLabelStyle: [typography.tabLabel, { marginTop: 2 }],
        // items start at the top of the bar instead of being centered
        tabBarItemStyle: { justifyContent: 'flex-start' },
        // on Android the bar would sit on top of the keyboard and push the input out of view
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 0,
          height: TAB_CONTENT_HEIGHT + TOP_SPACE + bottomSpace,
          paddingTop: TOP_SPACE,
          paddingBottom: bottomSpace,
        },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: t(tab.labelKey),
            tabBarIcon: ({ color }) => <tab.Icon size={ICON_SIZE} color={color} strokeWidth={ICON_STROKE} />,
          }}
        />
      ))}
    </Tabs>
  );
}
