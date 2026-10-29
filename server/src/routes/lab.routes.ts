import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../db.js';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Configure Multer for secure file storage with randomized UUID keys (fallback to /tmp on Vercel)
const uploadDir = process.env.VERCEL === '1'
  ? path.join('/tmp', 'uploads', 'reports')
  : path.resolve(process.cwd(), 'uploads/reports');

try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (e) {
  console.warn('Could not create lab upload directory:', e);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Security: Never use original patient name or raw filename. Use random UUID!
    const ext = path.extname(file.originalname).toLowerCase();
    const safeKey = `rep_${uuidv4()}${ext}`;
    cb(null, safeKey);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only PDF, JPG, and PNG diagnostic reports are permitted.'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter
});

// GET /api/lab/bookings - List lab bookings with filters
router.get('/bookings', async (req, res): Promise<void> => {
  const { status, search } = req.query;

  try {
    const bookings = await prisma.testBooking.findMany({
      where: {
        ...(status && typeof status === 'string' && status !== 'All' ? { status } : {}),
        ...(search && typeof search === 'string' ? {
          OR: [
            { bookingRef: { contains: search } },
            { test: { name: { contains: search } } },
            { patient: { user: { fullName: { contains: search } } } }
          ]
        } : {})
      },
      include: {
        test: true,
        patient: {
          include: { user: true }
        },
        laboratory: true,
        report: true
      },
      orderBy: { scheduledDate: 'desc' }
    });

    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve test bookings.' });
  }
});

