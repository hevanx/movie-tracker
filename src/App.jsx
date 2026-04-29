import { BrowserRouter, Routes, Route } from 'react-router-dom'
import useLocalStorage from './hooks/useLocalStorage'
import Navbar from './components/Navbar'
import Browse from './pages/Browse'
import MyList from './pages/MyList'
import { sampleMovies } from './utils/sampleData'

export default function App() {
  // useLocalStorage returns [value, setter] exactly like useState,
  // but the setter also writes to localStorage on every call.
  const [savedMovies, setSavedMovies] = useLocalStorage('movietracker_saved', sampleMovies)

  // ─── CREATE ────────────────────────────────────────────────────────────────
  // Called from Browse when the user clicks Save on a search result.
  // Guard against duplicates using the TMDB id as the unique key.
  const addMovie = (movie) => {
    if (savedMovies.find((m) => m.id === movie.id)) return
    setSavedMovies((prev) => [
      ...prev,
      { ...movie, watched: false, rating: 0, review: '' },
    ])
  }

  // ─── UPDATE ────────────────────────────────────────────────────────────────
  // Single general-purpose update: merges any subset of fields into the entry.
  // Examples:
  //   updateMovie(id, { watched: true })
  //   updateMovie(id, { rating: 4, review: "Great film" })
  //   updateMovie(id, { watched: false, rating: 0, review: '' })
  const updateMovie = (id, changes) => {
    setSavedMovies((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...changes } : m))
    )
  }

  // ─── DELETE ────────────────────────────────────────────────────────────────
  // Filters out the entry by id. The filtered array is written to localStorage
  // automatically by the setter in useLocalStorage.
  const removeMovie = (id) => {
    setSavedMovies((prev) => prev.filter((m) => m.id !== id))
  }

  // ─── READ (helper) ─────────────────────────────────────────────────────────
  // Used by Browse to check if a search result is already in the list.
  const isSaved = (id) => savedMovies.some((m) => m.id === id)

  const clearAll = () => setSavedMovies([])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-base text-gray-200">
        <Navbar savedCount={savedMovies.length} />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <Routes>
            {/* READ + CREATE */}
            <Route
              path="/"
              element={
                <Browse
                  isSaved={isSaved}
                  onAdd={addMovie}
                  onRemove={removeMovie}
                />
              }
            />
            {/* READ + UPDATE + DELETE */}
            <Route
              path="/mylist"
              element={
                <MyList
                  savedMovies={savedMovies}
                  onUpdate={updateMovie}
                  onRemove={removeMovie}
                  onClearAll={clearAll}
                />
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
