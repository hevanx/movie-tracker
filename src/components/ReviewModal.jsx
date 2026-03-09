import { useState, useEffect } from 'react'
import StarRating from './StarRating'

const FALLBACK_POSTER = 'https://placehold.co/300x450/1e1e2e/585b70?text=No+Poster'

export default function ReviewModal({ movie, onUpdate, onRemove, onClose }) {
  const [draftWatched,   setDraftWatched]   = useState(false)
  const [draftRating,    setDraftRating]    = useState(0)
  const [draftReview,    setDraftReview]    = useState('')
  const [confirmDelete,  setConfirmDelete]  = useState(false)

  // Re-sync draft state whenever a new movie is opened
  useEffect(() => {
    if (movie) {
      setDraftWatched(movie.watched ?? false)
      setDraftRating(movie.rating   ?? 0)
      setDraftReview(movie.review   ?? '')
      setConfirmDelete(false)
    }
  }, [movie])

  if (!movie) return null

  const handleSave = () => {
    onUpdate(movie.id, {
      watched: draftWatched,
      rating:  draftRating,
      review:  draftReview.trim(),
    })
    onClose()
  }

  const handleDelete = () => {
    if (!confirmDelete) { setConfirmDelete(true); return }
    onRemove(movie.id)
    onClose()
  }

  const isDirty =
    draftWatched !== movie.watched ||
    draftRating  !== movie.rating  ||
    draftReview.trim() !== (movie.review ?? '').trim()

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm
                 flex items-end sm:items-center justify-center
                 p-0 sm:p-4"
      onClick={onClose}
    >
      {/* Panel — slides up from bottom on mobile, centered on desktop */}
      <div
        className="bg-surface w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl
                   shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >

        {/* ── Header ── */}
        <div className="flex gap-4 p-5 border-b border-white/8 relative">
          <img
            src={movie.poster || FALLBACK_POSTER}
            alt={movie.title}
            className="w-16 h-24 rounded-lg object-cover flex-shrink-0"
            onError={(e) => { e.target.src = FALLBACK_POSTER }}
          />
          <div className="flex flex-col justify-center gap-1 min-w-0 flex-1 pr-6">
            <h2 className="text-white font-semibold text-base leading-snug line-clamp-2">
              {movie.title}
            </h2>
            <p className="text-gray-500 text-xs">{movie.year}</p>
            {movie.genres?.length > 0 && (
              <p className="text-gray-400 text-xs truncate">{movie.genres.join(' · ')}</p>
            )}
          </div>

          {/* Close button — always visible, not just backdrop click */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10
                       text-gray-400 hover:text-white transition-colors
                       flex items-center justify-center text-sm leading-none"
          >
            ×
          </button>
        </div>

        {/* ── Form ── */}
        <div className="p-5 flex flex-col gap-5">

          {/* Watched toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-200">Watched</p>
              <p className="text-xs text-gray-500">Mark this movie as seen</p>
            </div>
            <button
              onClick={() => setDraftWatched((v) => !v)}
              role="switch"
              aria-checked={draftWatched}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
                draftWatched ? 'bg-green-500' : 'bg-white/10'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow
                            transition-transform duration-200 ${
                  draftWatched ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Star rating */}
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-gray-200">Your Rating</p>
            <StarRating rating={draftRating} onRate={setDraftRating} />
            {draftRating > 0 && (
              <button
                onClick={() => setDraftRating(0)}
                className="btn-danger self-start"
              >
                Clear rating
              </button>
            )}
          </div>

          {/* Review textarea */}
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-gray-200">Your Review</p>
            <textarea
              value={draftReview}
              onChange={(e) => setDraftReview(e.target.value)}
              placeholder="Write a short note about this movie…"
              rows={3}
              maxLength={500}
              className="input resize-none"
            />
            <p className="text-right text-[10px] text-gray-600">{draftReview.length}/500</p>
          </div>

          {/* Save / Cancel */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={!isDirty}
              className="btn-primary flex-1"
            >
              {isDirty ? 'Save Changes' : 'No Changes'}
            </button>
            <button onClick={onClose} className="btn-ghost flex-1">
              Cancel
            </button>
          </div>

          {/* Delete — two-step */}
          <div className="border-t border-white/8 pt-4">
            {confirmDelete ? (
              <div className="flex items-center gap-3">
                <p className="text-sm text-red-400 flex-1">Remove from your list?</p>
                <button
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                >
                  Yes, remove
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-gray-400 hover:text-white text-xs transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button onClick={handleDelete} className="btn-danger w-full text-center py-0.5">
                Remove from My List
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
