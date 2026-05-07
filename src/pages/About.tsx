import { useLocale } from '@/hooks/useLocale';
import SEO from '@/components/seo/SEO';

/*
  Hardcoded bio for now — Yosi sent the Hebrew text directly. Milestone 11
  will swap this for a Sanity-driven artistBio field on `siteSettings`,
  and dad will be able to edit it in the Studio.
*/
const BIO_HE = `שלום,
אני יוסי, אמן צייר ישראלי, מתמחה בציורי אקריליק ורישומים בעפרונות צבעוניים.

עולם האמנות שלי מושפע בעיקר מחיי היום-יום, ממפגשים עם דמויות, נופים וסיטואציות המובאות בסרטי קולנוע מפורסמים, מעולם הכדורגל ומהאמונה היהודית. כל יצירה שלי היא ניסיון ללכוד רגע, רגש או זיכרון, ולהפוך אותם לכתמי צבע שמספרים סיפור.

אני מאמין שאמנות היא הדרך הטובה ביותר לתקשר מעבר למילים, והיא מייצרת חיבור עמוק וישיר עם הצופה. המטרה — לעורר רגשות, תחושות ומחשבות, ובעיקר ליהנות ולהתרגש.

העבודות שלי משלבות בין שני סגנונות — היפר-ריאליזם ואבסטרקט. התוצאה היא שילוב מושלם בין כתמי צבע וקומפוזיציה.`;

const BIO_EN = `Hello — I'm Yosi, an Israeli painter specialising in acrylic paintings and coloured-pencil drawings.

My world is shaped mostly by everyday life: encounters with people, landscapes, and scenes drawn from famous films, from the world of football, and from the Jewish faith. Every piece is an attempt to capture a moment, a feeling, or a memory and turn them into strokes of colour that tell a story.

I believe art is the most powerful way to communicate beyond words — it creates a deep, direct connection with the viewer. The goal: to stir emotions, sensations, and thoughts, and above all, to bring joy and wonder.

My work moves between two languages — hyper-realism and abstraction. The result is a perfect balance of colour and composition.`;

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
