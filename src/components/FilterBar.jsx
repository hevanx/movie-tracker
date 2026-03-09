// FilterBar — horizontally scrollable on mobile so chips never wrap
export default function FilterBar({
  savedMovies,
  statusFilter,
  genreFilter,
  onStatusChange,
  onGenreChange,
}) {
  const genres = [...new Set(savedMovies.flatMap((m) => m.genres || []))].sort()

  return (
    <div className="flex flex-col gap-2">

      {/* Status row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[10px] text-gray-500 uppercase tracking-widest flex-shrink-0 pr-1">
          Status
        </span>
        {['all', 'watched', 'unwatched'].map((s) => (
          <button
            key={s}
            onClick={() => onStatusChange(s)}
            className={`chip flex-shrink-0 ${statusFilter === s ? 'chip-active' : 'chip-inactive'}`}
          >
            {s === 'all' ? 'All' : s === 'watched' ? '✓ Watched' : 'Unwatched'}
          </button>
        ))}
      </div>

      {/* Genre row — only rendered when there are genres to show */}
      {genres.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[10px] text-gray-500 uppercase tracking-widest flex-shrink-0 pr-1">
            Genre
          </span>
          <button
            onClick={() => onGenreChange('')}
            className={`chip flex-shrink-0 ${genreFilter === '' ? 'chip-active' : 'chip-inactive'}`}
          >
            All
          </button>
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => onGenreChange(g === genreFilter ? '' : g)}
              className={`chip flex-shrink-0 ${genreFilter === g ? 'chip-active' : 'chip-inactive'}`}
            >
              {g}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
