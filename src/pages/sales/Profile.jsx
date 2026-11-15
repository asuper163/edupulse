import DarkProfile from '../shared/DarkProfile';
import { useLanguage } from '../../i18n/index.jsx';

export default function SalesProfile() {
  const { t } = useLanguage();
  return <DarkProfile title={t('student.profileTitle')} subtitle={t('student.profileSubtitle')} />;
}
