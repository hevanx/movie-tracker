import { NavLink } from 'react-router-dom'

export default function Navbar({ savedCount }) {
  const linkClass = ({ isActive }) =>
    `text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
      isActive
        ? 'bg-violet-600 text-white'
        : 'text-gray-400 hover:text-white hover:bg-white/10'
    }`

  return (
    <header className="sticky top-0 z-50 bg-[#11111b]/95 backdrop-blur-md border-b border-white/8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">

        {/* Wordmark — no emoji, just clean type */}
        <NavLink
          to="/"
          className="flex items-center gap-1.5 group"
        >
          {/* Small accent square instead of emoji */}
          <span className="w-5 h-5 rounded bg-violet-600 flex items-center justify-center flex-shrink-0">
            <span className="block w-1.5 h-1.5 rounded-sm bg-white" />
          </span>
          <span className="text-white font-semibold text-base tracking-tight group-hover:text-violet-300 transition-colors">
            MovieTracker
          </span>
        </NavLink>

        {/* Nav */}
        <nav className="flex items-center gap-0.5">
          <NavLink to="/" end className={linkClass}>
            Browse
          </NavLink>
          <NavLink to="/mylist" className={linkClass}>
            <span>My List</span>
            {savedCount > 0 && (
              // Badge uses a neutral dark bg so it's readable on both active (violet) and inactive states
              <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px]
                               bg-white/20 text-white text-[10px] font-bold px-1 rounded-full">
                {savedCount}
              </span>
            )}
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
