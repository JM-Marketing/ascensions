import { useMemo } from 'react'
import { Mountain, TrendingUp, Flag, CalendarClock, ChevronRight, MapPin, Sparkles } from 'lucide-react'
import useStore from '../store'
import { ProgressRing, useCountUp, EmptyState } from './ui'
import { difficultyOf, fmtElevation } from '../lib/labels'

function StatCard({ icon: Icon, label, value, suffix, color = '#34D399' }) {
  const v = useCountUp(value)
  return (
    <div className="rounded-2xl border p-4 glass card-hover rise">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
        style={{ background: `${color}1a`, border: `1px solid ${color}33` }}>
        <Icon size={17} style={{ color }} />
      </div>
      <p className="text-white text-2xl font-bold leading-none">{v.toLocaleString('fr-CA')}<span className="text-sm text-slate-500 font-semibold ml-1">{suffix}</span></p>
      <p className="text-[11px] text-slate-500 mt-1.5 font-medium">{label}</p>
    </div>
  )
}

function UpcomingRow({ hike, onClick }) {
  const diff = difficultyOf(hike.difficulty)
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border hover:bg-white/[0.02] transition-colors cursor-pointer text-left"
      style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'var(--border)' }}>
      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ background: 'linear-gradient(160deg,#143026,#0C1714)' }}>
        {hike.coverUrl ? <img src={hike.coverUrl} alt="" className="w-full h-full object-cover" /> : <Mountain size={18} className="text-emerald-500/40" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-200 truncate">{hike.name}</p>
        <p className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
          {hike.region && <span className="flex items-center gap-1"><MapPin size={10} />{hike.region}</span>}
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full" style={{ background: diff.color }} />{diff.label}</span>
        </p>
      </div>
      <span className="text-xs text-slate-300 font-medium flex-shrink-0">{fmtElevation(hike.elevationM)}</span>
      <ChevronRight size={16} className="text-slate-600 flex-shrink-0" />
    </button>
  )
}

export default function Dashboard({ setTab, onOpenHike }) {
  const { hikes, userName } = useStore()

  const stats = useMemo(() => {
    const done = hikes.filter((h) => h.status === 'fait')
    const adk = hikes.filter((h) => h.adk46)
    const adkDone = adk.filter((h) => h.status === 'fait').length
    const totalGain = done.reduce((s, h) => s + (h.gainM || 0), 0)
    return {
      done: done.length,
      toTry: hikes.filter((h) => h.status === 'a_essayer').length,
      planned: hikes.filter((h) => h.status === 'planifie'),
      totalGain,
      adkTotal: adk.length,
      adkDone,
      adkPct: adk.length ? (adkDone / adk.length) * 100 : 0,
    }
  }, [hikes])

  const adkAnim = useCountUp(stats.adkDone)

  return (
    <div className="h-full overflow-y-auto px-4 md:px-7 py-5 pb-24 space-y-6">
      {/* Hero */}
      <div className="rise">
        <p className="text-xs text-emerald-400/70 font-semibold tracking-wide uppercase">Carnet de sommets</p>
        <h1 className="font-display text-2xl md:text-3xl font-semibold text-white mt-1">
          {userName ? `Salut ${userName}, ` : 'Salut, '}<span className="text-gradient">prêt·e à grimper ?</span>
        </h1>
      </div>

      {/* Défi 46ers + stats */}
      <div className="grid lg:grid-cols-3 gap-3.5">
        {stats.adkTotal > 0 && (
          <button onClick={() => setTab('goals')}
            className="rounded-2xl border p-4 glass-strong card-hover rise flex items-center gap-4 text-left cursor-pointer">
            <ProgressRing size={76} stroke={6} progress={stats.adkPct} glow>
              <div className="text-center">
                <p className="text-white font-bold text-lg leading-none">{adkAnim}</p>
                <p className="text-[9px] text-slate-500">/ {stats.adkTotal}</p>
              </div>
            </ProgressRing>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-amber-300 text-[10px] font-bold"><Sparkles size={11} /> DÉFI 46ers</div>
              <p className="text-white font-semibold text-sm mt-1">Les 46 Adirondacks</p>
              <p className="text-xs text-slate-500 mt-0.5">{stats.adkTotal - stats.adkDone} restants</p>
            </div>
          </button>
        )}
        <div className={`grid grid-cols-3 gap-3.5 ${stats.adkTotal > 0 ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <StatCard icon={Flag} label="Sommets faits" value={stats.done} color="#34D399" />
          <StatCard icon={Mountain} label="À essayer" value={stats.toTry} color="#FBBF77" />
          <StatCard icon={TrendingUp} label="Dénivelé cumulé" value={stats.totalGain} suffix="m" color="#6EE7B7" />
        </div>
      </div>

      {/* Prochaines sorties */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2"><CalendarClock size={16} className="text-emerald-400" /> Prochaines sorties</h2>
          <button onClick={() => setTab('hikes')} className="text-xs text-emerald-400 font-semibold flex items-center gap-1 cursor-pointer hover:text-emerald-300">
            Tout voir <ChevronRight size={13} />
          </button>
        </div>
        {stats.planned.length === 0 ? (
          <EmptyState icon={CalendarClock} title="Aucune sortie planifiée"
            hint="Passe un sommet en statut « Planifié » pour le retrouver ici."
            actionLabel="Parcourir les sommets" onAction={() => setTab('hikes')} />
        ) : (
          <div className="space-y-2">
            {stats.planned.map((h) => <UpcomingRow key={h.id} hike={h} onClick={() => onOpenHike(h.id)} />)}
          </div>
        )}
      </div>
    </div>
  )
}
