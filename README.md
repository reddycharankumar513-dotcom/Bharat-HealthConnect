# 🏥 Bharat HealthConnect
> **One Nation. One Connected Healthcare Ecosystem.**

Bharat HealthConnect is a centralized digital healthcare platform that unifies patients, hospitals, doctors, hospital staff, pharmacists, diagnostic laboratories, medical suppliers, and central administrators across India under a unified digital healthcare network.

---

## 🌟 Key Highlights & Capabilities

### 1. 🔍 Symptom-Based Doctor Discovery & Instant Booking
- Intelligent symptom search tag cloud (e.g. *Chest pain*, *Fever & chills*, *Persistent cough*, *Joint pain*, *Skin rash*, *Anxiety & depression*).
- Real-time doctor filtering matching specialties, consultation fees, experience, languages spoken (Hindi, Telugu, Tamil, English), and verified qualifications.
- Interactive booking modal with automatic symptom pre-population, live time slot selection, conflict prevention, and atomic slot rescheduling.

### 2. 📱 CRITICAL WORKFLOW 1: QR Code-Based Medicine Stock Management
- **Live Camera & Barcode Scanner**: Built-in camera viewfinder simulation and manual code lookup supporting standard packaging QR codes (e.g. `BHC-QR-AUG-B2401`, `BHC-QR-TEL-T8901`, `BHC-QR-DOL-D9001`).
- **Product & Batch Resolution**: Resolves medicine name, salt, batch number, expiry date, available quantity, unit price, and recall status.
- **Clinical Dispensing Safety**: Blocks dispensing expired or recalled batches; enforces mandatory pharmacist prescription verification for Schedule H/X drugs.
- **Concurrency-Safe Stock Deduction**: Atomic database transaction deducts stock from the specific batch and parent inventory, creates a unique sale record (`SALE-YYYYMMDD-XXXX`), and records a tamper-evident entry in the searchable transaction ledger.
- **Low-Stock Alert Trigger**: Automatically triggers pharmacist alerts and calculates suggested reorder quantities when stock drops below threshold.
- **Printable Batch QR Labels**: Built-in modal to generate and print standardized QR labels for shelves and medicine packaging.

### 3. 🧪 CRITICAL WORKFLOW 2: Diagnostic Lab Report Uploads & Secure Access
- **Phlebotomy Workflow Lifecycle**: 6-stage milestone tracking (`Booked` ➔ `Sample Collected` ➔ `Processing` ➔ `Completed` ➔ `Report Uploaded` ➔ `Available to Patient`).
- **Secure File Uploads**: Client and server validation for PDF and medical images (up to 10MB) stored with randomized UUID keys in private storage (never exposed via public URLs).
- **Patient Report Access**: Dedicated "My Diagnostic Reports" page allowing patients to securely view clinical impressions and download verified PDF reports.
- **Doctor Report Access with Consent**: Authorized doctors can access diagnostic reports only when active patient consent is registered.
- **Controlled Report Correction Workflow**: Preserves revision history (`ReportVersion`) with mandatory clinical correction reasons and patient notifications.

### 4. 🛒 Medicine Marketplace & Stock Synchronization
- Browse participating licensed pharmacies, compare prices, and check live batch availability.
- Place orders with automatic concurrency-safe stock reservation.
- Prescription upload required for prescription-only items.
- Order tracking milestones: `Pending` ➔ `Pharmacy Review` ➔ `Confirmed` ➔ `Preparing` ➔ `Dispatched` ➔ `Delivered` (with reservation release on rejection/cancellation).

### 5. 👥 9 Dedicated Role-Based Portals (`/roles` & `/login`)
- **Central Platform Administrator** (`/admin`): Macro national telemetry, provider license verification (hospitals, doctors, pharmacies, labs, suppliers), audit logs, and dispute redressal.
- **Hospital Administrator** (`/hospital`): ICU & bed occupancy monitoring, department analytics, staff access control, and grievance management.
- **Doctor Portal** (`/doctor`): Daily schedule, OPD patient queue, digital prescription generator, and diagnostic test referral interface.
- **Hospital Staff & Triage** (`/staff/dashboard`): Outpatient intake desk, physical patient check-in, and emergency triage queue.
- **Patient Portal** (`/patient`): Health records, appointments, medicine marketplace, order tracking, family dependents, and diagnostic reports.
- **Pharmacist Portal** (`/pharmacy`): QR camera stock deduction, low-stock threshold alerts, transaction ledger, and wholesale procurement.
- **Diagnostic Lab Administrator** (`/laboratory`): Pathology test catalog, sample processing tracking, and report verification.
- **Diagnostic Lab Technician** (`/laboratory/samples`): Phlebotomy barcoding, centrifugation, and clinical report uploads.
- **Medical Supplier Hub** (`/supplier`): Wholesale catalog, purchase order approvals from licensed pharmacies, and dispatch tracking.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts |
| **Backend API** | Node.js, Express.js, TypeScript |
| **Database & ORM** | PostgreSQL compatible / SQLite for zero-config local execution with Prisma ORM |
| **Authentication** | JWT with Argon2id/Bcrypt password hashing and Role-Based Access Control (RBAC) |
| **Storage** | Private object storage with randomized keys for diagnostic PDF reports |
| **Testing** | Node.js Test Runner (`node:test`, `node:assert`) with automated integration suite |

---

## 👥 Demo Accounts & Credentials

