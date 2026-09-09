import React from 'react';
import {
  CheckCircle2,
  AlertOctagon,
  Percent,
  Sliders,
  GitBranch,
  ShieldCheck,
  FileCheck,
  ChevronRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { RootCauseAnalysis, Incident } from '../types/incident';

interface RootCauseViewProps {
  rootCause?: RootCauseAnalysis;
  incident: Incident;
  onRunInvestigation: () => void;
  isInvestigating: boolean;
}

export const RootCauseView: React.FC<RootCauseViewProps> = ({
  rootCause,
  incident,
  onRunInvestigation,
  isInvestigating
}) => {
  if (!rootCause) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto">
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h3 className="text-base font-bold text-white">Root Cause Analysis Pending</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Run the multi-agent AI investigation pipeline to correlate telemetry, calculate evidence scores, and identify the primary root cause.
          </p>
        </div>
        <button
          onClick={onRunInvestigation}
          disabled={isInvestigating}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md cursor-pointer"
        >
          {isInvestigating ? 'Analyzing Telemetry...' : 'Start Root Cause Investigation'}
        </button>
      </div>
    );
  }

  const { primaryHypothesis, alternativeHypotheses, evidenceScoreBreakdown, reasoningNarrative } = rootCause;

  return (
    <div className="space-y-6">
      {/* Top Banner: Primary Root Cause & Confidence */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Identified Primary Root Cause</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {primaryHypothesis.candidate}
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed">
              {reasoningNarrative}
            </p>
          </div>

          {/* Confidence Meter Card */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 flex flex-col items-center justify-center min-w-[200px] shadow-lg">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Confidence Score
            </span>
            <div className="text-4xl font-black text-amber-400 my-1 font-mono">
              {primaryHypothesis.confidenceScore}%
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 mt-1 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-emerald-400 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${primaryHypothesis.confidenceScore}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 mt-1.5 font-medium">
              Calculated from 4 Telemetry Signals
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Evidence Checklist vs Mathematical Score Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Supporting & Contradictory Evidence */}
        <div className="lg:col-span-2 space-y-6">
          {/* Supporting Telemetry Evidence */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Supporting Telemetry Evidence
              </h3>
            </div>

            <div className="space-y-2.5">
              {primaryHypothesis.evidence.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-start space-x-3 text-xs"
                >
                  <span className="text-emerald-400 font-bold font-mono text-sm leading-none mt-0.5">✓</span>
                  <span className="text-slate-200 leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Alternative Hypotheses & Counter-Evidence */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
              <GitBranch className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Evaluated Alternative Hypotheses
              </h3>
            </div>

            <div className="space-y-3">
              {alternativeHypotheses.map((alt) => (
                <div
                  key={alt.id}
                  className="p-3.5 rounded-lg bg-slate-950/40 border border-slate-800 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-300">{alt.candidate}</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-bold">
                      Confidence: {alt.confidenceScore}%
                    </span>
                  </div>

                  {alt.contradictoryEvidence.map((contra, cIdx) => (
                    <div key={cIdx} className="text-rose-300 text-[11px] flex items-start space-x-2">
                      <span className="text-rose-500 font-bold">✕ Contradiction:</span>
                      <span>{contra}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Transparent Evidence Scoring Formula */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              <span>Evidence Scoring Weight</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              Transparent telemetry formula behind the 94% confidence score:
            </p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Temporal Proximity */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-300">Temporal Proximity</span>
                <span className="font-mono text-emerald-400">+{evidenceScoreBreakdown.temporalProximity}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '100%' }} />
              </div>
              <p className="text-[10px] text-slate-400">Deployment occurred 4 min before error spike</p>
            </div>

            {/* Error Spike Correlation */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-300">Error Spike Correlation</span>
                <span className="font-mono text-emerald-400">+{evidenceScoreBreakdown.errorSpikeCorrelation}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5">
                <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '83%' }} />
              </div>
              <p className="text-[10px] text-slate-400">100% of 500 errors hit v2.4.1 pod replicas</p>
            </div>

            {/* Reproduction Verification */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-300">Reproduction Verification</span>
                <span className="font-mono text-emerald-400">+{evidenceScoreBreakdown.reproductionVerification}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '100%' }} />
              </div>
              <p className="text-[10px] text-slate-400">Digital twin replay deterministically reproduced failure</p>
            </div>

            {/* Code / Config Diff Match */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-300">Code / Config Diff Match</span>
                <span className="font-mono text-emerald-400">+{evidenceScoreBreakdown.codeConfigDiffMatch}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5">
                <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: '90%' }} />
              </div>
              <p className="text-[10px] text-slate-400">Stacktrace points directly to commit 9e8a71b line 42</p>
            </div>

            {/* Total Confidence */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between font-bold text-sm">
              <span className="text-white">Total Confidence:</span>
              <span className="font-mono text-amber-400 text-lg">
                {evidenceScoreBreakdown.totalConfidence}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
