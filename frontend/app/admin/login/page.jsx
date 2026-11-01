"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Lock, User, ArrowRight, AlertCircle, Sparkles, Settings } from "lucide-react";
import { adminLogin } from "@/lib/api";
import { useSettings } from "@/context/SettingsContext";

export default function AdminLoginPage() {
  const router = useRouter();
  const { t, openSettings, loginAsAdmin } = useSettings();

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await adminLogin(username, password);
      if (res.success) {
        loginAsAdmin(res.admin, res.token);
        router.push("/admin/dashboard");
      } else {
        setError(res.error || "Invalid username or password.");
      }
    } catch (err) {
      setError("Cannot reach backend server. Please verify connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-7 sm:p-9 shadow-2xl relative overflow-hidden">
        
        {/* Top Glow Accent */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Icon & Title */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-blue-500/25">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white">
            {t("admin", "loginTitle")}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t("admin", "loginSub")}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3.5 rounded-xl flex items-center gap-2 mb-5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t("admin", "usernameLabel")}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t("admin", "passwordLabel")}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
          </div>

          {/* Quick Demo Credentials Badge */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 text-[11px] text-slate-400 flex items-center justify-between">
            <span>{t("admin", "demoCredsText")}</span>
            <span className="font-mono text-cyan-400 font-semibold">admin / admin123</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-95 transition disabled:opacity-50"
          >
            <span>{loading ? t("admin", "loggingIn") : t("admin", "loginBtn")}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-between mt-6 text-xs text-slate-400">
          <Link href="/" className="hover:text-cyan-400 transition">
            ← {t("complaint", "backHome")}
          </Link>
          <button
            type="button"
            onClick={openSettings}
            className="flex items-center gap-1 hover:text-cyan-400 transition"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>{t("nav", "settings")}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