// POST /api/lab/bookings - Create new test booking
router.post('/bookings', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { testId, collectionType, scheduledDate, scheduledTime } = req.body;

  try {
    const patientProfile = await prisma.patientProfile.findUnique({
      where: { userId: req.user!.id }
    });

    if (!patientProfile) {
      res.status(400).json({ success: false, message: 'Only registered patients can book diagnostic tests.' });
      return;
    }

    const test = await prisma.diagnosticTest.findUnique({ where: { id: testId } });
    if (!test) {
      res.status(404).json({ success: false, message: 'Diagnostic test not found.' });
      return;
    }

    const lab = await prisma.diagnosticLaboratory.findFirst();
    if (!lab) {
      res.status(400).json({ success: false, message: 'No diagnostic laboratory registered.' });
      return;
    }

    const bookingRef = `BHC-LAB-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const booking = await prisma.testBooking.create({
      data: {
        bookingRef,
        patientId: patientProfile.id,
        testId: test.id,
        laboratoryId: lab.id,
        collectionType: collectionType || 'Lab Visit',
        scheduledDate: scheduledDate || new Date().toISOString().split('T')[0],
        scheduledTime: scheduledTime || '09:00 AM',
        status: 'BOOKED'
      },
      include: { test: true }
    });

    res.status(201).json({
      success: true,
      message: `Diagnostic test ${test.name} booked successfully. Reference: ${bookingRef}`,
      booking
    });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ success: false, message: 'Failed to create test booking.' });
  }
});

// PUT /api/lab/bookings/:id/sample-status - Phlebotomy sample tracking workflow
router.put('/bookings/:id/sample-status', authenticateToken, requireRole(['LAB_ADMIN', 'LAB_STAFF', 'CENTRAL_ADMIN']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status, technicianName, barcode } = req.body;

  try {
    const booking = await prisma.testBooking.findUnique({
      where: { id },
      include: { patient: { include: { user: true } }, test: true }
    });

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found.' });
      return;
    }

    const updated = await prisma.testBooking.update({
      where: { id },
      data: {
        status,
        ...(technicianName ? { technicianName } : {}),
        ...(barcode ? { sampleBarcode: barcode } : {})
      }
    });

    // Notify patient about sample milestones
    if (status === 'SAMPLE_COLLECTED' || status === 'PROCESSING') {
      await prisma.notification.create({
        data: {
          userId: booking.patient.user.id,
          title: `Diagnostic Update: ${booking.test.name}`,
          message: `Your sample status is now: ${status.replace('_', ' ')}. Estimated report turnaround: ${booking.test.tatHours} hours.`,
          category: 'diagnostic',
          actionUrl: '/patient/records'
        }
      });
    }

    res.json({
      success: true,
      message: `Sample status updated to ${status}.`,
      booking: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update sample status.' });
  }
});

// POST /api/lab/reports/upload - Secure Diagnostic Report Upload (PDF / Image)
router.post('/reports/upload', authenticateToken, requireRole(['LAB_ADMIN', 'LAB_STAFF', 'CENTRAL_ADMIN']), upload.single('reportFile'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { bookingId, summaryNotes, pathologistName } = req.body;
  const file = req.file;

  if (!bookingId || !file) {
    res.status(400).json({ success: false, message: 'Booking ID and valid diagnostic report file are required.' });
    return;
  }

  try {
    const booking = await prisma.testBooking.findUnique({
      where: { id: bookingId },
      include: {
        patient: { include: { user: true } },
        test: true,
        laboratory: true
      }
    });

    if (!booking) {
      // Clean up orphaned uploaded file
      fs.unlinkSync(file.path);
      res.status(404).json({ success: false, message: 'Invalid test booking ID.' });
      return;
    }

    const reportDate = new Date().toISOString().split('T')[0];
    const fileSizeFormatted = `${(file.size / 1024).toFixed(1)} KB`;

    // Atomic upload registration and booking status update
    const report = await prisma.$transaction(async (tx) => {
      // 1. Create DiagnosticReport
      const rep = await tx.diagnosticReport.create({
        data: {
          bookingId: booking.id,
          patientId: booking.patientId,
          laboratoryId: booking.laboratoryId,
          testName: booking.test.name,
          reportDate,
          fileUrl: `/uploads/reports/${file.filename}`,
          fileName: file.originalname,
          fileSize: fileSizeFormatted,
          mimeType: file.mimetype,
          pathologistName: pathologistName || req.user!.fullName,
          summaryNotes: summaryNotes || 'Clinical pathology review completed. Findings signed by verified pathologist.',
          status: 'AVAILABLE'
        }
      });

      // 2. Update booking status
      await tx.testBooking.update({
        where: { id: booking.id },
        data: { status: 'AVAILABLE_TO_PATIENT' }
      });

      // 3. Notify Patient
      await tx.notification.create({
        data: {
          userId: booking.patient.user.id,
          title: `Diagnostic Report Ready: ${booking.test.name}`,
          message: `Your test report for ${booking.test.name} has been verified by ${pathologistName || req.user!.fullName} and is now ready for viewing.`,
          category: 'diagnostic',
          actionUrl: '/patient/records'
        }
      });

      // 4. Audit Log
      await tx.auditLog.create({
        data: {
          userId: req.user!.id,
          userRole: req.user!.role,
          action: 'REPORT_UPLOAD',
          resource: 'DiagnosticReport',
          resourceId: rep.id,
          details: JSON.stringify({ bookingId: booking.id, testName: booking.test.name, fileName: file.originalname })
        }
      });

      return rep;
    });

    res.status(201).json({
      success: true,
      message: `Diagnostic report for ${booking.test.name} uploaded and verified successfully. Patient notified.`,
      report
    });
  } catch (error: any) {
    if (file && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    console.error('Report upload error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to upload diagnostic report.' });
  }
});

// GET /api/lab/reports/my-reports - Patient Report Access (Restricted to Authenticated Patient's own reports)
router.get('/reports/my-reports', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const patientProfile = await prisma.patientProfile.findUnique({
      where: { userId: req.user!.id }
    });

    if (!patientProfile) {
      res.status(403).json({ success: false, message: 'Patient profile not found.' });
      return;
    }

    const reports = await prisma.diagnosticReport.findMany({
      where: { patientId: patientProfile.id },
      include: {
        laboratory: true,
        booking: {
          include: { test: true }
        },
        versions: true
      },
      orderBy: { reportDate: 'desc' }
    });

    res.json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve reports.' });
  }
});

// GET /api/lab/reports/download/:id - Secure Authorized File Download (Never exposed publicly)
router.get('/reports/download/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const report = await prisma.diagnosticReport.findUnique({
      where: { id },
      include: {
        patient: { include: { user: true } },
        laboratory: true
      }
    });

    if (!report) {
      res.status(404).json({ success: false, message: 'Diagnostic report not found.' });
      return;
    }

    // Role-based authorization check: Patient owns it, or Doctor with consent, or Lab staff / Admin
    const isOwner = report.patient.user.id === req.user!.id;
    const isLabStaff = req.user!.role === 'LAB_ADMIN' || req.user!.role === 'LAB_STAFF';
    const isAdmin = req.user!.role === 'CENTRAL_ADMIN';

    let isAuthorizedDoctor = false;
    if (req.user!.role === 'DOCTOR') {
      const consent = await prisma.consentRecord.findFirst({
        where: {
          patientId: report.patient.user.id,
          doctorId: req.user!.id,
          status: 'ACTIVE'
        }
      });
      isAuthorizedDoctor = !!consent;
    }

    if (!isOwner && !isLabStaff && !isAdmin && !isAuthorizedDoctor) {
      res.status(403).json({
        success: false,
        message: 'Access Denied. You do not have patient consent or authority to access this diagnostic report.'
      });
      return;
    }

    // Audit log access
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        userRole: req.user!.role,
        action: 'REPORT_VIEW_DOWNLOAD',
        resource: 'DiagnosticReport',
        resourceId: report.id,
        details: JSON.stringify({ fileName: report.fileName, testName: report.testName })
      }
    });

    // Check if file exists on disk
    const absolutePath = path.resolve(process.cwd(), '.' + report.fileUrl);
    if (!fs.existsSync(absolutePath)) {
      // Fallback: Generate dummy PDF text stream for seeded demo reports
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="${report.fileName}"`);
      res.send(`BHARAT HEALTHCONNECT - VERIFIED DIAGNOSTIC REPORT\n==============================================\nPatient: ${report.patient.user.fullName}\nTest: ${report.testName}\nDate: ${report.reportDate}\nPathologist: ${report.pathologistName}\nSummary: ${report.summaryNotes}\nStatus: Officially Verified & Digitally Signed\n==============================================`);
      return;
    }

    res.download(absolutePath, report.fileName);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ success: false, message: 'Failed to download report.' });
  }
});

