import { useTranslation } from 'react-i18next';

import { ComingSoon } from '../components/ComingSoon';

export default function ShopScreen() {
  const { t } = useTranslation();
  return <ComingSoon title={t('home.accessoriesShop')} showBack />;
}
