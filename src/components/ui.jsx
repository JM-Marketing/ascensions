import { useEffect, useRef, useState } from 'react'
import { X, CheckCircle2, Sparkles, Trash2 } from 'lucide-react'

// ---------- Form primitives ----------
export const inputClass = "w-full rounded-xl px-3.5 py-2.5 text-white placeholder-slate-600 text-sm border transition-all duration-200 focus:border-emerald-400/50 focus:bg-white/[0.055] focus:shadow-[0_0_0_3px_rgba(52,211,153,0.12)]"
export const inputStyle = { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(110,231,183,0.12)' }

export function Field({ label, children }) {
  return (
    <div>
      <label className="text-[11px] text-slate-500 mb-1.5 block font-semibold uppercase tracking-wider">{label}</label>
      {children}
    </div>
  )
}

export function TextInput(props) {
  return <input {...props} className={`${inputClass} ${props.className || ''}`} style={{ ...inputStyle, ...(props.style || {}) }} />
}

export function Select(props) {
  return (
    <select {...props} className={`${inputClass} cursor-pointer ${props.className || ''}`} style={{ ...inputStyle, ...(props.style || {}) }}>
      {props.children}
    </select>
  )
}

// ---------- Modal (bottom sheet on mobile, centered card on desktop) ----------
export function ModalShell({ title, onClose, children, footerLabel, onSubmit, disabled, maxWidth = 'max-w-md' }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 modal-overlay" onClick={onClose}>
      <div className={`w-full ${maxWidth} max-h-[90dvh] sm:max-h-[85vh] flex flex-col rounded-t-3xl sm:rounded-3xl border shadow-2xl modal-panel`}
        style={{ background: 'rgba(13,23,20,0.97)', borderColor: 'rgba(110,231,183,0.14)' }}
        onClick={e => e.stopPropagation()}>
        <div className="sm:hidden flex justify-center pt-3 flex-shrink-0"><div className="w-10 h-1 rounded-full bg-white/15" /></div>
        <div className="flex-shrink-0 flex items-center justify-between px-5 pt-4 pb-3 border-b"
          style={{ borderColor: 'rgba(110,231,183,0.08)' }}>
          <h2 className="text-white font-bold text-sm">{title}</h2>
          <button onClick={onClose} aria-label="Fermer"
            className="text-slate-500 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-3.5">{children}</div>
        {footerLabel && (
          <div className="flex-shrink-0 px-5 pt-3 pb-6 sm:pb-5 safe-bottom border-t"
            style={{ background: 'rgba(13,23,20,0.97)', borderColor: 'rgba(110,231,183,0.08)' }}>
            <button onClick={onSubmit} disabled={disabled} className="btn-primary w-full">{footerLabel}</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ---------- Filter chip ----------
export function FilterChip({ active, label, count, onClick }) {
  return (
    <button onClick={onClick}
      className={`flex-shrink-0 text-xs px-3.5 py-1.5 rounded-full font-semibold transition-all duration-200 cursor-pointer border ${
        active
          ? 'text-[#04130C] border-emerald-400/40 shadow-[0_2px_12px_rgba(52,211,153,0.3)]'
          : 'text-slate-500 hover:text-slate-300 border-transparent bg-white/[0.04] hover:bg-white/[0.07]'
      }`}
      style={active ? { background: 'linear-gradient(135deg, #34D399, #6EE7B7)' } : undefined}>
      {label}{count > 0 && <span className={`ml-1.5 ${active ? 'opacity-70' : 'opacity-50'}`}>{count}</span>}
    </button>
  )
}

// ---------- Badge ----------
export function Badge({ color, label, dot = true }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full border"
      style={{ color, borderColor: `${color}33`, background: `${color}14` }}>
      {dot && <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />}
      {label}
    </span>
  )
}

// ---------- Empty state ----------
export function EmptyState({ icon: Icon, title, hint, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center rise">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 float-soft"
        style={{ background: 'linear-gradient(135deg, rgba(52,211,153,0.12), rgba(52,211,153,0.03))', border: '1px solid rgba(52,211,153,0.18)' }}>
        <Icon size={22} className="text-emerald-400" strokeWidth={1.5} />
      </div>
      <p className="text-slate-300 text-sm font-semibold">{title}</p>
      {hint && <p className="text-slate-600 text-xs mt-1.5 max-w-[240px] leading-relaxed">{hint}</p>}
      {actionLabel && (
        <button onClick={onAction} className="mt-4 btn-primary !w-auto !px-5 !py-2 text-xs">{actionLabel}</button>
      )}
    </div>
  )
}

// ---------- Animated progress ring ----------
export function ProgressRing({ size = 64, stroke = 5, progress = 0, color = '#34D399', track = 'rgba(255,255,255,0.06)', glow = false, children }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const [p, setP] = useState(0)
  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setP(progress)))
    return () => cancelAnimationFrame(id)
  }, [progress])
  return (
    <div className="relative inline-flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (Math.min(p, 100) / 100) * c}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.22, 1, 0.36, 1)', filter: glow ? `drop-shadow(0 0 5px ${color}55)` : undefined }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  )
}

// ---------- Count-up hook ----------
export function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0)
  const prev = useRef(0)
  useEffect(() => {
    const t = Number(target) || 0
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(t); prev.current = t; return
    }
    const from = prev.current
    const start = performance.now()
    let raf
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(Math.round(from + (t - from) * eased))
      if (p < 1) raf = requestAnimationFrame(step)
      else prev.current = t
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return value
}

// ---------- Toasts ----------
export function toast(message, type = 'success') {
  window.dispatchEvent(new CustomEvent('asc-toast', { detail: { message, type, id: Date.now() + Math.random() } }))
}

const TOAST_ICONS = {
  success: { Icon: CheckCircle2, color: '#34D399' },
  celebrate: { Icon: Sparkles, color: '#FBBF77' },
  delete: { Icon: Trash2, color: '#94A3B8' },
}

export function Toaster() {
  const [toasts, setToasts] = useState([])
  useEffect(() => {
    const fn = (e) => {
      const t = e.detail
      setToasts(prev => [...prev.slice(-2), t])
      setTimeout(() => setToasts(prev => prev.filter(x => x.id !== t.id)), 2800)
    }
    window.addEventListener('asc-toast', fn)
    return () => window.removeEventListener('asc-toast', fn)
  }, [])
  if (toasts.length === 0) return null
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-2 pointer-events-none px-4">
      {toasts.map(t => {
        const { Icon, color } = TOAST_ICONS[t.type] || TOAST_ICONS.success
        return (
          <div key={t.id} className="toast-in flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border shadow-2xl text-sm font-medium text-slate-100"
            style={{ background: 'rgba(13,23,20,0.92)', borderColor: 'rgba(110,231,183,0.18)', backdropFilter: 'blur(16px)' }}>
            <Icon size={16} style={{ color }} className="flex-shrink-0" />
            {t.message}
          </div>
        )
      })}
    </div>
  )
}

// ---------- Section label ----------
export function SectionLabel({ children, color = '#6EE7B7' }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.18em] mb-2.5 flex items-center gap-2" style={{ color }}>
      <span className="w-4 h-px" style={{ background: color, opacity: 0.5 }} />
      {children}
    </p>
  )
}
