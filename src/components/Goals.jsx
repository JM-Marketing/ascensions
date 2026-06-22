import { useMemo, useState } from 'react'
import { Check, Mountain, Plus, Target, Trash2, ChevronRight, Minus } from 'lucide-react'
import useStore from '../store'
import { ProgressRing, useCountUp, ModalShell, Field, TextInput, toast, EmptyState } from './ui'
import { fmtElevation } from '../lib/labels'

function Adk46Card({ peaks, onToggle, onOpen }) {
  const done = peaks.filter((p) => p.status === 'fait').length
  const total = peaks.length
  const pct = total ? (done / total) * 100 : 0
  const animDone = useCountUp(done)
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-2xl border overflow-hidden glass-strong rise">
      <div className="p-5 flex items-center gap-5">
        <ProgressRing size={86} stroke={7} progress={pct} glow>
          <div className="text-center">
            <p className="text-white font-bold text-xl leading-none">{animDone}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">/ {total}</p>
          </div>
        </ProgressRing>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(251,191,119,0.16)', color: '#FBBF77', border: '1px solid rgba(251,191,119,0.3)' }}>DÉFI 46ers</span>
          </div>
          <h2 className="text-white font-display text-xl font-semibold mt-1.5">Les 46 High Peaks</h2>
          <p className="text-xs text-slate-400 mt-1">
            {done === total
              ? 'Bravo, tu es officiellement un·e 46er ! 🎉'
              : `Plus que ${total - done} sommet${total - done > 1 ? 's' : ''} pour devenir 46er.`}
          </p>
        </div>
      </div>

      <button onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3 border-t text-xs font-semibold text-emerald-300 hover:bg-white/[0.02] transition-colors cursor-pointer"
        style={{ borderColor: 'var(--border)' }}>
        {expanded ? 'Masquer la liste' : 'Voir les 46 sommets'}
        <ChevronRight size={15} className={`transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>

      {expanded && (
        <div className="border-t max-h-[420px] overflow-y-auto" style={{ borderColor: 'var(--border)' }}>
          {peaks.map((p) => {
            const isDone = p.status === 'fait'
            return (
              <div key={p.id} className="flex items-center gap-3 px-4 py-2.5 border-b last:border-0 hover:bg-white/[0.02] transition-colors"
                style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                <button onClick={() => onToggle(p)} aria-label={isDone ? 'Marquer à faire' : 'Marquer fait'}
                  className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 border transition-all cursor-pointer"
                  style={isDone
                    ? { background: '#34D399', borderColor: '#34D399' }
                    : { background: 'transparent', borderColor: 'rgba(110,231,183,0.25)' }}>
                  {isDone && <Check size={14} className="text-[#04130C]" strokeWidth={3} />}
                </button>
                <button onClick={() => onOpen(p.id)} className="flex-1 min-w-0 text-left cursor-pointer">
                  <p className={`text-sm font-medium truncate ${isDone ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                    <span className="text-slate-600 text-xs mr-1.5">#{p.adkRank}</span>{p.name}
                  </p>
                </button>
                <span className="text-[11px] text-slate-500 flex-shrink-0">{fmtElevation(p.elevationM)}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function GoalForm({ onClose }) {
  const { addGoal } = useStore()
  const [title, setTitle] = useState('')
  const [target, setTarget] = useState('')
  const valid = title.trim() && Number(target) > 0
  const submit = async () => {
    if (!valid) return
    await addGoal({ title, target, progress: 0 })
    toast('Objectif créé', 'celebrate')
    onClose()
  }
  return (
    <ModalShell title="Nouvel objectif" onClose={onClose} footerLabel="Créer" onSubmit={submit} disabled={!valid}>
      <Field label="Objectif"><TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ex. 10 sommets en 2026" autoFocus /></Field>
      <Field label="Cible (nombre)"><TextInput type="number" inputMode="numeric" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="10" /></Field>
    </ModalShell>
  )
}

function GoalRow({ goal }) {
  const { updateGoal, deleteGoal } = useStore()
  const pct = goal.target ? Math.min(100, (goal.progress / goal.target) * 100) : 0
  const step = (d) => updateGoal(goal.id, { progress: Math.max(0, Math.min(goal.target, goal.progress + d)) })
  return (
    <div className="rounded-2xl border p-4 glass rise">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-white font-semibold text-sm">{goal.title}</p>
          <p className="text-xs text-slate-500 mt-0.5">{goal.progress} / {goal.target}</p>
        </div>
        <button onClick={() => deleteGoal(goal.id)} className="text-slate-600 hover:text-red-300 p-1 cursor-pointer" aria-label="Supprimer"><Trash2 size={14} /></button>
      </div>
      <div className="h-2 rounded-full bg-white/5 mt-3 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #34D399, #6EE7B7)' }} />
      </div>
      <div className="flex items-center gap-2 mt-3">
        <button onClick={() => step(-1)} className="w-8 h-8 rounded-lg border flex items-center justify-center text-slate-300 hover:bg-white/5 cursor-pointer" style={{ borderColor: 'var(--border)' }}><Minus size={14} /></button>
        <button onClick={() => step(1)} className="w-8 h-8 rounded-lg border flex items-center justify-center text-emerald-300 hover:bg-emerald-500/10 cursor-pointer" style={{ borderColor: 'rgba(52,211,153,0.25)' }}><Plus size={14} /></button>
      </div>
    </div>
  )
}

export default function Goals({ onOpenHike }) {
  const { hikes, goals, updateHike } = useStore()
  const [adding, setAdding] = useState(false)

  const adk = useMemo(() => hikes.filter((h) => h.adk46).sort((a, b) => (a.adkRank || 0) - (b.adkRank || 0)), [hikes])

  const toggle = async (peak) => {
    const next = peak.status === 'fait' ? 'a_essayer' : 'fait'
    const patch = { status: next }
    if (next === 'fait' && !peak.dateDone) patch.dateDone = new Date().toISOString().slice(0, 10)
    await updateHike(peak.id, patch)
    if (next === 'fait') toast(`${peak.name} conquis ! 🏔️`, 'celebrate')
  }

  return (
    <div className="h-full overflow-y-auto px-4 md:px-7 py-5 pb-24 space-y-6">
      {adk.length > 0 ? (
        <Adk46Card peaks={adk} onToggle={toggle} onOpen={onOpenHike} />
      ) : (
        <div className="rounded-2xl border p-5 glass" style={{ borderColor: 'var(--border)' }}>
          <p className="text-sm text-slate-300 font-semibold flex items-center gap-2"><Mountain size={16} className="text-amber-300" /> Les 46 Adirondacks ne sont pas chargés</p>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">Exécute <code>supabase/full-setup.sql</code> dans ton projet Supabase pour pré-remplir la liste officielle des 46 High Peaks.</p>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2"><Target size={16} className="text-emerald-400" /> Mes objectifs</h3>
          <button onClick={() => setAdding(true)} className="btn-ghost"><Plus size={14} /> Ajouter</button>
        </div>
        {goals.length === 0 ? (
          <EmptyState icon={Target} title="Aucun objectif perso" hint="Fixe-toi un défi : nombre de sommets, dénivelé d'une saison…" actionLabel="Créer un objectif" onAction={() => setAdding(true)} />
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {goals.map((g) => <GoalRow key={g.id} goal={g} />)}
          </div>
        )}
      </div>

      {adding && <GoalForm onClose={() => setAdding(false)} />}
    </div>
  )
}
