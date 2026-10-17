import { useCallback, useState } from 'react';

import { DEFAULT_COMPANION_NAME } from '../data/accessibilityNeeds';
import type { AccessibilityNeed, Personalization } from '../types/account';
import { toggleNeed } from '../utils/toggleNeed';

export function usePersonalizeForm(initial?: Partial<Personalization>) {
  const [companionName, setCompanionName] = useState(
    initial?.companionName && initial.companionName !== DEFAULT_COMPANION_NAME ? initial.companionName : '',
  );
  const [needs, setNeeds] = useState<AccessibilityNeed[]>(initial?.accessibilityNeeds ?? []);
  const [consent, setConsent] = useState(initial?.healthDataConsent ?? false);
  const [consentError, setConsentError] = useState(false);

  const toggle = useCallback((need: AccessibilityNeed) => {
    setNeeds((prev) => toggleNeed(prev, need));
  }, []);

  const changeConsent = useCallback((value: boolean) => {
    setConsent(value);
    if (value) setConsentError(false);
  }, []);

  // accessibility needs are health data: they may only be saved with consent ("none" isn't)
  const needsConsent = needs.some((need) => need !== 'none');

  // returns true when the form can be saved
  const validate = useCallback(() => {
    const ok = !needsConsent || consent;
    setConsentError(!ok);
    return ok;
  }, [needsConsent, consent]);

  // an empty name falls back to the default companion name
  const getValues = useCallback(
    (): Personalization => ({
      companionName: companionName.trim() || DEFAULT_COMPANION_NAME,
      accessibilityNeeds: needs,
      healthDataConsent: consent,
    }),
    [companionName, needs, consent],
  );

  return {
    companionName,
    setCompanionName,
    needs,
    toggle,
    needsConsent,
    consent,
    setConsent: changeConsent,
    consentError,
    validate,
    getValues,
  };
}
