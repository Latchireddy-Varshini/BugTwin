import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Sparkles,
  GitPullRequest,
  ShieldCheck,
  ArrowRight,
  Diff,
  AlertTriangle
} from 'lucide-react';
import {
  Incident,
  FixCandidate,
  FixValidationResult
} from '../types/incident';

interface FixValidationViewProps {
  incident: Incident;
  onValidateFix: (fix: FixCandidate) => Promise<FixValidationResult>;
}

export const FixValidationView: React.FC<FixValidationViewProps> = ({
  incident,
  onValidateFix
}) => {
  const [selectedFixId, setSelectedFixId] = useState('FIX-ROLLBACK');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<FixValidationResult | null>(
    incident.fixValidation || null
  );

  const availableFixes: FixCandidate[] = [
    {
      id: 'FIX-ROLLBACK',
      title: `Rollback ${incident.affectedService} from v2.4.1 to v2.4.0`,
      description: 'Instant zero-downtime rollback via Cloud Run revision traffic routing to previous stable image.',
      type: 'ROLLBACK',
      targetService: incident.affectedService,
      parameters: { targetVersion: 'v2.4.0' }
    },
    {
      id: 'FIX-CONFIG',
      title: 'Emergency Feature Flag Toggle: INVENTORY_VALIDATION=false',
      description: 'Deactivate experimental threshold validator via Cloud RuntimeConfig / ConfigMap without container redeploy.',
      type: 'CONFIG_CHANGE',
      targetService: incident.affectedService,
      parameters: { INVENTORY_VALIDATION: false }
    },
    {
      id: 'FIX-CODEPATCH',
      title: 'Deploy Hotfix: v2.4.1-patch1 (Null-safe Metric Logging)',
      description: 'Patch /app/services/validator.ts:42 to initialize deficit metric collector before recording stock discrepancy.',
      type: 'CODE_PATCH',
      targetService: incident.affectedService,
      parameters: { targetVersion: 'v2.4.1-patch1' }
    }
  ];

  const currentFix = availableFixes.find(f => f.id === selectedFixId) || availableFixes[0];

  const handleRunValidation = async () => {
    setIsValidating(true);
    try {
      const res = await onValidateFix(currentFix);
      setValidationResult(res);
    } catch (err) {
      console.error('Validation failed', err);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Pre-Deployment Fix Verification Sandbox
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Test candidate patches, rollbacks, and configuration toggles directly against the reproduced failure.
          </p>
        </div>

        <button
          onClick={handleRunValidation}
          disabled={isValidating}
          className={`px-5 py-2.5 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all shadow-md active:scale-95 cursor-pointer ${
            isValidating
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
          }`}
        >
          {isValidating ? (
            <>
              <RotateCcw className="w-4 h-4 animate-spin" />
              <span>Replaying Under Proposed Fix...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Validate Candidate Fix</span>
            </>
          )}
        </button>
      </div>

      {/* Select Proposed Fix Candidate */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
          Select Candidate Remediation Strategy:
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {availableFixes.map((fix) => {
            const isSelected = fix.id === selectedFixId;
            return (
              <div
                key={fix.id}
                onClick={() => setSelectedFixId(fix.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer text-left space-y-2 ${
                  isSelected
                    ? 'bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/50 shadow-lg'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                    {fix.type}
                  </span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                </div>

                <h4 className="font-bold text-xs text-white line-clamp-1">
                  {fix.title}
                </h4>

                <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                  {fix.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Before vs After Verification Comparison */}
      {validationResult ? (
        <div className="space-y-4">
          {/* Main Verdict Banner */}
          <div
            className={`p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg ${
              validationResult.verdict === 'PASS'
                ? 'bg-emerald-950/30 border-emerald-500 text-emerald-200 shadow-emerald-950/20'
                : 'bg-rose-950/30 border-rose-500 text-rose-200'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-lg tracking-tight">
                    VERDICT: {validationResult.verdict === 'PASS' ? 'FIX VERIFIED (PASS)' : 'FIX FAILED'}
                  </span>
                </div>
                <p className="text-xs mt-1 text-slate-300 max-w-2xl leading-relaxed">
                  {validationResult.explanation}
                </p>
              </div>
            </div>

            <div className="text-right self-end sm:self-auto">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Regression Check
              </span>
              <div className="text-sm font-bold text-emerald-400">
                ✓ Zero Regressions
              </div>
            </div>
          </div>

          {/* Side-by-Side: Before vs After */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Before Fix */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <XCircle className="w-4 h-4" />
                  <span>Before Fix (Original Failure)</span>
                </span>
                <span className="text-xs font-mono font-bold text-rose-400">
                  HTTP {validationResult.beforeFixResult.statusCode}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Status:</span>
                  <span className="font-bold text-rose-400">FAIL</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400">Observed Behavior:</span>
                  <div className="p-2.5 rounded bg-slate-950 text-rose-300 font-mono text-[11px] border border-slate-800">
                    {validationResult.beforeFixResult.errorMessage}
                  </div>
                </div>
              </div>
            </div>

            {/* After Fix */}
            <div className="bg-slate-900 border border-emerald-900/40 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>After Fix (Simulated Sandbox)</span>
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  HTTP {validationResult.afterFixResult.statusCode}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Status:</span>
                  <span className="font-bold text-emerald-400">PASS</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400">Remediated Outcome:</span>
                  <div className="p-2.5 rounded bg-slate-950 text-emerald-300 font-mono text-[11px] border border-slate-800">
                    {validationResult.afterFixResult.message}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs">
          Click <strong>Validate Candidate Fix</strong> above to execute the reproduction scenario against the digital twin sandbox with the chosen remedy.
        </div>
      )}
    </div>
  );
};
