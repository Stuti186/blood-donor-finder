# Blood Donation & Emergency Resource Finder (MERN)

## Run it
1. **Backend**
   ```
   cd server
   cp .env.example .env     # fill in MONGO_URI and JWT_SECRET
   npm install
   npm run seed             # optional: demo donors, blood banks, admin (admin@bloodfinder.com / password123)
   npm run dev
   ```
2. **Frontend**
   ```
   cd client
   cp .env.example .env
   npm install
   npm run dev              # http://localhost:5173
   ```
Without SMTP / Fast2SMS keys, alerts are printed in the server console, which is enough for a demo.

## API summary
| Method | Route | Who | Purpose |
|---|---|---|---|
| POST | /api/auth/register, /login | public | account + JWT |
| GET/PUT | /api/donors/me | donor | profile, availability, location |
| POST | /api/donors/me/donated | donor | start cooldown |
| POST | /api/requests | requester/donor | create request + alert matching donors |
| GET | /api/requests/mine, /:id | requester | list / live status |
| GET | /api/requests/incoming | donor | alerts received |
| PATCH | /api/requests/respond/:id | donor | accept / decline |
| PATCH | /api/requests/:id/status | requester | fulfilled / closed |
| GET | /api/banks | public | blood banks (optionally near lat,lng) |
| GET/PATCH/DELETE | /api/admin/... | admin | stats, verify/ban users, remove requests |
