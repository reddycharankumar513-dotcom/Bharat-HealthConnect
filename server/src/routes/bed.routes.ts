import { Router, Response } from 'express';
import { prisma } from '../db.js';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// ==========================================
// 1. ANALYTICS & OVERVIEW
// ==========================================

router.get('/analytics', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const hospitalId = (req.query.hospitalId as string) || undefined;
    const filter = hospitalId ? { hospitalId } : {};

    const [
      totalBeds,
      availableBeds,
      occupiedBeds,
      cleaningBeds,
      maintenanceBeds,
      blockedBeds,
      reservedBeds,
      totalWards,
      totalRooms,
      activeAdmissions,
      pendingCleaningTasks,
      activeMaintenanceRequests,
      waitingListCount
    ] = await Promise.all([
      prisma.bed.count({ where: filter }),
      prisma.bed.count({ where: { ...filter, status: 'AVAILABLE' } }),
      prisma.bed.count({ where: { ...filter, status: 'OCCUPIED' } }),
      prisma.bed.count({ where: { ...filter, status: 'CLEANING_REQUIRED' } }),
      prisma.bed.count({ where: { ...filter, status: 'UNDER_MAINTENANCE' } }),
      prisma.bed.count({ where: { ...filter, status: 'BLOCKED' } }),
      prisma.bed.count({ where: { ...filter, status: 'RESERVED' } }),
      prisma.ward.count({ where: filter }),
      prisma.room.count({ where: filter }),
      prisma.admission.count({ where: { ...(hospitalId ? { hospitalId } : {}), admissionStatus: 'ADMITTED' } }),
      prisma.cleaningTask.count({ where: { ...(hospitalId ? { hospitalId } : {}), status: { in: ['PENDING', 'IN_PROGRESS', 'COMPLETED'] } } }),
      prisma.maintenanceRequest.count({ where: { ...(hospitalId ? { hospitalId } : {}), status: { in: ['REPORTED', 'IN_PROGRESS'] } } }),
      prisma.waitingList.count({ where: { ...(hospitalId ? { hospitalId } : {}), status: 'WAITING' } })
    ]);

    const occupancyRate = totalBeds > 0 ? Number(((occupiedBeds / totalBeds) * 100).toFixed(1)) : 0;

    res.json({
      success: true,
      analytics: {
        totalBeds,
        availableBeds,
        occupiedBeds,
        cleaningBeds,
        maintenanceBeds,
        blockedBeds,
        reservedBeds,
        totalWards,
        totalRooms,
        activeAdmissions,
        occupancyRate,
        pendingCleaningTasks,
        activeMaintenanceRequests,
        waitingListCount
      }
    });
  } catch (error) {
    console.error('Failed to get bed analytics:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch bed management analytics.' });
  }
});

// ==========================================
// 2. WARDS MANAGEMENT
// ==========================================

router.get('/wards', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const hospitalId = (req.query.hospitalId as string) || undefined;
    const wards = await prisma.ward.findMany({
      where: hospitalId ? { hospitalId } : {},
      include: {
        hospital: { select: { id: true, name: true, city: true } },
        rooms: true,
        beds: {
          select: { id: true, bedNumber: true, status: true, bedCategory: true, dailyTariff: true }
        },
        _count: {
          select: { rooms: true, beds: true, equipment: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    const enrichedWards = wards.map(w => {
      const totalBeds = w.beds.length;
      const availableBeds = w.beds.filter(b => b.status === 'AVAILABLE').length;
      const occupiedBeds = w.beds.filter(b => b.status === 'OCCUPIED').length;
      const cleaningBeds = w.beds.filter(b => b.status === 'CLEANING_REQUIRED').length;
      const maintenanceBeds = w.beds.filter(b => b.status === 'UNDER_MAINTENANCE').length;
      return {
        ...w,
        stats: {
          totalBeds,
          availableBeds,
          occupiedBeds,
          cleaningBeds,
          maintenanceBeds,
          occupancyRate: totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0
        }
      };
    });

    res.json({ success: true, wards: enrichedWards });
  } catch (error) {
    console.error('Failed to get wards:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch wards.' });
  }
});

router.post('/wards', authenticateToken, requireRole(['CENTRAL_ADMIN', 'HOSPITAL_ADMIN']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { hospitalId, name, code, department, wardType, floor, capacity, supervisorName, supervisorPhone } = req.body;

    if (!hospitalId || !name || !code || !department || !wardType) {
      res.status(400).json({ success: false, message: 'Hospital ID, name, code, department, and wardType are required.' });
      return;
    }

    const ward = await prisma.ward.create({
      data: {
        hospitalId,
        name,
        code,
        department,
        wardType,
        floor: floor || '1st Floor',
        capacity: Number(capacity) || 10,
        supervisorName,
        supervisorPhone,
        isActive: true
      }
    });

    res.status(201).json({ success: true, message: 'Ward created successfully.', ward });
  } catch (error: any) {
    console.error('Failed to create ward:', error);
    if (error.code === 'P2002') {
      res.status(409).json({ success: false, message: 'Ward code already exists for this hospital.' });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to create ward.' });
  }
});

router.put('/wards/:id', authenticateToken, requireRole(['CENTRAL_ADMIN', 'HOSPITAL_ADMIN']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, department, wardType, floor, capacity, supervisorName, supervisorPhone, isActive } = req.body;

    const ward = await prisma.ward.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(department && { department }),
        ...(wardType && { wardType }),
        ...(floor && { floor }),
        ...(capacity !== undefined && { capacity: Number(capacity) }),
        ...(supervisorName !== undefined && { supervisorName }),
        ...(supervisorPhone !== undefined && { supervisorPhone }),
        ...(isActive !== undefined && { isActive })
      }
    });

    res.json({ success: true, message: 'Ward updated successfully.', ward });
  } catch (error) {
    console.error('Failed to update ward:', error);
    res.status(500).json({ success: false, message: 'Failed to update ward.' });
  }
});

