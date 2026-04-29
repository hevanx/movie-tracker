import { useState } from 'react'
import { Link } from 'react-router-dom'
import FilterBar from '../components/FilterBar'
import MovieGrid from '../components/MovieGrid'
import ReviewModal from '../components/ReviewModal'

export default function MyList({ savedMovies, onUpdate, onRemove, onClearAll }) {
  const [statusFilter, setStatusFilter] = useState('all')
  const [genreFilter, setGenreFilter]   = useState('')
  const [reviewTarget, setReviewTarget] = useState(null)

  const filtered = savedMovies.filter((m) => {
    const statusMatch =
      statusFilter === 'all' ||
      (statusFilter === 'watched'   &&  m.watched) ||
      (statusFilter === 'unwatched' && !m.watched)
    const genreMatch = !genreFilter || m.genres?.includes(genreFilter)
    return statusMatch && genreMatch
  })

  const watchedCount = savedMovies.filter((m) => m.watched).length
  const ratedCount   = savedMovies.filter((m) => m.rating > 0).length

  const handleRemove = (id) => {
    onRemove(id)
    setReviewTarget(null)
  }

  const clearFilters = () => {
    setStatusFilter('all')
    setGenreFilter('')
  }

  const filtersActive = statusFilter !== 'all' || genreFilter !== ''

  // ── Empty state — nothing saved yet ──────────────────────────────────────
  if (savedMovies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-28 gap-5 text-center">
        <div className="w-16 h-16 rounded-2xl bg-surface border border-white/10
                        flex items-center justify-center">
          <span className="text-2xl text-gray-600">▤</span>
        </div>
        <div>
          <p className="text-white font-semibold text-base">Your list is empty</p>
          <p className="text-gray-500 text-sm mt-1">
            Save movies from Browse to start tracking them
          </p>
        </div>
        <Link to="/" className="btn-primary">
          Browse Movies
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 pb-12">

      {/* ── Page header with stats ── */}
      <div className="pt-6 pb-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">My List</h1>
          <button
            onClick={() => {
              if (window.confirm('Remove all movies from your list?')) onClearAll()
            }}
            className="text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            Clear All
          </button>
        </div>

        {/* Stats + progress bar on one compact row */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-3">
            <Stat value={savedMovies.length} label="saved" />
            <span className="text-gray-700">·</span>
            <Stat value={watchedCount} label="watched" accent={watchedCount > 0} />
            <span className="text-gray-700">·</span>
            <Stat value={ratedCount} label="rated" />
          </div>

          {savedMovies.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 hidden sm:inline">Progress</span>
              <div className="w-20 sm:w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${(watchedCount / savedMovies.length) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-gray-500">
                {Math.round((watchedCount / savedMovies.length) * 100)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Filters — separated with a divider ── */}
      <div className="border-t border-white/5 pt-4">
        <FilterBar
          savedMovies={savedMovies}
          statusFilter={statusFilter}
          genreFilter={genreFilter}
          onStatusChange={setStatusFilter}
          onGenreChange={setGenreFilter}
        />
      </div>

      {/* Result count when filters are active */}
      {filtersActive && filtered.length > 0 && (
        <p className="text-xs text-gray-500">
          Showing {filtered.length} of {savedMovies.length}
          {genreFilter && <span> · {genreFilter}</span>}
        </p>
      )}

      {/* ── Empty filtered state ── */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <div className="w-12 h-12 rounded-xl bg-surface border border-white/10
                          flex items-center justify-center">
            <span className="text-gray-600 text-lg">⊘</span>
          </div>
          <div>
            <p className="text-gray-300 text-sm font-medium">No movies match this filter</p>
            <p className="text-gray-500 text-xs mt-1">
              {genreFilter
                ? `No ${genreFilter} movies in your ${statusFilter === 'all' ? 'list' : statusFilter + ' list'}`
                : `No ${statusFilter} movies yet`}
            </p>
          </div>
          <button onClick={clearFilters} className="btn-ghost text-xs">
            Clear filters
          </button>
        </div>
      )}

      {/* ── Movie grid ── */}
      {filtered.length > 0 && (
        <MovieGrid
          movies={filtered}
          onUpdate={onUpdate}
          onRemove={handleRemove}
          onOpenReview={setReviewTarget}
          showListActions
        />
      )}

      {/* Review modal */}
      <ReviewModal
        movie={reviewTarget}
        onUpdate={onUpdate}
        onRemove={handleRemove}
        onClose={() => setReviewTarget(null)}
      />
    </div>
  )
}

// Small inline stat component — keeps the header JSX clean
function Stat({ value, label, accent = false }) {
  return (
    <span className="text-sm">
      <span className={`font-semibold ${accent ? 'text-green-400' : 'text-white'}`}>
        {value}
      </span>
      <span className="text-gray-500 ml-1">{label}</span>
    </span>
  )
}
