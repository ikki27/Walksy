import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ComingSoon } from '../../../components/ComingSoon';

// placeholder for the profile pages that aren't built yet: /profile/documents, /profile/editProfile, ...
export default function ProfileSectionScreen() {
  const { section } = useLocalSearchParams<{ section: string }>();
  const { t } = useTranslation();

  return <ComingSoon title={t(`profile.sections.${section}`, { defaultValue: t('tabs.profile') })} showBack />;
}
