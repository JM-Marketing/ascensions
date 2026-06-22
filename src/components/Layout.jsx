import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { LayoutDashboard, Mountain, Target, BarChart3, Menu, X } from 'lucide-react'
import { useState } from 'react'
import useStore from '../store'
import { Toaster } from './ui'

const NAV_ITEMS = [
  { id: 'home', label: 'Accueil', icon: LayoutDashboard, desc: 'Vue d\'ensemble de tes sommets' },
  { id: 'hikes', label: 'Sommets', icon: Mountain, desc: 'Tous tes hikes : faits, à essayer, planifiés' },
  { id: 'goals', label: 'Objectifs', icon: Target, desc: 'Les 46 Adirondacks & objectifs perso' },
  { id: 'stats', label: 'Stats', icon: BarChart3, desc: 'Ton bilan d\'ascensions' },
]

export function LogoIcon({ size = 28, animated = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 28" fill="none">
      <circle cx="24" cy="7" r="3.2" fill="#FBBF77" className={animated ? 'logo-bar' : undefined} />
      <path d="M2 25 L11 9 L16 17 L20 11 L30 25 Z" fill="#34D399"
        className={animated ? 'logo-bar' : undefined} style={animated ? { animationDelay: '0.15s' } : undefined} />
      <path d="M11 9 L13.6 13.2 L11 15 L8.4 13.4 Z" fill="#ECFDF5" />
      <path d="M20 11 L22.2 14.4 L20 15.5 L17.9 13.8 Z" fill="#ECFDF5" />
    </svg>
  )
}

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)' }}>
        <LogoIcon size={24} />
      </div>
      <div>
        <p className="text-sm font-bold text-white leading-none tracking-tight">Ascensions</p>
        <p className="text-[10px] text-emerald-400/60 mt-1 font-semibold tracking-[0.15em] uppercase">Carnet de sommets</p>
      </div>
    </div>
  )
}

function NavItem({ item, active, onClick }) {
  const Icon = item.icon
  return (
    <button onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer relative group transition-all duration-200 ${
        active ? 'text-emerald-300' : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
      }`}
      style={active
        ? { background: 'linear-gradient(90deg, rgba(52,211,153,0.14), rgba(52,211,153,0.04))', border: '1px solid rgba(52,211,153,0.2)' }
        : { border: '1px solid transparent' }}>
      <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 rounded-full bg-emerald-400 transition-all duration-300 ${active ? 'h-5 opacity-100' : 'h-0 opacity-0'}`} />
      <Icon size={18} strokeWidth={active ? 2.2 : 1.6}
        className="flex-shrink-0 transition-transform duration-200 group-hover:scale-110 group-active:scale-95" />
      <span className="text-sm font-semibold">{item.label}</span>
    </button>
  )
}

function SidebarFooter() {
  const { userName } = useStore()
  const initials = userName ? userName.trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : 'AS'
  return (
    <div className="px-4 py-4 border-t" style={{ borderColor: 'rgba(52,211,153,0.07)' }}>
      <div className="flex items-center gap-2.5 px-1">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center flex-shrink-0">
          <span className="text-[11px] font-bold text-[#04130C]">{initials}</span>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-200 truncate">{userName || 'Ascensions'}</p>
          <p className="text-[10px] text-emerald-400/80 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-dot" /> En ligne
          </p>
        </div>
      </div>
    </div>
  )
}

function Sidebar({ tab, setTab }) {
  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen border-r fixed left-0 top-0 bottom-0 z-20"
      style={{ background: 'rgba(7,11,10,0.85)', backdropFilter: 'blur(12px)', borderColor: 'rgba(52,211,153,0.07)' }}>
      <div className="px-4 pt-6 pb-5 border-b" style={{ borderColor: 'rgba(52,211,153,0.07)' }}><Logo /></div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] px-3 mb-3">Navigation</p>
        {NAV_ITEMS.map(item => (
          <NavItem key={item.id} item={item} active={tab === item.id} onClick={() => setTab(item.id)} />
        ))}
      </nav>
      <SidebarFooter />
    </aside>
  )
}

function MobileDrawer({ tab, setTab, onClose }) {
  return (
    <div className="md:hidden drawer-overlay" onClick={onClose} aria-label="Navigation principale">
      <aside className="drawer-open fixed left-0 top-0 bottom-0 w-72 max-w-[82vw] z-50 flex flex-col border-r"
        style={{ background: 'rgba(9,14,12,0.98)', backdropFilter: 'blur(16px)', borderColor: 'rgba(52,211,153,0.1)' }}
        onClick={e => e.stopPropagation()}>
        <div className="px-4 pt-5 pb-5 border-b safe-top flex items-center justify-between" style={{ borderColor: 'rgba(52,211,153,0.07)' }}>
          <Logo />
          <button onClick={onClose} aria-label="Fermer le menu"
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em] px-3 mb-3">Navigation</p>
          {NAV_ITEMS.map(item => (
            <NavItem key={item.id} item={item} active={tab === item.id} onClick={() => { setTab(item.id); onClose() }} />
          ))}
        </nav>
        <SidebarFooter />
      </aside>
    </div>
  )
}

export default function Layout({ tab, setTab, children }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const currentItem = NAV_ITEMS.find(i => i.id === tab)
  const today = format(new Date(), 'EEEE d MMMM', { locale: fr })

  return (
    <div className="flex min-h-dvh relative" style={{ zIndex: 1 }}>
      <Sidebar tab={tab} setTab={setTab} />
      {menuOpen && <MobileDrawer tab={tab} setTab={setTab} onClose={() => setMenuOpen(false)} />}

      <div className="flex-1 flex flex-col md:ml-60 relative" style={{ zIndex: 1 }}>
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center gap-3 px-4 pb-3 safe-top border-b sticky top-0 z-30"
          style={{ background: 'rgba(7,11,10,0.9)', borderColor: 'rgba(52,211,153,0.08)', backdropFilter: 'blur(14px)' }}>
          <button onClick={() => setMenuOpen(true)} aria-label="Ouvrir le menu"
            className="-ml-1 p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)' }}>
              <LogoIcon size={18} />
            </div>
            <span className="text-sm font-bold text-white">Ascensions</span>
          </div>
          <div className="ml-auto">
            <span key={tab} className="text-xs font-semibold text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 check-pop">
              {currentItem?.label}
            </span>
          </div>
        </header>

        {/* Desktop top bar */}
        <div className="hidden md:flex items-center justify-between px-7 py-5 border-b"
          style={{ borderColor: 'rgba(52,211,153,0.06)' }}>
          <div key={tab} className="tab-enter">
            <h1 className="font-display text-2xl font-semibold text-white leading-none">{currentItem?.label === 'Stats' ? 'Statistiques' : currentItem?.label}</h1>
            <p className="text-xs text-slate-500 mt-1.5">{currentItem?.desc}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 capitalize">{today}</span>
            <div className="flex items-center gap-2 text-xs text-slate-400 px-3 py-1.5 rounded-lg border glass">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-dot" /> Synchronisé
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
      <Toaster />
    </div>
  )
}
