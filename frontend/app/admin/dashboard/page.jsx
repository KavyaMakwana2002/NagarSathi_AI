"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ShieldCheck, Activity, CheckCircle2, Clock, AlertTriangle, 
  Layers, RefreshCw, Filter, Search, ChevronRight, LogOut, Sparkles, MapPin, Settings, Camera, Upload, X, SlidersHorizontal
} from "lucide-react";
import { getAdminStats, getComplaints, updateComplaintStatus } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import { PRIORITY_CONFIG } from "@/lib/constants";
import { useSettings } from "@/context/SettingsContext";
import { formatRealDateTime } from "@/lib/formatDate";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { t, lang, openSettings } = useSettings();

  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [resolveModalComplaint, setResolveModalComplaint] = useState(null);
  const [resolvePhotoFile, setResolvePhotoFile] = useState(null);
  const [resolveNotes, setResolveNotes] = useState("");
  const [resolving, setResolving] = useState(false);
  const [expandedSliderId, setExpandedSliderId] = useState(null);

  useEffect(() => {
    // Check local storage for mock auth
    const token = localStorage.getItem("ns_admin_token");
    if (!token) {
      router.push("/admin/login");
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, complaintsRes] = await Promise.all([
        getAdminStats(),
        getComplaints()
      ]);
      if (statsRes.success) setStats(statsRes.metrics);
      if (complaintsRes.success) setComplaints(complaintsRes.complaints);
    } catch (err) {
      console.error("Dashboard data error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (complaintId, nextStatus) => {
    if (nextStatus === "Resolved") {
      const comp = complaints.find((c) => c.complaint_id === complaintId);
      if (comp) {
        setResolveModalComplaint(comp);
        setResolveNotes("Work completed by Municipal Maintenance Squad. Inspected and approved.");
        return;
      }
    }

    setUpdatingId(complaintId);
    try {
      const res = await updateComplaintStatus(complaintId, nextStatus);
      if (res.success) {
        setComplaints((prev) =>
          prev.map((c) =>
            c.complaint_id === complaintId ? { ...c, status: nextStatus } : c
          )
        );
        const statsRes = await getAdminStats();
        if (statsRes.success) setStats(statsRes.metrics);
      }
    } catch (err) {
      alert("Failed to update status. Please verify backend.");
    } finally {
      setUpdatingId(null);
    }
  };

  const submitResolutionWithProof = async (e) => {
    e.preventDefault();
    if (!resolveModalComplaint) return;

    setResolving(true);
    try {
      const formData = new FormData();
      formData.append("resolved_notes", resolveNotes || "Resolved by Municipal Maintenance Squad.");
      if (resolvePhotoFile) {
        formData.append("resolved_photo", resolvePhotoFile);
      } else {
        // Fallback default demo after photo if none chosen
        formData.append("resolved_photo", "pothole_after.jpg");
      }

      const res = await fetch(`http://localhost:5000/api/admin/complaints/${resolveModalComplaint.complaint_id}/resolve`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setComplaints((prev) =>
          prev.map((c) =>
            c.complaint_id === resolveModalComplaint.complaint_id
              ? { ...c, status: "Resolved", resolved_photo: data.complaint.resolved_photo, resolved_notes: resolveNotes }
              : c
          )
        );
        setResolveModalComplaint(null);
        setResolvePhotoFile(null);
        // Refresh stats
        const statsRes = await getAdminStats();
        if (statsRes.success) setStats(statsRes.metrics);
      } else {
        alert(data.error || "Failed to resolve complaint.");
      }
    } catch (err) {
      alert("Error submitting resolution proof.");
    } finally {
      setResolving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("ns_admin_token");
    localStorage.removeItem("ns_admin_user");
    router.push("/admin/login");
  };

  const filteredComplaints = complaints.filter((c) => {
    const matchesStatus =
      filterStatus === "All"
        ? true
        : filterStatus === "Urgent"
        ? c.priority === "High" && c.status !== "Resolved"
        : c.status === filterStatus;

    const matchesSearch =
      !searchTerm ||
      c.complaint_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>{t("admin", "controlRoom")}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            {t("admin", "dashboardTitle")}
          </h1>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <Link
            href="/heatmap"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-bold shadow-md transition"
          >
            <span>🗺️</span>
            <span>GIS Heatmap</span>
          </Link>

          <Link
            href="/whatsapp"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition"
          >
            <span>💬</span>
            <span>WhatsApp Bot</span>
          </Link>

          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>{t("admin", "refreshBtn")}</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[11px] text-slate-400 font-medium block">{t("admin", "kpiTotal")}</span>
          <span className="text-2xl font-black text-white mt-1 block">
            {stats?.total ?? 0}
          </span>
          <span className="text-[10px] text-cyan-400 mt-1 block">100% Recorded</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[11px] text-amber-400 font-medium block">{t("admin", "kpiPending")}</span>
          <span className="text-2xl font-black text-amber-400 mt-1 block">
            {stats?.pending ?? 0}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">Awaiting Action</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[11px] text-blue-400 font-medium block">{t("admin", "kpiInProgress")}</span>
          <span className="text-2xl font-black text-blue-400 mt-1 block">
            {stats?.in_progress ?? 0}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">Team on Ground</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[11px] text-emerald-400 font-medium block">{t("admin", "kpiResolved")}</span>
          <span className="text-2xl font-black text-emerald-400 mt-1 block">
            {stats?.resolved ?? 0}
          </span>
          <span className="text-[10px] text-emerald-400/80 mt-1 block">{stats?.resolution_rate ?? 0}% Rate</span>
        </div>

        <div className="bg-slate-900 border border-red-900/40 p-4 rounded-2xl bg-red-950/20">
          <span className="text-[11px] text-red-400 font-bold block flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {t("admin", "kpiUrgent")}
          </span>
          <span className="text-2xl font-black text-red-400 mt-1 block">
            {stats?.urgent ?? 0}
          </span>
          <span className="text-[10px] text-red-400/80 mt-1 block">Immediate Action</span>
        </div>

        <div className="bg-slate-900 border border-cyan-900/40 p-4 rounded-2xl bg-cyan-950/20">
          <span className="text-[11px] text-cyan-400 font-bold block flex items-center gap-1">
            <Layers className="w-3 h-3" />
            {t("admin", "kpiDuplicates")}
          </span>
          <span className="text-2xl font-black text-cyan-400 mt-1 block">
            {stats?.duplicates_prevented ?? 0}
          </span>
          <span className="text-[10px] text-cyan-400/80 mt-1 block">AI Time Saved</span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {["All", "Urgent", "Pending", "In Progress", "Resolved"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                filterStatus === tab
                  ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                  : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
              }`}
            >
              {tab === "All"
                ? t("admin", "filterAll")
                : tab === "Urgent"
                ? t("admin", "filterUrgent")
                : tab === "Pending"
                ? t("admin", "filterPending")
                : tab === "In Progress"
                ? t("admin", "filterInProgress")
                : t("admin", "filterResolved")}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t("admin", "searchPlaceholder")}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Complaints List / Table */}
      <div className="space-y-4">
        {filteredComplaints.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center text-slate-400">
            {lang === "gu" ? "કોઈ ફરિયાદ મળી નથી." : "No complaints found."}
          </div>
        ) : (
          filteredComplaints.map((c) => {
            const priorityMeta = PRIORITY_CONFIG[c.priority] || PRIORITY_CONFIG["Medium"];

            return (
              <div
                key={c.complaint_id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg transition space-y-3"
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
                      {c.is_duplicate && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          ⚡ {t("admin", "duplicateBadge")} ({c.upvotes_count} {t("admin", "citizensCount")})
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-base text-white mt-1">
                      {c.category}
                    </h3>
                  </div>

                  {/* Quick Action Status Selector */}
                  <div className="flex items-center gap-2">
                    <StatusBadge status={c.status} />

                    {c.status === "Resolved" && (
                      <button
                        onClick={() =>
                          setExpandedSliderId(
                            expandedSliderId === c.complaint_id ? null : c.complaint_id
                          )
                        }
                        className="px-2.5 py-1 text-xs font-semibold rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1 transition"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        <span>
                          {expandedSliderId === c.complaint_id
                            ? "Hide Proof"
                            : "Before/After Proof"}
                        </span>
                      </button>
                    )}

                    <select
                      value={c.status}
                      disabled={updatingId === c.complaint_id}
                      onChange={(e) => handleStatusChange(c.complaint_id, e.target.value)}
                      className="text-xs bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved (With Proof)</option>
                    </select>
                  </div>
                </div>

                {/* Complaint Text */}
                <p className="text-sm text-slate-300 leading-relaxed">
                  {c.description}
                </p>

                {c.ai_reasoning && (
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                    <p>
                      <span className="font-semibold text-cyan-300">AI Reasoning:</span> {c.ai_reasoning}
                    </p>
                  </div>
                )}

                {/* Expanded Before-After Slider in Admin Panel */}
                {expandedSliderId === c.complaint_id && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30">
                    <div className="flex items-center space-x-2 mb-3">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Gemini Vision Multimodal Verification Proof
                      </h4>
                    </div>
                    <BeforeAfterSlider
                      beforeImage={c.photo || "pothole_before.jpg"}
                      afterImage={c.resolved_photo || "pothole_after.jpg"}
                      officerNotes={c.resolved_notes || "Inspected and confirmed repaired by Ward Maintenance Squad."}
                      aiTags={c.vision_tags || "Pothole -> Smooth Bituminous Patch"}
                    />
                  </div>
                )}

                {/* Bottom Details */}
                <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {c.area}
                    </span>
                    <span>{lang === "gu" ? "નાગરિક: " : "Citizen: "}{c.name} ({c.mobile || "N/A"})</span>
                    {c.source === "WhatsApp" && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800">
                        💬 WhatsApp AI
                      </span>
                    )}
                  </div>

                  <span className="font-mono text-slate-400">{formatRealDateTime(c.created_at)}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* RESOLUTION PROOF MODAL (Feature 2) */}
      {resolveModalComplaint && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
                  ✓
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    {lang === "gu" ? "સમસ્યા નિરાકરણ સાબિતી" : "Submit Resolution Proof"}
                  </h3>
                  <span className="text-xs text-slate-400">
                    Complaint #{resolveModalComplaint.complaint_id}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setResolveModalComplaint(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submitResolutionWithProof} className="space-y-4">
              {/* After Photo File Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  📸 {lang === "gu" ? "કામગીરી પછીનો ફોટો (After Resolution Photo)" : "After Resolution Photo (Proof of Fix)"}
                </label>
                <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-2xl p-4 text-center cursor-pointer bg-slate-950 transition relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setResolvePhotoFile(e.target.files?.[0])}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <Camera className="w-8 h-8 text-emerald-400" />
                    <p className="text-xs font-semibold text-slate-200">
                      {resolvePhotoFile ? resolvePhotoFile.name : (lang === "gu" ? "કામ પૂર્ણ થયાનો ફોટો પસંદ કરો" : "Select repair photo or use AI demo patch")}
                    </p>
                    <span className="text-[10px] text-slate-500">
                      Supports JPG, PNG, WEBP (Max 10MB)
                    </span>
                  </div>
                </div>
              </div>

              {/* Engineer Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  📝 {lang === "gu" ? "મ્યુનિસિપલ ઇજનેર નોંધ (Resolution Remarks)" : "Engineer Resolution Remarks"}
                </label>
                <textarea
                  rows="3"
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  placeholder="e.g. Ward 7 maintenance team filled the cavity with hot bituminous mix and leveled the surface."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                ></textarea>
              </div>

              {/* Gemini Vision Notice */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  {lang === "gu"
                    ? "Gemini Vision AI આપમેળે પહેલાં અને પછીના ફોટોની ચકાસણી કરશે."
                    : "Gemini Vision AI will automatically certify the Before/After proof."}
                </span>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResolveModalComplaint(null)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resolving}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg transition flex items-center space-x-1.5 disabled:opacity-50"
                >
                  {resolving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{resolving ? "Verifying..." : "Confirm & Resolve"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
