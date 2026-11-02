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
  Info,
  Maximize2,
  Crosshair,
  Car,
  Globe,
  Radio
} from "lucide-react";

export default function CivicHeatmap({ height = "680px", showHeader = true }) {
  const { t, theme } = useSettings();
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [stats, setStats] = useState({ total: 0, high: 0, resolved: 0, wards: {} });
  
  // Google Maps Layer & Heat Cloud State
  const [activeLayer, setActiveLayer] = useState("satellite"); // Default to stunning 4K Satellite Hybrid
  const [showHeatCloud, setShowHeatCloud] = useState(true);
  const [mapCoords, setMapCoords] = useState({ lat: 23.0300, lng: 72.5500, zoom: 12 });

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const currentTileLayerRef = useRef(null);
  const heatCloudLayerRef = useRef(null);
  const markersLayerRef = useRef(null);
  const LRef = useRef(null);

  const isDark = theme === "dark";

  // Google Maps Tile Engines
  const GOOGLE_MAP_LAYERS = [
    {
      id: "satellite",
      name: t?.heatmap?.googleSatellite || "Google Satellite 4K",
      icon: "🛰️",
      badge: "4K Hybrid",
      url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
      subdomains: ["mt0", "mt1", "mt2", "mt3"],
      maxZoom: 21,
      attribution: "&copy; Google Satellite Imagery"
    },
    {
      id: "roadmap",
      name: t?.heatmap?.googleRoadmap || "Google Roadmap",
      icon: "🗺️",
      badge: "Vector",
      url: "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
      subdomains: ["mt0", "mt1", "mt2", "mt3"],
      maxZoom: 21,
      attribution: "&copy; Google Maps"
    },
    {
      id: "traffic",
      name: t?.heatmap?.googleTraffic || "Google Live Traffic",
      icon: "🚦",
      badge: "Live Flow",
      url: "https://mt1.google.com/vt/lyrs=m,traffic&x={x}&y={y}&z={z}",
      subdomains: ["mt0", "mt1", "mt2", "mt3"],
      maxZoom: 20,
      attribution: "&copy; Google Maps Traffic"
    },
    {
      id: "terrain",
      name: t?.heatmap?.googleTerrain || "Google Terrain",
      icon: "🏔️",
      badge: "Topography",
      url: "https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}",
      subdomains: ["mt0", "mt1", "mt2", "mt3"],
      maxZoom: 20,
      attribution: "&copy; Google Maps"
    },
    {
      id: "dark",
      name: t?.heatmap?.darkBasemap || "Command Dark",
      icon: "🌙",
      badge: "Night GIS",
      url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      subdomains: ["a", "b", "c", "d"],
      maxZoom: 19,
      attribution: "&copy; CARTO & OpenStreetMap"
    }
  ];

  // Key Ahmedabad & Gujarat Municipal Landmarks
  const WARD_CENTERS = [
    { name: "Ahmedabad Central (કમિશનર કચેરી)", coords: [23.0225, 72.5714], zoom: 13 },
    { name: "Navrangpura - Ward 7 (નવરંગપુરા)", coords: [23.0365, 72.5611], zoom: 15 },
    { name: "Satellite & Jodhpur - Ward 12 (સેટેલાઇટ)", coords: [23.0322, 72.5186], zoom: 15 },
    { name: "Sabarmati Riverfront (રિવરફ્રન્ટ)", coords: [23.0338, 72.5768], zoom: 15 },
    { name: "SG Highway & ISKCON (એસજી હાઇવે)", coords: [23.0287, 72.5067], zoom: 15 },
    { name: "Vastrapur Lake - Ward 10 (વસ્ત્રાપુર)", coords: [23.0350, 72.5293], zoom: 15 },
    { name: "Kankaria Lake - Ward 14 (કાંકરિયા)", coords: [22.9984, 72.6033], zoom: 15 },
    { name: "Sindhu Bhavan Road (સિંધુ ભવન)", coords: [23.0452, 72.4975], zoom: 15 },
    { name: "Bopal Ring Road - Ward 16 (બોપલ)", coords: [23.0354, 72.4646], zoom: 14 },
    { name: "Paldi - Ward 8 (પાલડી)", coords: [23.0130, 72.5625], zoom: 15 },
    { name: "Gandhinagar Capital (ગાંધીનગર)", coords: [23.2156, 72.6369], zoom: 13 }
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

  // Switch Base Tile Layer dynamically
  const switchMapLayer = (layerId) => {
    setActiveLayer(layerId);
    if (!mapInstanceRef.current || !LRef.current) return;

    const layerConfig = GOOGLE_MAP_LAYERS.find((l) => l.id === layerId);
    if (!layerConfig) return;

    if (currentTileLayerRef.current) {
      mapInstanceRef.current.removeLayer(currentTileLayerRef.current);
    }

    const newTileLayer = LRef.current.tileLayer(layerConfig.url, {
      attribution: layerConfig.attribution,
      maxZoom: layerConfig.maxZoom,
      subdomains: layerConfig.subdomains || ["mt0", "mt1", "mt2", "mt3"]
    });

    newTileLayer.addTo(mapInstanceRef.current);
    newTileLayer.bringToBack();
    currentTileLayerRef.current = newTileLayer;
  };

  // Initialize Map
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    import("leaflet").then((L) => {
      if (!isMounted || !mapContainerRef.current) return;
      LRef.current = L;

      // Fix Leaflet's default icon URLs
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (!mapInstanceRef.current) {
        const initialMap = L.map(mapContainerRef.current, {
          center: [23.0300, 72.5500],
          zoom: 12,
          zoomControl: false,
        });

        // Add Zoom Control at bottom right
        L.control.zoom({ position: "bottomright" }).addTo(initialMap);

        // Track live coordinates
        initialMap.on("move", () => {
          const center = initialMap.getCenter();
          setMapCoords({
            lat: Number(center.lat.toFixed(4)),
            lng: Number(center.lng.toFixed(4)),
            zoom: initialMap.getZoom()
          });
        });

        // Add initial Google Layer
        const initialLayerConfig = GOOGLE_MAP_LAYERS.find((l) => l.id === activeLayer) || GOOGLE_MAP_LAYERS[0];
        const tileLayer = L.tileLayer(initialLayerConfig.url, {
          attribution: initialLayerConfig.attribution,
          maxZoom: initialLayerConfig.maxZoom,
          subdomains: initialLayerConfig.subdomains || ["mt0", "mt1", "mt2", "mt3"]
        }).addTo(initialMap);

        currentTileLayerRef.current = tileLayer;
        heatCloudLayerRef.current = L.layerGroup().addTo(initialMap);
        markersLayerRef.current = L.layerGroup().addTo(initialMap);

        mapInstanceRef.current = initialMap;
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Update Markers & Heat Circles when points or toggle change
  useEffect(() => {
    const L = LRef.current;
    if (!L || !mapInstanceRef.current || !markersLayerRef.current || !heatCloudLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    heatCloudLayerRef.current.clearLayers();

    points.forEach((p) => {
      if (!p.latitude || !p.longitude) return;

      const isResolved = p.status === "Resolved";
      const isHigh = p.priority === "High";
      const color = isResolved ? "#10b981" : isHigh ? "#ef4444" : "#f59e0b";

      // 1. Heat Zone Density Cloud (if enabled)
      if (showHeatCloud) {
        const heatCircle = L.circle([p.latitude, p.longitude], {
          radius: isHigh ? 380 : 260,
          fillColor: color,
          fillOpacity: isResolved ? 0.2 : isHigh ? 0.45 : 0.35,
          color: color,
          weight: isHigh ? 2 : 1,
          opacity: 0.8,
        });

        heatCircle.on("click", () => {
          setSelectedPoint(p);
          mapInstanceRef.current.flyTo([p.latitude, p.longitude], 16, { duration: 0.8 });
        });

        heatCloudLayerRef.current.addLayer(heatCircle);
      }

      // 2. High-Tech Marker Pin with Radar Wave for High Priority
      const emoji = p.category.includes("Road")
        ? "🛣️"
        : p.category.includes("Garbage")
        ? "🗑️"
        : p.category.includes("Water")
        ? "🚰"
        : p.category.includes("Light")
        ? "💡"
        : "⚠️";

      const radarHtml = isHigh && !isResolved
        ? `<div class="marker-radar-wave" style="background: ${color}55; border: 2px solid ${color};"></div>`
        : "";

      const iconHtml = `
        <div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;">
          ${radarHtml}
          <div style="
            position: relative;
            z-index: 10;
            width: 36px; 
            height: 36px; 
            border-radius: 50%; 
            background: ${color}; 
            border: 3px solid #ffffff; 
            box-shadow: 0 4px 14px rgba(0,0,0,0.45), 0 0 10px ${color}aa;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            font-size: 15px;
            cursor: pointer;
            transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
          " onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'">
            ${emoji}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: "custom-civic-marker",
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      const marker = L.marker([p.latitude, p.longitude], { icon: customIcon });

      // Click handler
      marker.on("click", () => {
        setSelectedPoint(p);
        mapInstanceRef.current.flyTo([p.latitude, p.longitude], 16, { duration: 0.8 });
      });

      // Tooltip preview
      marker.bindTooltip(
        `<div style="font-weight: 600; font-size: 11px;">#${p.complaint_id} • ${p.category}</div><div style="font-size: 10px; color: #94a3b8;">${p.area}</div>`,
        { direction: "top", offset: [0, -16] }
      );

      markersLayerRef.current.addLayer(marker);
    });
  }, [points, showHeatCloud]);

  const jumpToWard = (coords, zoom = 15) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(coords, zoom, {
        duration: 1.4,
      });
    }
  };

  const resetAhmedabadView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([23.0300, 72.5500], 12, { duration: 1.2 });
    }
  };

  return (
    <div className="w-full flex flex-col space-y-4">
      {/* Header & Controls */}
      {showHeader && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-lg backdrop-blur-xl">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-red-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-red-500/25">
              <Globe className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {t?.heatmap?.title || "Interactive Smart City GIS Heatmap"}
                </h2>
                <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300/40 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>Google Maps Powered</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t?.heatmap?.subtitle || "Real-time geospatial mapping, high-density civic hazard zones, and automated ward analysis across Ahmedabad & Gujarat."}
              </p>
            </div>
          </div>

          {/* Quick Stats Badges & Refresh */}
          <div className="flex items-center flex-wrap gap-2 text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-semibold flex items-center space-x-1.5 border border-slate-200/60 dark:border-slate-700/60">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>{t?.heatmap?.totalSpots || "Total Active"}:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">{stats.total}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 font-semibold flex items-center space-x-1.5 border border-red-200/50 dark:border-red-900/50">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              <span>{t?.heatmap?.highPriority || "High Risk Zones"}:</span>
              <span className="font-bold text-red-600 dark:text-red-400">{stats.high}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold flex items-center space-x-1.5 border border-emerald-200/50 dark:border-emerald-900/50">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>{t?.heatmap?.resolvedSpots || "Resolved"}:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{stats.resolved}</span>
            </div>
            <button
              onClick={fetchHeatmapData}
              title="Refresh Map & GPS Data"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      )}

      {/* Filter and Ward Jump Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Category Pills */}
        <div className="md:col-span-7 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-500/40"
                  : "bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 hover:border-blue-400"
              }`}
            >
              {cat === "All" ? t?.heatmap?.allCategories || "All Issues" : cat}
            </button>
          ))}
        </div>

        {/* Status Filter & Landmark Dropdown */}
        <div className="md:col-span-5 flex items-center space-x-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-1/2 px-3 py-1.5 text-xs font-medium rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          >
            <option value="All">{t?.heatmap?.allStatuses || "All Statuses"}</option>
            <option value="Pending">Pending Only (બાકી)</option>
            <option value="In Progress">In Progress (કામ ચાલુ)</option>
            <option value="Resolved">Resolved (સમાધાન થયેલ)</option>
          </select>

          <select
            onChange={(e) => {
              const landmark = WARD_CENTERS.find((w) => w.name === e.target.value);
              if (landmark) jumpToWard(landmark.coords, landmark.zoom);
            }}
            className="w-1/2 px-3 py-1.5 text-xs font-medium rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          >
            <option value="">{t?.heatmap?.jumpWard || "Zoom to Landmark..."}</option>
            {WARD_CENTERS.map((w) => (
              <option key={w.name} value={w.name}>
                📍 {w.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Map Box & Floating Controls */}
      <div
        className="relative isolate z-10 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl bg-slate-900 group"
        style={{ height }}
      >
        {/* Leaflet Mount Container */}
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Google Maps Layer Switcher Floating Dock (Top Left) */}
        <div className="absolute top-4 left-4 z-[400] flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-white/90 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-xl pointer-events-auto">
          <div className="px-2 py-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center space-x-1 border-r border-slate-200 dark:border-slate-800 mr-0.5">
            <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            <span className="hidden sm:inline">{t?.heatmap?.mapEngine || "Layer"}:</span>
          </div>

          {GOOGLE_MAP_LAYERS.map((layer) => {
            const isActive = activeLayer === layer.id;
            return (
              <button
                key={layer.id}
                onClick={() => switchMapLayer(layer.id)}
                title={layer.name}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-400"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80"
                }`}
              >
                <span>{layer.icon}</span>
                <span className="hidden md:inline">{layer.name}</span>
                <span className="text-[10px] opacity-80 md:hidden">{layer.badge}</span>
              </button>
            );
          })}

          {/* Heat Cloud Density Toggle */}
          <button
            onClick={() => setShowHeatCloud(!showHeatCloud)}
            title="Toggle Gaussian Density Heat Cloud"
            className={`ml-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 border ${
              showHeatCloud
                ? "bg-gradient-to-r from-amber-500 to-red-600 text-white border-transparent shadow-md shadow-red-500/30"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${showHeatCloud ? "animate-pulse" : ""}`} />
            <span className="hidden sm:inline">
              {t?.heatmap?.heatCloudToggle || "Heat Cloud"}: {showHeatCloud ? "ON" : "OFF"}
            </span>
          </button>
        </div>

        {/* Floating Quick Action Recenter Button (Top Right next to details or zoom) */}
        <div className="absolute top-4 right-4 z-[400] flex items-center space-x-2 pointer-events-auto">
          <button
            onClick={resetAhmedabadView}
            title="Reset View to Ahmedabad"
            className="p-2.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-md text-slate-700 dark:text-slate-200 hover:bg-blue-600 hover:text-white transition flex items-center space-x-1.5 text-xs font-bold"
          >
            <Crosshair className="w-4 h-4 text-blue-500 group-hover:text-white" />
            <span className="hidden sm:inline">Ahmedabad Center</span>
          </button>
        </div>

        {/* Floating Map Legend (Bottom Left) */}
        <div className="absolute bottom-4 left-4 z-[400] p-3 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md shadow-xl text-xs space-y-1.5 max-w-xs pointer-events-auto">
          <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-500" />
              <span>GIS Risk Index</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">LIVE GPS</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
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

        {/* Live GPS Coordinates Status Bar (Bottom Center) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[390] hidden md:flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900/80 text-white/90 text-[11px] font-mono border border-white/10 backdrop-blur-md shadow-lg pointer-events-none">
          <MapPin className="w-3 h-3 text-red-400" />
          <span>Lat: {mapCoords.lat}° N</span>
          <span className="text-white/40">•</span>
          <span>Lng: {mapCoords.lng}° E</span>
          <span className="text-white/40">•</span>
          <span>Zoom: {mapCoords.zoom}x</span>
        </div>

        {/* Selected Complaint Detail Floating Card (Top Right) */}
        {selectedPoint && (
          <div className="absolute top-16 right-4 z-[410] w-84 sm:w-96 p-4 rounded-3xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700 shadow-2xl backdrop-blur-xl text-slate-900 dark:text-white pointer-events-auto animate-in fade-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                  #{selectedPoint.complaint_id}
                </span>
                <span
                  className={`px-2 py-0.5 text-[11px] font-bold rounded-lg ${
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
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-base font-bold p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            {/* Title & Department */}
            <h4 className="mt-2.5 text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
              <span>{selectedPoint.category}</span>
              {selectedPoint.source === "WhatsApp" && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300 font-semibold">
                  WhatsApp Bot
                </span>
              )}
            </h4>

            {/* Location & Ward */}
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span className="font-semibold">{selectedPoint.area}</span>
              {selectedPoint.ward && <span className="opacity-75">({selectedPoint.ward})</span>}
            </p>

            {/* Description */}
            <p className="mt-2 text-xs text-slate-700 dark:text-slate-300 line-clamp-3 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
              "{selectedPoint.description}"
            </p>

            {/* AI Vision Tags Badge */}
            {selectedPoint.vision_tags && (
              <div className="mt-2 text-[11px] text-blue-600 dark:text-blue-400 font-mono flex items-center space-x-1 bg-blue-50/60 dark:bg-blue-950/40 p-1.5 rounded-lg border border-blue-200/50 dark:border-blue-900/50">
                <span>🤖 Gemini Vision:</span>
                <span className="truncate font-semibold">{selectedPoint.vision_tags}</span>
              </div>
            )}

            {/* Photo Preview if available */}
            {selectedPoint.photo && (
              <div className="mt-2.5 relative h-28 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                <img
                  src={`http://localhost:5000/api/uploads/${selectedPoint.photo}`}
                  alt="Issue preview"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = `/uploads/${selectedPoint.photo}`;
                  }}
                />
                <span className="absolute bottom-1 right-1 px-2 py-0.5 text-[9px] bg-black/75 text-white rounded-md font-mono backdrop-blur-sm">
                  {selectedPoint.status === "Resolved" ? "Before Repair" : "Citizen Upload"}
                </span>
              </div>
            )}

            {/* GOOGLE MAPS DIRECT ACTION BUTTONS */}
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                <Compass className="w-3 h-3 text-blue-500" />
                <span>Google Maps Deep Navigation</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* 1. Google Maps Directions / Navigation */}
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPoint.latitude},${selectedPoint.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-[11px] font-bold flex items-center justify-center space-x-1.5 border border-blue-200 dark:border-blue-800 transition shadow-sm"
                >
                  <Car className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>{t?.heatmap?.navigateGoogle || "Navigation"}</span>
                </a>

                {/* 2. Google Street View 360° */}
                <a
                  href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${selectedPoint.latitude},${selectedPoint.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 text-[11px] font-bold flex items-center justify-center space-x-1.5 border border-amber-200 dark:border-amber-800 transition shadow-sm"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>{t?.heatmap?.streetView || "Street View 360°"}</span>
                </a>
              </div>

              {/* 3. NagarSathi Ticket Tracking Page */}
              <Link
                href={`/track/${selectedPoint.complaint_id}`}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md shadow-blue-500/25 transition"
              >
                <span>{t?.heatmap?.trackIssue || "View Full Ticket & AI Proof"}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* AI Ward Analysis Bottom Summary */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-500/20 text-xs text-slate-700 dark:text-slate-300 flex items-center space-x-3.5 shadow-sm">
        <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex-shrink-0 shadow-md">
          <Info className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-blue-600 dark:text-blue-400">
              {t?.heatmap?.aiSummary || "AI Ward Analysis: High density pothole clusters detected in Ward 7 Navrangpura and Satellite."}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            GIS heat algorithm automatically weighs complaints by public hazard severity and cluster proximity. Integrated with high-resolution Google Maps & Satellite imagery.
          </p>
        </div>
      </div>
    </div>
  );
}
