# EMR Frontend – Appointment Management Dashboard

This is a **full-stack EMR Appointment Management UI** built using React and Tailwind.
It integrates with AWS AppSync GraphQL Backend to provide:
- Appointment Dashboard
- Calendar View Scheduling
- Real-Time-like UI Updates
- Queue & Status Updates

---

## Features Implemented
- Fetch Appointments from Backend
- Create New Appointment
- Filter by Date
- Filter Tabs (Today / Upcoming / Past)
- Update Appointment Status
- Automatic Refresh after actions
- Interactive Calendar Scheduling UI
- Dashboard analytics & stats

---

## 🛠️ Tech Stack
- React + Vite
- Tailwind CSS
- Amplify GraphQL Client
- date-fns
- Lucide Icons

---

## ▶️ Running Locally
1️⃣ Install Dependencies
```bash
npm install
```

2️⃣ Configure API
Create `.env` file (get it from `cdk-outputs.json` file created automatically after deployment):

```
VITE_APPSYNC_ENDPOINT=<GraphQL URL>
VITE_APPSYNC_REGION=<AWS REGION>
VITE_APPSYNC_APIKEY=<API KEY>
```

3️⃣ Start App

```bash
npm run dev
```

---

## API Integration

Frontend calls:

* getAppointments
* createAppointment
* updateStatus
* deleteAppointment

All via central service:

```
/src/services/appointmentService.ts
```

Amplify Client Setup:

```
/src/lib/amplify.ts
```

---

## 🚀 Deployment

Deployed on vercel: [production link](https://swasthiq-emr.vercel.app/)

Just ensure `.env` exists.