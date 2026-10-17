import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

type IconName = ComponentProps<typeof Ionicons>['name'];

export type SdgInfo = {
  goal: number;
  color: string; // official UN SDG color
  icon: IconName; // our own pictogram (the official UN icons have their own usage rules)
};

// Only the goals Walksy's visits can contribute to (see api/src/visits/sdg.ts).
// The ORDER is fixed on purpose: it keeps similar UN colors (16 blue / 17 navy, 11 orange / 2 gold)
// apart in the donut chart, so neighbouring segments stay distinguishable, also with color blindness.
export const SDGS: SdgInfo[] = [
  { goal: 3, color: '#4C9F38', icon: 'pulse' },
  { goal: 16, color: '#00689D', icon: 'shield-checkmark-outline' },
  { goal: 11, color: '#FD9D24', icon: 'business-outline' },
  { goal: 10, color: '#DD1367', icon: 'swap-vertical' },
  { goal: 17, color: '#19486A', icon: 'git-network-outline' },
  { goal: 2, color: '#DDA63A', icon: 'restaurant-outline' },
  { goal: 8, color: '#A21942', icon: 'trending-up' },
];

export const SDG_BY_GOAL: Record<number, SdgInfo> = Object.fromEntries(SDGS.map((sdg) => [sdg.goal, sdg]));
