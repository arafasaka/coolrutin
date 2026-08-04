"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

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
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <nav className="flex justify-between items-center px-5 py-3 mb-6 bg-white rounded-2xl shadow-sm">
      <div className="flex gap-2 flex-wrap">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <button
              key={link.href}
              onClick={() => router.push(link.href)}
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
    </nav>
  );
}
