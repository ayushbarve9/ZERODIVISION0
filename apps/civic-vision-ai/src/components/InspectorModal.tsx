import React, { useState, useRef, useEffect } from 'react';
import {
  Scan,
  X,
  RefreshCw,
  Upload,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  Target,
  Sparkles,
  Info,
  Layers,
  Cpu,
  Eye,
  FileQuestion,
} from 'lucide-react';
import { PRESET_IMAGES } from '../data/presets';
import { AiVisionAnalysis, PresetImage } from '../types';

interface InspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialImageUrl?: string;
  initialCategory?: string;
}

export const InspectorModal: React.FC<InspectorModalProps> = ({
  isOpen,
  onClose,
  initialImageUrl,
  initialCategory,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(PRESET_IMAGES[0].id);
  const [currentImageUrl, setCurrentImageUrl] = useState<string>(
    initialImageUrl || PRESET_IMAGES[0].url
  );
  const [categoryHint, setCategoryHint] = useState<string>(initialCategory || 'pothole');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<AiVisionAnalysis | null>(null);
  const [customError, setCustomError] = useState<string | null>(null);
  const [showBBoxes, setShowBBoxes] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Run scan whenever modal opens or image changes
  useEffect(() => {
    if (isOpen) {
      handleAnalyze(currentImageUrl, categoryHint);
    }
  }, [isOpen]);

  const handleAnalyze = async (imgUrlOrB64: string, catHint?: string) => {
    setIsScanning(true);
    setCustomError(null);

    try {
      const res = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: imgUrlOrB64.startsWith('data:') ? undefined : imgUrlOrB64,
          imageBase64: imgUrlOrB64.startsWith('data:') ? imgUrlOrB64 : undefined,
          categoryHint: catHint || categoryHint,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.analysis) {
        setScanResult(data.analysis);
      } else {
        throw new Error('Analysis payload missing in response');
      }
    } catch (err: any) {
      console.error('Scan error:', err);
      setCustomError(err.message || 'Failed to inspect image');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSelectPreset = (preset: PresetImage) => {
    setSelectedPresetId(preset.id);
    setCurrentImageUrl(preset.url);
    setCategoryHint(preset.category);
    handleAnalyze(preset.url, preset.category);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedPresetId('custom-upload');
      const reader = new FileReader();
      reader.onload = () => {
        const b64 = reader.result as string;
        setCurrentImageUrl(b64);
        handleAnalyze(b64, 'auto');
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  const auth = scanResult?.authenticity;
  const isAiGen = auth?.isAiGenerated ?? false;
  const isNonCivic = auth?.authenticityLabel === 'non_civic' || scanResult?.isCivicHazard === false;
  const isAuthentic = !isAiGen && !isNonCivic;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  YOLOv11 Vision & AI Authenticity Inspector
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  v11.0 Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Deepfake detection, Fourier spectral analysis, and municipal hazard verification
              </p>
            </div>
          </div>
          <button
            id="close-inspector-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Preset Test Scenarios */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                Select Test Scenario or Upload Custom Image:
              </span>
              <span className="text-[11px] text-slate-400">
                Includes synthetic deepfakes and non-civic random images to test false-positive resistance
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
              {PRESET_IMAGES.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    id={`preset-btn-${preset.id}`}
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 ring-1 ring-blue-500/50 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-sm font-semibold ${
                          preset.tag === 'Real Camera'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                            : preset.tag === 'AI Synthetic'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800/60'
                            : 'bg-amber-950 text-amber-300 border border-amber-800/60'
                        }`}
                      >
                        {preset.tag}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-slate-200 line-clamp-1">{preset.name}</div>
                  </button>
                );
              })}

              {/* Upload Custom Image Button */}
              <button
                id="upload-custom-image-btn"
                onClick={() => fileInputRef.current?.click()}
                className={`p-2.5 rounded-xl border border-dashed text-left transition-all flex flex-col justify-between ${
                  selectedPresetId === 'custom-upload'
                    ? 'bg-blue-600/20 border-blue-400 ring-1 ring-blue-400'
                    : 'border-slate-700 bg-slate-950/40 hover:border-blue-500 hover:bg-slate-900 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 text-[9px] font-mono text-blue-400 font-semibold uppercase">
                  <Upload className="w-3 h-3" />
                  Custom File
                </div>
                <div className="text-xs font-medium text-slate-200">Upload Image</div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </button>
            </div>
          </div>

          {/* Main Inspection Area: Image Display & Telemetry Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Image with Real-Time YOLO Bounding Boxes */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  YOLOv11 Visual Detections
                </span>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showBBoxes}
                      onChange={(e) => setShowBBoxes(e.target.checked)}
                      className="rounded border-slate-700 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Show Bounding Boxes</span>
                  </label>
                  <span className="text-[11px] font-mono text-slate-400">
                    {isScanning
                      ? 'Inferencing...'
                      : scanResult
                      ? `${scanResult.detections.length} objects`
                      : 'Standby'}
                  </span>
                </div>
              </div>

              {/* Image Canvas Container */}
              <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video relative flex items-center justify-center shadow-inner group">
                {isScanning ? (
                  <div className="flex flex-col items-center gap-2.5 py-12">
                    <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
                    <span className="text-xs text-slate-300 font-mono">
                      Running YOLOv11 & AI Authenticity Analysis...
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Evaluating Fourier 2D frequency spectrum, edge variance & domain context
                    </span>
                  </div>
                ) : (
                  <>
                    <img
                      src={currentImageUrl}
                      alt="Inspection target"
                      className="w-full h-full object-cover"
                    />

                    {/* Bounding Box Overlays */}
                    {showBBoxes &&
                      scanResult &&
                      scanResult.detections.map((det, idx) => {
                        const [ymin, xmin, ymax, xmax] = det.bbox;
                        const isAiIssue = scanResult.authenticity.isAiGenerated;
                        const boxColor = isAiIssue
                          ? 'border-rose-500 bg-rose-500/20'
                          : 'border-blue-500 bg-blue-500/20';
                        const labelBg = isAiIssue ? 'bg-rose-600' : 'bg-blue-600';

                        return (
                          <div
                            key={idx}
                            className={`absolute border-2 ${boxColor} pointer-events-none transition-all duration-300`}
                            style={{
                              top: `${ymin * 100}%`,
                              left: `${xmin * 100}%`,
                              width: `${(xmax - xmin) * 100}%`,
                              height: `${(ymax - ymin) * 100}%`,
                            }}
                          >
                            <div
                              className={`absolute -top-6 left-0 ${labelBg} text-white font-mono text-[10px] px-1.5 py-0.5 rounded-sm font-semibold shadow-md whitespace-nowrap`}
                            >
                              {det.label} ({(det.confidence * 100).toFixed(0)}%)
                            </div>
                          </div>
                        );
                      })}

                    {/* HUD Badge Overlay in Top Right */}
                    {scanResult && (
                      <div className="absolute top-2.5 right-2.5 bg-slate-950/90 backdrop-blur-sm border border-slate-800 rounded-lg p-2 font-mono text-[10px] text-slate-300 space-y-1 shadow-lg pointer-events-none">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">Model:</span>
                          <span className="text-blue-400 font-bold">{scanResult.model}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">Visual Severity (S):</span>
                          <span
                            className={`font-bold ${
                              scanResult.visualSeverityScore > 75
                                ? 'text-rose-400'
                                : scanResult.visualSeverityScore > 40
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                            }`}
                          >
                            {scanResult.visualSeverityScore}/100
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">Latency:</span>
                          <span className="text-slate-200">{scanResult.processingTimeMs}ms</span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  id="rerun-scan-btn"
                  onClick={() => handleAnalyze(currentImageUrl, categoryHint)}
                  disabled={isScanning}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-950 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                  <span>Re-Run Inspection</span>
                </button>
              </div>

              {customError && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Inspection Notice: </span>
                    {customError}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Telemetry, Damage Magnitude & AI Authenticity Cards */}
            <div className="lg:col-span-5 space-y-4">
              {/* Visual Damage Magnitude Gauge */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-blue-400" />
                    Damage Severity Magnitude (S)
                  </span>
                  <span className="font-mono font-bold text-base text-blue-400">
                    {scanResult ? scanResult.visualSeverityScore : '--'} / 100
                  </span>
                </div>

                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      (scanResult?.visualSeverityScore || 0) > 75
                        ? 'bg-rose-500'
                        : (scanResult?.visualSeverityScore || 0) > 40
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${scanResult ? scanResult.visualSeverityScore : 0}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>0: None / Irrelevant</span>
                  <span>50: Moderate</span>
                  <span>100: Catastrophic</span>
                </div>
              </div>

              {/* AI Image Authenticity & Forensic Audit Card */}
              {auth ? (
                <div
                  className={`p-4 rounded-xl border transition-all duration-300 ${
                    isAiGen
                      ? 'bg-rose-950/40 border-rose-500/70 shadow-lg shadow-rose-950/30'
                      : isNonCivic
                      ? 'bg-amber-950/30 border-amber-500/60 shadow-lg shadow-amber-950/20'
                      : 'bg-emerald-950/30 border-emerald-500/50'
                  } space-y-3`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {isAiGen ? (
                        <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                          <ShieldAlert className="w-4 h-4" />
                        </div>
                      ) : isNonCivic ? (
                        <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                          <FileQuestion className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                      )}

                      <div>
                        <div
                          className={`text-xs font-bold uppercase tracking-wider ${
                            isAiGen
                              ? 'text-rose-300'
                              : isNonCivic
                              ? 'text-amber-300'
                              : 'text-emerald-300'
                          }`}
                        >
                          {isAiGen
                            ? 'AI Synthetic / Deepfake'
                            : isNonCivic
                            ? 'Non-Civic Irrelevant Image'
                            : 'Authentic Camera Capture'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {(auth.confidence * 100).toFixed(1)}% Confidence Verdict
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        isAiGen
                          ? 'bg-rose-500/30 text-rose-300 border border-rose-500/40'
                          : isNonCivic
                          ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {isAiGen ? 'BLOCKED' : isNonCivic ? 'REJECTED' : 'VALIDATED'}
                    </span>
                  </div>

                  {/* Summary Text */}
                  <div className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    {auth.analysisSummary}
                  </div>

                  {/* Forensic Indicators */}
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                      Diagnostic Forensic Indicators:
                    </span>
                    <ul className="space-y-1 text-xs">
                      {auth.indicators.map((ind, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-slate-300">
                          <span
                            className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${
                              isAiGen
                                ? 'bg-rose-400'
                                : isNonCivic
                                ? 'bg-amber-400'
                                : 'bg-emerald-400'
                            }`}
                          />
                          <span>{ind}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Telemetry Grid */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80 font-mono text-[10px]">
                    <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                      <span className="text-slate-500 block">EXIF Integrity:</span>
                      <span className={auth.metadataIntegrity ? 'text-emerald-400' : 'text-slate-400'}>
                        {auth.metadataIntegrity ? 'Camera Hardware EXIF' : 'Metadata Stripped'}
                      </span>
                    </div>
                    <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                      <span className="text-slate-500 block">Civic Hazard Match:</span>
                      <span className={scanResult.isCivicHazard ? 'text-blue-400' : 'text-amber-400'}>
                        {scanResult.isCivicHazard ? 'Municipal Infrastructure' : 'Non-Civic Content'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-500 py-8">
                  Run inspection to view AI authenticity verdict & spectral telemetry
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            <span>Dual Core: YOLOv11 & Multimodal Spectral Verification</span>
          </div>
          <span className="text-slate-500">Autonomous Municipal Ingestion</span>
        </div>
      </div>
    </div>
  );
};
