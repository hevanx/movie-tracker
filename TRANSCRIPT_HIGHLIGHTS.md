# Transcript Highlights — Movie Tracker

**Course project:** Base Tier — Movie Tracker Web App
**Stack:** React 18 · Vite · Tailwind CSS · React Router v6 · TMDB API · localStorage

---

## 1. Project Planning

Chose **Movie Tracker over Book Tracker** because:
- TMDB API is free and returns rich data (posters, genres, ratings) with zero setup
- Movie posters make the UI immediately visual and polished
- "Watched/Unwatched" is a cleaner status concept for demonstrating state management

Defined **5 core features** for Base Tier:
1. Browse & search movies via TMDB API
2. Save favorites to localStorage
3. Mark movies as watched/unwatched
4. Rate (1–5 stars) and write a personal review
5. Filter saved movies by genre or watch status

---

## 2. Architecture Decisions

### Single source of truth
All saved movie state lives in `App.jsx` and flows down as props. No external state library (Redux, Zustand) — `useState` + a custom `useLocalStorage` hook is sufficient for this scope.

### localStorage sync via custom hook
```js
// hooks/useLocalStorage.js
export default function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key)
    return stored !== null ? JSON.parse(stored) : initial
  })

  const set = (newValue) => {
    const resolved = typeof newValue === 'function' ? newValue(value) : newValue
    localStorage.setItem(key, JSON.stringify(resolved))
    setValue(resolved)
  }

  return [value, set]
}
```
Every setter call writes to localStorage and React state atomically — there is no separate "save" step anywhere in the app.

### localStorage data structure
```json
[
  {
    "id": 550,
    "title": "Fight Club",
    "year": "1999",
    "poster": "https://image.tmdb.org/t/p/w300/...",
    "genres": ["Drama", "Thriller"],
    "watched": false,
    "rating": 4,
    "review": "One of the greatest films ever made."
  }
]
```
`id` is the TMDB movie ID used as the unique key for all lookups.

---

## 3. CRUD Implementation

| Operation | Where | How |
|---|---|---|
| **Create** | Browse page | `addMovie(movie)` — guards duplicates by id, initialises user fields |
| **Read** | My List page | Direct render of `savedMovies` array from state |
| **Update** | Card + ReviewModal | `updateMovie(id, changes)` — merges any subset of fields |
| **Delete** | ReviewModal | `removeMovie(id)` — two-step confirmation before executing |

### Key design: one general update function
Instead of separate `toggleWatched()` and `updateReview()` functions, a single `updateMovie` handles all edits:
```js
const updateMovie = (id, changes) => {
  setSavedMovies((prev) =>
    prev.map((m) => (m.id === id ? { ...m, ...changes } : m))
  )
}

// Examples:
updateMovie(id, { watched: true })
updateMovie(id, { rating: 4, review: "Great film" })
updateMovie(id, { watched: true, rating: 5, review: "Masterpiece" })
```

---

## 4. TMDB API Integration

All API logic is isolated in `utils/tmdb.js`. Genre names are fetched once and cached in a module-level variable so repeated searches don't re-fetch the list.

```js
// Cache genre map — fetched once per session
let genreCache = null

async function fetchGenreMap() {
  if (genreCache) return genreCache
  const res = await fetch(`${BASE}/genre/movie/list?api_key=${KEY}`)
  const data = await res.json()
  genreCache = Object.fromEntries(data.genres.map((g) => [g.id, g.name]))
  return genreCache
}
```

Two endpoints used:
- `/movie/popular` — default Browse view on page load
- `/search/movie?query=` — triggered by SearchBar form submit

---

## 5. Component Design

### MovieCard — dual-mode component
A single `MovieCard` serves both pages using a `showListActions` prop:
- **Browse mode** (`showListActions=false`): shows Save/Saved button
- **MyList mode** (`showListActions=true`): shows Watched toggle + Edit/Review button + modal trigger

### ReviewModal — draft state pattern
The modal keeps local draft state so nothing is committed until Save is clicked:
```js
// Draft state — local to modal
const [draftWatched, setDraftWatched] = useState(false)
const [draftRating,  setDraftRating]  = useState(0)
const [draftReview,  setDraftReview]  = useState('')

// Only written to real state on Save
const handleSave = () => {
  onUpdate(movie.id, { watched: draftWatched, rating: draftRating, review: draftReview.trim() })
  onClose()
}
// Cancel / backdrop click discards drafts with no side effect
```

### FilterBar — computed, not stored
Filters are never stored separately. The genre list is derived from `savedMovies` on every render:
```js
const genres = [...new Set(savedMovies.flatMap((m) => m.genres || []))].sort()
```
Filtered results are a computed value — `savedMovies.filter(...)` — not their own state. This means there is no sync issue between filters and data.

---

## 6. UI & Polish Decisions

- **Dark theme** using two custom Tailwind colors: `base` (`#11111b`) and `surface` (`#1e1e2e`)
- **Shared component classes** defined in `index.css` via `@layer components`: `btn-primary`, `btn-ghost`, `chip`, `input` — avoids repeating long Tailwind strings
- **FilterBar** uses `overflow-x-auto scrollbar-none` so genre chips scroll horizontally on mobile instead of wrapping
- **ReviewModal** slides up from the bottom on mobile (`items-end`) and centers on desktop (`sm:items-center`) — one component, two layouts
- **Card hover** combines `hover:-translate-y-1 hover:shadow-xl` for a lift effect; poster image scales 105% on hover
- **Empty states** include a CTA (My List → Browse Movies button) rather than dead-end text
- **Error states** include a retry button rather than a dead end
- **Two-step delete confirmation** inside the modal prevents accidental data loss

---

## 7. Edge Cases Handled

| Edge case | Solution |
|---|---|
| Duplicate save | `addMovie` checks `savedMovies.find(m.id)` before pushing |
| localStorage unavailable | `useLocalStorage` wraps read/write in `try/catch`, falls back silently |
| Corrupted stored JSON | `JSON.parse` failure caught, falls back to initial value |
| No API key | Browse falls back to sample data; search shows a clear message |
| Poster image 404 | `onError` on every `<img>` swaps to a placeholder |
| Stale modal after delete | `handleRemove` calls `setReviewTarget(null)` alongside `onRemove` |
| Cancel without saving | Draft state is local — Cancel discards without any write |
| Review text too long | `maxLength={500}` on textarea + character counter |

---

## 8. File Structure

```
src/
├── components/
│   ├── Navbar.jsx        sticky nav, active links, saved count badge
│   ├── SearchBar.jsx     controlled form with inline clear button
│   ├── MovieCard.jsx     dual-mode (Browse / MyList)
│   ├── MovieGrid.jsx     responsive grid wrapper
│   ├── FilterBar.jsx     horizontally scrollable chips
│   ├── StarRating.jsx    interactive + readonly modes
│   └── ReviewModal.jsx   full edit UI with draft state + delete confirm
├── pages/
│   ├── Browse.jsx        popular movies default + search
│   └── MyList.jsx        saved movies + filters + stats
├── hooks/
│   └── useLocalStorage.js
└── utils/
    ├── tmdb.js           all API calls + genre cache
    └── sampleData.js     6 seed movies for offline/no-key use
```

---

## 9. Deployment

- **Hosting:** Vercel — connected to GitHub repo, auto-deploys on push
- **Environment variable:** `VITE_TMDB_KEY` added in Vercel project settings
- **Build command:** `npm run build` (Vite outputs to `dist/`)
- **`.env` excluded from git** via `.gitignore` — key only lives in Vercel's environment
