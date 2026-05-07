# ElectraGuide: Secure Digital Voting System with AI Analytics

## 🚀 Production Deployment (Vercel)

1.  **Database**: Create a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2.  **Environment Variables**: In Vercel, add:
    *   `MONGODB_URI`: Your Atlas connection string.
    *   `JWT_SECRET`: A secure random string.
    *   `VOTE_HASH_SECRET`: A random string for anonymising votes.
3.  **Push**: `git push origin main`

## 📊 Power BI Integration

The platform provides a premium CSV export optimized for Power BI forensics:
1. Go to **Intelligence** (Admin only).
2. Click **Export Power BI Dataset**.
3. Import the `.csv` into Power BI Desktop to visualize voter turnout, fraud patterns, and real-time results.

## 🚀 Features

### 👤 Authentication & Role-Based Access
- **Secure Registration:** Voter ID (EPIC) validation and password hashing (bcrypt).
- **JWT Protection:** State-of-the-art token-based session management.
- **Roles:** Clear separation between **Voters** and **Admins**.

### 🗳️ Voting Integrity
- **One-User-One-Vote:** Strict enforcement at both API and Database levels.
- **Anonymous Ballots:** Votes are stored using SHA-256 hashes of User IDs, ensuring your ballot cannot be traced back to you.
- **Time Windows:** Admins can schedule elections with precise start and end times.
- **Interactive UI:** Real-time countdowns and post-vote confirmation.

### 📊 Admin Intelligence (Power BI Ready)
- **KPI Dashboard:** Monitor total voters, live turnout %, and risk levels.
- **Live Charts:** Visual representation of candidate performance and peak voting hours.
- **Fraud Detection:** Automated flagging of suspicious login patterns and IP collisions.
- **Power BI Integration:** One-click CSV export designed for instant import into Power BI for deep data analysis.

### 🛡️ Advanced Security
- **Rate Limiting:** Protection against brute-force attacks and spam voting.
- **Brute Force Protection:** Automated account locking after multiple failed attempts.
- **Input Sanitization:** Protection against XSS and NoSQL injection.

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS (via Index CSS), Lucide Icons, Recharts, Motion (Framer).
- **Backend:** Node.js, Express, TypeScript.
- **Database:** MongoDB (with Mongoose ODM).
- **Security:** JWT, BcryptJS, Express-Rate-Limit.

## 📂 Project Structure

```text
/server
  /models       # MongoDB Schemas (User, Candidate, Vote, Election)
  /routes       # API Endpoints (Auth, Voting, Admin)
  /middleware   # Auth guards & Error handlers
  /utils        # Token gen & Validations
/src
  /context      # Global Auth State
  /pages        # UI Views (Auth, Voter, Admin)
  /services     # API Client (Axios)
  index.css     # Premium Design System
```

## ⚙️ Setup Instructions

### 1. Backend Setup
1. Navigate to the root directory.
2. Create a `.env` file based on `.env.example`.
3. Provide your `MONGODB_URI` (Local or Atlas).
4. Run `npm install`.
5. Start the server: `npm run server`.

### 2. Frontend Setup
1. In another terminal, run `npm install`.
2. Start the dev server: `npm run dev`.
3. Access the app at `http://localhost:3000`.

### 🔑 Demo Credentials
- **Admin:** `admin@electra.gov` / `Admin@123` (Note: Set `ALLOW_ADMIN_REGISTER=true` in `.env` to create an admin first)
- **Voter:** `voter@electra.gov` / `Voter@123`

## 📊 Power BI Integration

1. Login as Admin.
2. Navigate to the **Intelligence** tab.
3. Click **"Power BI Export"**.
4. Import the downloaded `electraguide_export.csv` into Power BI.
5. Use the following columns for visualizations:
   - `Candidate Performance`: Use `Candidate` and `Total Votes`.
   - `Voting Trends`: Use `Hour` and `Votes Cast`.
   - `Fraud Monitor`: Check `Anonymised Vote Log` for timestamp anomalies.

## 🛡️ Security Audit
- [x] Password Hashing (Bcrypt)
- [x] JWT Expiration (7 days)
- [x] Route Protection (Admin/Voter Guards)
- [x] IP-based Rate Limiting
- [x] Anonymised Vote Storage (SHA-256)
