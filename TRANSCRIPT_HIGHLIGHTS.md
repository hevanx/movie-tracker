# Transcript Highlights — Movie Tracker

**Course project:** Base Tier — Movie Tracker Web App
**Stack:** React 18 · Vite · Tailwind CSS · React Router v6 · TMDB API · localStorage

---

## 1. Planning & Architecture

### Choosing the project

Rather than asking AI to just "pick something," I started with a focused prompt that gave it real constraints to reason about:

> **Me:** "I need to build a Base Tier project for this course. It needs a public API, localStorage for persistence, React with routing, and CRUD operations. I'm deciding between a Movie Tracker and a Book Tracker. Which would be better and why — think about API quality, visual appeal, and how well it demonstrates the concepts."

The AI laid out a clear comparison. I pushed back on one point — it initially suggested Open Library for books, and I asked it to dig deeper into rate limits and auth requirements before I made a decision. After that follow-up, Movie Tracker with TMDB was the clear winner:
- TMDB is free, no OAuth, returns rich data (posters, genres, ratings)
- Movie posters make the UI immediately visual and polished without extra work
- "Watched/Unwatched" is a cleaner status concept for demonstrating state management than "Read/Unread" with page counts

### Defining scope before writing any code

Before touching a file, I asked AI to help me define exactly what the project needed:

> **Me:** "Now let's define the 5 core features I need to build for Base Tier. I don't want to over-engineer this — what's the minimum set of features that satisfies CRUD, routing, API integration, and localStorage persistence?"

This gave us the feature list:
1. Browse & search movies via TMDB API
2. Save favorites to localStorage
3. Mark movies as watched/unwatched
4. Rate (1–5 stars) and write a personal review
5. Filter saved movies by genre or watch status

### Architecture discussion — state management

Before writing any components, I asked specifically about where state should live:

> **Me:** "Should I use Redux or Zustand for state, or is useState enough? I want to understand the trade-off before I commit to a pattern."

AI recommended `useState` + a custom `useLocalStorage` hook and explained why Redux would be overkill for this scope. I agreed with the reasoning — this is a single-user client-side app with no async state complexity — so I went with the simpler approach. All saved movie state lives in `App.jsx` and flows down as props.

**localStorage data structure — designed before implementation:**

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

I specifically asked AI what fields to store and why, rather than just letting it generate a structure. The key decision: store resolved genre names (not IDs) so the data is self-contained and readable without re-fetching the genre list.

---

## 2. Iterative Development

The project was built in clear stages — I never asked for the whole app at once.

**Stage 1 — Scaffold & routing**
> **Me:** "Set up the Vite + React + Tailwind project with React Router. I want two pages: Browse and MyList. Just the shell — no components yet."

**Stage 2 — TMDB integration**
> **Me:** "Now let's build the TMDB utility. I want all API calls isolated in one file. It should handle fetching popular movies, searching by query, and resolving genre IDs to names. Walk me through the design before writing the code."

I made AI explain the design first. It proposed fetching genres on every search call — I pushed back:

> **Me:** "That means every search fires two API calls. Can we cache the genre map so it's only fetched once per session?"

This led to the module-level `genreCache` pattern:

```js
let genreCache = null

async function fetchGenreMap() {
  if (genreCache) return genreCache
  const res = await fetch(`${BASE}/genre/movie/list?api_key=${KEY}`)
  const data = await res.json()
  genreCache = Object.fromEntries(data.genres.map((g) => [g.id, g.name]))
  return genreCache
}
```

**Stage 3 — Components one at a time**
Each component was its own prompt. I didn't ask for all components at once.

**Stage 4 — Edge cases and polish**
After the core was working, I came back to harden things.

---

## 3. Prompt Quality

### Specific prompts with context

Vague prompts got vague results early on. I learned to front-load context:

> **Less useful:** "Make the MovieCard component"

> **More useful:** "Build a `MovieCard` component that works in two modes. In Browse mode it shows a Save button. In MyList mode it shows a Watched toggle and an Edit button that opens a modal. Use a `showListActions` prop to switch between modes. The card should show the poster, title, year, and genres."

