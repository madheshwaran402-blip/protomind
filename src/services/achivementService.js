const ACHIEVEMENTS_KEY = 'protomind_achievements'

export const ALL_ACHIEVEMENTS = [
  { id: 'first_prototype', title: 'First Prototype', desc: 'Build your very first prototype', icon: '🚀', xp: 100, category: 'Building' },
  { id: 'five_prototypes', title: 'Maker', desc: 'Build 5 prototypes', icon: '⚡', xp: 250, category: 'Building' },
  { id: 'ten_prototypes', title: 'Pro Builder', desc: 'Build 10 prototypes', icon: '🏆', xp: 500, category: 'Building' },
  { id: 'first_save', title: 'Safe Keeper', desc: 'Save your first prototype', icon: '💾', xp: 50, category: 'Building' },
  { id: 'first_pdf', title: 'Documented', desc: 'Export your first PDF report', icon: '📄', xp: 100, category: 'Export' },
  { id: 'first_share', title: 'Sharer', desc: 'Share a prototype publicly', icon: '🔗', xp: 150, category: 'Community' },
  { id: 'streak_3', title: 'On Fire', desc: 'Build 3 days in a row', icon: '🔥', xp: 200, category: 'Consistency' },
  { id: 'streak_7', title: 'Week Warrior', desc: 'Build 7 days in a row', icon: '⚡', xp: 500, category: 'Consistency' },
  { id: 'first_quiz', title: 'Student', desc: 'Complete your first knowledge quiz', icon: '🧠', xp: 100, category: 'Learning' },
  { id: 'perfect_quiz', title: 'Genius', desc: 'Score 100% on a knowledge quiz', icon: '🎓', xp: 300, category: 'Learning' },
  { id: 'first_team', title: 'Team Player', desc: 'Add a team member to a project', icon: '👥', xp: 150, category: 'Collaboration' },
  { id: 'budget_set', title: 'Planner', desc: 'Set a budget for a prototype', icon: '💰', xp: 100, category: 'Planning' },
  { id: 'ten_components', title: 'Component Hoarder', desc: 'Use 10+ components in one prototype', icon: '🔧', xp: 200, category: 'Building' },
  { id: 'first_showcase', title: 'Presenter', desc: 'Use Showcase Mode', icon: '🎭', xp: 150, category: 'Presentation' },
  { id: 'hundred_days', title: 'Century', desc: 'ProtoMind turns 100 days old!', icon: '🎊', xp: 1000, category: 'Milestone' },
]

export function getUnlockedAchievements() {
  try {
    const data = localStorage.getItem(ACHIEVEMENTS_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function unlockAchievement(achievementId) {
  const unlocked = getUnlockedAchievements()
  if (unlocked.find(a => a.id === achievementId)) return null
  const achievement = ALL_ACHIEVEMENTS.find(a => a.id === achievementId)
  if (!achievement) return null
  const newUnlock = { ...achievement, unlockedAt: new Date().toISOString() }
  localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify([...unlocked, newUnlock]))
  return newUnlock
}

export function checkAndUnlockAchievements(projects, versions) {
  const newlyUnlocked = []

  if (projects.length >= 1) {
    const a = unlockAchievement('first_prototype')
    if (a) newlyUnlocked.push(a)
  }
  if (projects.length >= 5) {
    const a = unlockAchievement('five_prototypes')
    if (a) newlyUnlocked.push(a)
  }
  if (projects.length >= 10) {
    const a = unlockAchievement('ten_prototypes')
    if (a) newlyUnlocked.push(a)
  }
  if (versions.length >= 1) {
    const a = unlockAchievement('first_save')
    if (a) newlyUnlocked.push(a)
  }

  const a100 = unlockAchievement('hundred_days')
  if (a100) newlyUnlocked.push(a100)

  return newlyUnlocked
}

export function getTotalXP() {
  const unlocked = getUnlockedAchievements()
  return unlocked.reduce((sum, a) => sum + (a.xp || 0), 0)
}

export function getLevel(xp) {
  if (xp >= 2000) return { level: 5, title: 'Expert Builder', next: null }
  if (xp >= 1000) return { level: 4, title: 'Advanced Builder', next: 2000 }
  if (xp >= 500) return { level: 3, title: 'Intermediate Builder', next: 1000 }
  if (xp >= 200) return { level: 2, title: 'Junior Builder', next: 500 }
  return { level: 1, title: 'Beginner Builder', next: 200 }
}