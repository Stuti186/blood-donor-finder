# Blood Donation & Emergency Resource Finder

A full-stack web app that connects people who urgently need blood with **verified, nearby, eligible donors**. A patient's family posts a request, matching donors within the search radius are alerted automatically, and the contact details are shared only after a donor accepts.

Built with the MERN stack (MongoDB, Express, React, Node.js) as a final-year B.Tech project.

> **Disclaimer:** This platform only connects people. Buying or selling blood is illegal in India, and medical screening is done by the hospital or blood bank, not by this app.

---

## Why this project

In an emergency, families usually look for donors through WhatsApp forwards and phone calls. That is slow, and the information is often outdated: donors who gave blood recently, wrong numbers, fake requests. Blood Finder replaces that with:

- a searchable donor database with blood group and location
- automatic **blood-group compatibility** matching
- automatic **donor eligibility** tracking (waiting period after each donation)
- **escalation**: the search radius widens if nobody responds
- **privacy**: a donor's phone number is hidden until they accept

---

## Features

| Area | What it does |
|---|---|
| **Accounts** | Register as a donor or as someone who needs blood. JWT login, hashed passwords. |
| **Donor matching** | Finds available donors within a radius using a MongoDB `2dsphere` geospatial index. |
| **Compatibility** | Uses a recipient-to-donor lookup table (for example, O- can donate to everyone). |
| **Eligibility** | 90-day gap for men and 120-day gap for women after a donation. |
| **Alerts** | Email (Nodemailer) and SMS (Fast2SMS). Without API keys, alerts print in the server console. |
| **Escalation** | If nobody accepts within 15 minutes, the radius widens from 5 km to 10 km, then 25 km (cron job). |
| **Live status** | The requester's page refreshes every 10 seconds with alerted, accepted and declined counts. |
| **Privacy** | Donor phone numbers are revealed only after acceptance. |
| **Blood banks** | Directory with map view and stock by blood group, with a "last updated" time. |
| **Admin panel** | Platform statistics, verify or ban users, remove fake requests. |
| **Safeguards** | Rate limiting, a maximum of 3 open requests per user, role-based access control. |

---

## User roles

| Role | Can do |
|---|---|
| **Donor** | Set availability, receive alerts, accept or decline requests, record a donation |
| **Requester** | Post blood requests, track status, see contact details of donors who accepted |
| **Admin** | View statistics, verify or ban users, remove requests |

Donors and requesters are separate accounts. A person who does both uses two accounts.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router, Axios, Leaflet (OpenStreetMap) |
| Backend | Node.js, Express |
| Database | MongoDB Atlas, Mongoose |
| Auth | JWT, bcrypt |
| Notifications | Nodemailer (email), Fast2SMS (SMS) |
| Scheduling | node-cron |
| Hosting | Vercel (frontend), Render (backend) |

---

## How it works

```
React (Vite)  <-- HTTPS / JSON -->  Express REST API  <-->  MongoDB Atlas
     |                                  |        |
 Leaflet map                      Nodemailer   node-cron
                                  + SMS API    (escalation)
```

**Request flow**

1. A requester submits a request with blood group, hospital and location.
2. The API runs a geospatial query for donors who are:
   - within the current radius (starting at 5 km)
   - blood-group compatible
   - available, and past their donation waiting period
3. Matching donors are alerted by email and SMS.
4. Donors accept or decline from their dashboard.
5. The requester's status page shows the donors who accepted, with phone numbers.
6. If nobody accepts within 15 minutes, a cron job widens the radius and alerts new donors.

**Core matching query**

```javascript
Donor.find({
  bloodGroup: { $in: compatibleGroups },
  isAvailable: true,
  location: {
    $near: {
      $geometry: request.location,
      $maxDistance: request.radiusKm * 1000
    }
  }
})
```

Donation-gap eligibility is then checked per donor in code.

---

## Project structure

```
blood-finder/
├── client/                    React app
│   └── src/
│       ├── components/        Navbar, Protected route, LocationPicker
│       ├── pages/             Home, Login, Register, Dashboard, NewRequest,
│       │                      RequestStatus, Banks, Admin
│       ├── api.js             Axios instance with JWT header
│       └── AuthContext.jsx    Login state
└── server/                    Express API
    ├── config/                Database connection
    ├── middleware/            JWT protect + role check
    ├── models/                User, Donor, Request, Response, BloodBank
    ├── routes/                auth, donors, requests, banks, admin
    └── utils/                 matcher, compatibility table, notify, cron, seed
```

---

## Getting started

### Prerequisites

- Node.js 20 or newer
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster (or a local MongoDB)

### 1. Clone

```bash
git clone https://github.com/Stuti186/blood-finder.git
cd blood-finder
```

### 2. Backend

```bash
cd server
npm install
```

Create `server/.env` (copy `.env.example`: `cp .env.example .env` on macOS/Linux, `copy .env.example .env` on Windows):

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/bloodfinder
JWT_SECRET=use-a-long-random-string
CLIENT_URL=http://localhost:5173

# Optional. If empty, alerts are printed in the server console.
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
FAST2SMS_KEY=
```

Notes:
- Put the database name (`/bloodfinder`) in the URI, otherwise MongoDB uses its default `test` database.
- In Atlas, allow your IP under **Network Access**.
- Use letters and numbers only in the database password, since symbols break the connection string.

Seed demo data (optional) and start the API:

```bash
npm run seed     # creates an admin, 24 donors and 2 blood banks
npm run dev      # http://localhost:5000
```

> `npm run seed` **deletes** all users, donors and blood banks first. Do not run it on a database with real data.

### 3. Frontend

```bash
cd client
npm install
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

