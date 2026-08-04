'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSending(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setSending(false)
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-5">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-8">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🔑</div>
          <h1 className="text-2xl font-bold text-gray-800">Lupa Password?</h1>
          <p className="text-sm text-gray-400 mt-1">Kami kirim link reset ke emailmu</p>
        </div>

        {sent ? (
          <p className="text-center text-green-600 text-sm">
            ✓ Cek email kamu, klik link yang dikirim untuk reset password.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-300 mb-3"
            />
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <button
              type="submit"
              disabled={sending}
              className="w-full py-3 rounded-xl font-semibold bg-orange-400 text-white hover:bg-orange-500 transition-all"
            >
              {sending ? 'Mengirim...' : 'Kirim Link Reset'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-400 mt-5">
          <a href="/login" className="text-orange-500 font-semibold hover:underline">
            ← Kembali ke Login
          </a>
        </p>
      </div>
    </div>
  )
}