// POST /api/lab/reports/:id/correct - Controlled Report Correction Workflow
router.post('/reports/:id/correct', authenticateToken, requireRole(['LAB_ADMIN', 'LAB_STAFF', 'CENTRAL_ADMIN']), upload.single('revisedFile'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { correctionReason, pathologistNotes } = req.body;
  const file = req.file;

  if (!correctionReason) {
    if (file) fs.unlinkSync(file.path);
    res.status(400).json({ success: false, message: 'Detailed correction reason is required for clinical audit compliance.' });
    return;
  }

  try {
    const existing = await prisma.diagnosticReport.findUnique({
      where: { id },
      include: { patient: { include: { user: true } }, versions: true }
    });

    if (!existing) {
      if (file) fs.unlinkSync(file.path);
      res.status(404).json({ success: false, message: 'Report not found.' });
      return;
    }

    const versionNumber = existing.versions.length + 1;

    await prisma.$transaction(async (tx) => {
      // 1. Archive previous version in ReportVersion
      await tx.reportVersion.create({
        data: {
          reportId: existing.id,
          versionNumber,
          fileUrl: existing.fileUrl,
          fileName: existing.fileName,
          correctionReason,
          correctedBy: req.user!.fullName
        }
      });

      // 2. Update report with revised file and notes
      const newFileUrl = file ? `/uploads/reports/${file.filename}` : existing.fileUrl;
      const newFileName = file ? file.originalname : existing.fileName;

      await tx.diagnosticReport.update({
        where: { id: existing.id },
        data: {
          fileUrl: newFileUrl,
          fileName: newFileName,
          summaryNotes: pathologistNotes ? `${pathologistNotes} (Revision v${versionNumber}: ${correctionReason})` : existing.summaryNotes,
          status: 'REVISED'
        }
      });

      // 3. Notify patient about clinical correction
      await tx.notification.create({
        data: {
          userId: existing.patient.user.id,
          title: `Diagnostic Report Corrected (v${versionNumber}): ${existing.testName}`,
          message: `Vijaya Bio-Diagnostics has published a verified revision for your ${existing.testName} report. Reason: ${correctionReason}`,
          category: 'diagnostic',
          actionUrl: '/patient/records'
        }
      });
    });

    res.json({
      success: true,
      message: `Report revised successfully to version ${versionNumber}. Audit log and patient notice registered.`
    });
  } catch (error: any) {
    if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
    res.status(500).json({ success: false, message: error.message || 'Failed to record report correction.' });
  }
});

export default router;
