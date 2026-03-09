import { useState } from 'react'

// Reusable star rating row.
// readonly=true  → display only (used on cards in My List)
// readonly=false → clickable, calls onRate(n) when a star is selected
const LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Must-watch']

export default function StarRating({ rating, onRate, readonly = false }) {
  const [hover, setHover] = useState(0)

  // The active value is what the cursor is hovering on, or the saved rating
  const active = hover || rating

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onRate(star)}
            onMouseEnter={() => !readonly && setHover(star)}
            onMouseLeave={() => !readonly && setHover(0)}
            className={`text-xl leading-none transition-transform
              ${star <= active ? 'text-amber-400' : 'text-gray-600'}
              ${!readonly ? 'hover:scale-125 cursor-pointer' : 'cursor-default'}
            `}
          >
            ★
          </button>
        ))}
      </div>

      {/* Label — shows on hover in interactive mode, or when a rating is saved */}
      {!readonly && active > 0 && (
        <span className="text-xs text-amber-400/80 font-medium">{LABELS[active]}</span>
      )}
    </div>
  )
}
