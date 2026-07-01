import { MeshGradient } from '@paper-design/shaders-react';

/**
 * Soft animated mesh-gradient background (Paper shaders) — a vibrant
 * iridescent wash (pink → magenta → violet → periwinkle → aqua) that drifts
 * slowly behind the headline. Self-positions fixed behind everything (-z-10).
 *
 * Lazy-loaded client-only from the landing so its WebGL never runs during SSG.
 * Tune the look via `colors` / `speed` below.
 */
export default function MeshGradientBackground() {
  return (
    <MeshGradient
      className="fixed inset-0 -z-10 h-full w-full bg-white"
      colors={['#ffc0e8', '#ff8fd0', '#b785ff', '#7aa6ff', '#74e6cf']}
      speed={0.2}
    />
  );
}
