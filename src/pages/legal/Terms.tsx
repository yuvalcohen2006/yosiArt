import LegalPage from './LegalPage';
import { termsDoc } from '@/content/legal/terms';

/** תקנון האתר — /terms */
export default function Terms() {
  return <LegalPage doc={termsDoc} path="/terms" />;
}
