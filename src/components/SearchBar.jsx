import { useState } from 'react'

export default function SearchBar({ onSearch, isLoading }) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) onSearch(query.trim())
  }

  const handleClear = () => setQuery('')

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-2xl mx-auto">
      {/* Input with inline clear button */}
      <div className="relative flex-1">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a movie..."
          className="input pr-8"
        />
        {/* Clear ×  — only visible when there's text, not during loading */}
        {query && !isLoading && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500
                       hover:text-gray-300 transition-colors text-lg leading-none"
          >
            ×
          </button>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading || !query.trim()}
        className="btn-primary px-5 flex-shrink-0"
      >
        {isLoading ? (
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 border border-white/40 border-t-white rounded-full animate-spin" />
            Searching
          </span>
        ) : (
          'Search'
        )}
      </button>
    </form>
  )
}
