# Hostel Frontend (Vite + React)

This scaffold was generated to implement the UET Hostel Management frontend.

Features included in the scaffold:
- React + Vite
- Bootstrap 5 (via CDN)
- Axios + API service that maps all 38 backend endpoints (see `src/services/api.js`).
- Chart.js + react-chartjs-2 prepared for charts.
- html5-qrcode placeholder for QR scanning.

Quick start (PowerShell):

```powershell
# from project root
cd "c:\Users\Black box\OneDrive\Documents\GitHub\New-Portfolio\Hostel_Frontend"
npm install
npm run dev
```

Environment:
- Set VITE_API_BASE in `.env` or pass it to the app (default: `http://localhost:3000`)

Next steps:
- Implement UI details in `src/pages/*` and wire components to the API service.
- Replace CDN bootstrap with local import if needed.
