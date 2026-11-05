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
| Frontend | React Router, Axios, Leaflet (OpenStreetMap) |
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
