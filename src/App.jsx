import { useState, useEffect } from 'react'
import Layout, { LogoIcon } from './components/Layout'
import Dashboard from './components/Dashboard'
import Hikes from './components/Hikes'
import Goals from './components/Goals'
import Stats from './components/Stats'
import HikeDetail from './components/HikeDetail'
import { supabaseReady } from './lib/supabase'
import useStore from './store'

function ConfigBanner() {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[70] max-w-md w-[92%] rounded-2xl border px-4 py-3 text-sm shadow-2xl"
      style={{ background: 'rgba(40,20,10,0.96)', borderColor: 'rgba(251,191,119,0.3)', color: '#FBBF77' }}>
      <p className="font-semibold">Supabase non configuré</p>
      <p className="text-amber-200/70 text-xs mt-1 leading-relaxed">
        Remplis <code>VITE_SUPABASE_URL</code> et <code>VITE_SUPABASE_ANON_KEY</code> dans <code>.env.local</code>, puis redémarre le serveur.
      </p>
    </div>
  )
}

export default function App() {
  const [tab, setTab] = useState('home')
  const [openId, setOpenId] = useState(null)
  const { fetchAll, loading } = useStore()

  useEffect(() => { fetchAll() }, [fetchAll])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh" style={{ background: '#070B0A' }}>
        <div className="text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)' }}>
            <LogoIcon size={30} animated />
          </div>
          <p className="text-slate-500 text-sm">On prépare le sentier…</p>
        </div>
      </div>
    )
  }

  return (
    <Layout tab={tab} setTab={setTab}>
      <div key={tab} className="tab-enter h-full">
        {tab === 'home' && <Dashboard setTab={setTab} onOpenHike={setOpenId} />}
        {tab === 'hikes' && <Hikes onOpenHike={setOpenId} />}
        {tab === 'goals' && <Goals onOpenHike={setOpenId} />}
        {tab === 'stats' && <Stats />}
      </div>
      {openId && <HikeDetail hikeId={openId} onClose={() => setOpenId(null)} />}
      {!supabaseReady && <ConfigBanner />}
    </Layout>
  )
}
