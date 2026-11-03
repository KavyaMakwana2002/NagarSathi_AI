const rawUrl = process.env.NEXT_PUBLIC_API_URL || "https://nagarsathi-ai.onrender.com/api";
const cleanUrl = rawUrl.replace(/\/+$/, "");
export const BASE_URL = cleanUrl.endsWith("/api") ? cleanUrl : `${cleanUrl}/api`;

export async function submitComplaint(formData) {
  const response = await fetch(`${BASE_URL}/complaints`, {
    method: "POST",
    body: formData, // FormData handles multipart file + text
  });
  return response.json();
}

export async function getComplaints(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.append("status", filters.status);
  if (filters.category) params.append("category", filters.category);
  if (filters.priority) params.append("priority", filters.priority);
  if (filters.area) params.append("area", filters.area);

  const response = await fetch(`${BASE_URL}/complaints?${params.toString()}`, {
    cache: "no-store",
  });
  return response.json();
}

export async function getComplaintById(id) {
  const response = await fetch(`${BASE_URL}/complaints/${id}`, {
    cache: "no-store",
  });
  return response.json();
}

export async function deleteComplaint(complaintId) {
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
  const response = await fetch(`${BASE_URL}/admin/complaints/${complaintId}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, remarks }),
  });
  return response.json();
}

export async function getAdminStats() {
  const response = await fetch(`${BASE_URL}/admin/stats`, {
    cache: "no-store",
  });
  return response.json();
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

export async function getCitizenComplaints(mobile) {
  const response = await fetch(`${BASE_URL}/citizen/complaints/${encodeURIComponent(mobile)}`, {
    cache: "no-store",
  });
  return response.json();
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
  try {
    if (typeof window !== "undefined") {
      const res = await fetch(`${JALBODH_BASE}/reservoirs`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    }
    return LOCAL_RESERVOIRS;
  } catch (err) {
    return LOCAL_RESERVOIRS;
  }
}

export async function getJalBodhGroundwater() {
  try {
    if (typeof window !== "undefined") {
      const res = await fetch(`${JALBODH_BASE}/groundwater`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    }
    return LOCAL_GROUNDWATER;
  } catch (err) {
    return LOCAL_GROUNDWATER;
  }
}

export async function getJalBodhLeakage() {
  try {
    if (typeof window !== "undefined") {
      const res = await fetch(`${JALBODH_BASE}/leakage`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    }
    return LOCAL_LEAKAGE;
  } catch (err) {
    return LOCAL_LEAKAGE;
  }
}

// Aliases for backwards compatibility
export const getJalDrishtiReservoirs = getJalBodhReservoirs;
export const getJalDrishtiGroundwater = getJalBodhGroundwater;
export const getJalDrishtiLeakage = getJalBodhLeakage;