### Providing expected vs. actual behavior when debugging

When things broke, I never just said "it doesn't work." I described exactly what I saw:

> **Me:** "The modal is staying open after I delete a movie. Expected: modal closes and the card disappears from the list. Actual: the card disappears from the grid but the modal is still visible and showing the deleted movie's data."

> **Me:** "Getting this error when I try to filter by genre: `TypeError: Cannot read properties of undefined (reading 'includes')`. It only happens after I reload the page, not on first load."

### Asking follow-up questions

I regularly asked AI to explain its own suggestions before accepting them:

> **Me:** "You suggested storing filter state in a separate `useState`. Why not just derive it from `savedMovies` on every render? What's the actual benefit of storing it?"

AI couldn't give a strong reason, so I went with the computed approach — no separate filter state, just `.filter()` on render.

---

## 4. Debugging & Problem-Solving

### Bug 1 — Stale modal after delete

**Symptom:** Deleting a movie from inside the ReviewModal caused the card to disappear from the grid, but the modal stayed open showing the deleted movie's data.

**My prompt:**
> "The modal isn't closing after I call `removeMovie`. Here's the relevant code: [pasted `handleRemove` and the modal close logic]. The movie is being removed from state correctly but `reviewTarget` is still set. What's wrong?"

**Diagnosis:** `handleRemove` was calling `onRemove(id)` but not resetting `reviewTarget` to `null`. The modal's open state was tied to `reviewTarget !== null`, so it stayed open.

**Fix:**
```js
const handleRemove = (id) => {
  onRemove(id)
  setReviewTarget(null)   // ← had to add this
}
```

**What I learned:** State that controls modal visibility needs to be cleared explicitly — React doesn't infer that removing the underlying data should close the UI.

---

### Bug 2 — Genre filter crash after page reload

**Symptom:** `TypeError: Cannot read properties of undefined (reading 'includes')` only after a hard reload, not on first load.

**My prompt:**
> "This error only happens after a page reload, not when the app first loads. The filter works fine otherwise. Error: `TypeError: Cannot read properties of undefined (reading 'includes')` in FilterBar. Here's the filter logic: [pasted code]. Could this be a localStorage timing issue or something wrong with how genres are stored?"

**Diagnosis process:** AI first suggested the issue was async — I told it there was no async involved in localStorage reads. It then spotted that `genres` on a saved movie could be `undefined` if the movie was saved before the genre field was added to the data structure. Movies loaded from localStorage didn't have the `genres` field initialized.

**First suggested fix (rejected):**
> AI suggested adding a migration function that runs on startup to backfill missing fields on all stored movies.

**Why I rejected it:**
> "That feels overcomplicated for something that only affects stale data. Can we just make the filter defensive instead?"

**Actual fix — one line:**
```js
const genres = [...new Set(savedMovies.flatMap((m) => m.genres || []))].sort()
```
The `|| []` guard handles any movie missing the genres field. Simpler, no migration needed.

---

### Bug 3 — API key exposed in source

**Symptom:** Not a runtime bug — I noticed during a code review pass that the TMDB key was hardcoded in `tmdb.js`.

**My prompt:**
> "I just realized my API key is sitting in tmdb.js as a plain string. The repo is going to be public on GitHub. How do I fix this properly with Vite?"

AI walked me through Vite's `import.meta.env` system and `.env` files. I also asked a follow-up:

> **Me:** "If the key is in the frontend bundle anyway, is a `.env` file actually solving the security problem or just keeping it out of git?"

AI gave an honest answer — it keeps the key out of version history, which is the real risk. The key is still visible in the built bundle. That was useful context rather than a false sense of security.

---

### Bug 4 — useLocalStorage setter not persisting

**Symptom:** Movies were saving to React state correctly (UI updated) but localStorage wasn't being written. On reload, all saved movies were gone.

**Error / observation:**
> "No error in the console. The UI shows the saved movie, but when I open DevTools > Application > localStorage the key is empty. The setter is definitely being called."

**Diagnosis:** The custom hook's setter was calling `setValue` (React state) but the `localStorage.setItem` line was inside a stale closure — it was reading the initial `value` rather than the current one when called with a function updater.

