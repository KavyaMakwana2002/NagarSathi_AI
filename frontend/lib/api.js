const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

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
