"use client";

import { MapPin, Calendar, Users, AlertTriangle, Sparkles, Clock } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { PRIORITY_CONFIG } from "@/lib/constants";
import { useSettings } from "@/context/SettingsContext";
import { formatRealDateTime } from "@/lib/formatDate";

export default function ComplaintCard({ complaint, onStatusClick }) {
  const { lang } = useSettings();
  if (!complaint) return null;

  const priorityMeta = PRIORITY_CONFIG[complaint.priority] || PRIORITY_CONFIG["Medium"];

  return (
    <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition shadow-lg relative overflow-hidden group">
      
      {/* Priority Indicator Stripe on Top */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${
        complaint.priority === "High" ? "bg-red-500" : complaint.priority === "Medium" ? "bg-amber-500" : "bg-blue-500"
      }`} />

      {/* Header Info */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded-md">
            #{complaint.complaint_id}
          </span>
          <h3 className="font-bold text-slate-100 text-base mt-1.5 flex items-center gap-2">
            {complaint.category}
          </h3>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <StatusBadge status={complaint.status} />
          
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${priorityMeta.badgeClass}`}>
            {lang === "gu" ? priorityMeta.labelGu : priorityMeta.labelEn}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-slate-300 text-sm leading-relaxed mb-3 line-clamp-3">
        {complaint.description}
      </p>

      {/* AI Reasoning pill if available */}
      {complaint.ai_reasoning && (
        <div className="mb-4 bg-slate-800/60 border border-slate-700/50 rounded-xl p-2.5 text-xs text-slate-300 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-cyan-300">{lang === "gu" ? "AI તારણ: " : "AI Reasoning: "}</span>
            <span>{complaint.ai_reasoning}</span>
          </div>
        </div>
      )}

      {/* Meta Footer */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-slate-500" />
          <span className="font-medium text-slate-300">{complaint.area}</span>
        </div>

        <div className="flex items-center gap-3">
          {complaint.upvotes_count > 1 && (
            <div className="flex items-center gap-1 text-cyan-400 font-semibold bg-cyan-950/50 px-2 py-0.5 rounded-full border border-cyan-800/40">
              <Users className="w-3 h-3" />
              <span>{complaint.upvotes_count} {lang === "gu" ? "નાગરિકો" : "Citizens"}</span>
            </div>
          )}
          
          <div className="flex items-center gap-1 text-slate-500 font-mono text-[11px]">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>{formatRealDateTime(complaint.created_at)}</span>
          </div>
        </div>
      </div>

    </div>
  );
}
