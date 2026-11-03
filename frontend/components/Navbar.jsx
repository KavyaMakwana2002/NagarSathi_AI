"use client";

import React, { useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { 
  PlusCircle, Search, LayoutDashboard, Settings, LogIn, LogOut, User, ShieldCheck, Map, MessageCircle, Droplets
} from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { TRANSLATIONS } from "@/lib/translations";

const emptySubscribe = () => () => {};

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { openSettings, t, authRole, currentUser, logout, lang, theme } = useSettings();
  
  // React 18/19 recommended hydration-safe mount detection (eliminates SSR mismatch)
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const effectiveRole = mounted ? authRole : "guest";
  const effectiveLang = mounted ? lang : "gu";

  // Hydration-safe translation helper for Navbar:
  // Before client mount, guarantee 100% exact match with Server SSR (default "gu")
  const navT = (sec, key) => {
    if (!mounted) {
      return TRANSLATIONS.gu?.[sec]?.[key] || key;
    }
    return t(sec, key);
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-900/90 border-b border-slate-800 text-white transition-all shadow-lg" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <span className="text-xl">🏙️</span>
          </div>
          <div>
            <div 
              className={`font-extrabold text-lg tracking-tight bg-clip-text text-transparent brand-logo-text ${
                theme === "light"
                  ? "bg-gradient-to-r from-slate-950 via-blue-900 to-cyan-600"
                  : "bg-gradient-to-r from-white via-slate-100 to-blue-300"
              }`} 
              suppressHydrationWarning
            >
              NagarSathi <span className="text-cyan-500 dark:text-cyan-400">AI</span>
            </div>
            <p className="text-[10px] text-slate-400 tracking-wider font-medium uppercase -mt-0.5" suppressHydrationWarning>
              {navT("nav", "brandSub")}
            </p>
          </div>
        </Link>

        {/* ========================================================
            ROLE-BASED NAVIGATION LINKS (Desktop)
           ======================================================== */}
        <nav className="hidden lg:flex items-center gap-1.5 bg-slate-800/60 p-1.5 rounded-full border border-slate-700/60" suppressHydrationWarning>
          
          {/* 1. CITIZEN VIEW: Home, New Complaint, Track Status, Settings */}
          {effectiveRole === "citizen" && (
            <>
              <Link
                href="/"
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                  pathname === "/" ? "bg-blue-600 text-white shadow-sm" : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                <span suppressHydrationWarning>{navT("nav", "home")}</span>
              </Link>

              <Link
                href="/complaint"
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
                  pathname === "/complaint" ? "bg-blue-600 text-white shadow-sm" : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span suppressHydrationWarning>{navT("nav", "newComplaint")}</span>
              </Link>

              <Link
                href="/track"
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
                  pathname === "/track" ? "bg-blue-600 text-white shadow-sm" : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span suppressHydrationWarning>{navT("nav", "trackStatus")}</span>
              </Link>

              <Link
                href="/heatmap"
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
                  pathname === "/heatmap" ? "bg-red-600 text-white shadow-sm" : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                <Map className="w-3.5 h-3.5 text-amber-400" />
                <span suppressHydrationWarning>{navT("nav", "heatmap") || "જીઆઈએસ હીટમેપ"}</span>
              </Link>

              <Link
                href="/whatsapp"
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
                  pathname === "/whatsapp" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span suppressHydrationWarning>{navT("nav", "whatsappBot") || "વોટ્સએપ બોટ"}</span>
              </Link>

              <Link
                href="/water"
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
                  pathname === "/water" ? "bg-cyan-600 text-white shadow-sm" : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                <span suppressHydrationWarning>{navT("nav", "jalDrishtiCitizen") || "જળ સેવા (JalBodh)"}</span>
              </Link>

              <button
                type="button"
                onClick={openSettings}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 bg-slate-700/50 hover:bg-cyan-500/20 text-cyan-300 hover:text-cyan-200 border border-slate-600/40 hover:border-cyan-500/50 transition active:scale-95 cursor-pointer"
                title="Settings (સેટિંગ્સ)"
              >
                <Settings className="w-3.5 h-3.5 text-cyan-400" />
                <span suppressHydrationWarning>{navT("nav", "settings")}</span>
              </button>
            </>
          )}

          {/* 2. ADMIN VIEW: Admin Dashboard, Heatmap, Settings */}
          {effectiveRole === "admin" && (
            <>
              <Link
                href="/admin/dashboard"
                className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
                  pathname.startsWith("/admin") ? "bg-indigo-600 text-white shadow-sm" : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span suppressHydrationWarning>{navT("nav", "adminPanel")}</span>
              </Link>

              <Link
                href="/heatmap"
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
                  pathname === "/heatmap" ? "bg-red-600 text-white shadow-sm" : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                <Map className="w-3.5 h-3.5 text-amber-400" />
                <span suppressHydrationWarning>{navT("nav", "heatmap") || "જીઆઈએસ હીટમેપ"}</span>
              </Link>

              <Link
                href="/admin/jaldrishti"
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
                  pathname.startsWith("/admin/jaldrishti") ? "bg-cyan-600 text-white shadow-sm" : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                <span suppressHydrationWarning>{navT("nav", "jalDrishti") || "જળબોધ AI"}</span>
              </Link>

              <button
                type="button"
                onClick={openSettings}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 bg-slate-700/50 hover:bg-cyan-500/20 text-cyan-300 hover:text-cyan-200 border border-slate-600/40 hover:border-cyan-500/50 transition active:scale-95 cursor-pointer"
                title="Settings (સેટિંગ્સ)"
              >
                <Settings className="w-3.5 h-3.5 text-cyan-400" />
                <span suppressHydrationWarning>{navT("nav", "settings")}</span>
              </button>
            </>
          )}

          {/* 3. GUEST VIEW / LOGIN PORTAL: ONLY TWO OPTIONS -> Login Portal & Settings */}
          {effectiveRole === "guest" && (
            <>
              <Link
                href="/login"
                className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
                  pathname === "/login" || pathname === "/"
                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span suppressHydrationWarning>{navT("nav", "portalLogin")}</span>
              </Link>

              <button
                type="button"
                onClick={openSettings}
                className="px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 bg-slate-700/50 hover:bg-cyan-500/20 text-cyan-300 hover:text-cyan-200 border border-slate-600/40 hover:border-cyan-500/50 transition active:scale-95 cursor-pointer"
                title="Settings (સેટિંગ્સ)"
              >
                <Settings className="w-3.5 h-3.5 text-cyan-400" />
                <span suppressHydrationWarning>{navT("nav", "settings")}</span>
              </button>
            </>
          )}

        </nav>

        {/* Right Action Area */}
        <div className="flex items-center gap-2.5" suppressHydrationWarning>
          
          {/* If Citizen Logged In: Show Name & Logout */}
          {effectiveRole === "citizen" && (
            <div className="flex items-center gap-2">
              <Link
                href="/citizen/dashboard"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-cyan-300 border border-slate-700 text-xs font-semibold hover:border-cyan-500 transition"
                title="Citizen Profile"
              >
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span className="truncate max-w-[120px]">{currentUser?.name || "Citizen"}</span>
              </Link>

              <Link
                href="/complaint"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition active:scale-95"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span suppressHydrationWarning>{navT("nav", "reportIssue")}</span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold transition active:scale-95"
                title="લૉગ આઉટ (Logout)"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline" suppressHydrationWarning>{effectiveLang === "gu" ? "લૉગ આઉટ" : "Logout"}</span>
              </button>
            </div>
          )}

          {/* If Admin Logged In: Show Admin badge & Logout */}
          {effectiveRole === "admin" && (
            <div className="flex items-center gap-2">
              <span className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-950/60 text-purple-300 border border-purple-800/60 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>Super Admin</span>
              </span>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold transition active:scale-95"
                title="લૉગ આઉટ (Logout)"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span suppressHydrationWarning>{effectiveLang === "gu" ? "લૉગ આઉટ" : "Logout"}</span>
              </button>
            </div>
          )}

          {/* If Guest (Not Logged In): Show Quick Login Link on mobile */}
          {effectiveRole === "guest" && (
            <Link
              href="/login"
              className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span suppressHydrationWarning>{navT("nav", "portalLogin")}</span>
            </Link>
          )}

          {/* Mobile-only Settings Trigger Button */}
          <button
            onClick={openSettings}
            className="lg:hidden flex items-center gap-1 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 transition active:scale-95"
            title="સેટિંગ્સ ખોલો"
          >
            <Settings className="w-4 h-4 text-cyan-400" />
          </button>

        </div>

      </div>
    </header>
  );
}
