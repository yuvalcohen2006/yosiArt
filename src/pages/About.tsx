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
    <section className="px-6 pb-20 pt-12 md:px-12 md:pb-28 md:pt-16 lg:px-16">
      <SEO
        path="/about"
        title="About"
        description="Yosi Cohen — a self-taught acrylic painter. A few words on the work, the practice, and what drives every piece."
      />

      {/* The shared section-header trio (index.css), as used by the
          collections rail and the works wall. */}
      <header className="mx-auto max-w-3xl text-center">
        <p className="eyebrow mb-2">{t('about.tagline')}</p>
        <h1 className="section-title">{t('about.title')}</h1>
        <p className="section-subtitle mx-auto mt-3 max-w-md">
          {t('about.subtitle')}
        </p>
      </header>

      <div className="mx-auto mt-12 grid max-w-6xl items-start gap-10 md:mt-16 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-14">
        {/* Portrait, on the reading-start side — left of the text in English,
            right of it in Hebrew, mirrored by the grid's own direction with no
            direction-specific markup. The 4:5 well matches the works cards, so
            the two pages feel cut from the same cloth. */}
        <figure className="overflow-hidden rounded-md border border-line bg-mist/40">
          <img
            src="/assets/dad.jpeg"
            alt={t('about.portraitAlt')}
            width={800}
            height={1000}
            loading="lazy"
            className="aspect-[4/5] h-full w-full object-cover"
          />
        </figure>

        {/* `whitespace-pre-line` keeps the paragraph breaks the artist wrote;
            `text-start` follows the reading direction instead of being pinned
            left, so the Hebrew sets from the right correctly. */}
        <div className="whitespace-pre-line text-start font-sans text-lg leading-[1.85] text-ink/80">
          {bio}
        </div>
      </div>
    </section>
  );
}
