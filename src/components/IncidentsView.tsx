import React, { useState } from 'react';
import {
  AlertTriangle,
  Upload,
  PlusCircle,
  FileCode,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Search,
  Filter
} from 'lucide-react';
import { Incident, IncidentSeverity } from '../types/incident';

interface IncidentsViewProps {
  incidents: Incident[];
  selectedIncidentId: string;
  onSelectIncident: (id: string, tab?: string) => void;
  onGenerateSynthetic: (params: { service?: string; errorType?: string; severity?: IncidentSeverity }) => void;
  onUploadIncident: (incidentJson: string) => void;
}

export const IncidentsView: React.FC<IncidentsViewProps> = ({
  incidents = [],
  selectedIncidentId,
  onSelectIncident,
  onGenerateSynthetic,
  onUploadIncident
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [rawUploadText, setRawUploadText] = useState('');

  // Synthetic Generator Form State
  const [synthService, setSynthService] = useState('inventory-service');
  const [synthError, setSynthError] = useState('Threshold Validation NullReference');
  const [synthSeverity, setSynthSeverity] = useState<IncidentSeverity>('CRITICAL');

  const incidentList = incidents || [];
  const filteredIncidents = incidentList.filter((inc) => {
    const matchesSearch =
      inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.affectedService.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === 'ALL' || inc.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const selectedIncident = incidentList.find(i => i.id === selectedIncidentId);

  const handleUploadSubmit = () => {
    try {
      onUploadIncident(rawUploadText);
      setIsUploadModalOpen(false);
      setRawUploadText('');
    } catch (err: any) {
      alert(`Invalid incident JSON: ${err.message}`);
    }
  };

  const handleGenerateSubmit = () => {
    onGenerateSynthetic({
      service: synthService,
      errorType: synthError,
      severity: synthSeverity
    });
    setIsGenerateModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-xl p-4">
        {/* Search & Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search incidents, services, IDs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 w-64 outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-transparent outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">All Severities</option>
              <option value="CRITICAL" className="bg-slate-900">Critical Only</option>
              <option value="HIGH" className="bg-slate-900">High Only</option>
            </select>
          </div>
        </div>

        {/* Action Buttons: Generate Synthetic & Upload */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setIsGenerateModalOpen(true)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Synthetic Incident</span>
          </button>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload JSON</span>
          </button>
        </div>
      </div>

      {/* Incident List & Selected Detail Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Incidents Cards */}
        <div className="lg:col-span-1 space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Available Scenarios ({filteredIncidents.length})
          </div>

          <div className="space-y-2.5 max-h-[720px] overflow-y-auto pr-1">
            {filteredIncidents.map((inc) => {
              const isSelected = inc.id === selectedIncidentId;
              return (
                <div
                  key={inc.id}
                  onClick={() => onSelectIncident(inc.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-blue-950/40 border-blue-500 shadow-md shadow-blue-500/10 ring-1 ring-blue-500/50'
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-blue-400">{inc.id}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        inc.severity === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {inc.severity}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-100 mt-1.5 line-clamp-1">
                    {inc.title}
                  </h3>

                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {inc.description}
                  </p>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                    <span className="font-mono text-indigo-300">{inc.affectedService}</span>
                    <span className="text-slate-500">{new Date(inc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Incident Deep Dive */}
        <div className="lg:col-span-2 space-y-4">
          {selectedIncident ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      {selectedIncident.id}
                    </span>
                    <span className="text-xs text-slate-400">Trace: <code className="text-slate-300">{selectedIncident.traceId}</code></span>
                  </div>
                  <h2 className="text-xl font-bold text-white mt-1.5 tracking-tight">
                    {selectedIncident.title}
                  </h2>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {selectedIncident.description}
                  </p>
                </div>

                <button
                  onClick={() => onSelectIncident(selectedIncident.id, 'reproduction')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 self-start transition-all shadow-md shadow-blue-600/20 active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  <span>Launch Reproduction</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Initial Symptoms vs Ground Truth Evaluation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Initial Observable Error */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-rose-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Observable Production Error</span>
                  </div>
                  <p className="font-mono text-xs text-rose-300 bg-rose-950/30 p-2.5 rounded border border-rose-900/40">
                    {selectedIncident.initialError}
                  </p>
                  <div className="text-[11px] text-slate-400 pt-1">
                    What on-call engineers saw in telemetry / APM alert.
                  </div>
                </div>

                {/* Ground Truth Evaluation Anchor */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-900/40 space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>Ground Truth (System Evaluation Anchor)</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {selectedIncident.groundTruth.rootCause}
                  </p>
                  <div className="text-[11px] text-slate-400 pt-1">
                    Trigger condition: <code className="text-indigo-300">{selectedIncident.groundTruth.triggerCondition}</code>
                  </div>
                </div>
              </div>

              {/* Telemetry Events Summary */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Ingested Telemetry Events ({selectedIncident.events.length})
                  </h4>
                  <button
                    onClick={() => onSelectIncident(selectedIncident.id, 'timeline')}
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                  >
                    View in Timeline View →
                  </button>
                </div>

                <div className="divide-y divide-slate-800/80 rounded-lg bg-slate-950/60 border border-slate-800 overflow-hidden text-xs">
                  {selectedIncident.events.map((evt) => (
                    <div key={evt.id} className="p-3 flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-[11px] font-bold text-indigo-300">{evt.service}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-medium">
                            {evt.eventType}
                          </span>
                          {evt.statusCode && (
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${evt.statusCode >= 500 ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                              HTTP {evt.statusCode}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-300">{evt.message}</p>
                      </div>
                      <span className="font-mono text-[10px] text-slate-500 whitespace-nowrap">
                        {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-96 flex items-center justify-center bg-slate-900 border border-slate-800 rounded-xl text-slate-500 text-sm">
              Select an incident from the list to view telemetry and digital twin details
            </div>
          )}
        </div>
      </div>

      {/* Generate Synthetic Incident Modal */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>Generate Synthetic Incident</span>
              </h3>
              <button
                onClick={() => setIsGenerateModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Microservice</label>
                <select
                  value={synthService}
                  onChange={(e) => setSynthService(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                >
                  <option value="inventory-service">inventory-service (Cloud Run)</option>
                  <option value="payment-service">payment-service (Cloud Run)</option>
                  <option value="order-service">order-service (Cloud Run)</option>
                  <option value="api-gateway">api-gateway (Envoy)</option>
                  <option value="inventory-db">inventory-db (Cloud SQL)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Defect Pattern / Error Signature</label>
                <input
                  type="text"
                  value={synthError}
                  onChange={(e) => setSynthError(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                  placeholder="e.g. Concurrency Lock Deadlock"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Incident Severity</label>
                <select
                  value={synthSeverity}
                  onChange={(e) => setSynthSeverity(e.target.value as IncidentSeverity)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                >
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MEDIUM">MEDIUM</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsGenerateModalOpen(false)}
                className="px-3.5 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateSubmit}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 shadow-md"
              >
                Synthesize & Load Incident
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Custom Incident JSON Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <span>Upload Incident JSON</span>
              </h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block text-slate-300 font-semibold">Paste Telemetry JSON Payload:</label>
              <textarea
                rows={10}
                value={rawUploadText}
                onChange={(e) => setRawUploadText(e.target.value)}
                placeholder={`{\n  "title": "Custom Service Crash",\n  "affectedService": "inventory-service",\n  "severity": "CRITICAL",\n  "initialError": "HTTP 500",\n  "events": []\n}`}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 font-mono text-slate-300 text-[11px] outline-none"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="px-3.5 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadSubmit}
                disabled={!rawUploadText.trim()}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 shadow-md disabled:opacity-50"
              >
                Ingest Payload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
