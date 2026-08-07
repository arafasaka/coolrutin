'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      router.replace(user ? '/dashboard' : '/login')
    }
    checkAuth()
  }, [router])

  return <p className="p-5 text-center text-gray-400">Loading...</p>
}