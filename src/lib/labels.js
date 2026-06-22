// Constantes & helpers partagés (libellés, couleurs, formatage)

export const DIFFICULTIES = [
  { id: 'facile',    label: 'Facile',    color: '#34D399' },
  { id: 'modere',    label: 'Modéré',    color: '#FBBF77' },
  { id: 'difficile', label: 'Difficile', color: '#FB923C' },
  { id: 'expert',    label: 'Expert',    color: '#F87171' },
]

export const STATUSES = [
  { id: 'a_essayer', label: 'À essayer', short: 'À essayer', color: '#9DB3A6' },
  { id: 'planifie',  label: 'Planifié',  short: 'Planifié',  color: '#FBBF77' },
  { id: 'fait',      label: 'Fait',      short: 'Fait',      color: '#34D399' },
]

// Listes officielles / défis (chaque sommet peut appartenir à une liste)
export const CHALLENGES = [
  { id: 'adk46', label: 'Les 46 Adirondacks', short: 'ADK 46', region: 'Adirondacks',     total: 46, color: '#FBBF77', finisher: '46er' },
  { id: 'nh48',  label: 'Les 48 White Mountains', short: 'NH 48', region: 'White Mountains', total: 48, color: '#7DD3FC', finisher: '48er' },
]

export const difficultyOf = (id) => DIFFICULTIES.find((d) => d.id === id) || DIFFICULTIES[1]
export const statusOf = (id) => STATUSES.find((s) => s.id === id) || STATUSES[0]
export const challengeOf = (id) => CHALLENGES.find((c) => c.id === id) || null

// Formatage métrique
export const fmtElevation = (m) => (m ? `${Math.round(m).toLocaleString('fr-CA')} m` : '—')
export const fmtDistance = (km) => (km ? `${Number(km).toLocaleString('fr-CA')} km` : '—')

// Lien Google Maps (priorité aux coordonnées, sinon recherche par nom/lieu)
export const mapsUrl = (hike) => {
  if (hike.lat != null && hike.lng != null) {
    return `https://www.google.com/maps/search/?api=1&query=${hike.lat},${hike.lng}`
  }
  const q = encodeURIComponent([hike.name, hike.location, hike.region].filter(Boolean).join(' '))
  return `https://www.google.com/maps/search/?api=1&query=${q}`
}
