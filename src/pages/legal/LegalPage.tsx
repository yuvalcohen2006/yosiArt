import type { ReactNode } from 'react';
import SEO from '@/components/seo/SEO';
import { useLocale } from '@/hooks/useLocale';
import type { LegalDoc } from '@/content/legal/types';

/**
 * Render a legal body string: paragraphs are separated by blank lines,
 * consecutive lines starting with "- " become a bulleted list.
 */
function renderLegalBody(body: string): ReactNode[] {
  const blocks = body.split(/\n\s*\n/);
  const out: ReactNode[] = [];

  blocks.forEach((block, bi) => {
    const lines = block
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    let bullets: string[] = [];
    const flushBullets = (key: string) => {
      if (bullets.length === 0) return;
      out.push(
        <ul key={key} className="list-disc space-y-1.5 ps-6">
          {bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>,
      );
      bullets = [];
    };

    lines.forEach((line, li) => {
      if (line.startsWith('- ')) {
        bullets.push(line.slice(2));
      } else {
        flushBullets(`ul-${bi}-${li}`);
        out.push(<p key={`p-${bi}-${li}`}>{line}</p>);
      }
    });
    flushBullets(`ul-${bi}-end`);
  });

  return out;
}

/**
 * Shared editorial layout for the three Israeli legal pages
 * (תקנון / מדיניות פרטיות / הצהרת נגישות): eyebrow, display title,
 * last-updated line, then the sectioned document in a comfortable
 * reading column. Language follows the site toggle.
 */
export default function LegalPage({
  doc,
  path,
}: {
  doc: LegalDoc;
  path: string;
}) {
  const { locale, t } = useLocale();
  const content = doc[locale];

  return (
    <>
      <SEO
        title={content.title}
        description={content.intro.replace(/\s+/g, ' ').slice(0, 155)}
        path={path}
      />
      <div className="editorial-container py-16 md:py-20">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow">{t('legal.eyebrow')}</p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-ink md:text-5xl">
            {content.title}
          </h1>
          <p className="mt-3 text-sm text-slate">
            {t('legal.lastUpdated')}: {doc.updated[locale]}
          </p>

          <div className="rule mt-8" />

          <div className="mt-8 space-y-4 leading-relaxed text-ink/90">
            {renderLegalBody(content.intro)}
          </div>

          {content.sections.map((section) => (
            <section key={section.heading} className="mt-10">
              <h2 className="font-display text-2xl font-semibold text-ink">
                {section.heading}
              </h2>
              <div className="mt-3 space-y-4 leading-relaxed text-ink/90">
                {renderLegalBody(section.body)}
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
