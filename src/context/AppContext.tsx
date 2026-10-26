import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UserRole, 
  Language, 
  PatientProfile, 
  Appointment, 
  AppointmentStatus,
  Medicine, 
  PurchaseOrder, 
  PurchaseOrderStatus,
  DiagnosticBooking, 
  SampleStatus,
  NotificationItem, 
  VerificationRequest 
} from '../types';
import { initialAppointments } from '../data/mockAppointments';
import { mockPatientProfile } from '../data/mockRecords';
import { initialMedicines, initialPurchaseOrders, mockSuppliers } from '../data/mockMedicines';
import { initialDiagnosticBookings } from '../data/mockLabTests';
import { initialNotifications } from '../data/mockNotifications';
import { mockVerificationRequests } from '../data/mockAdmin';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface AppContextType {
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  
  // Patient Profile
  patientProfile: PatientProfile;
  updatePatientProfile: (updated: Partial<PatientProfile>) => void;
  
  // Appointments
  appointments: Appointment[];
  bookAppointment: (data: Omit<Appointment, 'id' | 'bookedAt' | 'status' | 'paymentStatus'>) => { success: boolean; message: string; appointment?: Appointment };
  rescheduleAppointment: (appointmentId: string, newDate: string, newTimeSlot: string) => { success: boolean; message: string };
  cancelAppointment: (appointmentId: string, reason?: string) => void;
  updateAppointmentStatus: (appointmentId: string, status: AppointmentStatus, notes?: string) => void;
  
  // Pharmacy
  medicines: Medicine[];
  purchaseOrders: PurchaseOrder[];
  adjustStock: (medicineId: string, newQuantity: number) => void;
  createPurchaseOrder: (medicineId: string, quantity: number, supplierId: string, notes?: string) => { success: boolean; message: string; order?: PurchaseOrder };
  updatePOStatus: (orderId: string, status: PurchaseOrderStatus) => void;
  receiveGoods: (orderId: string) => void;
  
  // Diagnostics
  diagnosticBookings: DiagnosticBooking[];
  createLabBooking: (testId: string, testName: string, priceINR: number, collectionType: 'Home Collection' | 'Lab Visit', scheduledDate: string, scheduledTime: string) => void;
  updateSampleStatus: (bookingId: string, status: SampleStatus, technicianName?: string) => void;
  uploadReport: (bookingId: string, reportUrl: string, verifiedBy: string) => void;
  
  // Notifications
  notifications: NotificationItem[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void;
  
  // Central Admin
  verificationRequests: VerificationRequest[];
  updateVerificationStatus: (id: string, status: 'Verified' | 'Rejected') => void;
  
  // Toast notifications
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  removeToast: (id: string) => void;

  // AI Assistant Modal
  isAiModalOpen: boolean;
  setIsAiModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Role
  const [currentRole, setRoleState] = useState<UserRole>(() => {
    return (localStorage.getItem('bhc_current_role') as UserRole) || 'patient';
  });

  const setRole = (role: UserRole) => {
    setRoleState(role);
    localStorage.setItem('bhc_current_role', role);
    showToast(`Switched view to ${role.toUpperCase()} portal`, 'info');
  };

  // Language
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('bhc_language') as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('bhc_language', lang);
    const langNames = { en: 'English', hi: 'हिन्दी', te: 'తెలుగు', ta: 'தமிழ்' };
    showToast(`Language set to ${langNames[lang]}`, 'info');
  };

  // Patient Profile
  const [patientProfile, setPatientProfile] = useState<PatientProfile>(() => {
    const saved = localStorage.getItem('bhc_patient_profile');
    return saved ? JSON.parse(saved) : mockPatientProfile;
  });

  const updatePatientProfile = (updated: Partial<PatientProfile>) => {
    setPatientProfile(prev => {
      const next = { ...prev, ...updated };
      localStorage.setItem('bhc_patient_profile', JSON.stringify(next));
      return next;
    });
    showToast('Profile updated successfully', 'success');
  };

  // Appointments
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('bhc_appointments');
    return saved ? JSON.parse(saved) : initialAppointments;
  });

  useEffect(() => {
    localStorage.setItem('bhc_appointments', JSON.stringify(appointments));
  }, [appointments]);

  // Medicines & Pharmacy
  const [medicines, setMedicines] = useState<Medicine[]>(() => {
    const saved = localStorage.getItem('bhc_medicines');
    return saved ? JSON.parse(saved) : initialMedicines;
  });

  useEffect(() => {
    localStorage.setItem('bhc_medicines', JSON.stringify(medicines));
  }, [medicines]);

  // Purchase Orders
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    const saved = localStorage.getItem('bhc_purchase_orders');
    return saved ? JSON.parse(saved) : initialPurchaseOrders;
  });

  useEffect(() => {
    localStorage.setItem('bhc_purchase_orders', JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);

  // Diagnostics
  const [diagnosticBookings, setDiagnosticBookings] = useState<DiagnosticBooking[]>(() => {
    const saved = localStorage.getItem('bhc_diagnostic_bookings');
    return saved ? JSON.parse(saved) : initialDiagnosticBookings;
  });

  useEffect(() => {
    localStorage.setItem('bhc_diagnostic_bookings', JSON.stringify(diagnosticBookings));
  }, [diagnosticBookings]);

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('bhc_notifications');
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  useEffect(() => {
    localStorage.setItem('bhc_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Verifications
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>(() => {
    const saved = localStorage.getItem('bhc_verifications');
    return saved ? JSON.parse(saved) : mockVerificationRequests;
  });

  useEffect(() => {
    localStorage.setItem('bhc_verifications', JSON.stringify(verificationRequests));
  }, [verificationRequests]);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // AI Modal
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Appointment Actions
  const bookAppointment = (data: Omit<Appointment, 'id' | 'bookedAt' | 'status' | 'paymentStatus'>) => {
    // Check for duplicate booking
    const duplicate = appointments.find(
      apt => apt.doctorId === data.doctorId && 
             apt.date === data.date && 
             apt.timeSlot === data.timeSlot &&
             apt.status !== 'Cancelled'
    );

    if (duplicate) {
      showToast(`Slot ${data.timeSlot} on ${data.date} is already booked. Please choose another time.`, 'error');
      return { success: false, message: 'Time slot conflict' };
    }

    const newApt: Appointment = {
      ...data,
      id: 'apt-' + Date.now(),
      status: 'Scheduled',
      paymentStatus: 'Paid',
      bookedAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
    };

    setAppointments(prev => [newApt, ...prev]);

    // Send notification
    addNotification({
      title: 'Appointment Confirmed',
      message: `Your appointment with ${data.doctorName} at ${data.hospitalName} on ${data.date} at ${data.timeSlot} is confirmed.`,
      category: 'appointment',
      targetRole: 'patient',
      actionUrl: '/patient/appointments',
    });

    showToast(`Appointment booked successfully with ${data.doctorName}!`, 'success');
    return { success: true, message: 'Booked successfully', appointment: newApt };
  };

  const rescheduleAppointment = (appointmentId: string, newDate: string, newTimeSlot: string) => {
    const target = appointments.find(a => a.id === appointmentId);
    if (!target) return { success: false, message: 'Appointment not found' };

    // Check slot availability for that doctor
    const conflict = appointments.find(
      a => a.id !== appointmentId && 
           a.doctorId === target.doctorId && 
           a.date === newDate && 
           a.timeSlot === newTimeSlot &&
           a.status !== 'Cancelled'
    );

    if (conflict) {
      showToast(`Selected slot ${newTimeSlot} on ${newDate} is unavailable. Please pick another.`, 'error');
      return { success: false, message: 'Slot unavailable' };
    }

    // Reserve new slot in demo state before releasing old slot
    setAppointments(prev => prev.map(apt => {
      if (apt.id === appointmentId) {
        return {
          ...apt,
          date: newDate,
          timeSlot: newTimeSlot,
          status: 'Rescheduled'
        };
      }
      return apt;
    }));

    addNotification({
      title: 'Appointment Rescheduled',
      message: `Your appointment with ${target.doctorName} has been moved to ${newDate} at ${newTimeSlot}.`,
      category: 'appointment',
      targetRole: 'patient',
      actionUrl: '/patient/appointments'
    });

    showToast(`Appointment rescheduled to ${newDate} at ${newTimeSlot}`, 'success');
    return { success: true, message: 'Appointment rescheduled' };
  };

  const cancelAppointment = (appointmentId: string, reason?: string) => {
    setAppointments(prev => prev.map(apt => {
      if (apt.id === appointmentId) {
        return {
          ...apt,
          status: 'Cancelled',
          paymentStatus: 'Refunded',
          consultationNotes: reason ? `Cancelled by patient: ${reason}` : apt.consultationNotes
        };
      }
      return apt;
    }));

    showToast('Appointment cancelled and refund initiated', 'info');
  };

  const updateAppointmentStatus = (appointmentId: string, status: AppointmentStatus, notes?: string) => {
    setAppointments(prev => prev.map(apt => {
      if (apt.id === appointmentId) {
        return {
          ...apt,
          status,
          consultationNotes: notes ? (apt.consultationNotes ? `${apt.consultationNotes}\n${notes}` : notes) : apt.consultationNotes
        };
      }
      return apt;
    }));
    showToast(`Appointment status updated to ${status}`, 'success');
  };

  // Pharmacy Stock Adjustment
  const adjustStock = (medicineId: string, newQuantity: number) => {
    setMedicines(prev => prev.map(med => {
      if (med.id === medicineId) {
        const status = newQuantity <= 0 ? 'Out of Stock' : (newQuantity <= med.minThreshold ? 'Low Stock' : 'In Stock');
        return {
          ...med,
          quantity: newQuantity,
          status
        };
      }
      return med;
    }));
    showToast('Stock quantity updated in demo inventory', 'success');
  };

  // Pharmacy PO Creation with duplicate prevention for unresolved orders
  const createPurchaseOrder = (medicineId: string, quantity: number, supplierId: string, notes?: string) => {
    const med = medicines.find(m => m.id === medicineId);
    if (!med) return { success: false, message: 'Medicine not found' };

    const supplier = mockSuppliers.find(s => s.id === supplierId) || mockSuppliers[0];

    // Prevent duplicate unresolved orders for same medicine
    const unresolved = purchaseOrders.find(
      po => po.medicineId === medicineId && 
            ['Pending Approval', 'Approved', 'Ordered', 'Dispatched'].includes(po.status)
    );

    if (unresolved) {
      showToast(`An active purchase order (${unresolved.poNumber}) already exists for ${med.name}.`, 'warning');
      return { success: false, message: 'Duplicate active order exists' };
    }

    const newPO: PurchaseOrder = {
      id: 'po-' + Date.now(),
      poNumber: `PO-BHC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      medicineId,
      medicineName: med.name,
      supplierId: supplier.id,
      supplierName: supplier.name,
      quantity,
      unitPrice: Math.round(med.unitPrice * 0.85),
      totalAmount: Math.round(med.unitPrice * 0.85 * quantity),
      status: 'Pending Approval',
      createdAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      estimatedDelivery: new Date(Date.now() + supplier.leadTimeDays * 86400000).toISOString().split('T')[0],
      notes: notes || 'Procurement replenishment order'
    };

    setPurchaseOrders(prev => [newPO, ...prev]);

    addNotification({
      title: 'New Purchase Order Created',
      message: `${newPO.poNumber} created for ${quantity} units of ${med.name}. Awaiting review.`,
      category: 'pharmacy',
      targetRole: 'pharmacy',
      actionUrl: '/pharmacy/orders'
    });

    showToast(`Purchase Order ${newPO.poNumber} created successfully!`, 'success');
    return { success: true, message: 'Order created', order: newPO };
  };

  const updatePOStatus = (orderId: string, status: PurchaseOrderStatus) => {
    setPurchaseOrders(prev => prev.map(po => {
      if (po.id === orderId) {
        return {
          ...po,
          status,
          approvedBy: status === 'Approved' ? 'Pharmacist V. Satyanarayana' : po.approvedBy
        };
      }
      return po;
    }));
    showToast(`Purchase order status updated to: ${status}`, 'info');
  };

  // Goods Received Action: Updates medicine stock only when goods received is confirmed
  const receiveGoods = (orderId: string) => {
    const order = purchaseOrders.find(po => po.id === orderId);
    if (!order) return;

    // Mark PO as Delivered
    setPurchaseOrders(prev => prev.map(po => {
      if (po.id === orderId) {
        return {
          ...po,
          status: 'Delivered',
          receivedAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
        };
      }
      return po;
    }));

    // Update Medicine inventory
    setMedicines(prev => prev.map(med => {
      if (med.id === order.medicineId) {
        const newQty = med.quantity + order.quantity;
        return {
          ...med,
          quantity: newQty,
          status: newQty > med.minThreshold ? 'In Stock' : 'Low Stock'
        };
      }
      return med;
    }));

    addNotification({
      title: 'Goods Received & Stock Restocked',
      message: `${order.quantity} units of ${order.medicineName} received from ${order.supplierName}. Inventory replenished.`,
      category: 'pharmacy',
      targetRole: 'pharmacy',
      actionUrl: '/pharmacy/inventory'
    });

    showToast(`Goods received for ${order.poNumber}. ${order.quantity} units added to inventory!`, 'success');
  };

  // Diagnostics actions
  const createLabBooking = (
    testId: string, 
    testName: string, 
    priceINR: number, 
    collectionType: 'Home Collection' | 'Lab Visit', 
    scheduledDate: string, 
    scheduledTime: string
  ) => {
    const newBooking: DiagnosticBooking = {
      id: 'diag-book-' + Date.now(),
      bookingRef: `BHC-LAB-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: patientProfile.id,
      patientName: patientProfile.name,
      patientPhone: patientProfile.phone,
      testId,
      testName,
      priceINR,
      collectionType,
      scheduledDate,
      scheduledTime,
      status: 'Order Placed',
      isDemo: true
    };

    setDiagnosticBookings(prev => [newBooking, ...prev]);

    addNotification({
      title: 'Diagnostic Test Booked',
      message: `${testName} booked for ${scheduledDate} (${collectionType}). Ref: ${newBooking.bookingRef}`,
      category: 'diagnostic',
      targetRole: 'patient',
      actionUrl: '/laboratory/samples'
    });

    showToast(`Test ${testName} booked successfully! Ref: ${newBooking.bookingRef}`, 'success');
  };

  const updateSampleStatus = (bookingId: string, status: SampleStatus, technicianName?: string) => {
    setDiagnosticBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          status,
          technicianName: technicianName || b.technicianName,
          sampleBarcode: b.sampleBarcode || `BAR-${Math.floor(100000 + Math.random() * 900000)}`
        };
      }
      return b;
    }));
    showToast(`Sample status updated: ${status}`, 'info');
  };

  const uploadReport = (bookingId: string, reportUrl: string, verifiedBy: string) => {
    setDiagnosticBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        return {
          ...b,
          status: 'Delivered to Patient',
          reportUrl,
          verifiedBy,
          verifiedAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
        };
      }
      return b;
    }));

    addNotification({
      title: 'Lab Report Verified & Delivered',
      message: `Diagnostic report for sample ${bookingId} has been verified by ${verifiedBy} and sent to the patient.`,
      category: 'diagnostic',
      targetRole: 'patient',
      actionUrl: '/patient/records'
    });

    showToast('Mock diagnostic report verified and delivered to patient!', 'success');
  };

  // Notifications actions
  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showToast('All notifications marked as read', 'info');
  };

  const addNotification = (item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: NotificationItem = {
      ...item,
      id: 'notif-' + Date.now(),
      timestamp: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Central Admin Verification Action
  const updateVerificationStatus = (id: string, status: 'Verified' | 'Rejected') => {
    setVerificationRequests(prev => prev.map(req => req.id === id ? { ...req, status } : req));
    showToast(`Provider status marked as ${status}`, status === 'Verified' ? 'success' : 'warning');
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setRole,
        language,
        setLanguage,
        patientProfile,
        updatePatientProfile,
        appointments,
        bookAppointment,
        rescheduleAppointment,
        cancelAppointment,
        updateAppointmentStatus,
        medicines,
        purchaseOrders,
        adjustStock,
        createPurchaseOrder,
        updatePOStatus,
        receiveGoods,
        diagnosticBookings,
        createLabBooking,
        updateSampleStatus,
        uploadReport,
        notifications,
        markAsRead,
        markAllAsRead,
        addNotification,
        verificationRequests,
        updateVerificationStatus,
        toasts,
        showToast,
        removeToast,
        isAiModalOpen,
        setIsAiModalOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
