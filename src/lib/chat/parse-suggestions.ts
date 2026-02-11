const SUGGESTIONS_REGEX = /\[SUGESTOES\]\s*([\s\S]*?)\s*\[\/SUGESTOES\]/

export function parseSuggestions(content: string): {
  cleanContent: string
  suggestions: string[]
} {
  const match = content.match(SUGGESTIONS_REGEX)

  if (!match) {
    return { cleanContent: content, suggestions: [] }
  }

  const cleanContent = content.replace(SUGGESTIONS_REGEX, "").trim()
  const suggestions = match[1]
    .split("\n")
    .map((s) => s.replace(/^[-•*]\s*/, "").trim())
    .filter((s) => s.length > 0)

  return { cleanContent, suggestions }
}
