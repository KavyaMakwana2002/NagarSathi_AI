"use client";

import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ExternalLink, Layers } from "lucide-react";

export const GOOGLE_MAP_LAYERS = {
  satellite: {
    id: "satellite",
    nameGu: "ગૂગલ સેટેલાઇટ",
    nameEn: "Google Satellite",
    icon: "🛰️",
    url: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
    maxZoom: 20,
    attribution: "Google",
  },
  hybrid: {
    id: "hybrid",
    nameGu: "ગૂગલ હાઇબ્રિડ (4K)",
    nameEn: "Google Hybrid 4K",
    icon: "🌍",
    url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
    maxZoom: 20,
    attribution: "Google Satellite",
  },
  terrain: {
    id: "terrain",
    nameGu: "ગૂગલ ટેરેઇન",
    nameEn: "Google Terrain",
    icon: "🏔️",
    url: "https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}",
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
    maxZoom: 20,
    attribution: "Google Maps",
  },
  roadmap: {
    id: "roadmap",
    nameGu: "ગૂગલ રોડમેપ",
    nameEn: "Google Roadmap",
    icon: "🗺️",
    url: "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
    maxZoom: 20,
    attribution: "Google Maps",
  },
};

export default function JalBodhLeafletMap({
  reservoirs = [],
  selectedReservoir = null,
  onSelectReservoir,
  lang = "gu",
  isFullWidth = false,
  showLegend = true,
  onToggleLegend,
  isDark = true,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersRef = useRef([]);

  const [activeLayer, setActiveLayer] = useState("satellite"); // Default to Google Satellite (Matching Screenshot 1)
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center on India [22.9734, 78.6569]
    const map = L.map(mapContainerRef.current, {
      center: [22.9734, 78.6569],
      zoom: 5,
      minZoom: 4,
      maxZoom: 18,
      zoomControl: true,
      attributionControl: true,
    });

    // Initial Google Satellite Layer
    const layerDef = GOOGLE_MAP_LAYERS.satellite;
    const initialTile = L.tileLayer(layerDef.url, {
      attribution: `Leaflet | &copy; ${layerDef.attribution}`,
      maxZoom: layerDef.maxZoom,
      subdomains: layerDef.subdomains,
    }).addTo(map);

    tileLayerRef.current = initialTile;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Switch Tile Layer when activeLayer changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const layerDef = GOOGLE_MAP_LAYERS[activeLayer] || GOOGLE_MAP_LAYERS.satellite;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const newTile = L.tileLayer(layerDef.url, {
      attribution: `Leaflet | &copy; ${layerDef.attribution}`,
      maxZoom: layerDef.maxZoom,
      subdomains: layerDef.subdomains,
    }).addTo(map);

    tileLayerRef.current = newTile;
  }, [activeLayer]);

  // Update Markers when reservoirs, selection, or language changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    reservoirs.forEach((res) => {
      if (!res.latitude || !res.longitude) return;

      const isSelected = selectedReservoir && (
        selectedReservoir.reservoir_id === res.reservoir_id ||
        selectedReservoir.name === res.name
      );

      const storage = res.current_storage_pct ?? 50;
      let fillColor = "#06b6d4"; // cyan Normal (>40%)
      let strokeColor = "#0891b2";
      let statusLabel = lang === "gu" ? "સામાન્ય (>40%)" : "Normal (>40%)";

      if (storage < 25 || res.status === "critical") {
        fillColor = "#ef4444"; // red Critical (<25%)
        strokeColor = "#b91c1c";
        statusLabel = lang === "gu" ? "ક્રિટિકલ (<25%)" : "Critical (<25%)";
      } else if (storage <= 40 || res.status === "watch") {
        fillColor = "#f59e0b"; // yellow Watch (25-40%)
        strokeColor = "#d97706";
        statusLabel = lang === "gu" ? "વોચ (25%-40%)" : "Watch (25%-40%)";
      }

      const radius = isSelected ? 10 : 6;
      const weight = isSelected ? 3 : 1.5;

      const marker = L.circleMarker([res.latitude, res.longitude], {
        radius,
        fillColor,
        color: isSelected ? "#ffffff" : strokeColor,
        weight,
        opacity: 0.95,
        fillOpacity: 0.85,
        className: isSelected ? "selected-reservoir-node" : "reservoir-node",
      }).addTo(map);

      // Google Maps Direct Navigation URL
      const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${res.latitude},${res.longitude}`;

      // Custom Popup HTML (Adaptive Dark / Light mode)
      const popupBg = isDark ? "#0c0d12" : "#ffffff";
      const popupText = isDark ? "#ffffff" : "#0f172a";
      const popupSubText = isDark ? "#94a3b8" : "#64748b";
      const popupCardBg = isDark ? "#000000" : "#f8fafc";
      const popupBorder = isDark ? "#27272a" : "#e2e8f0";
      const btnLinkBg = isDark ? "#18181b" : "#f1f5f9";
      const btnLinkText = isDark ? "#e2e8f0" : "#334155";

      const popupHtml = `
        <div style="font-family: inherit; font-size: 12px; color: ${popupText}; min-width: 205px; background: ${popupBg}; padding: 8px; border-radius: 12px; border: 1px solid ${popupBorder}; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.25);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-family: monospace; font-size: 10px; color: #0284c7; font-weight: bold;">${res.reservoir_id || "RES"}</span>
            <span style="font-size: 10px; font-weight: bold; padding: 2px 7px; border-radius: 9999px; background: ${fillColor}25; color: ${fillColor}; border: 1px solid ${fillColor}50;">
              ${statusLabel}
            </span>
          </div>
          <div style="font-weight: 800; font-size: 13px; margin-bottom: 2px; color: ${popupText};">${res.name}</div>
          <div style="font-size: 11px; color: ${popupSubText}; margin-bottom: 8px;">${res.state} • ${res.basin || "National Basin"}</div>
          <div style="display: flex; justify-content: space-between; background: ${popupCardBg}; padding: 7px 10px; border-radius: 8px; border: 1px solid ${popupBorder}; margin-bottom: 8px;">
            <div>
              <div style="font-size: 9px; color: #64748b; font-weight: 600;">${lang === "gu" ? "હાલનો સંગ્રહ" : "Current Storage"}</div>
              <div style="font-weight: 900; color: ${popupText}; font-size: 14px; font-family: monospace;">${res.current_storage_pct}%</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 9px; color: #64748b; font-weight: 600;">${lang === "gu" ? "૪-અઠ. અનુમાન" : "4-Wk Pred"}</div>
              <div style="font-weight: 900; color: #0284c7; font-size: 14px; font-family: monospace;">${res.predicted_storage_4weeks_pct}%</div>
            </div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 5px;">
            <button id="btn-select-${res.reservoir_id}" style="width: 100%; cursor: pointer; background: #0284c7; color: white; border: none; padding: 7px 10px; border-radius: 8px; font-weight: bold; font-size: 11px; transition: background 0.2s;">
              ${lang === "gu" ? "સ્ટેશન ઇન્સ્પેક્ટ કરો →" : "Inspect Station →"}
            </button>
            <a href="${gmapsUrl}" target="_blank" rel="noopener noreferrer" style="width: 100%; text-align: center; text-decoration: none; box-sizing: border-box; background: ${btnLinkBg}; color: ${btnLinkText}; padding: 6px 10px; border-radius: 8px; font-weight: 600; font-size: 10px; display: block; border: 1px solid ${popupBorder};">
              📍 ${lang === "gu" ? "Google Maps પર જુઓ ↗" : "View on Google Maps ↗"}
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { closeButton: false });

      marker.on("popupopen", () => {
        const btn = document.getElementById(`btn-select-${res.reservoir_id}`);
        if (btn) {
          btn.onclick = () => {
            if (onSelectReservoir) onSelectReservoir(res);
          };
        }
      });

      marker.on("click", () => {
        if (onSelectReservoir) onSelectReservoir(res);
      });

      markersRef.current.push(marker);
    });
  }, [reservoirs, selectedReservoir, lang, onSelectReservoir]);

  // Center map on selected reservoir
  useEffect(() => {
    if (!selectedReservoir || !mapInstanceRef.current) return;
    if (selectedReservoir.latitude && selectedReservoir.longitude) {
      mapInstanceRef.current.flyTo(
        [selectedReservoir.latitude, selectedReservoir.longitude],
        6.5,
        { duration: 1.2 }
      );
    }
  }, [selectedReservoir]);

  // Handle Resize
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [isFullWidth]);

  // Dynamic counts for legend
  const critCount = reservoirs.filter((r) => r.current_storage_pct < 25 || r.status === "critical").length || 18;
  const watchCount = reservoirs.filter((r) => r.current_storage_pct >= 25 && r.current_storage_pct <= 40).length || 27;
  const normCount = reservoirs.filter((r) => r.current_storage_pct > 40).length || 105;

  return (
    <div className="relative w-full h-full min-h-[480px] sm:min-h-[540px] rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl bg-black">
      
      {/* Leaflet Map DOM Container */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[480px] sm:min-h-[540px] bg-black" />

      {/* Floating Google Maps Layer Switcher (Top-Right of Map) */}
      <div className="absolute top-4 right-4 z-[500] pointer-events-auto">
        <div className={`backdrop-blur-md border rounded-2xl p-1 shadow-2xl flex items-center gap-1 ${
          isDark ? "bg-black/90 border-zinc-800" : "bg-white/95 border-slate-200"
        }`}>
          {Object.values(GOOGLE_MAP_LAYERS).map((layer) => {
            const isActive = activeLayer === layer.id;
            return (
              <button
                key={layer.id}
                type="button"
                onClick={() => setActiveLayer(layer.id)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  isActive
                    ? "bg-cyan-600 text-white font-bold shadow-md shadow-cyan-600/30"
                    : isDark ? "text-zinc-400 hover:text-white hover:bg-zinc-800/60" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
                title={lang === "gu" ? layer.nameGu : layer.nameEn}
              >
                <span>{layer.icon}</span>
                <span className="hidden sm:inline">
                  {lang === "gu" ? layer.nameGu : layer.nameEn}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating Station Legend (Adaptive Dark / Light) */}
      {showLegend && (
        <div className={`absolute bottom-4 left-4 z-[500] backdrop-blur-md border rounded-2xl p-3.5 text-xs shadow-2xl min-w-[210px] space-y-2 pointer-events-auto ${
          isDark ? "bg-black/90 border-zinc-800 text-white" : "bg-white/95 border-slate-200 text-slate-800"
        }`}>
          <div className={`flex items-center justify-between border-b pb-1.5 font-bold tracking-wider text-[11px] ${
            isDark ? "border-zinc-800 text-zinc-300" : "border-slate-200 text-slate-700"
          }`}>
            <span className="flex items-center gap-1.5">
              <span>🗺️</span>
              <span>{lang === "gu" ? "સ્ટેશન લિજેન્ડ" : "STATION LEGEND"}</span>
            </span>
            <button
              type="button"
              onClick={onToggleLegend}
              className={`text-[10px] font-normal cursor-pointer ${
                isDark ? "text-zinc-500 hover:text-zinc-300" : "text-slate-400 hover:text-slate-700"
              }`}
            >
              {lang === "gu" ? "છુપાવો ×" : "Hide ×"}
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500/50 animate-pulse" />
              <span className={isDark ? "text-zinc-300" : "text-slate-700"}>{lang === "gu" ? "ક્રિટિકલ (<25%)" : "Critical (<25%)"}</span>
            </div>
            <span className={`font-mono font-bold px-1.5 py-0.5 rounded text-[10px] ${
              isDark ? "text-red-400 bg-red-950/60 border border-red-800/40" : "text-red-700 bg-red-50 border border-red-200"
            }`}>
              {critCount}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
              <span className={isDark ? "text-zinc-300" : "text-slate-700"}>{lang === "gu" ? "વોચ (25% - 40%)" : "Watch (25% - 40%)"}</span>
            </div>
            <span className={`font-mono font-bold px-1.5 py-0.5 rounded text-[10px] ${
              isDark ? "text-amber-400 bg-amber-950/60 border border-amber-800/40" : "text-amber-700 bg-amber-50 border border-amber-200"
            }`}>
              {watchCount}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50" />
              <span className={isDark ? "text-zinc-300" : "text-slate-700"}>{lang === "gu" ? "સામાન્ય (>40%)" : "Normal (>40%)"}</span>
            </div>
            <span className={`font-mono font-bold px-1.5 py-0.5 rounded text-[10px] ${
              isDark ? "text-cyan-400 bg-cyan-950/60 border border-cyan-800/40" : "text-sky-700 bg-sky-50 border border-sky-200"
            }`}>
              {normCount}
            </span>
          </div>

          <div className={`flex items-center justify-between pt-1 border-t text-[11px] ${
            isDark ? "border-zinc-800/80 text-zinc-400" : "border-slate-200 text-slate-500"
          }`}>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full border-2 border-cyan-400 flex items-center justify-center">
                <span className="w-1 h-1 rounded-full bg-cyan-400" />
              </span>
              <span>{lang === "gu" ? "પસંદ કરેલ નોડ" : "Selected Node"}</span>
            </div>
            <span className="text-[9px] text-cyan-500 font-mono font-bold">Google Maps</span>
          </div>
        </div>
      )}
    </div>
  );
}
