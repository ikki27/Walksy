import type { ComponentProps } from 'react';
import type { MaterialCommunityIcons } from '@expo/vector-icons';

import type { PlaceCategory } from '../types/place';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

// icon shown on place cards for each kind of place (browse: https://icons.expo.fyi)
export const PLACE_CATEGORY_ICONS: Record<PlaceCategory, IconName> = {
  pharmacy: 'mortar-pestle-plus',
  hospital: 'hospital-building',
  bank: 'bank-outline',
  shop: 'cart-outline',
  government: 'town-hall',
  post: 'mailbox-outline',
  other: 'map-marker-outline',
};
