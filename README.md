# Uburiza Learn — Frontend

A modern, African-led digital learning platform built with React and Vite. Uburiza Learn connects learners across Africa with premium courses in Technology, Business, Finance, and Agriculture.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Features](#features)
- [Roles & Access](#roles--access) //
- [API Integration](#api-integration)
- [Deployment](#deployment)
- [Demo Credentials](#demo-credentials)
- [Known Issues & Troubleshooting](#known-issues--troubleshooting)

---

## Overview

Uburiza Learn is a full-featured e-learning platform with:

- Public course catalog and landing page
- Learner dashboard with enrollment tracking and certificates
- Admin dashboard with analytics, course management, and access codes
- JWT-based authentication with email verification and password reset
- PWA support for offline access
- Dark mode support

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 8 |
| Styling | Tailwind CSS v4 |
| State / Data Fetching | TanStack React Query v5 |
| HTTP Client | Axios |
| Animations | Framer Motion |
| Icons | Lucide React |
| Charts | Recharts |
| AI Widget | Google Generative AI (`@google/genai`) |
| PWA | vite-plugin-pwa + Workbox |
| Fonts | Inter, Fraunces (Google Fonts) |

---

## Project Structure

```
src/
├── api/                  # API layer
│   ├── hooks/            # TanStack Query custom hooks
│   ├── api_config.js     # Axios instance with interceptors
│   ├── auth.js           # Auth API calls
│   ├── auth-session.js   # Session persistence helpers
│   ├── query-client.js   # QueryClient configuration
│   └── *_api.js          # Resource-specific API modules
├── components/           # Shared UI components
│   ├── TopNav.jsx        # Authenticated navigation bar
│   ├── TopNavPublic.jsx  # Public navigation bar
│   ├── Sidebar.jsx       # Dashboard sidebar
│   ├── Footer.jsx        # Site footer
│   ├── PaymentModal.jsx  # Payment flow modal
│   └── AIAssistantWidget.jsx
├── context/
│   └── AppContext.jsx    # Global state (user, theme, role)
├── views/                # Page-level components
│   ├── LandingPage.jsx
│   ├── CourseCatalog.jsx
│   ├── CourseOverview.jsx
│   ├── CourseMaterial.jsx
│   ├── LearnerDashboard.jsx
│   ├── MyCourses.jsx
│   ├── CertificateView.jsx
│   ├── OperationalAnalytics.jsx
│   ├── AdminManagementForms.jsx
│   ├── Login.jsx / Signup.jsx
│   ├── VerifyEmail.jsx
│   ├── ForgotPassword.jsx / ResetPassword.jsx
│   ├── SettingsView.jsx
│   ├── ResourceLibrary.jsx / ResourceUpload.jsx
│   ├── PaymentPage.jsx
│   ├── AccessCodesView.jsx
│   ├── PartnerWithUs.jsx
│   ├── TeachWithUs.jsx
│   └── BusinessInquiry.jsx
├── lib/
│   └── tokens.js         # Token utilities
├── assets/               # Static images
├── App.jsx               # Root component + hash-based router
├── main.jsx              # App entry point
├── index.css             # Global styles
└── App.css
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9

### Installation

```bash
git clone https://github.com/your-org/uburiza-frontend.git
cd uburiza-frontend
npm install
```

### Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_URL=https://uburiza-backend-javi.onrender.com/api
```

> **Note:** For local development, you can point this to your local backend: `http://localhost:3001/api`

### Setting Variables on Vercel

1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Add `VITE_API_URL` with your backend URL
3. Redeploy for changes to take effect

> Vite only exposes variables prefixed with `VITE_` to the client bundle.

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start local development server with HMR |
| `npm run build` | Build for production (outputs to `dist/`) |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the project |

---

## Features

### Public
- Landing page with live stats and featured courses
- Course catalog with search, level, and category filters
- Course overview with module/lesson breakdown
- Partner With Us, Teach With Us, Business Inquiry forms

### Learner
- Dashboard with enrollment progress and streak tracking
- My Courses with lesson navigation
- Course material viewer
- Certificate generation and download
- Resource library
- Payment flow for premium courses
- Profile settings with theme and data saver toggles

### Admin
- Operational analytics dashboard
- Course creation, editing, publishing, and deletion
- Module and lesson management
- Resource upload
- Access code management
- User management forms

---

## Roles & Access

The app uses hash-based routing (`window.location.hash`) with role-based view rendering.

| Role | Default View After Login | Restricted From |
|---|---|---|
| `learner` | `Dashboard` | Analytics, AdminForms, AccessCodes |
| `admin` | `Analytics` | Dashboard, MyCourses, Certificate |

Roles are stored in `localStorage` via `loggedInUser.role` and read on app load through `AppContext`.

---

## API Integration

All API calls go through the central Axios instance in `src/api/api_config.js`:

- **Base URL:** set via `VITE_API_URL` env variable
- **Auth:** JWT token attached automatically via request interceptor from `localStorage`
- **401 handling:** clears token and redirects to `#Login` automatically
- **FormData:** `Content-Type` header is automatically removed for multipart uploads

### Query Hooks

TanStack Query hooks live in `src/api/hooks/` and wrap all data fetching:

```
useAuthMutations.js   — login, register, logout, password reset
useCourse.js          — course CRUD + publish/unpublish
useEnrollments.js     — enrollment management
useCertificates.js    — certificate fetching
usePayments.js        — payment initiation
useProfile.js         — user profile
useResources.js       — resource library
```

---

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Set the `VITE_API_URL` environment variable
4. Vercel auto-detects Vite — no build config needed

A `vercel.json` is included to handle SPA routing:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Backend CORS

Your backend must allow your Vercel domain. In Express:

```js
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.endsWith('.vercel.app') || origin === 'http://localhost:5173') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
```

---

## Demo Credentials

These mock credentials work without a backend connection:

| Role | Email | Password |
|---|---|---|
| Learner | `learner@test.com` | `password123` |
| Admin | `admin@test.com` | `password123` |

> These are handled client-side in `src/api/auth.js` and bypass the real API.

---

## Known Issues & Troubleshooting

### Blank page on Vercel
- Ensure `vercel.json` exists with the SPA rewrite rule
- Ensure `VITE_API_URL` is set in Vercel environment variables
- Check browser console for `ReferenceError` — missing imports crash the whole app

### CORS errors in production
- The backend must whitelist your Vercel deployment URL
- See [Backend CORS](#backend-cors) section above

### PWA icons missing
- The manifest references `/pwa-192x192.png` and `/pwa-512x512.png`
- Add these files to the `public/` folder to resolve the console warning

### `useState is not defined`
- Ensure all React hooks are explicitly imported: `import React, { useState } from 'react'`

---

## License

Private — All rights reserved © 2024 Uburiza Learn.
