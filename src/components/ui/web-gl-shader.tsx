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

      const vec3 BG    = vec3(0.0510, 0.1059, 0.1647); // #0d1b2a
      const vec3 LINEA = vec3(0.2549, 0.3529, 0.4667); // #415a77
      const vec3 LINEB = vec3(0.4667, 0.5529, 0.6627); // #778da9
      const vec3 LINEC = vec3(0.8784, 0.8824, 0.8667); // #e0e1dd

      void main() {
        vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);

        // Dispersion grows with distance from centre, so the stroke is
        // unified in the middle and fans into three colour lines at the edges.
        float d = length(p) * distortion;

        float ax = p.x * (1.0 + d);
        float bx = p.x;
        float cx = p.x * (1.0 - d);

        float a = 0.055 / abs(p.y + sin((ax + time) * xScale) * yScale);
        float b = 0.055 / abs(p.y + sin((bx + time) * xScale) * yScale);
        float c = 0.055 / abs(p.y + sin((cx + time) * xScale) * yScale);

        vec3 col = BG + a * LINEA + b * LINEB + c * LINEC;
        gl_FragColor = vec4(col, 1.0);
      }
    `;

    const sizeOf = () => {
      const w = canvas.clientWidth || canvas.parentElement?.clientWidth || 1;
      const h = canvas.clientHeight || canvas.parentElement?.clientHeight || 1;
      return { w, h };
    };

    const initScene = () => {
      refs.scene = new THREE.Scene();
      // antialias off — the light string is a soft gradient with no hard
      // edges, so MSAA only costs fill rate for no visible gain.
      refs.renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
      const dpr = Math.min(window.devicePixelRatio, 2);
      refs.renderer.setPixelRatio(dpr);
      refs.renderer.setClearColor(new THREE.Color(0x0d1b2a));

      refs.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, -1);

      const { w, h } = sizeOf();
      refs.uniforms = {
        resolution: { value: [w * dpr, h * dpr] },
        time: { value: 0.0 },
        xScale: { value: 1.0 },
        yScale: { value: 0.5 },
        distortion: { value: 0.12 },
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
