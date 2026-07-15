import LegalPage from './LegalPage';
import { accessibilityDoc } from '@/content/legal/accessibility';

/** הצהרת נגישות — /accessibility */
export default function AccessibilityStatement() {
  return <LegalPage doc={accessibilityDoc} path="/accessibility" />;
}
