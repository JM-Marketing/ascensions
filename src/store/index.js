import { create } from 'zustand'
import { supabase } from '../lib/supabase'

const normHike = (h) => ({
  ...h,
  elevationM: h.elevation_m,
  gainM: h.gain_m,
  distanceKm: h.distance_km,
  dateDone: h.date_done,
  coverUrl: h.cover_url,
  adkRank: h.adk_rank,
  // liste/défi : compat ascendante avec l'ancien schéma adk46/adk_rank
  challenge: h.challenge || (h.adk46 ? 'adk46' : ''),
  listRank: h.list_rank ?? h.adk_rank ?? h.listRank ?? h.adkRank ?? null,
})
const normPhoto = (p) => ({ ...p, hikeId: p.hike_id, filePath: p.file_path })

// Mappe les champs camelCase de l'app vers les colonnes snake_case de Supabase
const hikePatch = (c) => {
  const p = {}
  if (c.name !== undefined) p.name = c.name
  if (c.region !== undefined) p.region = c.region
  if (c.elevationM !== undefined) p.elevation_m = Number(c.elevationM) || 0
  if (c.gainM !== undefined) p.gain_m = Number(c.gainM) || 0
  if (c.distanceKm !== undefined) p.distance_km = Number(c.distanceKm) || 0
  if (c.difficulty !== undefined) p.difficulty = c.difficulty
  if (c.status !== undefined) p.status = c.status
  if (c.location !== undefined) p.location = c.location
  if (c.lat !== undefined) p.lat = c.lat === '' || c.lat === null ? null : Number(c.lat)
  if (c.lng !== undefined) p.lng = c.lng === '' || c.lng === null ? null : Number(c.lng)
  if (c.duration !== undefined) p.duration = c.duration
  if (c.dateDone !== undefined) p.date_done = c.dateDone || null
  if (c.rating !== undefined) p.rating = Number(c.rating) || 0
  if (c.notes !== undefined) p.notes = c.notes
  if (c.coverUrl !== undefined) p.cover_url = c.coverUrl
  if (c.adk46 !== undefined) p.adk46 = c.adk46
  if (c.adkRank !== undefined) p.adk_rank = c.adkRank
  return p
}

