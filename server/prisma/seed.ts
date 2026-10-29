import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Bharat HealthConnect Database Seed...');

  const defaultPassword = await bcrypt.hash('Demo@1234', 10);

  // 1. Central Platform Administrator
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@bharathealth.in' },
    update: {},
    create: {
      email: 'admin@bharathealth.in',
      phone: '+91 98765 00001',
      passwordHash: defaultPassword,
      fullName: 'Dr. Rajeshwar Sharma',
      role: 'CENTRAL_ADMIN',
      status: 'ACTIVE',
      city: 'New Delhi',
      state: 'Delhi',
      abhaId: 'ABHA-9901-ADMIN'
    }
  });

  // 2. Hospitals
  const hospital1 = await prisma.hospital.upsert({
    where: { id: 'hosp-aims-hyd' },
    update: {},
    create: {
      id: 'hosp-aims-hyd',
      name: 'AIIMS Hyderabad Super Speciality Hospital',
      type: 'Government',
      address: 'Bibinagar, Rangareddy District',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '508126',
      phone: '+91 40 2345 6789',
      emergencyPhone: '108',
      operatingHours: '24x7 Emergency & Trauma',
      verificationStatus: 'VERIFIED',
      rating: 4.9,
      reviewCount: 320,
      bedCapacity: 500,
      availableBeds: 112,
      icuBeds: 28,
      emergencyAvailable: true,
      ayushmanEmpanelled: true,
      departments: JSON.stringify(['Cardiology', 'Neurology', 'Pulmonology', 'Orthopedics', 'Pediatrics', 'Oncology']),
      specialties: JSON.stringify(['Cardiology', 'Neurology', 'Critical Care', 'Robotic Surgery']),
      lat: 17.4784,
      lng: 78.7892
    }
  });

  const hospital2 = await prisma.hospital.upsert({
    where: { id: 'hosp-apollo-blr' },
    update: {},
    create: {
      id: 'hosp-apollo-blr',
      name: 'Apollo Health City Bengaluru',
      type: 'Private',
      address: '154/11 Bannerghatta Road, Opposite IIMB',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560076',
      phone: '+91 80 2630 4050',
      emergencyPhone: '1066',
      operatingHours: '24x7 Emergency & Inpatient',
      verificationStatus: 'VERIFIED',
      rating: 4.8,
      reviewCount: 450,
      bedCapacity: 400,
      availableBeds: 85,
      icuBeds: 18,
      emergencyAvailable: true,
      ayushmanEmpanelled: true,
      departments: JSON.stringify(['Cardiology', 'Endocrinology', 'Gastroenterology', 'Dermatology', 'General Medicine']),
      specialties: JSON.stringify(['Cardiology', 'Diabetology', 'Organ Transplant', 'Gastroenterology']),
      lat: 12.8953,
      lng: 77.5986
    }
  });

  // Hospital Admins
  const hospAdminUser = await prisma.user.upsert({
    where: { email: 'hospital@aiims-hyd.in' },
    update: {},
    create: {
      email: 'hospital@aiims-hyd.in',
      phone: '+91 98765 00002',
      passwordHash: defaultPassword,
      fullName: 'Suresh Verma (Hospital Director)',
      role: 'HOSPITAL_ADMIN',
      status: 'ACTIVE',
      city: 'Hyderabad',
      state: 'Telangana'
    }
  });

  // Hospital Staff
  const staffUser = await prisma.user.upsert({
    where: { email: 'staff@aiims-hyd.in' },
    update: {},
    create: {
      email: 'staff@aiims-hyd.in',
      phone: '+91 98765 00003',
      passwordHash: defaultPassword,
      fullName: 'Priya Sundaram (Head Receptionist & Admission Desk)',
      role: 'HOSPITAL_STAFF',
      status: 'ACTIVE',
      city: 'Hyderabad',
      state: 'Telangana',
      hospitalStaff: {
        create: {
          hospitalId: hospital1.id,
          department: 'Outpatient & Emergency Desk',
          designation: 'Senior Admission Coordinator',
          shift: 'Morning (08:00 AM - 04:00 PM)'
        }
      }
    }
  });

  // 3. Doctors
  const doctor1User = await prisma.user.upsert({
    where: { email: 'doctor@bharathealth.in' },
    update: {},
    create: {
      email: 'doctor@bharathealth.in',
      phone: '+91 98765 00004',
      passwordHash: defaultPassword,
      fullName: 'Dr. Arvind Swaminathan',
      role: 'DOCTOR',
      status: 'ACTIVE',
      city: 'Hyderabad',
      state: 'Telangana',
      doctorProfile: {
        create: {
          hospitalId: hospital1.id,
          specialty: 'Cardiology',
          subSpecialty: 'Interventional Cardiology',
          qualification: 'MBBS, MD (Gen Med), DM (Cardiology), FACC',
          registrationNumber: 'MCI-TS-2012-44912',
          experienceYears: 16,
          consultationFee: 700,
          languages: 'English, Telugu, Hindi, Tamil',
          rating: 4.9,
          reviewCount: 148,
          about: 'Senior Consultant Interventional Cardiologist specializing in adult cardiac care, hypertension, angioplasty, and preventative cardiology.',
          treatedSymptoms: JSON.stringify(['Chest pain', 'Shortness of breath', 'High blood pressure', 'Heart palpitations', 'Dizziness', 'Leg swelling']),
          conditions: JSON.stringify(['Coronary Artery Disease', 'Hypertension', 'Arrhythmia', 'Heart Failure']),
          availableDays: 'Mon, Tue, Wed, Thu, Fri',
          availableSlots: '09:30 AM, 10:30 AM, 11:30 AM, 02:30 PM, 04:00 PM',
          verified: true
        }
      }
    }
  });

  const doctor2User = await prisma.user.upsert({
    where: { email: 'dr.ananya@bharathealth.in' },
    update: {},
    create: {
      email: 'dr.ananya@bharathealth.in',
      phone: '+91 98765 00005',
      passwordHash: defaultPassword,
      fullName: 'Dr. Ananya Reddy',
      role: 'DOCTOR',
      status: 'ACTIVE',
      city: 'Hyderabad',
      state: 'Telangana',
      doctorProfile: {
        create: {
          hospitalId: hospital1.id,
          specialty: 'Pulmonology',
          subSpecialty: 'Asthma & Sleep Disorders',
          qualification: 'MBBS, MD (Pulmonary Med), DNB',
          registrationNumber: 'MCI-TS-2016-88219',
          experienceYears: 11,
          consultationFee: 600,
          languages: 'English, Telugu, Hindi',
          rating: 4.8,
          reviewCount: 94,
          about: 'Specialist in allergic airway disease, COPD, asthma management, sleep apnea, and persistent post-viral respiratory complications.',
          treatedSymptoms: JSON.stringify(['Persistent cough', 'Wheezing', 'Breathlessness', 'Throat irritation', 'Chest congestion', 'Fever & chills']),
          conditions: JSON.stringify(['Bronchial Asthma', 'COPD', 'Pneumonia', 'Sleep Apnea']),
          availableDays: 'Mon, Wed, Fri, Sat',
          availableSlots: '10:00 AM, 11:00 AM, 12:00 PM, 03:00 PM, 05:00 PM',
          verified: true
        }
      }
    }
  });

  const doctor3User = await prisma.user.upsert({
    where: { email: 'dr.vikram@bharathealth.in' },
    update: {},
    create: {
      email: 'dr.vikram@bharathealth.in',
      phone: '+91 98765 00006',
      passwordHash: defaultPassword,
      fullName: 'Dr. Vikramaditya Sen',
      role: 'DOCTOR',
      status: 'ACTIVE',
      city: 'Bengaluru',
      state: 'Karnataka',
      doctorProfile: {
        create: {
          hospitalId: hospital2.id,
          specialty: 'Endocrinology',
          subSpecialty: 'Diabetology & Thyroid Disorders',
          qualification: 'MBBS, MD, DM (Endocrinology, AIIMS)',
          registrationNumber: 'KMC-2014-99120',
          experienceYears: 14,
          consultationFee: 750,
          languages: 'English, Hindi, Bengali, Kannada',
          rating: 4.9,
          reviewCount: 120,
          about: 'Expert clinical endocrinologist with focus on complex Type-1 and Type-2 diabetes, gestational diabetes, thyroid dysfunction, and metabolic health.',
          treatedSymptoms: JSON.stringify(['Frequent urination', 'Excessive thirst', 'Sudden weight loss/gain', 'Chronic fatigue', 'Cold intolerance', 'Slow-healing sores']),
          conditions: JSON.stringify(['Type-2 Diabetes', 'Hypothyroidism', 'Hyperthyroidism', 'Metabolic Syndrome']),
          availableDays: 'Tue, Wed, Thu, Fri, Sat',
          availableSlots: '09:00 AM, 10:30 AM, 02:00 PM, 03:30 PM, 05:00 PM',
          verified: true
        }
      }
    }
  });

  // 4. Patients
  const patient1User = await prisma.user.upsert({
    where: { email: 'patient@bharathealth.in' },
    update: {},
    create: {
      email: 'patient@bharathealth.in',
      phone: '+91 98765 43210',
      passwordHash: defaultPassword,
      fullName: 'Charan Kumar Reddy',
      role: 'PATIENT',
      status: 'ACTIVE',
      city: 'Hyderabad',
      state: 'Telangana',
      abhaId: 'ABHA-2491-9988-7711',
      patientProfile: {
        create: {
          dateOfBirth: '1996-08-14',
          gender: 'Male',
          bloodGroup: 'O+',
          address: 'Plot 42, Jubilee Hills Road No. 36',
          emergencyContact: '+91 98765 43219 (Kavitha Reddy, Spouse)',
          preferredLanguage: 'en',
          allergies: 'Penicillin, Sulfa drugs',
          chronicConditions: 'Mild Hypertension (Under Medication)',
          dependents: JSON.stringify([
            { id: 'dep-1', name: 'Aarav Reddy', relation: 'Son', age: 4, gender: 'Male' },
            { id: 'dep-2', name: 'Narayana Reddy', relation: 'Father', age: 67, gender: 'Male' }
          ])
        }
      }
    }
  });

  const patient2User = await prisma.user.upsert({
    where: { email: 'meera.sharma@bharathealth.in' },
    update: {},
    create: {
      email: 'meera.sharma@bharathealth.in',
      phone: '+91 98765 43211',
      passwordHash: defaultPassword,
      fullName: 'Meera Sharma',
      role: 'PATIENT',
      status: 'ACTIVE',
      city: 'Bengaluru',
      state: 'Karnataka',
      abhaId: 'ABHA-8812-7744-5522',
      patientProfile: {
        create: {
          dateOfBirth: '1992-04-20',
          gender: 'Female',
          bloodGroup: 'B+',
          address: 'Flat 302, Palm Meadows, Whitefield',
          emergencyContact: '+91 98765 43220 (Rohan Sharma, Brother)',
          preferredLanguage: 'en',
          allergies: 'None recorded',
          chronicConditions: 'Asthma (Seasonal)'
        }
      }
    }
  });

  // 5. Medical Suppliers
  const supplier1User = await prisma.user.upsert({
    where: { email: 'supplier@bharathealth.in' },
    update: {},
    create: {
      email: 'supplier@bharathealth.in',
      phone: '+91 98765 00007',
      passwordHash: defaultPassword,
      fullName: 'Mahesh Singhal (Director, Bharat Pharma Logistics)',
      role: 'SUPPLIER',
      status: 'ACTIVE',
      city: 'Hyderabad',
      state: 'Telangana',
      supplier: {
        create: {
          name: 'Bharat MedLogistics & Wholesale Distributors',
          contactPerson: 'Mahesh Singhal',
          phone: '+91 40 6789 1234',
          email: 'supplier@bharathealth.in',
          city: 'Hyderabad',
          state: 'Telangana',
          gstNumber: '36AAACB1234F1Z8',
          rating: 4.9,
          leadTimeDays: 2,
          status: 'VERIFIED'
        }
      }
    }
  });

  const supplier2User = await prisma.user.upsert({
    where: { email: 'apex.pharma@bharathealth.in' },
    update: {},
    create: {
      email: 'apex.pharma@bharathealth.in',
      phone: '+91 98765 00008',
      passwordHash: defaultPassword,
      fullName: 'Kavita Nair (Apex BioMed Supply)',
      role: 'SUPPLIER',
      status: 'ACTIVE',
      city: 'Bengaluru',
      state: 'Karnataka',
      supplier: {
        create: {
          name: 'Apex Bio-Innovations Supply Network',
          contactPerson: 'Kavita Nair',
          phone: '+91 80 4455 6677',
          email: 'apex.pharma@bharathealth.in',
          city: 'Bengaluru',
          state: 'Karnataka',
          gstNumber: '29AAACN9988H1Z2',
          rating: 4.8,
          leadTimeDays: 3,
          status: 'VERIFIED'
        }
      }
    }
  });

  // Get supplier records
  const supplier1 = await prisma.supplier.findUnique({ where: { gstNumber: '36AAACB1234F1Z8' } });
  const supplier2 = await prisma.supplier.findUnique({ where: { gstNumber: '29AAACN9988H1Z2' } });

  // 6. Registered Pharmacies
  const pharmacy1 = await prisma.pharmacy.upsert({
    where: { licenseNumber: 'TS-HYD-PH-2023-991' },
    update: {},
    create: {
      name: 'Sanjeevani MedPlus Pharmacy & Wellness',
      licenseNumber: 'TS-HYD-PH-2023-991',
      address: 'Shop 4, Ground Floor, Banjara Hills Road No. 2',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500034',
      phone: '+91 40 2335 1122',
      operatingHours: '07:00 AM - 11:00 PM',
      verificationStatus: 'VERIFIED',
      rating: 4.9,
      deliveryAvailable: true
    }
  });

  const pharmacy2 = await prisma.pharmacy.upsert({
    where: { licenseNumber: 'TS-HYD-PH-2022-452' },
    update: {},
    create: {
      name: 'Apollo 24x7 Pharmacy Jubilee Hills',
      licenseNumber: 'TS-HYD-PH-2022-452',
      address: 'Plot 18, Road No. 10, Jubilee Hills',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500033',
      phone: '+91 40 2360 7788',
      operatingHours: '24 Hours Open',
      verificationStatus: 'VERIFIED',
      rating: 4.8,
      deliveryAvailable: true
    }
  });

  const pharmacy3 = await prisma.pharmacy.upsert({
    where: { licenseNumber: 'KA-BLR-PH-2021-310' },
    update: {},
    create: {
      name: 'Dhanvantari Care Pharmacy Koramangala',
      licenseNumber: 'KA-BLR-PH-2021-310',
      address: '80 Feet Road, 4th Block, Koramangala',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560034',
      phone: '+91 80 2553 9900',
      operatingHours: '08:00 AM - 10:30 PM',
      verificationStatus: 'VERIFIED',
      rating: 4.7,
      deliveryAvailable: true
    }
  });

  // Pharmacist Users
  const pharmacistUser = await prisma.user.upsert({
    where: { email: 'pharmacy@bharathealth.in' },
    update: {},
    create: {
      email: 'pharmacy@bharathealth.in',
      phone: '+91 98765 00009',
      passwordHash: defaultPassword,
      fullName: 'K. S. Narayanan (Chief Pharmacist, B.Pharm, R.Ph)',
      role: 'PHARMACIST',
      status: 'ACTIVE',
      city: 'Hyderabad',
      state: 'Telangana',
      pharmacistProfile: {
        create: {
          pharmacyId: pharmacy1.id,
          regNumber: 'TS-PCI-2015-8831',
          qualification: 'B.Pharm, Registered Pharmacist'
        }
      }
    }
  });

  // 7. Master Medicines Catalog
  const med1 = await prisma.medicine.upsert({
    where: { id: 'med-amox-500' },
    update: {},
    create: {
      id: 'med-amox-500',
      name: 'Augmentin 625 Duo Tablet',
      brandName: 'Augmentin 625',
      genericName: 'Amoxicillin (500mg) + Clavulanic Acid (125mg)',
      category: 'Antibiotic',
      dosageForm: 'Tablet',
      strength: '625mg',
      manufacturer: 'GSK Pharmaceuticals Ltd.',
      description: 'Broad-spectrum penicillin antibiotic combined with beta-lactamase inhibitor for bacterial respiratory, ENT, and skin infections.',
      requiresPrescription: true,
      unitPrice: 204.50,
      minThreshold: 30,
      suggestedReorderQty: 100,
      storageCondition: 'Store below 25°C away from moisture'
    }
  });

  const med2 = await prisma.medicine.upsert({
    where: { id: 'med-telm-40' },
    update: {},
    create: {
      id: 'med-telm-40',
      name: 'Telma 40mg Tablet',
      brandName: 'Telma 40',
      genericName: 'Telmisartan (40mg)',
      category: 'Cardiovascular',
      dosageForm: 'Tablet',
      strength: '40mg',
      manufacturer: 'Glenmark Pharmaceuticals',
      description: 'Angiotensin II receptor blocker used for hypertension control, stroke risk reduction, and heart disease management.',
      requiresPrescription: true,
      unitPrice: 142.00,
      minThreshold: 40,
      suggestedReorderQty: 150,
      storageCondition: 'Store at room temperature'
    }
  });

  const med3 = await prisma.medicine.upsert({
    where: { id: 'med-metf-500' },
    update: {},
    create: {
      id: 'med-metf-500',
      name: 'Glycomet-GP 1 Tablet PR',
      brandName: 'Glycomet-GP 1',
      genericName: 'Glimepiride (1mg) + Metformin Hydrochloride (500mg)',
      category: 'Anti-Diabetic',
      dosageForm: 'Tablet',
      strength: '1mg/500mg',
      manufacturer: 'USV Private Limited',
      description: 'Dual combination anti-diabetic medication for glycemic control in adult Type 2 diabetes mellitus.',
      requiresPrescription: true,
      unitPrice: 110.00,
      minThreshold: 50,
      suggestedReorderQty: 200,
      storageCondition: 'Store protected from heat and moisture'
    }
  });

  const med4 = await prisma.medicine.upsert({
    where: { id: 'med-pant-40' },
    update: {},
    create: {
      id: 'med-pant-40',
      name: 'Pan-D Capsule',
      brandName: 'Pan-D',
      genericName: 'Pantoprazole (40mg) + Domperidone (30mg SR)',
      category: 'Gastrointestinal',
      dosageForm: 'Capsule',
      strength: '40mg/30mg',
      manufacturer: 'Alkem Laboratories',
      description: 'Proton pump inhibitor and prokinetic agent for gastroesophageal reflux disease (GERD), acid peptic disease, and dyspepsia.',
      requiresPrescription: false,
      unitPrice: 198.00,
      minThreshold: 25,
      suggestedReorderQty: 80,
      storageCondition: 'Store below 30°C'
    }
  });

  const med5 = await prisma.medicine.upsert({
    where: { id: 'med-para-650' },
    update: {},
    create: {
      id: 'med-para-650',
      name: 'Dolo 650 Tablet',
      brandName: 'Dolo 650',
      genericName: 'Paracetamol / Acetaminophen (650mg)',
      category: 'Analgesic & Antipyretic',
      dosageForm: 'Tablet',
      strength: '650mg',
      manufacturer: 'Micro Labs Ltd',
      description: 'Trusted analgesic and antipyretic for high fever, headache, viral body aches, and post-vaccination relief.',
      requiresPrescription: false,
      unitPrice: 34.00,
      minThreshold: 60,
      suggestedReorderQty: 300,
      storageCondition: 'Store at room temperature'
    }
  });

  // 8. Pharmacy Inventory & Batches with QR Codes
  // Pharmacy 1 Inventory
  const inv1 = await prisma.inventory.upsert({
    where: { pharmacyId_medicineId: { pharmacyId: pharmacy1.id, medicineId: med1.id } },
    update: {},
    create: {
      pharmacyId: pharmacy1.id,
      medicineId: med1.id,
      totalQuantity: 85,
      reservedQuantity: 5,
      lowStockThreshold: 30,
      status: 'IN_STOCK'
    }
  });

  const inv2 = await prisma.inventory.upsert({
    where: { pharmacyId_medicineId: { pharmacyId: pharmacy1.id, medicineId: med2.id } },
    update: {},
    create: {
      pharmacyId: pharmacy1.id,
      medicineId: med2.id,
      totalQuantity: 22, // Low stock trigger!
      reservedQuantity: 0,
      lowStockThreshold: 40,
      status: 'LOW_STOCK'
    }
  });

  const inv3 = await prisma.inventory.upsert({
    where: { pharmacyId_medicineId: { pharmacyId: pharmacy1.id, medicineId: med3.id } },
    update: {},
    create: {
      pharmacyId: pharmacy1.id,
      medicineId: med3.id,
      totalQuantity: 140,
      reservedQuantity: 10,
      lowStockThreshold: 50,
      status: 'IN_STOCK'
    }
  });

  const inv4 = await prisma.inventory.upsert({
    where: { pharmacyId_medicineId: { pharmacyId: pharmacy1.id, medicineId: med4.id } },
    update: {},
    create: {
      pharmacyId: pharmacy1.id,
      medicineId: med4.id,
      totalQuantity: 65,
      reservedQuantity: 0,
      lowStockThreshold: 25,
      status: 'IN_STOCK'
    }
  });

  const inv5 = await prisma.inventory.upsert({
    where: { pharmacyId_medicineId: { pharmacyId: pharmacy1.id, medicineId: med5.id } },
    update: {},
    create: {
      pharmacyId: pharmacy1.id,
      medicineId: med5.id,
      totalQuantity: 18, // Very low stock!
      reservedQuantity: 0,
      lowStockThreshold: 60,
      status: 'LOW_STOCK'
    }
  });

  // Batches with Unique QR Codes (for camera QR scanning & barcode validation)
  const batch1 = await prisma.medicineBatch.upsert({
    where: { qrCodeValue: 'BHC-QR-AUG-B2401' },
    update: {},
    create: {
      pharmacyId: pharmacy1.id,
      medicineId: med1.id,
      inventoryId: inv1.id,
      batchNumber: 'AUG-B2401',
      qrCodeValue: 'BHC-QR-AUG-B2401',
      sku: 'SKU-AUG-625-GSK',
      quantity: 50,
      unitPrice: 204.50,
      costPrice: 160.00,
      expiryDate: '2027-08-31',
      supplierId: supplier1?.id
    }
  });

  const batch2 = await prisma.medicineBatch.upsert({
    where: { qrCodeValue: 'BHC-QR-AUG-B2399' },
    update: {},
    create: {
      pharmacyId: pharmacy1.id,
      medicineId: med1.id,
      inventoryId: inv1.id,
      batchNumber: 'AUG-B2399',
      qrCodeValue: 'BHC-QR-AUG-B2399',
      sku: 'SKU-AUG-625-GSK-2',
      quantity: 35,
      unitPrice: 204.50,
      costPrice: 158.00,
      expiryDate: '2026-12-31', // Approaching expiry
      supplierId: supplier1?.id
    }
  });

  const batch3 = await prisma.medicineBatch.upsert({
    where: { qrCodeValue: 'BHC-QR-TEL-T8901' },
    update: {},
    create: {
      pharmacyId: pharmacy1.id,
      medicineId: med2.id,
      inventoryId: inv2.id,
      batchNumber: 'TEL-T8901',
      qrCodeValue: 'BHC-QR-TEL-T8901',
      sku: 'SKU-TEL-40-GLEN',
      quantity: 22,
      unitPrice: 142.00,
      costPrice: 105.00,
      expiryDate: '2027-05-30',
      supplierId: supplier2?.id
    }
  });

  const batch4 = await prisma.medicineBatch.upsert({
    where: { qrCodeValue: 'BHC-QR-GLY-G5510' },
    update: {},
    create: {
      pharmacyId: pharmacy1.id,
      medicineId: med3.id,
      inventoryId: inv3.id,
      batchNumber: 'GLY-G5510',
      qrCodeValue: 'BHC-QR-GLY-G5510',
      sku: 'SKU-GLY-GP1-USV',
      quantity: 140,
      unitPrice: 110.00,
      costPrice: 82.00,
      expiryDate: '2027-11-30',
      supplierId: supplier1?.id
    }
  });

  const batch5 = await prisma.medicineBatch.upsert({
    where: { qrCodeValue: 'BHC-QR-DOL-D9001' },
    update: {},
    create: {
      pharmacyId: pharmacy1.id,
      medicineId: med5.id,
      inventoryId: inv5.id,
      batchNumber: 'DOL-D9001',
      qrCodeValue: 'BHC-QR-DOL-D9001',
      sku: 'SKU-DOL-650-MIC',
      quantity: 18,
      unitPrice: 34.00,
      costPrice: 24.00,
      expiryDate: '2027-09-30',
      supplierId: supplier1?.id
    }
  });

  // 9. Diagnostic Laboratory
  const lab1 = await prisma.diagnosticLaboratory.upsert({
    where: { licenseNumber: 'TS-HYD-LAB-2022-771' },
    update: {},
    create: {
      name: 'Vijaya Bio-Diagnostics & Central Pathology',
      licenseNumber: 'TS-HYD-LAB-2022-771',
      address: 'Plot 12, Himayatnagar Main Road',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500029',
      phone: '+91 40 2763 8899',
      operatingHours: '06:30 AM - 09:00 PM',
      verificationStatus: 'VERIFIED',
      rating: 4.9,
      homeCollectionAvailable: true
    }
  });

  // Lab Admin & Technician
  const labAdminUser = await prisma.user.upsert({
    where: { email: 'laboratory@bharathealth.in' },
    update: {},
    create: {
      email: 'laboratory@bharathealth.in',
      phone: '+91 98765 00010',
      passwordHash: defaultPassword,
      fullName: 'Dr. Sunita Kulkarni (Chief Pathologist & Lab Director)',
      role: 'LAB_ADMIN',
      status: 'ACTIVE',
      city: 'Hyderabad',
      state: 'Telangana',
      labStaff: {
        create: {
          laboratoryId: lab1.id,
          designation: 'Chief Pathologist',
          licenseNumber: 'NABL-MED-PATH-4412'
        }
      }
    }
  });

  const labTechUser = await prisma.user.upsert({
    where: { email: 'tech@bharathealth.in' },
    update: {},
    create: {
      email: 'tech@bharathealth.in',
      phone: '+91 98765 00011',
      passwordHash: defaultPassword,
      fullName: 'Ramesh Naidu (Senior Medical Laboratory Technician)',
      role: 'LAB_STAFF',
      status: 'ACTIVE',
      city: 'Hyderabad',
      state: 'Telangana',
      labStaff: {
        create: {
          laboratoryId: lab1.id,
          designation: 'Senior Lab Technician',
          licenseNumber: 'MLT-TS-2018-912'
        }
      }
    }
  });

  // Diagnostic Test Catalog
  const test1 = await prisma.diagnosticTest.upsert({
    where: { code: 'TEST-CBC-01' },
    update: {},
    create: {
      name: 'Complete Blood Count (CBC) with ESR',
      code: 'TEST-CBC-01',
      category: 'Hematology',
      priceINR: 350,
      tatHours: 12,
      sampleType: 'Whole Blood (EDTA Vacutainer)',
      fastingRequired: false,
      description: 'Comprehensive evaluation of RBC, WBC, Platelets, Hemoglobin, Hematocrit, and Erythrocyte Sedimentation Rate.',
      laboratoryId: lab1.id
    }
  });

  const test2 = await prisma.diagnosticTest.upsert({
    where: { code: 'TEST-HBA1C-02' },
    update: {},
    create: {
      name: 'Glycated Hemoglobin (HbA1c) Test',
      code: 'TEST-HBA1C-02',
      category: 'Biochemistry',
      priceINR: 550,
      tatHours: 8,
      sampleType: 'Whole Blood',
      fastingRequired: false,
      description: 'Measures average blood sugar concentration over the past 2 to 3 months using HPLC methodology.',
      laboratoryId: lab1.id
    }
  });

  const test3 = await prisma.diagnosticTest.upsert({
    where: { code: 'TEST-LIPID-03' },
    update: {},
    create: {
      name: 'Comprehensive Lipid Profile',
      code: 'TEST-LIPID-03',
      category: 'Biochemistry',
      priceINR: 650,
      tatHours: 12,
      sampleType: 'Serum',
      fastingRequired: true,
      description: 'Total Cholesterol, HDL, LDL, VLDL, Triglycerides, and Cardiac Risk Ratio evaluation.',
      laboratoryId: lab1.id
    }
  });

  // 10. Test Bookings & Sample Reports for Demonstration
  const patientProfile1 = await prisma.patientProfile.findUnique({ where: { userId: patient1User.id } });

  if (patientProfile1) {
    const booking1 = await prisma.testBooking.upsert({
      where: { bookingRef: 'BHC-LAB-2026-9901' },
      update: {},
      create: {
        bookingRef: 'BHC-LAB-2026-9901',
        patientId: patientProfile1.id,
        testId: test1.id,
        laboratoryId: lab1.id,
        collectionType: 'Home Collection',
        scheduledDate: '2026-10-30',
        scheduledTime: '08:30 AM',
        status: 'SAMPLE_COLLECTED',
        sampleBarcode: 'BAR-SMP-2026-091',
        technicianName: 'Ramesh Naidu'
      }
    });

    const booking2 = await prisma.testBooking.upsert({
      where: { bookingRef: 'BHC-LAB-2026-8802' },
      update: {},
      create: {
        bookingRef: 'BHC-LAB-2026-8802',
        patientId: patientProfile1.id,
        testId: test2.id,
        laboratoryId: lab1.id,
        collectionType: 'Lab Visit',
        scheduledDate: '2026-10-25',
        scheduledTime: '10:00 AM',
        status: 'AVAILABLE_TO_PATIENT',
        sampleBarcode: 'BAR-SMP-2026-088',
        technicianName: 'Ramesh Naidu'
      }
    });

    // Sample diagnostic report for booking 2
    await prisma.diagnosticReport.upsert({
      where: { bookingId: booking2.id },
      update: {},
      create: {
        bookingId: booking2.id,
        patientId: patientProfile1.id,
        laboratoryId: lab1.id,
        testName: test2.name,
        reportDate: '2026-10-25',
        fileUrl: '/uploads/reports/sample-hba1c-report.pdf',
        fileName: 'HbA1c_Analysis_Report_2026.pdf',
        fileSize: '482 KB',
        mimeType: 'application/pdf',
        pathologistName: 'Dr. Sunita Kulkarni, MD (Path)',
        summaryNotes: 'HbA1c observed at 6.8% (Target for known diabetics: <7.0%). Fasting blood glucose 118 mg/dL. Good glycemic control.',
        status: 'AVAILABLE'
      }
    });
  }

  // 11. Initial Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: patient1User.id,
        title: 'Diagnostic Report Ready',
        message: 'Your Glycated Hemoglobin (HbA1c) diagnostic report from Vijaya Bio-Diagnostics is now available to view and download.',
        category: 'diagnostic',
        read: false,
        actionUrl: '/patient/records'
      },
      {
        userId: pharmacistUser.id,
        title: 'Low Stock Alert Triggered',
        message: 'Telma 40mg (Batch TEL-T8901) has dropped to 22 units (Threshold: 40). Suggested procurement: 150 units.',
        category: 'pharmacy',
        read: false,
        actionUrl: '/pharmacy/inventory'
      },
      {
        userId: adminUser.id,
        title: 'New Provider Verification',
        message: 'CarePlus Diagnostic Center Visakhapatnam submitted license verification documents for administrator approval.',
        category: 'system',
        read: false,
        actionUrl: '/admin/verifications'
      }
    ]
  });

  console.log('✅ Bharat HealthConnect Database Seed completed successfully!');
  console.log('👥 Demo Credentials:');
  console.log('  Central Admin: admin@bharathealth.in / Demo@1234');
  console.log('  Hospital Admin: hospital@aiims-hyd.in / Demo@1234');
  console.log('  Doctor: doctor@bharathealth.in / Demo@1234');
  console.log('  Hospital Staff: staff@aiims-hyd.in / Demo@1234');
  console.log('  Patient: patient@bharathealth.in / Demo@1234');
  console.log('  Pharmacist: pharmacy@bharathealth.in / Demo@1234');
  console.log('  Lab Admin: laboratory@bharathealth.in / Demo@1234');
  console.log('  Lab Tech: tech@bharathealth.in / Demo@1234');
  console.log('  Supplier: supplier@bharathealth.in / Demo@1234');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
