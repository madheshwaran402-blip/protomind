import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export async function getUser() {
  if (!supabase) return null
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch {
    return null
  }
}

export async function signIn(email, password) {
  if (!supabase) throw new Error('Supabase not configured')
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signUp(email, password) {
  if (!supabase) throw new Error('Supabase not configured')
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  if (!supabase) return
  await supabase.auth.signOut()
}

export async function saveProjectCloud(idea, components, isPublic = false) {
  if (!supabase) throw new Error('Supabase not configured')
  const user = await getUser()
  if (!user) throw new Error('Not logged in')

  const shareId = Math.random().toString(36).slice(2, 10)
  const thumbnail = components.slice(0, 3).map(c => c.icon).join('')

  const { data, error } = await supabase.from('projects').upsert({
    user_id: user.id,
    idea,
    components: JSON.stringify(components),
    is_public: isPublic,
    share_id: shareId,
    title: idea.slice(0, 60),
    thumbnail,
  }).select()

  if (error) throw error
  return data?.[0]
}

export async function getPublicProjects() {
  if (!supabase) return []
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(30)

    if (error) return []
    return (data || []).map(p => ({
      ...p,
      components: typeof p.components === 'string' ? JSON.parse(p.components) : p.components,
    }))
  } catch {
    return []
  }
}

export async function getProjectByShareId(shareId) {
  if (!supabase) return null
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('share_id', shareId)
      .single()

    if (error) return null
    return {
      ...data,
      components: typeof data.components === 'string' ? JSON.parse(data.components) : data.components,
    }
  } catch {
    return null
  }
}

export async function toggleProjectPublic(projectId, isPublic) {
  if (!supabase) throw new Error('Supabase not configured')
  const { error } = await supabase
    .from('projects')
    .update({ is_public: isPublic })
    .eq('id', projectId)
  if (error) throw error
}