const useStore = create((set, get) => ({
  hikes: [],
  photos: [],
  goals: [],
  userName: localStorage.getItem('asc_username') || '',
  loading: false,

  setUserName: (name) => {
    localStorage.setItem('asc_username', name)
    set({ userName: name })
  },

  // --- INIT ---
  fetchAll: async () => {
    set({ loading: true })
    const [hikes, photos, goals] = await Promise.all([
      supabase.from('hikes').select('*').order('created_at', { ascending: false }),
      supabase.from('hike_photos').select('*').order('created_at', { ascending: true }),
      supabase.from('goals').select('*').order('created_at', { ascending: false }),
    ])
    if (hikes.error) console.error('fetch hikes:', JSON.stringify(hikes.error))
    set({
      hikes: (hikes.data || []).map(normHike),
      photos: (photos.data || []).map(normPhoto),
      goals: goals.data || [],
      loading: false,
    })
  },

  // --- HIKES ---
  addHike: async (hike) => {
    const { data, error } = await supabase.from('hikes').insert([hikePatch({
      difficulty: 'modere', status: 'a_essayer', region: '', ...hike,
    })]).select().single()
    if (error) console.error('addHike error:', JSON.stringify(error))
    if (data) set((s) => ({ hikes: [normHike(data), ...s.hikes] }))
    return { data, error }
  },
  updateHike: async (id, changes) => {
    const patch = hikePatch(changes)
    const { error } = await supabase.from('hikes').update(patch).eq('id', id)
    if (error) console.error('updateHike error:', JSON.stringify(error))
    set((s) => ({ hikes: s.hikes.map((h) => h.id === id ? normHike({ ...h, ...patch, elevation_m: patch.elevation_m ?? h.elevationM, gain_m: patch.gain_m ?? h.gainM, distance_km: patch.distance_km ?? h.distanceKm, date_done: patch.date_done !== undefined ? patch.date_done : h.dateDone, cover_url: patch.cover_url ?? h.coverUrl, adk_rank: patch.adk_rank ?? h.adkRank }) : h) }))
    return { error }
  },
  deleteHike: async (id) => {
    // supprime d'abord les photos du Storage liées à ce hike
    const related = get().photos.filter((p) => p.hikeId === id && p.filePath)
    if (related.length) await supabase.storage.from('hike-photos').remove(related.map((p) => p.filePath))
    await supabase.from('hikes').delete().eq('id', id)
    set((s) => ({
      hikes: s.hikes.filter((h) => h.id !== id),
      photos: s.photos.filter((p) => p.hikeId !== id),
    }))
  },

  // --- PHOTOS (upload Supabase Storage) ---
  addPhoto: async (hikeId, file, caption = '') => {
    const ext = file.name.includes('.') ? file.name.split('.').pop() : 'jpg'
    const path = `${hikeId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const { error: upErr } = await supabase.storage.from('hike-photos').upload(path, file)
    if (upErr) { console.error('upload error:', JSON.stringify(upErr)); return { error: upErr } }
    const { data: pub } = supabase.storage.from('hike-photos').getPublicUrl(path)
    const { data, error } = await supabase.from('hike_photos').insert([{
      hike_id: hikeId, url: pub.publicUrl, file_path: path, caption,
    }]).select().single()
    if (error) { console.error('addPhoto error:', JSON.stringify(error)); return { error } }
    set((s) => ({ photos: [...s.photos, normPhoto(data)] }))
    // si le hike n'a pas encore de couverture, on utilise cette photo
    const hike = get().hikes.find((h) => h.id === hikeId)
    if (hike && !hike.coverUrl) await get().updateHike(hikeId, { coverUrl: pub.publicUrl })
    return { data: normPhoto(data) }
  },
  deletePhoto: async (photo) => {
    if (photo.filePath) await supabase.storage.from('hike-photos').remove([photo.filePath])
    await supabase.from('hike_photos').delete().eq('id', photo.id)
    set((s) => ({ photos: s.photos.filter((p) => p.id !== photo.id) }))
    // si c'était la couverture, on bascule sur une autre photo (ou rien)
    const hike = get().hikes.find((h) => h.id === photo.hikeId)
    if (hike && hike.coverUrl === photo.url) {
      const next = get().photos.find((p) => p.hikeId === photo.hikeId)
      await get().updateHike(photo.hikeId, { coverUrl: next ? next.url : '' })
    }
  },

  // --- GOALS (objectifs perso) ---
  addGoal: async (goal) => {
    const { data, error } = await supabase.from('goals').insert([{
      title: goal.title,
      target: Number(goal.target) || 0,
      progress: Number(goal.progress) || 0,
      region: goal.region || '',
    }]).select().single()
    if (error) console.error('addGoal error:', JSON.stringify(error))
    if (data) set((s) => ({ goals: [data, ...s.goals] }))
    return { error }
  },
  updateGoal: async (id, changes) => {
    const patch = {}
    if (changes.title !== undefined) patch.title = changes.title
    if (changes.target !== undefined) patch.target = Number(changes.target) || 0
    if (changes.progress !== undefined) patch.progress = Number(changes.progress) || 0
    if (changes.region !== undefined) patch.region = changes.region
    await supabase.from('goals').update(patch).eq('id', id)
    set((s) => ({ goals: s.goals.map((g) => g.id === id ? { ...g, ...patch } : g) }))
  },
  deleteGoal: async (id) => {
    await supabase.from('goals').delete().eq('id', id)
    set((s) => ({ goals: s.goals.filter((g) => g.id !== id) }))
  },
}))

export default useStore
