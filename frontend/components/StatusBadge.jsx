"use client";

import { Clock, Hammer, CheckCircle2, XCircle } from "lucide-react";
import { STATUS_CONFIG } from "@/lib/constants";
import { useSettings } from "@/context/SettingsContext";

export default function StatusBadge({ status = "Pending" }) {
  const { lang } = useSettings();
  const conf = STATUS_CONFIG[status] || STATUS_CONFIG["Pending"];
  
  const getIcon = () => {
    switch (status) {
      case "In Progress":
        return <Hammer className="w-3.5 h-3.5 animate-pulse" />;
      case "Resolved":
        return <CheckCircle2 className="w-3.5 h-3.5" />;
      case "Rejected":
        return <XCircle className="w-3.5 h-3.5" />;
      default:
        return <Clock className="w-3.5 h-3.5" />;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${conf.color}`}
    >
      {getIcon()}
      <span>{lang === "gu" ? conf.labelGu : conf.labelEn}</span>
    </span>
  );
}
