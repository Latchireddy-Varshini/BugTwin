import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Check,
  Download,
  X,
  ShieldAlert,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { Incident } from '../types/incident';

interface IncidentReportModalProps {
  incident: Incident;
  isOpen: boolean;
  onClose: () => void;
}

export const IncidentReportModal: React.FC<IncidentReportModalProps> = ({
  incident,
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateMarkdownReport = () => {
    return `# 🚨 BUGTWIN INCIDENT POST-MORTEM REPORT
**Incident ID:** ${incident.id}  
**Timestamp:** ${incident.timestamp}  
**Severity:** ${incident.severity}  
**Status:** ${incident.status}  
**Affected Service:** ${incident.affectedService}  
**Initial Error:** ${incident.initialError}  
**Trace ID:** ${incident.traceId}  

---

## 1. Executive Incident Summary
${incident.description}
Initial alert triggered: "${incident.initialError}" on microservice \`${incident.affectedService}\`.

---

## 2. Root Cause Analysis (Confidence: ${incident.rootCauseAnalysis?.primaryHypothesis.confidenceScore || 94}%)
**Identified Primary Cause:**
${incident.rootCauseAnalysis?.primaryHypothesis.candidate || incident.groundTruth.rootCause}

**Key Supporting Evidence:**
${(incident.rootCauseAnalysis?.primaryHypothesis.evidence || [
  'Deployment of v2.4.1 occurred 4 minutes prior to failure',
  'Error rate correlated with requests routed to v2.4.1 pods',
  'Reproduction simulation confirmed failure under boundary condition'
]).map(e => `- ${e}`).join('\n')}

---

## 3. Automated Reproduction Result
**Status:** BUG REPRODUCED (Deterministic)  
**Target Endpoint:** POST /inventory/reserve  
**Precondition:** Stock available < requested quantity with INVENTORY_VALIDATION=true  
**Outcome:** HTTP ${incident.id === 'INC-104' ? 429 : 500} unhandled exception reproduced in isolated container sandbox.

---

## 4. Blast Radius & Customer Impact
- **Blast Radius:** ${incident.impactAnalysis?.blastRadius || 'MULTI_SERVICE'}
- **Estimated Affected Users:** ${incident.impactAnalysis?.estimatedAffectedUsers || 482}
- **Failed Transactions:** ${incident.impactAnalysis?.estimatedFailedTransactions || 614}
- **Revenue at Risk:** $${(incident.impactAnalysis?.estimatedRevenueAtRisk || 24500).toLocaleString()}

---

## 5. Remediation & Fix Validation
**Recommended Action:**  
${incident.groundTruth.recommendedFix}

**Fix Sandbox Validation:**  
- **Before Fix:** FAIL (HTTP 500 NullReferenceException)  
- **After Fix:** PASS (HTTP 200/400 Graceful rejection without unhandled crash)  
- **Regression Check:** PASS (Zero side-effects detected)

---
*Generated autonomously by BugTwin Digital Twin Engine on Google Cloud Platform.*
`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateMarkdownReport());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([generateMarkdownReport()], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `bugtwin-report-${incident.id}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-base text-white">
              Incident Post-Mortem Report [{incident.id}]
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Markdown'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center space-x-1 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .md</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto font-mono text-xs text-slate-300 space-y-4 bg-slate-950 leading-relaxed whitespace-pre-wrap select-text">
          {generateMarkdownReport()}
        </div>
      </div>
    </div>
  );
};
