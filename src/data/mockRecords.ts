import { PatientProfile, MedicalRecord, PrescriptionItem } from '../types';

export const mockPatientProfile: PatientProfile = {
  id: 'pat-1',
  name: 'Ramesh Sharma',
  email: 'ramesh.sharma@bharathealth.mock',
  phone: '+91 98765 43210',
  role: 'patient',
  city: 'Hyderabad',
  state: 'Telangana',
  abhaId: '91-4589-2341-9920',
  dob: '1978-04-12',
  gender: 'Male',
  bloodGroup: 'B+ (Positive)',
  address: 'Flat 402, Sai Balaji Enclave, Madhapur, Hyderabad, Telangana - 500081',
  emergencyContact: {
    name: 'Priyanka Sharma',
    relationship: 'Spouse',
    phone: '+91 98765 43219',
  },
  preferredLanguage: 'en',
  dependents: [
    { id: 'dep-1', name: 'Aarav Sharma', relation: 'Son', age: 14, gender: 'Male' },
    { id: 'dep-2', name: 'Kusuma Devi Sharma', relation: 'Mother', age: 72, gender: 'Female' }
  ],
  allergies: ['Penicillin (Moderate rash)', 'Sulfonamides / Sulfa drugs'],
  chronicConditions: ['Primary Hypertension (Diagnosed 2018)', 'Type 2 Diabetes Mellitus (HbA1c ~ 7.1%)'],
  accessibility: {
    highContrast: false,
    largeFont: false,
    screenReaderReady: true,
  }
};

export const mockPrescriptions: PrescriptionItem[] = [
  {
    id: 'rx-1',
    medicineName: 'Telma-H 40/12.5 Tablet',
    dosage: '1 Tablet',
    frequency: 'Once Daily (Morning after breakfast)',
    duration: '90 Days',
    instructions: 'Monitor BP weekly. Do not skip doses.',
  },
  {
    id: 'rx-2',
    medicineName: 'Glycomet-GP 2 Forte Tablet',
    dosage: '1 Tablet',
    frequency: 'Twice Daily (Morning and Evening before meals)',
    duration: '60 Days',
    instructions: 'Maintain consistent meal timings to avoid hypoglycemia.',
  },
  {
    id: 'rx-3',
    medicineName: 'Ecosprin 75 Tablet',
    dosage: '1 Tablet',
    frequency: 'Once Daily (After dinner)',
    duration: '180 Days',
    instructions: 'Cardiac prophylaxis as advised by Dr. Rajeshwar Rao.',
  }
];

export const mockMedicalRecords: MedicalRecord[] = [
  {
    id: 'rec-1',
    patientId: 'pat-1',
    date: '2026-10-25',
    title: 'Automated Complete Blood Count & Platelet Indices',
    type: 'Diagnostic Report',
    doctorName: 'Dr. Neha Agarwal, MD (Pathology)',
    hospitalName: 'Bharat Diagnostic Hub, Banjara Hills',
    summary: 'Hemoglobin: 14.2 g/dL, Total WBC: 7,400 cells/cu.mm, Platelets: 2.4 Lakhs/cu.mm. All indices within physiological limits.',
    details: 'EDTA blood sample processed through 6-part automated hematology analyzer. Quality control verified.',
    fileSize: '1.4 MB PDF',
    sharedWith: ['Apollo Health City, Jubilee Hills', 'Dr. Rajeshwar Rao'],
  },
  {
    id: 'rec-2',
    patientId: 'pat-1',
    date: '2026-09-14',
    title: 'Cardiology Consultation Summary & Echo Report',
    type: 'Consultation Summary',
    doctorName: 'Dr. Rajeshwar Rao, MD, DM',
    hospitalName: 'Apollo Health City, Jubilee Hills',
    summary: 'Normal LV systolic function (LVEF 58%). Well-seated stent in LAD. Resting BP 130/82 mmHg. Advised continuation of Telma-H and low sodium diet.',
    details: 'Transthoracic 2D Echo with Doppler study performed. No regional wall motion abnormalities at rest.',
    fileSize: '2.8 MB PDF',
    sharedWith: ['Apollo Health City, Jubilee Hills'],
  },
  {
    id: 'rec-3',
    patientId: 'pat-1',
    date: '2026-08-20',
    title: 'Glycemic Evaluation (HbA1c & Fasting Insulin)',
    type: 'Diagnostic Report',
    doctorName: 'Dr. Sunita Deshmukh, MD',
    hospitalName: 'Tata Memorial Hospital Diagnostics',
    summary: 'HbA1c level: 7.1% (Controlled). Fasting Blood Sugar: 122 mg/dL. Renal profile within normal limits.',
    details: 'Tested via Ion-Exchange High Performance Liquid Chromatography (HPLC). Gold standard calibration.',
    fileSize: '890 KB PDF',
    sharedWith: ['Tata Memorial Hospital', 'Apollo Health City, Jubilee Hills'],
  }
];
