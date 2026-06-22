import { useState } from 'react'
import { ModalShell, Field, TextInput, Select, toast } from './ui'
import { DIFFICULTIES, STATUSES } from '../lib/labels'
import useStore from '../store'

const REGION_SUGGESTIONS = ['Adirondacks', 'Catskills', 'White Mountains', 'Green Mountains', 'Charlevoix', 'Chic-Chocs', 'Autre']

const blank = {
  name: '', region: '', elevationM: '', gainM: '', distanceKm: '',
  difficulty: 'modere', status: 'a_essayer', location: '', lat: '', lng: '',
  duration: '', dateDone: '', notes: '',
}

export default function HikeForm({ hike, onClose }) {
  const { addHike, updateHike } = useStore()
  const editing = Boolean(hike)
  const [form, setForm] = useState(editing
    ? {
        name: hike.name || '', region: hike.region || '', elevationM: hike.elevationM ?? '',
        gainM: hike.gainM ?? '', distanceKm: hike.distanceKm ?? '', difficulty: hike.difficulty || 'modere',
        status: hike.status || 'a_essayer', location: hike.location || '', lat: hike.lat ?? '', lng: hike.lng ?? '',
        duration: hike.duration || '', dateDone: hike.dateDone || '', notes: hike.notes || '',
      }
    : blank)
  const [saving, setSaving] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const valid = form.name.trim().length > 0

  const submit = async () => {
    if (!valid || saving) return
    setSaving(true)
    if (editing) {
      await updateHike(hike.id, form)
      toast('Sommet mis à jour', 'success')
    } else {
      const { error } = await addHike(form)
      if (error) { toast('Erreur à l\'enregistrement', 'delete'); setSaving(false); return }
      toast('Sommet ajouté au carnet', 'celebrate')
    }
    setSaving(false)
    onClose()
  }

  return (
    <ModalShell title={editing ? 'Modifier le sommet' : 'Ajouter un sommet'} onClose={onClose}
      footerLabel={editing ? 'Enregistrer' : 'Ajouter au carnet'} onSubmit={submit} disabled={!valid || saving}>
      <Field label="Nom du sommet / hike">
        <TextInput value={form.name} onChange={set('name')} placeholder="ex. Mont Marcy" autoFocus />
      </Field>

      <Field label="Région / catégorie">
        <TextInput value={form.region} onChange={set('region')} placeholder="ex. Adirondacks" list="regions" />
        <datalist id="regions">
          {REGION_SUGGESTIONS.map((r) => <option key={r} value={r} />)}
        </datalist>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Altitude (m)">
          <TextInput type="number" inputMode="numeric" value={form.elevationM} onChange={set('elevationM')} placeholder="1629" />
        </Field>
        <Field label="Dénivelé + (m)">
          <TextInput type="number" inputMode="numeric" value={form.gainM} onChange={set('gainM')} placeholder="1000" />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Distance A/R (km)">
          <TextInput type="number" inputMode="decimal" step="0.1" value={form.distanceKm} onChange={set('distanceKm')} placeholder="24" />
        </Field>
        <Field label="Durée estimée">
          <TextInput value={form.duration} onChange={set('duration')} placeholder="6-8h" />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Difficulté">
          <Select value={form.difficulty} onChange={set('difficulty')}>
            {DIFFICULTIES.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
          </Select>
        </Field>
        <Field label="Statut">
          <Select value={form.status} onChange={set('status')}>
            {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </Select>
        </Field>
      </div>

      <Field label="Emplacement (texte)">
        <TextInput value={form.location} onChange={set('location')} placeholder="ex. Lake Placid, NY" />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Latitude (option)">
          <TextInput type="number" step="any" value={form.lat} onChange={set('lat')} placeholder="44.1127" />
        </Field>
        <Field label="Longitude (option)">
          <TextInput type="number" step="any" value={form.lng} onChange={set('lng')} placeholder="-73.9237" />
        </Field>
      </div>

      {form.status === 'fait' && (
        <Field label="Date réalisée">
          <TextInput type="date" value={form.dateDone} onChange={set('dateDone')} />
        </Field>
      )}

      <Field label="Notes">
        <textarea value={form.notes} onChange={set('notes')} rows={3}
          className="w-full rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 text-sm border transition-all duration-200 focus:border-emerald-400/50 resize-none"
          style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(110,231,183,0.12)' }}
          placeholder="Itinéraire, conditions, à retenir…" />
      </Field>
    </ModalShell>
  )
}
