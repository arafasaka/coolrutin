"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [hasPassword, setHasPassword] = useState(true);
  const [showPasswordInfo, setShowPasswordInfo] = useState(false);
  const [pendingPassword, setPendingPassword] = useState("");

  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      // Cek apakah user ini punya password (email/password) atau murni dari Google
      const hasEmailProvider = user.app_metadata?.providers?.includes("email");
      setHasPassword(hasEmailProvider);

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        setUsername(profile.username || "");
        setAvatarUrl(profile.avatar_url);
      }
      setLoading(false);
    };
    load();
  }, [router]);

  const handleSaveUsername = async () => {
    setSaving(true);
    await supabase.from("profiles").update({ username }).eq("id", user.id);
    setSaving(false);
  };

  const handleUploadAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);

    const filePath = `${user.id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file);

    if (!uploadError) {
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      await supabase
        .from("profiles")
        .update({ avatar_url: data.publicUrl })
        .eq("id", user.id);
      setAvatarUrl(data.publicUrl);
    }
    setUploading(false);
  };

  const handleSubmitPasswordForm = (e) => {
    e.preventDefault();
    setPasswordMsg("");

    if (newPassword.length < 6) {
      setPasswordMsg("Password minimal 6 karakter");
      return;
    }

    if (!hasPassword) {
      // User Google yang belum punya password → tampilkan penjelasan dulu
      setPendingPassword(newPassword);
      setShowPasswordInfo(true);
    } else {
      // User yang sudah punya password → langsung proses
      processPasswordChange(newPassword);
    }
  };

  const processPasswordChange = async (password) => {
    setShowPasswordInfo(false);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setPasswordMsg(error.message);
    } else {
      setPasswordMsg("✓ Password berhasil diset");
      setNewPassword("");
      setHasPassword(true);
    }
  };

  if (loading) return <p className="p-5">Loading...</p>;

  return (
    <div className="p-5 max-w-lg mx-auto">
      <Navbar />
      <h1 className="text-2xl font-bold mb-6">👤 Profil</h1>

      <div className="bg-white rounded-2xl shadow-sm p-5 mb-5 text-center">
        <div className="w-24 h-24 rounded-full mx-auto mb-3 bg-orange-100 overflow-hidden flex items-center justify-center text-3xl">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            "🙂"
          )}
        </div>
        <label className="inline-block px-4 py-2 rounded-full bg-orange-100 text-orange-600 text-sm font-semibold cursor-pointer hover:bg-orange-200 transition-all">
          {uploading ? "Mengunggah..." : "Ganti Foto"}
          <input
            type="file"
            accept="image/*"
            onChange={handleUploadAvatar}
            className="hidden"
          />
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
          {saving ? "Menyimpan..." : "Simpan Username"}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h2 className="font-bold text-gray-700 mb-3">
          {hasPassword ? "Ganti Password" : "Set Password (Opsional)"}
        </h2>
        {!hasPassword && (
          <p className="text-sm text-gray-400 mb-3">
            Kamu login pakai Google. Set password di sini kalau mau bisa login
            pakai email + password juga.
          </p>
        )}
        <form onSubmit={handleSubmitPasswordForm}>
          <input
            type="password"
            placeholder="Password baru"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-300 mb-3"
          />
          {passwordMsg && (
            <p
              className={`text-sm mb-3 ${passwordMsg.startsWith("✓") ? "text-green-600" : "text-red-500"}`}
            >
              {passwordMsg}
            </p>
          )}
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl font-semibold bg-gray-700 text-white hover:bg-gray-800 transition-all"
          >
            {hasPassword ? "Ganti Password" : "Set Password"}
          </button>
        </form>
      </div>

      <p className="text-center text-xs text-gray-300 mt-4">
        <a href="/about" className="hover:underline">
          Tentang CoolRutin
        </a>
      </p>

      {showPasswordInfo && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-5 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <div className="text-4xl mb-3 text-center">🔑</div>
            <h3 className="font-bold text-gray-800 text-lg mb-2 text-center">
              Set Password?
            </h3>
            <p className="text-sm text-gray-500 mb-5 text-center leading-relaxed">
              Ini akan membuat kamu bisa masuk menggunakan email + password
              langsung, selain lewat Google seperti biasa.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPasswordInfo(false)}
                className="flex-1 py-2.5 rounded-xl font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
              >
                Batal
              </button>
              <button
                onClick={() => processPasswordChange(pendingPassword)}
                className="flex-1 py-2.5 rounded-xl font-semibold bg-orange-400 text-white hover:bg-orange-500 transition-all"
              >
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
