<<<<<<< HEAD
# Hospital Billing & Discharge Summary Software (MERN Stack)

A production-style hospital management application with Tax Invoice billing and
Discharge Summary modules, built on MongoDB, Express, React (Vite), and Node.js.

## Folder Structure

```
hospital-app/
├── backend/      Express + MongoDB API (JWT auth, file uploads, invoices, discharge summaries)
└── frontend/     React + Vite SPA (Dashboard, Settings, Billing, Discharge Summaries, Print views)
```

## 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# edit .env: set MONGO_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD

# create the default admin user + hospital settings document
npm run seed

# start the API (default port 5000)
npm run dev
```

Requires a running MongoDB instance (local `mongodb://localhost:27017/hospital_billing`
or a MongoDB Atlas connection string in `MONGO_URI`).

Default admin login (override in `.env` before seeding):
- Email: `admin@hospital.com`
- Password: `Admin@123`

## 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server runs on `http://localhost:5173` and proxies `/api` and `/uploads`
requests to the backend on port 5000 (see `vite.config.js`).

Open `http://localhost:5173`, log in with the admin credentials above.

## 3. Using the App

1. **Hospital Branding Settings** – upload your logo, doctor signature, hospital seal,
   an optional header advertisement banner, and payment QR code. Fill in hospital name,
   address, phone, GSTIN, bank details, doctor details, and terms & conditions.
2. **Billing / Invoices** – create a new tax invoice, add line items (auto-calculates
   taxable value, IGST, totals, and amount-in-words), save, then you're taken straight
   to the print view. From the list you can search, edit, reprint, or delete.
3. **Discharge Summaries** – fill out the 6 sections (patient info, clinical course,
   medications, follow-up plan, patient education, prognosis) and the footer doctor
   details, then save to go to the print view (2-page A4 layout).
4. **Print / PDF** – every print view has a "Print / Save PDF" button that calls the
   browser print dialog (Ctrl+P also works); use "Save as PDF" in the print dialog for
   PDF export. Print CSS is tuned for A4 portrait with hidden UI chrome.

## 4. Production Notes / Next Steps

This is a complete functional scaffold covering every module requested
(Authentication, Branding Settings, Billing, Discharge Summary, Print Management,
Dashboard). Before a real production rollout you should additionally:

- Switch image storage from local disk (`backend/uploads`) to Cloudinary or MongoDB
  GridFS for durability across deployments (the upload route is isolated in
  `middleware/uploadMiddleware.js` + `routes/settingsRoutes.js`, so swapping the storage
  backend only touches those two files).
- Add HTTPS, rate limiting, and helmet security headers for the Express app.
- Add automated tests and a CI pipeline.
- Fine-tune the print CSS pixel offsets (`frontend/src/styles/invoicePrint.css` and
  `dischargePrint.css`) against a printed/PDF sample from your actual printer/browser,
  since exact pixel rendering can vary slightly by browser print engine.
- Set a strong `JWT_SECRET` and rotate the seeded admin password immediately.

## 5. Tech Stack

- **Frontend:** React 18, Vite, React Router, Axios
- **Backend:** Node.js, Express, Mongoose, JWT, bcryptjs, Multer
- **Database:** MongoDB
=======
# kvs-hospital-Backend
>>>>>>> 6dc499723f5b56dfd0fa5b42d6bc44ef366d175b
