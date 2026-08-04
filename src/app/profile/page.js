'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/navbar'

export default function Profile() {
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState('')
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [passwordMsg, setPasswordMsg] = useState('')
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        setUsername(profile.username || '')
        setAvatarUrl(profile.avatar_url)
      }
      setLoading(false)
    }
    load()
  }, [router])

  const handleSaveUsername = async () => {
    setSaving(true)
    await supabase.from('profiles').update({ username }).eq('id', user.id)
    setSaving(false)
  }

  const handleUploadAvatar = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)

    const filePath = `${user.id}/${Date.now()}-${file.name}`
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file)

    if (!uploadError) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
      await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', user.id)
      setAvatarUrl(data.publicUrl)
    }
    setUploading(false)
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordMsg('')

    if (newPassword.length < 6) {
      setPasswordMsg('Password minimal 6 karakter')
      return
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setPasswordMsg(error.message)
    } else {
      setPasswordMsg('✓ Password berhasil diganti')
      setNewPassword('')
    }
  }

  if (loading) return <p className="p-5">Loading...</p>

  return (
    <div className="p-5 max-w-lg mx-auto">
      <Navbar />
      <h1 className="text-2xl font-bold mb-6">👤 Profil</h1>

      <div className="bg-white rounded-2xl shadow-sm p-5 mb-5 text-center">
        <div className="w-24 h-24 rounded-full mx-auto mb-3 bg-orange-100 overflow-hidden flex items-center justify-center text-3xl">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            '🙂'
          )}
        </div>
        <label className="inline-block px-4 py-2 rounded-full bg-orange-100 text-orange-600 text-sm font-semibold cursor-pointer hover:bg-orange-200 transition-all">
          {uploading ? 'Mengunggah...' : 'Ganti Foto'}
          <input type="file" accept="image/*" onChange={handleUploadAvatar} className="hidden" />
        </label>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5 mb-5">
        <h2 className="font-bold text-gray-700 mb-3">Info Akun</h2>

        <label className="text-sm text-gray-500">Email</label>
        <input
          type="email"
          value={user.email}
          disabled
          className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-400 mb-3"
        />

        <label className="text-sm text-gray-500">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-300 mb-3"
        />

        <button
          onClick={handleSaveUsername}
          disabled={saving}
          className="w-full py-2.5 rounded-xl font-semibold bg-orange-400 text-white hover:bg-orange-500 transition-all"
        >
          {saving ? 'Menyimpan...' : 'Simpan Username'}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h2 className="font-bold text-gray-700 mb-3">Ganti Password</h2>
        <form onSubmit={handleChangePassword}>
          <input
            type="password"
            placeholder="Password baru"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-300 mb-3"
          />
          {passwordMsg && (
            <p className={`text-sm mb-3 ${passwordMsg.startsWith('✓') ? 'text-green-600' : 'text-red-500'}`}>
              {passwordMsg}
            </p>
          )}
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl font-semibold bg-gray-700 text-white hover:bg-gray-800 transition-all"
          >
            Ganti Password
          </button>
        </form>
      </div>
    </div>
  )
}