export default function About() {
  return (
    <div className="min-h-screen flex items-center justify-center p-5">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🌤️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">CoolRutin</h1>
          <p className="text-sm text-gray-400">Mood Tracker & Daily Journal</p>
        </div>

        <p className="text-gray-600 mb-6 leading-relaxed text-center">
          Aplikasi sederhana untuk mencatat mood harian, misi kecil, dan
          aktivitas olahraga biar hidupmu lebih berwarna hehe..
        </p>

        <div className="bg-orange-50 rounded-xl p-4 mb-6 text-center">
          <p className="text-xs text-gray-400 mb-1">Dibuat oleh</p>
          <p className="font-bold text-gray-800">Ara Ardanta</p>
        </div>

        <div className="mb-6">
          <h2 className="font-bold text-gray-700 mb-3">🎯 Fitur</h2>
          <ul className="text-sm text-gray-600 space-y-1.5">
            <li>😊 Catat mood harian dengan emoji</li>
            <li>📝 Jurnal singkat "1 hal berkesan hari ini"</li>
            <li>🎯 Misi harian dengan tombol acak</li>
            <li>🏃 Log olahraga (jenis + durasi)</li>
            <li>📊 Grafik progress mingguan</li>
            <li>🎮 Mini game untuk hiburan</li>
          </ul>
        </div>

        <div className="mb-6">
          <h2 className="font-bold text-gray-700 mb-3">📌 Riwayat Versi</h2>
          <div className="space-y-3 text-sm">
            <div className="border-l-2 border-orange-300 pl-3">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-bold text-gray-800">v2.0</span>
                <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">Terbaru</span>
              </div>
              <p className="text-gray-500 text-xs mb-1">Agustus 2026</p>
              <ul className="text-gray-600 text-xs space-y-0.5">
                <li>• Mini game "Bubble Pop" dengan high score</li>
                <li>• Login dengan Google</li>
                <li>• Lupa & reset password</li>
                <li>• Foto profil</li>
                <li>• Popup konfirmasi perubahan belum tersimpan</li>
              </ul>
            </div>

            <div className="border-l-2 border-gray-200 pl-3">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-bold text-gray-800">v1.0</span>
              </div>
              <p className="text-gray-500 text-xs mb-1">Agustus 2026</p>
              <ul className="text-gray-600 text-xs space-y-0.5">
                <li>• Mood tracker + jurnal harian</li>
                <li>• Misi harian dengan admin panel</li>
                <li>• Log olahraga</li>
                <li>• Halaman riwayat 7 hari terakhir</li>
                <li>• Auth email/password</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="font-bold text-gray-700 mb-3">🛠️ Dibangun dengan</h2>
          <div className="flex flex-wrap gap-2">
            {['Next.js', 'React', 'Supabase', 'Tailwind CSS', 'Recharts', 'Vercel'].map((tech) => (
              <span key={tech} className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-500 font-medium">
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="text-center">
          <a href="/dashboard" className="text-orange-500 font-semibold text-sm hover:underline">
            ← Kembali
          </a>
        </div>
      </div>
    </div>
  )
}