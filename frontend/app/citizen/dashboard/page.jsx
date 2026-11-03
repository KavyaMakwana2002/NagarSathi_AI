"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  User, PlusCircle, Clock, CheckCircle2, Hammer, MapPin, 
  Calendar, RefreshCw, LogOut, Sparkles, AlertCircle, ArrowRight, Trash2 
} from "lucide-react";
import { getCitizenComplaints, deleteComplaint } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import { PRIORITY_CONFIG } from "@/lib/constants";
import { useSettings } from "@/context/SettingsContext";
import { formatRealDateTime } from "@/lib/formatDate";

export default function CitizenDashboardPage() {
  const router = useRouter();
  const { lang, t } = useSettings();

  const [citizen, setCitizen] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem("ns_citizen_user");
    if (!userStr) {
      router.push("/citizen/login");
      return;
    }
    try {
      const u = JSON.parse(userStr);
      setCitizen(u);
      loadComplaints(u.mobile);
    } catch (e) {
      router.push("/citizen/login");
    }
  }, []);

  const loadComplaints = async (mobileNumber) => {
    setLoading(true);
    try {
      const res = await getCitizenComplaints(mobileNumber);
      if (res.success) {
        setComplaints(res.complaints || []);
      }
    } catch (err) {
      console.error("Citizen complaints load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("ns_citizen_token");
    localStorage.removeItem("ns_citizen_user");
    router.push("/login");
  };

  const handleDeleteComplaint = async (complaintId) => {
    const confirmMsg = lang === "gu"
      ? `શું તમે ખરેખર ફરિયાદ #${complaintId} ડિલીટ કરવા માંગો છો? આ ક્રિયા પાછી વાળી શકાશે નહીં.`
      : `Are you sure you want to delete complaint #${complaintId}? This action cannot be undone.`;
    
    if (!window.confirm(confirmMsg)) return;

    setDeletingId(complaintId);
    try {
      const res = await deleteComplaint(complaintId);
      if (res.success) {
        setComplaints(prev => prev.filter(c => c.complaint_id !== complaintId));
        alert(lang === "gu" ? "ફરિયાદ સફળતાપૂર્વક ડિલીટ કરવામાં આવી છે." : "Complaint deleted successfully.");
      } else {
        alert(res.error || (lang === "gu" ? "ફરિયાદ ડિલીટ કરવામાં સમસ્યા આવી." : "Failed to delete complaint."));
      }
    } catch (err) {
      console.error("Delete complaint error:", err);
      alert(lang === "gu" ? "સર્વર સાથે કનેક્ટ થવામાં સમસ્યા આવી." : "Could not connect to backend server.");
    } finally {
      setDeletingId(null);
    }
  };

  const pendingCount = complaints.filter(c => c.status === "Pending").length;
  const inProgressCount = complaints.filter(c => c.status === "In Progress").length;
  const resolvedCount = complaints.filter(c => c.status === "Resolved").length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner / Citizen Profile Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white text-2xl shadow-lg shadow-cyan-500/25">
            👤
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {lang === "gu" ? "પ્રમાણિત નાગરિક" : "Verified Citizen"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              {lang === "gu" ? `નમસ્તે, ${citizen?.name || "નાગરિક"}` : `Welcome, ${citizen?.name || "Citizen"}`}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-2 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>{citizen?.area || "Ward Locality"}</span>
              <span>•</span>
              <span>📱 {citizen?.mobile}</span>
            </p>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-3">
          <Link
            href="/complaint"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/25 transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{lang === "gu" ? "નવી ફરિયાદ નોંધાવો" : "New Complaint"}</span>
          </Link>

          <button
            onClick={() => citizen && loadComplaints(citizen.mobile)}
            disabled={loading}
            className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title="Refresh Complaints"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={handleLogout}
            className="p-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[11px] text-slate-400 font-medium block">
            {lang === "gu" ? "કુલ ફરિયાદો" : "Total Filed"}
          </span>
          <span className="text-2xl font-black text-white mt-1 block">
            {complaints.length}
          </span>
          <span className="text-[10px] text-cyan-400 mt-1 block">
            {lang === "gu" ? "તમારા મોબાઈલ નંબર પર" : "On your registered mobile"}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[11px] text-amber-400 font-medium block">
            {lang === "gu" ? "પ્રતીક્ષામાં (Pending)" : "Pending"}
          </span>
          <span className="text-2xl font-black text-amber-400 mt-1 block">
            {pendingCount}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {lang === "gu" ? "તપાસ હેઠળ" : "Under review"}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[11px] text-blue-400 font-medium block">
            {lang === "gu" ? "કામ ચાલુ (In Progress)" : "In Progress"}
          </span>
          <span className="text-2xl font-black text-blue-400 mt-1 block">
            {inProgressCount}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {lang === "gu" ? "ટીમ સ્થળ પર" : "Work in progress"}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[11px] text-emerald-400 font-medium block">
            {lang === "gu" ? "ઉકેલાઈ ગયેલ (Resolved)" : "Resolved"}
          </span>
          <span className="text-2xl font-black text-emerald-400 mt-1 block">
            {resolvedCount}
          </span>
          <span className="text-[10px] text-emerald-400/80 mt-1 block">
            {lang === "gu" ? "સંપૂર્ણ સમાધાન" : "Completed successfully"}
          </span>
        </div>
      </div>

      {/* Complaints List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {lang === "gu" ? "મારી ફરિયાદોનો ઇતિહાસ (My Complaints)" : "My Complaints History"}
          </h2>
          <span className="text-xs text-slate-400">
            {lang === "gu" ? `${complaints.length} ફરિયાદો નોંધાયેલ` : `${complaints.length} tickets recorded`}
          </span>
        </div>

        {loading ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-cyan-400 mb-2" />
            <p className="text-xs">{lang === "gu" ? "ફરિયાદો લોડ થઈ રહી છે..." : "Loading complaints..."}</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mx-auto text-2xl">
              📝
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {lang === "gu" ? "હજી સુધી કોઈ ફરિયાદ નોંધાવી નથી" : "No complaints recorded yet"}
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {lang === "gu" ? "તમારા વિસ્તારમાં રસ્તા, કચરો કે પાણીની કોઈ સમસ્યા હોય તો તરત ફરિયાદ નોંધાવો." : "Report any civic issue in your neighborhood to get it resolved quickly."}
              </p>
            </div>
            <Link
              href="/complaint"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{lang === "gu" ? "પ્રથમ ફરિયાદ નોંધાવો" : "Register Your First Issue"}</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {complaints.map((c) => {
              const priorityMeta = PRIORITY_CONFIG[c.priority] || PRIORITY_CONFIG["Medium"];

              return (
                <div
                  key={c.complaint_id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg space-y-4 transition"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/70 border border-cyan-800/80 px-2 py-0.5 rounded">
                          #{c.complaint_id}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${priorityMeta.badgeClass}`}>
                          {lang === "gu" ? priorityMeta.labelGu : priorityMeta.labelEn}
                        </span>
                      </div>
                      <h3 className="font-bold text-base text-white mt-1">
                        {c.category}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusBadge status={c.status} />
                      
                      <Link
                        href={`/track?id=${c.complaint_id}`}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-cyan-500/20 text-cyan-400 text-xs font-semibold border border-slate-700 flex items-center gap-1 transition"
                        title={lang === "gu" ? "ફરિયાદ ટ્રેક કરો" : "Track Complaint"}
                      >
                        <span>{lang === "gu" ? "ટ્રેક" : "Track"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDeleteComplaint(c.complaint_id)}
                        disabled={deletingId === c.complaint_id}
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/25 text-red-400 hover:text-red-300 border border-red-500/30 text-xs font-semibold flex items-center gap-1 transition active:scale-95 cursor-pointer disabled:opacity-50"
                        title={lang === "gu" ? "ફરિયાદ રદ / ડિલીટ કરો" : "Delete Complaint"}
                      >
                        <Trash2 className={`w-3.5 h-3.5 ${deletingId === c.complaint_id ? "animate-spin" : ""}`} />
                        <span className="hidden sm:inline">{lang === "gu" ? "ડિલીટ" : "Delete"}</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                    "{c.description}"
                  </p>

                  {c.ai_reasoning && (
                    <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/60 text-xs text-slate-300 flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <p>
                        <span className="font-semibold text-cyan-300">AI Reasoning:</span> {c.ai_reasoning}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                    <span className="flex items-center gap-1 text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {c.area}
                    </span>
                    <span className="flex items-center gap-1 text-slate-400 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {formatRealDateTime(c.created_at)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
