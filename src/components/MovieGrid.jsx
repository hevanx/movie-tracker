import MovieCard from './MovieCard'

// Responsive grid wrapper — renders a list of MovieCards with shared action props.
// All action handlers are optional; only the ones passed in are active.
export default function MovieGrid({
  movies,
  isSaved,
  onAdd,
  onRemove,
  onUpdate,
  onOpenReview,
  showListActions = false,
}) {
  if (!movies.length) return null

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          isSaved={isSaved ? isSaved(movie.id) : false}
          onAdd={onAdd}
          onRemove={onRemove}
          onUpdate={onUpdate}
          onOpenReview={onOpenReview}
          showListActions={showListActions}
        />
      ))}
    </div>
  )
}