router.delete('/wards/:id', authenticateToken, requireRole(['CENTRAL_ADMIN', 'HOSPITAL_ADMIN']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Check if any occupied beds exist in this ward
    const occupied = await prisma.bed.count({
      where: { wardId: id, status: 'OCCUPIED' }
    });

    if (occupied > 0) {
      res.status(400).json({ success: false, message: 'Cannot delete ward with active occupied beds. Please transfer or discharge patients first.' });
      return;
    }

    await prisma.ward.delete({ where: { id } });
    res.json({ success: true, message: 'Ward deleted successfully.' });
  } catch (error) {
    console.error('Failed to delete ward:', error);
    res.status(500).json({ success: false, message: 'Failed to delete ward.' });
  }
});

// ==========================================
// 3. ROOMS MANAGEMENT
// ==========================================

router.get('/rooms', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { wardId, hospitalId } = req.query;
    const where: any = {};
    if (wardId) where.wardId = wardId as string;
    if (hospitalId) where.hospitalId = hospitalId as string;

    const rooms = await prisma.room.findMany({
      where,
      include: {
        ward: { select: { id: true, name: true, wardType: true, department: true } },
        beds: true
      },
      orderBy: { roomNumber: 'asc' }
    });

    res.json({ success: true, rooms });
  } catch (error) {
    console.error('Failed to get rooms:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch rooms.' });
  }
});

router.post('/rooms', authenticateToken, requireRole(['CENTRAL_ADMIN', 'HOSPITAL_ADMIN']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { hospitalId, wardId, roomNumber, roomType, capacity, dailyRate, facilities } = req.body;

    if (!hospitalId || !wardId || !roomNumber) {
      res.status(400).json({ success: false, message: 'Hospital ID, Ward ID, and Room Number are required.' });
      return;
    }

    const room = await prisma.room.create({
      data: {
        hospitalId,
        wardId,
        roomNumber,
        roomType: roomType || 'WARD_SHARED',
        capacity: Number(capacity) || 1,
        dailyRate: Number(dailyRate) || 1200,
        facilities: typeof facilities === 'string' ? facilities : JSON.stringify(facilities || []),
        isActive: true
      }
    });

    res.status(201).json({ success: true, message: 'Room created successfully.', room });
  } catch (error: any) {
    console.error('Failed to create room:', error);
    if (error.code === 'P2002') {
      res.status(409).json({ success: false, message: 'Room number already exists in this ward.' });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to create room.' });
  }
});

router.put('/rooms/:id', authenticateToken, requireRole(['CENTRAL_ADMIN', 'HOSPITAL_ADMIN']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { roomType, capacity, dailyRate, facilities, isActive } = req.body;

    const room = await prisma.room.update({
      where: { id },
      data: {
        ...(roomType && { roomType }),
        ...(capacity !== undefined && { capacity: Number(capacity) }),
        ...(dailyRate !== undefined && { dailyRate: Number(dailyRate) }),
        ...(facilities !== undefined && { facilities: typeof facilities === 'string' ? facilities : JSON.stringify(facilities) }),
        ...(isActive !== undefined && { isActive })
      }
    });

    res.json({ success: true, message: 'Room updated successfully.', room });
  } catch (error) {
    console.error('Failed to update room:', error);
    res.status(500).json({ success: false, message: 'Failed to update room.' });
  }
});

// ==========================================
// 4. BEDS DIRECTORY & STATUS MANAGEMENT
// ==========================================

router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { hospitalId, wardId, roomId, category, status, search } = req.query;
    const where: any = {};

    if (hospitalId) where.hospitalId = hospitalId as string;
    if (wardId) where.wardId = wardId as string;
    if (roomId) where.roomId = roomId as string;
    if (category) where.bedCategory = category as string;
    if (status && status !== 'ALL') where.status = status as string;
    if (search) {
      where.OR = [
        { bedNumber: { contains: search as string } },
        { room: { roomNumber: { contains: search as string } } },
        { ward: { name: { contains: search as string } } }
      ];
    }

    const beds = await prisma.bed.findMany({
      where,
      include: {
        ward: { select: { id: true, name: true, wardType: true, department: true, floor: true } },
        room: { select: { id: true, roomNumber: true, roomType: true, dailyRate: true } },
        equipment: { select: { id: true, name: true, code: true, equipmentType: true, status: true } },
        admissions: {
          where: { admissionStatus: 'ADMITTED' },
          take: 1,
          include: {
            patient: {
              include: {
                user: { select: { fullName: true, phone: true, email: true } }
              }
            },
            doctor: {
              include: {
                user: { select: { fullName: true } }
              }
            }
          }
        },
        cleaningTasks: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        },
        maintenanceRequests: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: [{ wardId: 'asc' }, { bedNumber: 'asc' }]
    });

    res.json({ success: true, beds });
  } catch (error) {
    console.error('Failed to get beds:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch beds directory.' });
  }
});

router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const bed = await prisma.bed.findUnique({
      where: { id },
      include: {
        hospital: { select: { id: true, name: true, city: true, phone: true } },
        ward: true,
        room: true,
        equipment: true,
        cleaningTasks: { orderBy: { createdAt: 'desc' }, take: 5 },
        maintenanceRequests: { orderBy: { createdAt: 'desc' }, take: 5 },
        bedAllocations: {
          orderBy: { allocatedAt: 'desc' },
          take: 5,
          include: {
            admission: {
              include: {
                patient: { include: { user: { select: { fullName: true, phone: true } } } }
              }
            }
          }
        },
        fromTransfers: { orderBy: { transferDate: 'desc' }, take: 3 },
        toTransfers: { orderBy: { transferDate: 'desc' }, take: 3 }
      }
    });

    if (!bed) {
      res.status(404).json({ success: false, message: 'Bed not found.' });
      return;
    }

    res.json({ success: true, bed });
  } catch (error) {
    console.error('Failed to get bed details:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch bed details.' });
  }
});

