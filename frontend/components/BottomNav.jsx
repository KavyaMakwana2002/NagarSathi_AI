"use client";

import React, { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlusCircle, Search, LayoutDashboard, Settings, User, LogIn, LogOut } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

const emptySubscribe = () => () => {};

export default function BottomNav() {
  const pathname = usePathname();
  const { openSettings, t, authRole, logout, lang } = useSettings();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  // Return null during SSR and initial hydration to guarantee zero mismatch
  if (!mounted) {
    return null;
  }

  const effectiveRole = authRole || "guest";

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-2 py-1.5 shadow-2xl" suppressHydrationWarning>
      <div className="flex items-center justify-around max-w-md mx-auto" suppressHydrationWarning>
        
        {/* 1. CITIZEN BOTTOM NAV: Home, Report, Track, Profile, Settings */}
        {effectiveRole === "citizen" && (
          <>
            <Link
              href="/"
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
                pathname === "/" ? "text-cyan-400 font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Home className="w-4 h-4 mb-0.5" />
              <span className="text-[10px]">{t("nav", "home")}</span>
            </Link>

            <Link
              href="/complaint"
              className="flex flex-col items-center -mt-5 group"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 p-0.5 shadow-lg shadow-cyan-500/30 group-active:scale-95 transition">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white">
                  <PlusCircle className="w-5 h-5" />
                </div>
              </div>
              <span className="text-[10px] font-bold text-cyan-400 mt-0.5">
                {t("nav", "reportIssue")}
              </span>
            </Link>

            <Link
              href="/track"
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
                pathname === "/track" ? "text-cyan-400 font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Search className="w-4 h-4 mb-0.5" />
              <span className="text-[10px]">{t("nav", "trackStatus")}</span>
            </Link>

            <Link
              href="/citizen/dashboard"
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
                pathname === "/citizen/dashboard" ? "text-cyan-400 font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <User className="w-4 h-4 mb-0.5" />
              <span className="text-[10px]">{lang === "gu" ? "પ્રોફાઇલ" : "Profile"}</span>
            </Link>

            <button
              type="button"
              onClick={openSettings}
              className="flex flex-col items-center py-1 px-2 rounded-xl text-slate-400 hover:text-cyan-400 transition"
            >
              <Settings className="w-4 h-4 mb-0.5" />
              <span className="text-[10px]">{t("nav", "settings")}</span>
            </button>
          </>
        )}

        {/* 2. ADMIN BOTTOM NAV: Dashboard, Settings, Logout */}
        {effectiveRole === "admin" && (
          <>
            <Link
              href="/admin/dashboard"
              className={`flex flex-col items-center py-1 px-3 rounded-xl transition ${
                pathname.startsWith("/admin") ? "text-purple-400 font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <LayoutDashboard className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">{t("nav", "adminPanel")}</span>
            </Link>

            <button
              type="button"
              onClick={openSettings}
              className="flex flex-col items-center py-1 px-3 rounded-xl text-slate-400 hover:text-cyan-400 transition"
            >
              <Settings className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">{t("nav", "settings")}</span>
            </button>

            <button
              type="button"
              onClick={logout}
              className="flex flex-col items-center py-1 px-3 rounded-xl text-red-400 hover:text-red-300 transition"
            >
              <LogOut className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">{lang === "gu" ? "લૉગ આઉટ" : "Logout"}</span>
            </button>
          </>
        )}

        {/* 3. GUEST BOTTOM NAV: Home, Report, Track, Portal, Settings */}
        {effectiveRole === "guest" && (
          <>
            <Link
              href="/"
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
                pathname === "/" ? "text-cyan-400 font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Home className="w-4 h-4 mb-0.5" />
              <span className="text-[10px]">{t("nav", "home")}</span>
            </Link>

            <Link
              href="/complaint"
              className="flex flex-col items-center -mt-5 group"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 p-0.5 shadow-lg shadow-cyan-500/30 group-active:scale-95 transition">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white">
                  <PlusCircle className="w-5 h-5" />
                </div>
              </div>
              <span className="text-[10px] font-bold text-cyan-400 mt-0.5">
                {t("nav", "reportIssue")}
              </span>
            </Link>

            <Link
              href="/track"
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
                pathname === "/track" ? "text-cyan-400 font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Search className="w-4 h-4 mb-0.5" />
              <span className="text-[10px]">{t("nav", "trackStatus")}</span>
            </Link>

            <Link
              href="/login"
              className={`flex flex-col items-center py-1 px-2 rounded-xl transition ${
                pathname === "/login" ? "text-cyan-400 font-bold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <LogIn className="w-4 h-4 mb-0.5" />
              <span className="text-[10px]">{t("nav", "portalLogin")}</span>
            </Link>

            <button
              type="button"
              onClick={openSettings}
              className="flex flex-col items-center py-1 px-2 rounded-xl text-slate-400 hover:text-cyan-400 transition"
            >
              <Settings className="w-4 h-4 mb-0.5" />
              <span className="text-[10px]">{t("nav", "settings")}</span>
            </button>
          </>
        )}

      </div>
    </nav>
  );
}
