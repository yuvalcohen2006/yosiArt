import { useLocale } from '@/hooks/useLocale';
import SEO from '@/components/seo/SEO';

/*
  Hardcoded bio for now — Yosi sent the Hebrew text directly. Milestone 11
  will swap this for a Sanity-driven artistBio field on `siteSettings`,
  and dad will be able to edit it in the Studio.
*/
const BIO_HE = `שלום,
שמי יוסי, אמן צייר עצמאי המתמחה בצבעי אקריליק ורישומים צבעוניים.

עולם האמנות שלי מושפע מחיי היום-יום, מסצנות מסרטי קולנוע ומהאמונה היהודית. כל יצירה שלי היא ניסיון ללכוד רגע, רגש או זיכרון, ולהפוך אותם לכתמי צבע שמספרים סיפור.

אני מאמין שאמנות היא הדרך הטובה ביותר לתקשר מעבר למילים, והיא מייצרת חיבור עמוק וישיר עם הצופה. המטרה — לעורר רגשות, תחושות ומחשבות, ובעיקר ליהנות.

העבודות שלי משלבות בין שני סגנונות — היפר-ריאליזם ואבסטרקט — והתוצאה הסופית היא שילוב בין הצבעים והקומפוזיציה.`;

const BIO_EN = `Hello — my name is Yosi. I'm a self-taught artist working primarily in acrylic paints and color drawings.

My world is shaped by everyday life, scenes from cinema, and Jewish faith. Every piece is an attempt to capture a moment, a feeling, or a memory and turn them into strokes of color that tell a story.

I believe art is the most powerful way to communicate beyond words — it creates a deep, direct connection with the viewer. My goal is to stir emotions, sensations, and thoughts, and above all, to bring joy.

My work moves between two languages — hyper-realism and abstraction — and the result is a balance of color and composition that I'm always chasing.`;

export default function About() {
  const { t, locale } = useLocale();
  const bio = locale === 'he' ? BIO_HE : BIO_EN;

  return (
    <section className="px-6 md:px-12 lg:px-16 pt-8 md:pt-12 pb-20 md:pb-28">
      <SEO
        path="/about"
        title="About"
        description="Yosi Cohen — a self-taught acrylic painter. A few words on the work, the practice, and what drives every piece."
      />
      <div className="mx-auto max-w-3xl">
        <p className="text-[14px] uppercase tracking-[0.176em] text-ink/55">
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
