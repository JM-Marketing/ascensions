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

export const difficultyOf = (id) => DIFFICULTIES.find((d) => d.id === id) || DIFFICULTIES[1]
export const statusOf = (id) => STATUSES.find((s) => s.id === id) || STATUSES[0]

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
