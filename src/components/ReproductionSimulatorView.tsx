import React, { useState } from 'react';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Terminal,
  Server,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import {
  Incident,
  ReproductionScenario,
  ReplayExecutionResult
} from '../types/incident';

interface ReproductionSimulatorViewProps {
  incident: Incident;
  onExecuteReproduction: (
    scenario: ReproductionScenario,
    overrides?: { overrideVersion?: string; overrideConfig?: Record<string, any> }
  ) => Promise<ReplayExecutionResult>;
  lastExecutionResult?: ReplayExecutionResult | null;
}

export const ReproductionSimulatorView: React.FC<ReproductionSimulatorViewProps> = ({
  incident,
  onExecuteReproduction,
  lastExecutionResult
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [versionOverride, setVersionOverride] = useState<string>('');
  const [localResult, setLocalResult] = useState<ReplayExecutionResult | null>(
    lastExecutionResult || null
  );

  const scenario = incident.reproductionScenario;

  const handleRunReproduction = async () => {
    if (!scenario) return;
    setIsRunning(true);
    setActiveStep(1);

    // Live step simulation visual progression
    const timer1 = setTimeout(() => setActiveStep(2), 250);
    const timer2 = setTimeout(() => setActiveStep(3), 500);
    const timer3 = setTimeout(() => setActiveStep(4), 750);
    const timer4 = setTimeout(() => setActiveStep(5), 1000);

    try {
      const result = await onExecuteReproduction(scenario, {
        overrideVersion: versionOverride || undefined
      });
      setTimeout(() => {
        setLocalResult(result);
        setIsRunning(false);
      }, 1200);
    } catch (err) {
      setIsRunning(false);
    }
  };

  const stepsDefinition = [
    { step: 1, label: 'Initialize isolated microservice sandbox', desc: 'Bootstrap container environment' },
    { step: 2, label: 'Apply reconstructed state & config flags', desc: 'Precondition seeding' },
    { step: 3, label: 'Dispatch simulated API request sequence', desc: 'Mirror production payload' },
    { step: 4, label: 'Evaluate internal logic & failure condition', desc: 'Trace runtime execution' },
    { step: 5, label: 'Compare replay output with original incident', desc: 'Verify error signature' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <h2 className="text-lg font-bold text-white tracking-tight">Automated Bug Reproduction Sandbox</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Replays production incidents inside an isolated digital twin sandbox to deterministically reproduce the bug.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Target Version Selector */}
          <div className="flex items-center space-x-2 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200">
            <span className="text-slate-400">Target Image:</span>
            <select
              value={versionOverride || (scenario?.targetVersion || 'v2.4.1')}
              onChange={(e) => setVersionOverride(e.target.value)}
              className="bg-transparent font-mono font-bold text-blue-400 outline-none cursor-pointer"
            >
              <option value="v2.4.1" className="bg-slate-900">v2.4.1 (Incident Version)</option>
              <option value="v2.4.0" className="bg-slate-900">v2.4.0 (Previous Stable)</option>
              <option value="v2.4.1-patch1" className="bg-slate-900">v2.4.1-patch1 (Hotfix Candidate)</option>
            </select>
          </div>

          <button
            onClick={handleRunReproduction}
            disabled={isRunning || !scenario}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all shadow-md active:scale-95 cursor-pointer ${
              isRunning || !scenario
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
            }`}
          >
            {isRunning ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>Simulating Replay...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Run Reproduction</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Side-by-Side: Original Incident vs Digital Twin Reconstruction */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Original Incident State */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Original Production Incident</span>
            </span>
            <span className="text-[11px] font-mono text-slate-400">{incident.id}</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Status Code:</span>
              <span className="font-mono font-bold text-rose-400">
                HTTP {incident.id === 'INC-104' ? 429 : 500}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Affected Service:</span>
              <span className="font-mono text-indigo-300">{incident.affectedService}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Trace ID:</span>
              <span className="font-mono text-slate-300">{incident.traceId}</span>
            </div>
            <div className="space-y-1 pt-1">
              <span className="text-slate-400">Error Signature:</span>
              <div className="p-2 rounded bg-slate-950 text-rose-300 font-mono text-[11px] border border-slate-800">
                {incident.initialError}
              </div>
            </div>
          </div>
        </div>

        {/* Digital Twin Reconstructed Parameters */}
        <div className="bg-slate-900 border border-blue-900/40 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>BugTwin Reconstructed Environment</span>
            </span>
            <span className="text-[11px] font-mono text-blue-400">
              {scenario?.scenarioId || 'SCENARIO-AUTO'}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Target Image:</span>
              <span className="font-mono font-bold text-blue-300">
                {versionOverride || scenario?.targetVersion || 'v2.4.1'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Precondition Flag:</span>
              <span className="font-mono text-emerald-300">INVENTORY_VALIDATION=true</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Simulated DB Stock:</span>
              <span className="font-mono text-slate-300">available=5, required=8</span>
            </div>
            <div className="space-y-1 pt-1">
              <span className="text-slate-400">Simulated API Trigger:</span>
              <div className="p-2 rounded bg-slate-950 text-blue-300 font-mono text-[11px] border border-slate-800">
                {scenario ? `${scenario.inputs.method} ${scenario.inputs.endpoint}` : 'POST /inventory/reserve'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Replay Stepper */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Reproduction Execution Pipeline
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {stepsDefinition.map((s) => {
            const isDone = activeStep > s.step || (localResult && !isRunning);
            const isCurrent = activeStep === s.step && isRunning;

            return (
              <div
                key={s.step}
                className={`p-3 rounded-lg border text-xs transition-all ${
                  isDone
                    ? 'bg-blue-950/30 border-blue-500/50 text-slate-200'
                    : isCurrent
                    ? 'bg-blue-600/20 border-blue-400 text-white ring-2 ring-blue-500/50'
                    : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                <div className="flex items-center space-x-1.5 font-bold mb-1">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <span className="w-4 h-4 rounded-full bg-slate-800 text-center font-mono text-[10px] leading-4">
                      {s.step}
                    </span>
                  )}
                  <span>STEP {s.step}</span>
                </div>
                <div className="font-semibold text-slate-300 line-clamp-1">{s.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{s.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reproduction Verdict Banner & Live Terminal Logs */}
      {localResult && (
        <div className="space-y-4">
          {/* Verdict Banner */}
          <div
            className={`p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg ${
              localResult.status === 'REPRODUCED'
                ? 'bg-rose-950/30 border-rose-500 text-rose-200 shadow-rose-950/30'
                : 'bg-emerald-950/30 border-emerald-500 text-emerald-200 shadow-emerald-950/30'
            }`}
          >
            <div className="flex items-start space-x-3">
              {localResult.status === 'REPRODUCED' ? (
                <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              ) : (
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              )}
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-lg tracking-tight">
                    {localResult.status === 'REPRODUCED' ? 'BUG REPRODUCED' : 'BUG NOT REPRODUCED'}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-slate-900 border border-slate-700 text-slate-200">
                    HTTP {localResult.actualStatusCode}
                  </span>
                </div>
                <p className="text-xs mt-1 text-slate-300 max-w-2xl leading-relaxed">
                  {localResult.summary}
                </p>
              </div>
            </div>

            <div className="text-right self-end sm:self-auto">
              <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                Reproduction Confidence
              </span>
              <div className="text-2xl font-black font-mono text-white">
                {localResult.reproductionConfidence}%
              </div>
            </div>
          </div>

          {/* Terminal Execution Logs */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs text-slate-300 font-mono">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>simulator-execution-trace ({localResult.executionId})</span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                Execution Time: {localResult.durationMs}ms
              </span>
            </div>

            <div className="p-4 font-mono text-xs space-y-2 max-h-72 overflow-y-auto">
              {localResult.logs.map((log, idx) => (
                <div key={idx} className="flex items-start space-x-3 text-slate-300">
                  <span className="text-slate-600 select-none text-[11px]">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  <span
                    className={`font-semibold ${
                      log.status === 'ERROR'
                        ? 'text-rose-400'
                        : log.status === 'WARNING'
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
