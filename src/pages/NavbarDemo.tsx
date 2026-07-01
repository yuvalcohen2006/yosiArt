import Tabnavbar from '@/components/ui/navbar';

/**
 * Isolated preview of the pasted shadcn navbar. The original demo is an
 * English LTR component, so we view it in an `dir="ltr"` shell to see it
 * exactly as designed (the rest of the site stays RTL).
 */
export default function NavbarDemo() {
  return (
    <div dir="ltr" className="min-h-screen bg-white">
      <Tabnavbar />
    </div>
  );
}
