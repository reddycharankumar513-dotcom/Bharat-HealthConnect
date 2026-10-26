import { Invoice } from '../types';

export const mockInvoices: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-BHC-2026-4412',
    date: '2026-10-24',
    description: 'Specialist Consultation - Dr. Rajeshwar Rao (Cardiology)',
    category: 'Consultation',
    amount: 900,
    status: 'Paid',
    paymentMethod: 'UPI',
    insuranceClaimStatus: 'Not Applicable',
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-BHC-2026-4390',
    date: '2026-10-25',
    description: 'HbA1c & Fasting Insulin Diagnostic Panel',
    category: 'Diagnostic Test',
    amount: 1100,
    status: 'Paid',
    paymentMethod: 'UPI',
    insuranceClaimStatus: 'Processing',
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-BHC-2026-4105',
    date: '2026-09-14',
    description: 'Cardiac Stent 6-Month Review & 2D Echo',
    category: 'Hospitalization',
    amount: 4500,
    status: 'Paid',
    paymentMethod: 'Ayushman Bharat PMJAY',
    insuranceClaimStatus: 'Approved',
    schemeName: 'Ayushman Bharat PM-JAY (ABHA Pre-Authorization: AB-TS-98124)',
  },
  {
    id: 'inv-4',
    invoiceNumber: 'INV-BHC-2026-4011',
    date: '2026-08-20',
    description: 'Monthly Maintenance Medications (Telma-H, Glycomet, Ecosprin)',
    category: 'Pharmacy',
    amount: 795,
    status: 'Paid',
    paymentMethod: 'Card',
    insuranceClaimStatus: 'Not Applicable',
  }
];

export const mockGovernmentSchemes = [
  {
    id: 'scheme-1',
    name: 'Ayushman Bharat - PM-JAY',
    fullName: 'Pradhan Mantri Jan Arogya Yojana',
    coverageAmount: '₹5,00,000 per family / year',
    beneficiaryCount: '55+ Crore Citizens',
    description: 'World\'s largest government-financed healthcare scheme providing cashless secondary and tertiary hospital care.',
    eligibilityCheckUrl: 'https://mera.pmjay.gov.in',
    status: 'Active Empanelled',
    features: [
      'Cashless treatment across 27,000+ public and private empanelled hospitals',
      'Covers pre-existing conditions from Day 1',
      'Zero paper claims with digital ABHA verification',
      'Portability across all states in India'
    ]
  },
  {
    id: 'scheme-2',
    name: 'Aarogyasri Health Scheme',
    fullName: 'Dr. YSR / Telangana Aarogyasri Community Health Scheme',
    coverageAmount: 'Up to ₹10,00,000 per family',
    beneficiaryCount: '1.4+ Crore Families',
    description: 'State flagship scheme for end-to-end cashless treatment for BPL and identified families in Telangana and Andhra Pradesh.',
    status: 'Active Empanelled',
    features: [
      'Covers 1,600+ surgical and medical procedures',
      'Includes 10 days post-discharge medications',
      'Dedicated Aarogya Mithra helpdesks at network hospitals'
    ]
  },
  {
    id: 'scheme-3',
    name: 'Central Government Health Scheme (CGHS)',
    fullName: 'Central Government Health Scheme',
    coverageAmount: 'Comprehensive Outpatient & Inpatient',
    beneficiaryCount: '42+ Lakh Beneficiaries',
    description: 'Comprehensive health care facility for Central Government employees, pensioners, and their dependents.',
    status: 'Empanelled Network',
    features: [
      'OPD consultation, diagnostic tests, and indoor treatment',
      'Empanelled diagnostic chains and super specialty hospitals nationwide'
    ]
  }
];
