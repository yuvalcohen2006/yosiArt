import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Deep-sea "light string" shader background.
 *
 * Adapted from a WebGL chromatic-split shader for this Vite project:
 *  - no Next "use client";
 *  - recoloured to the deep-sea palette — a horizontal ribbon of light that
 *    travels as one stroke through the centre and splits into three colour
 *    lines toward the edges (chromatic dispersion), over a deep-navy field
 *    (#0d1b2a). Tweak the colour constants in `fragmentShader` below.
 *  - sized to its own container (not `window`), DPR-capped;
 *  - the animation loop is gated on visibility: it pauses when the tab is
 *    hidden AND when the hero scrolls out of view (IntersectionObserver),
 *    and freezes (single static frame) for prefers-reduced-motion — which it
 *    re-checks live if the OS setting changes;
 *  - the GL context is force-released on unmount so repeated SPA mounts
 *    don't exhaust the browser's WebGL-context cap.
 *
 * Render inside a `relative` parent and pass `className` to size the canvas
 * (e.g. `absolute inset-0 h-full w-full`).
 */
export function WebGLShader({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene | null;
    camera: THREE.OrthographicCamera | null;
    renderer: THREE.WebGLRenderer | null;
    mesh: THREE.Mesh | null;
    uniforms: {
      resolution: { value: [number, number] };
      time: { value: number };
      xScale: { value: number };
      yScale: { value: number };
      distortion: { value: number };
    } | null;
    animationId: number | null;
  }>({
    scene: null,
    camera: null,
    renderer: null,
    mesh: null,
    uniforms: null,
    animationId: null,
  });

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const { current: refs } = sceneRef;

    const motionMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    let prefersReduced = motionMq.matches;
    let intersecting = true;

    const vertexShader = `
      attribute vec3 position;
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `;

    // --- Deep-sea palette (edit these to retune the look) ---------------
    //   bg     #0d1b2a   deep-navy field
    //   lineA  #415a77   split line 1
    //   lineB  #778da9   split line 2
    //   lineC  #e0e1dd   split line 3 (lightest — bright core highlight)
    const fragmentShader = `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;
      uniform float xScale;
      uniform float yScale;
      uniform float distortion;

      void main() {
        vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);

        // Three independent, phase-staggered waves (0 / 90 / 180 degrees) so the
        // lines weave with personality instead of moving as one. By the phase
        // offset, at any moment one line sits at min height, one at mid, one at
        // max — a symmetric stagger.
        // In-sync version: one path that disperses into three toward the edges
        // (same speed + phase, unified on the same line in the centre).
        float d = length(p) * distortion;
        float num = 0.035;
        float a = num / abs(p.y + sin((p.x * (1.0 + d) + time) * xScale) * yScale);
        float b = num / abs(p.y + sin((p.x          + time) * xScale) * yScale);
        float c = num / abs(p.y + sin((p.x * (1.0 - d) + time) * xScale) * yScale);

        vec3 colA = vec3(0.235, 0.561, 0.627); // #3c8fa0 teal
        vec3 colB = vec3(0.282, 0.388, 0.722); // #4863b8 brand blue
        vec3 colC = vec3(0.431, 0.373, 0.682); // #6e5fae indigo

        // Crisp core (no blur) + a subtle wider glow of the same hue.
        float op = 0.85, edge = 14.0, sharp = 26.0;    // hairline (~10% of prior width)
        float gOp = 0.04, gEdge = 0.10, gSharp = 1.6;  // whisper of glow (~2%)
        float coreA = clamp((a - edge) * sharp, 0.0, 1.0) * op;
        float coreB = clamp((b - edge) * sharp, 0.0, 1.0) * op;
        float coreC = clamp((c - edge) * sharp, 0.0, 1.0) * op;
        float glowA = clamp((a - gEdge) * gSharp, 0.0, 1.0) * gOp;
        float glowB = clamp((b - gEdge) * gSharp, 0.0, 1.0) * gOp;
        float glowC = clamp((c - gEdge) * gSharp, 0.0, 1.0) * gOp;

        vec3 col = vec3(1.0);
        col = mix(col, colA, glowA);
        col = mix(col, colC, glowC);
        col = mix(col, colB, glowB);
        col = mix(col, colA, coreA);
        col = mix(col, colC, coreC);
        col = mix(col, colB, coreB);
        gl_FragColor = vec4(col, 1.0);
      }
    `;

    // This canvas is a full-viewport background, so size it to the live window
    // — robust against any element-measurement timing/edge cases.
    const sizeOf = () => ({ w: window.innerWidth, h: window.innerHeight });

    const initScene = () => {
      refs.scene = new THREE.Scene();
      // antialias off — the light string is a soft gradient with no hard
      // edges, so MSAA only costs fill rate for no visible gain.
      refs.renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
      const dpr = Math.min(window.devicePixelRatio, 2);
      refs.renderer.setPixelRatio(dpr);
      refs.renderer.setClearColor(new THREE.Color(0xffffff));

      refs.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, -1);

      const { w, h } = sizeOf();
      refs.uniforms = {
        resolution: { value: [w * dpr, h * dpr] },
        time: { value: 0.0 },
        xScale: { value: 1.0 },
        yScale: { value: 0.6 },
        distortion: { value: 0.25 },
      };

      const position = [
        -1.0, -1.0, 0.0, 1.0, -1.0, 0.0, -1.0, 1.0, 0.0, 1.0, -1.0, 0.0, -1.0,
        1.0, 0.0, 1.0, 1.0, 0.0,
      ];
      const positions = new THREE.BufferAttribute(
        new Float32Array(position),
        3,
      );
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', positions);

      const material = new THREE.RawShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: refs.uniforms,
        side: THREE.DoubleSide,
      });

      refs.mesh = new THREE.Mesh(geometry, material);
      refs.scene.add(refs.mesh);

      handleResize();
    };

    const renderOnce = () => {
      if (refs.renderer && refs.scene && refs.camera) {
        refs.renderer.render(refs.scene, refs.camera);
      }
    };

    const animate = () => {
      if (refs.uniforms) refs.uniforms.time.value += 0.01;
      renderOnce();
      refs.animationId = requestAnimationFrame(animate);
    };

    const startLoop = () => {
      if (refs.animationId == null) {
        refs.animationId = requestAnimationFrame(animate);
      }
    };
    const stopLoop = () => {
      if (refs.animationId != null) {
        cancelAnimationFrame(refs.animationId);
        refs.animationId = null;
      }
    };

    // Run only while on-screen, tab-visible, and motion is allowed.
    const syncLoop = () => {
      if (!prefersReduced && intersecting && !document.hidden) startLoop();
      else stopLoop();
    };

    const handleResize = () => {
      if (!refs.renderer || !refs.uniforms) return;
      const { w, h } = sizeOf();
      const dpr = Math.min(window.devicePixelRatio, 2);
      refs.renderer.setSize(w, h, false);
      refs.uniforms.resolution.value = [w * dpr, h * dpr];
      renderOnce(); // repaint immediately so a resize while paused updates
    };

    const handleVisibility = () => syncLoop();
    const handleMotionChange = () => {
      prefersReduced = motionMq.matches;
      renderOnce();
      syncLoop();
    };

    initScene();
    renderOnce();

    const io = new ResizeObserver(handleResize);
    io.observe(canvas);

    const visObserver = new IntersectionObserver(
      (entries) => {
        intersecting = entries[0]?.isIntersecting ?? true;
        syncLoop();
      },
      { threshold: 0 },
    );
    visObserver.observe(canvas);

    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibility);
    motionMq.addEventListener('change', handleMotionChange);

    syncLoop();

    return () => {
      stopLoop();
      io.disconnect();
      visObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
      motionMq.removeEventListener('change', handleMotionChange);
      if (refs.mesh) {
        refs.scene?.remove(refs.mesh);
        refs.mesh.geometry.dispose();
        if (refs.mesh.material instanceof THREE.Material) {
          refs.mesh.material.dispose();
        }
      }
      // dispose() frees programs/textures but NOT the GL context — force it,
      // or repeated SPA mounts exhaust the browser's WebGL-context cap.
      refs.renderer?.forceContextLoss();
      refs.renderer?.dispose();
      refs.renderer = null;
      refs.scene = null;
      refs.mesh = null;
      refs.uniforms = null;
      refs.camera = null;
    };
  }, []);

  return (
    <canvas ref={canvasRef} className={className} aria-hidden role="presentation" />
  );
}
