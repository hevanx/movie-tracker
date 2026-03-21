import StarRating from './StarRating'

const FALLBACK_POSTER = 'https://placehold.co/300x450/1e1e2e/585b70?text=No+Poster'

export default function MovieCard({
  movie,
  isSaved,
  onAdd,
  onRemove,
  onUpdate,
  onOpenReview,
  showListActions = false,
}) {
  return (
    // Card lifts with shadow on hover — more tactile than translate alone
    <div className="bg-surface rounded-xl overflow-hidden flex flex-col
                    transition-all duration-200 ease-out
                    hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40
                    group">

      {/* ── Poster ── */}
      <div
        className={`relative overflow-hidden ${showListActions ? 'cursor-pointer' : ''}`}
        onClick={() => showListActions && onOpenReview(movie)}
      >
        <img
          src={movie.poster || FALLBACK_POSTER}
          alt={movie.title}
          className="w-full aspect-[2/3] object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          onError={(e) => { e.target.src = FALLBACK_POSTER }}
        />


        {/* Hover overlay — "Edit" hint on MyList */}
        {showListActions && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100
                          transition-opacity duration-200 flex items-center justify-center">
            <span className="text-white text-xs font-medium bg-white/10 border border-white/20
                             px-3 py-1 rounded-full backdrop-blur-sm">
              Edit / Review
            </span>
          </div>
        )}
      </div>

      {/* ── Card body ── */}
      <div className="p-3.5 flex flex-col gap-2.5 flex-1">

        {/* Title + year */}
        <div>
          <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2">
            {movie.title}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">{movie.year}</p>
        </div>

        {/* ── Info block: genres + status + rating grouped together ── */}
        <div className="border-t border-white/5 pt-2.5 flex flex-col gap-2">

          {/* Genre chips — max 2 visible, overflow shown as +n badge */}
          {movie.genres?.length > 0 && (
            <div className="flex flex-wrap gap-1 items-center">
              {movie.genres.slice(0, 2).map((g) => (
                <span
                  key={g}
                  className="text-[10px] font-medium bg-violet-500/10 text-violet-300
                             border border-violet-500/20 px-1.5 py-0.5 rounded"
                >
                  {g}
                </span>
              ))}
              {movie.genres.length > 2 && (
                <span className="text-[10px] text-gray-500">
                  +{movie.genres.length - 2}
                </span>
              )}
            </div>
          )}

          {/* Watch status + rating on one line (MyList only) */}
          {showListActions && (
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-medium ${
                movie.watched ? 'text-green-400' : 'text-gray-500'
              }`}>
                {movie.watched ? '✓ Watched' : 'Unwatched'}
              </span>
              {movie.rating > 0 && (
                <StarRating rating={movie.rating} readonly />
              )}
            </div>
          )}

        </div>

        {/* ── Action buttons ── */}
        <div className="mt-auto pt-1 flex flex-col gap-1.5">
          {showListActions ? (
            <>
              {/* Quick watched toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onUpdate(movie.id, { watched: !movie.watched })
                }}
                className={`w-full text-xs py-2 rounded-lg border transition-colors font-medium ${
                  movie.watched
                    ? 'border-green-500/30 text-green-400 hover:bg-green-500/10'
                    : 'border-white/10 text-gray-300 hover:bg-white/5'
                }`}
              >
                {movie.watched ? '✓ Watched' : 'Mark Watched'}
              </button>

              {/* Edit / Review — opens modal */}
              <button
                onClick={() => onOpenReview(movie)}
                className="w-full text-xs py-2 rounded-lg border border-violet-500/25
                           text-violet-400 hover:bg-violet-500/10 transition-colors"
              >
                Edit / Review
              </button>
            </>
          ) : (
            // Browse page: Save or Saved state
            // The button text changes on hover to "Remove" so intent is clear
            <button
              onClick={() => (isSaved ? onRemove(movie.id) : onAdd(movie))}
              className={`w-full text-xs py-2 rounded-lg font-medium transition-all ${
                isSaved
                  ? 'bg-green-600/15 text-green-400 border border-green-500/25 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/25'
                  : 'bg-violet-600 text-white hover:bg-violet-500'
              }`}
            >
              {/* Show "Remove?" on hover when saved, normal text otherwise */}
              <span className={isSaved ? 'group-hover:hidden' : ''}>{isSaved ? '✓ Saved' : '+ Save'}</span>
              {isSaved && <span className="hidden group-hover:inline">Remove</span>}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
