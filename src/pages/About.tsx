import { useLocale } from '@/hooks/useLocale';

/*
  Hardcoded bio for now — Yosi sent the Hebrew text directly. Milestone 11
  will swap this for a Sanity-driven artistBio field on `siteSettings`,
  and dad will be able to edit it in the Studio.
*/
const BIO_HE = `שלום,
שמי יוסי, אמן צייר עצמאי המתמחה בצבעי אקריליק ורישומים צבעוניים.

עולם האמנות שלי מושפע מחיי היום-יום, מסצנות מסרטי קולנוע ומהאמונה היהודית. כל יצירה שלי היא ניסיון ללכוד רגע, רגש או זיכרון, ולהפוך אותם לכתמי צבע שמספרים סיפור.

אני מאמין שאמנות היא הדרך הטובה ביותר לתקשר מעבר למילים, והיא מייצרת חיבור עמוק וישיר עם הצופה. המטרה — לעורר רגשות, תחושות ומחשבות, ובעיקר ליהנות.

העבודות שלי משלבות בין שני סגנונות — היפר-ריאליזם ואבסטרקט — והתוצאה הסופית היא שילוב בין הצבעים והקומפוזיציה.

אני רואה באמנות כלי לחיבור בין העולם הפנימי שלי לשאר העולם. כל יצירה היא הזדמנות ליצור דיאלוג, לעורר שאלות, לגעת ברגשות. האמנות שלי שואפת להיות אותנטית, כנה וישירה — ללא חששות, ללא מסכות. רק אני, הצבעים והבד, במסע משותף של גילוי עצמי וביטוי אמיתי.`;

const BIO_EN = `Hello — my name is Yosi. I'm a self-taught artist working primarily in acrylic paints and color drawings.

My world is shaped by everyday life, scenes from cinema, and Jewish faith. Every piece is an attempt to capture a moment, a feeling, or a memory and turn them into strokes of color that tell a story.

I believe art is the most powerful way to communicate beyond words — it creates a deep, direct connection with the viewer. My goal is to stir emotions, sensations, and thoughts, and above all, to bring joy.

My work moves between two languages — hyper-realism and abstraction — and the result is a balance of color and composition that I'm always chasing.

I see art as a bridge between my inner world and the world around me. Every piece is a chance to start a dialogue, raise questions, touch a feeling. My art tries to be authentic, honest, and direct — no hesitation, no masks. Just me, the colors, and the canvas, on a shared journey of self-discovery and true expression.`;

export default function About() {
  const { t, locale } = useLocale();
  const bio = locale === 'he' ? BIO_HE : BIO_EN;

  return (
    <section className="px-6 md:px-12 lg:px-16 py-20 md:py-28">
      <div className="mx-auto max-w-3xl">
        <p className="text-[11px] uppercase tracking-[0.176em] text-teal">
          {t('about.tagline')}
        </p>
        <h1 className="mt-6 font-display text-5xl md:text-7xl tracking-tightest">
          {t('about.title')}
        </h1>
        <div className="hairline mt-12 mb-12" />
        <div className="space-y-6 text-ink/80 text-lg leading-[1.8] whitespace-pre-line">
          {bio}
        </div>
      </div>
    </section>
  );
}
