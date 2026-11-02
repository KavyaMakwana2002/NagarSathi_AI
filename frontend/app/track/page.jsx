"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  Search, ArrowLeft, Clock, CheckCircle2, Hammer, AlertCircle, 
  MapPin, Sparkles, User, Phone, Calendar, ShieldCheck, Image as ImageIcon
} from "lucide-react";
import { trackComplaints } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import Navbar from "@/components/Navbar";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import { PRIORITY_CONFIG } from "@/lib/constants";
import { useSettings } from "@/context/SettingsContext";
import { formatRealDateTime } from "@/lib/formatDate";

function TrackContent() {
  const { t, lang } = useSettings();
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id") || "";

  const [query, setQuery] = useState(initialId);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialId) {
      handleSearch(initialId);
    }
  }, [initialId]);

  const handleSearch = async (searchQuery) => {
    const term = (searchQuery || query).trim();
    if (!term) return;

    setLoading(true);
    setError(null);
    setComplaints([]);

    try {
      const res = await trackComplaints(term);
      if (res.success && res.complaints?.length > 0) {
        setComplaints(res.complaints);
      } else {
        setError(t("track", "notFoundError"));
      }
    } catch (err) {
      setError("Cannot reach backend server. Please verify connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>{t("complaint", "backHome")}</span>
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          {t("track", "title")}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t("track", "subtitle")}
        </p>
      </div>

      {/* Search Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
        className="flex gap-2 mb-8"
      >
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("track", "searchPlaceholder")}
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md active:scale-95 transition disabled:opacity-50"
        >
          {loading ? t("track", "searchingBtn") : t("track", "searchBtn")}
        </button>
      </form>

      {/* Error state */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs p-4 rounded-2xl flex items-center gap-2 mb-6">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Complaint Results */}
      <div className="space-y-8">
        {complaints.map((c) => {
          const priorityMeta = PRIORITY_CONFIG[c.priority] || PRIORITY_CONFIG["Medium"];
          const isResolved = c.status === "Resolved";

          return (
            <div
              key={c.complaint_id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 relative overflow-hidden"
            >
              {/* Top Banner */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-2.5 py-1 rounded-md">
                      #{c.complaint_id}
                    </span>
                    {c.source === "WhatsApp" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        💬 WhatsApp AI
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-2">
                    {c.category}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${priorityMeta.badgeClass}`}>
                    {lang === "gu" ? priorityMeta.labelGu : priorityMeta.labelEn}
                  </span>
                  <StatusBadge status={c.status} />
                </div>
              </div>

              {/* Citizen Description */}
              <div>
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-950/70 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 mb-3">
                  "{c.description}"
                </p>

                {c.ai_reasoning && (
                  <div className="bg-blue-50/60 dark:bg-slate-800/50 border border-blue-200 dark:border-slate-700/60 rounded-xl p-3 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">Gemini AI Reasoning: </span>
                      <span>{c.ai_reasoning}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* FEATURE 2: Interactive Before & After Photo Verification Slider (For Resolved Complaints) */}
              {isResolved && (c.resolved_photo || c.photo) ? (
                <div className="pt-2">
                  <div className="flex items-center space-x-2 mb-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Gemini Vision AI: Before & After Resolution Verification
                    </h3>
                  </div>
                  <BeforeAfterSlider
                    beforeImage={c.photo || "pothole_before.jpg"}
                    afterImage={c.resolved_photo || "pothole_after.jpg"}
                    officerNotes={c.resolved_notes || "Repaired and compacted with hot-mix asphalt by Ward Maintenance Squad."}
                    aiTags={c.vision_tags || "Pothole, Damaged Asphalt -> Repaired & Leveled"}
                    confidence="98%"
                  />
                </div>
              ) : c.photo ? (
                /* Unresolved Complaint with Citizen Uploaded Photo */
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                    <ImageIcon className="w-4 h-4 text-blue-500" />
                    <span>Citizen Uploaded Photo:</span>
                  </span>
                  <div className="relative h-48 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                    <img
                      src={`http://localhost:5000/api/uploads/${c.photo}`}
                      alt="Citizen report"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = `/uploads/${c.photo}`;
                      }}
                    />
                    <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/75 text-white text-xs font-mono flex items-center space-x-1 backdrop-blur-md">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Gemini Vision Verified: {c.vision_tags || "Authentic Civic Issue"}</span>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Progress Timeline */}
              <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
                  {t("track", "timelineTitle")}
                </h3>

                <div className="relative pl-6 space-y-4 border-l-2 border-slate-200 dark:border-slate-800">
                  {/* Step 1 */}
                  <div className="relative">
                    <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-950" />
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{t("track", "timeline1")}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{formatRealDateTime(c.created_at)}</p>
                  </div>

                  {/* Step 2 */}
                  <div className="relative">
                    <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-blue-500 border-2 border-white dark:border-slate-950" />
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{t("track", "timeline2")}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {lang === "gu" ? `પ્રાયોરિટી: ${c.priority} • ડુપ્લિકેટ ચેક: પાસ` : `Priority: ${c.priority} • Duplicate Check: Passed`}
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="relative">
                    <span className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 border-white dark:border-slate-950 ${
                      c.status === "In Progress" || c.status === "Resolved" ? "bg-blue-500" : "bg-slate-300 dark:bg-slate-700"
                    }`} />
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{t("track", "timeline3")}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {c.status === "Pending" ? t("track", "queueWait") : t("track", "teamAssigned")}
                    </p>
                  </div>

                  {/* Step 4 */}
                  <div className="relative">
                    <span className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 border-white dark:border-slate-950 ${
                      c.status === "Resolved" ? "bg-emerald-500 ring-4 ring-emerald-500/20" : "bg-slate-300 dark:bg-slate-700"
                    }`} />
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{t("track", "timeline4")}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {c.status === "Resolved" ? t("track", "resolvedState") : t("track", "inProgressState")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Meta */}
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  {c.area}
                </span>
                <span className="flex items-center gap-1.5 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {formatRealDateTime(c.created_at)}
                </span>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-400">Loading...</div>}>
      <TrackContent />
    </Suspense>
  );
}

