import LegalPage from './LegalPage';
import { privacyDoc } from '@/content/legal/privacy';

/** מדיניות פרטיות — /privacy */
export default function Privacy() {
  return <LegalPage doc={privacyDoc} path="/privacy" />;
}