All demo accounts are pre-seeded in the database with password: **`Demo@1234`**

| Role | Email Address | Dashboard Route | Primary Focus |
|---|---|---|---|
| **Central Admin** | `admin@bharathealth.in` | `/admin` | Provider verification & security audit trail |
| **Hospital Admin** | `hospital@aiims-hyd.in` | `/hospital` | AIIMS Hyderabad ICU & department management |
| **Doctor** | `doctor@bharathealth.in` | `/doctor` | Dr. Swaminathan (Cardiology OPD queue) |
| **Hospital Staff** | `staff@aiims-hyd.in` | `/staff/dashboard` | Admission desk, patient physical check-in |
| **Patient** | `patient@bharathealth.in` | `/patient` | Charan Kumar (ABHA account, marketplace, reports) |
| **Pharmacist** | `pharmacy@bharathealth.in` | `/pharmacy` | Sanjeevani MedPlus QR scanner & sales ledger |
| **Lab Admin** | `laboratory@bharathealth.in` | `/laboratory` | Vijaya Bio-Diagnostics report uploads & approval |
| **Lab Technician** | `tech@bharathealth.in` | `/laboratory/samples` | Phlebotomy sample tracking & testing |
| **Medical Supplier**| `supplier@bharathealth.in` | `/supplier` | Bharat MedLogistics wholesale order approvals |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (version 18+ recommended)
- npm or pnpm

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/reddycharankumar513-dotcom/Bharat-HealthConnect.git
cd Bharat-HealthConnect

# Install frontend dependencies
npm install

# Install backend dependencies
cd server && npm install && cd ..
```

### 2. Database Migration & Seeding

The backend uses Prisma ORM with SQLite for zero-config immediate execution (or PostgreSQL via `DATABASE_URL` in `server/.env`).

```bash
# Generate Prisma Client and create local database with seed data
npm run seed
```

### 3. Run Integration Tests

Run the automated integration test suite validating QR code lookup, confirmed sales, stock deduction, expiry prevention, and diagnostic report uploads:

```bash
npm test
```

### 4. Start the Application

Open two terminal tabs:

**Terminal 1 — Backend API Server:**
```bash
npm run server
# Runs Express API at http://localhost:5000
```

**Terminal 2 — Frontend Application:**
```bash
npm run dev
# Runs Vite React app at http://localhost:5173
```

---

## 📁 Project Architecture

```text
├── public/                     # Static assets & icons
├── src/                        # React Frontend
│   ├── components/
│   │   ├── common/             # Navbar, Sidebar, Modal, Badges, ProtectedRoute, LanguageSelector
│   │   ├── pharmacy/           # QRScannerModal, QRCodeModal
│   │   ├── laboratory/         # UploadReportModal, CorrectReportModal
│   │   └── patient/            # AppointmentBookingModal, AIAssistantModal
│   ├── context/                # AppContext (Auth state, persistent store, and toasts)
│   ├── pages/
│   │   ├── auth/               # LoginPage, RegisterPage, ForgotPasswordPage
│   │   ├── patient/            # Dashboard, Appointments, Reports, Marketplace, Orders, Profile
│   │   ├── doctor/             # Dashboard, Appointments, Availability
│   │   ├── hospital/           # AdminDashboard, Departments, Staff, Complaints
│   │   ├── staff/              # HospitalStaffDashboard (Admission desk & queue)
│   │   ├── pharmacy/           # Dashboard, Inventory (QR action), TransactionLedger, Orders
│   │   ├── laboratory/         # Dashboard (Upload report action), Catalog, SampleTracking
│   │   ├── supplier/           # SupplierDashboard (Wholesale purchase requests)
│   │   └── admin/              # CentralAdminDashboard, Verifications, AuditLogs, Disputes
│   ├── services/               # api.ts (Fetch wrapper with Bearer token authentication)
│   ├── types/                  # TypeScript interfaces across all 9 roles and healthcare entities
│   ├── App.tsx                 # Route declarations & portal layout scaffolding
│   └── main.tsx                # Application entry point
├── server/                     # Node.js + Express Backend
│   ├── prisma/
│   │   ├── schema.prisma       # 30+ relational healthcare database models
│   │   ├── seed.ts             # Seeding 9 roles, hospitals, pharmacies, batches, labs, tests
│   │   └── dev.db              # SQLite database file
│   ├── src/
│   │   ├── routes/             # auth, pharmacy, marketplace, lab, admin, supplier routes
│   │   ├── middleware/         # JWT authentication & Role-Based Access Control (RBAC)
│   │   ├── tests/              # integration.test.ts (Clinical test suite)
│   │   ├── db.ts               # Prisma Client singleton
│   │   └── index.ts            # Express server entry point
│   ├── .env                    # Environment configuration
│   └── package.json            # Backend dependencies
└── README.md
```

---

## 🔒 Security & Privacy Architecture

- **Least-Privilege Authorization**: Server-side RBAC enforces permissions on every endpoint.
- **Secure File Storage**: Diagnostic reports are stored with randomized UUID keys and accessed only through authenticated streaming endpoints with patient consent checks.
- **Concurrency-Safe Stock Updates**: All pharmacy sales, stock reservations, and goods-received restocking execute inside atomic database transactions (`prisma.$transaction`).
- **Audit Logging**: Every authentication event, QR sale, report upload/download, and provider verification is recorded in the immutable `AuditLog` ledger.

---

## 📄 License

This project is licensed under the MIT License.
