# Campus Marketplace

A buy/sell/trade marketplace built exclusively for students of **IIEST Shibpur**. Students can list items (textbooks, electronics, cycles, hostel essentials, etc.), browse and search listings, comment, wishlist, and message sellers — with AI-assisted content moderation and an admin review dashboard.

Live: `[add your Vercel URL here]`

---

## Tech Stack

**Backend**
- Node.js + Express 5
- MongoDB + Mongoose
- JWT auth via httpOnly cookies (separate flows for users and admins)
- Google OAuth (`google-auth-library`) alongside email/password login
- Cloudinary for image storage
- Groq (`llama-3.3-70b-versatile`) for AI listing moderation
- Joi for request validation
- `helmet`, `express-rate-limit`, `cors`, `cookie-parser`

**Frontend**
- React 19 + Vite
- Tailwind CSS v4
- Custom `pushState`/`popstate` router (no `react-router-dom` in the live app)
- `lucide-react` icons
- Google Identity Services (client-side Sign-In button)

---

## Project Structure

```
backend/
  src/
    config/db.js               # Mongo connection
    controllers/                # auth, admin, listing, user, comment
    middleware/                 # auth, admin, upload (multer+cloudinary), validate
    models/                     # User, Listing (with embedded comments)
    routes/                     # auth, listings, users, admin
    scripts/                    # seedAdmins.js, testModeration.js
    services/moderation.service.js  # Groq-based content moderation
    utils/                      # cloudinary, wrapAsync
    validators/                 # Joi schemas
  app.js                       # Express app (middleware, routes)
  server.js                    # entrypoint (connects DB, starts server)
  testModels.js                # manual model sanity test

frontend/
  src/
    components/common/          # Navbar, LandingNavbar, Sidebar, ConfirmDialog
    pages/                       # Home, LandingPage, Authpage, ListingDetailPage,
                                 # Profilepage, PublicProfilePage, CreateListingPage,
                                 # EditListingPage, Messagepage
    utils/                       # api.js (fetch wrapper), academicYear.js, ListingStatus.js
    App.jsx                      # custom router + top-level auth/theme state
  vercel.json                    # SPA rewrite for deep links
```

---

## Features

- **Auth**: email/password (restricted to `@students.iiests.ac.in`) or Google Sign-In
- **Listings**: create with up to 10 images, browse/search/filter by category and price, edit/resubmit, mark as Sold, delete
- **AI Moderation**: every new/edited listing is checked by Groq before going live; flagged or low-confidence listings route to manual review, never auto-approved on uncertainty, and never fail open
- **Comments**: post, soft-delete your own, dislike others' (report signal); comments with 5+ dislikes surface in the admin queue
- **Admin dashboard**: separate login/session from regular users; approve/reject pending listings, review reported comments, view stats
- **Rate limits**: daily caps on new listings (5/day) and resubmissions per listing (2/day); login/register/Google-login endpoints are rate-limited per IP
- **Dark mode**, responsive layout, wishlist, public seller profiles with opt-in contact info

---

## Local Development

### Prerequisites
- Node.js 18+
- A MongoDB connection string (Atlas or local)
- Cloudinary account
- Groq API key
- Google OAuth Client ID

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in the values below
npm run dev            # nodemon, http://localhost:5000
```

**`backend/.env`**
```
NODE_ENV=development
PORT=5000
MONGO_URI=
JWT_SECRET=
JWT_EXPIRE=7d
ADMIN_JWT_SECRET=
ADMIN_JWT_EXPIRE=1d
ADMIN_EMAILS=admin1@students.iiests.ac.in,admin2@students.iiests.ac.in
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
GROQ_API_KEY=
GOOGLE_CLIENT_ID=
```

> `JWT_SECRET` and `ADMIN_JWT_SECRET` must be different values — they sign two independent sessions (user vs admin). Generate each with `openssl rand -hex 32`.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env    # fill in the values below
npm run dev             # http://localhost:5173
```

**`frontend/.env`**
```
VITE_API_URL=
VITE_GOOGLE_CLIENT_ID=
```

Leave `VITE_API_URL` empty locally — the Vite dev server proxies `/api/*` to `http://localhost:5000` automatically (see `vite.config.js`). Set it only for production builds (your deployed backend URL).

### Create an admin account

```bash
cd backend
node src/scripts/seedAdmins.js "youremail@students.iiests.ac.in" "Your Name"
```
Promotes the user if they exist, or creates a new admin account (Google-auth only) if they don't.

### Test the moderation service directly

```bash
cd backend
node src/scripts/testModeration.js
```
Runs a handful of sample listings (legitimate, prohibited item, scam text, spam) through Groq and prints each verdict.

---

## Deployment

Backend deploys to **Render**, frontend to **Vercel**. Full step-by-step (including the production-specific cookie/CORS fixes already applied in this codebase) is in `deployment-guide.md`.

Quick summary:
1. Push backend and frontend to GitHub
2. Render: new Web Service, root = `backend/`, build `npm install`, start `npm start`, set all backend env vars above with `NODE_ENV=production`
3. Vercel: new project, root = `frontend/`, set `VITE_API_URL` (your Render URL) and `VITE_GOOGLE_CLIENT_ID`
4. Set `CLIENT_URL` on Render to your Vercel URL once you have it, then redeploy
5. Add the Vercel URL to Google Cloud Console → Authorized JavaScript origins

### Why cookies need special handling in production
Frontend (Vercel) and backend (Render) are on different domains, so auth cookies are cross-site. In production, cookies are set with `sameSite: "none"` + `secure: true`, and `app.set("trust proxy", 1)` is required so Express recognizes the request as HTTPS behind Render's proxy. Locally, both are same-site via the Vite dev proxy, so cookies use `sameSite: "lax"` instead — this switches automatically based on `NODE_ENV`.

---

## API Overview

| Area | Base path | Notes |
|---|---|---|
| Auth | `/api/auth` | register, login, google, me, logout |
| Listings | `/api/listings` | CRUD, search/filter/pagination, suggested, status, comments |
| Users | `/api/users` | profile, public profile by id, wishlist |
| Admin | `/api/admin` | separate `admin_token` cookie/session; listing approval, comment moderation, stats |

All protected routes expect the relevant httpOnly cookie — no `Authorization` header is used.

---

## Known Limitations / Not Yet Implemented

- `MessagesPage` is currently static UI only — no real messaging backend yet
- Listing images can't be changed on edit (delete and repost instead)
- 5-year programs (e.g. B.Arch) aren't fully mapped to semesters yet — see the note in `academicYear.js`