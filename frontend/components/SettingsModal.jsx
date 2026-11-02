"use client";

import React, { useState } from "react";
import { 
  X, Settings, Moon, Sun, Languages, Type, Volume2, VolumeX, 
  Trash2, Check, Sparkles, CheckCircle2 
} from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

export default function SettingsModal() {
  const { 
    isSettingsOpen, 
    closeSettings, 
    lang, 
    setLang, 
    theme, 
    setTheme, 
    fontSize, 
    setFontSize, 
    sound, 
    setSound, 
    t 
  } = useSettings();

  const [resetStatus, setResetStatus] = useState(false);

  if (!isSettingsOpen) return null;

  const handleClearCache = () => {
    localStorage.removeItem("ns_admin_token");
    localStorage.removeItem("ns_admin_user");
    setResetStatus(true);
    setTimeout(() => {
      setResetStatus(false);
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden space-y-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Accent */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">
                {t("settings", "title")}
              </h2>
              <p className="text-[11px] text-slate-400">
                {t("settings", "subtitle")}
              </p>
            </div>
          </div>

          <button
            onClick={closeSettings}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 transition active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Language Switcher */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
            <Languages className="w-4 h-4 text-cyan-400" />
            <span>{t("settings", "langTitle")}</span>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setLang("gu")}
              className={`p-3.5 rounded-2xl border flex items-center justify-between text-left transition active:scale-95 ${
                lang === "gu"
                  ? "bg-cyan-950/60 border-cyan-500 text-white shadow-md shadow-cyan-500/20"
                  : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
              }`}
            >
              <div>
                <span className="text-sm font-bold block">🇮🇳 ગુજરાતી</span>
                <span className="text-[10px] text-slate-400">ગુજરાતી ભાષા (Default)</span>
              </div>
              {lang === "gu" && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
            </button>

            <button
              type="button"
              onClick={() => setLang("en")}
              className={`p-3.5 rounded-2xl border flex items-center justify-between text-left transition active:scale-95 ${
                lang === "en"
                  ? "bg-cyan-950/60 border-cyan-500 text-white shadow-md shadow-cyan-500/20"
                  : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
              }`}
            >
              <div>
                <span className="text-sm font-bold block">🇬🇧 English</span>
                <span className="text-[10px] text-slate-400">English Language</span>
              </div>
              {lang === "en" && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
            </button>
          </div>
        </div>

        {/* Section 2: Dark / Light Mode */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
            <Moon className="w-4 h-4 text-amber-400" />
            <span>{t("settings", "themeTitle")}</span>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`p-3.5 rounded-2xl border flex items-center justify-between transition active:scale-95 ${
                theme === "dark"
                  ? "bg-slate-950 border-cyan-500 text-white shadow-md shadow-cyan-500/20 ring-1 ring-cyan-500"
                  : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400">
                  <Moon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold block text-white">Dark Mode</span>
                  <span className="text-[10px] text-slate-400">{t("settings", "themeDark")}</span>
                </div>
              </div>
              {theme === "dark" && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
            </button>

            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`p-3.5 rounded-2xl border flex items-center justify-between transition active:scale-95 ${
                theme === "light"
                  ? "bg-amber-500/10 border-amber-500 text-slate-900 shadow-md shadow-amber-500/20 ring-1 ring-amber-500"
                  : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500">
                  <Sun className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold block text-white">Light Mode</span>
                  <span className="text-[10px] text-slate-400">{t("settings", "themeLight")}</span>
                </div>
              </div>
              {theme === "light" && <Check className="w-4 h-4 text-amber-500 shrink-0" />}
            </button>
          </div>
        </div>

        {/* Section 3: Accessibility & Font Sizing */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
            <Type className="w-4 h-4 text-purple-400" />
            <span>{t("settings", "accessTitle")}</span>
          </label>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-3.5">
            {/* Font scale */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-200 block">
                  {t("settings", "fontScale")}
                </span>
                <span className="text-[10px] text-slate-400">
                  {fontSize === "large" ? t("settings", "fontLarge") : t("settings", "fontNormal")}
                </span>
              </div>

              <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setFontSize("normal")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    fontSize === "normal"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  A (Normal)
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize("large")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    fontSize === "large"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  A+ (Large)
                </button>
              </div>
            </div>

            {/* Sound alert */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                {sound ? (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-500" />
                )}
                <div>
                  <span className="text-xs font-bold text-slate-200 block">
                    {t("settings", "soundTitle")}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {sound ? t("settings", "soundOn") : t("settings", "soundOff")}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSound(!sound)}
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                  sound ? "bg-cyan-500" : "bg-slate-800"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    sound ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Section 4: Demo Cache Management */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-300 block">
              {t("settings", "resetTitle")}
            </span>
            <span className="text-[10px] text-slate-400">
              {resetStatus ? t("settings", "resetDone") : "Clear login state & reload"}
            </span>
          </div>

          <button
            type="button"
            onClick={handleClearCache}
            disabled={resetStatus}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 text-xs font-semibold border border-slate-700 transition active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t("settings", "resetBtn")}</span>
          </button>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={closeSettings}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs shadow-lg shadow-blue-500/20 transition active:scale-95"
        >
          {t("settings", "saveBtn")}
        </button>

      </div>
    </div>
  );
}
