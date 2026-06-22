import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { CalendarClock, Plus, MapPin, Trash2, Check, X, Pencil, Backpack } from 'lucide-react'
import useStore from '../store'
import { ModalShell, Field, TextInput, toast, EmptyState } from './ui'

const todayStr = () => new Date().toISOString().slice(0, 10)
const fmtDate = (d) => format(new Date(d + 'T00:00'), 'EEE d MMM yyyy', { locale: fr })

function OutingForm({ outing, onClose }) {
  const { hikes, addOuting, updateOuting } = useStore()
  const editing = Boolean(outing)
  const [date, setDate] = useState(outing?.date || todayStr())
  const [dests, setDests] = useState(outing?.destinations || [])
  const [draft, setDraft] = useState('')
  const [notes, setNotes] = useState(outing?.notes || '')
  const [saving, setSaving] = useState(false)

  const addDest = () => {
    const v = draft.trim()
    if (v && !dests.includes(v)) setDests((d) => [...d, v])
    setDraft('')
  }
  const onKey = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addDest() }
    if (e.key === 'Backspace' && !draft && dests.length) setDests((d) => d.slice(0, -1))
  }

  const valid = date && dests.length > 0
  const submit = async () => {
    if (!valid || saving) return
    setSaving(true)
    const payload = { date, destinations: dests, notes }
    if (editing) { await updateOuting(outing.id, payload); toast('Sortie mise à jour', 'success') }
    else { await addOuting(payload); toast('Sortie planifiée 🎒', 'celebrate') }
    setSaving(false)
    onClose()
  }

  return (
    <ModalShell title={editing ? 'Modifier la sortie' : 'Planifier une sortie'} onClose={onClose}
      footerLabel={editing ? 'Enregistrer' : 'Planifier'} onSubmit={submit} disabled={!valid || saving}>
      <Field label="Date">
        <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </Field>

      <Field label="Destination(s)">
        <div className="flex flex-wrap gap-2 mb-2">
          {dests.map((d) => (
            <span key={d} className="inline-flex items-center gap-1.5 text-xs font-semibold pl-2.5 pr-1.5 py-1 rounded-full"
              style={{ background: 'rgba(52,211,153,0.12)', color: '#6EE7B7', border: '1px solid rgba(52,211,153,0.25)' }}>
              <MapPin size={11} /> {d}
              <button onClick={() => setDests((x) => x.filter((y) => y !== d))} className="hover:text-white cursor-pointer" aria-label={`Retirer ${d}`}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <TextInput value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={onKey}
            list="dest-suggestions" placeholder="ex. Gran Paradiso… (Entrée pour ajouter)" />
          <button onClick={addDest} disabled={!draft.trim()} className="btn-primary !w-auto !px-3.5 flex-shrink-0 disabled:opacity-40" aria-label="Ajouter la destination">
            <Plus size={16} />
          </button>
        </div>
        <datalist id="dest-suggestions">
          {hikes.map((h) => <option key={h.id} value={h.name} />)}
        </datalist>
      </Field>

      <Field label="Notes (option)">
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
          className="w-full rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 text-sm border transition-all duration-200 focus:border-emerald-400/50 resize-none"
          style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(110,231,183,0.12)' }}
          placeholder="Co-voiturage, horaire de départ, météo…" />
      </Field>
    </ModalShell>
  )
}

function OutingCard({ outing }) {
  const { updateOuting, deleteOuting } = useStore()
  const [editing, setEditing] = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)
  return (
    <div className={`rounded-2xl border p-4 glass rise ${outing.done ? 'opacity-70' : ''}`} style={{ borderColor: 'var(--border)' }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-white capitalize flex items-center gap-2">
            <CalendarClock size={15} className="text-emerald-400 flex-shrink-0" /> {fmtDate(outing.date)}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {(outing.destinations || []).map((d) => (
              <span key={d} className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(110,231,183,0.1)', color: '#6EE7B7', border: '1px solid rgba(110,231,183,0.2)' }}>
                <MapPin size={10} /> {d}
              </span>
            ))}
          </div>
          {outing.notes && <p className="text-xs text-slate-400 mt-2.5 leading-relaxed whitespace-pre-wrap">{outing.notes}</p>}
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <button onClick={() => updateOuting(outing.id, { done: !outing.done })}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border cursor-pointer transition-colors"
            style={outing.done
              ? { background: 'rgba(52,211,153,0.15)', borderColor: 'rgba(52,211,153,0.4)', color: '#34D399' }
              : { background: 'rgba(255,255,255,0.03)', borderColor: 'var(--border)', color: '#9DB3A6' }}>
            <span className="inline-flex items-center gap-1">{outing.done && <Check size={11} />}{outing.done ? 'Faite' : 'À venir'}</span>
          </button>
        </div>
      </div>
      <div className="flex items-center gap-1 mt-3 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
        {confirmDel ? (
          <>
            <span className="text-xs text-slate-400 flex-1">Supprimer cette sortie ?</span>
            <button onClick={() => setConfirmDel(false)} className="text-xs font-semibold px-2.5 py-1.5 rounded-lg text-slate-300 hover:bg-white/5 cursor-pointer">Annuler</button>
            <button onClick={() => deleteOuting(outing.id)} className="text-xs font-bold px-2.5 py-1.5 rounded-lg text-red-300 bg-red-500/15 border border-red-500/30 hover:bg-red-500/25 cursor-pointer">Supprimer</button>
          </>
        ) : (
          <>
            <button onClick={() => setEditing(true)} className="btn-ghost !py-1.5"><Pencil size={13} /> Modifier</button>
            <button onClick={() => setConfirmDel(true)} className="ml-auto p-1.5 rounded-lg text-slate-500 hover:text-red-300 hover:bg-red-500/10 cursor-pointer" aria-label="Supprimer"><Trash2 size={15} /></button>
          </>
        )}
      </div>
      {editing && <OutingForm outing={outing} onClose={() => setEditing(false)} />}
    </div>
  )
}

export default function Outings() {
  const { outings } = useStore()
  const [adding, setAdding] = useState(false)

  const { upcoming, past } = useMemo(() => {
    const t = todayStr()
    const up = outings.filter((o) => !o.done && o.date >= t)
    const pa = outings.filter((o) => o.done || o.date < t).sort((a, b) => (a.date < b.date ? 1 : -1))
    return { upcoming: up, past: pa }
  }, [outings])

  return (
    <div className="h-full overflow-y-auto px-4 md:px-7 py-5 pb-24 space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">Planifie tes prochaines sorties : une date, une ou plusieurs destinations.</p>
        <button onClick={() => setAdding(true)} className="btn-primary !w-auto !px-4 flex-shrink-0">
          <Plus size={16} /> Planifier
        </button>
      </div>

      {outings.length === 0 ? (
        <EmptyState icon={Backpack} title="Aucune sortie planifiée"
          hint="Note ta prochaine virée : un week-end aux White Mountains, un sommet le samedi…"
          actionLabel="Planifier une sortie" onAction={() => setAdding(true)} />
      ) : (
        <>
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300/70 mb-3">À venir ({upcoming.length})</h3>
            {upcoming.length === 0 ? (
              <p className="text-xs text-slate-600">Rien de prévu pour l'instant.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">{upcoming.map((o) => <OutingCard key={o.id} outing={o} />)}</div>
            )}
          </div>
          {past.length > 0 && (
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600 mb-3">Passées ({past.length})</h3>
              <div className="grid sm:grid-cols-2 gap-3">{past.map((o) => <OutingCard key={o.id} outing={o} />)}</div>
            </div>
          )}
        </>
      )}

      {adding && <OutingForm onClose={() => setAdding(false)} />}
    </div>
  )
}
