# 🏥 Bharat HealthConnect
> **One Nation. One Connected Healthcare Ecosystem.**

Bharat HealthConnect is a comprehensive, modern, responsive healthcare application engineered to unify patients, medical practitioners, hospitals, pharmacies, diagnostic laboratories, and healthcare administrators across India under a unified digital network.

---

## 🌟 Key Highlights & Capabilities

### 1. 🔍 Symptom-Based Doctor Discovery & Instant Booking
- Intelligent symptom search tag cloud (e.g. Chest pain, Fever & chills, Persistent cough, Joint pain, Skin rash, Anxiety & depression, etc.).
- Direct doctor filtering matching specialties, consultation fees, experience, languages spoken (Hindi, Telugu, Tamil, English), and verified qualifications.
- Interactive booking modal with automatic symptom pre-population, live time slot selection, conflict prevention, and atomic slot rescheduling.

### 2. 👥 6 Dedicated Role-Based Portals (`/roles`)
Experience 6 distinct healthcare workspaces with dedicated sidebars, stat metrics, contextual actions, and simulated authentication:
- **Patient Portal**: Medical history, prescriptions, diagnostic lab reports, appointment management, family dependents, and emergency contacts.
- **Doctor Portal**: Daily schedule & calendar, patient consultation queue, clinical notes, digital prescriptions, and diagnostic lab test referrals.
- **Hospital Administration**: Bed occupancy & ICU monitoring, doctor duty rotas, department analytics, outpatient queues, and emergency alerts.
- **Smart Pharmacy Management**: Real-time batch & SKU tracking, automated low-stock warnings with calculated suggested reorders, supplier procurement workflows, and simulated goods-received restocking.
- **Diagnostic Laboratory**: Pathology test catalog (INR pricing), end-to-end 6-stage sample lifecycle tracking (Order placed ➔ Collected ➔ In Transit ➔ Processing ➔ Pathologist Verified ➔ Delivered), and PDF report issuance.
- **Central Platform Administrator**: Pan-India macro telemetry (ABHA linkage, operational facilities, compliance audit logs, telemedicine uptime, and dispute resolutions).

### 3. 🚨 24x7 Emergency Healthcare Command (`/emergency`)
- Immediate emergency facility finder with live ICU/trauma bed readiness.
- One-click emergency ambulance dispatch simulation (108 / 102).
- Direct panic hotline triggers for critical health incidents.

### 4. 🤖 AI Health Triage Assistant & Multilingual Access
- Built-in clinical triage conversational assistant to guide patients on appropriate medical specialties based on presented symptoms.
- Multilingual interface supporting **English**, **Hindi (हिंदी)**, **Telugu (తెలుగు)**, and **Tamil (தமிழ்)**.

---

## 🛠️ Technology Stack

- **Frontend Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: React Context + LocalStorage persistence for instant demo fidelity
- **Routing**: [React Router DOM v7](https://reactrouter.com/)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (version 18+ recommended)
- npm or pnpm

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/reddycharankumar513-dotcom/Hospitial-Management-System-.git
   cd Hospitial-Management-System-
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`.

4. **Production Build:**
   ```bash
   npm run build
   ```
   Preview the production build locally:
   ```bash
   npm run preview
   ```

---

## 📁 Project Architecture

```text
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable design system UI
│   │   ├── common/         # Navbar, Sidebar, Modal, Badges, GoogleMapPlaceholder, LanguageSelector
│   │   ├── AIAssistantModal.tsx
│   │   └── AppointmentBookingModal.tsx
│   ├── context/            # AppContext (LocalStorage engine & state management)
│   ├── data/               # Realistic Indian healthcare mock datasets
│   │   ├── mockDoctors.ts
│   │   ├── mockHospitals.ts
│   │   ├── mockMedicines.ts
│   │   ├── mockLabTests.ts
│   │   ├── mockAppointments.ts
│   │   └── ...
│   ├── pages/              # Route views
│   │   ├── public/         # LandingPage, EmergencyPage, DoctorSearchPage, HospitalDiscoveryPage
│   │   ├── patient/        # Dashboard, Appointments, MedicalRecords, Profile
│   │   ├── doctor/         # Dashboard, Appointments, Prescriptions, DoctorProfile
│   │   ├── hospital/       # Dashboard, Departments, BedManagement
│   │   ├── pharmacy/       # Inventory, Orders, Suppliers
│   │   ├── laboratory/     # Dashboard, Samples, TestCatalog
│   │   └── admin/          # PlatformOverview, SystemAudit
│   ├── types/              # Comprehensive TypeScript interfaces & domain models
│   ├── App.tsx             # Route declarations & portal layout scaffolding
│   ├── main.tsx            # Application entry point
│   └── index.css           # Tailwind CSS directives & theme design tokens
└── tailwind.config.js      # Custom healthcare teal/blue design palette
```

---

## 🔒 Demo Notice & Disclaimer

This project is a high-fidelity frontend prototype designed for demonstration, bio-innovation showcases, and product evaluation. All clinical records, doctor listings, medications, and pathology reports utilize simulated mock data. No actual medical diagnosis or prescription fulfillment is performed.

---

## 📄 License

This project is open-source under the MIT License.
