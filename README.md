# 🏙️ NagarSathi AI – Smart City Civic Problem Solver

> **Tagline:** *Your Voice, A Smarter City.*  
> **Track:** Smart Society and Social Impact  
> **Target Audience:** Citizens, Ward Municipal Officers & Smart City Command Centers across Gujarat & India.

---

## 📌 Executive Summary
**NagarSathi AI** revolutionizes municipal civic complaint management. Instead of long manual queues and duplicate complaints, citizens can report civic issues (potholes, garbage, water leaks, broken streetlights) simply by taking a photo and **speaking or writing in Gujarati**. 

Powered by **Google Gemini Multimodal AI**, the platform instantly categorizes the issue, assesses its severity (High/Medium/Low priority), detects duplicate reports within the same locality, and assigns them to the appropriate municipal department.

---

## 🌟 Key Innovations for Hackathon Judges (100 Points Evaluation)

1. **Interactive Civic Heatmap (GIS Geospatial Hazard Zones - Innovation & Originality):**
   - Leaflet & OpenStreetMap geospatial mapping plotting red/amber/green civic hazard zones across Gujarat/Ahmedabad wards with category filters.
2. **Gemini Vision AI – Before & After Photo Verification:**
   - Multimodal photo verification on uploaded issues + interactive Before-and-After image slider for resolved complaints with officer proof upload.
3. **WhatsApp AI Civic Bot (Social Impact & Digital Inclusion):**
   - Enables elderly and daily-wage citizens to report civic issues natively over WhatsApp in Gujarati with automated ticket creation.
4. **AI Duplicate Detection & Ticket Clustering:**
   - Clusters identical complaints in the same locality under a single parent ticket and boosts urgency, eliminating municipal backlogs.
5. **Bilingual Gujarati Voice-to-Text Support (Problem Relevance):**
   - Digital inclusion for citizens who speak Gujarati; speech-to-text recognition converts speech into complaints.
6. **Decoupled Cloud Architecture (Technical Implementation):**
   - **Frontend (Vercel):** Next.js 14 + React + Tailwind CSS with dark/light themes and bilingual translation context.
   - **Backend (Render):** Python Flask REST API with Google Gemini 1.5 Multimodal AI engine and SQLite persistence.
7. **Transparent Governance (Potential Impact):**
   - Real-time resolution timeline tracking for citizens; KPI analytics and status management for Municipal Officers.
8. **Ready Live Demo (Presentation):**
   - Pre-configured demo login for judges (`admin` / `admin123` & `9876543210` / `123456`).

---

## 🏗️ System Architecture

```
                  ┌──────────────────────────────────────────────┐
                  │          Citizen / Municipal Officer         │
                  └──────────────────────┬───────────────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │     Frontend: Next.js + React + Tailwind     │
                  │              (Hosted on Vercel)              │
                  │  - Mobile Bottom Nav (DTStreetVoice style)   │
                  │  - Gujarati Speech-to-Text Voice Input       │
                  │  - Real-time Status Tracking Timeline        │
                  └──────────────────────┬───────────────────────┘
                                         │ REST API
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │      Backend: Python Flask + Gunicorn        │
                  │              (Hosted on Render)              │
                  │  - RESTful Endpoints (/api/complaints)       │
                  │  - Duplicate Detection Clustering Engine     │
                  └──────────────┬───────────────────────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
    ┌───────────────────────────┐   ┌───────────────────────────┐
    │     Google Gemini AI      │   │    SQLite / PostgreSQL    │
    │  - Multimodal Vision      │   │  - Complaints & Upvotes   │
    │  - Category Classification│   │  - Municipal Admins       │
    │  - Priority Assessment    │   │  - Audit Logs & Timeline  │
    └───────────────────────────┘   └───────────────────────────┘
```

---

## 📁 Repository Structure

```text
NagarSathi_AI/
│
├── frontend/                     # [Vercel Deployment] Next.js + React + Tailwind CSS
│   ├── app/                      # App router (Home, Complaint Form, Track, Admin Dashboard)
│   ├── components/               # Navbar, BottomNav, ComplaintCard, ImageUploader, VoiceInput
│   ├── lib/                      # API client & Constants (Gujarati Wards & Categories)
│   ├── public/                   # PWA Manifest & App Icons
│   ├── tailwind.config.js        # Responsive styling & civic theme
│   └── .env.local                # Backend URL pointer
│
├── backend/                      # [Render Deployment] Python Backend
│   ├── app.py                    # Flask server & CORS configuration
│   ├── config.py                 # Environment variables loader
│   ├── database.py               # SQLite schema & Admin seeder
│   ├── models.py                 # Data serialisation helpers
│   ├── services/                 # AI service, Duplicate detection, Image storage
│   ├── routes/                   # Complaints, Admin Auth, Analytics APIs
│   ├── requirements.txt          # Python dependencies
│   ├── Procfile                  # Render launch command
│   └── .env                      # Gemini API Key & Secrets
│
├── .gitignore
└── README.md
```

---

## ⚡ Quick Start (Local Run)

### 1. Run Python Backend:
```bash
cd backend
python -m venv .venv
# On Windows:
.venv\Scripts\Activate.ps1
# On Mac/Linux:
source .venv/bin/activate

pip install -r requirements.txt
python database.py
python app.py
```
*Backend runs on `http://127.0.0.1:5000`*

### 2. Run Next.js Frontend:
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000`*

---

## 🔑 Demo Admin Credentials
- **URL:** `http://localhost:3000/admin/login`
- **Username:** `admin`
- **Password:** `admin123`

---

## 🚀 Cloud Deployment Instructions

### A. Deploy Backend to Render:
1. Create a **New Web Service** on [Render](https://render.com).
2. Root Directory: `backend`
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `gunicorn app:app`
5. Add Environment Variables:
   - `GEMINI_API_KEY`: *(Your Google AI Studio Key)*
   - `SECRET_KEY`: `nagarsathi_prod_secret_2026`

### B. Deploy Frontend to Vercel:
1. Import repository on [Vercel](https://vercel.com).
2. Root Directory: `frontend`
3. Framework Preset: `Next.js`
4. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL`: `https://<your-render-app>.onrender.com/api`
5. Click **Deploy**! 🚀
