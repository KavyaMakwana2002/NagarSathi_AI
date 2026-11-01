"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PortalChoice from "@/components/PortalChoice";
import { useSettings } from "@/context/SettingsContext";

export default function LoginPage() {
  const { t } = useSettings();

  return (
    <div className="min-h-[85vh] py-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t("portal", "backHome")}</span>
        </Link>
      </div>

      <PortalChoice />
    </div>
  );
}
