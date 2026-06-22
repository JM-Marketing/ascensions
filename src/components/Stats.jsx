import { useMemo } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Flag, TrendingUp, Route, Award, BarChart3 } from 'lucide-react'
import useStore from '../store'
import { useCountUp, EmptyState } from './ui'
import { DIFFICULTIES, difficultyOf } from '../lib/labels'

function BigStat({ icon: Icon, label, value, suffix, color }) {
  const v = useCountUp(value)
  return (
    <div className="rounded-2xl border p-4 glass rise">
      <Icon size={18} style={{ color }} />
      <p className="text-white text-2xl font-bold mt-3 leading-none">{v.toLocaleString('fr-CA')}<span className="text-sm text-slate-500 font-semibold ml-1">{suffix}</span></p>
      <p className="text-[11px] text-slate-500 mt-1.5">{label}</p>
    </div>
  )
}

export default function Stats() {
  const { hikes } = useStore()

  const data = useMemo(() => {
    const done = hikes.filter((h) => h.status === 'fait')
    const byDiff = DIFFICULTIES.map((d) => ({ ...d, count: done.filter((h) => h.difficulty === d.id).length }))
    const regionMap = {}
    done.forEach((h) => { const r = h.region || 'Sans région'; regionMap[r] = (regionMap[r] || 0) + 1 })
    const byRegion = Object.entries(regionMap).map(([region, count]) => ({ region, count })).sort((a, b) => b.count - a.count)
    const monthMap = {}
    done.filter((h) => h.dateDone).forEach((h) => {
      const key = h.dateDone.slice(0, 7)
      monthMap[key] = (monthMap[key] || 0) + 1
    })
    const byMonth = Object.entries(monthMap).sort().slice(-6).map(([k, count]) => ({
      label: format(new Date(k + '-01T00:00'), 'MMM', { locale: fr }), count,
    }))
    const highest = done.reduce((max, h) => (h.elevationM > (max?.elevationM || 0) ? h : max), null)
    return {
      done: done.length,
      totalGain: done.reduce((s, h) => s + (h.gainM || 0), 0),
      totalDist: done.reduce((s, h) => s + (Number(h.distanceKm) || 0), 0),
      byDiff, byRegion, byMonth, highest,
    }
  }, [hikes])

  if (data.done === 0) {
    return (
      <div className="h-full overflow-y-auto px-4 md:px-7 py-5">
        <EmptyState icon={BarChart3} title="Pas encore de statistiques" hint="Marque tes premiers sommets comme « faits » pour voir ton bilan apparaître ici." />
      </div>
    )
  }

  const diffMax = Math.max(1, ...data.byDiff.map((d) => d.count))
  const monthMax = Math.max(1, ...data.byMonth.map((m) => m.count))

  return (
    <div className="h-full overflow-y-auto px-4 md:px-7 py-5 pb-24 space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <BigStat icon={Flag} label="Sommets conquis" value={data.done} color="#34D399" />
        <BigStat icon={TrendingUp} label="Dénivelé cumulé" value={data.totalGain} suffix="m" color="#6EE7B7" />
        <BigStat icon={Route} label="Distance cumulée" value={Math.round(data.totalDist)} suffix="km" color="#FBBF77" />
        <BigStat icon={Award} label="Plus haut sommet" value={data.highest?.elevationM || 0} suffix="m" color="#FB923C" />
      </div>

      {data.highest && (
        <div className="rounded-2xl border p-4 glass-strong rise flex items-center gap-3">
          <Award size={20} className="text-amber-300 flex-shrink-0" />
          <p className="text-sm text-slate-300">Ton plus haut sommet : <span className="text-white font-semibold">{data.highest.name}</span> — {data.highest.elevationM} m</p>
        </div>
      )}

      {/* Répartition par difficulté */}
      <div className="rounded-2xl border p-5 glass rise" style={{ borderColor: 'var(--border)' }}>
        <h3 className="text-sm font-bold text-white mb-4">Par difficulté</h3>
        <div className="space-y-3">
          {data.byDiff.map((d) => (
            <div key={d.id} className="flex items-center gap-3">
              <span className="text-xs text-slate-400 w-20 flex-shrink-0">{d.label}</span>
              <div className="flex-1 h-2.5 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full bar-grow" style={{ width: `${(d.count / diffMax) * 100}%`, background: d.color }} />
              </div>
              <span className="text-xs text-slate-300 font-semibold w-6 text-right flex-shrink-0">{d.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3.5">
        {/* Par région */}
        <div className="rounded-2xl border p-5 glass rise" style={{ borderColor: 'var(--border)' }}>
          <h3 className="text-sm font-bold text-white mb-4">Par région</h3>
          <div className="space-y-2.5">
            {data.byRegion.map((r) => (
              <div key={r.region} className="flex items-center justify-between text-sm">
                <span className="text-slate-300 truncate">{r.region}</span>
                <span className="text-emerald-300 font-semibold ml-2 flex-shrink-0">{r.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Par mois */}
        <div className="rounded-2xl border p-5 glass rise" style={{ borderColor: 'var(--border)' }}>
          <h3 className="text-sm font-bold text-white mb-4">Sommets par mois</h3>
          {data.byMonth.length === 0 ? (
            <p className="text-xs text-slate-500">Ajoute des dates de réalisation pour voir l'évolution.</p>
          ) : (
            <div className="flex items-end justify-between gap-2 h-32">
              {data.byMonth.map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full rounded-t-md bar-grow" style={{ height: `${(m.count / monthMax) * 100}%`, minHeight: 4, background: 'linear-gradient(180deg,#6EE7B7,#34D399)', animationDelay: `${i * 0.08}s` }} />
                  <span className="text-[10px] text-slate-500 capitalize">{m.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
