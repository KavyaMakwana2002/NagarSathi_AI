"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useSettings } from "../../context/SettingsContext";
import { Map, ShieldCheck, Flame, ArrowLeft } from "lucide-react";
import Link from "next/link";

// Dynamic import with ssr: false ensures Leaflet never crashes during SSR
const CivicHeatmap = dynamic(() => import("../../components/CivicHeatmap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[650px] rounded-3xl bg-slate-100 dark:bg-slate-900 flex flex-col items-center justify-center border border-slate-200 dark:border-slate-800 animate-pulse">
      <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mb-3"></div>
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
        Loading GIS Geospatial Civic Heatmap...
      </p>
    </div>
  ),
});

export default function HeatmapPage() {
  const { t } = useSettings();

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t?.portal?.backHome || "Back to Home"}</span>
          </Link>
          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
            Ahmedabad & Gujarat Municipal GIS Grid
          </span>
        </div>

        {/* Civic Heatmap Component */}
        <CivicHeatmap height="700px" showHeader={true} />
    </div>
  );
}
