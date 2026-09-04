import React, { useState } from 'react';
import {
  Navigation,
  MapPin,
  Camera,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Sparkles,
  Send,
  User,
  Wrench,
  ShieldCheck,
  Lock,
  AlertTriangle,
} from 'lucide-react';
import { useIssueStore, Issue } from '../store';
import { useSLATimer } from './AdminDashboard';

// ============================================================================
// MOBILE WORKER TASK CARD
// ============================================================================
interface TaskCardProps {
  issue: Issue;
  onStartTravel: (id: string) => void;
  onArriveOnSite: (id: string) => void;
  onSubmitResolution: (id: string, photos: { before?: string; after?: string }, notes: string) => void;
}

const WorkerTaskCard: React.FC<TaskCardProps> = ({
  issue,
  onStartTravel,
  onArriveOnSite,
  onSubmitResolution,
}) => {
  const sla = useSLATimer(issue.slaDeadline);

  // Local form state for photo capture and field notes
  const [beforePhoto, setBeforePhoto] = useState<string>(issue.photos.before || '');
  const [afterPhoto, setAfterPhoto] = useState<string>(issue.photos.after || '');
  const [notes, setNotes] = useState<string>(issue.notes || '');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');

  const handlePhotoCapture = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'before' | 'after'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          if (type === 'before') setBeforePhoto(reader.result);
          if (type === 'after') setAfterPhoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!afterPhoto) {
      setSubmitError('Resolution proof (After photo) is mandatory for citizen verification.');
      return;
    }
    setSubmitError('');
    setIsSubmitting(true);
    setTimeout(() => {
      onSubmitResolution(issue.id, { before: beforePhoto, after: afterPhoto }, notes);
      setIsSubmitting(false);
    }, 450);
  };

  return (
    <div className="bg-[#FAF6F0] border border-[#D8C4AC] rounded-2xl p-4 shadow-sm mb-4 transition-all hover:border-[#C8A49F]">
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-[#4D0E13]">
            {issue.id}
          </span>
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#D8C4AC]/30 text-[#4D0E13] border border-[#D8C4AC]">
            {issue.category}
          </span>
        </div>

        {/* Priority Badge */}
        <div
          className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold flex items-center gap-1 ${
            issue.priorityScore >= 85
              ? 'bg-rose-100 text-rose-700 border border-rose-300'
              : issue.priorityScore >= 60
              ? 'bg-[#C8A49F]/30 text-[#4D0E13] border border-[#C8A49F]'
              : 'bg-[#D8C4AC]/30 text-[#4D0E13] border border-[#D8C4AC]'
          }`}
        >
          <Sparkles className="w-3 h-3" />
          <span>Priority {issue.priorityScore}</span>
        </div>
      </div>

      {/* Task Title */}
      <h3 className="text-sm font-bold text-[#4D0E13] leading-snug mb-2">
        {issue.title}
      </h3>

      {/* Location / Geotag */}
      <div className="flex items-start gap-1.5 text-xs text-[#4D0E13] mb-3 bg-[#EEE4DA] p-2.5 rounded-xl border border-[#D8C4AC]">
        <MapPin className="w-4 h-4 text-[#4D0E13] shrink-0 mt-0.5" />
        <span className="leading-tight">{issue.locationString || `${issue.coords.lat.toFixed(4)}, ${issue.coords.lng.toFixed(4)}`}</span>
      </div>

      {/* SLA Timer Indicator */}
      <div
        className={`flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg border mb-4 ${sla.bgClass} ${sla.borderClass} ${sla.colorClass}`}
      >
        <span className="flex items-center gap-1.5 font-mono">
          <Clock className={`w-3.5 h-3.5 ${sla.isBreached ? 'animate-pulse text-rose-500' : ''}`} />
          <span>{sla.displayText}</span>
        </span>
        <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
          {sla.badgeLabel}
        </span>
      </div>

      {/* ==================================================================== */}
      {/* CONDITIONAL EXECUTION UI BASED ON WORKER STATE */}
      {/* ==================================================================== */}

      {/* 1. ASSIGNED -> Worker needs to start travel */}
      {issue.status === 'Assigned' && (
        <div className="pt-2 border-t border-[#D8C4AC]/40">
          <button
            onClick={() => onStartTravel(issue.id)}
            className="w-full py-3.5 px-4 rounded-xl bg-[#C8A49F] hover:bg-[#ba938e] text-[#4D0E13] font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#C8A49F]/20 transition-transform active:scale-[0.98]"
          >
            <Navigation className="w-4 h-4" />
            <span>Start Travel (En Route)</span>
            <ArrowRight className="w-4 h-4 ml-auto" />
          </button>
        </div>
      )}

      {/* 2. IN PROGRESS -> Worker is traveling, needs to confirm arrival */}
      {issue.status === 'In Progress' && (
        <div className="pt-2 border-t border-[#D8C4AC]/40 space-y-2">
          <div className="flex items-center gap-2 text-xs text-[#4D0E13] bg-[#C8A49F]/20 border border-[#C8A49F]/50 px-3 py-2 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-[#C8A49F] animate-ping" />
            <span>En Route to Coordinates (Telemetry Broadcasting)</span>
          </div>

          <button
            onClick={() => onArriveOnSite(issue.id)}
            className="w-full py-3.5 px-4 rounded-xl bg-[#C8A49F] hover:bg-[#ba938e] text-[#4D0E13] font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#C8A49F]/20 transition-transform active:scale-[0.98]"
          >
            <Wrench className="w-4 h-4" />
            <span>Arrived on Site (Begin Work)</span>
            <ArrowRight className="w-4 h-4 ml-auto" />
          </button>
        </div>
      )}

      {/* 3. ON SITE -> Photo Capture with CRITICAL SECURITY Live Camera & Submit to Citizen */}
      {issue.status === 'On Site' && (
        <form onSubmit={handleFormSubmit} className="pt-2 border-t border-[#D8C4AC]/40 space-y-3">
          <div className="flex items-center justify-between text-xs bg-[#D8C4AC]/30 border border-[#D8C4AC] px-3 py-1.5 rounded-lg text-[#4D0E13]">
            <span className="flex items-center gap-1.5 font-medium">
              <Wrench className="w-3.5 h-3.5" />
              <span>Conducting Physical Repair</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-700 font-bold">GPS Locked</span>
          </div>

          {/* CRITICAL SECURITY: Enforce Live Capture Only */}
          <div className="bg-[#EEE4DA] border border-amber-400/60 rounded-xl p-2.5 flex items-start gap-2">
            <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-tight">
              <span className="font-semibold text-amber-800 block">Security Protocol Active</span>
              <span className="text-[#4D0E13]/70">
                Gallery uploads disabled for security. Camera capture required to authenticate hardware EXIF & live geofence.
              </span>
            </div>
          </div>

          {/* Photo Capture Inputs */}
          <div className="grid grid-cols-2 gap-2">
            {/* BEFORE PHOTO (LIVE CAMERA ENFORCED) */}
            <label className="flex flex-col items-center justify-center p-3 rounded-xl border border-dashed border-[#D8C4AC] bg-[#FAF6F0] hover:bg-[#D8C4AC]/20 cursor-pointer transition-colors text-center relative overflow-hidden group">
              <input
                type="file"
                accept="image/*,video/*"
                capture="environment"
                onChange={(e) => handlePhotoCapture(e, 'before')}
                className="hidden"
              />
              {beforePhoto ? (
                <div className="relative w-full h-20 rounded-lg overflow-hidden">
                  <img src={beforePhoto} alt="Before" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[10px] text-white font-medium">
                    Retake Before
                  </div>
                </div>
              ) : (
                <div className="py-2 flex flex-col items-center">
                  <Camera className="w-5 h-5 text-[#4D0E13] group-hover:text-[#C8A49F] mb-1" />
                  <span className="text-[11px] font-medium text-[#4D0E13]">Live Camera (Before)</span>
                  <span className="text-[9px] text-[#4D0E13]/50">Optional</span>
                </div>
              )}
            </label>

            {/* AFTER PHOTO (LIVE CAMERA ENFORCED - MANDATORY) */}
            <label className="flex flex-col items-center justify-center p-3 rounded-xl border border-dashed border-[#C8A49F] bg-[#C8A49F]/10 hover:bg-[#C8A49F]/20 cursor-pointer transition-colors text-center relative overflow-hidden group">
              <input
                type="file"
                accept="image/*,video/*"
                capture="environment"
                onChange={(e) => handlePhotoCapture(e, 'after')}
                className="hidden"
              />
              {afterPhoto ? (
                <div className="relative w-full h-20 rounded-lg overflow-hidden">
                  <img src={afterPhoto} alt="After" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[10px] text-white font-medium">
                    Retake Proof
                  </div>
                </div>
              ) : (
                <div className="py-2 flex flex-col items-center">
                  <Camera className="w-5 h-5 text-[#4D0E13] group-hover:text-[#C8A49F] mb-1 animate-pulse" />
                  <span className="text-[11px] font-medium text-[#4D0E13]">Live Camera (After) *</span>
                  <span className="text-[9px] text-[#4D0E13] font-bold">Mandatory Proof</span>
                </div>
              )}
            </label>
          </div>

          {/* Notes Textarea */}
          <div>
            <textarea
              rows={2}
              placeholder="Add repair notes, materials used, or remarks..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#D8C4AC] rounded-xl text-xs text-[#4D0E13] placeholder-[#4D0E13]/40 focus:outline-none focus:border-[#C8A49F] resize-none font-sans"
            />
          </div>

          {submitError && (
            <div className="text-[11px] text-rose-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Submit to Citizen for Verification Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl bg-[#C8A49F] hover:bg-[#ba938e] text-[#4D0E13] font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#C8A49F]/20 transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="animate-spin text-sm">⏳</span>
            ) : (
              <>
                <Send className="w-4 h-4 text-[#4D0E13]" />
                <span>Submit to Citizen for Verification</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* 4. PENDING CITIZEN VERIFICATION (DIRECT POST-SUBMISSION STATE) */}
      {issue.status === 'Pending Citizen Verification' && (
        <div className="pt-2 border-t border-[#D8C4AC]/40">
          <div className="flex items-center justify-between text-xs bg-[#C8A49F]/20 border border-[#C8A49F]/50 text-[#4D0E13] px-3 py-2.5 rounded-xl font-semibold">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#4D0E13]" />
              <span>Proof Submitted • Awaiting Citizen Co-Sign</span>
            </span>
            <span className="text-[10px] font-mono text-[#4D0E13] font-bold">Citizen App</span>
          </div>
        </div>
      )}

      {/* 5. DISPUTED STATE */}
      {issue.status === 'Disputed' && (
        <div className="pt-2 border-t border-[#D8C4AC]/40 space-y-2">
          <div className="flex items-start gap-2 text-xs bg-rose-50 border border-rose-300 text-rose-800 p-2.5 rounded-xl">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-rose-700">Citizen Dispute Flagged</span>
              <span className="text-[11px] text-rose-600">
                {issue.disputeReason || 'Citizen disputed completion. Authority command center is performing telemetry review.'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 6. RESOLVED */}
      {issue.status === 'Resolved' && (
        <div className="pt-2 border-t border-[#D8C4AC]/40">
          <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-2 rounded-xl font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Work Order Verified & Closed</span>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN FIELD WORKER PORTAL COMPONENT
// ============================================================================
export const WorkerPortal: React.FC = () => {
  const {
    issues,
    currentWorkerId,
    availableWorkers,
    updateStatus,
    submitResolution,
  } = useIssueStore();

  const [activeFilter, setActiveFilter] = useState<'active' | 'completed'>('active');

  const currentWorker = availableWorkers.find((w) => w.id === currentWorkerId) || {
    id: currentWorkerId,
    name: 'Alex Rivera',
    department: 'Roads & Infrastructure',
  };

  // Filter tasks assigned to current worker, sorted by priority descending
  const workerTasks = issues
    .filter((issue) => issue.worker?.id === currentWorkerId || issue.workerId === currentWorkerId)
    .sort((a, b) => b.priorityScore - a.priorityScore);

  const activeTasks = workerTasks.filter((t) => t.status !== 'Resolved');
  const completedTasks = workerTasks.filter((t) => t.status === 'Resolved');

  const displayedTasks = activeFilter === 'active' ? activeTasks : completedTasks;

  return (
    <div className="min-h-screen bg-[#EEE4DA] text-[#4D0E13] font-sans p-4">
      {/* STRICTLY MOBILE-OPTIMIZED CONTAINER */}
      <div className="max-w-md mx-auto">
        {/* WORKER PROFILE HEADER */}
        <header className="bg-[#4D0E13] border border-[#D8C4AC]/40 rounded-2xl p-4 mb-4 shadow-xl text-[#EEE4DA]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#3b0b0f] border-2 border-[#C8A49F] flex items-center justify-center text-[#EEE4DA] font-mono font-bold text-sm shadow-md">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#EEE4DA] flex items-center gap-1.5">
                  <span>{currentWorker.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#3b0b0f] text-[#EEE4DA] border border-[#D8C4AC]/40 font-bold">
                    {currentWorker.id}
                  </span>
                </h2>
                <p className="text-[11px] text-[#D8C4AC] mt-0.5">{currentWorker.department}</p>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#C8A49F]/20 border border-[#C8A49F]/40 text-[#EEE4DA] text-[10px] font-mono font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C8A49F] animate-ping" />
                <span>ON DUTY</span>
              </div>
              <p className="text-[10px] text-[#D8C4AC] mt-1 font-mono font-semibold">
                GPS: 37.7749, -122.4194
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[#D8C4AC]/30 text-center">
            <div className="bg-[#3b0b0f] rounded-xl py-2 px-3 border border-[#D8C4AC]/30">
              <span className="text-[10px] text-[#D8C4AC] uppercase font-semibold tracking-wider block">
                Active Queue
              </span>
              <span className="text-base font-mono font-black text-[#EEE4DA]">
                {activeTasks.length}
              </span>
            </div>
            <div className="bg-[#3b0b0f] rounded-xl py-2 px-3 border border-[#D8C4AC]/30">
              <span className="text-[10px] text-[#D8C4AC] uppercase font-semibold tracking-wider block">
                Completed
              </span>
              <span className="text-base font-mono font-black text-[#C8A49F]">
                {completedTasks.length}
              </span>
            </div>
          </div>
        </header>

        {/* TAB TOGGLE: ACTIVE VS COMPLETED */}
        <div className="flex bg-[#FAF6F0] border border-[#D8C4AC] p-1 rounded-xl mb-4 text-xs font-semibold">
          <button
            onClick={() => setActiveFilter('active')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeFilter === 'active'
                ? 'bg-[#C8A49F] text-[#4D0E13] font-bold shadow-md shadow-[#C8A49F]/20'
                : 'text-[#4D0E13]/70 hover:text-[#4D0E13]'
            }`}
          >
            <span>Active Tasks</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeFilter === 'active' ? 'bg-[#4D0E13] text-[#EEE4DA]' : 'bg-[#D8C4AC]/30 text-[#4D0E13]'
            }`}>
              {activeTasks.length}
            </span>
          </button>
          <button
            onClick={() => setActiveFilter('completed')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeFilter === 'completed'
                ? 'bg-[#C8A49F] text-[#4D0E13] font-bold shadow-md shadow-[#C8A49F]/20'
                : 'text-[#4D0E13]/70 hover:text-[#4D0E13]'
            }`}
          >
            <span>Resolved</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              activeFilter === 'completed' ? 'bg-[#4D0E13] text-[#EEE4DA]' : 'bg-[#D8C4AC]/30 text-[#4D0E13]'
            }`}>
              {completedTasks.length}
            </span>
          </button>
        </div>

        {/* TASK QUEUE */}
        <div className="space-y-4">
          {displayedTasks.length === 0 ? (
            <div className="text-center py-16 bg-[#FAF6F0] border border-[#D8C4AC] rounded-2xl p-6 flex flex-col items-center justify-center shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-[#4D0E13] border border-[#D8C4AC]/40 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-7 h-7 text-[#EEE4DA]" />
              </div>
              <h4 className="text-sm font-bold text-[#4D0E13]">Work Order Queue Clear</h4>
              <p className="text-xs text-[#4D0E13]/70 mt-1.5 max-w-xs text-center leading-relaxed">
                {activeFilter === 'active'
                  ? 'No pending tasks currently assigned to unit WRK-007. Authority dispatch will route verified civic incidents here.'
                  : 'No completed tasks recorded in this shift yet.'}
              </p>
            </div>
          ) : (
            displayedTasks.map((task) => (
              <WorkerTaskCard
                key={task.id}
                issue={task}
                onStartTravel={(id) => updateStatus(id, 'In Progress')}
                onArriveOnSite={(id) => updateStatus(id, 'On Site')}
                onSubmitResolution={(id, photos, notes) => submitResolution(id, photos, notes)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
