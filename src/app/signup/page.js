"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    // Bikin row di tabel profiles setelah signup berhasil
    if (data.user) {
      await supabase.from("profiles").insert({
        id: data.user.id,
        username: username.trim() || email.split("@")[0],
        email: email,
      });
    }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-8">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🌤️</div>
          <h1 className="text-2xl font-bold text-gray-800">Buat Akun</h1>
          <p className="text-sm text-gray-400 mt-1">
            Mulai catat mood harianmu
          </p>
        </div>

        <form onSubmit={handleSignUp}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-300 mb-3"
          />
          <input
            type="text"
            placeholder="Username (opsional)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-300 mb-3"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-300 mb-3"
          />
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <button
            type="submit"
            className="w-full py-3 rounded-xl font-semibold bg-orange-400 text-white hover:bg-orange-500 transition-all"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-5">
          Sudah punya akun?{" "}
          <a
            href="/login"
            className="text-orange-500 font-semibold hover:underline"
          >
            Login
          </a>
        </p>
        <p className="text-center text-xs text-gray-300 mt-4">
          <a href="/about" className="hover:underline">
            Tentang CoolRutin
          </a>
        </p>
      </div>
    </div>
  );
}
