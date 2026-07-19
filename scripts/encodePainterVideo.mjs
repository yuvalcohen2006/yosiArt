/**
 * Encodes the web cut of the "painter's world" film from the camera master.
 *
 *   npm run encode:video            (or: node scripts/encodePainterVideo.mjs [master.mp4])
 *
 * The master (2560×1440, 60fps, ~21 Mbps, ~139 MB) is far too heavy to ship —
 * every visitor would download all of it. It lives in /media, which is
 * git-ignored and, critically, OUTSIDE public/: Vite copies public/ verbatim
 * into dist/, so a master parked there gets deployed no matter what git says.
 * This script renders the small, seamless loop that actually goes live.
 *
 * WHY A LOOP, AND WHY THESE WINDOWS
 * The film is a progression: Yosi carries in a blank canvas and paints it. Cut
 * end-to-start it would snap from a finished painting back to a bare canvas, so
 * the footage cannot simply be looped. Instead we take three angles from the
 * stretch where the gold sun already exists — so the painting looks continuous
 * across every join — and dissolve between them:
 *
 *   A  tilted canvas, reaching brush, garden bokeh   (the wide, cinematic one)
 *   B  over-the-shoulder, standing back at the easel (a change of distance)
 *   C  close on the hand working the gold            (the intimate detail)
 *
 * Then the whole sequence's tail is dissolved back into its own head, so the
 * wrap is just a fourth dissolve and matches the other three.
 *
 * THE SEAM MATH
 * For a sequence S of length D and a crossfade of X:
 *   rest = S[X..D]   (starts on frame S[X])
 *   head = S[0..X]
 *   xfade(rest, head) at offset D-2X  ->  output length D-X
 * The output therefore opens on S[X] and closes on S[X] — the same frame — so
 * the wrap is invisible.
 *
 * Audio is dropped outright: the video plays muted, so shipping the AAC track
 * would be pure waste.
 */
import { spawn } from 'node:child_process';
import { statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import ffmpegPath from 'ffmpeg-static';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const MASTER = resolve(root, process.argv[2] ?? 'media/painter-master.mp4');
const OUT_VIDEO = resolve(root, 'public/assets/painter-loop.mp4');
const OUT_POSTER = resolve(root, 'public/assets/painter-poster.jpg');

/**
 * The angles, in master timecode. All are from the gold-sun era of the paint-up
 * so the canvas never jumps backwards; the camera setups change at ~39s and
 * ~45.5s, which is where these boundaries come from.
 */
const SHOTS = [
  { name: 'wide reach', start: 26, end: 37 },
  { name: 'over-shoulder', start: 39.5, end: 45 },
  { name: 'hand detail', start: 45.5, end: 52.5 },
];

/** Dissolve between angles, and for the loop wrap. Long enough to feel like a
 *  dissolve rather than a cut — this is what carries the "drifting through his
 *  world" feel instead of hard editing. */
const XFADE = 1.2;
/*
 * The poster is taken from the ENCODED LOOP's very first frame — never from a
 * timecode in the master. A poster that isn't the video's opening frame shows
 * for a moment and is then replaced by a different image the instant playback
 * starts, which reads as a blink or a jump cut. (This used to sample the
 * master at 30s while the loop opens at ~27.2s: measured 14.6 dB PSNR apart,
 * i.e. a completely different frame.) Deriving it from the output makes the
 * two identical by construction.
 */

const run = (args) =>
  new Promise((ok, fail) => {
    const p = spawn(ffmpegPath, args, { stdio: ['ignore', 'ignore', 'pipe'] });
    let err = '';
    p.stderr.on('data', (d) => (err += d));
    p.on('close', (code) =>
      code === 0 ? ok() : fail(new Error(`ffmpeg exited ${code}\n${err.slice(-2000)}`)),
    );
  });

const mb = (p) => (statSync(p).size / 1024 / 1024).toFixed(1);
const r2 = (n) => Math.round(n * 100) / 100;

// ---- Build the filter graph -------------------------------------------------
const parts = [
  // One scaled source, split once per shot. 1080p is the sweet spot: the frame
  // is ~84vw wide, and halving the master's pixel count is a huge size win with
  // no visible loss in-frame. 60fps is kept — the brushwork reads smoother.
  `[0:v]scale=1920:1080:flags=lanczos,setsar=1,split=${SHOTS.length}${SHOTS.map((_, i) => `[s${i}]`).join('')}`,
];

SHOTS.forEach((s, i) => {
  parts.push(`[s${i}]trim=${s.start}:${s.end},setpts=PTS-STARTPTS[c${i}]`);
});

// Chain the shots together with dissolves. Each xfade overlaps the two clips by
// XFADE, so the running length grows by (clip - XFADE) each time.
let seqLen = SHOTS[0].end - SHOTS[0].start;
let label = 'c0';
for (let i = 1; i < SHOTS.length; i++) {
  const clip = SHOTS[i].end - SHOTS[i].start;
  const offset = r2(seqLen - XFADE);
  const out = i === SHOTS.length - 1 ? 'seq' : `x${i}`;
  parts.push(
    `[${label}][c${i}]xfade=transition=fade:duration=${XFADE}:offset=${offset}[${out}]`,
  );
  seqLen = r2(offset + clip);
  label = out;
}

// Close the loop: dissolve the sequence's tail back into its own head.
const wrapOffset = r2(seqLen - 2 * XFADE);
const finalLen = r2(seqLen - XFADE);
parts.push(
  `[seq]split[body][pre]`,
  `[pre]trim=0:${XFADE},setpts=PTS-STARTPTS[head]`,
  `[body]trim=${XFADE},setpts=PTS-STARTPTS[rest]`,
  `[rest][head]xfade=transition=fade:duration=${XFADE}:offset=${wrapOffset}[v]`,
);

console.log(`[painter] master ${mb(MASTER)} MB`);
SHOTS.forEach((s) =>
  console.log(`[painter]   shot ${s.start}s-${s.end}s  ${s.name}`),
);
console.log(`[painter] ${SHOTS.length} angles + wrap, ${XFADE}s dissolves -> ${finalLen}s seamless`);

await run([
  '-y', '-v', 'error',
  '-i', MASTER,
  '-filter_complex', parts.join(';'),
  '-map', '[v]',
  '-an',                        // muted on the page — never ship the audio
  '-c:v', 'libx264',
  '-profile:v', 'high',
  '-crf', '22',
  '-preset', 'slow',
  '-pix_fmt', 'yuv420p',        // the only chroma layout every browser decodes
  '-movflags', '+faststart',    // moov atom first: plays while it downloads
  OUT_VIDEO,
]);

await run([
  '-y', '-v', 'error',
  '-i', OUT_VIDEO,
  '-vf', "select='eq(n\\,0)'",
  '-frames:v', '1',
  '-q:v', '3',
  OUT_POSTER,
]);

console.log(`[painter] wrote painter-loop.mp4  ${mb(OUT_VIDEO)} MB  (${finalLen}s)`);
console.log(`[painter] wrote painter-poster.jpg ${mb(OUT_POSTER)} MB`);
