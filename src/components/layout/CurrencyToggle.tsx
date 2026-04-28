/*
  Visual-only stub. Wired in milestone 6 alongside the Sanity client.
*/
type Props = { currency?: 'USD' | 'ILS' };

export default function CurrencyToggle({ currency = 'USD' }: Props) {
  return (
    <div
      className="inline-flex items-center text-[11px] tracking-[0.2em] select-none"
      aria-label="Currency"
    >
      <span
        className={[
          'transition-colors duration-300',
          currency === 'USD' ? 'text-ink' : 'text-ink/35',
        ].join(' ')}
      >
        $
      </span>
      <span aria-hidden className="mx-2 text-ink/25">
        /
      </span>
      <span
        className={[
          'transition-colors duration-300',
          currency === 'ILS' ? 'text-ink' : 'text-ink/35',
        ].join(' ')}
      >
        ₪
      </span>
    </div>
  );
}
