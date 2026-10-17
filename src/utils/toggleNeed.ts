import type { AccessibilityNeed } from '../types/account';

// "none" can't be combined with anything else:
// picking "none" clears the rest, picking any need clears "none"
export function toggleNeed(selected: AccessibilityNeed[], need: AccessibilityNeed): AccessibilityNeed[] {
  if (selected.includes(need)) return selected.filter((item) => item !== need);
  if (need === 'none') return ['none'];
  return [...selected.filter((item) => item !== 'none'), need];
}
