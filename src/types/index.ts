export type UserRole = 
  | 'patient' 
  | 'doctor' 
  | 'hospital' 
  | 'pharmacy' 
  | 'laboratory' 
  | 'admin';

export type Language = 'en' | 'hi' | 'te' | 'ta';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  city: string;
  state: string;
  abhaId?: string; // Ayushman Bharat Health Account ID
}

export interface PatientProfile extends UserProfile {
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  address: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  preferredLanguage: Language;
  dependents: Array<{
    id: string;
    name: string;
    relation: string;
    age: number;
    gender: string;
  }>;
  allergies: string[];
  chronicConditions: string[];
  accessibility: {
    highContrast: boolean;
    largeFont: boolean;
    screenReaderReady: boolean;
  };
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  subSpecialty?: string;
  qualification: string;
  experienceYears: number;
  languages: string[];
  consultationFee: number;
  rating: number;
  reviewCount: number;
  hospitalId: string;
  hospitalName: string;
  city: string;
  verified: boolean;
  avatar: string;
  about: string;
  availableDays: string[];
  availableSlots: string[];
  treatedSymptoms: string[];
  conditions: string[];
}

export interface Hospital {
  id: string;
  name: string;
  type: 'Government' | 'Private' | 'Autonomous';
  city: string;
  state: string;
  address: string;
  pincode: string;
  phone: string;
  emergencyPhone: string;
  rating: number;
  reviewCount: number;
  specialties: string[];
  departments: string[];
  bedCapacity: number;
  availableBedsDemo: number;
  icuBedsDemo: number;
  emergencyAvailable: boolean;
  ayushmanEmpanelled: boolean;
  image: string;
  operatingHours: string;
  lat: number;
  lng: number;
  distanceKm?: number;
}

export type AppointmentStatus = 
  | 'Scheduled' 
  | 'Checked In' 
  | 'In Consultation' 
  | 'Completed' 
  | 'Cancelled' 
  | 'Rescheduled';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientAge?: number;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  hospitalId: string;
  hospitalName: string;
  date: string;
  timeSlot: string;
  status: AppointmentStatus;
  type: 'In-Person' | 'Tele-Consultation';
  fee: number;
  paymentStatus: 'Paid' | 'Pending' | 'Refunded';
  symptoms?: string;
  consultationNotes?: string;
  prescriptions?: PrescriptionItem[];
  labReferrals?: string[];
  bookedAt: string;
}

export interface PrescriptionItem {
  id: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  sku: string;
  category: string;
  batchNumber: string;
  quantity: number;
  minThreshold: number;
  suggestedReorderQty: number;
  unitPrice: number;
  expiryDate: string;
  supplierId: string;
  supplierName: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Expiring Soon';
  dosageForm: 'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'Ointment';
  storageCondition: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  city: string;
  rating: number;
  gstNumber: string;
  leadTimeDays: number;
}

export type PurchaseOrderStatus = 
  | 'Pending Approval' 
  | 'Approved' 
  | 'Ordered' 
  | 'Dispatched' 
  | 'Delivered' 
  | 'Cancelled';

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  medicineId: string;
  medicineName: string;
  supplierId: string;
  supplierName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: PurchaseOrderStatus;
  createdAt: string;
  estimatedDelivery: string;
  approvedBy?: string;
  receivedAt?: string;
  notes?: string;
}

export interface DiagnosticTest {
  id: string;
  name: string;
  code: string;
  category: 'Biochemistry' | 'Hematology' | 'Microbiology' | 'Pathology' | 'Radiology' | 'Cardiology';
  priceINR: number;
  tatHours: number;
  sampleType: string;
  fastingRequired: boolean;
  description: string;
}

export type SampleStatus = 
  | 'Order Placed' 
  | 'Sample Collected' 
  | 'In Transit' 
  | 'Processing' 
  | 'Verified & Approved' 
  | 'Delivered to Patient';

export interface DiagnosticBooking {
  id: string;
  bookingRef: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  testId: string;
  testName: string;
  priceINR: number;
  collectionType: 'Home Collection' | 'Lab Visit';
  scheduledDate: string;
  scheduledTime: string;
  status: SampleStatus;
  sampleBarcode?: string;
  technicianName?: string;
  reportUrl?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  isDemo: boolean;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  date: string;
  title: string;
  type: 'Prescription' | 'Diagnostic Report' | 'Consultation Summary' | 'Discharge Summary';
  doctorName: string;
  hospitalName: string;
  summary: string;
  details: string;
  fileSize?: string;
  sharedWith: string[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category: 'appointment' | 'diagnostic' | 'pharmacy' | 'hospital' | 'emergency' | 'system';
  targetRole?: UserRole | 'all';
  actionUrl?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  description: string;
  category: 'Consultation' | 'Diagnostic Test' | 'Pharmacy' | 'Hospitalization';
  amount: number;
  status: 'Paid' | 'Pending' | 'Refunded';
  paymentMethod: 'UPI' | 'Card' | 'Ayushman Bharat PMJAY' | 'NetBanking';
  insuranceClaimStatus?: 'Approved' | 'Processing' | 'Not Applicable';
  schemeName?: string;
}

export interface VerificationRequest {
  id: string;
  providerType: 'Doctor' | 'Hospital' | 'Diagnostic Lab' | 'Pharmacy';
  providerName: string;
  regNumber: string;
  licenseNumber: string;
  city: string;
  state: string;
  submittedAt: string;
  status: 'Pending' | 'Verified' | 'Rejected';
  documents: string[];
}
