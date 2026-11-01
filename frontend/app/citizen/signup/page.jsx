"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Phone, Lock, MapPin, ArrowRight, AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { citizenRegister } from "@/lib/api";
import { GUJARAT_AREAS } from "@/lib/constants";
import { useSettings } from "@/context/SettingsContext";

export default function CitizenSignupPage() {
  const router = useRouter();
  const { lang, loginAsCitizen } = useSettings();

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [area, setArea] = useState(GUJARAT_AREAS[0]);
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!name || !mobile) {
      setError(lang === "gu" ? "કૃપા કરીને નામ અને મોબાઈલ નંબર દાખલ કરો." : "Name and Mobile number are required.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await citizenRegister(name, mobile, area, password);
      if (res.success) {
        loginAsCitizen(res.citizen, res.token);
        router.push("/");
      } else {
        setError(res.error || "Signup failed. Please try again.");
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
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-cyan-500/25">
            <User className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white">
            {lang === "gu" ? "નાગરિક રજીસ્ટ્રેશન" : "Citizen Registration"}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {lang === "gu" ? "તમારું નવું નાગરિક એકાઉન્ટ બનાવીને સમસ્યાઓ નોંધાવો" : "Create your citizen account to report and track civic issues"}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3.5 rounded-xl flex items-center gap-2 mb-5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {lang === "gu" ? "તમારું નામ (Citizen Full Name) *" : "Full Name *"}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="દા.ત. રમેશભાઈ પટેલ"
                required
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
          </div>

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
              {lang === "gu" ? "વિસ્તાર / વોર્ડ (Ward / Locality) *" : "Ward / Locality *"}
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
              >
                {GUJARAT_AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {lang === "gu" ? "પાસવર્ડ (Password)" : "Password"}
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 active:scale-95 transition disabled:opacity-50"
          >
            <span>{loading ? "નોંધણી થઈ રહી છે..." : (lang === "gu" ? "એકાઉન્ટ બનાવો (Register)" : "Create Account")}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400">
          <Link href="/citizen/login" className="text-cyan-400 hover:underline font-semibold">
            {lang === "gu" ? "પહેલેથી એકાઉન્ટ છે? લૉગિન કરો" : "Already have an account? Login"}
          </Link>
          <Link href="/login" className="hover:text-white transition">
            ← {lang === "gu" ? "પોર્ટલ પસંદગી" : "Back to Portals"}
          </Link>
        </div>

      </div>
    </div>
  );
}
