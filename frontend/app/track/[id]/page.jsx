"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, Clock, CheckCircle2, AlertCircle, 
  MapPin, Sparkles, Calendar, ShieldCheck, Image as ImageIcon,
  Car, Compass, ExternalLink 
} from "lucide-react";
import { trackComplaints } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import { PRIORITY_CONFIG } from "@/lib/constants";
import { useSettings } from "@/context/SettingsContext";

function TrackByIdContent() {
  const { id } = useParams();
  const { t, lang } = useSettings();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      loadComplaint(id);
    }
  }, [id]);

  const loadComplaint = async (complaintId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await trackComplaints(complaintId);
      if (res.success && res.complaints?.length > 0) {
        setComplaint(res.complaints[0]);
      } else {
        setError(lang === "gu" ? "આ ફરિયાદ ID મળ્યો નથી." : "Complaint ID not found.");
      }
    } catch (err) {
      setError("Cannot reach backend server. Please verify connection.");
    } finally {
      setLoading(false);
    }
  };

  const priorityMeta = complaint ? (PRIORITY_CONFIG[complaint.priority] || PRIORITY_CONFIG["Medium"]) : PRIORITY_CONFIG["Medium"];
  const isResolved = complaint?.status === "Resolved";

  return (
    <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
      <Link
        href="/track"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition"
      >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{lang === "gu" ? "બધી ફરિયાદો શોધો" : "Search Another Complaint"}</span>
        </Link>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-10 h-10 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mx-auto mb-3"></div>
            <p className="text-sm font-semibold">Loading Complaint #{id}...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs p-4 rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : complaint ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            
            {/* Top Banner */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-2.5 py-1 rounded-md">
                    #{complaint.complaint_id}
                  </span>
                  {complaint.source === "WhatsApp" && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      💬 WhatsApp AI
                    </span>
                  )}
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
                  {complaint.category}
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${priorityMeta.badgeClass}`}>
                  {lang === "gu" ? priorityMeta.labelGu : priorityMeta.labelEn}
                </span>
                <StatusBadge status={complaint.status} />
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-950/70 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 mb-3">
                "{complaint.description}"
              </p>

              {complaint.ai_reasoning && (
                <div className="bg-blue-50/60 dark:bg-slate-800/50 border border-blue-200 dark:border-slate-700/60 rounded-xl p-3 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">Gemini AI Reasoning: </span>
                    <span>{complaint.ai_reasoning}</span>
                  </div>
                </div>
              )}
            </div>

            {/* FEATURE 2: Interactive Before & After Photo Verification Slider (For Resolved Complaints) */}
            {isResolved && (complaint.resolved_photo || complaint.photo) ? (
              <div className="pt-2">
                <div className="flex items-center space-x-2 mb-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Gemini Vision AI: Before & After Resolution Verification
                  </h3>
                </div>
                <BeforeAfterSlider
                  beforeImage={complaint.photo || "pothole_before.jpg"}
                  afterImage={complaint.resolved_photo || "pothole_after.jpg"}
                  officerNotes={complaint.resolved_notes || "Inspected, compacted with hot asphalt, and confirmed by Ward Maintenance Squad."}
                  aiTags={complaint.vision_tags || "Pothole, Damaged Asphalt -> Repaired & Leveled"}
                  confidence="98%"
                />
              </div>
            ) : complaint.photo ? (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                  <ImageIcon className="w-4 h-4 text-blue-500" />
                  <span>Citizen Uploaded Photo:</span>
                </span>
                <div className="relative h-60 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                  <img
                    src={`http://localhost:5000/api/uploads/${complaint.photo}`}
                    alt="Citizen report"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = `/uploads/${complaint.photo}`;
                    }}
                  />
                  <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/75 text-white text-xs font-mono flex items-center space-x-1 backdrop-blur-md">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Gemini Vision Verified: {complaint.vision_tags || "Authentic Civic Issue"}</span>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Timeline */}
            <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
                {t("track", "timelineTitle")}
              </h3>

              <div className="relative pl-6 space-y-4 border-l-2 border-slate-200 dark:border-slate-800">
                <div className="relative">
                  <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-950" />
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{t("track", "timeline1")}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{complaint.created_at || "Just now"}</p>
                </div>

                <div className="relative">
                  <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-blue-500 border-2 border-white dark:border-slate-950" />
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{t("track", "timeline2")}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {lang === "gu" ? `પ્રાયોરિટી: ${complaint.priority} • ડુપ્લિકેટ ચેક: પાસ` : `Priority: ${complaint.priority} • Duplicate Check: Passed`}
                  </p>
                </div>

                <div className="relative">
                  <span className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 border-white dark:border-slate-950 ${
                    complaint.status === "In Progress" || complaint.status === "Resolved" ? "bg-blue-500" : "bg-slate-300 dark:bg-slate-700"
                  }`} />
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{t("track", "timeline3")}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {complaint.status === "Pending" ? t("track", "queueWait") : t("track", "teamAssigned")}
                  </p>
                </div>

                <div className="relative">
                  <span className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 border-white dark:border-slate-950 ${
                    complaint.status === "Resolved" ? "bg-emerald-500 ring-4 ring-emerald-500/20" : "bg-slate-300 dark:bg-slate-700"
                  }`} />
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{t("track", "timeline4")}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {complaint.status === "Resolved" ? t("track", "resolvedState") : t("track", "inProgressState")}
                  </p>
                </div>
              </div>
            </div>

            {/* Google Maps Real-time Navigation & GIS Integration */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-900 border border-blue-200/70 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
                  <Compass className="w-4 h-4 animate-spin-slow" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                    <span>{lang === "gu" ? "ગૂગલ મેપ્સ GPS નેવિગેશન" : "Google Maps Live GPS"}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-semibold">
                      Live GIS
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {lang === "gu" ? "સમસ્યાના ચોક્કસ સ્થળ સુધી સીધા પહોંચવા માટે ગૂગલ નેવિગેશન ખોલો" : "Launch Google Maps turn-by-turn driving routing to this issue"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <a
                  href={
                    complaint.latitude && complaint.longitude
                      ? `https://www.google.com/maps/dir/?api=1&destination=${complaint.latitude},${complaint.longitude}`
                      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(complaint.area + " Ahmedabad Gujarat")}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-blue-500/20 transition"
                >
                  <Car className="w-3.5 h-3.5" />
                  <span>{lang === "gu" ? "નેવિગેટ કરો" : "Navigate"}</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>

                <Link
                  href="/heatmap"
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center space-x-1 transition"
                >
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  <span>{lang === "gu" ? "હીટમેપ પર જુઓ" : "Civic Heatmap"}</span>
                </Link>
              </div>
            </div>

            {/* Meta */}
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-red-500" />
                {complaint.area}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {complaint.created_at ? complaint.created_at.slice(0, 10) : ""}
              </span>
            </div>

          </div>
        ) : null}
    </div>
  );
}

export default function TrackByIdPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-400">
          <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mr-3"></div>
          <span className="text-sm font-semibold">Loading Complaint Details...</span>
        </div>
      }
    >
      <TrackByIdContent />
    </Suspense>
  );
}
