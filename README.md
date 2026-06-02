# 🌍 Hidden India AI - "Travel Like a Local, Not Like a Tourist"

### 🎯 Proportional Hackathon Design • Powered by Server-side Google Gemini 3.5

**Hidden India AI** is a premium, full-stack, tourism intelligence platform that flips the travel equation: instead of guiding you to commercial globalized tourist traps, it curates off-grid, culturally rich, safe travel experiences, local tribal workshops, secret waterfalls, and village calendars.

---

## 🏛️ Project Directory Structure

```text
/
├── server.ts              # Express Server entry point (serves as backend & Vite proxy)
├── package.json           # Application dependencies, esbuild bundlers & port configs
├── tsconfig.json          # Strict TypeScript compiler boundaries
├── vite.config.ts         # Vite bundler, asset alias definitions, and HMR toggles
├── index.html             # High-end typographic paired index entry
├── supabase-schema.sql    # Relational Database SQL Schema with Row Level Security (RLS)
└── src/
    ├── main.tsx           # React bootstrap script
    ├── App.tsx            # Parenting coordinate wrapper managing onboarding & active states
    ├── index.css          # Core Styling sheets importing custom geometric "Plus Jakarta Sans" font
    ├── types.ts           # Shared TypeScript models (UserProfile, HiddenGem, etc.)
    ├── data/
    │   └── mockData.ts    # Elite high-fidelity fallback dataset (for offline safety verification)
    └── components/
        ├── UserProfileForm.tsx      # Onboarding selection screen (Step 1 flow)
        ├── InteractiveMap.tsx       # Leaflet.js and OpenStreetMap GIS dynamic tracking
        ├── HiddenGems.tsx           # Off-axis discovery card modules
        ├── CulturalExperiences.tsx  # Hero regional rituals matched with match score meters
        ├── WhyNowEngine.tsx         # Climate-fit and festivity seasonal urgency scorer
        ├── SafetyEngine.tsx         # Age & Experience customized transportation/security audit
        ├── NextDestination.tsx      # Predictor showing India coordinates & International analogs
        ├── ItineraryGenerator.tsx   # Detailed 1-Day, 3-Day, and 5-Day customizable timelines
        └── AICompanion.tsx          # Real-time voice/message regional guide chatbot
```

---

## 🚀 Key Architectural Features

1. **Step 1: Adaptive Escape Engine** - Secure sliders, style selects (Solo, couple, friends, family), budget indices, and multiple visited selects.
2. **Feature 1: Off-axis Treasure Radar** - Discovers hidden non-commercial properties, mapped directly onto customizable Leaflet maps.
3. **Feature 2: Village Rituality (Hero Feature)** - Explores temple schedules and native art forms with a calculated *Experience Match Score* out of 100%.
4. **Feature 3: Strategic Urgency Scorer** - Explains clearly why the trip should happen now (weather peaks, native festivals).
5. **Feature 4: Live Security Audit** - Generates safety indices based on user age and experience.
6. **Feature 5: Next Analog Predictor** - Generates 1 local India place and 1 international analogy based on historic tracks.
7. **Feature 6: AI Itinerary Timelines** - 1-Day, 3-Day, and 5-Day timelines comprising AM, PM, and EV intervals with direct culinary and financial estimates.
8. **Feature 7: GIS Interactivity** - Fully configured Leaflet tiles featuring custom locator buttons.
9. **Feature 8: Local Guide Chatbot** - Server-side Gemini chat interface containing immediate quick-help query chips.

---

## ⚙️ Environment Configurations

Declare these parameters within your environment or `.env` files:

```env
# GEMINI_API_KEY: Standard server-side AI API key.
# Excluded from the browser bundle entirely to secure backend access keys.
GEMINI_API_KEY="AI_STUDIO_USER_SECRET_KEY"

# APP_URL: Base URL where developer workspace compiles.
APP_URL="DEVELOPER_CONTAINER_SERVICE_URL"
```

---

## 💻 Running the Application Immediately

Inside your sandbox directory, simply invoke:

```bash
# 1. Install all dependencies
npm install

# 2. Boot development environment (Launches TSX compiler proxy on PORT 3000)
npm run dev

# 3. Production compilations
npm run build
```

---

## ☁️ Deployment Guide

### **Deploying to Vercel (Frontend + Serverless)**
1. Connect your repository to Vercel.
2. Set the Framework Preset to **Vite**.
3. Insert `GEMINI_API_KEY` into your Vercel Project Secrets Dashboard.
4. Set Build command to: `npm run build`.

### **Setting up Supabase Database**
1. Copy the raw database structures from `/supabase-schema.sql`.
2. Access your Supabase Database SQL Editor.
3. Paste and click **Run** to seed historical hidden locations immediately.
