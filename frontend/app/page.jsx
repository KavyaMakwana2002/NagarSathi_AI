"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Sparkles, PlusCircle, Search, ShieldCheck, CheckCircle2, 
  MapPin, AlertTriangle, ArrowRight, Activity, Cpu, Layers, User
} from "lucide-react";
import { CIVIC_CATEGORIES } from "@/lib/constants";
import { useSettings } from "@/context/SettingsContext";
import PortalChoice from "@/components/PortalChoice";

export default function RootPage() {
  const router = useRouter();
  const { t, lang, authRole, currentUser, mounted } = useSettings();

  // If Admin is logged in, automatically navigate to Admin Dashboard
  useEffect(() => {
    if (mounted && authRole === "admin") {
      router.push("/admin/dashboard");
    }
  }, [mounted, authRole]);

  // Loading state while checking local session
  if (!mounted) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center text-slate-400">
        <Sparkles className="w-5 h-5 animate-spin text-cyan-400 mr-2" />
        <span className="text-sm">Loading NagarSathi AI...</span>
      </div>
    );
  }

  // If admin, show quick redirect feedback
  if (authRole === "admin") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-purple-950/80 border border-purple-800 text-purple-400 flex items-center justify-center text-3xl shadow-lg">
          🏛️
        </div>
        <h2 className="text-xl font-bold text-white">
          {lang === "gu" ? "મ્યુનિસિપલ કમાન્ડ રૂમમાં રીડાયરેક્ટ થઈ રહ્યું છે..." : "Redirecting to Municipal Admin Dashboard..."}
        </h2>
        <Link
          href="/admin/dashboard"
          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg"
        >
          {lang === "gu" ? "એડમિન ડેશબોર્ડ ખોલો →" : "Open Admin Dashboard →"}
        </Link>
      </div>
    );
  }

  // =========================================================================
  // FULL ATTRACTIVE SMART CITY LANDING PAGE (Citizens & Visitors)
  // =========================================================================
  return (
    <div className="space-y-12">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80 bg-gradient-to-b from-blue-950/40 via-slate-950 to-slate-950">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          
          {/* Greeting Badge: Personalized for Citizen, or Hackathon Badge for Guests */}
          {authRole === "citizen" && currentUser ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 text-xs font-semibold mb-6 shadow-sm">
              <User className="w-3.5 h-3.5" />
              <span>
                {lang === "gu" ? `નમસ્તે, ${currentUser?.name || "નાગરિક"} (${currentUser?.area || "વોર્ડ ૭"})` : `Welcome, ${currentUser?.name || "Citizen"} (${currentUser?.area || "Ward 7"})`}
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 text-xs font-semibold mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t("home", "badge") || "Smart Society & Social Impact Hackathon Project"}</span>
            </div>
          )}

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight mb-4">
            {t("home", "heroTitle1")} <br className="sm:hidden" />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              {t("home", "heroTitle2")}
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-8 font-medium leading-relaxed">
            {t("home", "heroDesc")}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/complaint"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <PlusCircle className="w-5 h-5" />
              <span>{t("home", "reportBtn")}</span>
            </Link>

            <Link
              href="/track"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <Search className="w-5 h-5 text-cyan-400" />
              <span>{t("home", "trackBtn")}</span>
            </Link>

            {authRole === "guest" && (
              <Link
                href="/login"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition"
              >
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <span>{lang === "gu" ? "લૉગિન પોર્ટલ →" : "Login Portal →"}</span>
              </Link>
            )}
          </div>

        </div>
      </section>

      {/* Real-time Quick Stats Bar */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>{t("home", "statTotal")}</span>
            </div>
            <div className="text-2xl font-black text-white">1,248+</div>
            <p className="text-[11px] text-cyan-400 mt-0.5">{t("home", "statTotalSub")}</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{t("home", "statResolved")}</span>
            </div>
            <div className="text-2xl font-black text-emerald-400">92.4%</div>
            <p className="text-[11px] text-slate-400 mt-0.5">{t("home", "statResolvedSub")}</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
              <Cpu className="w-4 h-4 text-purple-400" />
              <span>{t("home", "statAccuracy")}</span>
            </div>
            <div className="text-2xl font-black text-purple-400">98%</div>
            <p className="text-[11px] text-slate-400 mt-0.5">{t("home", "statAccuracySub")}</p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>{t("home", "statDuplicates")}</span>
            </div>
            <div className="text-2xl font-black text-amber-400">340+</div>
            <p className="text-[11px] text-slate-400 mt-0.5">{t("home", "statDuplicatesSub")}</p>
          </div>
        </div>
      </section>

      {/* If Guest: Choose Your Portal Showcase Section */}
      {authRole === "guest" && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-sm shadow-xl">
            <div className="text-center mb-6">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                {t("portal", "badge")}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                {t("portal", "chooseTitle")}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {t("portal", "chooseSub")}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Citizen Card */}
              <div className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-6 transition flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white text-2xl shadow-md group-hover:scale-105 transition">
                    👤
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition">
                    {t("portal", "citizenTitle")}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {t("portal", "citizenDesc")}
                  </p>
                </div>
                <div className="mt-5 flex items-center gap-3">
                  <Link
                    href="/citizen/login"
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold text-center shadow-md active:scale-95 transition"
                  >
                    {t("portal", "citizenLoginBtn")}
                  </Link>
                  <Link
                    href="/citizen/signup"
                    className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold text-center border border-slate-700 active:scale-95 transition"
                  >
                    {t("portal", "citizenSignupBtn")}
                  </Link>
                </div>
              </div>

              {/* Admin Card */}
              <div className="bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 rounded-2xl p-6 transition flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white text-2xl shadow-md group-hover:scale-105 transition">
                    🏛️
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition">
                    {t("portal", "adminTitle")}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {t("portal", "adminDesc")}
                  </p>
                </div>
                <div className="mt-5">
                  <Link
                    href="/admin/login"
                    className="w-full block py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold text-center shadow-md active:scale-95 transition"
                  >
                    {t("portal", "adminLoginBtn")}
                  </Link>
                  <p className="text-[10px] text-slate-500 text-center mt-2">
                    {t("portal", "adminCreds")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3 Major Innovations & Social Impact Showcase Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-500 uppercase tracking-wider">
              <span>🚀</span>
              <span>100-Point Hackathon Innovations & Social Impact</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
              {lang === "gu" ? "અદ્યતન AI વિશેષતાઓ (Advanced AI Features)" : "Flagship AI Civic Innovations"}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. GIS Heatmap */}
          <Link
            href="/heatmap"
            className="group relative rounded-3xl p-6 bg-gradient-to-br from-red-950/40 via-slate-900 to-slate-900 border border-red-500/30 hover:border-red-400 transition shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-600 flex items-center justify-center text-2xl text-white shadow-lg mb-4 group-hover:scale-105 transition">
                🗺️
              </div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white group-hover:text-red-300 transition">
                  {lang === "gu" ? "જીઆઈએસ સિવિક હીટમેપ" : "Interactive Civic Heatmap"}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-900/60 text-red-300">
                  LIVE GPS
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {lang === "gu"
                  ? "અમદાવાદ અને ગુજરાતના તમામ વોર્ડમાં સમસ્યાઓનું રીઅલ-ટાઇમ જીપીએસ હોટસ્પોટ વિશ્લેષણ અને સંવેદનશીલ ઝોન મોનિટરિંગ."
                  : "Geospatial GIS heat circles plotting civic hazards across Ahmedabad & Gujarat wards with category filtering."}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-red-400 text-xs font-bold flex items-center justify-between">
              <span>{lang === "gu" ? "લાઇવ મેપ જુઓ →" : "Explore Heatmap →"}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* 2. Gemini Vision Before-After Verification */}
          <Link
            href="/track/NS-RD8821"
            className="group relative rounded-3xl p-6 bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-900 border border-blue-500/30 hover:border-blue-400 transition shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-2xl text-white shadow-lg mb-4 group-hover:scale-105 transition">
                🔍
              </div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition">
                  {lang === "gu" ? "Gemini Vision AI વેરિફિકેશન" : "Vision AI Before & After"}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-900/60 text-blue-300">
                  MULTIMODAL
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {lang === "gu"
                  ? "સમસ્યા પહેલાં અને નિરાકરણ પછીના ફોટોની સ્લાઇડર સરખામણી અને બનાવટી ફરિયાદો અટકાવતું AI વેરિફિકેશન."
                  : "Interactive Before/After slider verification verifying municipal repair work with multimodal proof of resolution."}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-cyan-400 text-xs font-bold flex items-center justify-between">
              <span>{lang === "gu" ? "ડેમો સ્લાઇડર જુઓ →" : "Test Before/After Slider →"}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* 3. WhatsApp AI Civic Bot */}
          <Link
            href="/whatsapp"
            className="group relative rounded-3xl p-6 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 hover:border-emerald-400 transition shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-2xl text-white shadow-lg mb-4 group-hover:scale-105 transition">
                💬
              </div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition">
                  {lang === "gu" ? "WhatsApp AI Civic Bot" : "WhatsApp Civic Bot"}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-900/60 text-emerald-300">
                  SOCIAL IMPACT
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {lang === "gu"
                  ? "કોઈપણ નવી એપ વગર વડીલો અને સામાન્ય નાગરિકો વોટ્સએપ પર ગુજરાતીમાં ફોટો અને વોઇસ મોકલીને સીધી ફરિયાદ નોંધાવી શકે છે."
                  : "Empowering elderly & daily-wage citizens to report issues natively via WhatsApp in Gujarati with automated ticket creation."}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 text-emerald-400 text-xs font-bold flex items-center justify-between">
              <span>{lang === "gu" ? "વોટ્સએપ ચેટ શરૂ કરો →" : "Launch WhatsApp Bot →"}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>
        </div>
      </section>

      {/* Civic Categories Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              {t("home", "categoriesTitle")}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              {t("home", "categoriesSub")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {CIVIC_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/complaint?category=${encodeURIComponent(cat.id)}`}
              className="bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 p-4 rounded-2xl transition group flex flex-col justify-between"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${cat.color} flex items-center justify-center text-white mb-3 shadow-md group-hover:scale-105 transition`}>
                <span className="text-lg">🏛️</span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-white group-hover:text-cyan-300 transition">
                  {lang === "gu" ? cat.labelGu : cat.labelEn}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {lang === "gu" ? cat.labelEn : cat.labelGu}
                </p>
              </div>
              <div className="mt-3 text-cyan-400 text-xs font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                <span>{t("home", "reportIssueText")}</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works - 3 Step Flow */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-10">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              {t("home", "howItWorksTitle")}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {t("home", "howItWorksSub")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl relative">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                ૧
              </div>
              <h3 className="font-bold text-white text-base mb-1.5">
                {t("home", "step1Title")}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t("home", "step1Desc")}
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl relative">
              <div className="w-8 h-8 rounded-full bg-cyan-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                ૨
              </div>
              <h3 className="font-bold text-white text-base mb-1.5">
                {t("home", "step2Title")}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t("home", "step2Desc")}
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl relative">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                ૩
              </div>
              <h3 className="font-bold text-white text-base mb-1.5">
                {t("home", "step3Title")}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t("home", "step3Desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