**Fix — made the setter handle both value and function forms:**
```js
const set = (newValue) => {
  const resolved = typeof newValue === 'function' ? newValue(value) : newValue
  localStorage.setItem(key, JSON.stringify(resolved))
  setValue(resolved)
}
```

---

## 5. Human Judgment — Evaluating & Modifying AI Output

### Rejected: separate update functions

AI's first pass gave me individual functions: `toggleWatched()`, `updateRating()`, `updateReview()`. I rejected this:

> **Me:** "This means any time I add a new editable field I have to write another function. Can we do one general update function instead?"

Result — a single `updateMovie(id, changes)` that merges any subset of fields:

```js
const updateMovie = (id, changes) => {
  setSavedMovies((prev) =>
    prev.map((m) => (m.id === id ? { ...m, ...changes } : m))
  )
}
```

### Rejected: storing filter state

AI suggested keeping active filters in a `useState`. I questioned it, couldn't get a compelling reason, and went with derived/computed filters instead. No sync issues, no extra state to manage.

### Rejected: migration function for missing genres

As noted in Bug 2 above — AI proposed a startup migration to backfill stale localStorage data. I pushed back and got a one-line defensive guard instead.

### Modified: ReviewModal layout

AI generated the modal as a centered overlay for all screen sizes. I asked it to adjust:

> **Me:** "On mobile, a centered modal feels wrong for a form this size. Can we make it slide up from the bottom on mobile and center on desktop? One component, not two."

Result: `items-end sm:items-center` — single component, two responsive layouts via Tailwind breakpoint prefix.

### Modified: delete confirmation

The first version of the modal had a single Delete button that removed the movie immediately. I flagged this:

> **Me:** "One tap to permanently delete feels too aggressive. Add a two-step confirmation — clicking Delete should show a warning and a Confirm button, not execute immediately."

---

## 6. Key Technical Decisions

| Decision | Options Considered | Chosen | Reason |
|---|---|---|---|
| State management | Redux, Zustand, useState | `useState` + custom hook | No async state complexity; Redux is overkill |
| Filter state | Stored in useState | Computed on render | No sync bugs; simpler to reason about |
| Update functions | One per field | Single `updateMovie(id, changes)` | Scales to new fields without new functions |
| Genre storage | Store IDs, resolve at render | Store resolved names | Self-contained data; no re-fetch needed |
| Modal on mobile | Centered overlay | Slides up from bottom | Better UX for a form-heavy component |
| Delete UX | Single tap | Two-step confirmation | Prevents accidental data loss |

---

## 7. Edge Cases Handled

| Edge case | How it was caught | Solution |
|---|---|---|
| Duplicate save | Manual testing on Browse page | `addMovie` checks `savedMovies.find(m => m.id === id)` |
| localStorage unavailable | Asked AI "what if localStorage is blocked?" | `try/catch` around read/write; silent fallback |
| Corrupted stored JSON | Considered during planning | `JSON.parse` failure caught; falls back to initial value |
| No API key | Wanted app to work in demo without setup | Falls back to `sampleData.js`; search shows clear message |
| Poster image 404 | Noticed during testing with obscure movies | `onError` on every `<img>` swaps to placeholder |
| Stale modal after delete | Found during testing | `setReviewTarget(null)` called alongside `removeMovie` |
| Review text too long | Considered during modal design | `maxLength={500}` on textarea + live character counter |
| Missing genres on reload | Console error after reload | `|| []` guard in FilterBar flatMap |

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

- **Hosting:** Vercel — connected to GitHub repo, auto-deploys on push to `main`
- **Environment variable:** `VITE_TMDB_KEY` added in Vercel project settings (never committed)
- **Build command:** `npm run build` (Vite outputs to `dist/`)
- **`.env` excluded from git** via `.gitignore` — key only lives in Vercel's environment

> Asked AI during deployment setup: *"Is using a .env file with Vite actually securing my API key or just keeping it out of git?"*
> Answer: it keeps the key out of version history (the real risk for a public repo), but the key is still visible in the browser bundle. Understood the trade-off rather than assuming the problem was fully solved.
