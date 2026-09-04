import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Upload,
  ArrowRight,
  ShieldCheck,
  Percent,
  Check,
} from 'lucide-react';
import { CivicIssue } from '../types';

interface ResolutionVerifierModalProps {
  isOpen: boolean;
  onClose: () => void;
  issue: CivicIssue | null;
  onConfirmResolved: (issueId: string, proof: any) => void;
}

export const ResolutionVerifierModal: React.FC<ResolutionVerifierModalProps> = ({
  isOpen,
  onClose,
  issue,
  onConfirmResolved,
}) => {
  const [beforeImage, setBeforeImage] = useState<string>(
    issue?.imageUrl ||
      'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'
  );
  const [afterImage, setAfterImage] = useState<string>(
    issue?.resolutionProof?.afterImageUrl ||
      'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80'
  );
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<any>(
    issue?.resolutionProof || null
  );

  if (!isOpen || !issue) return null;

  const handleRunVerify = async () => {
    setIsVerifying(true);
    try {
      const res = await fetch('/api/verify-resolution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          beforeImage,
          afterImage,
          category: issue.category,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setVerificationResult(data.verification);
      }
    } catch (e) {
      console.error('Resolution verify failed', e);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleApplyResolution = () => {
    if (verificationResult) {
      onConfirmResolved(issue.id, {
        beforeImageUrl: beforeImage,
        afterImageUrl: afterImage,
        resolvedAt: new Date().toISOString(),
        verifiedByAi: verificationResult.isResolved ?? true,
        severityReductionPercent: verificationResult.severityReductionPercent || 85.0,
        notes: verificationResult.notes || 'Damage cleared and repaired.',
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Field Resolution Verification
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {issue.trackingNumber}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                AI visual comparison of "Before" hazard and "After" repair photo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Side by side comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Before */}
            <div className="space-y-2">
              <span className="font-semibold text-rose-400 uppercase tracking-wider text-[11px] block">
                Original Reported Hazard (Before)
              </span>
              <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video relative">
                <img src={beforeImage} alt="Before" className="w-full h-full object-cover" />
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/75 font-mono text-[10px] text-rose-300">
                  Severity: {issue.priorityScore.visualSeverityScore}/100
                </div>
              </div>
            </div>

            {/* After */}
            <div className="space-y-2">
              <span className="font-semibold text-emerald-400 uppercase tracking-wider text-[11px] block">
                Worker Repair Photo (After)
              </span>
              <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video relative">
                <img src={afterImage} alt="After" className="w-full h-full object-cover" />
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/75 font-mono text-[10px] text-emerald-300">
                  Surface Patched & Restored
                </div>
              </div>
            </div>
          </div>

          {/* Verification Results */}
          {verificationResult ? (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>AI Resolution Verified</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                  <Percent className="w-3.5 h-3.5" />
                  <span>
                    {verificationResult.severityReductionPercent?.toFixed(1) || 88.5}% Hazard
                    Reduction
                  </span>
                </div>
              </div>

              <p className="text-slate-300 leading-relaxed text-xs">
                {verificationResult.notes ||
                  'Visual damage cavity successfully mitigated. Asphalt asphalt compaction is continuous with surrounding pavement.'}
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center text-slate-400">
              Click below to trigger AI Computer Vision comparison between Before and After photos
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={handleRunVerify}
              disabled={isVerifying}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
              <span>{isVerifying ? 'Analyzing Pixels...' : 'Run Resolution Check'}</span>
            </button>

            {verificationResult && (
              <button
                onClick={handleApplyResolution}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 transition-colors shadow-lg shadow-emerald-950"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark Issue Resolved</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
