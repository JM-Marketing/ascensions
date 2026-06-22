import { useMemo, useState } from 'react'
import { Mountain, Plus, Search, TrendingUp, MapPin, Star } from 'lucide-react'
import useStore from '../store'
import { FilterChip, EmptyState, Badge } from './ui'
import { DIFFICULTIES, STATUSES, difficultyOf, statusOf, fmtElevation, challengeOf } from '../lib/labels'
import HikeForm from './HikeForm'

function HikeCard({ hike, onClick }) {
  const diff = difficultyOf(hike.difficulty)
  const st = statusOf(hike.status)
  const chal = challengeOf(hike.challenge)
  return (
    <button onClick={onClick}
      className="text-left rounded-2xl overflow-hidden border card-hover group cursor-pointer rise"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      <div className="relative h-36 overflow-hidden" style={{ background: 'linear-gradient(160deg, #143026, #0C1714)' }}>
        {hike.coverUrl ? (
          <img src={hike.coverUrl} alt={hike.name} loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Mountain size={40} className="text-emerald-500/30" strokeWidth={1.2} />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute top-2.5 left-2.5"><Badge color={st.color} label={st.short} /></div>
        {chal && (
          <div className="absolute top-2.5 right-2.5">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: `${chal.color}29`, color: chal.color, border: `1px solid ${chal.color}4d` }}>
              {chal.short}
            </span>
          </div>
        )}
      </div>
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-white font-semibold text-sm leading-tight">{hike.name}</h3>
          {hike.status === 'fait' && hike.rating > 0 && (
            <span className="flex items-center gap-0.5 text-[11px] text-amber-300 flex-shrink-0">
              <Star size={11} fill="currentColor" /> {hike.rating}
            </span>
          )}
        </div>
        {hike.region && <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1"><MapPin size={10} /> {hike.region}</p>}
        <div className="flex items-center gap-3 mt-2.5 text-[11px] text-slate-400">
          <span className="flex items-center gap-1"><TrendingUp size={12} className="text-emerald-400" /> {fmtElevation(hike.elevationM)}</span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: diff.color }} /> {diff.label}
          </span>
        </div>
      </div>
    </button>
  )
}

export default function Hikes({ onOpenHike }) {
  const { hikes } = useStore()
  const [adding, setAdding] = useState(false)
  const [q, setQ] = useState('')
  const [statusF, setStatusF] = useState('all')
  const [diffF, setDiffF] = useState('all')
  const [regionF, setRegionF] = useState('all')
  const [personalOnly, setPersonalOnly] = useState(false)

  const regions = useMemo(() => {
    const set = new Set(hikes.map((h) => h.region).filter(Boolean))
    return [...set].sort()
  }, [hikes])

  const filtered = useMemo(() => {
    return hikes.filter((h) => {
      if (personalOnly && h.challenge) return false
      if (statusF !== 'all' && h.status !== statusF) return false
      if (diffF !== 'all' && h.difficulty !== diffF) return false
      if (regionF !== 'all' && h.region !== regionF) return false
      if (q && !`${h.name} ${h.region} ${h.location}`.toLowerCase().includes(q.toLowerCase())) return false
      return true
    })
  }, [hikes, statusF, diffF, regionF, q, personalOnly])

  const personalCount = useMemo(() => hikes.filter((h) => !h.challenge).length, [hikes])

  const count = (id) => hikes.filter((h) => h.status === id).length

  return (
    <div className="h-full overflow-y-auto px-4 md:px-7 py-5 pb-24">
      {/* Barre d'actions */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un sommet…"
            className="w-full rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-slate-600 text-sm border transition-all focus:border-emerald-400/50"
            style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(110,231,183,0.12)' }} />
        </div>
        <button onClick={() => setAdding(true)} className="btn-primary !w-auto !px-4 flex-shrink-0">
          <Plus size={16} /> Ajouter un sommet
        </button>
      </div>

      {/* Filtres statut */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-1 -mx-1 px-1">
        <FilterChip active={statusF === 'all'} label="Tous" count={hikes.length} onClick={() => setStatusF('all')} />
        {STATUSES.map((s) => (
          <FilterChip key={s.id} active={statusF === s.id} label={s.label} count={count(s.id)} onClick={() => setStatusF(s.id)} />
        ))}
      </div>

      {/* Filtres difficulté + région */}
      <div className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1">
        <FilterChip active={personalOnly} label="Perso" count={personalCount} onClick={() => setPersonalOnly((v) => !v)} />
        <span className="w-px bg-white/10 mx-1 flex-shrink-0" />
        <FilterChip active={diffF === 'all'} label="Toute difficulté" count={0} onClick={() => setDiffF('all')} />
        {DIFFICULTIES.map((d) => (
          <FilterChip key={d.id} active={diffF === d.id} label={d.label} count={0} onClick={() => setDiffF(d.id)} />
        ))}
        {regions.length > 0 && <span className="w-px bg-white/10 mx-1 flex-shrink-0" />}
        {regions.length > 1 && <FilterChip active={regionF === 'all'} label="Toute région" count={0} onClick={() => setRegionF('all')} />}
        {regions.map((r) => (
          <FilterChip key={r} active={regionF === r} label={r} count={0} onClick={() => setRegionF(regionF === r ? 'all' : r)} />
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Mountain}
          title={hikes.length === 0 ? 'Ton carnet est vide' : 'Aucun sommet ne correspond'}
          hint={hikes.length === 0 ? 'Ajoute ton premier sommet, ou retrouve les 46 Adirondacks dans l\'onglet Objectifs.' : 'Essaie d\'élargir tes filtres.'}
          actionLabel={hikes.length === 0 ? 'Ajouter un sommet' : undefined}
          onAction={() => setAdding(true)} />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {filtered.map((h) => <HikeCard key={h.id} hike={h} onClick={() => onOpenHike(h.id)} />)}
        </div>
      )}

      {adding && <HikeForm onClose={() => setAdding(false)} />}
    </div>
  )
}
