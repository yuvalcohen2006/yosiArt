/**
 * Encodes the web cut of the "painter's world" film from the camera master.
 *
 *   npm run encode:video            (or: node scripts/encodePainterVideo.mjs [master.mp4])
 *
 * WHY THIS EXISTS
 * The master is a camera original — currently 7680x4320 HEVC 10-bit, ~57 Mbps,
 * 174 MB. Three separate things make that unshippable, and only the first is
 * about size:
 *
 *   - 174 MB is pulled by every visitor, and is over GitHub's 100 MB per-file
 *     limit, so it cannot even be committed.
 *   - HEVC in MP4 does not decode in Firefox at all, and in Chrome only where
 *     the OS hands it hardware support. Most visitors would get the poster and
 *     nothing else.
 *   - 8K is a pointless decode for a frame that renders ~1400px wide.
 *
 * The master lives in /media, which is git-ignored and, critically, OUTSIDE
 * public/: Vite copies public/ verbatim into dist/, so a master parked there
 * gets deployed no matter what git says. This script renders the small,
 * seamless, universally-decodable loop that actually goes live: 1080p, H.264
 * high@8-bit, no audio.
 *
 * WHY A WRAP DISSOLVE
 * The film is a progression — Yosi works a bare dark canvas up into a blue
 * figure. Cut end-to-start it snaps from the finished painting back to the
 * empty one, so the footage cannot simply be looped. Dissolving the tail into
 * its own head turns that snap into a soft reset.
 *
 * The previous master was a 54s single take whose paint-up had to be sampled as
 * three separate angles from the one stretch where the canvas looked constant,
 * then dissolved together (see git history). This master is already cut between
 * angles, so that shot list is gone: the whole clip is used and only the wrap
 * is built.
 *
 * THE SEAM MATH
 * For a clip S of length D and a crossfade of X:
 *   rest = S[X..D]   (starts on frame S[X])
 *   head = S[0..X]
 *   xfade(rest, head) at offset D-2X  ->  output length D-X
 * The output therefore opens on S[X] and closes on S[X] — the same frame — so
 * the wrap lands back on exactly where it started.
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

/** Dissolve for the loop wrap. Long enough to feel like a dissolve rather than
 *  a cut — that is what carries the "drifting through his world" feel, and it
 *  is what stops the finished canvas from visibly un-painting itself. */
const XFADE = 1.2;

/** 1080p is the sweet spot: the frame renders ~84vw wide, and the master's
 *  pixel count is 16x that with no visible gain in-frame. */
const OUT_W = 1920;
const OUT_H = 1080;

/** Constant-rate factor. The frame carries a 35% black scrim and a pull-quote,
 *  and the content is dappled garden foliage — noise-heavy and expensive to
 *  encode. 23 holds up under the scrim while keeping the loop near the size of
 *  the 10.5s/60fps one it replaces. */
const CRF = 23;

/** Anything past this is a hero asset heavy enough to be worth re-tuning for. */
const SIZE_WARN_MB = 30;

/*
 * The poster is taken from the ENCODED LOOP's very first frame — never from a
 * timecode in the master. A poster that isn't the video's opening frame shows
 * for a moment and is then replaced by a different image the instant playback
 * starts, which reads as a blink or a jump cut. Deriving it from the output
 * makes the two identical by construction — which matters doubly here, since
 * the wrap means the loop opens on S[XFADE] rather than on S[0].
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

/** ffmpeg-static ships no ffprobe, so read the header the one way we can:
 *  `-i` with no output makes ffmpeg print the format to stderr and exit 1.
 *  The non-zero exit is expected here, so `run` is not reusable for it. */
const probe = (file) =>
  new Promise((ok, fail) => {
    const p = spawn(ffmpegPath, ['-hide_banner', '-i', file], {
      stdio: ['ignore', 'ignore', 'pipe'],
    });
    let err = '';
    p.stderr.on('data', (d) => (err += d));
    p.on('close', () => {
      const d = err.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
      const v = err.match(/Video:\s*(\w+)[^\n]*?(\d{2,5})x(\d{2,5})/);
      if (!d) fail(new Error(`could not read duration of ${file}\n${err.slice(-800)}`));
      else
        ok({
          duration: +d[1] * 3600 + +d[2] * 60 + parseFloat(d[3]),
          codec: v?.[1] ?? 'unknown',
          width: v ? +v[2] : 0,
          height: v ? +v[3] : 0,
        });
    });
  });

const mb = (p) => (statSync(p).size / 1024 / 1024).toFixed(1);
const r2 = (n) => Math.round(n * 100) / 100;

// ---- Read the master --------------------------------------------------------
const src = await probe(MASTER);
const D = r2(src.duration);

// Two dissolves' worth is the floor: below that the wrap would consume the clip.
if (D <= 2 * XFADE) {
  throw new Error(`master is ${D}s — too short to wrap with a ${XFADE}s dissolve`);
}

const wrapOffset = r2(D - 2 * XFADE);
const finalLen = r2(D - XFADE);

console.log(
  `[painter] master ${mb(MASTER)} MB  ${src.width}x${src.height} ${src.codec}  ${D}s`,
);
console.log(
  `[painter] whole clip + ${XFADE}s wrap dissolve -> ${finalLen}s seamless @ ${OUT_W}x${OUT_H}`,
);

// ---- Build the filter graph -------------------------------------------------
// `format=yuv420p` sits right after the scale so the 10-bit master is brought
// down to 8-bit ONCE, before the split — the xfade then blends half as much
// data, and the encoder gets the only chroma layout every browser decodes.
const parts = [
  `[0:v]scale=${OUT_W}:${OUT_H}:flags=lanczos,setsar=1,format=yuv420p,split[body][pre]`,
  `[pre]trim=0:${XFADE},setpts=PTS-STARTPTS[head]`,
  `[body]trim=${XFADE},setpts=PTS-STARTPTS[rest]`,
  `[rest][head]xfade=transition=fade:duration=${XFADE}:offset=${wrapOffset}[v]`,
];

await run([
  '-y', '-v', 'error',
  '-i', MASTER,
  '-filter_complex', parts.join(';'),
  '-map', '[v]',
  '-an',                        // muted on the page — never ship the audio
  '-c:v', 'libx264',
  '-profile:v', 'high',
  '-crf', String(CRF),
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

if (+mb(OUT_VIDEO) > SIZE_WARN_MB) {
  console.warn(
    `[painter] WARNING: ${mb(OUT_VIDEO)} MB is heavy for a hero asset — raise CRF or shorten the cut.`,
  );
}
