import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { IncidentsView } from './components/IncidentsView';
import { DigitalTwinGraph } from './components/DigitalTwinGraph';
import { IncidentTimelineView } from './components/IncidentTimelineView';
import { ReproductionSimulatorView } from './components/ReproductionSimulatorView';
import { RootCauseView } from './components/RootCauseView';
import { ImpactAnalysisView } from './components/ImpactAnalysisView';
import { FixValidationView } from './components/FixValidationView';
import { DataExplorerView } from './components/DataExplorerView';
import { SystemArchitectureView } from './components/SystemArchitectureView';
import { IncidentReportModal } from './components/IncidentReportModal';
import { AgentStatusModal } from './components/AgentStatusModal';
import {
  Incident,
  ReproductionScenario,
  ReplayExecutionResult,
  FixCandidate,
  FixValidationResult,
  AgentExecutionState,
  IncidentSeverity
} from './types/incident';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Play,
  RotateCcw,
  X
} from 'lucide-react';

export default function App() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('INC-101');
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'incidents' | 'digital-twin' | 'timeline' | 'reproduction' | 'root-cause' | 'impact' | 'fix-validation' | 'data-explorer' | 'architecture'
  >('dashboard');

  const [isInvestigating, setIsInvestigating] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isAgentsModalOpen, setIsAgentsModalOpen] = useState(false);
  const [demoStep, setDemoStep] = useState<number | null>(null);

  // Agent states tracking
  const [agentStates, setAgentStates] = useState<AgentExecutionState[]>([
    { agentId: 'agent-1', agentName: 'State Reconstruction Agent', status: 'COMPLETED', durationMs: 412, outputSummary: 'Digital twin topology reconstructed from Cloud Trace & APM logs' },
    { agentId: 'agent-2', agentName: 'Reproduction Scenario Agent', status: 'COMPLETED', durationMs: 520, outputSummary: 'Replay scenario synthesized: POST /inventory/reserve with stock=5, req=8' },
    { agentId: 'agent-3', agentName: 'Root Cause Analysis Agent', status: 'COMPLETED', durationMs: 840, outputSummary: 'Primary root cause: commit 9e8a71b NullReference (confidence: 94%)' },
    { agentId: 'agent-4', agentName: 'Hypothesis Evaluation Agent', status: 'COMPLETED', durationMs: 360, outputSummary: 'Evaluated 2 alternative hypotheses; contradicted by pod telemetry' },
    { agentId: 'agent-5', agentName: 'Impact Analysis Agent', status: 'COMPLETED', durationMs: 490, outputSummary: 'Blast radius: MULTI_SERVICE, 482 customers affected, $24,500 at risk' },
    { agentId: 'agent-6', agentName: 'Fix Validation Agent', status: 'COMPLETED', durationMs: 610, outputSummary: 'Candidate rollback verified: 100% pass, zero regressions' }
  ]);

  // Fetch incidents on load
  const fetchIncidents = async () => {
    try {
      const res = await fetch('/api/incidents');
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setIncidents(list);
        if (list.length > 0 && !selectedIncidentId) {
          setSelectedIncidentId(list[0].id);
        }
      }
    } catch (err) {
      console.warn('Backend not ready, waiting for connection...', err);
    }
  };

  const fetchIncidentDetails = async (id: string) => {
    try {
      const res = await fetch(`/api/incidents/${id}`);
      if (res.ok) {
        const fullIncident = await res.json();
        setIncidents(prev => {
          const list = prev || [];
          const exists = list.some(i => i.id === fullIncident.id);
          if (exists) {
            return list.map(i => (i.id === fullIncident.id ? { ...i, ...fullIncident } : i));
          }
          return [fullIncident, ...list];
        });
      }
    } catch (err) {
      console.warn('Failed to fetch incident details', err);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  useEffect(() => {
    if (selectedIncidentId) {
      fetchIncidentDetails(selectedIncidentId);
    }
  }, [selectedIncidentId]);

  const selectedIncident = (incidents || []).find(i => i.id === selectedIncidentId) || (incidents && incidents[0]) || null;

  const handleSelectIncident = (id: string, tab?: string) => {
    setSelectedIncidentId(id);
    fetchIncidentDetails(id);
    if (tab) {
      setActiveTab(tab as any);
    }
  };

  // Run Investigation
  const handleRunInvestigation = async () => {
    if (!selectedIncident) return;
    setIsInvestigating(true);
    setIsAgentsModalOpen(true);

    // Animate agent states
    setAgentStates(prev => prev.map(a => ({ ...a, status: 'RUNNING' })));

    try {
      const res = await fetch(`/api/investigate/${selectedIncident.id}`, {
        method: 'POST'
      });

      if (res.ok) {
        const data = await res.json();
        // Update incident in list
        setIncidents(prev =>
          prev.map(inc => (inc.id === data.incident.id ? data.incident : inc))
        );
        if (data.agentStates) {
          setAgentStates(data.agentStates);
        }
      }
    } catch (err) {
      console.error('Investigation error', err);
    } finally {
      setIsInvestigating(false);
    }
  };

  // Run Reproduction
  const handleExecuteReproduction = async (
    scenario: ReproductionScenario,
    overrides?: { overrideVersion?: string; overrideConfig?: Record<string, any> }
  ): Promise<ReplayExecutionResult> => {
    if (!selectedIncident) throw new Error('No incident selected');

    const res = await fetch(`/api/reproduce/${selectedIncident.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scenario,
        overrideVersion: overrides?.overrideVersion,
        overrideConfig: overrides?.overrideConfig
      })
    });

    if (!res.ok) {
      throw new Error('Failed to execute reproduction');
    }

    const data = await res.json();
    // Update incident with replay result
    setIncidents(prev =>
      prev.map(inc => {
        if (inc.id === selectedIncident.id) {
          return {
            ...inc,
            status: data.result.status === 'REPRODUCED' ? 'REPRODUCED' : inc.status,
            reproductionScenario: {
              ...(inc.reproductionScenario || scenario),
              lastExecutionResult: data.result
            }
          };
        }
        return inc;
      })
    );

    return data.result;
  };

  // Validate Fix
  const handleValidateFix = async (fix: FixCandidate): Promise<FixValidationResult> => {
    if (!selectedIncident) throw new Error('No incident selected');

    const res = await fetch(`/api/validate-fix/${selectedIncident.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fixCandidate: fix })
    });

    if (!res.ok) {
      throw new Error('Failed to validate fix');
    }

    const data = await res.json();
    setIncidents(prev =>
      prev.map(inc => {
        if (inc.id === selectedIncident.id) {
          return {
            ...inc,
            status: data.result.verdict === 'PASS' ? 'RESOLVED' : inc.status,
            fixValidation: data.result
          };
        }
        return inc;
      })
    );

    return data.result;
  };

  // Generate Synthetic Incident
  const handleGenerateSynthetic = async (params: {
    service?: string;
    errorType?: string;
    severity?: IncidentSeverity;
  }) => {
    try {
      const res = await fetch('/api/incidents/synthetic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (res.ok) {
        const newInc = await res.json();
        setIncidents(prev => [newInc, ...prev]);
        setSelectedIncidentId(newInc.id);
        setActiveTab('digital-twin');
      }
    } catch (err) {
      console.error('Failed to generate synthetic incident', err);
    }
  };

  // Upload Custom Incident JSON
  const handleUploadIncident = async (incidentJson: string) => {
    const parsed = JSON.parse(incidentJson);
    const res = await fetch('/api/incidents/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed)
    });
    if (res.ok) {
      const newInc = await res.json();
      setIncidents(prev => [newInc, ...prev]);
      setSelectedIncidentId(newInc.id);
      setActiveTab('digital-twin');
    } else {
      throw new Error('Server rejected incident JSON');
    }
  };

  // Guided Demo Walkthrough Steps
  const demoTourSteps = [
    {
      step: 1,
      title: '1. Production Alert Ingested',
      tab: 'incidents',
      desc: 'BugTwin ingests production telemetry for INC-101. An unhandled NullReferenceException in inventory-service caused an instant checkout outage.'
    },
    {
      step: 2,
      title: '2. Digital Twin Architecture Reconstructed',
      tab: 'digital-twin',
      desc: 'BugTwin auto-reconstructs the microservice topology, pinpointing inventory-service deployment v2.4.1 (commit 9e8a71b).'
    },
    {
      step: 3,
      title: '3. Deterministic Bug Reproduction',
      tab: 'reproduction',
      desc: 'Click "Run Reproduction". BugTwin isolates the container and deterministically reproduces the exact 500 error.'
    },
    {
      step: 4,
      title: '4. Evidence-Backed Root Cause Scoring',
      tab: 'root-cause',
      desc: 'Gemini multi-agent reasoning calculates a 94% confidence score, correlating code diffs and contradictory hypotheses.'
    },
    {
      step: 5,
      title: '5. Pre-Deployment Fix Verification',
      tab: 'fix-validation',
      desc: 'Validate candidate remedies (Rollback / Feature Flag / Hotfix). Proves 100% PASS with zero regressions before touching production.'
    }
  ];

  const handleStartDemo = () => {
    setSelectedIncidentId('INC-101');
    setDemoStep(1);
    setActiveTab('incidents');
  };

  const handleNextDemoStep = () => {
    if (demoStep === null) return;
    if (demoStep < demoTourSteps.length) {
      const nextStepNum = demoStep + 1;
      setDemoStep(nextStepNum);
      const nextStepConfig = demoTourSteps[nextStepNum - 1];
      setActiveTab(nextStepConfig.tab as any);
    } else {
      setDemoStep(null);
      setIsReportOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* App Header & Navigation */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        incidents={incidents}
        selectedIncidentId={selectedIncidentId}
        setSelectedIncidentId={(id) => handleSelectIncident(id)}
        selectedIncident={selectedIncident || null}
        onRunInvestigation={handleRunInvestigation}
        isInvestigating={isInvestigating}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenAgents={() => setIsAgentsModalOpen(true)}
        onStartDemo={handleStartDemo}
        isDemoActive={demoStep !== null}
      />

      {/* Guided Demo Floating Coachmark Banner */}
      {demoStep !== null && (
        <div className="bg-gradient-to-r from-blue-950/90 via-indigo-950/90 to-purple-950/90 border-b border-blue-500/40 px-6 py-3 sticky top-16 z-30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 font-bold text-xs">
              DEMO STEP {demoStep}/5
            </span>
            <div>
              <h4 className="text-xs font-bold text-white tracking-wide">
                {demoTourSteps[demoStep - 1].title}
              </h4>
              <p className="text-[11px] text-slate-300">
                {demoTourSteps[demoStep - 1].desc}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-auto">
            <button
              onClick={handleNextDemoStep}
              className="px-3 py-1.5 bg-blue-500 hover:bg-blue-400 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <span>{demoStep === demoTourSteps.length ? 'Finish & View Post-Mortem' : 'Next Step'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDemoStep(null)}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
              title="Exit demo tour"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            incidents={incidents}
            onSelectIncident={handleSelectIncident}
            onStartDemo={handleStartDemo}
            isInvestigating={isInvestigating}
          />
        )}

        {activeTab === 'incidents' && (
          <IncidentsView
            incidents={incidents}
            selectedIncidentId={selectedIncident?.id || 'INC-101'}
            onSelectIncident={handleSelectIncident}
            onGenerateSynthetic={handleGenerateSynthetic}
            onUploadIncident={handleUploadIncident}
          />
        )}

        {activeTab === 'digital-twin' && selectedIncident && (
          <DigitalTwinGraph
            digitalTwin={selectedIncident.digitalTwin}
            incidentTitle={selectedIncident.title}
          />
        )}

        {activeTab === 'timeline' && selectedIncident && (
          <IncidentTimelineView
            events={selectedIncident.events}
            incidentTitle={selectedIncident.title}
            traceId={selectedIncident.traceId}
          />
        )}

        {activeTab === 'reproduction' && selectedIncident && (
          <ReproductionSimulatorView
            incident={selectedIncident}
            onExecuteReproduction={handleExecuteReproduction}
            lastExecutionResult={selectedIncident.reproductionScenario?.lastExecutionResult}
          />
        )}

        {activeTab === 'root-cause' && selectedIncident && (
          <RootCauseView
            rootCause={selectedIncident.rootCauseAnalysis}
            incident={selectedIncident}
            onRunInvestigation={handleRunInvestigation}
            isInvestigating={isInvestigating}
          />
        )}

        {activeTab === 'impact' && selectedIncident && (
          <ImpactAnalysisView
            impact={selectedIncident.impactAnalysis}
            incident={selectedIncident}
          />
        )}

        {activeTab === 'fix-validation' && selectedIncident && (
          <FixValidationView
            incident={selectedIncident}
            onValidateFix={handleValidateFix}
          />
        )}

        {activeTab === 'data-explorer' && selectedIncident && (
          <DataExplorerView incident={selectedIncident} />
        )}

        {activeTab === 'architecture' && <SystemArchitectureView />}
      </main>

      {/* Post-Mortem Report Modal */}
      {selectedIncident && (
        <IncidentReportModal
          incident={selectedIncident}
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
        />
      )}

      {/* Multi-Agent Orchestration Status Modal */}
      {selectedIncident && (
        <AgentStatusModal
          isOpen={isAgentsModalOpen}
          onClose={() => setIsAgentsModalOpen(false)}
          agents={agentStates}
          isInvestigating={isInvestigating}
          incidentId={selectedIncident.id}
        />
      )}
    </div>
  );
}
