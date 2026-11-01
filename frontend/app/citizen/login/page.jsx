"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Phone, Lock, ArrowRight, AlertCircle, ArrowLeft, Sparkles, CheckCircle2 } from "lucide-react";
import { citizenLogin } from "@/lib/api";
import { useSettings } from "@/context/SettingsContext";

export default function CitizenLoginPage() {
  const router = useRouter();
  const { t, lang, loginAsCitizen } = useSettings();

  const [mobile, setMobile] = useState("9876543210");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await citizenLogin(mobile, password);
      if (res.success) {
        loginAsCitizen(res.citizen, res.token);
        router.push("/");
      } else {
        setError(res.error || "Login failed. Please check your credentials.");
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
        
        {/* Glow Accent */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-cyan-500/25">
            <User className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white">
            {lang === "gu" ? "નાગરિક લૉગિન" : "Citizen Login"}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {lang === "gu" ? "તમારો મોબાઈલ નંબર દાખલ કરીને ડેશબોર્ડ ખોલો" : "Enter your mobile number to access your civic dashboard"}
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
              {lang === "gu" ? "મોબાઈલ નંબર (Mobile Number) *" : "Mobile Number *"}
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="10-digit mobile number"
                required
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {lang === "gu" ? "પાસવર્ડ / પિન (Password/PIN)" : "Password / PIN"}
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

          {/* Quick Demo Credentials */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 text-[11px] text-slate-400 flex items-center justify-between">
            <span>{lang === "gu" ? "✨ ડેમો નાગરિક લૉગિન:" : "✨ Demo Citizen Account:"}</span>
            <span className="font-mono text-cyan-400 font-semibold">9876543210 / 123456</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 active:scale-95 transition disabled:opacity-50"
          >
            <span>{loading ? "લૉગિન થઈ રહ્યું છે..." : (lang === "gu" ? "નાગરિક પોર્ટલ ખોલો (Login)" : "Access Citizen Dashboard")}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400">
          <Link href="/citizen/signup" className="text-cyan-400 hover:underline font-semibold">
            {lang === "gu" ? "નવું એકાઉન્ટ બનાવો (Sign Up)" : "Create New Account"}
          </Link>
          <Link href="/login" className="hover:text-white transition">
            ← {lang === "gu" ? "પોર્ટલ પસંદગી પર પાછા જાઓ" : "Back to Portal Choice"}
          </Link>
        </div>

      </div>
    </div>
  );
}
