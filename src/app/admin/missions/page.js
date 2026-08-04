'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Navbar from "@/components/navbar";

export default function AdminMissions() {
  const [missions, setMissions] = useState([])
  const [newMission, setNewMission] = useState('')
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (!profile?.is_admin) {
        router.push('/dashboard')
        return
      }

      setChecking(false)
      fetchMissions()
    }

    checkAdmin()
  }, [router])

  const fetchMissions = async () => {
    const { data } = await supabase
      .from('missions')
      .select('*')
      .order('created_at', { ascending: false })
    setMissions(data || [])
    setLoading(false)
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!newMission.trim()) return

    const { error } = await supabase.from('missions').insert({ content: newMission })
    if (!error) {
      setNewMission('')
      fetchMissions()
    }
  }

  const handleDelete = async (id) => {
    await supabase.from('missions').delete().eq('id', id)
    fetchMissions()
  }

  if (checking || loading) return <p style={{ padding: 20 }}>Loading...</p>

  return (
    <div style={{ padding: 20, maxWidth: 600, margin: '0 auto' }}>
        <Navbar />
      <h1>🎯 Kelola Misi Harian</h1>

      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <input
          type="text"
          value={newMission}
          onChange={(e) => setNewMission(e.target.value)}
          placeholder="Tulis misi baru..."
          style={{ flex: 1, padding: 8 }}
        />
        <button type="submit" style={{ padding: 8 }}>Tambah</button>
      </form>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {missions.map((m) => (
          <li key={m.id} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 10,
            borderBottom: '1px solid #eee',
          }}>
            <span>{m.content}</span>
            <button onClick={() => handleDelete(m.id)} style={{ color: 'red' }}>Hapus</button>
          </li>
        ))}
      </ul>
    </div>
  )
}