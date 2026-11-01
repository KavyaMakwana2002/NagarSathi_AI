"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSettings } from "../context/SettingsContext";
import Link from "next/link";
import {
  MapPin,
  Flame,
  AlertTriangle,
  CheckCircle,
  Filter,
  Layers,
  ExternalLink,
  RefreshCw,
  Navigation,
  Compass,
  Eye,
  Info
} from "lucide-react";

// Safe dynamic Leaflet wrapper to avoid SSR 'window is not defined'
export default function CivicHeatmap({ height = "650px", showHeader = true }) {
  const { t, theme } = useSettings();
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [stats, setStats] = useState({ total: 0, high: 0, resolved: 0, wards: {} });
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  const isDark = theme === "dark";

  // Available Wards for Quick Navigation
  const WARD_CENTERS = [
    { name: "Ahmedabad Central", coords: [23.0225, 72.5714], zoom: 12 },
    { name: "Navrangpura (Ward 7)", coords: [23.0365, 72.5611], zoom: 14 },
    { name: "Satellite (Ward 12)", coords: [23.0322, 72.5186], zoom: 14 },
    { name: "Vastrapur (Ward 10)", coords: [23.0350, 72.5293], zoom: 14 },
    { name: "Maninagar (Ward 14)", coords: [22.9978, 72.6033], zoom: 14 },
    { name: "Paldi (Ward 8)", coords: [23.0130, 72.5625], zoom: 14 },
    { name: "Bopal (Ward 16)", coords: [23.0354, 72.4646], zoom: 14 }
  ];

  const CATEGORIES = [
    "All",
    "Road & Potholes",
    "Garbage & Sanitation",
    "Water Supply",
    "Street Light",
    "Drainage & Sewage"
  ];

  const fetchHeatmapData = async () => {
    setLoading(true);
    try {
      const url = `http://localhost:5000/api/complaints/heatmap?category=${encodeURIComponent(
        selectedCategory
      )}&status=${encodeURIComponent(selectedStatus)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setPoints(data.points || []);
        setStats({
          total: data.total_spots || 0,
          high: data.high_priority_spots || 0,
          resolved: data.resolved_spots || 0,
          wards: data.ward_summary || {}
        });
      }
    } catch (err) {
      console.warn("Failed to fetch heatmap data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeatmapData();
  }, [selectedCategory, selectedStatus]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Fix Leaflet's default icon URLs
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [23.0300, 72.5500],
          zoom: 12,
          zoomControl: false,
        });

        // Add Zoom Control at bottom right
        L.control.zoom({ position: "bottomright" }).addTo(map);

        // Tile layer based on theme
        const tileUrl = isDark
          ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

        L.tileLayer(tileUrl, {
          attribution: '&copy; <a href="https://carto.com/">CARTO</a> & OpenStreetMap',
          maxZoom: 19,
        }).addTo(map);

        markersLayerRef.current = L.layerGroup().addTo(map);
        mapInstanceRef.current = map;
      }

      // Render Heat Circles & Custom Markers
      if (markersLayerRef.current) {
        markersLayerRef.current.clearLayers();

        points.forEach((p) => {
          if (!p.latitude || !p.longitude) return;

          const isResolved = p.status === "Resolved";
          const isHigh = p.priority === "High";
          const color = isResolved ? "#10b981" : isHigh ? "#ef4444" : "#f59e0b";
          const pulseClass = isHigh && !isResolved ? "animate-pulse" : "";

          // Heat Zone Halo Circle
          const heatCircle = L.circle([p.latitude, p.longitude], {
            radius: isHigh ? 350 : 250,
            fillColor: color,
            fillOpacity: isResolved ? 0.2 : isHigh ? 0.45 : 0.35,
            color: color,
            weight: isHigh ? 2 : 1,
            opacity: 0.8,
          });

          // Marker Div Icon
          const iconHtml = `
            <div style="
              width: 34px; 
              height: 34px; 
              border-radius: 50%; 
              background: ${color}; 
              border: 3px solid #ffffff; 
              box-shadow: 0 4px 12px ${color}88;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #ffffff;
              font-size: 14px;
              font-weight: bold;
              cursor: pointer;
              transition: transform 0.2s ease;
            " class="${pulseClass}">
              ${p.category.includes("Road") ? "🛣️" : p.category.includes("Garbage") ? "🗑️" : p.category.includes("Water") ? "🚰" : p.category.includes("Light") ? "💡" : "⚠️"}
            </div>
          `;

          const customIcon = L.divIcon({
            html: iconHtml,
            className: "custom-civic-marker",
            iconSize: [34, 34],
            iconAnchor: [17, 17],
          });

          const marker = L.marker([p.latitude, p.longitude], { icon: customIcon });

          // Click handler to select point in side card
          marker.on("click", () => {
            setSelectedPoint(p);
          });
          heatCircle.on("click", () => {
            setSelectedPoint(p);
          });

          markersLayerRef.current.addLayer(heatCircle);
          markersLayerRef.current.addLayer(marker);
        });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [points, isDark]);

  const jumpToWard = (coords, zoom = 14) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(coords, zoom, {
        duration: 1.2,
      });
    }
  };

  return (
    <div className="w-full flex flex-col space-y-4">
      {/* Header & Controls */}
      {showHeader && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center text-white shadow-md">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {t?.heatmap?.title || "Interactive Smart City GIS Heatmap"}
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300">
                  LIVE GPS
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t?.heatmap?.subtitle || "Real-time geospatial hazard zones and ward complaints"}
              </p>
            </div>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex items-center flex-wrap gap-2 text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>{t?.heatmap?.totalSpots || "Total Active"}:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">{stats.total}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 font-semibold flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              <span>{t?.heatmap?.highPriority || "High Risk Zones"}:</span>
              <span className="font-bold text-red-600 dark:text-red-400">{stats.high}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>{t?.heatmap?.resolvedSpots || "Resolved"}:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{stats.resolved}</span>
            </div>
            <button
              onClick={fetchHeatmapData}
              title="Refresh Map"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      )}

      {/* Filter and Ward Jump Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Category Pills */}
        <div className="md:col-span-8 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-400"
              }`}
            >
              {cat === "All" ? t?.heatmap?.allCategories || "All Issues" : cat}
            </button>
          ))}
        </div>

        {/* Status Filter & Ward Dropdown */}
        <div className="md:col-span-4 flex items-center space-x-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="flex-1 px-3 py-1.5 text-xs font-medium rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">{t?.heatmap?.allStatuses || "All Statuses"}</option>
            <option value="Pending">Pending Only</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved (Green Zones)</option>
          </select>

          <select
            onChange={(e) => {
              const ward = WARD_CENTERS.find((w) => w.name === e.target.value);
              if (ward) jumpToWard(ward.coords, ward.zoom);
            }}
            className="flex-1 px-3 py-1.5 text-xs font-medium rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t?.heatmap?.jumpWard || "Zoom to Ward..."}</option>
            {WARD_CENTERS.map((w) => (
              <option key={w.name} value={w.name}>
                📍 {w.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Map Box & Side Inspector Card */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-slate-900" style={{ height }}>
        {/* Leaflet Mount Container */}
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Map Legend (Bottom Left) */}
        <div className="absolute bottom-4 left-4 z-[400] p-3 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md shadow-lg text-xs space-y-1.5 max-w-xs pointer-events-auto">
          <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-500" />
            <span>{t?.heatmap?.title || "Heatmap Legend"}</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
            <span>{t?.heatmap?.legendHigh || "Red: High Hazard (Urgent Action)"}</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span>{t?.heatmap?.legendMed || "Amber: Moderate Severity"}</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span>{t?.heatmap?.legendResolved || "Green: Resolved with Photo Proof"}</span>
          </div>
        </div>

        {/* Selected Complaint Detail Floating Card (Top Right) */}
        {selectedPoint && (
          <div className="absolute top-4 right-4 z-[400] w-80 sm:w-96 p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 shadow-2xl backdrop-blur-md text-slate-900 dark:text-white pointer-events-auto animate-in fade-in slide-in-from-right duration-200">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                  #{selectedPoint.complaint_id}
                </span>
                <span
                  className={`ml-2 px-2 py-0.5 text-[11px] font-bold rounded-md ${
                    selectedPoint.status === "Resolved"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300"
                      : selectedPoint.priority === "High"
                      ? "bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300"
                  }`}
                >
                  {selectedPoint.priority} Priority • {selectedPoint.status}
                </span>
              </div>
              <button
                onClick={() => setSelectedPoint(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <h4 className="mt-2 text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
              <span>{selectedPoint.category}</span>
              {selectedPoint.source === "WhatsApp" && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  WhatsApp
                </span>
              )}
            </h4>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center space-x-1">
              <MapPin className="w-3 h-3 text-red-500" />
              <span>{selectedPoint.area}</span>
            </p>

            <p className="mt-2 text-xs text-slate-700 dark:text-slate-300 line-clamp-3 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl">
              "{selectedPoint.description}"
            </p>

            {/* AI Vision Tags Badge */}
            {selectedPoint.vision_tags && (
              <div className="mt-2 text-[10px] text-blue-600 dark:text-blue-400 font-mono flex items-center space-x-1">
                <span>🤖 AI Vision:</span>
                <span className="truncate">{selectedPoint.vision_tags}</span>
              </div>
            )}

            {/* Photo Preview if available */}
            {selectedPoint.photo && (
              <div className="mt-3 relative h-28 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                <img
                  src={`http://localhost:5000/api/uploads/${selectedPoint.photo}`}
                  alt="Issue preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = `/uploads/${selectedPoint.photo}`;
                  }}
                />
                <span className="absolute bottom-1 right-1 px-1.5 py-0.5 text-[9px] bg-black/70 text-white rounded font-mono">
                  {selectedPoint.status === "Resolved" ? "Before Repair" : "Citizen Photo"}
                </span>
              </div>
            )}

            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">
                {selectedPoint.upvotes_count || 1} Citizens impacted
              </span>
              <Link
                href={`/track/${selectedPoint.complaint_id}`}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center space-x-1 shadow-md transition"
              >
                <span>{t?.heatmap?.trackIssue || "Track Full Details"}</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* AI Ward Analysis Bottom Summary */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-500/20 text-xs text-slate-700 dark:text-slate-300 flex items-center space-x-3">
        <div className="p-2 rounded-xl bg-blue-500 text-white flex-shrink-0">
          <Info className="w-4 h-4" />
        </div>
        <div>
          <span className="font-bold text-blue-600 dark:text-blue-400">
            {t?.heatmap?.aiSummary || "AI Ward Analysis: High density pothole clusters detected in Ward 7 Navrangpura and Satellite."}
          </span>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            GIS heat algorithm automatically weighs complaints by public hazard severity and cluster proximity.
          </p>
        </div>
      </div>
    </div>
  );
}