```bash
npm run dev      # http://localhost:5173
```

Restart the frontend after changing `.env`, because Vite reads it only at startup.

---

## Demo accounts

Created by `npm run seed`. All use the password `password123`.

| Role | Email |
|---|---|
| Admin | `admin@bloodfinder.com` |
| Donors | `donor1@test.com` to `donor24@test.com` |
| Requester | Register a new account and choose **I need blood** |

Demo donors are placed around **Kanpur (26.4499, 80.3319)**. Use these coordinates for the hospital location so that donors fall inside the 5 km search.

### Demo walkthrough

Use a normal window for the requester and an **incognito window** for the donor.

1. **Home:** click blood groups to see which donors can give to each.
2. **Requester:** log in, open **Request blood**, enter group `A+`, the hospital, urgency, contact number and the Kanpur coordinates, then click **Alert nearby donors**.
3. **Server terminal:** show the `[EMAIL -> ...]` and `[SMS -> ...]` lines for the matched donors.
4. **Donor:** log in as one of those donors. The request appears under **Requests near you**. Click **Accept**.
5. **Requester:** within 10 seconds the status page shows the accepted donor's name and phone number.
6. **Donor:** click **I donated today** to start the waiting period and hide the donor from future searches.
7. **Admin:** show statistics and user moderation.

---

## API reference

Base URL: `/api`

| Method | Route | Access | Purpose |
|---|---|---|---|
| POST | `/auth/register` | public | Create an account |
| POST | `/auth/login` | public | Log in and receive a JWT |
| GET | `/auth/me` | logged in | Current user |
| GET / PUT | `/donors/me` | donor | Profile, availability, location |
| POST | `/donors/me/donated` | donor | Record a donation and start the waiting period |
| POST | `/requests` | requester | Create a request and alert matching donors |
| GET | `/requests/mine` | requester | List own requests with counts |
| GET | `/requests/:id` | requester, admin | Live status and accepted donors |
| PATCH | `/requests/:id/status` | requester | Mark fulfilled or closed |
| GET | `/requests/incoming` | donor | Requests that alerted this donor |
| PATCH | `/requests/respond/:id` | donor | Accept or decline |
| GET | `/banks` | public | Blood banks, optionally near `?lat=&lng=&km=` |
| POST | `/banks` | admin | Add a blood bank |
| PUT | `/banks/:id/stock` | admin | Update stock |
| GET | `/admin/stats` | admin | Platform statistics |
| GET | `/admin/users` | admin | List users |
| PATCH | `/admin/users/:id` | admin | Verify or ban a user |
| DELETE | `/admin/requests/:id` | admin | Remove a request |

---

## Database collections

| Collection | Main fields |
|---|---|
| `users` | name, email, phone, password (hashed), role, isVerified, isBanned |
| `donors` | user, bloodGroup, gender, city, location (GeoJSON), isAvailable, lastDonationDate, donationCount |
| `requests` | requester, patientName, bloodGroup, units, hospital, urgency, location, status, radiusKm, escalationLevel |
| `responses` | request, donor, status (notified, accepted, declined) |
| `bloodbanks` | name, address, phone, location, stock (embedded array), stockUpdatedAt |

---

## Deployment

| Part | Service | Settings |
|---|---|---|
| Database | MongoDB Atlas | Allow `0.0.0.0/0` under Network Access |
| Backend | Render (Web Service) | Root directory `server`, build `npm install`, start `npm start` |
| Frontend | Vercel | Root directory `client`, framework Vite |

**Backend environment variables (Render):** `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` (the exact Vercel URL, with no trailing slash), `NODE_VERSION=20`.

**Frontend environment variable (Vercel):** `VITE_API_URL=https://<your-service>.onrender.com/api`

Redeploy the frontend after changing `VITE_API_URL`, since it is baked in at build time. `client/vercel.json` rewrites all routes to `index.html` so that page refreshes work.

Render's free plan sleeps after about 15 minutes of inactivity, so the first request can take up to a minute. Open `/api/health` before a demo to wake it.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Login shows "Something went wrong" | The backend is not running, `VITE_API_URL` is wrong, or `CLIENT_URL` does not match the frontend address. |
| `EADDRINUSE: address already in use :::5000` | An old server is still running. Stop it (Ctrl+C) or free the port. |
| `bad auth: authentication failed` | The database username or password in `MONGO_URI` is wrong. |
| `querySrv ENOTFOUND` | The cluster address in `MONGO_URI` is wrong. |
| A request alerts 0 donors | No compatible, available donor is within the radius. Use the Kanpur coordinates and a blood group such as `A+` or `O+`. |
| Page shows 404 after refresh (Vercel) | `client/vercel.json` is missing. |

---

## Security notes

- Passwords are hashed with bcrypt. Sessions use signed JWTs.
- Donor phone numbers are hidden until a donor accepts a request.
- Auth and API routes are rate limited.
- Never commit `.env` files. They are listed in `.gitignore`.
- Admin accounts cannot be created through public registration.

---

## Future scope

- Phone OTP and email verification
- Real-time updates with WebSockets (Socket.io)
- WhatsApp and push notifications
- Hindi and English interface
- Blood demand prediction by area and season
- Ambulance, oxygen and ICU bed directory
- Donation camps and scheduling
- Eligibility rules reviewed against the latest NBTC (National Blood Transfusion Council) guidelines

---

## Author

**Stuti Srivastava**
Final-year B.Tech project
