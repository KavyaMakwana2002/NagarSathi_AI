"use client";

import Link from "next/link";
import { 
  User, ShieldCheck, ArrowRight, CheckCircle2, Lock, 
  Sparkles, Building2, Smartphone
} from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

export default function PortalChoice() {
  const { t } = useSettings();

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 space-y-10">
      
      {/* Hero Header */}
      <section className="max-w-4xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-800/60 text-cyan-400 text-xs font-semibold shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t("portal", "badge")}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          {t("portal", "heroTitle")}
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          {t("portal", "heroSubtitle")}
        </p>
      </section>

      {/* Portal Selection Cards */}
      <main className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            {t("portal", "chooseTitle")}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {t("portal", "chooseSub")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">

          {/* =========================================
              CARD 1: CITIZEN PORTAL (શહેરના નાગરિકો માટે)
             ========================================= */}
          <div className="bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group">
            
            {/* Card Header Gradient */}
            <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-500 p-7 sm:p-8 text-white text-center relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
              
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl mx-auto mb-3 shadow-inner">
                👤
              </div>
              <h3 className="text-2xl font-black tracking-tight">
                {t("portal", "citizenTitle")}
              </h3>
              <p className="text-cyan-100 text-xs sm:text-sm mt-1 font-medium">
                {t("portal", "citizenTagline")}
              </p>
            </div>

            {/* Card Content */}
            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
              
              <div>
                <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <span>{t("portal", "citizenWelcome")}</span>
                </h4>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                  {t("portal", "citizenDesc")}
                </p>

                {/* Feature Bullet Points */}
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{t("portal", "citizenF1")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{t("portal", "citizenF2")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{t("portal", "citizenF3")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{t("portal", "citizenF4")}</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <Link
                  href="/citizen/login"
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm text-center flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition active:scale-95"
                >
                  <span>{t("portal", "citizenLoginBtn")}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/citizen/signup"
                  className="w-full py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-cyan-400 border border-slate-700 hover:border-cyan-500/50 font-bold text-xs sm:text-sm text-center block transition active:scale-95"
                >
                  {t("portal", "citizenSignupBtn")}
                </Link>
              </div>

            </div>
          </div>


          {/* =========================================
              CARD 2: MUNICIPAL ADMIN (મ્યુનિસિપલ વહીવટી તંત્ર)
             ========================================= */}
          <div className="bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group">
            
            {/* Card Header Gradient */}
            <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 p-7 sm:p-8 text-white text-center relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
              
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl mx-auto mb-3 shadow-inner">
                🏛️
              </div>
              <h3 className="text-2xl font-black tracking-tight">
                {t("portal", "adminTitle")}
              </h3>
              <p className="text-purple-100 text-xs sm:text-sm mt-1 font-medium">
                {t("portal", "adminTagline")}
              </p>
            </div>

            {/* Card Content */}
            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
              
              <div>
                <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <span>{t("portal", "adminWelcome")}</span>
                </h4>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                  {t("portal", "adminDesc")}
                </p>

                {/* Feature Bullet Points */}
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span>{t("portal", "adminF1")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span>{t("portal", "adminF2")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span>{t("portal", "adminF3")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span>{t("portal", "adminF4")}</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <Link
                  href="/admin/login"
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm text-center flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 transition active:scale-95"
                >
                  <span>{t("portal", "adminLoginBtn")}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="text-center bg-purple-950/40 border border-purple-800/40 rounded-xl p-3 text-xs text-purple-300 space-y-0.5">
                  <p className="font-semibold flex items-center justify-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-purple-400" />
                    <span>{t("portal", "adminNote")}</span>
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {t("portal", "adminCreds")}
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

    </div>
  );
}
