import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LabReportApprovalModal } from './LabReportApprovalModal';
import { UploadReportModal } from '../../components/laboratory/UploadReportModal';
import { DiagnosticBooking } from '../../types';
import { 
  FlaskConical, 
  ClipboardCheck, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  AlertCircle, 
  TrendingUp, 
  ShieldCheck, 
  User,
  Barcode,
  UploadCloud,
  FileCheck2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export const LabDashboard: React.FC = () => {
  const { diagnosticBookings } = useApp();

  const [approvalModalBooking, setApprovalModalBooking] = useState<DiagnosticBooking | null>(null);
  const [uploadModalBooking, setUploadModalBooking] = useState<DiagnosticBooking | null>(null);

  const totalBookings = diagnosticBookings.length;
  const inProcessing = diagnosticBookings.filter(b => b.status === 'Processing' || b.status === 'In Transit').length;
  const pendingCollection = diagnosticBookings.filter(b => b.status === 'Order Placed').length;
  const completed = diagnosticBookings.filter(b => b.status === 'Verified & Approved' || b.status === 'Delivered to Patient').length;

  const weeklyTestVolume = [
    { day: 'Mon', count: 48 },
    { day: 'Tue', count: 56 },
    { day: 'Wed', count: 62 },
    { day: 'Thu', count: 51 },
    { day: 'Fri', count: 68 },
    { day: 'Sat', count: 75 },
    { day: 'Sun', count: 32 },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-700 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-elevated flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
              NABL Bio-Path Laboratory Console
            </span>
            <span className="text-xs text-amber-200">ISO 15189:2022 Certified</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Bharat Diagnostic Hub</h1>
          <p className="text-xs text-slate-300">
            Automated barcoding, real-time phlebotomy tracking, and dual pathologist digital approval
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/laboratory/samples"
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5"
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>Sample Tracking Queue ({inProcessing})</span>
          </Link>
        </div>
      </div>

      {/* Disclaimed notice */}
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <span>
          <strong>Clinical Prototype:</strong> All patient diagnostic records, test results, and blood sample stages are connected to secure object storage and SQLite database.
        </span>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Test Orders"
          value={totalBookings}
          subtitle="Assigned this week"
          icon={<FlaskConical className="w-5 h-5 text-amber-600" />}
          iconBgColor="bg-amber-50"
        />
        <StatCard
          title="Active in Processing"
          value={inProcessing}
          subtitle="Analytical phase"
          icon={<Clock className="w-5 h-5 text-teal-600" />}
          iconBgColor="bg-teal-50"
        />
        <StatCard
          title="Pending Phlebotomy"
          value={pendingCollection}
          subtitle="Awaiting sample collection"
          icon={<Barcode className="w-5 h-5 text-indigo-600" />}
          iconBgColor="bg-indigo-50"
        />
        <StatCard
          title="Delivered Reports"
          value={completed}
          subtitle="Digitally published to ABHA"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          iconBgColor="bg-emerald-50"
        />
      </div>

      {/* Main Grid: Live Orders + Volume Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Test Orders Table */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Active Diagnostic Requisitions</h3>
            <Link to="/laboratory/samples" className="text-xs text-amber-600 font-bold hover:underline">
              View All Samples →
            </Link>
          </div>

          <div className="space-y-3">
            {diagnosticBookings.map(b => (
              <div
                key={b.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-600">{b.bookingRef}</span>
                    <StatusBadge status={b.status} />
                  </div>
                  <h4 className="font-bold text-slate-900 mt-1">{b.testName}</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Patient: <strong>{b.patientName}</strong> • {b.collectionType} ({b.scheduledDate})
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {/* CRITICAL FEATURE: Upload Report Modal Action */}
                  <button
                    type="button"
                    onClick={() => setUploadModalBooking(b)}
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-2xs transition-colors flex items-center gap-1"
                    title="Upload PDF or Scanned Pathology Report"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload Report</span>
                  </button>

                  {b.status === 'Processing' && (
                    <button
                      onClick={() => setApprovalModalBooking(b)}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-2xs transition-colors flex items-center gap-1"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Review</span>
                    </button>
                  )}

                  {(b.status === 'Verified & Approved' || b.status === 'Delivered to Patient') && (
                    <span className="text-emerald-700 font-bold text-[11px] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                      <FileCheck2 className="w-3 h-3 text-emerald-600" />
                      <span>Delivered</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Throughput Chart */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-card space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-teal-600" />
            Weekly Diagnostic Test Throughput
          </h3>
          <p className="text-xs text-slate-500">Number of biological samples analyzed</p>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTestVolume}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Bar dataKey="count" fill="#d97706" radius={[6, 6, 0, 0]} name="Samples Processed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Upload Diagnostic Report Modal */}
      <UploadReportModal
        isOpen={!!uploadModalBooking}
        onClose={() => setUploadModalBooking(null)}
        booking={uploadModalBooking}
      />

      {/* Pathology Review Modal */}
      <LabReportApprovalModal
        isOpen={!!approvalModalBooking}
        onClose={() => setApprovalModalBooking(null)}
        booking={approvalModalBooking}
      />
    </div>
  );
};
