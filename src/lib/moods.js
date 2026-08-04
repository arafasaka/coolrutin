export const MOODS = [
  { emoji: '😄', label: 'Senang', score: 5 },
  { emoji: '🙂', label: 'Baik', score: 4 },
  { emoji: '😐', label: 'Biasa', score: 3 },
  { emoji: '😔', label: 'Sedih', score: 2 },
  { emoji: '😫', label: 'Capek', score: 1 },
]

export function moodScore(emoji) {
  const found = MOODS.find(m => m.emoji === emoji)
  return found ? found.score : null
}