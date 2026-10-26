import { VerificationRequest } from '../types';

export const mockVerificationRequests: VerificationRequest[] = [
  {
    id: 'verif-1',
    providerType: 'Doctor',
    providerName: 'Dr. Vikram Chandra, MS',
    regNumber: 'MCI-REG-88291',
    licenseNumber: 'TSMC-DOC-44102',
    city: 'Hyderabad',
    state: 'Telangana',
    submittedAt: '2026-10-25 14:20',
    status: 'Pending',
    documents: ['MBBS_Degree.pdf', 'MS_Orthopedics_Certificate.pdf', 'State_Medical_Council_NOC.pdf']
  },
  {
    id: 'verif-2',
    providerType: 'Hospital',
    providerName: 'KIMS Alshifa Multi-Specialty Hospital',
    regNumber: 'NABH-HOSP-2025-091',
    licenseNumber: 'GOVT-TS-CLINIC-7781',
    city: 'Khammam',
    state: 'Telangana',
    submittedAt: '2026-10-24 11:15',
    status: 'Pending',
    documents: ['NABH_Accreditation.pdf', 'Fire_Safety_NOC.pdf', 'Pollution_Control_Certificate.pdf']
  },
  {
    id: 'verif-3',
    providerType: 'Diagnostic Lab',
    providerName: 'Thyrocare Bio-Path Logistics',
    regNumber: 'NABL-LAB-44910',
    licenseNumber: 'DL-MH-LAB-1209',
    city: 'Mumbai',
    state: 'Maharashtra',
    submittedAt: '2026-10-22 09:30',
    status: 'Verified',
    documents: ['NABL_Certificate_ISO15189.pdf', 'Quality_Audit_Report.pdf']
  },
  {
    id: 'verif-4',
    providerType: 'Pharmacy',
    providerName: 'Apollo 24x7 Pharmacy, Hitech City Branch',
    regNumber: 'FDA-TS-RTL-8812',
    licenseNumber: 'DRUG-LIC-20B-21B-4409',
    city: 'Hyderabad',
    state: 'Telangana',
    submittedAt: '2026-10-21 16:45',
    status: 'Verified',
    documents: ['Form_20B_Retail_License.pdf', 'Pharmacist_Registration_Cert.pdf']
  }
];

export const mockAuditLogs = [
  {
    id: 'log-1',
    timestamp: '2026-10-26 18:42:10',
    actor: 'Dr. Rajeshwar Rao (doc-1)',
    role: 'Doctor',
    action: 'Prescription Digital Signature',
    resource: 'Patient Ramesh Sharma (pat-1)',
    ipAddress: '103.211.54.12',
    status: 'Success'
  },
  {
    id: 'log-2',
    timestamp: '2026-10-26 17:15:33',
    actor: 'V. Satyanarayana (Pharmacist)',
    role: 'Pharmacist',
    action: 'Purchase Order Approval (PO-BHC-2026-0892)',
    resource: 'Dr. Reddy LifeSupply (supp-3)',
    ipAddress: '49.207.210.88',
    status: 'Success'
  },
  {
    id: 'log-3',
    timestamp: '2026-10-26 15:30:19',
    actor: 'System Auto-Monitor',
    role: 'System',
    action: 'Low Stock Threshold Flag Triggered',
    resource: 'Augmentin 625 (med-1)',
    ipAddress: '127.0.0.1',
    status: 'Alert'
  },
  {
    id: 'log-4',
    timestamp: '2026-10-26 14:02:44',
    actor: 'Central Admin Officer (adm-1)',
    role: 'Administrator',
    action: 'Provider Empanelment Verification Review',
    resource: 'Thyrocare Bio-Path (NABL-44910)',
    ipAddress: '14.139.112.5',
    status: 'Success'
  }
];

export const mockDisputes = [
  {
    id: 'disp-1',
    ticketNumber: 'GRV-2026-0419',
    complainant: 'Patient Suresh Chandra',
    against: 'Apollo Pharmacy Banjara Hills',
    subject: 'Delayed Home Delivery of Essential Insulin',
    date: '2026-10-25',
    status: 'In Investigation',
    priority: 'High',
    resolutionNotes: 'Cold-chain dispatch logs being verified with courier tracking partner.'
  },
  {
    id: 'disp-2',
    ticketNumber: 'GRV-2026-0398',
    complainant: 'Dr. Sunita Deshmukh',
    against: 'Diagnostic Lab Partner',
    subject: 'Discrepancy in Automated HPLC Sample Barcode',
    date: '2026-10-23',
    status: 'Resolved',
    priority: 'Medium',
    resolutionNotes: 'Sample re-run performed within 2 hours. Revised report approved and delivered.'
  }
];
