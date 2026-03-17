# SCCL Uganda — Sickle Cell Care Locator

A full-stack web application helping patients find sickle cell care facilities across Mukono District, Uganda.

**Stack:** React + Vite · Supabase (auth + database) · Leaflet + OpenStreetMap · Netlify

---

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd sccl-uganda
npm install
```

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your **Project URL** and **anon public key** from Settings → API
3. In the Supabase SQL Editor, run the entire contents of `supabase_schema.sql`
4. This seeds hospitals and emergency contacts for Mukono District

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_ADMIN_EMAIL=your-admin-email@example.com
```

### 4. Run Locally

```bash
npm run dev
```

Visit `http://localhost:5173`

---

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/        # Navbar, Footer, Layout
│   ├── map/           # Leaflet map component
│   └── ui/            # Button, Card, Input, Modal, etc.
├── context/
│   ├── AuthContext    # Supabase auth state
│   └── ThemeContext   # Dark/light mode
├── lib/
│   └── supabase.js    # Supabase client
└── pages/
    ├── Home.jsx        # Landing page
    ├── Search.jsx      # Facility search + filters
    ├── Map.jsx         # Interactive Leaflet map
    ├── Facility.jsx    # Facility profile
    ├── Emergency.jsx   # Emergency contacts
    ├── HowItWorks.jsx  # User guide
    ├── Dashboard.jsx   # Patient dashboard
    ├── Auth.jsx        # Login/Signup/ForgotPassword
    ├── admin/
    │   └── AdminPage.jsx       # Site owner CRUD (/sccl-admin)
    └── hospital/
        ├── DoctorSignup.jsx    # Doctor registration (/hospital/register)
        ├── DoctorPortal.jsx    # Doctor dashboard (/doctor)
        ├── DoctorSettings.jsx  # Doctor settings (/doctor/settings)
        └── HospitalAdmin.jsx   # Hospital management (/hospital/manage)
```

---

## 🔗 URL Reference

| URL | Description | Public? |
|-----|-------------|---------|
| `/` | Home / landing page | ✅ Public |
| `/search` | Facility search & filters | ✅ Public |
| `/map` | Interactive map | ✅ Public |
| `/facility/:id` | Facility profile | ✅ Public |
| `/emergency` | Emergency contacts | ✅ Public |
| `/how-it-works` | User guide | ✅ Public |
| `/login` | Patient login | ✅ Public |
| `/signup` | Patient registration | ✅ Public |
| `/dashboard` | Patient dashboard | 🔒 Auth |
| `/doctor` | Doctor portal dashboard | 🔒 Doctor |
| `/doctor/settings` | Doctor settings | 🔒 Doctor |
| `/hospital/register` | **Doctor signup** (admin2 entry) | ✅ Public URL, not linked |
| `/hospital/manage` | Hospital facility editor | 🔒 Approved doctor |
| `/sccl-admin` | **Site owner admin** (admin1) | 🔒 Admin only, not linked |

### Admin Pages (not publicly linked)
- **`/sccl-admin`** — Full CRUD for hospitals, doctor approval, emergency contacts. Protected by `VITE_ADMIN_EMAIL` or `admin` role in Supabase.
- **`/hospital/register`** — Doctor self-registration form. Links to the hospital portal after admin approval.

---

## 👤 User Roles

| Role | How Created | Access |
|------|------------|--------|
| `patient` | Signs up via `/signup` | Patient dashboard, save favorites |
| `doctor` | Signs up via `/hospital/register` + admin approval | Doctor portal, edit their hospital |
| `admin` | Manually set in Supabase profiles table | Full `/sccl-admin` access |

### Making yourself admin (Supabase SQL):
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

---

## 🌐 Deploy to Netlify

1. Push code to GitHub
2. Connect repo to Netlify
3. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Add environment variables in Netlify site settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ADMIN_EMAIL`
5. The `netlify.toml` handles SPA routing automatically

---

## 🎨 Design System

- **Fonts:** Sora (display) + DM Sans (body)
- **Colors:** Blue `#2563eb` primary, red `#dc2626` emergency, green `#16a34a` success
- **Dark mode:** Toggled via button in navbar, persisted in localStorage
- **Responsive:** Works on mobile, tablet, and desktop
- **Maps:** OpenStreetMap tiles via Leaflet (no API key required)

---

## 🗄️ Database Tables

| Table | Description |
|-------|-------------|
| `profiles` | All users (patients, doctors, admins) |
| `hospitals` | Facilities with location & contact info |
| `hospital_services` | SCD services available per hospital |
| `hospital_specialists` | Specialist staff and clinic schedules |
| `doctors` | Doctor-hospital relationships |
| `emergency_contacts` | Ambulance, hotlines, triage units |
| `patient_favorites` | Saved hospitals per patient |
| `education_articles` | SCD education content (optional) |

---

## 📞 Support

Contact: support@sccl.ug | Mukono District, Uganda
