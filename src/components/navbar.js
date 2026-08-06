"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useUnsavedChanges } from "@/context/unsaved-changes";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  const { isDirty, setIsDirty, runSaveHandler } = useUnsavedChanges();
  const [pendingHref, setPendingHref] = useState(null);

  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();
      setIsAdmin(profile?.is_admin || false);
    };
    checkAdmin();
  }, []);

  const links = [
    { href: "/dashboard", label: "🏠", text: "Home" },
    { href: "/history", label: "📊", text: "Riwayat" },
    { href: "/profile", label: "👤", text: "Profil" },
    ...(isAdmin
      ? [{ href: "/admin/missions", label: "⚙️", text: "Admin" }]
      : []),
  ];

  const handleLogout = async () => {
    if (isDirty) {
      setPendingHref("__logout__");
      return;
    }
    await supabase.auth.signOut();
    router.push("/login");
  };

  const confirmSaveAndLeave = async () => {
    await runSaveHandler();
    setIsDirty(false);
    proceedNavigation();
  };

  const confirmDiscardAndLeave = () => {
    setIsDirty(false);
    proceedNavigation();
  };

  const proceedNavigation = async () => {
    if (pendingHref === "__logout__") {
      await supabase.auth.signOut();
      router.push("/login");
    } else if (pendingHref) {
      router.push(pendingHref);
    }
    setPendingHref(null);
  };

  return (
    <nav className="flex justify-between items-center px-5 py-3 mb-6 bg-white rounded-2xl shadow-sm">
      <div className="flex gap-2 flex-wrap">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <button
              key={link.href}
              onClick={() => {
                if (isDirty) {
                  setPendingHref(link.href);
                } else {
                  router.push(link.href);
                }
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                active
                  ? "bg-orange-400 text-white shadow-md scale-105"
                  : "text-gray-500 hover:bg-orange-50"
              }`}
            >
              <span>{link.label}</span>
              <span className="hidden md:inline">{link.text}</span>
            </button>
          );
        })}
      </div>
      <button
        onClick={handleLogout}
        className="px-4 py-2 rounded-full text-sm font-semibold text-gray-400 hover:bg-gray-100 transition-all"
      >
        Logout
      </button>

      {pendingHref && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-5 z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <div className="text-4xl mb-3 text-center">✏️</div>
            <h3 className="font-bold text-gray-800 text-lg mb-2 text-center">
              Ada perubahan belum disimpan
            </h3>
            <p className="text-sm text-gray-500 mb-5 text-center leading-relaxed">
              Kamu masih punya catatan mood yang belum disimpan. Simpan dulu
              sebelum pindah halaman?
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={confirmSaveAndLeave}
                className="py-2.5 rounded-xl font-semibold bg-orange-400 text-white hover:bg-orange-500 transition-all"
              >
                Simpan & Lanjut
              </button>
              <button
                onClick={confirmDiscardAndLeave}
                className="py-2.5 rounded-xl font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
              >
                Buang Perubahan & Lanjut
              </button>
              <button
                onClick={() => setPendingHref(null)}
                className="py-2 text-sm text-gray-400 hover:text-gray-600"
              >
                Batal, tetap di sini
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
