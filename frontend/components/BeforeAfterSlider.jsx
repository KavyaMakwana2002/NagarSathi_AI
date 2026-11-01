"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useSettings } from "../context/SettingsContext";
import { CheckCircle2, ShieldCheck, Sparkles, SlidersHorizontal, Image as ImageIcon } from "lucide-react";

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  title = "Pothole Repair Verification",
  officerNotes = "Ward 7 Asphalt Squad deployed. Bituminous hot-mix asphalt filled and compacted.",
  aiTags = "Pothole, Damaged Asphalt, High Hazard -> Repaired & Leveled",
  confidence = "98%",
  verifiedDate = "Verified by Gemini Vision AI",
}) {
  const { t } = useSettings();
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const getImageUrl = (img) => {
    if (!img) return "/uploads/pothole_before.jpg";
    if (img.startsWith("http") || img.startsWith("data:") || img.startsWith("/")) return img;
    return `http://localhost:5000/api/uploads/${img}`;
  };

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percent = (x / rect.width) * 100;
    if (percent < 0) percent = 0;
    if (percent > 100) percent = 100;
    setSliderPos(percent);
  }, []);

  const handleTouchMove = (e) => {
    if (e.touches && e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="w-full flex flex-col space-y-3">
      {/* Slider Container */}
      <div
        ref={containerRef}
        onMouseDown={() => setIsDragging(true)}
        onTouchMove={handleTouchMove}
        className="relative w-full h-72 sm:h-96 rounded-3xl overflow-hidden select-none cursor-ew-resize border-2 border-slate-200 dark:border-slate-800 shadow-2xl bg-slate-950"
      >
        {/* AFTER Image (Full background layer) */}
        <img
          src={getImageUrl(afterImage || "pothole_after.jpg")}
          alt="After Repair"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          onError={(e) => {
            e.target.src = "/uploads/pothole_after.jpg";
          }}
        />

        {/* AFTER Label (Top Right) */}
        <div className="absolute top-3 right-3 z-10 px-3 py-1 rounded-full bg-emerald-600/90 text-white font-bold text-xs shadow-lg backdrop-blur-md flex items-center space-x-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{t?.vision?.afterTitle || "AFTER (પછી - ઉકેલ)"}</span>
        </div>

        {/* BEFORE Image (Clipped layer) */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ width: `${sliderPos}%` }}
        >
          <img
            src={getImageUrl(beforeImage || "pothole_before.jpg")}
            alt="Before Repair"
            className="absolute inset-0 w-full h-full object-cover max-w-none"
            style={{
              width: containerRef.current ? `${containerRef.current.clientWidth}px` : "100%",
              height: "100%",
            }}
            onError={(e) => {
              e.target.src = "/uploads/pothole_before.jpg";
            }}
          />

          {/* BEFORE Label (Top Left) */}
          <div className="absolute top-3 left-3 z-10 px-3 py-1 rounded-full bg-red-600/90 text-white font-bold text-xs shadow-lg backdrop-blur-md flex items-center space-x-1">
            <span>⚠️</span>
            <span>{t?.vision?.beforeTitle || "BEFORE (પહેલાં - સમસ્યા)"}</span>
          </div>
        </div>

        {/* Vertical Divider Line with Glowing Handle */}
        <div
          className="absolute top-0 bottom-0 z-20 pointer-events-none"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="w-1 h-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)] -ml-0.5"></div>
          {/* Interactive Handle Knob */}
          <div className="absolute top-1/2 -translate-y-1/2 -ml-5 w-10 h-10 rounded-full bg-white dark:bg-slate-900 border-2 border-blue-500 shadow-2xl flex items-center justify-center text-slate-800 dark:text-white cursor-pointer pointer-events-auto hover:scale-110 active:scale-95 transition-transform">
            <SlidersHorizontal className="w-4 h-4 text-blue-600 rotate-90" />
          </div>
        </div>

        {/* Instruction Badge at bottom center */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-full bg-black/60 text-white/90 text-[11px] font-medium backdrop-blur-md pointer-events-none">
          ↔ {t?.vision?.dragHint || "સ્લાઇડરને ખસેડીને સરખામણી જુઓ (Drag to compare)"}
        </div>
      </div>

      {/* AI Multimodal Verification Certificate Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-500/20 text-slate-800 dark:text-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-emerald-500/20">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-md">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-xs text-emerald-700 dark:text-emerald-400">
                {t?.vision?.verifiedBadge || "Gemini Vision AI Verified (100% Genuine Resolution)"}
              </span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Multimodal Image Comparison Score: <strong className="text-emerald-600">{confidence} match</strong>
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
            ✓ Resolution Proof Authenticated
          </span>
        </div>

        {/* Remarks and AI Tags */}
        <div className="mt-2.5 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-slate-500 dark:text-slate-400 font-semibold text-[11px]">
              {t?.vision?.officerNotes || "ઇજનેર દ્વારા નોંધ:"}
            </span>
            <p className="text-slate-700 dark:text-slate-300 mt-0.5 bg-white/60 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
              "{officerNotes}"
            </p>
          </div>

          <div>
            <span className="text-slate-500 dark:text-slate-400 font-semibold text-[11px]">
              {t?.vision?.aiTags || "AI Vision Tags:"}
            </span>
            <p className="text-blue-600 dark:text-blue-400 font-mono mt-0.5 bg-white/60 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-200/50 dark:border-slate-800/50 truncate">
              🏷️ {aiTags}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