router.post('/', authenticateToken, requireRole(['CENTRAL_ADMIN', 'HOSPITAL_ADMIN']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { hospitalId, wardId, roomId, bedNumber, bedCategory, bedType, dailyTariff, facilities, notes } = req.body;

    if (!hospitalId || !wardId || !roomId || !bedNumber) {
      res.status(400).json({ success: false, message: 'Hospital, Ward, Room, and Bed Number are required.' });
      return;
    }

    const bed = await prisma.bed.create({
      data: {
        hospitalId,
        wardId,
        roomId,
        bedNumber,
        bedCategory: bedCategory || 'STANDARD',
        bedType: bedType || 'SEMI_ELECTRIC',
        dailyTariff: Number(dailyTariff) || 1200,
        facilities: typeof facilities === 'string' ? facilities : JSON.stringify(facilities || []),
        status: 'AVAILABLE',
        notes
      }
    });

    res.status(201).json({ success: true, message: 'Bed created successfully.', bed });
  } catch (error: any) {
    console.error('Failed to create bed:', error);
    if (error.code === 'P2002') {
      res.status(409).json({ success: false, message: 'Bed number already exists in this hospital.' });
      return;
    }
    res.status(500).json({ success: false, message: 'Failed to create bed.' });
  }
});

router.put('/:id', authenticateToken, requireRole(['CENTRAL_ADMIN', 'HOSPITAL_ADMIN', 'HOSPITAL_STAFF']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { bedNumber, bedCategory, bedType, dailyTariff, facilities, notes, status } = req.body;

    const existingBed = await prisma.bed.findUnique({ where: { id } });
    if (!existingBed) {
      res.status(404).json({ success: false, message: 'Bed not found.' });
      return;
    }

    // Guard: Don't allow changing an OCCUPIED bed to AVAILABLE directly via edit without discharge/transfer!
    if (existingBed.status === 'OCCUPIED' && status === 'AVAILABLE') {
      res.status(400).json({ success: false, message: 'Cannot mark an occupied bed available directly. Please perform patient discharge or transfer.' });
      return;
    }

    const bed = await prisma.bed.update({
      where: { id },
      data: {
        ...(bedNumber && { bedNumber }),
        ...(bedCategory && { bedCategory }),
        ...(bedType && { bedType }),
        ...(dailyTariff !== undefined && { dailyTariff: Number(dailyTariff) }),
        ...(facilities !== undefined && { facilities: typeof facilities === 'string' ? facilities : JSON.stringify(facilities) }),
        ...(notes !== undefined && { notes }),
        ...(status && { status })
      }
    });

    res.json({ success: true, message: 'Bed updated successfully.', bed });
  } catch (error) {
    console.error('Failed to update bed:', error);
    res.status(500).json({ success: false, message: 'Failed to update bed.' });
  }
});

router.patch('/:id/status', authenticateToken, requireRole(['CENTRAL_ADMIN', 'HOSPITAL_ADMIN', 'HOSPITAL_STAFF', 'DOCTOR']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['AVAILABLE', 'RESERVED', 'OCCUPIED', 'CLEANING_REQUIRED', 'UNDER_MAINTENANCE', 'BLOCKED'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      return;
    }

    const currentBed = await prisma.bed.findUnique({ where: { id } });
    if (!currentBed) {
      res.status(404).json({ success: false, message: 'Bed not found.' });
      return;
    }

    if (currentBed.status === 'OCCUPIED' && status === 'AVAILABLE') {
      res.status(400).json({ success: false, message: 'Cannot set an occupied bed directly to available. Use Discharge or Transfer.' });
      return;
    }

    const updated = await prisma.bed.update({
      where: { id },
      data: {
        status,
        ...(notes && { notes })
      }
    });

    res.json({ success: true, message: `Bed status updated to ${status}`, bed: updated });
  } catch (error) {
    console.error('Failed to update bed status:', error);
    res.status(500).json({ success: false, message: 'Failed to update bed status.' });
  }
});

router.delete('/:id', authenticateToken, requireRole(['CENTRAL_ADMIN', 'HOSPITAL_ADMIN']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const bed = await prisma.bed.findUnique({ where: { id } });

    if (!bed) {
      res.status(404).json({ success: false, message: 'Bed not found.' });
      return;
    }

    if (bed.status === 'OCCUPIED') {
      res.status(400).json({ success: false, message: 'Cannot delete an occupied bed.' });
      return;
    }

    await prisma.bed.delete({ where: { id } });
    res.json({ success: true, message: 'Bed deleted successfully.' });
  } catch (error) {
    console.error('Failed to delete bed:', error);
    res.status(500).json({ success: false, message: 'Failed to delete bed.' });
  }
});

// ==========================================
// 5. SMART BED ALLOCATION RECOMMENDATION ENGINE
// ==========================================

router.get('/smart-recommendations', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { hospitalId, wardType, bedCategory, requiresVentilator, requiresOxygen, requiresIsolation, maxTariff } = req.query;

    const where: any = {
      status: 'AVAILABLE'
    };

    if (hospitalId) where.hospitalId = hospitalId as string;
    if (bedCategory && bedCategory !== 'ANY') where.bedCategory = bedCategory as string;

    const beds = await prisma.bed.findMany({
      where,
      include: {
        ward: true,
        room: true,
        equipment: true
      }
    });

    // Score and rank beds based on suitability
    const scoredBeds = beds.map(bed => {
      let score = 100;
      const reasons: string[] = [];

      // Ward match
      if (wardType && bed.ward.wardType.toUpperCase() === (wardType as string).toUpperCase()) {
        score += 50;
        reasons.push(`Exact Ward Type match (${bed.ward.wardType})`);
      }

      // Ventilator requirement
      const hasVentilator = bed.equipment.some(e => e.equipmentType === 'VENTILATOR' && e.status === 'AVAILABLE') ||
                            (bed.facilities && bed.facilities.toLowerCase().includes('ventilator'));
      if (requiresVentilator === 'true') {
        if (hasVentilator) {
          score += 40;
          reasons.push('Equipped with active mechanical ventilator');
        } else {
          score -= 60;
        }
      }

      // Oxygen requirement
      const hasO2 = bed.equipment.some(e => e.equipmentType === 'OXYGEN_CYLINDER' && e.status === 'AVAILABLE') ||
                    (bed.facilities && bed.facilities.toLowerCase().includes('oxygen'));
      if (requiresOxygen === 'true') {
        if (hasO2) {
          score += 30;
          reasons.push('Central oxygen flowmeter configured');
        } else {
          score -= 30;
        }
      }

      // Isolation requirement
      if (requiresIsolation === 'true') {
        if (bed.ward.wardType === 'ISOLATION') {
          score += 60;
          reasons.push('Negative-pressure air handling isolation unit');
        } else {
          score -= 80;
        }
      }

      // Budget check
      if (maxTariff && bed.dailyTariff <= Number(maxTariff)) {
        score += 20;
        reasons.push(`Within daily tariff budget (₹${bed.dailyTariff}/day)`);
      }

      return {
        ...bed,
        matchScore: Math.max(score, 10),
        recommendationReasons: reasons
      };
    });

    // Sort by match score descending
    scoredBeds.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      recommendations: scoredBeds
    });
  } catch (error) {
    console.error('Failed to get smart recommendations:', error);
    res.status(500).json({ success: false, message: 'Failed to compute smart bed recommendations.' });
  }
});

