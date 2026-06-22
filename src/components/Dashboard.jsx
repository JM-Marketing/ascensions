import { useMemo } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Mountain, TrendingUp, Flag, CalendarClock, ChevronRight, Sparkles } from 'lucide-react'
import useStore from '../store'
import { ProgressRing, useCountUp, EmptyState } from './ui'
import { CHALLENGES } from '../lib/labels'

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

function ChallengeMini({ meta, done, total, onClick }) {
  const anim = useCountUp(done)
  const pct = total ? (done / total) * 100 : 0
  return (
    <button onClick={onClick}
      className="rounded-2xl border p-4 glass-strong card-hover rise flex items-center gap-4 text-left cursor-pointer">
      <ProgressRing size={72} stroke={6} progress={pct} color={meta.color} glow>
        <div className="text-center">
          <p className="text-white font-bold text-lg leading-none">{anim}</p>
          <p className="text-[9px] text-slate-500">/ {total}</p>
        </div>
      </ProgressRing>
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 text-[10px] font-bold" style={{ color: meta.color }}><Sparkles size={11} /> DÉFI {meta.short}</div>
        <p className="text-white font-semibold text-sm mt-1">{meta.label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{total - done} restant{total - done > 1 ? 's' : ''}</p>
      </div>
    </button>
  )
}

function OutingRow({ outing, onClick }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border hover:bg-white/[0.02] transition-colors cursor-pointer text-left"
      style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'var(--border)' }}>
      <div className="w-11 h-11 rounded-lg flex flex-col items-center justify-center flex-shrink-0 border" style={{ background: 'rgba(52,211,153,0.07)', borderColor: 'rgba(52,211,153,0.18)' }}>
        <span className="text-emerald-300 text-sm font-bold leading-none">{format(new Date(outing.date + 'T00:00'), 'd', { locale: fr })}</span>
        <span className="text-emerald-400/70 text-[9px] uppercase font-semibold">{format(new Date(outing.date + 'T00:00'), 'MMM', { locale: fr })}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-200 truncate">{(outing.destinations || []).join(', ') || 'Sortie'}</p>
        <p className="text-[11px] text-slate-500 capitalize flex items-center gap-1 mt-0.5">
          <CalendarClock size={10} />{format(new Date(outing.date + 'T00:00'), 'EEEE d MMMM', { locale: fr })}
        </p>
      </div>
      <ChevronRight size={16} className="text-slate-600 flex-shrink-0" />
    </button>
  )
}

export default function Dashboard({ setTab }) {
  const { hikes, outings, userName } = useStore()

  const stats = useMemo(() => {
    const done = hikes.filter((h) => h.status === 'fait')
    return {
      done: done.length,
      toTry: hikes.filter((h) => h.status === 'a_essayer').length,
      totalGain: done.reduce((s, h) => s + (h.gainM || 0), 0),
    }
  }, [hikes])

  const challenges = useMemo(() => {
    return CHALLENGES.map((meta) => {
      const peaks = hikes.filter((h) => h.challenge === meta.id)
      return { meta, total: peaks.length, done: peaks.filter((h) => h.status === 'fait').length }
    }).filter((c) => c.total > 0)
  }, [hikes])

  const upcoming = useMemo(() => {
    const t = new Date().toISOString().slice(0, 10)
    return outings.filter((o) => !o.done && o.date >= t).slice(0, 4)
  }, [outings])

  return (
    <div className="h-full overflow-y-auto px-4 md:px-7 py-5 pb-24 space-y-6">
      {/* Hero */}
      <div className="rise">
        <p className="text-xs text-emerald-400/70 font-semibold tracking-wide uppercase">Carnet de sommets</p>
        <h1 className="font-display text-2xl md:text-3xl font-semibold text-white mt-1">
          {userName ? `Salut ${userName}, ` : 'Salut, '}<span className="text-gradient">prêt·e à grimper ?</span>
        </h1>
      </div>

      {/* Stats clés */}
      <div className="grid grid-cols-3 gap-3.5">
        <StatCard icon={Flag} label="Sommets faits" value={stats.done} color="#34D399" />
        <StatCard icon={Mountain} label="À essayer" value={stats.toTry} color="#FBBF77" />
        <StatCard icon={TrendingUp} label="Dénivelé cumulé" value={stats.totalGain} suffix="m" color="#6EE7B7" />
      </div>

      {/* Défis (une carte par liste officielle) */}
      {challenges.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-3.5">
          {challenges.map((c) => (
            <ChallengeMini key={c.meta.id} meta={c.meta} done={c.done} total={c.total} onClick={() => setTab('goals')} />
          ))}
        </div>
      )}

      {/* Prochaines sorties */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-white flex items-center gap-2"><CalendarClock size={16} className="text-emerald-400" /> Prochaines sorties</h2>
          <button onClick={() => setTab('outings')} className="text-xs text-emerald-400 font-semibold flex items-center gap-1 cursor-pointer hover:text-emerald-300">
            Tout voir <ChevronRight size={13} />
          </button>
        </div>
        {upcoming.length === 0 ? (
          <EmptyState icon={CalendarClock} title="Aucune sortie planifiée"
            hint="Note ta prochaine virée : une date et une ou plusieurs destinations."
            actionLabel="Planifier une sortie" onAction={() => setTab('outings')} />
        ) : (
          <div className="space-y-2">
            {upcoming.map((o) => <OutingRow key={o.id} outing={o} onClick={() => setTab('outings')} />)}
          </div>
        )}
      </div>
    </div>
  )
}
