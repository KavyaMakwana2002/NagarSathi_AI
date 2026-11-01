export const CIVIC_CATEGORIES = [
  { id: "Road & Potholes", labelEn: "Roads & Potholes", labelGu: "રસ્તા અને ખાડા", icon: "Car", color: "from-amber-500 to-orange-600" },
  { id: "Garbage & Sanitation", labelEn: "Garbage & Sanitation", labelGu: "કચરો અને સફાઈ", icon: "Trash2", color: "from-emerald-500 to-teal-600" },
  { id: "Water Supply", labelEn: "Water Supply & Leakage", labelGu: "પાણી પુરવઠો અને લીકેજ", icon: "Droplets", color: "from-blue-500 to-cyan-600" },
  { id: "Street Light", labelEn: "Street Lights & Poles", labelGu: "સ્ટ્રીટ લાઈટ અને થાંભલા", icon: "Lightbulb", color: "from-yellow-500 to-amber-600" },
  { id: "Drainage & Sewage", labelEn: "Drainage & Overflow", labelGu: "ગટર અને ડ્રેનેજ", icon: "ShieldAlert", color: "from-purple-500 to-indigo-600" },
  { id: "Public Health", labelEn: "Stray Animals & Health", labelGu: "જાહેર આરોગ્ય અને ઢોર", icon: "HeartPulse", color: "from-rose-500 to-pink-600" },
  { id: "Other Civic Issue", labelEn: "Other Issues", labelGu: "અન્ય નાગરિક સમસ્યા", icon: "HelpCircle", color: "from-slate-500 to-gray-600" },
];

export const GUJARAT_AREAS = [
  "Navrangpura (Ward 7)",
  "Maninagar (Ward 14)",
  "Satellite / Bodakdev",
  "Vastrapur / SG Highway",
  "Prahlad Nagar",
  "Bopal - South Bopal",
  "Sabarmati / Chandkheda",
  "Ghatlodia / Memnagar",
  "Ellisbridge / Paldi",
  "Old City / Kalupur",
  "Varachha (Surat)",
  "Adajan (Surat)",
  "Alkapuri (Vadodara)",
  "Kalawad Road (Rajkot)"
];

export const PRIORITY_CONFIG = {
  High: {
    labelEn: "High Priority",
    labelGu: "તાકીદની સમસ્યા (High)",
    badgeClass: "bg-red-500/15 text-red-600 border border-red-500/30",
    dotClass: "bg-red-500"
  },
  Medium: {
    labelEn: "Medium Priority",
    labelGu: "સામાન્ય સમસ્યા (Medium)",
    badgeClass: "bg-amber-500/15 text-amber-600 border border-amber-500/30",
    dotClass: "bg-amber-500"
  },
  Low: {
    labelEn: "Low Priority",
    labelGu: "ઓછી તાકીદ (Low)",
    badgeClass: "bg-blue-500/15 text-blue-600 border border-blue-500/30",
    dotClass: "bg-blue-500"
  }
};

export const STATUS_CONFIG = {
  Pending: {
    labelEn: "Pending Review",
    labelGu: "પ્રતીક્ષામાં (Pending)",
    color: "bg-amber-100 text-amber-800 border-amber-300",
    icon: "Clock"
  },
  "In Progress": {
    labelEn: "In Progress",
    labelGu: "કાર્યવાહી હેઠળ (In Progress)",
    color: "bg-blue-100 text-blue-800 border-blue-300",
    icon: "Hammer"
  },
  Resolved: {
    labelEn: "Resolved",
    labelGu: "ઉકેલાઈ ગયેલ (Resolved)",
    color: "bg-emerald-100 text-emerald-800 border-emerald-300",
    icon: "CheckCircle2"
  },
  Rejected: {
    labelEn: "Invalid / Duplicate",
    labelGu: "અમાન્ય / રદ કરેલ",
    color: "bg-slate-100 text-slate-700 border-slate-300",
    icon: "XCircle"
  }
};
