import type { ComponentProps } from 'react';
import type { ImageSourcePropType } from 'react-native';
import type { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

import type { AccessibilityNeed } from '../types/account';

export type NeedIcon =
  | { set: 'community'; name: ComponentProps<typeof MaterialCommunityIcons>['name'] }
  | { set: 'material'; name: ComponentProps<typeof MaterialIcons>['name'] }
  | { set: 'image'; source: ImageSourcePropType };

// labelKey points to the translation in src/i18n/locales
export const ACCESSIBILITY_NEEDS: { value: AccessibilityNeed; labelKey: string; icon: NeedIcon }[] = [
  { value: 'deafness', labelKey: 'needs.deafness', icon: { set: 'community', name: 'ear-hearing' } },
  { value: 'speech', labelKey: 'needs.speech', icon: { set: 'image', source: require('../../assets/images/voice.png') } },
  { value: 'visual', labelKey: 'needs.visual', icon: { set: 'community', name: 'eye-outline' } },
  { value: 'mobility', labelKey: 'needs.mobility', icon: { set: 'material', name: 'accessible' } },
  { value: 'autism', labelKey: 'needs.autism', icon: { set: 'image', source: require('../../assets/images/puzzle.png') } },
  { value: 'adhd', labelKey: 'needs.adhd', icon: { set: 'image', source: require('../../assets/images/butterfly.png') } },
  { value: 'elderly', labelKey: 'needs.elderly', icon: { set: 'community', name: 'human-cane' } },
  { value: 'none', labelKey: 'needs.none', icon: { set: 'community', name: 'cancel' } },
];

export const DEFAULT_COMPANION_NAME = 'Walksy';
export const MAX_COMPANION_NAME_LENGTH = 20;
