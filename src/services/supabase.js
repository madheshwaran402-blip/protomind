import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  return data
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function saveProjectCloud(idea, components) {
  const user = await getUser()
  if (!user) throw new Error('Not logged in')

  const { data, error } = await supabase
    .from('projects')
    .upsert({
      user_id: user.id,
      idea,
      components: JSON.stringify(components),
      is_public: false,
    })
    .select()

  if (error) throw error
  return data
}

export async function getMyProjects() {
  const user = await getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getPublicProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('is_public', true)
    .order('likes', { ascending: false })
    .limit(50)

  if (error) throw error
  return data || []
}

export async function makeProjectPublic(projectId) {
  const { data, error } = await supabase
    .from('projects')
    .update({ is_public: true })
    .eq('id', projectId)
    .select()

  if (error) throw error
  return data
}

export async function likeProject(projectId) {
  const { data, error } = await supabase
    .rpc('increment_likes', { project_id: projectId })

  if (error) {
    // Fallback — direct update if RPC not set up
    const { data: project } = await supabase
      .from('projects')
      .select('likes')
      .eq('id', projectId)
      .single()

    const currentLikes = project?.likes || 0

    const { data: updated, error: updateError } = await supabase
      .from('projects')
      .update({ likes: currentLikes + 1 })
      .eq('id', projectId)
      .select()

    if (updateError) throw updateError
    return updated
  }

  return data
}

export async function deleteProjectCloud(projectId) {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)

  if (error) throw error
}

export async function shareProject(projectId) {
  const { data, error } = await supabase
    .from('projects')
    .update({ is_public: true })
    .eq('id', projectId)
    .select('share_id')
    .single()

  if (error) throw error
  return data?.share_id
}

export async function getSharedProject(shareId) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('share_id', shareId)
    .single()

  if (error) throw error
  return data
}