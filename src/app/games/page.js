'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'

export default function GamesHub() {
  const [bestScore, setBestScore] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase
        .from('game_scores')
        .select('score')
        .eq('user_id', user.id)
        .eq('game', 'bubble-pop')
        .order('score', { ascending: false })
        .limit(1)
        .single()

      if (data) setBestScore(data.score)
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) return <p className="p-5">Loading...</p>

  return (
    <div className="p-5 max-w-lg mx-auto">
      <Navbar />
      <h1 className="text-2xl font-bold mb-6">🎮 Mini Game</h1>

      <button
        onClick={() => router.push('/games/bubble-pop')}
        className="w-full bg-white rounded-2xl shadow-sm p-5 text-left hover:shadow-md transition-all"
      >
        <div className="flex items-center gap-4">
          <div className="text-5xl">🫧</div>
          <div className="flex-1">
            <h2 className="font-bold text-gray-800">Bubble Pop</h2>
            <p className="text-sm text-gray-400">Pencet bubble secepat mungkin, hindari bom!</p>
            {bestScore !== null && (
              <p className="text-xs text-orange-500 font-semibold mt-1">🏆 Rekor: {bestScore}</p>
            )}
          </div>
          <div className="text-gray-300 text-xl">→</div>
        </div>
      </button>

      <p className="text-center text-xs text-gray-300 mt-6">Game lain segera hadir ✨</p>
    </div>
  )
}