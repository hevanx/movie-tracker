# Transcript Highlights — Movie Tracker

## 1. Planning scope and structure before writing any code (Session 1, early)
I opened with a structured prompt asking Claude to recommend Movie vs. Book Tracker, define the core features, suggest a component structure, UI direction, tech stack, and build order — all before any code was written. I then followed up asking for a concrete implementation outline including folder structure, state plan, and localStorage schema, and explicitly told Claude not to write full code until I approved the structure.

## 2. Rejecting the hamburger menu in favour of a cleaner solution (Session 2, mid)
When the mobile header felt cluttered I suggested moving the genre filters into a hamburger menu, but Claude pointed out that hiding filters behind an extra tap would hurt usability since filtering is a frequent action — I agreed and redirected to condensing the stats and progress bar into one row and separating the filters with a divider instead. This kept everything accessible without adding UI complexity.

## 3. Confirming the plan before any code was written (Session 2, mid)
Before any changes were made to the mobile card layout I told Claude to confirm it understood the problem before writing any code, and pushed back when the initial approach used separate mobile and desktop layouts — I asked for one unified layout that adapts responsively instead of two diverging designs. This avoided a maintenance problem that would have made the component harder to work with later.

## 4. Debugging why the app changes weren't showing up (Session 2, mid)
After making UI changes the app appeared unchanged in the browser — I reported this and we diagnosed that the dev server had started on a different port, and that a hard refresh was needed to clear the cache. Walking through the problem step by step confirmed the code edits were correct and identified the environment issue as the cause.

## 5. Diagnosing The Godfather's missing poster using DevTools (Session 2, late)
I noticed one movie card was showing "No Poster" and used the browser DevTools Network tab to find the image request returning a 404 from TMDB's CDN — this confirmed the missing poster was a data problem on the API's end, not a bug in the app. It also verified that the `onError` fallback on every image tag was working correctly, catching the broken URL and swapping in the placeholder as intended.
