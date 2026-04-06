import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

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

export async function getUser() {
  const { data } = await supabase.auth.getUser()
  return data.user
}

export async function saveProjectCloud(idea, components) {
  const user = await getUser()
  if (!user) throw new Error('Not logged in')

  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: user.id,
      idea,
      components: JSON.stringify(components),
      created_at: new Date().toISOString(),
    })
    .select()

  if (error) throw error
  return data
}

export async function getProjectsCloud() {
  const user = await getUser()
  if (!user) throw new Error('Not logged in')

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data.map(p => ({
    ...p,
    components: JSON.parse(p.components),
    thumbnail: JSON.parse(p.components).slice(0, 3).map(c => c.icon).join(''),
  }))
}

export async function deleteProjectCloud(id) {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)

  if (error) throw error
}