// ==========================================
// 6. INPATIENT ADMISSIONS & TRANSACTIONAL BED ALLOCATION
// ==========================================

router.get('/admissions', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { hospitalId, patientId, doctorId, status } = req.query;
    const where: any = {};

    if (hospitalId) where.hospitalId = hospitalId as string;
    if (patientId) where.patientId = patientId as string;
    if (doctorId) where.doctorId = doctorId as string;
    if (status && status !== 'ALL') where.admissionStatus = status as string;

    // If patient user, auto-filter to their profile
    if (req.user?.role === 'PATIENT') {
      const patientProfile = await prisma.patientProfile.findUnique({ where: { userId: req.user.id } });
      if (patientProfile) {
        where.patientId = patientProfile.id;
      }
    }

    const admissions = await prisma.admission.findMany({
      where,
      include: {
        patient: {
          include: {
            user: { select: { fullName: true, phone: true, email: true, abhaId: true } }
          }
        },
        doctor: {
          include: {
            user: { select: { fullName: true, email: true } }
          }
        },
        hospital: { select: { id: true, name: true, city: true, phone: true } },
        bed: {
          include: {
            ward: true,
            room: true
          }
        },
        inpatientInvoice: true,
        discharge: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, admissions });
  } catch (error) {
    console.error('Failed to fetch admissions:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch admissions.' });
  }
});

