import { useState, useEffect } from 'react'
import SearchBar from '../components/SearchBar'
import MovieGrid from '../components/MovieGrid'
import { searchMovies, getPopularMovies } from '../utils/tmdb'
import { sampleMovies } from '../utils/sampleData'

const HAS_KEY = !!import.meta.env.VITE_TMDB_KEY

export default function Browse({ isSaved, onAdd, onRemove }) {
  const [movies, setMovies]           = useState([])
  const [isLoading, setIsLoading]     = useState(true)
  const [error, setError]             = useState(null)
  const [searchLabel, setSearchLabel] = useState(null) // null = showing popular

  const loadPopular = () => {
    setSearchLabel(null)
    if (!HAS_KEY) {
      // No API key — show sample data so the app is still usable
      setMovies(sampleMovies)
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setError(null)
    getPopularMovies()
      .then(setMovies)
      .catch(() => setError('Could not load movies. Check your VITE_TMDB_KEY in .env'))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => { loadPopular() }, [])

  const handleSearch = async (query) => {
    if (!HAS_KEY) {
      setError('Add a VITE_TMDB_KEY to your .env file to enable search.')
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const results = await searchMovies(query)
      setMovies(results)
      setSearchLabel(query)
    } catch {
      setError('Search failed. Check your VITE_TMDB_KEY in .env and try again.')
      setMovies([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 pb-12">

      {/* Page header */}
      <div className="pt-6 pb-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Discover Movies</h1>
        <p className="text-gray-400 text-sm mt-1">
          Search any title, or explore what's popular right now
        </p>
      </div>

      {/* Search */}
      <SearchBar onSearch={handleSearch} isLoading={isLoading} />

      {/* Section label + back link */}
      {!isLoading && !error && movies.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">
            {searchLabel ? `Results for "${searchLabel}"` : 'Popular Right Now'}
          </p>
          {searchLabel && (
            <button
              onClick={loadPopular}
              className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
            >
              ← Back to Popular
            </button>
          )}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-500">Loading movies…</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex flex-col items-center gap-4 py-16">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <span className="text-red-400 text-xl font-bold">!</span>
          </div>
          <div className="text-center">
            <p className="text-red-400 text-sm font-medium">Something went wrong</p>
            <p className="text-gray-500 text-xs mt-1">{error}</p>
          </div>
          <button onClick={searchLabel ? () => handleSearch(searchLabel) : loadPopular} className="btn-primary">
            Try Again
          </button>
        </div>
      )}

      {/* No search results */}
      {!isLoading && !error && movies.length === 0 && searchLabel && (
        <div className="flex flex-col items-center gap-3 py-20">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
            <span className="text-gray-400 text-xl">?</span>
          </div>
          <div className="text-center">
            <p className="text-gray-300 text-sm font-medium">No results found</p>
            <p className="text-gray-500 text-xs mt-1">Try a different title or check the spelling</p>
          </div>
          <button onClick={loadPopular} className="btn-ghost text-xs">
            ← Back to Popular
          </button>
        </div>
      )}

      {/* Grid */}
      {!isLoading && !error && movies.length > 0 && (
        <MovieGrid movies={movies} isSaved={isSaved} onAdd={onAdd} onRemove={onRemove} />
      )}
    </div>
  )
}
