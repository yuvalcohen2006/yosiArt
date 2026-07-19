import { useCallback, useRef, useState } from 'react';
import { Check, SlidersHorizontal, X } from 'lucide-react';
import { useLocale } from '@/hooks/useLocale';
import { useDialog } from '@/hooks/useDialog';
import { pickLocale } from '@/lib/pickLocale';
import { cn } from '@/lib/utils';
import type { Category } from '@/sanity/types';

/** How the wall is ordered. */
export type SortKey = 'newest' | 'priceAsc' | 'priceDesc';
/** Which pieces are shown. */
export type AvailabilityKey = 'all' | 'available';

export type WorksQuery = {
  /** Category slug, or null for everything. */
  category: string | null;
  sort: SortKey;
  availability: AvailabilityKey;
};

export const DEFAULT_QUERY: WorksQuery = {
  category: null,
  sort: 'newest',
  availability: 'all',
};

/** True when nothing has been narrowed down — drives the "clear" affordance. */
export const isDefaultQuery = (q: WorksQuery) =>
  q.category === null && q.sort === 'newest' && q.availability === 'all';

/** One row in the panel — a label with a tick when it is the active choice. */
function Option({
  active,
  onSelect,
  children,
}: {
  active: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={cn(
        'flex w-full items-center justify-between gap-3 rounded-md px-3 py-2.5 text-start font-sans text-[15px] transition-colors duration-200',
        active
          ? 'bg-primary/10 font-semibold text-accent-ink'
          : 'text-ink hover:bg-ink/[0.05]',
      )}
    >
      <span>{children}</span>
      {active && <Check aria-hidden className="h-4 w-4 shrink-0" />}
    </button>
  );
}

/**
 * The works filter — a trigger that opens a sidebar.
 *
 * It began as a strip of category toggles, then a dropdown; a drawer is what
 * the content actually wants. Filters here are three separate axes (collection,
 * order, availability) and the collection list grows with the catalogue —
 * that is more than a popover can hold without becoming a scrolling stub, and
 * a sidebar leaves the wall itself completely unobstructed while you work.
 *
 * It slides in from the reading-start edge, so it opens from the left in
 * English and the right in Hebrew without any special-casing.
 */
export default function WorksFilter({
  categories,
  value,
  onChange,
}: {
  categories: Category[];
  value: WorksQuery;
  onChange: (next: WorksQuery) => void;
}) {
  const { t, locale } = useLocale();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);
  // Focus moves in, Tab cycles inside, Escape and outside-clicks close, and
  // the page behind cannot be scrolled while the drawer covers it.
  useDialog({ open, onClose: close, panelRef, lockScroll: true });

  const set = (patch: Partial<WorksQuery>) => onChange({ ...value, ...patch });

  const sorts: { key: SortKey; label: string }[] = [
    { key: 'newest', label: t('worksFilter.newest') },
    { key: 'priceAsc', label: t('worksFilter.priceAsc') },
    { key: 'priceDesc', label: t('worksFilter.priceDesc') },
  ];
  const availabilities: { key: AvailabilityKey; label: string }[] = [
    { key: 'all', label: t('worksFilter.allPieces') },
    { key: 'available', label: t('worksFilter.availableOnly') },
  ];

  const narrowed = !isDefaultQuery(value);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={cn(
          'inline-flex h-12 items-center gap-2.5 rounded-md border-2 bg-white px-5 font-sans text-sm font-bold uppercase tracking-[0.12em] shadow-sm transition-colors duration-200',
          narrowed
            ? 'border-primary text-accent-ink'
            : 'border-line text-ink hover:border-ink/40',
        )}
      >
        <SlidersHorizontal aria-hidden className="h-4 w-4" />
        {t('worksFilter.button')}
        {narrowed && (
          <span className="ms-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[11px] text-white">
            {[
              value.category !== null,
              value.sort !== 'newest',
              value.availability !== 'all',
            ].filter(Boolean).length}
          </span>
        )}
      </button>

      {/* Backdrop — dims the wall and catches clicks meant to dismiss. */}
      <div
        aria-hidden
        onClick={close}
        className={cn(
          'fixed inset-0 z-40 bg-flame-900/40 transition-opacity duration-300',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      {/* The drawer. `start-0` + a translate on the inline axis means it
          arrives from the left in English and the right in Hebrew with no
          direction-specific code. It stays mounted so the slide can animate
          both ways, and is hidden from assistive tech while closed. */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('worksFilter.button')}
        aria-hidden={!open}
        tabIndex={-1}
        /* `invisible` when closed is load-bearing, not a belt-and-braces
           extra. The drawer stays mounted so it can animate both ways, and it
           was hidden only by a translate, `pointer-events-none` and
           `aria-hidden`. None of those remove an element from the TAB ORDER:
           a transform is purely visual, and pointer-events only concerns the
           mouse. So tabbing past the filter trigger walked into ten off-screen
           controls — no visible focus ring (they are outside the viewport) and
           silent to a screen reader (aria-hidden). Focus simply vanished.

           visibility:hidden is the one thing that removes them. It is in the
           transition list so, per spec, it only flips at 100% progress — the
           panel stays visible for the whole slide-out and goes untabbable
           exactly as it finishes. */
        className={cn(
          'fixed bottom-0 start-0 top-0 z-50 flex w-[86vw] max-w-sm flex-col bg-white shadow-2xl outline-none',
          'transition-[transform,visibility] duration-300 ease-gallery motion-reduce:transition-none',
          open
            ? 'visible translate-x-0'
            : 'invisible pointer-events-none ltr:-translate-x-full rtl:translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-sans text-base font-bold uppercase tracking-[0.12em] text-ink">
            {t('worksFilter.button')}
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label={t('worksFilter.close')}
            className="grid h-9 w-9 place-items-center rounded-md text-slate transition-colors hover:bg-ink/5 hover:text-ink"
          >
            <X aria-hidden className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <p className="eyebrow mb-1.5 px-3 text-[11px]">
            {t('worksFilter.category')}
          </p>
          <div className="space-y-0.5">
            <Option
              active={value.category === null}
              onSelect={() => set({ category: null })}
            >
              {t('worksFilter.allCategories')}
            </Option>
            {categories.map((c) => (
              <Option
                key={c._id}
                active={value.category === c.slug}
                onSelect={() => set({ category: c.slug })}
              >
                {pickLocale(c.title, locale)}
              </Option>
            ))}
          </div>

          <p className="eyebrow mb-1.5 mt-6 px-3 text-[11px]">
            {t('worksFilter.sort')}
          </p>
          <div className="space-y-0.5">
            {sorts.map((s) => (
              <Option
                key={s.key}
                active={value.sort === s.key}
                onSelect={() => set({ sort: s.key })}
              >
                {s.label}
              </Option>
            ))}
          </div>

          <p className="eyebrow mb-1.5 mt-6 px-3 text-[11px]">
            {t('worksFilter.availability')}
          </p>
          <div className="space-y-0.5">
            {availabilities.map((a) => (
              <Option
                key={a.key}
                active={value.availability === a.key}
                onSelect={() => set({ availability: a.key })}
              >
                {a.label}
              </Option>
            ))}
          </div>
        </div>

        {narrowed && (
          <div className="border-t border-line p-4">
            <button
              type="button"
              onClick={() => onChange(DEFAULT_QUERY)}
              className="w-full rounded-md border border-line py-2.5 font-sans text-xs font-bold uppercase tracking-[0.12em] text-slate transition-colors hover:border-ink/30 hover:text-ink"
            >
              {t('worksFilter.clear')}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
