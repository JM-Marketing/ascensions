import { useEffect, useRef, useState } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  X, MapPin, TrendingUp, Route, Clock, Mountain, Star, Pencil, Trash2,
  ImagePlus, ExternalLink, Loader2, Calendar,
} from 'lucide-react'
import useStore from '../store'
import { Badge, toast } from './ui'
import { difficultyOf, statusOf, fmtElevation, fmtDistance, mapsUrl, STATUSES, challengeOf } from '../lib/labels'
import HikeForm from './HikeForm'

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl px-3 py-2.5 border" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'var(--border)' }}>
      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold flex items-center gap-1.5">
        <Icon size={12} className="text-emerald-400" /> {label}
      </p>
      <p className="text-white text-sm font-bold mt-1">{value}</p>
    </div>
  )
}

export default function HikeDetail({ hikeId, onClose }) {
  const { hikes, photos, addPhoto, deletePhoto, updateHike, deleteHike } = useStore()
  const hike = hikes.find((h) => h.id === hikeId)
  const myPhotos = photos.filter((p) => p.hikeId === hikeId)
  const [editing, setEditing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)
  const [lightbox, setLightbox] = useState(null)
  const fileRef = useRef(null)

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') { lightbox ? setLightbox(null) : onClose() } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, lightbox])

  if (!hike) return null
  const diff = difficultyOf(hike.difficulty)
  const st = statusOf(hike.status)
  const chal = challengeOf(hike.challenge)

  const onPick = async (e) => {
    const files = [...e.target.files]
    e.target.value = ''
    if (!files.length) return
    setUploading(true)
    for (const f of files) {
      const { error } = await addPhoto(hike.id, f)
      if (error) { toast('Échec du téléversement', 'delete'); break }
    }
    setUploading(false)
    toast('Photo ajoutée', 'success')
  }

  const changeStatus = async (status) => {
    const patch = { status }
    if (status === 'fait' && !hike.dateDone) patch.dateDone = new Date().toISOString().slice(0, 10)
    await updateHike(hike.id, patch)
    if (status === 'fait') toast('Sommet conquis ! 🏔️', 'celebrate')
  }

  const setRating = async (r) => {
    await updateHike(hike.id, { rating: r === hike.rating ? 0 : r })
  }

  const remove = async () => {
    await deleteHike(hike.id)
    toast('Sommet supprimé', 'delete')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 modal-overlay" onClick={onClose}>
      <div className="w-full max-w-2xl max-h-[92dvh] sm:max-h-[88vh] flex flex-col rounded-t-3xl sm:rounded-3xl border shadow-2xl modal-panel overflow-hidden"
        style={{ background: 'rgba(13,23,20,0.98)', borderColor: 'rgba(110,231,183,0.14)' }}
        onClick={(e) => e.stopPropagation()}>

        {/* En-tête visuel (photo de couverture) */}
        <div className="relative h-44 sm:h-52 flex-shrink-0" style={{ background: 'linear-gradient(160deg, #143026, #0C1714)' }}>
          {hike.coverUrl ? (
            <img src={hike.coverUrl} alt={hike.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"><Mountain size={56} className="text-emerald-500/25" strokeWidth={1} /></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30" />
          <button onClick={onClose} aria-label="Fermer"
            className="absolute top-3 right-3 p-2 rounded-full bg-black/40 text-white/80 hover:text-white hover:bg-black/60 transition-colors cursor-pointer backdrop-blur-sm">
            <X size={18} />
          </button>
          <div className="absolute bottom-3 left-4 right-4">
            <div className="flex items-center gap-2 mb-1.5">
              <Badge color={st.color} label={st.label} />
              {chal && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: `${chal.color}2e`, color: chal.color, border: `1px solid ${chal.color}59` }}>
                  {chal.short} · #{hike.listRank}
                </span>
              )}
            </div>
            <h2 className="text-white font-display text-2xl font-semibold leading-none">{hike.name}</h2>
            {hike.region && <p className="text-slate-300 text-xs mt-1.5 flex items-center gap-1"><MapPin size={11} /> {hike.region}{hike.location ? ` · ${hike.location}` : ''}</p>}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* Changement de statut rapide */}
          <div className="flex gap-2">
            {STATUSES.map((s) => (
              <button key={s.id} onClick={() => changeStatus(s.id)}
                className="flex-1 text-xs font-semibold py-2 rounded-xl border transition-all cursor-pointer"
                style={hike.status === s.id
                  ? { background: `${s.color}1f`, borderColor: `${s.color}66`, color: s.color }
                  : { background: 'rgba(255,255,255,0.02)', borderColor: 'var(--border)', color: '#9DB3A6' }}>
                {s.label}
              </button>
            ))}
          </div>

          {/* Stats clés */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <Stat icon={TrendingUp} label="Altitude" value={fmtElevation(hike.elevationM)} />
            <Stat icon={Mountain} label="Dénivelé" value={hike.gainM ? `${hike.gainM} m` : '—'} />
            <Stat icon={Route} label="Distance" value={fmtDistance(hike.distanceKm)} />
            <Stat icon={Clock} label="Durée" value={hike.duration || '—'} />
          </div>

          {/* Difficulté + date + note */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full" style={{ background: diff.color }} />
              <span className="text-slate-500 text-xs">Difficulté</span> <span className="font-semibold">{diff.label}</span>
            </span>
            {hike.dateDone && (
              <span className="flex items-center gap-1.5 text-slate-300">
                <Calendar size={13} className="text-emerald-400" />
                <span className="text-slate-500 text-xs">Réalisé le</span>
                <span className="font-semibold">{format(new Date(hike.dateDone + 'T00:00'), 'd MMM yyyy', { locale: fr })}</span>
              </span>
            )}
          </div>

          {/* Note perso (étoiles) — surtout pertinent quand c'est fait */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Ton appréciation</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setRating(n)} className="cursor-pointer p-0.5" aria-label={`${n} étoiles`}>
                  <Star size={18} className={n <= hike.rating ? 'text-amber-300' : 'text-slate-700'}
                    fill={n <= hike.rating ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
          </div>

          {/* Emplacement / carte */}
          <a href={mapsUrl(hike)} target="_blank" rel="noreferrer"
            className="flex items-center justify-between rounded-xl px-4 py-3 border group transition-all hover:border-emerald-400/30"
            style={{ background: 'rgba(52,211,153,0.05)', borderColor: 'var(--border)' }}>
            <span className="flex items-center gap-2.5 text-sm text-slate-200">
              <MapPin size={16} className="text-emerald-400" />
              {hike.location || (hike.lat != null ? `${hike.lat}, ${hike.lng}` : 'Voir l\'emplacement')}
            </span>
            <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
              Google Maps <ExternalLink size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </span>
          </a>

          {/* Notes */}
          {hike.notes && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300/70 mb-1.5">Notes</p>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{hike.notes}</p>
            </div>
          )}

          {/* Galerie photos */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300/70">
                Photos {myPhotos.length > 0 && `(${myPhotos.length})`}
              </p>
              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                className="btn-ghost !py-1.5 !px-3 disabled:opacity-50">
                {uploading ? <Loader2 size={13} className="animate-spin" /> : <ImagePlus size={13} />}
                {uploading ? 'Envoi…' : 'Ajouter'}
              </button>
              <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={onPick} />
            </div>
            {myPhotos.length === 0 ? (
              <button onClick={() => fileRef.current?.click()}
                className="w-full rounded-xl border border-dashed py-8 flex flex-col items-center gap-2 text-slate-500 hover:text-emerald-300 hover:border-emerald-400/30 transition-all cursor-pointer"
                style={{ borderColor: 'rgba(110,231,183,0.18)' }}>
                <ImagePlus size={22} strokeWidth={1.4} />
                <span className="text-xs">Ajoute tes photos du sommet</span>
              </button>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {myPhotos.map((p) => (
                  <div key={p.id} className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer"
                    onClick={() => setLightbox(p.url)}>
                    <img src={p.url} alt={p.caption || hike.name} loading="lazy" className="w-full h-full object-cover" />
                    <button onClick={(e) => { e.stopPropagation(); deletePhoto(p) }}
                      className="absolute top-1 right-1 p-1 rounded-lg bg-black/55 text-white/80 opacity-0 group-hover:opacity-100 hover:bg-red-500/70 transition-all cursor-pointer"
                      aria-label="Supprimer la photo">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pied : éditer / supprimer */}
        <div className="flex-shrink-0 flex items-center gap-2 px-4 sm:px-5 py-3 pb-6 sm:pb-4 safe-bottom border-t"
          style={{ borderColor: 'rgba(110,231,183,0.08)', background: 'rgba(13,23,20,0.98)' }}>
          {confirmDel ? (
            <>
              <span className="text-xs text-slate-400 flex-1">Supprimer ce sommet et ses photos ?</span>
              <button onClick={() => setConfirmDel(false)} className="text-xs font-semibold px-3 py-2 rounded-xl text-slate-300 hover:bg-white/5 cursor-pointer">Annuler</button>
              <button onClick={remove} className="text-xs font-bold px-3 py-2 rounded-xl text-red-300 bg-red-500/15 border border-red-500/30 hover:bg-red-500/25 cursor-pointer">Supprimer</button>
            </>
          ) : (
            <>
              <button onClick={() => setConfirmDel(true)}
                className="p-2.5 rounded-xl text-slate-500 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer" aria-label="Supprimer">
                <Trash2 size={16} />
              </button>
              <button onClick={() => setEditing(true)} className="btn-primary flex-1">
                <Pencil size={15} /> Modifier
              </button>
            </>
          )}
        </div>
      </div>

      {editing && <HikeForm hike={hike} onClose={() => setEditing(false)} />}

      {/* Lightbox photo */}
      {lightbox && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" className="max-w-full max-h-full object-contain rounded-lg" />
        </div>
      )}
    </div>
  )
}
