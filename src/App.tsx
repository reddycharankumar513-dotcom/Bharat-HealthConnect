import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';

// Shell Layouts
import { PublicShell } from './layouts/PublicShell';
import { AppShell } from './layouts/AppShell';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { RoleSelectorPage } from './pages/public/RoleSelectorPage';
import { EmergencyPage } from './pages/public/EmergencyPage';

// Shared Discovery Pages (wrapped in PublicShell so patients/public can search)
import { HospitalDiscoveryPage } from './pages/patient/HospitalDiscoveryPage';
import { HospitalDetailPage } from './pages/patient/HospitalDetailPage';
import { DoctorSearchPage } from './pages/patient/DoctorSearchPage';

// Patient Portal Pages
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { PatientAppointmentsPage } from './pages/patient/PatientAppointmentsPage';
import { PatientProfilePage } from './pages/patient/PatientProfilePage';
import { PatientMedicalRecordsPage } from './pages/patient/PatientMedicalRecordsPage';
import { PatientPaymentsPage } from './pages/patient/PatientPaymentsPage';

// Doctor Portal Pages
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { DoctorAppointmentsPage } from './pages/doctor/DoctorAppointmentsPage';
import { DoctorAvailabilityPage } from './pages/doctor/DoctorAvailabilityPage';

// Hospital Admin Portal Pages
import { HospitalAdminDashboard } from './pages/hospital/HospitalAdminDashboard';
import { HospitalDepartmentPage } from './pages/hospital/HospitalDepartmentPage';
import { HospitalStaffPage } from './pages/hospital/HospitalStaffPage';
import { HospitalComplaintsPage } from './pages/hospital/HospitalComplaintsPage';

// Pharmacy Portal Pages
import { PharmacyDashboard } from './pages/pharmacy/PharmacyDashboard';
import { PharmacyInventoryPage } from './pages/pharmacy/PharmacyInventoryPage';
import { PharmacyOrdersPage } from './pages/pharmacy/PharmacyOrdersPage';

// Diagnostic Lab Portal Pages
import { LabDashboard } from './pages/laboratory/LabDashboard';
import { LabCatalogPage } from './pages/laboratory/LabCatalogPage';
import { LabSampleTrackingPage } from './pages/laboratory/LabSampleTrackingPage';

// Central Admin Portal Pages
import { CentralAdminDashboard } from './pages/admin/CentralAdminDashboard';
import { AdminProviderVerificationPage } from './pages/admin/AdminProviderVerificationPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';
import { AdminDisputesPage } from './pages/admin/AdminDisputesPage';

// Notifications
import { NotificationCenterPage } from './pages/notifications/NotificationCenterPage';

export const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Views */}
          <Route element={<PublicShell />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/roles" element={<RoleSelectorPage />} />
            <Route path="/emergency" element={<EmergencyPage />} />
            <Route path="/hospitals" element={<HospitalDiscoveryPage />} />
            <Route path="/hospitals/:id" element={<HospitalDetailPage />} />
            <Route path="/doctors" element={<DoctorSearchPage />} />
          </Route>

          {/* Portal Workspaces with Role-Based Sidebars */}
          <Route element={<AppShell />}>
            {/* Patient Portal */}
            <Route path="/patient" element={<PatientDashboard />} />
            <Route path="/patient/appointments" element={<PatientAppointmentsPage />} />
            <Route path="/patient/profile" element={<PatientProfilePage />} />
            <Route path="/patient/records" element={<PatientMedicalRecordsPage />} />
            <Route path="/patient/payments" element={<PatientPaymentsPage />} />

            {/* Doctor Portal */}
            <Route path="/doctor" element={<DoctorDashboard />} />
            <Route path="/doctor/appointments" element={<DoctorAppointmentsPage />} />
            <Route path="/doctor/availability" element={<DoctorAvailabilityPage />} />

            {/* Hospital Admin Portal */}
            <Route path="/hospital" element={<HospitalAdminDashboard />} />
            <Route path="/hospital/departments" element={<HospitalDepartmentPage />} />
            <Route path="/hospital/staff" element={<HospitalStaffPage />} />
            <Route path="/hospital/complaints" element={<HospitalComplaintsPage />} />

            {/* Pharmacy Portal */}
            <Route path="/pharmacy" element={<PharmacyDashboard />} />
            <Route path="/pharmacy/inventory" element={<PharmacyInventoryPage />} />
            <Route path="/pharmacy/orders" element={<PharmacyOrdersPage />} />

            {/* Diagnostic Laboratory Portal */}
            <Route path="/laboratory" element={<LabDashboard />} />
            <Route path="/laboratory/catalog" element={<LabCatalogPage />} />
            <Route path="/laboratory/samples" element={<LabSampleTrackingPage />} />

            {/* Central Platform Admin Portal */}
            <Route path="/admin" element={<CentralAdminDashboard />} />
            <Route path="/admin/verifications" element={<AdminProviderVerificationPage />} />
            <Route path="/admin/audit" element={<AdminAuditLogsPage />} />
            <Route path="/admin/disputes" element={<AdminDisputesPage />} />

            {/* Shared Utility */}
            <Route path="/notifications" element={<NotificationCenterPage />} />
          </Route>

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
