// All TMDB API communication lives here.
// Requires VITE_TMDB_KEY in your .env file.
// Free key: https://www.themoviedb.org/settings/api

const BASE = 'https://api.themoviedb.org/3'
const KEY = import.meta.env.VITE_TMDB_KEY
export const IMG = 'https://image.tmdb.org/t/p/w300'

// Cache genre map so we only fetch it once per session
let genreCache = null

async function fetchGenreMap() {
  if (genreCache) return genreCache
  const res = await fetch(`${BASE}/genre/movie/list?api_key=${KEY}`)
  if (!res.ok) throw new Error('Failed to load genres')
  const data = await res.json()
  genreCache = Object.fromEntries(data.genres.map((g) => [g.id, g.name]))
  return genreCache
}

// Normalises a raw TMDB result into the shape our app uses everywhere
function formatMovie(movie, genreMap) {
  return {
    id: movie.id,
    title: movie.title,
    year: movie.release_date?.slice(0, 4) || 'N/A',
    poster: movie.poster_path ? `${IMG}${movie.poster_path}` : null,
    genres: (movie.genre_ids || []).map((id) => genreMap[id]).filter(Boolean),
    overview: movie.overview || '',
  }
}

// Fetch the current popular movies list from TMDB — used as the Browse default view
export async function getPopularMovies() {
  const [popularData, genreMap] = await Promise.all([
    fetch(`${BASE}/movie/popular?api_key=${KEY}&page=1`).then((r) => {
      if (!r.ok) throw new Error('Failed to load popular movies')
      return r.json()
    }),
    fetchGenreMap(),
  ])
  return popularData.results.slice(0, 20).map((m) => formatMovie(m, genreMap))
}

// Search movies by title string — returns array of formatted movie objects
export async function searchMovies(query) {
  if (!query.trim()) return []
  const [searchData, genreMap] = await Promise.all([
    fetch(
      `${BASE}/search/movie?api_key=${KEY}&query=${encodeURIComponent(query)}&page=1`
    ).then((r) => {
      if (!r.ok) throw new Error('Search failed')
      return r.json()
    }),
    fetchGenreMap(),
  ])
  return searchData.results.slice(0, 20).map((m) => formatMovie(m, genreMap))
}
