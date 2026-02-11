"use client"

interface FollowUpSuggestionsProps {
  suggestions: string[]
  onSelect: (suggestion: string) => void
  isLoading: boolean
}

export function FollowUpSuggestions({
  suggestions,
  onSelect,
  isLoading,
}: FollowUpSuggestionsProps) {
  if (isLoading || suggestions.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 px-2 py-3">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          onClick={() => onSelect(suggestion)}
          className="text-left text-sm px-3 py-2 rounded-lg border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/50 transition-colors"
        >
          {suggestion}
        </button>
      ))}
    </div>
  )
}
