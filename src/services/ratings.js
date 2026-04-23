const RATINGS_KEY = 'protomind_ratings'

export function getAllRatings() {
  try {
    const data = localStorage.getItem(RATINGS_KEY)
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

export function getRatingForProject(idea) {
  const all = getAllRatings()
  return all[idea] || {
    stars: 0,
    difficulty: null,
    review: '',
    tags: [],
    wouldBuildAgain: null,
    timeSpent: '',
    ratedAt: null,
  }
}

export function saveRating(idea, rating) {
  const all = getAllRatings()
  all[idea] = {
    ...rating,
    ratedAt: new Date().toISOString(),
  }
  localStorage.setItem(RATINGS_KEY, JSON.stringify(all))
}

export function getTopRatedProjects() {
  const ratings = getAllRatings()
  return Object.entries(ratings)
    .filter(([, r]) => r.stars > 0)
    .sort((a, b) => b[1].stars - a[1].stars)
    .slice(0, 10)
    .map(([idea, rating]) => ({ idea, ...rating }))
}

export function getAverageRating() {
  const ratings = getAllRatings()
  const rated = Object.values(ratings).filter(r => r.stars > 0)
  if (rated.length === 0) return 0
  return rated.reduce((sum, r) => sum + r.stars, 0) / rated.length
}