router.post('/admissions/request', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      patientId,
      doctorId,
      hospitalId,
      admissionType,
      priority,
      department,
      requestedWardType,
      diagnosis,
      clinicalNotes,
      expectedDischargeDate,
      emergencyContactName,
      emergencyContactPhone
    } = req.body;

    if (!patientId || !hospitalId || !diagnosis) {
      res.status(400).json({ success: false, message: 'Patient ID, Hospital ID, and Diagnosis are required.' });
      return;
    }

    const count = await prisma.admission.count();
    const admissionNumber = `ADM-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const admission = await prisma.admission.create({
      data: {
        admissionNumber,
        patientId,
        doctorId: doctorId || undefined,
        hospitalId,
        admissionType: admissionType || 'DIRECT',
        priority: priority || 'NORMAL',
        department: department || 'General Medicine',
        requestedWardType: requestedWardType || 'GENERAL',
        diagnosis,
        clinicalNotes,
        expectedDischargeDate: expectedDischargeDate ? new Date(expectedDischargeDate) : null,
        emergencyContactName,
        emergencyContactPhone,
        admissionStatus: 'REQUESTED'
      }
    });

    res.status(201).json({ success: true, message: 'Admission requested successfully.', admission });
  } catch (error) {
    console.error('Failed to create admission request:', error);
    res.status(500).json({ success: false, message: 'Failed to create admission request.' });
  }
});

// Transactional Bed Allocation
router.post('/admissions/:id/allocate', authenticateToken, requireRole(['CENTRAL_ADMIN', 'HOSPITAL_ADMIN', 'HOSPITAL_STAFF']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { bedId, notes } = req.body;

  if (!bedId) {
    res.status(400).json({ success: false, message: 'Bed ID is required for allocation.' });
    return;
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get admission
      const admission = await tx.admission.findUnique({
        where: { id },
        include: { patient: true }
      });

      if (!admission) {
        throw new Error('Admission record not found.');
      }

      if (admission.admissionStatus === 'ADMITTED') {
        throw new Error('Patient is already admitted to a bed. Use Transfer to change beds.');
      }

      // 2. Lock and check bed status
      const bed = await tx.bed.findUnique({
        where: { id: bedId }
      });

      if (!bed) {
        throw new Error('Selected bed does not exist.');
      }

      if (bed.status !== 'AVAILABLE') {
        throw new Error(`Bed ${bed.bedNumber} is not available (Current status: ${bed.status}). Double allocation blocked!`);
      }

      // 3. Mark bed as OCCUPIED and assign patient & admission
      const updatedBed = await tx.bed.update({
        where: { id: bedId },
        data: {
          status: 'OCCUPIED',
          currentPatientId: admission.patientId,
          currentAdmissionId: admission.id
        }
      });

      // 4. Update admission record
      const updatedAdmission = await tx.admission.update({
        where: { id },
        data: {
          bedId: bed.id,
          admissionStatus: 'ADMITTED',
          admissionDate: new Date()
        }
      });

      // 5. Create BedAllocation audit record
      await tx.bedAllocation.create({
        data: {
          admissionId: admission.id,
          bedId: bed.id,
          allocatedBy: req.user?.fullName || 'Staff Coordinator',
          reason: notes || 'Primary admission bed allocation'
        }
      });

      // 6. Update room occupancy
      await tx.room.update({
        where: { id: bed.roomId },
        data: {
          currentOccupancy: { increment: 1 }
        }
      });

      // 7. Check if an inpatient invoice exists, or generate initial invoice
      const existingInvoice = await tx.inpatientInvoice.findUnique({
        where: { admissionId: admission.id }
      });

      if (!existingInvoice) {
        const invCount = await tx.inpatientInvoice.count();
        await tx.inpatientInvoice.create({
          data: {
            invoiceNumber: `INV-IP-${new Date().getFullYear()}-${String(invCount + 1).padStart(4, '0')}`,
            admissionId: admission.id,
            patientId: admission.patientId,
            hospitalId: admission.hospitalId,
            bedCharges: bed.dailyTariff,
            roomCharges: 0,
            icuCharges: bed.bedCategory === 'ICU' ? 2000 : 0,
            nursingCharges: 500,
            doctorCharges: 1000,
            labCharges: 0,
            pharmacyCharges: 0,
            procedureCharges: 0,
            totalAmount: bed.dailyTariff + (bed.bedCategory === 'ICU' ? 2000 : 0) + 1500,
            outstandingBalance: bed.dailyTariff + (bed.bedCategory === 'ICU' ? 2000 : 0) + 1500,
            status: 'PENDING'
          }
        });
      }

      return { bed: updatedBed, admission: updatedAdmission };
    });

    res.json({
      success: true,
      message: `Bed ${result.bed.bedNumber} allocated successfully to Admission ${result.admission.admissionNumber}.`,
      allocation: result
    });
  } catch (error: any) {
    console.error('Bed allocation transaction failed:', error);
    res.status(400).json({ success: false, message: error.message || 'Bed allocation failed.' });
  }
});

// Daily progress note
router.post('/admissions/:id/progress-notes', authenticateToken, requireRole(['DOCTOR', 'HOSPITAL_STAFF', 'HOSPITAL_ADMIN']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    if (!note) {
      res.status(400).json({ success: false, message: 'Note content is required.' });
      return;
    }

    const admission = await prisma.admission.findUnique({ where: { id } });
    if (!admission) {
      res.status(404).json({ success: false, message: 'Admission not found.' });
      return;
    }

    let existingNotes = [];
    if (admission.dailyProgressNotes) {
      try {
        existingNotes = JSON.parse(admission.dailyProgressNotes);
      } catch (e) {
        existingNotes = [];
      }
    }

    const newEntry = {
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
      note,
      author: req.user?.fullName || 'Attending Physician',
      role: req.user?.role
    };

    existingNotes.unshift(newEntry);

    const updated = await prisma.admission.update({
      where: { id },
      data: {
        dailyProgressNotes: JSON.stringify(existingNotes)
      }
    });

    res.json({ success: true, message: 'Progress note added successfully.', admission: updated });
  } catch (error) {
    console.error('Failed to add progress note:', error);
    res.status(500).json({ success: false, message: 'Failed to record progress note.' });
  }
});

// ==========================================
// 7. BED TRANSFER PROTOCOL (ATOMIC)
// ==========================================

router.post('/transfers', authenticateToken, requireRole(['CENTRAL_ADMIN', 'HOSPITAL_ADMIN', 'HOSPITAL_STAFF', 'DOCTOR']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { admissionId, toBedId, transferReason, doctorApproval } = req.body;

  if (!admissionId || !toBedId || !transferReason) {
    res.status(400).json({ success: false, message: 'Admission ID, Target Bed ID, and Transfer Reason are required.' });
    return;
  }

  try {
    const transferResult = await prisma.$transaction(async (tx) => {
      // 1. Fetch current admission and fromBed
      const admission = await tx.admission.findUnique({
        where: { id: admissionId },
        include: { bed: true }
      });

      if (!admission || !admission.bed) {
        throw new Error('Active admission with assigned bed not found.');
      }

      const fromBed = admission.bed;

      // 2. Fetch and check target bed
      const toBed = await tx.bed.findUnique({
        where: { id: toBedId }
      });

      if (!toBed) {
        throw new Error('Target bed not found.');
      }

      if (toBed.status !== 'AVAILABLE') {
        throw new Error(`Target bed ${toBed.bedNumber} is not available (Status: ${toBed.status}).`);
      }

      // 3. Mark old bed as CLEANING_REQUIRED and unassign current admission
      await tx.bed.update({
        where: { id: fromBed.id },
        data: {
          status: 'CLEANING_REQUIRED',
          currentPatientId: null,
          currentAdmissionId: null
        }
      });

      // 4. Mark new bed as OCCUPIED and assign admission
      await tx.bed.update({
        where: { id: toBed.id },
        data: {
          status: 'OCCUPIED',
          currentPatientId: admission.patientId,
          currentAdmissionId: admission.id
        }
      });

      // 5. Update admission record
      await tx.admission.update({
        where: { id: admissionId },
        data: {
          bedId: toBed.id
        }
      });

      // 6. Record BedTransfer log
      const transferRecord = await tx.bedTransfer.create({
        data: {
          admissionId: admission.id,
          patientId: admission.patientId,
          fromBedId: fromBed.id,
          toBedId: toBed.id,
          transferReason,
          doctorApproval: doctorApproval || req.user?.fullName,
          staffName: req.user?.fullName || 'Shift Incharge'
        }
      });

      // 7. Auto-create Cleaning Task for the released bed
      await tx.cleaningTask.create({
        data: {
          hospitalId: fromBed.hospitalId,
          bedId: fromBed.id,
          status: 'PENDING',
          notes: `Post-transfer terminal sanitation for patient transfer to bed ${toBed.bedNumber}. Reason: ${transferReason}`
        }
      });

      return { fromBed, toBed, transferRecord };
    });

    res.json({
      success: true,
      message: `Patient successfully transferred from Bed ${transferResult.fromBed.bedNumber} to Bed ${transferResult.toBed.bedNumber}. Bed ${transferResult.fromBed.bedNumber} queued for cleaning.`,
      transfer: transferResult.transferRecord
    });
  } catch (error: any) {
    console.error('Transfer transaction failed:', error);
    res.status(400).json({ success: false, message: error.message || 'Bed transfer failed.' });
  }
});

// ==========================================
// 8. DISCHARGE MANAGEMENT & VERIFIED PROTOCOL (ATOMIC)
// ==========================================

router.post('/discharges', authenticateToken, requireRole(['CENTRAL_ADMIN', 'HOSPITAL_ADMIN', 'HOSPITAL_STAFF', 'DOCTOR']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const {
    admissionId,
    dischargeType,
    finalDiagnosis,
    treatmentSummary,
    prescribedMedicines,
    followUpInstructions,
    billingCleared
  } = req.body;

  if (!admissionId || !finalDiagnosis || !treatmentSummary) {
    res.status(400).json({ success: false, message: 'Admission ID, Final Diagnosis, and Treatment Summary are required.' });
    return;
  }

  try {
    const dischargeResult = await prisma.$transaction(async (tx) => {
      // 1. Fetch admission and current bed
      const admission = await tx.admission.findUnique({
        where: { id: admissionId },
        include: { bed: true }
      });

      if (!admission) {
        throw new Error('Admission record not found.');
      }

      if (admission.admissionStatus === 'DISCHARGED') {
        throw new Error('Patient is already discharged.');
      }

      const bed = admission.bed;

      // 2. Create Discharge record
      const discharge = await tx.discharge.create({
        data: {
          admissionId: admission.id,
          patientId: admission.patientId,
          doctorId: admission.doctorId,
          bedId: bed?.id || null,
          dischargeType: dischargeType || 'NORMAL',
          finalDiagnosis,
          treatmentSummary,
          prescribedMedicines: typeof prescribedMedicines === 'string' ? prescribedMedicines : JSON.stringify(prescribedMedicines || []),
          followUpInstructions,
          billingCleared: Boolean(billingCleared),
          authorizedBy: req.user?.fullName || 'Senior Attending Physician'
        }
      });

      // 3. Update Admission status to DISCHARGED
      await tx.admission.update({
        where: { id: admissionId },
        data: {
          admissionStatus: 'DISCHARGED',
          actualDischargeDate: new Date()
        }
      });

      // 4. If bed was assigned, transition bed into CLEANING_REQUIRED (NOT AVAILABLE!)
      if (bed) {
        await tx.bed.update({
          where: { id: bed.id },
          data: {
            status: 'CLEANING_REQUIRED',
            currentPatientId: null,
            currentAdmissionId: null
          }
        });

        // Decrement room occupancy
        await tx.room.update({
          where: { id: bed.roomId },
          data: {
            currentOccupancy: { decrement: 1 }
          }
        });

        // 5. Automatically create Housekeeping Cleaning Task!
        await tx.cleaningTask.create({
          data: {
            hospitalId: bed.hospitalId,
            bedId: bed.id,
            status: 'PENDING',
            notes: `Discharge sanitation for Bed ${bed.bedNumber}. Patient discharged: ${finalDiagnosis}. Terminal cleaning required before next allocation.`
          }
        });
      }

      return { discharge, bedNumber: bed?.bedNumber };
    });

    res.json({
      success: true,
      message: `Discharge completed successfully for Admission ${admissionId}. Bed ${dischargeResult.bedNumber || ''} marked for sanitation.`,
      discharge: dischargeResult.discharge
    });
  } catch (error: any) {
    console.error('Discharge transaction failed:', error);
    res.status(400).json({ success: false, message: error.message || 'Discharge failed.' });
  }
});

// ==========================================
// 9. HOUSEKEEPING & CLEANING WORKFLOW (STRICT VERIFICATION GATE)
// ==========================================

router.get('/cleaning', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { hospitalId, status, bedId } = req.query;
    const where: any = {};

    if (hospitalId) where.hospitalId = hospitalId as string;
    if (bedId) where.bedId = bedId as string;
    if (status && status !== 'ALL') where.status = status as string;

    const tasks = await prisma.cleaningTask.findMany({
      where,
      include: {
        bed: {
          include: {
            ward: true,
            room: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, tasks });
  } catch (error) {
    console.error('Failed to get cleaning tasks:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch cleaning tasks.' });
  }
});

router.post('/cleaning', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { hospitalId, bedId, assignedStaffName, notes } = req.body;

    if (!bedId || !hospitalId) {
      res.status(400).json({ success: false, message: 'Bed ID and Hospital ID are required.' });
      return;
    }

    const task = await prisma.cleaningTask.create({
      data: {
        hospitalId,
        bedId,
        assignedStaffName,
        status: assignedStaffName ? 'ASSIGNED' : 'PENDING',
        notes
      }
    });

    // Mark bed as CLEANING_REQUIRED
    await prisma.bed.update({
      where: { id: bedId },
      data: { status: 'CLEANING_REQUIRED' }
    });

    res.status(201).json({ success: true, message: 'Cleaning task registered.', task });
  } catch (error) {
    console.error('Failed to create cleaning task:', error);
    res.status(500).json({ success: false, message: 'Failed to create cleaning task.' });
  }
});

// Advance cleaning task workflow: PENDING -> ASSIGNED -> IN_PROGRESS -> COMPLETED -> VERIFIED
// Bed transitions to AVAILABLE *ONLY* upon VERIFIED!
router.patch('/cleaning/:id/status', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, assignedStaffName, notes } = req.body;

    const validStatuses = ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ success: false, message: `Invalid status. Valid values: ${validStatuses.join(', ')}` });
      return;
    }

    const task = await prisma.cleaningTask.findUnique({
      where: { id },
      include: { bed: true }
    });

    if (!task) {
      res.status(404).json({ success: false, message: 'Cleaning task not found.' });
      return;
    }

    const updateData: any = {
      status,
      ...(assignedStaffName && { assignedStaffName }),
      ...(notes && { notes: `${task.notes || ''}\n[Update]: ${notes}`.trim() })
    };

    if (status === 'IN_PROGRESS' && !task.startedAt) {
      updateData.startedAt = new Date();
    }
    if (status === 'COMPLETED' && !task.completedAt) {
      updateData.completedAt = new Date();
    }

    // STRICT VERIFICATION PROTOCOL:
    if (status === 'VERIFIED') {
      updateData.verifiedAt = new Date();
      updateData.verifiedBy = req.user?.fullName || 'Housekeeping Supervisor';

      // Atomic transition: Update task and mark Bed as AVAILABLE!
      await prisma.$transaction([
        prisma.cleaningTask.update({
          where: { id },
          data: updateData
        }),
        prisma.bed.update({
          where: { id: task.bedId },
          data: {
            status: 'AVAILABLE',
            lastCleanedAt: new Date()
          }
        })
      ]);

      res.json({
        success: true,
        message: `Cleaning verified by ${updateData.verifiedBy}! Bed ${task.bed.bedNumber} is now officially certified AVAILABLE for patient intake.`,
        status: 'VERIFIED'
      });
      return;
    }

    // Normal non-verification update
    const updated = await prisma.cleaningTask.update({
      where: { id },
      data: updateData
    });

    res.json({ success: true, message: `Cleaning task updated to ${status}.`, task: updated });
  } catch (error) {
    console.error('Failed to update cleaning task:', error);
    res.status(500).json({ success: false, message: 'Failed to update cleaning task.' });
  }
});

// ==========================================
// 10. BED MAINTENANCE & FAULT REPORTING
// ==========================================

router.get('/maintenance', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { hospitalId, status } = req.query;
    const where: any = {};
    if (hospitalId) where.hospitalId = hospitalId as string;
    if (status && status !== 'ALL') where.status = status as string;

    const requests = await prisma.maintenanceRequest.findMany({
      where,
      include: {
        bed: {
          include: { ward: true, room: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, requests });
  } catch (error) {
    console.error('Failed to get maintenance requests:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch maintenance requests.' });
  }
});

router.post('/maintenance', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { hospitalId, bedId, issueDescription, priority, assignedTechnician } = req.body;

    if (!hospitalId || !bedId || !issueDescription) {
      res.status(400).json({ success: false, message: 'Hospital ID, Bed ID, and Issue Description are required.' });
      return;
    }

    const [request] = await prisma.$transaction([
      prisma.maintenanceRequest.create({
        data: {
          hospitalId,
          bedId,
          issueDescription,
          priority: priority || 'MEDIUM',
          status: 'REPORTED',
          reportedBy: req.user?.fullName || 'Floor Staff',
          assignedTechnician
        }
      }),
      // Set bed status to UNDER_MAINTENANCE
      prisma.bed.update({
        where: { id: bedId },
        data: { status: 'UNDER_MAINTENANCE' }
      })
    ]);

    res.status(201).json({ success: true, message: 'Maintenance reported. Bed marked UNDER_MAINTENANCE.', request });
  } catch (error) {
    console.error('Failed to report maintenance:', error);
    res.status(500).json({ success: false, message: 'Failed to report maintenance.' });
  }
});

router.patch('/maintenance/:id/status', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, resolutionNotes, assignedTechnician } = req.body;

    const request = await prisma.maintenanceRequest.findUnique({
      where: { id },
      include: { bed: true }
    });

    if (!request) {
      res.status(404).json({ success: false, message: 'Maintenance request not found.' });
      return;
    }

    if (status === 'COMPLETED') {
      // When maintenance completes, the bed must undergo CLEANING_REQUIRED before being allocated
      await prisma.$transaction([
        prisma.maintenanceRequest.update({
          where: { id },
          data: {
            status: 'COMPLETED',
            resolutionNotes,
            completedAt: new Date()
          }
        }),
        prisma.bed.update({
          where: { id: request.bedId },
          data: { status: 'CLEANING_REQUIRED' }
        }),
        prisma.cleaningTask.create({
          data: {
            hospitalId: request.hospitalId,
            bedId: request.bedId,
            status: 'PENDING',
            notes: `Post-maintenance sanitization: ${resolutionNotes || 'Repairs completed by biomedical tech.'}`
          }
        })
      ]);

      res.json({
        success: true,
        message: 'Maintenance completed. Bed moved to CLEANING_REQUIRED for safety sanitization.'
      });
      return;
    }

    const updated = await prisma.maintenanceRequest.update({
      where: { id },
      data: {
        status,
        ...(resolutionNotes && { resolutionNotes }),
        ...(assignedTechnician && { assignedTechnician })
      }
    });

    res.json({ success: true, message: 'Maintenance status updated.', request: updated });
  } catch (error) {
    console.error('Failed to update maintenance:', error);
    res.status(500).json({ success: false, message: 'Failed to update maintenance.' });
  }
});

// ==========================================
// 11. ICU & TELEMETRY DASHBOARD
// ==========================================

router.get('/icu-dashboard', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { hospitalId } = req.query;
    const filter = hospitalId ? { hospitalId: hospitalId as string } : {};

    const [icuBeds, equipmentList, nursingShift] = await Promise.all([
      prisma.bed.findMany({
        where: {
          ...filter,
          bedCategory: 'ICU'
        },
        include: {
          ward: true,
          room: true,
          equipment: true,
          admissions: {
            where: { admissionStatus: 'ADMITTED' },
            take: 1,
            include: {
              patient: { include: { user: { select: { fullName: true, phone: true } } } },
              doctor: { include: { user: { select: { fullName: true } } } }
            }
          }
        }
      }),
      prisma.medicalEquipment.findMany({
        where: {
          ...filter,
          ward: { wardType: 'ICU' }
        },
        include: { bed: true }
      }),
      prisma.nursingAssignment.findMany({
        where: {
          ward: { wardType: 'ICU' }
        },
        take: 5
      })
    ]);

    const icuStats = {
      totalIcuBeds: icuBeds.length,
      availableIcuBeds: icuBeds.filter(b => b.status === 'AVAILABLE').length,
      occupiedIcuBeds: icuBeds.filter(b => b.status === 'OCCUPIED').length,
      ventilatorsInUse: equipmentList.filter(e => e.equipmentType === 'VENTILATOR' && e.status === 'IN_USE').length,
      ventilatorsAvailable: equipmentList.filter(e => e.equipmentType === 'VENTILATOR' && e.status === 'AVAILABLE').length,
      activeAlarms: 0
    };

    res.json({
      success: true,
      icuStats,
      beds: icuBeds,
      equipment: equipmentList,
      nursingAssignments: nursingShift
    });
  } catch (error) {
    console.error('Failed to fetch ICU dashboard:', error);
    res.status(500).json({ success: false, message: 'Failed to load ICU dashboard.' });
  }
});

// ==========================================
// 12. RESERVATIONS & WAITING LIST
// ==========================================

router.get('/reservations', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { hospitalId, status } = req.query;
    const where: any = {};
    if (hospitalId) where.hospitalId = hospitalId as string;
    if (status) where.status = status as string;

    const reservations = await prisma.bedReservation.findMany({
      where,
      include: {
        patient: { include: { user: { select: { fullName: true, phone: true } } } },
        bed: { include: { ward: true, room: true } }
      },
      orderBy: { reservedUntil: 'asc' }
    });

    res.json({ success: true, reservations });
  } catch (error) {
    console.error('Failed to get reservations:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch bed reservations.' });
  }
});

router.post('/reservations', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { hospitalId, patientId, bedId, reservedUntil, notes } = req.body;

    if (!hospitalId || !patientId || !bedId || !reservedUntil) {
      res.status(400).json({ success: false, message: 'Hospital ID, Patient ID, Bed ID, and Expiry are required.' });
      return;
    }

    const [reservation] = await prisma.$transaction([
      prisma.bedReservation.create({
        data: {
          hospitalId,
          patientId,
          bedId,
          reservedUntil: new Date(reservedUntil),
          notes,
          reservedBy: req.user?.fullName || 'Hospital Coordinator'
        }
      }),
      prisma.bed.update({
        where: { id: bedId },
        data: { status: 'RESERVED' }
      })
    ]);

    res.status(201).json({ success: true, message: 'Bed reserved successfully.', reservation });
  } catch (error) {
    console.error('Failed to create reservation:', error);
    res.status(500).json({ success: false, message: 'Failed to create reservation.' });
  }
});

router.get('/waiting-list', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { hospitalId, status } = req.query;
    const where: any = {};
    if (hospitalId) where.hospitalId = hospitalId as string;
    if (status && status !== 'ALL') where.status = status as string;

    const list = await prisma.waitingList.findMany({
      where,
      include: {
        patient: { include: { user: { select: { fullName: true, phone: true } } } }
      },
      orderBy: [{ priority: 'asc' }, { waitingSince: 'asc' }]
    });

    res.json({ success: true, list });
  } catch (error) {
    console.error('Failed to get waitlist:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch waiting list.' });
  }
});

router.post('/waiting-list', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { hospitalId, patientId, requestedWardType, bedCategory, priority, isolationRequired, oxygenRequired, ventilatorRequired, notes } = req.body;

    if (!hospitalId || !patientId) {
      res.status(400).json({ success: false, message: 'Hospital ID and Patient ID are required.' });
      return;
    }

    const entry = await prisma.waitingList.create({
      data: {
        hospitalId,
        patientId,
        requestedWardType: requestedWardType || 'GENERAL',
        bedCategory: bedCategory || 'STANDARD',
        priority: priority || 'NORMAL',
        isolationRequired: Boolean(isolationRequired),
        oxygenRequired: Boolean(oxygenRequired),
        ventilatorRequired: Boolean(ventilatorRequired),
        status: 'WAITING',
        notes
      }
    });

    res.status(201).json({ success: true, message: 'Patient queued to waiting list.', entry });
  } catch (error) {
    console.error('Failed to add to waitlist:', error);
    res.status(500).json({ success: false, message: 'Failed to add to waiting list.' });
  }
});

// ==========================================
// 13. INPATIENT BILLING & INSURANCE
// ==========================================

router.get('/billing/:admissionId', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { admissionId } = req.params;
    const invoice = await prisma.inpatientInvoice.findUnique({
      where: { admissionId },
      include: {
        admission: {
          include: {
            patient: { include: { user: true } },
            bed: { include: { ward: true, room: true } }
          }
        }
      }
    });

    if (!invoice) {
      res.status(404).json({ success: false, message: 'Inpatient invoice not found.' });
      return;
    }

    res.json({ success: true, invoice });
  } catch (error) {
    console.error('Failed to get invoice:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch inpatient billing.' });
  }
});

router.post('/billing/:admissionId/payment', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { admissionId } = req.params;
    const { amount, paymentMethod, referenceNumber } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({ success: false, message: 'Valid payment amount is required.' });
      return;
    }

    const invoice = await prisma.inpatientInvoice.findUnique({ where: { admissionId } });
    if (!invoice) {
      res.status(404).json({ success: false, message: 'Invoice not found.' });
      return;
    }

    const newPaidAmount = invoice.paidAmount + Number(amount);
    const newBalance = Math.max(0, invoice.totalAmount - newPaidAmount - invoice.discountAmount - invoice.insuranceClaimAmount);
    const newStatus = newBalance === 0 ? 'PAID' : 'PARTIALLY_PAID';

    let history: any[] = [];
    if (invoice.paymentHistory) {
      try {
        history = JSON.parse(invoice.paymentHistory);
      } catch (e) {
        history = [];
      }
    }

    history.push({
      date: new Date().toISOString(),
      amount: Number(amount),
      method: paymentMethod || 'ONLINE',
      ref: referenceNumber || `PAY-${Date.now()}`
    });

    const updatedInvoice = await prisma.inpatientInvoice.update({
      where: { admissionId },
      data: {
        paidAmount: newPaidAmount,
        outstandingBalance: newBalance,
        status: newStatus,
        paymentHistory: JSON.stringify(history)
      }
    });

    res.json({ success: true, message: 'Payment recorded successfully.', invoice: updatedInvoice });
  } catch (error) {
    console.error('Failed to record payment:', error);
    res.status(500).json({ success: false, message: 'Failed to record payment.' });
  }
});

export default router;
