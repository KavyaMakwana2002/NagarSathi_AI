"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Sparkles, CheckCircle2, AlertCircle, ArrowLeft, Send, 
  Copy, ExternalLink, ShieldAlert, Cpu
} from "lucide-react";
import ImageUploader from "@/components/ImageUploader";
import VoiceInput from "@/components/VoiceInput";
import DuplicateAlertModal from "@/components/DuplicateAlertModal";
import { submitComplaint } from "@/lib/api";
import { CIVIC_CATEGORIES, GUJARAT_AREAS, PRIORITY_CONFIG } from "@/lib/constants";
import { useSettings } from "@/context/SettingsContext";

export default function ComplaintPage() {
  const { t, lang } = useSettings();

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [area, setArea] = useState(GUJARAT_AREAS[0]);
  const [category, setCategory] = useState("General");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError(t("complaint", "errorDesc"));
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name || "Anonymous Citizen");
      formData.append("mobile", mobile);
      formData.append("area", area);
      formData.append("category", category);
      formData.append("description", description);
      if (photo) {
        formData.append("photo", photo);
      }

      const res = await submitComplaint(formData);
      if (res.success) {
        setResult(res);
        if (res.duplicate_info?.is_duplicate) {
          setShowDuplicateModal(true);
        }
      } else {
        setError(res.error || "Submission error. Please try again.");
      }
    } catch (err) {
      setError("Cannot reach backend server. Please verify connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyTicket = () => {
    if (result?.complaint_id) {
      navigator.clipboard.writeText(result.complaint_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white mb-6 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>{t("complaint", "backHome")}</span>
      </Link>

      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          {t("complaint", "title")}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          {t("complaint", "subtitle")}
        </p>
      </div>

      {/* Duplicate Alert Modal */}
      <DuplicateAlertModal
        isOpen={showDuplicateModal}
        duplicateInfo={result?.duplicate_info}
        onClose={() => setShowDuplicateModal(false)}
      />

      {/* If complaint already submitted, show Success Screen */}
      {result ? (
        <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {t("complaint", "successTitle")}
              </h2>
              <p className="text-xs text-slate-400">
                {t("complaint", "successDesc")}
              </p>
            </div>
          </div>

          {/* Ticket ID Box */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 font-semibold block uppercase">
                {t("complaint", "ticketIdLabel")}
              </span>
              <span className="font-mono text-xl sm:text-2xl font-black text-cyan-400">
                {result.complaint_id}
              </span>
            </div>
            <button
              onClick={handleCopyTicket}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl transition"
            >
              <Copy className="w-4 h-4" />
              <span>{copied ? t("complaint", "copiedBtn") : t("complaint", "copyBtn")}</span>
            </button>
          </div>

          {/* AI Analysis Result Pill */}
          <div className="bg-slate-800/60 border border-cyan-500/30 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold uppercase">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>{t("complaint", "aiInsights")}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700">
                <span className="text-slate-400 block text-[10px]">{t("complaint", "aiCategory")}</span>
                <span className="font-bold text-white">{result.ai_analysis?.category}</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700">
                <span className="text-slate-400 block text-[10px]">{t("complaint", "aiPriority")}</span>
                <span className="font-bold text-amber-400">{result.ai_analysis?.priority}</span>
              </div>
            </div>

            {result.ai_analysis?.reasoning && (
              <p className="text-xs text-slate-300 pt-1 border-t border-slate-700/50">
                💡 <span className="font-semibold text-slate-200">{t("complaint", "aiReasoningPrefix")}</span> {result.ai_analysis.reasoning}
              </p>
            )}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/track?id=${result.complaint_id}`}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-xs text-center flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20"
            >
              <span>{t("complaint", "trackTicketBtn")}</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
            <button
              onClick={() => {
                setResult(null);
                setDescription("");
                setPhoto(null);
              }}
              className="py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
            >
              {t("complaint", "anotherComplaintBtn")}
            </button>
          </div>
        </div>
      ) : (
        /* Complaint Form */
        <form onSubmit={handleSubmit} className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3.5 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Citizen Name & Mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t("complaint", "nameLabel")}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("complaint", "namePlaceholder")}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t("complaint", "mobileLabel")}
              </label>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder={t("complaint", "mobilePlaceholder")}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
          </div>

          {/* Area & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t("complaint", "areaLabel")}
              </label>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
              >
                {GUJARAT_AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t("complaint", "categoryLabel")}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500 transition"
              >
                <option value="General">{t("complaint", "autoDetect")}</option>
                {CIVIC_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {lang === "gu" ? c.labelGu : c.labelEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description with Gujarati Voice Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                {t("complaint", "descLabel")}
              </label>
              <VoiceInput
                onTranscriptChange={(text) => {
                  setDescription((prev) => (prev ? `${prev} ${text}` : text));
                }}
              />
            </div>
            
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("complaint", "descPlaceholder")}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500 transition resize-none leading-relaxed"
            />
          </div>

          {/* Photo Uploader */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t("complaint", "photoLabel")}
            </label>
            <ImageUploader onImageSelected={(file) => setPhoto(file)} />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-cyan-400 hover:opacity-95 text-white font-extrabold text-sm shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 active:scale-95 transition disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin text-cyan-200" />
                <span>{t("complaint", "submittingBtn")}</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                <span>{t("complaint", "submitBtn")}</span>
              </span>
            )}
          </button>

        </form>
      )}

    </div>
  );
}
