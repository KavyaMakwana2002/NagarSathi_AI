"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Droplets, Waves, CheckCircle2, AlertTriangle, ShieldCheck, 
  MapPin, Clock, ArrowRight, Camera, Phone, RefreshCw, Sparkles, 
  ThumbsUp, HeartHandshake, Info, Truck, PhoneCall, Building2, User
} from "lucide-react";
import { getJalBodhReservoirs } from "@/lib/api";
import { useSettings } from "@/context/SettingsContext";

export default function CitizenWaterPage() {
  const { lang, currentUser, theme } = useSettings();
  const isDark = (theme || "dark") !== "light";
  const [reservoirs, setReservoirs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tanker Request State
  const [tankerRequested, setTankerRequested] = useState(false);

  useEffect(() => {
    async function fetchDams() {
      try {
        const data = await getJalBodhReservoirs();
        // Pick Gujarat dams
        const gujDams = data.filter((d) => d.state === "Gujarat").slice(0, 3);
        setReservoirs(gujDams.length > 0 ? gujDams : data.slice(0, 3));
      } catch (err) {
        console.warn("Dams fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDams();
  }, []);

  const wardName = currentUser?.area || (lang === "gu" ? "નવરંગપુરા (વોર્ડ ૭)" : "Navrangpura (Ward 7)");

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner - Authentic Municipal Civic Board */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xs border ${
          isDark ? "bg-blue-950/80 border-blue-800/60 text-cyan-300" : "bg-sky-50 border-sky-200 text-sky-800"
        }`}>
          <Droplets className="w-4 h-4 text-cyan-400" />
          <span>
            {lang === "gu"
              ? "અમદાવાદ મ્યુનિસિપલ કોર્પોરેશન (AMC) • દૈનિક પાણી પુરવઠા બુલેટિન"
              : "Ahmedabad Municipal Corporation (AMC) • Daily Water Supply Bulletin"}
          </span>
        </div>

        <h1 className={`text-3xl sm:text-4xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
          {lang === "gu" ? (
            <>જળ સેવા • <span className="text-cyan-400">વોર્ડ વોટર સ્ટેટસ</span></>
          ) : (
            <>Civic Water • <span className="text-cyan-400">Ward Water Status</span></>
          )}
        </h1>
        <p className={`text-sm sm:text-base ${isDark ? "text-slate-300" : "text-slate-600"}`}>
          {lang === "gu"
            ? "તમારા વોર્ડમાં પાણી વિતરણનો ચોક્કસ સમય, પાઇપલાઇન પ્રેશર અને પીવાના પાણીની ગુણવત્તા"
            : "Live distribution schedule, pipeline pressure, and potable water quality for your civic ward"}
        </p>
      </div>

      {/* Main Ward Live Status Card (Adaptive Dark / Light) */}
      <div className={`p-6 sm:p-8 rounded-3xl border relative overflow-hidden transition-colors space-y-6 ${
        isDark ? "bg-slate-900 border-slate-800 shadow-2xl text-white" : "bg-white border-slate-200 shadow-sm text-slate-900"
      }`}>
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5 ${isDark ? "border-slate-800" : "border-slate-100"}`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-600 flex items-center justify-center text-white shadow-lg">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                {lang === "gu" ? "તમારો સિવિક વોર્ડ" : "YOUR CIVIC WARD"}
              </span>
              <h2 className={`text-xl sm:text-2xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>{wardName}</h2>
              <p className="text-xs text-slate-400">પશ્ચિમ ઝોન • કોતરપુર વોટર વર્ક્સ કનેક્ટેડ</p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-950/70 border border-emerald-800/60 text-emerald-400 text-xs font-bold shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>
              {lang === "gu" ? "પુરવઠો સક્રિય: પૂરતું પ્રેશર (4.2 Bar)" : "Supply Active: Optimal Pressure (4.2 Bar)"}
            </span>
          </div>
        </div>

        {/* 3 Metric Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className={`p-4 rounded-2xl border ${isDark ? "bg-slate-950/80 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900 shadow-xs"}`}>
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>{lang === "gu" ? "દૈનિક પાણી વિતરણ સમય" : "Daily Distribution Hours"}</span>
            </div>
            <div className={`text-lg font-black ${isDark ? "text-white" : "text-slate-900"}`}>
              {lang === "gu" ? "સવારે ૬:૩૦ થી ૮:૦૦ AM" : "6:30 AM to 8:00 AM"}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {lang === "gu" ? "સાંજનો સ્લોટ: ૬:૧૫ થી ૭:૧૫ PM" : "Evening slot: 6:15 PM - 7:15 PM"}
            </p>
          </div>

          <div className={`p-4 rounded-2xl border ${isDark ? "bg-slate-950/80 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900 shadow-xs"}`}>
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{lang === "gu" ? "પીવાના પાણીની ગુણવત્તા" : "Potable Water Quality"}</span>
            </div>
            <div className="text-lg font-black text-emerald-400">
              {lang === "gu" ? "99.4% પીવાલાયક શુદ્ધ" : "99.4% Potable Purity"}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {lang === "gu" ? "TDS: 140 ppm • ક્લોરીનેશન સર્ટિફાઈડ" : "TDS: 140 ppm • Chlorination Certified"}
            </p>
          </div>

          <div className={`p-4 rounded-2xl border ${isDark ? "bg-slate-950/80 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900 shadow-xs"}`}>
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
              <Waves className="w-4 h-4 text-blue-400" />
              <span>{lang === "gu" ? "જળ સ્ત્રોત ડેમ" : "Primary Dam Source"}</span>
            </div>
            <div className={`text-lg font-black ${isDark ? "text-white" : "text-slate-900"}`}>
              {lang === "gu" ? "સરદાર સરોવર કેનાલ" : "Sardar Sarovar Canal"}
            </div>
            <p className="text-[11px] text-cyan-400 mt-0.5">
              {lang === "gu" ? "૬૪.૨% પર્યાપ્ત સંગ્રહ સ્તર" : "64.2% Adequate Reservoir Level"}
            </p>
          </div>
        </div>

        {/* Public Advisory Alert Banner - Real Municipal Human Tone */}
        <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-800/50 text-blue-200 text-xs leading-relaxed flex items-start gap-3">
          <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className={`font-bold block mb-0.5 ${isDark ? "text-white" : "text-slate-900"}`}>
              {lang === "gu" ? "અમદાવાદ મ્યુનિસિપલ કોર્પોરેશન નાગરિક સૂચના:" : "AMC Municipal Civic Advisory:"}
            </span>
            {lang === "gu"
              ? "ગરમીની ઋતુમાં પાણીનો બગાડ અટકાવો. ઘરની ઓવરહેડ ટાંકી ભરાઈ જાય ત્યારે મોટર તરત બંધ કરો. જો તમારા વિસ્તારમાં કે રસ્તા પર પાણીની લાઈનમાં લીકેજ દેખાય, તો તરત નીચેના બટનથી ફોટો પાડીને જાણ કરો જેથી રીપેર સ્ક્વોડ પહોંચી શકે."
              : "Prevent water wastage during summer. Switch off motors promptly when overhead tanks fill. If you notice any street pipeline leakage or pressure drops, please upload a photo using the button below to alert our rapid repair squad."}
          </div>
        </div>

        {/* Real Civic Contact Strip */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl border text-xs ${isDark ? "bg-slate-950 border-slate-850" : "bg-slate-50 border-slate-200 shadow-xs"}`}>
          <div className="flex items-center gap-2.5 text-slate-300">
            <PhoneCall className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block">{lang === "gu" ? "AMC વોટર હેલ્પલાઇન:" : "AMC Water Helpline:"}</span>
              <span className={`font-mono font-bold ${isDark ? "text-white" : "text-slate-900"}`}>155303 (ટોલ ફ્રી) / 079-27551234</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-slate-300">
            <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block">{lang === "gu" ? "નવરંગપુરા ઝોનલ ઓફિસ:" : "Navrangpura Zonal Office:"}</span>
              <span className={`font-mono font-bold ${isDark ? "text-white" : "text-slate-900"}`}>079-26420333 (સવારે ૧૦ થી ૬)</span>
            </div>
          </div>
        </div>

        {/* Quick Citizen Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <Link
            href="/complaint?category=Water%20Supply"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-500/25 flex items-center justify-center gap-2 active:scale-95 transition"
          >
            <Camera className="w-4 h-4" />
            <span>
              {lang === "gu" ? "🚨 પાણીની પાઇપ લીકેજ રિપોર્ટ કરો (Photo Upload)" : "🚨 Report Pipeline Leakage (Photo Upload)"}
            </span>
          </Link>

          <button
            onClick={() => setTankerRequested(true)}
            className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition cursor-pointer ${isDark ? "bg-slate-800 hover:bg-slate-700 text-cyan-300 border-slate-700" : "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 shadow-xs"}`}
          >
            <Truck className="w-4 h-4 text-cyan-400" />
            <span>
              {tankerRequested
                ? (lang === "gu" ? "ટેન્કર વિનંતી નોંધાઈ ગઈ! (ટોકન: #TK-842) ✓" : "Tanker Request Registered! (Token: #TK-842) ✓")
                : (lang === "gu" ? "ઇમરજન્સી વોટર ટેન્કર મંગાવો" : "Request Emergency Water Tanker")}
            </span>
          </button>
        </div>
      </div>

      {/* Gujarat Major Reservoirs Live Telemetry (Mini View for Citizens) */}
      <div className={`p-6 rounded-3xl border space-y-4 shadow-sm transition-colors ${isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-base sm:text-lg font-bold flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}>
              <Waves className="w-5 h-5 text-cyan-400" />
              <span>
                {lang === "gu"
                  ? "ગુજરાતના મુખ્ય જળાશયોનું જીવંત જળસ્તર"
                  : "Major Gujarat Reservoirs Live Storage Levels"}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {lang === "gu" ? "નર્મદા, જળસંપત્તિ વિભાગ અને CWC દૈનિક ગેજ ડેટા" : "Central Water Commission (CWC) & State Water Dept. Records"}
            </p>
          </div>

          <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 font-mono">
            ● {lang === "gu" ? "લાઈવ ગેજ ટેલિમેટ્રી" : "Live Gauge Telemetry"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {reservoirs.map((dam) => (
            <div key={dam.reservoir_id} className={`p-4 rounded-2xl border space-y-2 ${isDark ? "bg-slate-950 border-slate-800 text-white" : "bg-slate-50 border-slate-200 text-slate-900 shadow-xs"}`}>
              <div className="flex justify-between items-start">
                <span className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>{dam.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  {dam.status === "normal"
                    ? (lang === "gu" ? "સંતોષકારક" : "Normal")
                    : (lang === "gu" ? "વોચ લિસ્ટ" : "Watch")}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{dam.basin}</p>
              
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">{lang === "gu" ? "સંગ્રહ:" : "Storage:"}</span>
                  <span className="font-bold text-cyan-400 font-mono">{dam.current_storage_pct}%</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full"
                    style={{ width: `${dam.current_storage_pct}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Citizen Water Conservation Pledge */}
      <div className={`p-6 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors ${isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900 shadow-sm"}`}>
        <div className="space-y-1 text-center sm:text-left">
          <h4 className={`text-base font-bold flex items-center justify-center sm:justify-start gap-2 ${isDark ? "text-white" : "text-slate-900"}`}>
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>
              {lang === "gu"
                ? '"જળ એ જ જીવન" — સ્માર્ટ સિટી નાગરિક સંકલ્પ'
                : '"Water is Life" — Smart City Civic Conservation Pledge'}
            </span>
          </h4>
          <p className="text-xs text-slate-400">
            {lang === "gu"
              ? "તમારો ૧ લીટર પાણીનો બચાવ શહેરના હજારો પરિવારો સુધી પાણી પહોંચાડે છે."
              : "Every liter of water conserved ensures uninterrupted drinking supply for hundreds of urban families."}
          </p>
        </div>

        <Link
          href="/complaint"
          className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md transition active:scale-95 shrink-0"
        >
          {lang === "gu" ? "ફરિયાદ નોંધાવો →" : "Report Issue →"}
        </Link>
      </div>

    </div>
  );
}
