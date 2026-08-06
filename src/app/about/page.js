export default function About() {
  return (
    <div className="min-h-screen flex items-center justify-center p-5">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8 text-center">
        <div className="text-5xl mb-3">🌤️</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">CoolRutin</h1>
        <p className="text-sm text-gray-400 mb-6">Mood Tracker & Daily Journal</p>

        <p className="text-gray-600 mb-6 leading-relaxed">
          Aplikasi web sederhana untuk mencatat mood harian, misi kecil, dan
          aktivitas olahraga biar hidupmu terasa lebih teratur dan menyenangkan!
          Semoga suka sama web nya ya! akan ada beberapa update kedepan kalau lagi mood hehe.
          Dibuat dengan hati dan dibantu oleh claude.
        </p>

        <p>
            Version 1.0
        </p>

        <div className="bg-orange-50 rounded-xl p-4 mb-6">
          <p className="text-xs text-gray-400 mb-1">Dibuat oleh</p>
          <p className="font-bold text-gray-800">Ara Ardanta</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {['Next.js', 'Supabase', 'Tailwind CSS', 'Vercel'].map((tech) => (
            <span key={tech} className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-500 font-medium">
              {tech}
            </span>
          ))}
        </div>

        <a href="/login" className="text-orange-500 font-semibold text-sm hover:underline">
          ← Kembali ke Login
        </a>
      </div>
    </div>
  )
}