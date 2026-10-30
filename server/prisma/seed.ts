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

  const hospital3 = await prisma.hospital.upsert({
    where: { id: 'hosp-fortis-del' },
    update: {},
    create: {
      id: 'hosp-fortis-del',
      name: 'Fortis Memorial Research Institute Gurugram',
      type: 'Private',
      address: 'Sector 44, Opposite HUDA City Centre',
      city: 'Gurugram',
      state: 'Haryana',
      pincode: '122002',
      phone: '+91 124 496 2200',
      emergencyPhone: '105010',
      operatingHours: '24x7 Emergency & Quaternary Care',
      verificationStatus: 'VERIFIED',
      rating: 4.9,
      reviewCount: 520,
      bedCapacity: 600,
      availableBeds: 140,
      icuBeds: 45,
      emergencyAvailable: true,
      ayushmanEmpanelled: true,
      departments: JSON.stringify(['Oncology', 'Organ Transplant', 'Neurosciences', 'Cardiology', 'Robotic Surgery']),
      specialties: JSON.stringify(['Bone Marrow Transplant', 'Robotic Knee Replacement', 'Pediatric Cardiology']),
      lat: 28.4595,
      lng: 77.0725
    }
  });

  const hospital4 = await prisma.hospital.upsert({
    where: { id: 'hosp-tata-mum' },
    update: {},
    create: {
      id: 'hosp-tata-mum',
      name: 'Tata Memorial Centre & Cancer Institute Mumbai',
      type: 'Government',
      address: 'Dr. E Borges Road, Parel',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400012',
      phone: '+91 22 2417 7000',
      emergencyPhone: '108',
      operatingHours: '24x7 Oncology & Emergency Care',
      verificationStatus: 'VERIFIED',
      rating: 4.9,
      reviewCount: 880,
      bedCapacity: 700,
      availableBeds: 92,
      icuBeds: 35,
      emergencyAvailable: true,
      ayushmanEmpanelled: true,
      departments: JSON.stringify(['Surgical Oncology', 'Radiation Oncology', 'Medical Oncology', 'Palliative Care']),
      specialties: JSON.stringify(['Proton Beam Therapy', 'Immunotherapy', 'Bone Marrow Transplant']),
      lat: 19.0033,
      lng: 72.8427
    }
  });

  const hospital5 = await prisma.hospital.upsert({
    where: { id: 'hosp-manipal-goa' },
    update: {},
    create: {
      id: 'hosp-manipal-goa',
      name: 'Manipal Hospital Dona Paula Goa',
      type: 'Private',
      address: 'Dr. E. Borges Road, Dona Paula',
      city: 'Panaji',
      state: 'Goa',
      pincode: '403004',
      phone: '+91 832 245 4000',
      emergencyPhone: '108',
      operatingHours: '24x7 Emergency & Trauma Care',
      verificationStatus: 'VERIFIED',
      rating: 4.7,
      reviewCount: 290,
      bedCapacity: 250,
      availableBeds: 64,
      icuBeds: 16,
      emergencyAvailable: true,
      ayushmanEmpanelled: true,
      departments: JSON.stringify(['General Surgery', 'Orthopedics', 'Cardiology', 'Internal Medicine']),
      specialties: JSON.stringify(['Trauma Care', 'Sports Medicine', 'Minimally Invasive Surgery']),
      lat: 15.4542,
      lng: 73.8058
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

  const doctor4User = await prisma.user.upsert({
    where: { email: 'dr.meera@bharathealth.in' },
    update: {},
    create: {
      email: 'dr.meera@bharathealth.in',
      phone: '+91 98765 00016',
      passwordHash: defaultPassword,
      fullName: 'Dr. Meera Krishnan',
      role: 'DOCTOR',
      status: 'ACTIVE',
      city: 'Gurugram',
      state: 'Haryana',
      doctorProfile: {
        create: {
          hospitalId: hospital3.id,
          specialty: 'Obstetrics & Gynecology',
          subSpecialty: 'High-Risk Pregnancy & Fetal Medicine',
          qualification: 'MBBS, MS (OBGYN), Fellowship in Maternal-Fetal Med',
          registrationNumber: 'DMC-2015-88310',
          experienceYears: 12,
          consultationFee: 850,
          languages: 'English, Hindi, Tamil',
          rating: 4.9,
          reviewCount: 95,
          about: 'Senior Consultant Obstetrician specializing in high-risk pregnancies, recurrent pregnancy loss, and advanced fetal ultrasound.',
          treatedSymptoms: JSON.stringify(['Pregnancy care', 'Gestational diabetes', 'Hypertension in pregnancy', 'Pelvic pain']),
          conditions: JSON.stringify(['High-Risk Pregnancy', 'Preeclampsia', 'PCOS', 'Fibroids']),
          availableDays: 'Mon, Wed, Fri',
          availableSlots: '10:00 AM, 11:30 AM, 02:00 PM, 04:30 PM',
          verified: true
        }
      }
    }
  });

  const doctor5User = await prisma.user.upsert({
    where: { email: 'dr.rajiv@bharathealth.in' },
    update: {},
    create: {
      email: 'dr.rajiv@bharathealth.in',
      phone: '+91 98765 00017',
      passwordHash: defaultPassword,
      fullName: 'Dr. Rajiv Menon',
      role: 'DOCTOR',
      status: 'ACTIVE',
      city: 'Mumbai',
      state: 'Maharashtra',
      doctorProfile: {
        create: {
          hospitalId: hospital4.id,
          specialty: 'Surgical Oncology',
          subSpecialty: 'Gastrointestinal & Thoracic Cancers',
          qualification: 'MBBS, MS, MCh (Surgical Oncology, Tata Memorial)',
          registrationNumber: 'MMC-2011-77219',
          experienceYears: 18,
          consultationFee: 600,
          languages: 'English, Hindi, Marathi, Malayalam',
          rating: 4.9,
          reviewCount: 240,
          about: 'Leading surgical oncologist with specialized focus on minimally invasive colorectal and thoracic oncologic resections.',
          treatedSymptoms: JSON.stringify(['Unexplained weight loss', 'Persistent abdominal mass', 'Difficulty swallowing', 'Chronic anemia']),
          conditions: JSON.stringify(['Colorectal Cancer', 'Esophageal Cancer', 'Stomach Tumors', 'Lung Nodules']),
          availableDays: 'Tue, Thu, Sat',
          availableSlots: '09:00 AM, 11:00 AM, 02:30 PM, 04:00 PM',
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

  const test4 = await prisma.diagnosticTest.upsert({
    where: { code: 'TEST-TROP-04' },
    update: {},
    create: {
      name: 'High-Sensitivity Cardiac Troponin-I (hs-cTnI)',
      code: 'TEST-TROP-04',
      category: 'Cardiac Markers',
      priceINR: 750,
      tatHours: 4,
      sampleType: 'Serum / Heparin Plasma',
      fastingRequired: false,
      description: 'Rapid quantitative chemiluminescence assay for myocardial infarction and acute coronary syndromes.',
      laboratoryId: lab1.id
    }
  });

  const test5 = await prisma.diagnosticTest.upsert({
    where: { code: 'TEST-THYR-05' },
    update: {},
    create: {
      name: 'Thyroid Function Panel Total (T3, T4, TSH)',
      code: 'TEST-THYR-05',
      category: 'Endocrinology',
      priceINR: 450,
      tatHours: 12,
      sampleType: 'Serum',
      fastingRequired: false,
      description: 'Complete assessment of thyroid gland hormonal activity and metabolic regulation.',
      laboratoryId: lab1.id
    }
  });

  const test6 = await prisma.diagnosticTest.upsert({
    where: { code: 'TEST-LFT-06' },
    update: {},
    create: {
      name: 'Comprehensive Liver Function Test (LFT with Enzymes)',
      code: 'TEST-LFT-06',
      category: 'Biochemistry',
      priceINR: 600,
      tatHours: 8,
      sampleType: 'Serum',
      fastingRequired: true,
      description: 'SGOT, SGPT, Alkaline Phosphatase, Total Bilirubin, Direct Bilirubin, Total Protein, and Albumin/Globulin ratio.',
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

  // 11. Comprehensive Bed Management & Hospital Operations Module
  console.log('🛏️ Seeding Bed Management & Operations...');
  const patientProfile2 = await prisma.patientProfile.findUnique({ where: { userId: patient2User.id } });
  const doctorProfile1 = await prisma.doctorProfile.findUnique({ where: { userId: doctor1User.id } });
  const doctorProfile2 = await prisma.doctorProfile.findUnique({ where: { userId: doctor2User.id } });

  // 11.A Wards
  const wardICU = await prisma.ward.upsert({
    where: { hospitalId_code: { hospitalId: hospital1.id, code: 'ICU-FL1' } },
    update: {},
    create: {
      id: 'ward-icu-01',
      hospitalId: hospital1.id,
      name: 'Critical Care & Medical ICU',
      code: 'ICU-FL1',
      department: 'Critical Care Medicine',
      wardType: 'ICU',
      floor: '1st Floor, Wing A',
      capacity: 8,
      supervisorName: 'Dr. Arvind Swaminathan',
      supervisorPhone: '+91 98765 00004',
      isActive: true
    }
  });

  const wardGeneral = await prisma.ward.upsert({
    where: { hospitalId_code: { hospitalId: hospital1.id, code: 'GEN-FL2' } },
    update: {},
    create: {
      id: 'ward-gen-01',
      hospitalId: hospital1.id,
      name: 'General Medical Ward',
      code: 'GEN-FL2',
      department: 'General Medicine',
      wardType: 'GENERAL',
      floor: '2nd Floor, Wing B',
      capacity: 12,
      supervisorName: 'Sister Sunitha Rao (Head Nurse)',
      supervisorPhone: '+91 98765 00003',
      isActive: true
    }
  });

  const wardEmergency = await prisma.ward.upsert({
    where: { hospitalId_code: { hospitalId: hospital1.id, code: 'EMG-GF' } },
    update: {},
    create: {
      id: 'ward-emg-01',
      hospitalId: hospital1.id,
      name: 'Emergency & Acute Trauma Unit',
      code: 'EMG-GF',
      department: 'Emergency & Trauma Care',
      wardType: 'EMERGENCY',
      floor: 'Ground Floor',
      capacity: 6,
      supervisorName: 'Dr. K. Srinivas (Trauma Lead)',
      supervisorPhone: '+91 40 2345 6788',
      isActive: true
    }
  });

  const wardMaternity = await prisma.ward.upsert({
    where: { hospitalId_code: { hospitalId: hospital1.id, code: 'MAT-FL3' } },
    update: {},
    create: {
      id: 'ward-mat-01',
      hospitalId: hospital1.id,
      name: 'Maternity & Neonatal Care Ward',
      code: 'MAT-FL3',
      department: 'Obstetrics & Gynecology',
      wardType: 'MATERNITY',
      floor: '3rd Floor, Wing C',
      capacity: 6,
      supervisorName: 'Dr. Rekha Varma (OBGYN)',
      supervisorPhone: '+91 98765 00015',
      isActive: true
    }
  });

  const wardIsolation = await prisma.ward.upsert({
    where: { hospitalId_code: { hospitalId: hospital1.id, code: 'ISO-FL4' } },
    update: {},
    create: {
      id: 'ward-iso-01',
      hospitalId: hospital1.id,
      name: 'Airborne & Infectious Isolation Unit',
      code: 'ISO-FL4',
      department: 'Infectious Diseases',
      wardType: 'ISOLATION',
      floor: '4th Floor, Isolated Wing',
      capacity: 4,
      supervisorName: 'Dr. Ananya Reddy (Pulmonology)',
      supervisorPhone: '+91 98765 00005',
      isActive: true
    }
  });

  // 11.B Rooms
  const roomsData = [
    { id: 'room-icu-101', hospitalId: hospital1.id, wardId: wardICU.id, roomNumber: 'ICU-101', roomType: 'DOUBLE', capacity: 2, currentOccupancy: 1, dailyRate: 4500, facilities: JSON.stringify(['Ventilator Port', 'Multi-para Telemetry Monitor', 'Central Oxygen', 'Syringe Pumps']) },
    { id: 'room-icu-102', hospitalId: hospital1.id, wardId: wardICU.id, roomNumber: 'ICU-102', roomType: 'DOUBLE', capacity: 2, currentOccupancy: 1, dailyRate: 4500, facilities: JSON.stringify(['Dialysis Connection', 'Multi-para Monitor', 'Defibrillator', 'Suction']) },
    { id: 'room-icu-103', hospitalId: hospital1.id, wardId: wardICU.id, roomNumber: 'ICU-103', roomType: 'DOUBLE', capacity: 2, currentOccupancy: 0, dailyRate: 4500, facilities: JSON.stringify(['Ventilator Port', 'Cardiac Telemetry', 'Infusion Warmers']) },
    { id: 'room-icu-104', hospitalId: hospital1.id, wardId: wardICU.id, roomNumber: 'ICU-104', roomType: 'DOUBLE', capacity: 2, currentOccupancy: 0, dailyRate: 4500, facilities: JSON.stringify(['Ventilator Port', 'Multi-para Monitor', 'Crash Cart Access']) },
    
    { id: 'room-gen-201', hospitalId: hospital1.id, wardId: wardGeneral.id, roomNumber: 'GEN-201', roomType: 'WARD_SHARED', capacity: 4, currentOccupancy: 1, dailyRate: 1200, facilities: JSON.stringify(['Nurse Call Bell', 'Shared Restroom', 'Oxygen Flowmeter', 'Curtain Partitions']) },
    { id: 'room-gen-202', hospitalId: hospital1.id, wardId: wardGeneral.id, roomNumber: 'GEN-202', roomType: 'WARD_SHARED', capacity: 4, currentOccupancy: 0, dailyRate: 1200, facilities: JSON.stringify(['Nurse Call Bell', 'Shared Restroom', 'Oxygen Flowmeter']) },
    { id: 'room-gen-203', hospitalId: hospital1.id, wardId: wardGeneral.id, roomNumber: 'SP-203', roomType: 'DOUBLE', capacity: 2, currentOccupancy: 0, dailyRate: 2200, facilities: JSON.stringify(['Air Conditioning', 'Television', 'Attached Bathroom', 'Attendant Recliner']) },
    { id: 'room-gen-204', hospitalId: hospital1.id, wardId: wardGeneral.id, roomNumber: 'PVT-204', roomType: 'SINGLE', capacity: 1, currentOccupancy: 0, dailyRate: 3500, facilities: JSON.stringify(['Deluxe AC Room', 'Smart TV', 'Private Bathroom', 'Attendant Sofa-Bed', 'Refrigerator', 'WiFi']) },
    
    { id: 'room-emg-001', hospitalId: hospital1.id, wardId: wardEmergency.id, roomNumber: 'EMG-01', roomType: 'WARD_SHARED', capacity: 3, currentOccupancy: 0, dailyRate: 2000, facilities: JSON.stringify(['Rapid Triage Station', 'Central Suction', 'Defibrillator', 'Mobile X-ray Access']) },
    { id: 'room-emg-002', hospitalId: hospital1.id, wardId: wardEmergency.id, roomNumber: 'EMG-02', roomType: 'WARD_SHARED', capacity: 3, currentOccupancy: 0, dailyRate: 2000, facilities: JSON.stringify(['Minor OT Capability', 'Advanced Trauma Life Support Rack', 'High-flow O2']) },

    { id: 'room-mat-301', hospitalId: hospital1.id, wardId: wardMaternity.id, roomNumber: 'MAT-301', roomType: 'WARD_SHARED', capacity: 3, currentOccupancy: 0, dailyRate: 2500, facilities: JSON.stringify(['Neonatal Radiant Warmer', 'Fetal Doppler', 'Mother Feeder Chair', 'Attached Restroom']) },
    { id: 'room-iso-401', hospitalId: hospital1.id, wardId: wardIsolation.id, roomNumber: 'ISO-401', roomType: 'DOUBLE', capacity: 2, currentOccupancy: 0, dailyRate: 4000, facilities: JSON.stringify(['Negative Pressure Air Handler', 'HEPA Filtration', 'Ante-Room Airlock', 'Intercom']) }
  ];

  for (const r of roomsData) {
    await prisma.room.upsert({
      where: { wardId_roomNumber: { wardId: r.wardId, roomNumber: r.roomNumber } },
      update: {},
      create: r
    });
  }

  // 11.C Beds
  const bedsData = [
    // ICU Beds
    { id: 'bed-icu-101-a', hospitalId: hospital1.id, wardId: wardICU.id, roomId: 'room-icu-101', bedNumber: 'ICU-101-A', bedCategory: 'ICU', bedType: 'FULL_ELECTRIC', dailyTariff: 4500, status: 'OCCUPIED', facilities: JSON.stringify(['Motorized 5-function', 'Pressure ulcer relief mattress', 'IV Pole']) },
    { id: 'bed-icu-101-b', hospitalId: hospital1.id, wardId: wardICU.id, roomId: 'room-icu-101', bedNumber: 'ICU-101-B', bedCategory: 'ICU', bedType: 'FULL_ELECTRIC', dailyTariff: 4500, status: 'AVAILABLE', facilities: JSON.stringify(['Motorized 5-function', 'Multi-axis positioning']) },
    { id: 'bed-icu-102-a', hospitalId: hospital1.id, wardId: wardICU.id, roomId: 'room-icu-102', bedNumber: 'ICU-102-A', bedCategory: 'ICU', bedType: 'FULL_ELECTRIC', dailyTariff: 4500, status: 'OCCUPIED', facilities: JSON.stringify(['Dialysis compatibility', 'Cardiac chair position']) },
    { id: 'bed-icu-102-b', hospitalId: hospital1.id, wardId: wardICU.id, roomId: 'room-icu-102', bedNumber: 'ICU-102-B', bedCategory: 'ICU', bedType: 'FULL_ELECTRIC', dailyTariff: 4500, status: 'CLEANING_REQUIRED', facilities: JSON.stringify(['Motorized 5-function']) },
    { id: 'bed-icu-103-a', hospitalId: hospital1.id, wardId: wardICU.id, roomId: 'room-icu-103', bedNumber: 'ICU-103-A', bedCategory: 'ICU', bedType: 'FULL_ELECTRIC', dailyTariff: 4500, status: 'UNDER_MAINTENANCE', facilities: JSON.stringify(['Ventilator integrated frame']) },
    { id: 'bed-icu-103-b', hospitalId: hospital1.id, wardId: wardICU.id, roomId: 'room-icu-103', bedNumber: 'ICU-103-B', bedCategory: 'ICU', bedType: 'FULL_ELECTRIC', dailyTariff: 4500, status: 'AVAILABLE', facilities: JSON.stringify(['Motorized 5-function']) },
    { id: 'bed-icu-104-a', hospitalId: hospital1.id, wardId: wardICU.id, roomId: 'room-icu-104', bedNumber: 'ICU-104-A', bedCategory: 'ICU', bedType: 'FULL_ELECTRIC', dailyTariff: 4500, status: 'AVAILABLE', facilities: JSON.stringify(['Motorized 5-function']) },
    { id: 'bed-icu-104-b', hospitalId: hospital1.id, wardId: wardICU.id, roomId: 'room-icu-104', bedNumber: 'ICU-104-B', bedCategory: 'ICU', bedType: 'FULL_ELECTRIC', dailyTariff: 4500, status: 'AVAILABLE', facilities: JSON.stringify(['Motorized 5-function']) },

    // General Ward Beds
    { id: 'bed-gen-201-a', hospitalId: hospital1.id, wardId: wardGeneral.id, roomId: 'room-gen-201', bedNumber: 'GEN-201-A', bedCategory: 'STANDARD', bedType: 'MANUAL', dailyTariff: 1200, status: 'AVAILABLE', facilities: JSON.stringify(['Semi-Fowler Crank Bed', 'Side Rails']) },
    { id: 'bed-gen-201-b', hospitalId: hospital1.id, wardId: wardGeneral.id, roomId: 'room-gen-201', bedNumber: 'GEN-201-B', bedCategory: 'STANDARD', bedType: 'MANUAL', dailyTariff: 1200, status: 'AVAILABLE', facilities: JSON.stringify(['Semi-Fowler Crank Bed', 'Side Rails']) },
    { id: 'bed-gen-201-c', hospitalId: hospital1.id, wardId: wardGeneral.id, roomId: 'room-gen-201', bedNumber: 'GEN-201-C', bedCategory: 'STANDARD', bedType: 'MANUAL', dailyTariff: 1200, status: 'RESERVED', facilities: JSON.stringify(['Semi-Fowler Crank Bed', 'Side Rails']) },
    { id: 'bed-gen-201-d', hospitalId: hospital1.id, wardId: wardGeneral.id, roomId: 'room-gen-201', bedNumber: 'GEN-201-D', bedCategory: 'STANDARD', bedType: 'MANUAL', dailyTariff: 1200, status: 'AVAILABLE', facilities: JSON.stringify(['Semi-Fowler Crank Bed', 'Side Rails']) },

    { id: 'bed-gen-202-a', hospitalId: hospital1.id, wardId: wardGeneral.id, roomId: 'room-gen-202', bedNumber: 'GEN-202-A', bedCategory: 'STANDARD', bedType: 'MANUAL', dailyTariff: 1200, status: 'CLEANING_REQUIRED', facilities: JSON.stringify(['Semi-Fowler Crank Bed']) },
    { id: 'bed-gen-202-b', hospitalId: hospital1.id, wardId: wardGeneral.id, roomId: 'room-gen-202', bedNumber: 'GEN-202-B', bedCategory: 'STANDARD', bedType: 'MANUAL', dailyTariff: 1200, status: 'AVAILABLE', facilities: JSON.stringify(['Semi-Fowler Crank Bed']) },
    { id: 'bed-gen-202-c', hospitalId: hospital1.id, wardId: wardGeneral.id, roomId: 'room-gen-202', bedNumber: 'GEN-202-C', bedCategory: 'STANDARD', bedType: 'MANUAL', dailyTariff: 1200, status: 'AVAILABLE', facilities: JSON.stringify(['Semi-Fowler Crank Bed']) },
    { id: 'bed-gen-202-d', hospitalId: hospital1.id, wardId: wardGeneral.id, roomId: 'room-gen-202', bedNumber: 'GEN-202-D', bedCategory: 'STANDARD', bedType: 'MANUAL', dailyTariff: 1200, status: 'AVAILABLE', facilities: JSON.stringify(['Semi-Fowler Crank Bed']) },

    // Semi-Private & Private
    { id: 'bed-sp-203-a', hospitalId: hospital1.id, wardId: wardGeneral.id, roomId: 'room-gen-203', bedNumber: 'SP-203-A', bedCategory: 'STANDARD', bedType: 'SEMI_ELECTRIC', dailyTariff: 2200, status: 'AVAILABLE', facilities: JSON.stringify(['Electric Backrest & Knee Elevation', 'Comfort Foam']) },
    { id: 'bed-sp-203-b', hospitalId: hospital1.id, wardId: wardGeneral.id, roomId: 'room-gen-203', bedNumber: 'SP-203-B', bedCategory: 'STANDARD', bedType: 'SEMI_ELECTRIC', dailyTariff: 2200, status: 'AVAILABLE', facilities: JSON.stringify(['Electric Backrest & Knee Elevation']) },
    { id: 'bed-pvt-204-a', hospitalId: hospital1.id, wardId: wardGeneral.id, roomId: 'room-gen-204', bedNumber: 'PVT-204-A', bedCategory: 'STANDARD', bedType: 'FULL_ELECTRIC', dailyTariff: 3500, status: 'AVAILABLE', facilities: JSON.stringify(['Full Electric Deluxe Bed', 'Memory Foam', 'Wireless Nurse Pendant']) },

    // Emergency Beds
    { id: 'bed-emg-001-a', hospitalId: hospital1.id, wardId: wardEmergency.id, roomId: 'room-emg-001', bedNumber: 'EMG-01-A', bedCategory: 'EMERGENCY', bedType: 'SEMI_ELECTRIC', dailyTariff: 2000, status: 'AVAILABLE', facilities: JSON.stringify(['Emergency Trauma Stretcher Bed', 'Integrated X-ray Cassette Holder']) },
    { id: 'bed-emg-001-b', hospitalId: hospital1.id, wardId: wardEmergency.id, roomId: 'room-emg-001', bedNumber: 'EMG-01-B', bedCategory: 'EMERGENCY', bedType: 'SEMI_ELECTRIC', dailyTariff: 2000, status: 'AVAILABLE', facilities: JSON.stringify(['Trauma Stretcher Bed', 'Rapid Trendelenburg']) },
    { id: 'bed-emg-001-c', hospitalId: hospital1.id, wardId: wardEmergency.id, roomId: 'room-emg-001', bedNumber: 'EMG-01-C', bedCategory: 'EMERGENCY', bedType: 'SEMI_ELECTRIC', dailyTariff: 2000, status: 'CLEANING_REQUIRED', facilities: JSON.stringify(['Trauma Stretcher Bed']) },

    // Maternity & Isolation
    { id: 'bed-mat-301-a', hospitalId: hospital1.id, wardId: wardMaternity.id, roomId: 'room-mat-301', bedNumber: 'MAT-301-A', bedCategory: 'MATERNITY', bedType: 'FULL_ELECTRIC', dailyTariff: 2500, status: 'AVAILABLE', facilities: JSON.stringify(['Obstetric Birthing Bed Convertible', 'Side Safety Rails']) },
    { id: 'bed-iso-401-a', hospitalId: hospital1.id, wardId: wardIsolation.id, roomId: 'room-iso-401', bedNumber: 'ISO-401-A', bedCategory: 'ISOLATION', bedType: 'FULL_ELECTRIC', dailyTariff: 4000, status: 'AVAILABLE', facilities: JSON.stringify(['Antimicrobial surface coated', 'Full electric remote']) },
    { id: 'bed-iso-401-b', hospitalId: hospital1.id, wardId: wardIsolation.id, roomId: 'room-iso-401', bedNumber: 'ISO-401-B', bedCategory: 'ISOLATION', bedType: 'FULL_ELECTRIC', dailyTariff: 4000, status: 'BLOCKED', notes: 'Infectious protocol deep chemical terminal disinfection in progress', facilities: JSON.stringify(['Negative air pressure seal']) }
  ];

  for (const b of bedsData) {
    await prisma.bed.upsert({
      where: { hospitalId_bedNumber: { hospitalId: b.hospitalId, bedNumber: b.bedNumber } },
      update: {},
      create: b
    });
  }

  // 11.D Admissions & Discharges
  await prisma.discharge.deleteMany();
  await prisma.bedAllocation.deleteMany();
  await prisma.inpatientInvoice.deleteMany();
  await prisma.admission.deleteMany();

  if (patientProfile1 && doctorProfile1) {
    // Historic Discharged Admission
    const admission0 = await prisma.admission.create({
      data: {
        admissionNumber: 'ADM-2026-000',
        patientId: patientProfile1.id,
        doctorId: doctorProfile1.id,
        hospitalId: hospital1.id,
        bedId: 'bed-gen-201-d',
        admissionType: 'PLANNED',
        priority: 'MEDIUM',
        department: 'Cardiology',
        requestedWardType: 'GENERAL',
        diagnosis: 'Hypertensive Urgency with Symptomatic Epistaxis — Resolved',
        clinicalNotes: 'Blood pressure stabilized with oral antihypertensives. Normal sinus rhythm restored.',
        admissionStatus: 'DISCHARGED',
        admissionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        expectedDischargeDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        actualDischargeDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        emergencyContactName: 'Kavitha Reddy',
        emergencyContactPhone: '+91 98765 43219'
      }
    });

    await prisma.discharge.create({
      data: {
        admissionId: admission0.id,
        patientId: patientProfile1.id,
        doctorId: doctorProfile1.id,
        bedId: 'bed-gen-201-d',
        dischargeDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        dischargeType: 'NORMAL',
        finalDiagnosis: 'Hypertensive Urgency (Controlled)',
        treatmentSummary: 'Treated with IV Labetalol followed by oral Telmisartan 40mg. Discharge BP 124/80 mmHg.',
        prescribedMedicines: 'Tab Telma 40mg OD, Tab Amlodipine 5mg HS for 30 days',
        followUpInstructions: 'Review in OPD after 14 days with weekly home BP chart.',
        billingCleared: true,
        authorizedBy: 'Dr. Arvind Swaminathan (Cardiology Lead)'
      }
    });

    // Active Emergency Cardiac Admission 1
    const admission1 = await prisma.admission.upsert({
      where: { admissionNumber: 'ADM-2026-001' },
      update: {},
      create: {
        admissionNumber: 'ADM-2026-001',
        patientId: patientProfile1.id,
        doctorId: doctorProfile1.id,
        hospitalId: hospital1.id,
        bedId: 'bed-icu-101-a',
        admissionType: 'EMERGENCY',
        priority: 'EMERGENCY',
        department: 'Critical Care Medicine',
        requestedWardType: 'ICU',
        diagnosis: 'Acute Coronary Syndrome (ACS) - Post Primary PCI',
        clinicalNotes: 'Admitted following emergency coronary angiography and drug-eluting stent placement in LAD. Telemetry and hemodynamic monitoring required for 48 hours.',
        admissionStatus: 'ADMITTED',
        admissionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        expectedDischargeDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        emergencyContactName: 'Kavitha Reddy',
        emergencyContactPhone: '+91 98765 43219',
        dailyProgressNotes: JSON.stringify([
          { date: '2026-10-28', note: 'Post-PCI stable. Blood pressure 128/82. SpO2 98% on 2L O2 nasal cannula. Troponin-I trending downward.', doctor: 'Dr. Arvind Swaminathan' },
          { date: '2026-10-29', note: 'Hemodynamically stable. Normal sinus rhythm. Tolerating oral antiplatelets. Step-down to semi-private room planned tomorrow.', doctor: 'Dr. Arvind Swaminathan' }
        ])
      }
    });

    // Link bed to patient
    await prisma.bed.update({
      where: { id: 'bed-icu-101-a' },
      data: {
        currentPatientId: patientProfile1.id,
        currentAdmissionId: admission1.id,
        status: 'OCCUPIED'
      }
    });

    await prisma.bedAllocation.create({
      data: {
        admissionId: admission1.id,
        bedId: 'bed-icu-101-a',
        allocatedBy: 'Priya Sundaram (Admission Desk)'
      }
    });

    // Inpatient Invoice for Admission 1
    await prisma.inpatientInvoice.upsert({
      where: { admissionId: admission1.id },
      update: {},
      create: {
        admissionId: admission1.id,
        patientId: patientProfile1.id,
        hospitalId: hospital1.id,
        invoiceNumber: 'INV-IP-2026-001',
        bedCharges: 9000,
        roomCharges: 0,
        icuCharges: 4000,
        nursingCharges: 2500,
        doctorCharges: 5000,
        labCharges: 3200,
        pharmacyCharges: 6450,
        procedureCharges: 45000,
        totalAmount: 75150,
        discountAmount: 0,
        insuranceClaimAmount: 40000,
        paidAmount: 25000,
        outstandingBalance: 10150,
        status: 'PARTIALLY_PAID',
        paymentHistory: JSON.stringify([
          { date: '2026-10-28', amount: 25000, method: 'UPI / NetBanking', ref: 'UPI-IP-89218' }
        ])
      }
    });
  }

  if (patientProfile2 && doctorProfile2) {
    const admission2 = await prisma.admission.upsert({
      where: { admissionNumber: 'ADM-2026-002' },
      update: {},
      create: {
        admissionNumber: 'ADM-2026-002',
        patientId: patientProfile2.id,
        doctorId: doctorProfile2.id,
        hospitalId: hospital1.id,
        bedId: 'bed-icu-102-a',
        admissionType: 'PLANNED',
        priority: 'HIGH',
        department: 'Pulmonology',
        requestedWardType: 'ICU',
        diagnosis: 'Acute Severe Bronchial Asthma Exacerbation with Hypercapnia',
        clinicalNotes: 'Severe dyspnea, peak flow rate <40% predicted. IV steroids, bronchodilators, and BiPAP support initiated.',
        admissionStatus: 'ADMITTED',
        admissionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        expectedDischargeDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        emergencyContactName: 'Rohan Sharma',
        emergencyContactPhone: '+91 98765 43220',
        dailyProgressNotes: JSON.stringify([
          { date: '2026-10-29', note: 'BiPAP delivered. Wheezing bilateral. Arterial blood gas shows improving pCO2.', doctor: 'Dr. Ananya Reddy' }
        ])
      }
    });

    await prisma.bed.update({
      where: { id: 'bed-icu-102-a' },
      data: {
        currentPatientId: patientProfile2.id,
        currentAdmissionId: admission2.id,
        status: 'OCCUPIED'
      }
    });

    await prisma.bedAllocation.create({
      data: {
        admissionId: admission2.id,
        bedId: 'bed-icu-102-a',
        allocatedBy: 'Priya Sundaram (Admission Desk)'
      }
    });

    // Active General Ward Admission 3
    const admission3 = await prisma.admission.create({
      data: {
        admissionNumber: 'ADM-2026-003',
        patientId: patientProfile2.id,
        doctorId: doctorProfile1.id,
        hospitalId: hospital1.id,
        bedId: 'bed-gen-201-c',
        admissionType: 'PLANNED',
        priority: 'MEDIUM',
        department: 'General Medicine',
        requestedWardType: 'GENERAL',
        diagnosis: 'Acute Viral Gastroenteritis with Dehydration',
        clinicalNotes: 'Intravenous crystalloid rehydration and antiemetics administered. Serum electrolytes stable.',
        admissionStatus: 'ADMITTED',
        admissionDate: new Date(Date.now() - 18 * 60 * 60 * 1000),
        expectedDischargeDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        emergencyContactName: 'Rohan Sharma',
        emergencyContactPhone: '+91 98765 43220'
      }
    });

    await prisma.bed.update({
      where: { id: 'bed-gen-201-c' },
      data: {
        currentPatientId: patientProfile2.id,
        currentAdmissionId: admission3.id,
        status: 'OCCUPIED'
      }
    });

    await prisma.bedAllocation.create({
      data: {
        admissionId: admission3.id,
        bedId: 'bed-gen-201-c',
        allocatedBy: 'Priya Sundaram (Admission Desk)'
      }
    });

    // Active Emergency Observation Admission 4
    const admission4 = await prisma.admission.create({
      data: {
        admissionNumber: 'ADM-2026-004',
        patientId: patientProfile1.id,
        doctorId: doctorProfile2.id,
        hospitalId: hospital1.id,
        bedId: 'bed-emg-001-a',
        admissionType: 'EMERGENCY',
        priority: 'EMERGENCY',
        department: 'Emergency & Trauma',
        requestedWardType: 'EMERGENCY',
        diagnosis: 'Acute Soft Tissue Trauma & Deep Laceration',
        clinicalNotes: 'Primary closure and surgical debridement completed in minor OT. 24-hour hemodynamic observation.',
        admissionStatus: 'ADMITTED',
        admissionDate: new Date(Date.now() - 8 * 60 * 60 * 1000),
        expectedDischargeDate: new Date(Date.now() + 16 * 60 * 60 * 1000),
        emergencyContactName: 'Kavitha Reddy',
        emergencyContactPhone: '+91 98765 43219'
      }
    });

    await prisma.bed.update({
      where: { id: 'bed-emg-001-a' },
      data: {
        currentPatientId: patientProfile1.id,
        currentAdmissionId: admission4.id,
        status: 'OCCUPIED'
      }
    });

    await prisma.bedAllocation.create({
      data: {
        admissionId: admission4.id,
        bedId: 'bed-emg-001-a',
        allocatedBy: 'Priya Sundaram (Admission Desk)'
      }
    });
  }

  // Clean up operational records to make seed cleanly re-runnable
  await prisma.paymentAuditLog.deleteMany();
  await prisma.financialLedger.deleteMany();
  await prisma.refund.deleteMany();
  await prisma.paymentTransaction.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.insuranceClaim.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.insurancePolicy.deleteMany();
  await prisma.medicalEquipment.deleteMany();
  await prisma.cleaningTask.deleteMany();
  await prisma.maintenanceRequest.deleteMany();
  await prisma.nursingAssignment.deleteMany();
  await prisma.waitingList.deleteMany();

  // 11.E Housekeeping & Cleaning Tasks
  await prisma.cleaningTask.createMany({
    data: [
      {
        hospitalId: hospital1.id,
        bedId: 'bed-icu-102-b',
        assignedStaffName: 'Ravi Kumar (Sanitation Team A)',
        status: 'IN_PROGRESS',
        startedAt: new Date(Date.now() - 30 * 60 * 1000),
        notes: 'ICU terminal cleaning in progress. Chemical air sanitization scheduled.'
      },
      {
        hospitalId: hospital1.id,
        bedId: 'bed-gen-202-a',
        assignedStaffName: 'Sunita Mehra (Housekeeping)',
        status: 'COMPLETED',
        startedAt: new Date(Date.now() - 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 15 * 60 * 1000),
        notes: 'Cleaning completed. Ready for supervisor inspection and verification.'
      },
      {
        hospitalId: hospital1.id,
        bedId: 'bed-emg-001-c',
        assignedStaffName: 'Ramesh Goud',
        status: 'PENDING',
        notes: 'Patient transferred to OT. Immediate rapid turn-around cleaning requested.'
      }
    ]
  });

  // 11.F Maintenance Requests
  await prisma.maintenanceRequest.create({
    data: {
      hospitalId: hospital1.id,
      bedId: 'bed-icu-103-a',
      issueDescription: 'Motorized backrest angle motor malfunctioning; optical position sensor showing error code E-31.',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      reportedBy: 'Nurse Shanthi (ICU Floor)',
      assignedTechnician: 'K. Balakrishna (Biomedical Engineering Dept)',
      resolutionNotes: 'Spare motor assembly ordered from manufacturer. Replacement underway.'
    }
  });

  // 11.G Medical Equipment Telemetry & Tracking
  await prisma.medicalEquipment.createMany({
    data: [
      {
        hospitalId: hospital1.id,
        name: 'Hamilton-C6 Intensive Care Ventilator',
        code: 'EQ-VENT-001',
        equipmentType: 'VENTILATOR',
        serialNumber: 'HAM-2024-C6-8819',
        status: 'IN_USE',
        bedId: 'bed-icu-101-a',
        wardId: wardICU.id,
        notes: 'Telemetry active: SIMV mode, Vt 480ml, PEEP 5, FiO2 40%'
      },
      {
        hospitalId: hospital1.id,
        name: 'Philips IntelliVue MX450 Bedside Patient Monitor',
        code: 'EQ-MON-001',
        equipmentType: 'CARDIAC_MONITOR',
        serialNumber: 'PHI-2023-MX-1092',
        status: 'IN_USE',
        bedId: 'bed-icu-101-a',
        wardId: wardICU.id,
        notes: 'Telemetry active: HR 74 bpm, BP 124/78, SpO2 99%, sinus rhythm'
      },
      {
        hospitalId: hospital1.id,
        name: 'Dräger Savina 300 Mechanical Ventilator',
        code: 'EQ-VENT-002',
        equipmentType: 'VENTILATOR',
        serialNumber: 'DRG-2022-SV-4401',
        status: 'MAINTENANCE',
        bedId: 'bed-icu-103-a',
        wardId: wardICU.id,
        notes: 'Scheduled 6-month calibration and sensor replacement'
      },
      {
        hospitalId: hospital1.id,
        name: 'Mindray BeneHeart D6 Defibrillator / Vital Monitor',
        code: 'EQ-DEFIB-001',
        equipmentType: 'DEFIBRILLATOR',
        serialNumber: 'MND-2024-D6-9934',
        status: 'AVAILABLE',
        wardId: wardEmergency.id,
        notes: 'Emergency crash cart ready. Battery 100%'
      },
      {
        hospitalId: hospital1.id,
        name: 'High-Purity Central O2 Flowmeter & Blender Station',
        code: 'EQ-O2-001',
        equipmentType: 'OXYGEN_CYLINDER',
        serialNumber: 'O2-STN-HYD-044',
        status: 'IN_USE',
        bedId: 'bed-icu-102-a',
        wardId: wardICU.id,
        notes: 'Flow 6.0 LPM continuous O2 delivery'
      }
    ]
  });

  // 11.H Nursing Shift Assignments
  await prisma.nursingAssignment.createMany({
    data: [
      {
        wardId: wardICU.id,
        nurseName: 'Sister Anitha Joseph, RN (ICU Certified)',
        shift: 'Morning (07:00 - 15:00)',
        dutyDate: '2026-10-30',
        assignedBeds: JSON.stringify(['ICU-101-A', 'ICU-101-B', 'ICU-102-A', 'ICU-102-B'])
      },
      {
        wardId: wardGeneral.id,
        nurseName: 'Sister Sunitha Rao, RN',
        shift: 'Morning (07:00 - 15:00)',
        dutyDate: '2026-10-30',
        assignedBeds: JSON.stringify(['GEN-201-A', 'GEN-201-B', 'GEN-201-C', 'GEN-201-D'])
      }
    ]
  });

  // 11.I Waiting List Demo Entry
  if (patientProfile2) {
    await prisma.waitingList.create({
      data: {
        hospitalId: hospital1.id,
        patientId: patientProfile2.id,
        requestedWardType: 'SEMI_PRIVATE',
        bedCategory: 'STANDARD',
        priority: 'HIGH',
        ventilatorRequired: false,
        oxygenRequired: false,
        isolationRequired: false,
        status: 'WAITING',
        notes: 'Patient currently under observation in day-care; awaiting Semi-Private bed availability in General Medicine.'
      }
    });
  }

  // 12. Payments, Billing & Financial Management Module
  console.log('💳 Seeding Payments, Invoices, Insurance & Ledger...');
  if (patientProfile1 && doctorProfile1) {
    // 12.A Insurance Policies
    const policy1 = await prisma.insurancePolicy.upsert({
      where: { policyNumber: 'STAR-MED-2026-9901' },
      update: {},
      create: {
        patientId: patientProfile1.id,
        providerName: 'Star Health & Allied Insurance',
        policyNumber: 'STAR-MED-2026-9901',
        policyHolderName: 'Charan Kumar Reddy',
        relationship: 'SELF',
        coverageAmount: 1000000,
        remainingAmount: 924850,
        coPayPercentage: 0,
        validFrom: new Date('2026-01-01'),
        validTill: new Date('2026-12-31'),
        tpaName: 'Medi Assist Insurance TPA Pvt Ltd',
        status: 'ACTIVE'
      }
    });

    await prisma.insurancePolicy.upsert({
      where: { policyNumber: 'PMJAY-TS-2026-44910' },
      update: {},
      create: {
        patientId: patientProfile1.id,
        providerName: 'Ayushman Bharat National Health Protection Scheme (PM-JAY)',
        policyNumber: 'PMJAY-TS-2026-44910',
        policyHolderName: 'Charan Kumar Reddy (Head of Household)',
        relationship: 'SELF',
        coverageAmount: 500000,
        remainingAmount: 500000,
        coPayPercentage: 0,
        validFrom: new Date('2025-04-01'),
        validTill: new Date('2027-03-31'),
        tpaName: 'National Health Authority (NHA) Empanelled',
        status: 'ACTIVE'
      }
    });

    if (patientProfile2) {
      await prisma.insurancePolicy.upsert({
        where: { policyNumber: 'CARE-POL-2026-1189' },
        update: {},
        create: {
          patientId: patientProfile2.id,
          providerName: 'Care Health Insurance',
          policyNumber: 'CARE-POL-2026-1189',
          policyHolderName: 'Meera Sharma',
          relationship: 'SELF',
          coverageAmount: 750000,
          remainingAmount: 700000,
          coPayPercentage: 10,
          validFrom: new Date('2026-02-01'),
          validTill: new Date('2027-01-31'),
          tpaName: 'Vidal Health TPA',
          status: 'ACTIVE'
        }
      });
    }

    // 12.B Invoices with Itemized Charges
    // Invoice 1: Consultation
    const invoice1 = await prisma.invoice.upsert({
      where: { invoiceNumber: 'INV-2026-0001' },
      update: {},
      create: {
        invoiceNumber: 'INV-2026-0001',
        patientId: patientProfile1.id,
        hospitalId: hospital1.id,
        doctorId: doctorProfile1.id,
        category: 'CONSULTATION',
        subTotal: 700,
        discountAmount: 0,
        taxAmount: 0,
        totalAmount: 700,
        insuranceCovered: 0,
        paidAmount: 700,
        outstandingBalance: 0,
        status: 'PAID',
        notes: 'In-person Cardiology Initial Consultation and Clinical Assessment'
      }
    });

    await prisma.invoiceItem.createMany({
      data: [
        {
          invoiceId: invoice1.id,
          serviceCategory: 'DOCTOR_CONSULTATION',
          description: 'Specialist Consultation Fee — Dr. Arvind Swaminathan (Cardiology)',
          quantity: 1,
          unitPrice: 700,
          totalPrice: 700,
          taxRate: 0
        }
      ]
    });

    // Payment for Invoice 1
    const payment1 = await prisma.payment.upsert({
      where: { paymentReference: 'PAY-2026-0001' },
      update: {},
      create: {
        paymentReference: 'PAY-2026-0001',
        invoiceId: invoice1.id,
        patientId: patientProfile1.id,
        hospitalId: hospital1.id,
        amount: 700,
        paymentMethod: 'RAZORPAY_UPI',
        paymentGateway: 'RAZORPAY',
        gatewayOrderId: 'order_RP_DEMO_001',
        gatewayPaymentId: 'pay_RP_DEMO_001',
        gatewaySignature: 'sig_mock_verified_001',
        status: 'SUCCESS',
        idempotencyKey: 'IDEMP-PAY-0001',
        paidAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      }
    });

    // Invoice 2: Diagnostic Lab Panel
    const invoice2 = await prisma.invoice.upsert({
      where: { invoiceNumber: 'INV-2026-0002' },
      update: {},
      create: {
        invoiceNumber: 'INV-2026-0002',
        patientId: patientProfile1.id,
        hospitalId: hospital1.id,
        category: 'DIAGNOSTIC',
        subTotal: 900,
        discountAmount: 0,
        taxAmount: 45,
        totalAmount: 945,
        insuranceCovered: 0,
        paidAmount: 945,
        outstandingBalance: 0,
        status: 'PAID',
        notes: 'Diagnostic blood investigations with phlebotomist home collection'
      }
    });

    await prisma.invoiceItem.createMany({
      data: [
        {
          invoiceId: invoice2.id,
          serviceCategory: 'LAB_TEST',
          description: 'Complete Blood Count (CBC) with ESR Hematology Panel',
          quantity: 1,
          unitPrice: 350,
          totalPrice: 350,
          taxRate: 0
        },
        {
          invoiceId: invoice2.id,
          serviceCategory: 'LAB_TEST',
          description: 'Glycated Hemoglobin (HbA1c) HPLC Test',
          quantity: 1,
          unitPrice: 550,
          totalPrice: 550,
          taxRate: 0
        },
        {
          invoiceId: invoice2.id,
          serviceCategory: 'PROCEDURE',
          description: 'Sterile Phlebotomy & Temperature Controlled Logistics',
          quantity: 1,
          unitPrice: 45,
          totalPrice: 45,
          taxRate: 5
        }
      ]
    });

    const payment2 = await prisma.payment.upsert({
      where: { paymentReference: 'PAY-2026-0002' },
      update: {},
      create: {
        paymentReference: 'PAY-2026-0002',
        invoiceId: invoice2.id,
        patientId: patientProfile1.id,
        hospitalId: hospital1.id,
        amount: 945,
        paymentMethod: 'RAZORPAY_CARD',
        paymentGateway: 'RAZORPAY',
        gatewayOrderId: 'order_RP_DEMO_002',
        gatewayPaymentId: 'pay_RP_DEMO_002',
        gatewaySignature: 'sig_mock_verified_002',
        status: 'SUCCESS',
        idempotencyKey: 'IDEMP-PAY-0002',
        paidAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      }
    });

    // Invoice 3: Inpatient Hospital Stay & Cardiac Intervention
    const invoice3 = await prisma.invoice.upsert({
      where: { invoiceNumber: 'INV-2026-0003' },
      update: {},
      create: {
        invoiceNumber: 'INV-2026-0003',
        patientId: patientProfile1.id,
        hospitalId: hospital1.id,
        doctorId: doctorProfile1.id,
        category: 'INPATIENT',
        subTotal: 75150,
        discountAmount: 0,
        taxAmount: 0,
        totalAmount: 75150,
        insuranceCovered: 40000,
        paidAmount: 25000,
        outstandingBalance: 10150,
        status: 'PARTIALLY_PAID',
        notes: 'Acute Coronary Syndrome primary PCI emergency admission and ICU stay'
      }
    });

    await prisma.invoiceItem.createMany({
      data: [
        {
          invoiceId: invoice3.id,
          serviceCategory: 'BED_CHARGE',
          description: 'Intensive Care Unit (ICU) Motorized Bed Tariff (2 Days @ ₹4,500/day)',
          quantity: 2,
          unitPrice: 4500,
          totalPrice: 9000,
          taxRate: 0
        },
        {
          invoiceId: invoice3.id,
          serviceCategory: 'PROCEDURE',
          description: 'Primary Percutaneous Coronary Intervention (PCI) with Drug-Eluting Stent in LAD',
          quantity: 1,
          unitPrice: 45000,
          totalPrice: 45000,
          taxRate: 0
        },
        {
          invoiceId: invoice3.id,
          serviceCategory: 'ICU_CHARGE',
          description: 'Mechanical Ventilator & Continuous Hemodynamic Monitoring Telemetry',
          quantity: 1,
          unitPrice: 4000,
          totalPrice: 4000,
          taxRate: 0
        },
        {
          invoiceId: invoice3.id,
          serviceCategory: 'NURSING',
          description: '1:1 Critical Care Nursing Care & Infusion Monitoring',
          quantity: 1,
          unitPrice: 2500,
          totalPrice: 2500,
          taxRate: 0
        },
        {
          invoiceId: invoice3.id,
          serviceCategory: 'DOCTOR_CONSULTATION',
          description: 'Consultant Interventional Cardiologist Rounds & Cath Lab Lead Fees',
          quantity: 1,
          unitPrice: 5000,
          totalPrice: 5000,
          taxRate: 0
        },
        {
          invoiceId: invoice3.id,
          serviceCategory: 'LAB_TEST',
          description: 'Serial Troponin-I, ABG, and Electrolyte Lab Diagnostics',
          quantity: 1,
          unitPrice: 3200,
          totalPrice: 3200,
          taxRate: 0
        },
        {
          invoiceId: invoice3.id,
          serviceCategory: 'MEDICINE',
          description: 'Emergency Inpatient Pharmacy: IV Heparin, Glycoprotein IIb/IIIa inhibitors, Antiplatelets',
          quantity: 1,
          unitPrice: 6450,
          totalPrice: 6450,
          taxRate: 0
        }
      ]
    });

    // Advance Payment for Invoice 3
    await prisma.payment.upsert({
      where: { paymentReference: 'PAY-2026-0003' },
      update: {},
      create: {
        paymentReference: 'PAY-2026-0003',
        invoiceId: invoice3.id,
        patientId: patientProfile1.id,
        hospitalId: hospital1.id,
        amount: 25000,
        paymentMethod: 'RAZORPAY_NETBANKING',
        paymentGateway: 'RAZORPAY',
        gatewayOrderId: 'order_RP_DEMO_003',
        gatewayPaymentId: 'pay_RP_DEMO_003',
        gatewaySignature: 'sig_mock_verified_003',
        status: 'SUCCESS',
        idempotencyKey: 'IDEMP-PAY-0003',
        paidAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      }
    });

    // Insurance Claim for Invoice 3
    await prisma.insuranceClaim.upsert({
      where: { claimNumber: 'CLM-2026-0001' },
      update: {},
      create: {
        claimNumber: 'CLM-2026-0001',
        policyId: policy1.id,
        invoiceId: invoice3.id,
        patientId: patientProfile1.id,
        hospitalId: hospital1.id,
        claimAmount: 40000,
        approvedAmount: 40000,
        rejectedAmount: 0,
        patientPayable: 10150,
        status: 'APPROVED',
        preAuthCode: 'AUTH-STAR-99218',
        remarks: 'Emergency Cardiac Stenting pre-authorization approved by Medi Assist TPA under cashless coverage.',
        settledAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    });

    // Invoice 4: Pharmacy Medicine Order
    const invoice4 = await prisma.invoice.upsert({
      where: { invoiceNumber: 'INV-2026-0004' },
      update: {},
      create: {
        invoiceNumber: 'INV-2026-0004',
        patientId: patientProfile1.id,
        hospitalId: hospital1.id,
        category: 'PHARMACY',
        subTotal: 1420,
        discountAmount: 100,
        discountReason: 'Senior Citizen / Ayushman Concession',
        taxAmount: 71,
        totalAmount: 1391,
        insuranceCovered: 0,
        paidAmount: 1391,
        outstandingBalance: 0,
        status: 'PAID',
        notes: 'Monthly maintenance medication order fulfilled by Apollo Pharmacy'
      }
    });

    await prisma.invoiceItem.createMany({
      data: [
        {
          invoiceId: invoice4.id,
          serviceCategory: 'MEDICINE',
          description: 'Telma 40mg (Strip of 15 tablets)',
          quantity: 3,
          unitPrice: 142,
          totalPrice: 426,
          taxRate: 5
        },
        {
          invoiceId: invoice4.id,
          serviceCategory: 'MEDICINE',
          description: 'Augmentin 625 Duo Tablet (Strip of 10 tablets)',
          quantity: 2,
          unitPrice: 204.5,
          totalPrice: 409,
          taxRate: 5
        },
        {
          invoiceId: invoice4.id,
          serviceCategory: 'MEDICINE',
          description: 'Glycomet-GP 1 Tablet PR (Strip of 15 tablets)',
          quantity: 5,
          unitPrice: 110,
          totalPrice: 550,
          taxRate: 5
        },
        {
          invoiceId: invoice4.id,
          serviceCategory: 'PROCEDURE',
          description: 'Standard Express Cold-Chain Home Delivery',
          quantity: 1,
          unitPrice: 35,
          totalPrice: 35,
          taxRate: 18
        }
      ]
    });

    const payment4 = await prisma.payment.upsert({
      where: { paymentReference: 'PAY-2026-0004' },
      update: {},
      create: {
        paymentReference: 'PAY-2026-0004',
        invoiceId: invoice4.id,
        patientId: patientProfile1.id,
        hospitalId: hospital1.id,
        amount: 1391,
        paymentMethod: 'RAZORPAY_UPI',
        paymentGateway: 'RAZORPAY',
        gatewayOrderId: 'order_RP_DEMO_004',
        gatewayPaymentId: 'pay_RP_DEMO_004',
        gatewaySignature: 'sig_mock_verified_004',
        status: 'SUCCESS',
        idempotencyKey: 'IDEMP-PAY-0004',
        paidAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    });

    // Invoice 5: Pending Consultation (for testing instant live payment checkout)
    const invoice5 = await prisma.invoice.upsert({
      where: { invoiceNumber: 'INV-2026-0005' },
      update: {},
      create: {
        invoiceNumber: 'INV-2026-0005',
        patientId: patientProfile1.id,
        hospitalId: hospital1.id,
        doctorId: doctorProfile1.id,
        category: 'CONSULTATION',
        subTotal: 600,
        discountAmount: 0,
        taxAmount: 0,
        totalAmount: 600,
        insuranceCovered: 0,
        paidAmount: 0,
        outstandingBalance: 600,
        status: 'PENDING',
        notes: 'Pulmonology follow-up consultation fee pending settlement'
      }
    });

    await prisma.invoiceItem.createMany({
      data: [
        {
          invoiceId: invoice5.id,
          serviceCategory: 'DOCTOR_CONSULTATION',
          description: 'Spirometry Assessment & Pulmonology Review Consultation',
          quantity: 1,
          unitPrice: 600,
          totalPrice: 600,
          taxRate: 0
        }
      ]
    });

    // Invoice 6: Outpatient Consultation (Pending - for cashier or online testing)
    const invoice6 = await prisma.invoice.upsert({
      where: { invoiceNumber: 'INV-2026-0006' },
      update: {},
      create: {
        invoiceNumber: 'INV-2026-0006',
        patientId: patientProfile2.id,
        hospitalId: hospital2.id,
        doctorId: doctorProfile2.id,
        category: 'CONSULTATION',
        subTotal: 750,
        discountAmount: 0,
        taxAmount: 0,
        totalAmount: 750,
        insuranceCovered: 0,
        paidAmount: 0,
        outstandingBalance: 750,
        status: 'PENDING',
        notes: 'Endocrinology & Diabetic Management initial OPD review'
      }
    });

    await prisma.invoiceItem.createMany({
      data: [
        {
          invoiceId: invoice6.id,
          serviceCategory: 'DOCTOR_CONSULTATION',
          description: 'Specialist Consultation Fee — Dr. Vikramaditya Sen (Endocrinology)',
          quantity: 1,
          unitPrice: 750,
          totalPrice: 750,
          taxRate: 0
        }
      ]
    });

    // Invoice 7: Clinical Procedure (Pending - for claim pre-auth or cashier payment)
    const invoice7 = await prisma.invoice.upsert({
      where: { invoiceNumber: 'INV-2026-0007' },
      update: {},
      create: {
        invoiceNumber: 'INV-2026-0007',
        patientId: patientProfile1.id,
        hospitalId: hospital1.id,
        category: 'PROCEDURE',
        subTotal: 3200,
        discountAmount: 200,
        discountReason: 'Ayushman Empanelled Hospital Concession',
        taxAmount: 0,
        totalAmount: 3000,
        insuranceCovered: 0,
        paidAmount: 0,
        outstandingBalance: 3000,
        status: 'PENDING',
        notes: 'Ultrasound-guided Pleural Fluid Aspiration & Thoracentesis'
      }
    });

    await prisma.invoiceItem.createMany({
      data: [
        {
          invoiceId: invoice7.id,
          serviceCategory: 'PROCEDURE',
          description: 'Ultrasound-guided Thoracentesis with Local Anesthesia',
          quantity: 1,
          unitPrice: 2800,
          totalPrice: 2800,
          taxRate: 0
        },
        {
          invoiceId: invoice7.id,
          serviceCategory: 'SUPPLIES',
          description: 'Sterile Thoracentesis Drainage Kit & Vacuum Bottle',
          quantity: 1,
          unitPrice: 400,
          totalPrice: 400,
          taxRate: 0
        }
      ]
    });

    // Invoice 8: Inpatient Surgical Daycare (Paid with PM-JAY Cashless + POS Card Co-Pay)
    const invoice8 = await prisma.invoice.upsert({
      where: { invoiceNumber: 'INV-2026-0008' },
      update: {},
      create: {
        invoiceNumber: 'INV-2026-0008',
        patientId: patientProfile2.id,
        hospitalId: hospital1.id,
        category: 'INPATIENT',
        subTotal: 48000,
        discountAmount: 0,
        taxAmount: 2400,
        totalAmount: 50400,
        insuranceCovered: 40000,
        paidAmount: 10400,
        outstandingBalance: 0,
        status: 'PAID',
        notes: 'Daycare Laparoscopic Cholecystectomy surgical package with PM-JAY pre-auth'
      }
    });

    await prisma.invoiceItem.createMany({
      data: [
        {
          invoiceId: invoice8.id,
          serviceCategory: 'SURGERY',
          description: 'Laparoscopic Cholecystectomy Surgical Procedure & OT Charges',
          quantity: 1,
          unitPrice: 38000,
          totalPrice: 38000,
          taxRate: 5
        },
        {
          invoiceId: invoice8.id,
          serviceCategory: 'ANESTHESIA',
          description: 'General Anesthesia Lead & Intraoperative Monitoring',
          quantity: 1,
          unitPrice: 7000,
          totalPrice: 7000,
          taxRate: 5
        },
        {
          invoiceId: invoice8.id,
          serviceCategory: 'BED_CHARGE',
          description: 'Semi-Private Room Tariff (1 Day Post-Op Recovery)',
          quantity: 1,
          unitPrice: 3000,
          totalPrice: 3000,
          taxRate: 5
        }
      ]
    });

    const payment8 = await prisma.payment.upsert({
      where: { paymentReference: 'PAY-2026-0008' },
      update: {},
      create: {
        paymentReference: 'PAY-2026-0008',
        invoiceId: invoice8.id,
        patientId: patientProfile2.id,
        hospitalId: hospital1.id,
        amount: 10400,
        paymentMethod: 'POS_CARD',
        paymentGateway: 'RAZORPAY',
        gatewayOrderId: 'order_RP_DEMO_008',
        gatewayPaymentId: 'pay_RP_DEMO_008',
        gatewaySignature: 'sig_mock_verified_008',
        status: 'SUCCESS',
        idempotencyKey: 'IDEMP-PAY-0008',
        paidAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      }
    });

    // Invoice 9: Diagnostic Comprehensive Panel (Partially Paid at Cashier Desk)
    const invoice9 = await prisma.invoice.upsert({
      where: { invoiceNumber: 'INV-2026-0009' },
      update: {},
      create: {
        invoiceNumber: 'INV-2026-0009',
        patientId: patientProfile1.id,
        hospitalId: hospital1.id,
        category: 'DIAGNOSTIC',
        subTotal: 2450,
        discountAmount: 0,
        taxAmount: 0,
        totalAmount: 2450,
        insuranceCovered: 0,
        paidAmount: 1500,
        outstandingBalance: 950,
        status: 'PARTIALLY_PAID',
        notes: 'Executive Cardiac Lipid & Advanced Biomarker Diagnostic Profile'
      }
    });

    await prisma.invoiceItem.createMany({
      data: [
        {
          invoiceId: invoice9.id,
          serviceCategory: 'LAB_TEST',
          description: 'Comprehensive Lipid Profile (Total, HDL, LDL, VLDL, Triglycerides)',
          quantity: 1,
          unitPrice: 850,
          totalPrice: 850,
          taxRate: 0
        },
        {
          invoiceId: invoice9.id,
          serviceCategory: 'LAB_TEST',
          description: 'High-Sensitivity C-Reactive Protein (hs-CRP) Cardiac Risk Assay',
          quantity: 1,
          unitPrice: 950,
          totalPrice: 950,
          taxRate: 0
        },
        {
          invoiceId: invoice9.id,
          serviceCategory: 'LAB_TEST',
          description: 'Serum Creatinine & Estimated GFR (eGFR) Renal Panel',
          quantity: 1,
          unitPrice: 650,
          totalPrice: 650,
          taxRate: 0
        }
      ]
    });

    const payment9 = await prisma.payment.upsert({
      where: { paymentReference: 'PAY-CASH-2026-0001' },
      update: {},
      create: {
        paymentReference: 'PAY-CASH-2026-0001',
        invoiceId: invoice9.id,
        patientId: patientProfile1.id,
        hospitalId: hospital1.id,
        amount: 1500,
        paymentMethod: 'CASH',
        paymentGateway: 'CASH',
        status: 'SUCCESS',
        recordedBy: 'Priya Sundaram (Cashier Desk)',
        paidAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    });

    // Invoice 10: Pediatric Daycare & Phototherapy (Paid via UPI)
    const invoice10 = await prisma.invoice.upsert({
      where: { invoiceNumber: 'INV-2026-0010' },
      update: {},
      create: {
        invoiceNumber: 'INV-2026-0010',
        patientId: patientProfile1.id,
        hospitalId: hospital1.id,
        category: 'INPATIENT',
        subTotal: 12600,
        discountAmount: 0,
        taxAmount: 0,
        totalAmount: 12600,
        insuranceCovered: 0,
        paidAmount: 12600,
        outstandingBalance: 0,
        status: 'PAID',
        notes: 'Pediatric Inpatient Phototherapy & Neonatal Care Package'
      }
    });

    await prisma.invoiceItem.createMany({
      data: [
        {
          invoiceId: invoice10.id,
          serviceCategory: 'BED_CHARGE',
          description: 'Neonatal Care Unit Bed & Radiant Warmer (2 Days)',
          quantity: 2,
          unitPrice: 3500,
          totalPrice: 7000,
          taxRate: 0
        },
        {
          invoiceId: invoice10.id,
          serviceCategory: 'PROCEDURE',
          description: 'Continuous Double-Surface Blue Light Phototherapy',
          quantity: 2,
          unitPrice: 1800,
          totalPrice: 3600,
          taxRate: 0
        },
        {
          invoiceId: invoice10.id,
          serviceCategory: 'DOCTOR_CONSULTATION',
          description: 'Consultant Pediatrician Daily Rounds & Bilirubin Monitoring',
          quantity: 2,
          unitPrice: 1000,
          totalPrice: 2000,
          taxRate: 0
        }
      ]
    });

    const payment10 = await prisma.payment.upsert({
      where: { paymentReference: 'PAY-2026-0010' },
      update: {},
      create: {
        paymentReference: 'PAY-2026-0010',
        invoiceId: invoice10.id,
        patientId: patientProfile1.id,
        hospitalId: hospital1.id,
        amount: 12600,
        paymentMethod: 'RAZORPAY_UPI',
        paymentGateway: 'RAZORPAY',
        gatewayOrderId: 'order_RP_DEMO_010',
        gatewayPaymentId: 'pay_RP_DEMO_010',
        gatewaySignature: 'sig_mock_verified_010',
        status: 'SUCCESS',
        idempotencyKey: 'IDEMP-PAY-0010',
        paidAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    });

    // 12.B Additional Insurance Claims (Approved, Submitted, Settled)
    const policy2 = await prisma.insurancePolicy.findUnique({ where: { policyNumber: 'PMJAY-TS-2026-44910' } });
    const policy3 = await prisma.insurancePolicy.findUnique({ where: { policyNumber: 'CARE-POL-2026-1189' } });

    if (policy2) {
      await prisma.insuranceClaim.upsert({
        where: { claimNumber: 'CLM-2026-0002' },
        update: {},
        create: {
          claimNumber: 'CLM-2026-0002',
          policyId: policy2.id,
          invoiceId: invoice8.id,
          patientId: patientProfile2.id,
          hospitalId: hospital1.id,
          claimAmount: 40000,
          approvedAmount: 40000,
          rejectedAmount: 0,
          patientPayable: 10400,
          status: 'APPROVED',
          preAuthCode: 'AUTH-PMJAY-88219',
          remarks: 'Approved under Ayushman Bharat PM-JAY Laparoscopic Cholecystectomy package Code 204B.',
          settledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        }
      });
    }

    if (policy3) {
      await prisma.insuranceClaim.upsert({
        where: { claimNumber: 'CLM-2026-0003' },
        update: {},
        create: {
          claimNumber: 'CLM-2026-0003',
          policyId: policy3.id,
          invoiceId: invoice7.id,
          patientId: patientProfile1.id,
          hospitalId: hospital1.id,
          claimAmount: 3000,
          approvedAmount: 0,
          rejectedAmount: 0,
          patientPayable: 3000,
          status: 'SUBMITTED',
          preAuthCode: 'AUTH-CARE-PENDING',
          remarks: 'Pre-auth requested by Hospital Admission Desk. Awaiting TPA Medical Review Officer adjudication.'
        }
      });
    }

    // 12.C Refund Records (Requested for testing queue, Processed for history)
    await prisma.refund.upsert({
      where: { refundReference: 'REF-2026-0001' },
      update: {},
      create: {
        refundReference: 'REF-2026-0001',
        paymentId: payment1.id,
        invoiceId: invoice1.id,
        amount: 700,
        reason: 'Consultant cardiologist called for emergency cath lab surgery; patient requested immediate UPI reversal refund.',
        status: 'REQUESTED',
        requestedBy: 'Charan Kumar Reddy',
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
      }
    });

    await prisma.refund.upsert({
      where: { refundReference: 'REF-2026-0002' },
      update: {},
      create: {
        refundReference: 'REF-2026-0002',
        paymentId: payment4.id,
        invoiceId: invoice4.id,
        amount: 350,
        reason: 'Duplicate OTC item scanning error during pharmacy counter settlement.',
        status: 'REQUESTED',
        requestedBy: 'Charan Kumar Reddy',
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000)
      }
    });

    await prisma.refund.upsert({
      where: { refundReference: 'REF-2026-0003' },
      update: {},
      create: {
        refundReference: 'REF-2026-0003',
        paymentId: payment2.id,
        invoiceId: invoice2.id,
        amount: 450,
        reason: 'Excess diagnostic test booking fee refund (duplicate test item adjustment).',
        status: 'PROCESSED',
        requestedBy: 'Charan Kumar Reddy',
        approvedBy: 'Dr. Rajeshwar Sharma (Finance Controller)',
        gatewayRefundId: 'rfnd_RP_DEMO_003_PROCESSED',
        remarks: 'Processed and reversed to patient original Axis Bank card via Razorpay gateway.',
        processedAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    });

    // 12.D Financial Ledger Entries (Expanded double-entry records)
    await prisma.financialLedger.createMany({
      data: [
        {
          ledgerRef: 'LED-2026-001',
          hospitalId: hospital1.id,
          entryType: 'CREDIT',
          category: 'CONSULTATION',
          amount: 700,
          source: 'RAZORPAY',
          referenceId: invoice1.id,
          description: 'Cardiology consultation collection via Razorpay UPI'
        },
        {
          ledgerRef: 'LED-2026-002',
          hospitalId: hospital1.id,
          entryType: 'CREDIT',
          category: 'DIAGNOSTIC',
          amount: 945,
          source: 'RAZORPAY',
          referenceId: invoice2.id,
          description: 'CBC & HbA1c diagnostic panel collection via Razorpay Card'
        },
        {
          ledgerRef: 'LED-2026-003',
          hospitalId: hospital1.id,
          entryType: 'CREDIT',
          category: 'INPATIENT',
          amount: 25000,
          source: 'RAZORPAY',
          referenceId: invoice3.id,
          description: 'Inpatient emergency cardiac admission advance payment via NetBanking'
        },
        {
          ledgerRef: 'LED-2026-004',
          hospitalId: hospital1.id,
          entryType: 'CREDIT',
          category: 'INSURANCE_PAYOUT',
          amount: 40000,
          source: 'TPA_REIMBURSEMENT',
          referenceId: invoice3.id,
          description: 'Star Health cashless pre-auth settlement claim #CLM-2026-0001'
        },
        {
          ledgerRef: 'LED-2026-005',
          hospitalId: hospital1.id,
          entryType: 'CREDIT',
          category: 'PHARMACY',
          amount: 1391,
          source: 'RAZORPAY',
          referenceId: invoice4.id,
          description: 'Apollo Pharmacy online prescription fulfillment settlement'
        },
        {
          ledgerRef: 'LED-2026-006',
          hospitalId: hospital1.id,
          entryType: 'CREDIT',
          category: 'INPATIENT',
          amount: 10400,
          source: 'POS_CARD',
          referenceId: invoice8.id,
          description: 'Laparoscopic Surgery Daycare Patient Co-Pay settlement via POS Card Terminal'
        },
        {
          ledgerRef: 'LED-2026-007',
          hospitalId: hospital1.id,
          entryType: 'CREDIT',
          category: 'INSURANCE_PAYOUT',
          amount: 40000,
          source: 'PM_JAY',
          referenceId: invoice8.id,
          description: 'Ayushman Bharat PM-JAY package claim settlement #CLM-2026-0002 for Surgery'
        },
        {
          ledgerRef: 'LED-2026-008',
          hospitalId: hospital1.id,
          entryType: 'CREDIT',
          category: 'DIAGNOSTIC',
          amount: 1500,
          source: 'CASH',
          referenceId: invoice9.id,
          description: 'Cash counter collection for Cardiac & Lipid Biomarker Profile #INV-2026-0009'
        },
        {
          ledgerRef: 'LED-2026-009',
          hospitalId: hospital1.id,
          entryType: 'CREDIT',
          category: 'INPATIENT',
          amount: 12600,
          source: 'RAZORPAY_UPI',
          referenceId: invoice10.id,
          description: 'Pediatric Inpatient Phototherapy & Neonatal Care Package settlement via UPI'
        },
        {
          ledgerRef: 'LED-2026-010',
          hospitalId: hospital1.id,
          entryType: 'DEBIT',
          category: 'REFUND',
          amount: 450,
          source: 'RAZORPAY',
          referenceId: 'REF-2026-0003',
          description: 'Reversal gateway debit refund for duplicate diagnostic test fee #REF-2026-0003'
        },
        {
          ledgerRef: 'LED-2026-011',
          hospitalId: hospital2.id,
          entryType: 'CREDIT',
          category: 'CONSULTATION',
          amount: 750,
          source: 'RAZORPAY',
          referenceId: invoice6.id,
          description: 'Endocrinology OPD consultation fee collection for Apollo Bengaluru'
        },
        {
          ledgerRef: 'LED-2026-012',
          hospitalId: hospital1.id,
          entryType: 'CREDIT',
          category: 'PHARMACY',
          amount: 4500,
          source: 'COUNTER_DESK',
          referenceId: 'OTC-COLLECT-001',
          description: 'Hospital Main Pharmacy daily OTC medicines cashier collection counter'
        }
      ]
    });

    // 12.E Audit Logs
    await prisma.paymentAuditLog.createMany({
      data: [
        {
          action: 'ORDER_CREATED',
          performedBy: 'Charan Kumar Reddy',
          role: 'PATIENT',
          entityType: 'PAYMENT',
          entityId: 'PAY-2026-0001',
          details: JSON.stringify({ amount: 700, gateway: 'RAZORPAY' })
        },
        {
          action: 'PAYMENT_VERIFIED',
          performedBy: 'Razorpay Webhook Worker',
          role: 'SYSTEM',
          entityType: 'PAYMENT',
          entityId: 'PAY-2026-0001',
          details: JSON.stringify({ signatureVerified: true, orderId: 'order_RP_DEMO_001' })
        },
        {
          action: 'CLAIM_SUBMITTED',
          performedBy: 'Priya Sundaram (Admission Desk)',
          role: 'HOSPITAL_STAFF',
          entityType: 'INSURANCE_CLAIM',
          entityId: 'CLM-2026-0003',
          details: JSON.stringify({ claimAmount: 3000, provider: 'Care Health' })
        },
        {
          action: 'REFUND_REQUESTED',
          performedBy: 'Charan Kumar Reddy',
          role: 'PATIENT',
          entityType: 'REFUND',
          entityId: 'REF-2026-0001',
          details: JSON.stringify({ amount: 700, reason: 'Doctor rescheduled slot' })
        }
      ]
    });
  }

  // 13. Initial Notifications
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
