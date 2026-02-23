'use client';

interface StarRatingProps {
  score: number;
  views?: number;
  max?: number;
}

function formatViews(views: number): string {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1).replace('.0', '')}M`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1).replace('.0', '')}k`;
  return views.toLocaleString('fr-FR');
}

export default function StarRating({ score, views, max = 5 }: StarRatingProps) {
  return (
    <div className="relative group flex items-center gap-1">
      <span className="text-[10px] font-medium text-yellow-400/70 uppercase tracking-wide">Discover</span>
      {Array.from({ length: max }, (_, i) => {
        const filled = i < score;
        return (
          <svg
            key={i}
            className={`w-3.5 h-3.5 ${filled ? 'text-yellow-400' : 'text-dark-border'}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      })}

      {/* Tooltip */}
      {views != null && views > 0 && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg bg-dark border border-dark-border shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap z-50">
          <p className="text-[11px] font-medium text-light">
            <span className="text-yellow-400">{formatViews(views)}</span> vues Discover
          </p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-dark-border" />
        </div>
      )}
    </div>
  );
}
