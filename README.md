# 📷 SHUTTER FLEX — International Photography Competition Platform

A full-stack web application for photography competitions, photo submission events, and jury curation. Built with **MongoDB Atlas**, **MongoDB GridFS**, **Node.js/Express**, and **React (Vite)**.

---

## ✨ Features

### 1. Participant Experience
- **On-Spot Self Registration**: New contestants register on-spot with **Full Name**, **College / Institution Name**, and optional contact info.
- **Duplicate Name Prevention**: Protects against accidental duplicate records.
- **Unlimited Entrants**: Open registration for all event attendees.
- **Instant Login & Dashboard**: Direct redirection to upload photographs right after registration.
- **Lossless Photo Uploads via MongoDB GridFS**: Preserves original image quality.

### 2. Curator / Judge Experience
- **Credentials:**
  - **Username / Email:** `shutterflex`
  - **Passkey:** `aidex26`
- **Exhibition Metrics & College Tracking**: Directory displaying participant names and college affiliations.
- **Protected Administrative Portal**: JWT-authenticated judge dashboard.
- **Exhibition Metrics**: Live counters for total participants, submissions, pending reviews, shortlisted entries, and grand winner.
- **Submissions Gallery**: Photography grid with status filters (`All`, `Pending`, `Shortlisted`, `Winner`, `Rejected`), live search, and sorting (Newest/Oldest, Score).
- **Interactive Lightbox Review Suite**:
  - High-res full-frame photograph inspector.
  - Entrant details (ID, name, contact info, timestamps).
  - Judicial Score Dial & Input (0 to 100 points).
  - Editorial critique notepad with instant save.
  - Shortlist, Under Review, and Reject toggles.
  - **Grand Winner Crowning** with safety confirmation dialog and public broadcast.
- **Contestants Management**: Directory of registered participants and one-click enrollment of new contestants.

### 3. Public Winner Exhibition
- Editorial exhibition page highlighting the Grand Laureate winner and shortlisted finalists with juror citations.

---

## 🛠️ Architecture & Technology Stack

| Layer | Technology | Description |
|---|---|---|
| **Database** | MongoDB Atlas / GridFS | Binary chunk storage (`photos.files`, `photos.chunks`), indexed submission metadata |
| **Backend** | Node.js, Express 4, Mongoose 8 | REST API, Multer memory storage stream, JWT auth, bcrypt |
| **Frontend** | React 18, Vite 6, Vanilla CSS | Curated dark editorial design system, Playfair Display & Inter typography |
| **Icons** | Lucide React | Sharp, minimalist UI iconography |

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer)
- MongoDB Atlas account (or use the built-in automated in-memory MongoDB fallback)

### 1. Clone & Install Dependencies

```bash
# In the project root directory
npm run install:all
```

### 2. Environment Configuration

Copy `.env.example` in the `backend/` folder:

```bash
cp backend/.env.example backend/.env
```

`backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/shutter_flex?retryWrites=true&w=majority
DATABASE_NAME=shutter_flex
JWT_SECRET=shutter_flex_super_secret_jwt_key_2026_photo_event
ADMIN_EMAIL=admin@shutterflex.com
ADMIN_PASSWORD=admin123
FRONTEND_URL=http://localhost:5173
```

> **Note:** If `MONGODB_URI` is left blank, the server automatically starts an in-memory MongoDB server for instant zero-config testing.

### 3. Seed Sample Database

Populate default admin credentials, registered contestants, and curated sample photography entries streamed into GridFS:

```bash
npm run seed
```

**Default Test Credentials:**
- **Curator / Admin:** `admin@shutterflex.com` / `admin123`
- **Sample Entrants:**
  - `Elena Rostova` (SF-1001)
  - `Marcus Vance` (SF-1002)
  - `Aria Chen` (SF-1003)
  - `David Kim` (SF-1004)
  - `Sophia Alvarez` (SF-1005)

### 4. Start Development Servers

Run both Backend and Frontend concurrently with one command:

```bash
npm run dev
```

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)

---

## 📡 REST API Reference

### Public / Streaming
- `GET /api/health` — Service health check
- `GET /api/submissions/:id/photo` — Stream binary image directly from GridFS
- `GET /api/submissions/exhibition/public` — Retrieve winner and shortlisted exhibition entries

### Participant API
- `POST /api/participants/login` — Authenticate with registered name
- `GET /api/participants/me` — Get participant profile
- `POST /api/submissions` — Upload photograph to GridFS (Multipart form)
- `GET /api/submissions/my` — Get logged-in participant's submissions

### Admin & Jury API
- `POST /api/admin/login` — Judge / Curator login
- `GET /api/admin/me` — Verify admin session
- `GET /api/admin/stats` — Dashboard metrics aggregation
- `GET /api/admin/submissions` — Filtered & sorted submissions list
- `GET /api/admin/submissions/:id` — Detailed submission record
- `PATCH /api/admin/submissions/:id/status` — Update review status
- `PATCH /api/admin/submissions/:id/score` — Record judicial score (0–100)
- `PATCH /api/admin/submissions/:id/comment` — Update judge critique notes
- `PATCH /api/admin/submissions/:id/winner` — Crown or revoke competition winner
- `DELETE /api/admin/submissions/:id` — Purge submission and delete GridFS binary
- `GET /api/admin/participants` — Directory of registered contestants
- `POST /api/admin/participants` — Enroll new contestant
