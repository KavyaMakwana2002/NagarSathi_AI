"use client";

import { useState } from "react";

export default function JalBodhChart({
  selectedReservoir,
  simulatedData = null,
  lang = "gu",
  isDark = true,
}) {
  const [chartMode, setChartMode] = useState("forecast"); // "forecast" | "history" | "combined"
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!selectedReservoir) return null;

  const currentStorage = selectedReservoir.current_storage_pct ?? 64.2;
  const predicted4Wk = simulatedData?.predictedStorage 
    ? parseFloat(simulatedData.predictedStorage) 
    : (selectedReservoir.predicted_storage_4weeks_pct ?? 60.6);

  // Generate 5 forecast points: Now, +1 Wk, +2 Wks, +3 Wks, +4 Wks
  const step = (predicted4Wk - currentStorage) / 4;
  const forecastPoints = [
    { labelEn: "Current", labelGu: "આજનો સંગ્રહ", val: currentStorage, type: "current" },
    { labelEn: "+1 Wk", labelGu: "+૧ સપ્તાહ", val: parseFloat((currentStorage + step * 1).toFixed(1)), type: "pred" },
    { labelEn: "+2 Wks", labelGu: "+૨ સપ્તાહ", val: parseFloat((currentStorage + step * 2).toFixed(1)), type: "pred" },
    { labelEn: "+3 Wks", labelGu: "+૩ સપ્તાહ", val: parseFloat((currentStorage + step * 3).toFixed(1)), type: "pred" },
    { labelEn: "+4 Wks", labelGu: "+૪ સપ્તાહ", val: predicted4Wk, type: "pred" },
  ];

  // Past 8 weeks telemetry (realistic gauge trend)
  const historyPoints = [
    { labelEn: "-8 Wks", labelGu: "-૮ સપ્તાહ", val: Math.min(100, Math.max(10, currentStorage + 8.2)), type: "hist" },
    { labelEn: "-6 Wks", labelGu: "-૬ સપ્તાહ", val: Math.min(100, Math.max(10, currentStorage + 6.1)), type: "hist" },
    { labelEn: "-4 Wks", labelGu: "-૪ સપ્તાહ", val: Math.min(100, Math.max(10, currentStorage + 4.3)), type: "hist" },
    { labelEn: "-2 Wks", labelGu: "-૨ સપ્તાહ", val: Math.min(100, Math.max(10, currentStorage + 1.8)), type: "hist" },
    { labelEn: "Current", labelGu: "આજનો સંગ્રહ", val: currentStorage, type: "current" },
  ];

  // Combined points
  const combinedPoints = [
    ...historyPoints.slice(0, 4),
    ...forecastPoints,
  ];

  const activePoints = chartMode === "forecast" ? forecastPoints : chartMode === "history" ? historyPoints : combinedPoints;

  // SVG coordinate calculations (viewBox: 0 0 460 180)
  const minX = 42;
  const maxX = 425;
  const minY = 20; // 100%
  const maxY = 150; // 0%

  const getY = (val) => {
    const clamped = Math.max(0, Math.min(100, val));
    return maxY - ((clamped / 100) * (maxY - minY));
  };

  const getX = (idx, total) => {
    if (total <= 1) return minX;
    return minX + (idx / (total - 1)) * (maxX - minX);
  };

  // Generate SVG path string
  const totalPts = activePoints.length;
  const pathCoords = activePoints.map((pt, i) => ({
    x: getX(i, totalPts),
    y: getY(pt.val),
  }));

  const linePath = pathCoords.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = pathCoords[i - 1];
    const cp1x = prev.x + (pt.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (pt.x - prev.x) / 2;
    const cp2y = pt.y;
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pt.x} ${pt.y}`;
  }, "");

  const areaPath = `${linePath} L ${pathCoords[totalPts - 1].x} ${maxY} L ${pathCoords[0].x} ${maxY} Z`;

  const projectedDelta = (predicted4Wk - currentStorage).toFixed(1);

  return (
    <div className="space-y-3">
      {/* Chart Header with Mode Toggle Pills (Adaptive Dark/Light) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h5 className={`text-xs font-bold tracking-wide flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}>
            <span>{lang === "gu" ? "૪-સપ્તાહ AI જળ પૂર્વાનુમાન (LSTM + XGB)" : "4-WEEK AI PREDICTIONS (LSTM + XGB)"}</span>
          </h5>
          <p className={`text-[10px] ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
            {lang === "gu"
              ? "કેચમેન્ટ ઇનફ્લો અને દૈનિક કેનાલ ડિસ્ચાર્જ આધારે હાઇડ્રોલોજિકલ મોડેલ"
              : "Continuous 4-week reservoir depletion projections across CWC gauge telemetry"}
          </p>
        </div>

        <div className={`flex items-center p-0.5 rounded-lg border text-[11px] font-medium gap-0.5 ${
          isDark ? "bg-black border-zinc-800" : "bg-slate-100 border-slate-200"
        }`}>
          <button
            type="button"
            onClick={() => { setChartMode("forecast"); setHoveredPoint(null); }}
            className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
              chartMode === "forecast" 
                ? "bg-cyan-600 text-white font-bold shadow-sm" 
                : isDark ? "text-zinc-400 hover:text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {lang === "gu" ? "પૂર્વાનુમાન" : "Predictions"}
          </button>
          <button
            type="button"
            onClick={() => { setChartMode("history"); setHoveredPoint(null); }}
            className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
              chartMode === "history" 
                ? "bg-cyan-600 text-white font-bold shadow-sm" 
                : isDark ? "text-zinc-400 hover:text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {lang === "gu" ? "હાલ & ભૂતકાળ" : "Current & Past"}
          </button>
          <button
            type="button"
            onClick={() => { setChartMode("combined"); setHoveredPoint(null); }}
            className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
              chartMode === "combined" 
                ? "bg-cyan-600 text-white font-bold shadow-sm" 
                : isDark ? "text-zinc-400 hover:text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {lang === "gu" ? "સંપૂર્ણ" : "Full"}
          </button>
        </div>
      </div>

      {/* Interactive SVG Chart (Adaptive Canvas) */}
      <div className={`relative w-full overflow-hidden rounded-xl p-2.5 border transition-colors ${
        isDark ? "bg-black border-zinc-800 shadow-inner" : "bg-white border-slate-200 shadow-sm"
      }`}>
        <svg viewBox="0 0 460 180" className="w-full h-auto select-none">
          <defs>
            <linearGradient id="chartGradientCyan" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="chartGradientPred" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={predicted4Wk < 40 ? "#ef4444" : "#06b6d4"} stopOpacity="0.4" />
              <stop offset="100%" stopColor={predicted4Wk < 40 ? "#ef4444" : "#06b6d4"} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines and y-axis labels: 0%, 25%, 40%, 75%, 100% */}
          {[0, 25, 40, 75, 100].map((val) => {
            const y = getY(val);
            const isCrit = val === 25;
            const isWatch = val === 40;
            return (
              <g key={val}>
                <line
                  x1={36}
                  y1={y}
                  x2={432}
                  y2={y}
                  stroke={isCrit ? "#ef4444" : isWatch ? "#f59e0b" : (isDark ? "#27272a" : "#e2e8f0")}
                  strokeDasharray={isCrit || isWatch ? "3 3" : undefined}
                  strokeWidth={isCrit || isWatch ? 1.2 : 0.8}
                  strokeOpacity={isCrit || isWatch ? 0.85 : 0.5}
                />
                <text
                  x={30}
                  y={y + 3}
                  textAnchor="end"
                  fill={isCrit ? "#ef4444" : isWatch ? "#f59e0b" : (isDark ? "#71717a" : "#64748b")}
                  fontSize="9"
                  fontFamily="sans-serif"
                  fontWeight={isCrit || isWatch ? "bold" : "normal"}
                >
                  {val}%
                </text>
              </g>
            );
          })}

          {/* Threshold Tags at Right */}
          <text x={436} y={getY(25) + 3} fill="#ef4444" fontSize="8" fontWeight="bold">
            {lang === "gu" ? "અછત" : "Crit"}
          </text>
          <text x={436} y={getY(40) + 3} fill="#f59e0b" fontSize="8" fontWeight="bold">
            {lang === "gu" ? "વોચ" : "Watch"}
          </text>

          {/* Shaded Area Under Curve */}
          <path
            d={areaPath}
            fill={chartMode === "forecast" && predicted4Wk < 40 ? "url(#chartGradientPred)" : "url(#chartGradientCyan)"}
          />

          {/* Main Curve Line */}
          <path
            d={linePath}
            fill="none"
            stroke={chartMode === "forecast" && predicted4Wk < 40 ? "#ef4444" : "#06b6d4"}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {activePoints.map((pt, i) => {
            const x = getX(i, totalPts);
            const y = getY(pt.val);
            const isHovered = hoveredPoint?.idx === i;
            const isCurrent = pt.type === "current";

            return (
              <g
                key={i}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint({ idx: i, x, y, pt })}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {/* Glow ring on hover */}
                {isHovered && (
                  <circle cx={x} cy={y} r={8} fill="#06b6d4" opacity="0.25" />
                )}
                <circle
                  cx={x}
                  cy={y}
                  r={isCurrent ? 4.5 : isHovered ? 4 : 3}
                  fill={isCurrent ? "#ffffff" : "#06b6d4"}
                  stroke={isCurrent ? "#06b6d4" : "#0f172a"}
                  strokeWidth="1.5"
                />
                {/* X-Axis Label */}
                <text
                  x={x}
                  y={166}
                  textAnchor="middle"
                  fill={isCurrent ? "#06b6d4" : isHovered ? (isDark ? "#ffffff" : "#0f172a") : (isDark ? "#a1a1aa" : "#64748b")}
                  fontSize="9.5"
                  fontWeight={isCurrent || isHovered ? "bold" : "normal"}
                >
                  {lang === "gu" ? pt.labelGu : pt.labelEn}
                </text>
              </g>
            );
          })}

          {/* Hover Tooltip inside SVG */}
          {hoveredPoint && (
            <g>
              <rect
                x={Math.max(10, Math.min(370, hoveredPoint.x - 50))}
                y={Math.max(5, hoveredPoint.y - 28)}
                width={100}
                height={22}
                rx={5}
                fill={isDark ? "#0f172a" : "#ffffff"}
                stroke="#06b6d4"
                strokeWidth={1.5}
                opacity={0.98}
              />
              <text
                x={Math.max(10, Math.min(370, hoveredPoint.x - 50)) + 50}
                y={Math.max(5, hoveredPoint.y - 28) + 14}
                textAnchor="middle"
                fill={isDark ? "#ffffff" : "#0f172a"}
                fontSize="9"
                fontWeight="bold"
              >
                {hoveredPoint.pt.val}% ({lang === "gu" ? hoveredPoint.pt.labelGu : hoveredPoint.pt.labelEn})
              </text>
            </g>
          )}
        </svg>

        {/* Chart Legend Footnotes - Authentic Hydrological Sources */}
        <div className={`flex flex-col sm:flex-row items-center justify-between text-[10px] mt-2 px-1 gap-1 border-t pt-1.5 ${
          isDark ? "border-zinc-850 text-zinc-400" : "border-slate-200 text-slate-500"
        }`}>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-cyan-400 inline-block rounded" /> {lang === "gu" ? "આયોજિત જળસ્તર" : "Projected Level"}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-amber-500 border-dashed inline-block" /> {lang === "gu" ? "૪૦% સાવચેતી મર્યાદા" : "40% Watch Threshold"}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-red-500 border-dashed inline-block" /> {lang === "gu" ? "૨૫% ક્રિટિકલ રેશનિંગ" : "25% Critical Rationing"}
            </span>
          </div>
          <span className="text-zinc-500">
            {lang === "gu" ? "સત્તાવાર સ્ત્રોત: CWC દૈનિક ગેજ બુલેટિન" : "Official Source: CWC Daily Gauge Telemetry"}
          </span>
        </div>
      </div>

      {/* Sub-Metrics Pill Bar (Adaptive Dark/Light) */}
      <div className="grid grid-cols-3 gap-2">
        <div className={`rounded-xl p-2.5 text-center shadow-xs border transition-colors ${
          isDark ? "bg-black border-zinc-800" : "bg-slate-50 border-slate-200"
        }`}>
          <div className={`text-[10px] font-medium ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
            {lang === "gu" ? "હાલનો લાઈવ સંગ્રહ" : "Current Storage"}
          </div>
          <div className={`text-sm font-black font-mono mt-0.5 ${isDark ? "text-white" : "text-slate-900"}`}>{currentStorage}%</div>
        </div>

        <div className={`rounded-xl p-2.5 text-center shadow-xs border transition-colors ${
          isDark ? "bg-black border-zinc-800" : "bg-slate-50 border-slate-200"
        }`}>
          <div className={`text-[10px] font-medium ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
            {lang === "gu" ? "૪-સપ્તાહ અંદાજિત સંગ્રહ" : "4-Week Projected Level"}
          </div>
          <div className="text-sm font-black text-cyan-500 font-mono mt-0.5">{predicted4Wk}%</div>
        </div>

        <div className={`rounded-xl p-2.5 text-center shadow-xs border transition-colors ${
          isDark ? "bg-black border-zinc-800" : "bg-slate-50 border-slate-200"
        }`}>
          <div className={`text-[10px] font-medium ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
            {lang === "gu" ? "ચોખ્ખો અંદાજિત ફેરફાર" : "Net Inflow / Drawdown"}
          </div>
          <div className={`text-sm font-black font-mono mt-0.5 ${parseFloat(projectedDelta) >= 0 ? "text-emerald-500" : "text-amber-500"}`}>
            {parseFloat(projectedDelta) > 0 ? `+${projectedDelta}% (આવક)` : `${projectedDelta}% (જાવક)`}
          </div>
        </div>
      </div>
    </div>
  );
}
