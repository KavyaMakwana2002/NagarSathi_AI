const rawUrl = process.env.NEXT_PUBLIC_API_URL || "https://nagarsathi-ai.onrender.com/api";
const cleanUrl = rawUrl.replace(/\/+$/, "");
export const BASE_URL = cleanUrl.endsWith("/api") ? cleanUrl : `${cleanUrl}/api`;

// In-memory response cache to ensure instantaneous UI clicks
const _memCache = {
  complaints: {},
  complaintsTs: 0,
  stats: null,
  statsTs: 0,
  citizenComplaints: {},
  citizenComplaintsTs: 0,
};

export async function submitComplaint(formData) {
  _memCache.complaints = {}; // Invalidate cache on new submission
  _memCache.stats = null;
  const response = await fetch(`${BASE_URL}/complaints`, {
    method: "POST",
    body: formData,
  });
  return response.json();
}

export async function getComplaints(filters = {}, forceRefresh = false) {
  const params = new URLSearchParams();
  if (filters.status) params.append("status", filters.status);
  if (filters.category) params.append("category", filters.category);
  if (filters.priority) params.append("priority", filters.priority);
  if (filters.area) params.append("area", filters.area);

  const key = params.toString() || "all";
  const now = Date.now();

  // Return from micro-cache instantly (within 6 seconds) for fast snappy UI
  if (!forceRefresh && _memCache.complaints[key] && (now - _memCache.complaintsTs < 6000)) {
    return _memCache.complaints[key];
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const response = await fetch(`${BASE_URL}/complaints?${params.toString()}`, {
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!response.ok) throw new Error("HTTP error");
    const data = await response.json();
    _memCache.complaints[key] = data;
    _memCache.complaintsTs = now;
    return data;
  } catch (err) {
    if (_memCache.complaints[key]) return _memCache.complaints[key];
    return { success: false, count: 0, complaints: [] };
  }
}

export async function getComplaintById(id) {
  const response = await fetch(`${BASE_URL}/complaints/${id}`, {
    cache: "no-store",
  });
  return response.json();
}

export async function deleteComplaint(complaintId) {
  _memCache.complaints = {}; // Invalidate cache on delete
  _memCache.stats = null;
  const response = await fetch(`${BASE_URL}/complaints/${encodeURIComponent(complaintId)}`, {
    method: "DELETE",
  });
  return response.json();
}

export async function trackComplaints(query) {
  const response = await fetch(`${BASE_URL}/track/${encodeURIComponent(query)}`, {
    cache: "no-store",
  });
  return response.json();
}

export async function adminLogin(username, password) {
  const response = await fetch(`${BASE_URL}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return response.json();
}

export async function updateComplaintStatus(complaintId, status, remarks = "") {
  _memCache.complaints = {}; // Invalidate cache on status update
  _memCache.stats = null;
  const response = await fetch(`${BASE_URL}/admin/complaints/${complaintId}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, remarks }),
  });
  return response.json();
}

export async function getAdminStats(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && _memCache.stats && (now - _memCache.statsTs < 6000)) {
    return _memCache.stats;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const response = await fetch(`${BASE_URL}/admin/stats`, {
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!response.ok) throw new Error("HTTP error");
    const data = await response.json();
    _memCache.stats = data;
    _memCache.statsTs = now;
    return data;
  } catch (err) {
    if (_memCache.stats) return _memCache.stats;
    return { success: false, metrics: null };
  }
}

// Citizen Authentication & Dashboard
export async function citizenLogin(mobile, password = "") {
  const response = await fetch(`${BASE_URL}/citizen/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mobile, password }),
  });
  return response.json();
}

export async function citizenRegister(name, mobile, area, password = "") {
  const response = await fetch(`${BASE_URL}/citizen/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, mobile, area, password }),
  });
  return response.json();
}

export async function getCitizenComplaints(mobile, forceRefresh = false) {
  const key = mobile || "citizen";
  const now = Date.now();
  if (!forceRefresh && _memCache.citizenComplaints[key] && (now - _memCache.citizenComplaintsTs < 6000)) {
    return _memCache.citizenComplaints[key];
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const response = await fetch(`${BASE_URL}/citizen/complaints/${encodeURIComponent(mobile)}`, {
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!response.ok) throw new Error("HTTP error");
    const data = await response.json();
    _memCache.citizenComplaints[key] = data;
    _memCache.citizenComplaintsTs = now;
    return data;
  } catch (err) {
    if (_memCache.citizenComplaints[key]) return _memCache.citizenComplaints[key];
    return { success: false, count: 0, complaints: [] };
  }
}

export async function verifyPhoto(file, category) {
  const formData = new FormData();
  formData.append("photo", file);
  formData.append("category", category);
  const response = await fetch(`${BASE_URL}/complaints/verify-photo`, {
    method: "POST",
    body: formData,
  });
  return response.json();
}

export async function getHeatmapData(category = "All", status = "All") {
  const url = `${BASE_URL}/complaints/heatmap?category=${encodeURIComponent(category)}&status=${encodeURIComponent(status)}`;
  const response = await fetch(url, { cache: "no-store" });
  return response.json();
}

export function getUploadUrl(filename) {
  if (!filename) return null;
  if (filename.startsWith("http://") || filename.startsWith("https://")) return filename;
  return `${BASE_URL}/uploads/${filename}`;
}

import LOCAL_RESERVOIRS from "@/data/jalbodh_reservoirs.json";
import LOCAL_GROUNDWATER from "@/data/jalbodh_groundwater.json";
import LOCAL_LEAKAGE from "@/data/jalbodh_leakage.json";

// =========================================================================
// JALBODH AI (FORMERLY JAL DRISHTI) WATER INTELLIGENCE INTEGRATION
// =========================================================================

const JALBODH_BASE = "https://jaldrishti-theta.vercel.app/api/engines";

// Default Fallback Datasets (Robust against network drops - Full 150 Dams)
export const FALLBACK_RESERVOIRS = LOCAL_RESERVOIRS;
export const FALLBACK_GROUNDWATER = LOCAL_GROUNDWATER;
export const FALLBACK_LEAKAGE = LOCAL_LEAKAGE;

export async function getJalBodhReservoirs() {
  return LOCAL_RESERVOIRS;
}

export async function getJalBodhGroundwater() {
  return LOCAL_GROUNDWATER;
}

export async function getJalBodhLeakage() {
  return LOCAL_LEAKAGE;
}

// Aliases for backwards compatibility
export const getJalDrishtiReservoirs = getJalBodhReservoirs;
export const getJalDrishtiGroundwater = getJalBodhGroundwater;
export const getJalDrishtiLeakage = getJalBodhLeakage;
