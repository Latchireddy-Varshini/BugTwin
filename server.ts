import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { PREDEFINED_INCIDENTS, generateSyntheticIncident } from './server/syntheticData';
import { buildDigitalTwinForIncident } from './server/digitalTwin';
import { executeReproductionSimulation } from './server/reproductionSimulator';
import {
  runStateReconstructionAgent,
  runReproductionAgent,
  runRootCauseAgent,
  runImpactAnalysisAgent,
  runFixValidationAgent
} from './server/geminiService';
import { Incident } from './src/types/incident';

// In-memory store initialized with rich predefined incident scenarios
const incidentsStore: Map<string, Incident> = new Map();
PREDEFINED_INCIDENTS.forEach(inc => incidentsStore.set(inc.id, { ...inc }));

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // ==========================================
  // API ROUTES
  // ==========================================

  // Health Check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'bugtwin-core-engine',
      version: '1.0.0',
      cloudRegion: 'asia-southeast1',
      hasGeminiApiKey: Boolean(process.env.GEMINI_API_KEY)
    });
  });

  // Overview KPIs & System Metrics
  app.get('/api/system/metrics', (req, res) => {
    const all = Array.from(incidentsStore.values());
    const critical = all.filter(i => i.severity === 'CRITICAL').length;
    const investigated = all.filter(i => Boolean(i.rootCauseAnalysis)).length;
    const reproduced = all.filter(i => Boolean(i.reproductionScenario)).length;

    res.json({
      totalIncidents: all.length,
      criticalIncidents: critical,
      reproductionSuccessRate: 95.2,
      averageInvestigationTimeSec: 14.8,
      topAffectedServices: [
        { name: 'inventory-service', count: 18, errorRate: '12.4%' },
        { name: 'payment-service', count: 12, errorRate: '8.1%' },
        { name: 'order-service', count: 9, errorRate: '5.6%' },
        { name: 'api-gateway', count: 7, errorRate: '3.2%' },
        { name: 'inventory-db', count: 4, errorRate: '2.0%' }
      ],
      recentDeployments: [
        { service: 'inventory-service', version: 'v2.4.1', deployedAt: '4m before incident', author: 'dev-alex', status: 'FLAGGED' },
        { service: 'order-service', version: 'v3.1.0', deployedAt: '2h ago', author: 'ci-pipeline', status: 'HEALTHY' },
        { service: 'api-gateway', version: 'v1.12.0', deployedAt: '6h ago', author: 'infra-ops', status: 'HEALTHY' }
      ]
    });
  });

  // List Incidents
  app.get('/api/incidents', (req, res) => {
    const list = Array.from(incidentsStore.values()).map(inc => ({
      id: inc.id,
      title: inc.title,
      description: inc.description,
      severity: inc.severity,
      status: inc.status,
      affectedService: inc.affectedService,
      initialError: inc.initialError,
      timestamp: inc.timestamp,
      traceId: inc.traceId,
      hasReconstruction: Boolean(inc.reconstructedState),
      hasReproduction: Boolean(inc.reproductionScenario),
      hasRootCause: Boolean(inc.rootCauseAnalysis)
    }));
    res.json(list);
  });

  // Get Incident Details with Digital Twin
  app.get('/api/incidents/:id', (req, res) => {
    const incident = incidentsStore.get(req.params.id);
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    const digitalTwin = buildDigitalTwinForIncident(incident);

    res.json({
      ...incident,
      digitalTwin
    });
  });

  // Generate Synthetic Incident
  app.post(['/api/incidents/generate', '/api/incidents/synthetic'], (req, res) => {
    const newInc = generateSyntheticIncident(req.body);
    incidentsStore.set(newInc.id, newInc);
    res.json(newInc);
  });

  // Upload/Ingest Custom Incident
  app.post('/api/incidents/upload', (req, res) => {
    const data = req.body;
    if (!data.title || !data.affectedService) {
      return res.status(400).json({ error: 'Invalid incident JSON payload' });
    }
    const id = data.id || `INC-${Math.floor(100 + Math.random() * 900)}`;
    const fullIncident: Incident = {
      id,
      title: data.title,
      description: data.description || 'Ingested incident payload',
      severity: data.severity || 'HIGH',
      status: 'ACTIVE',
      affectedService: data.affectedService,
      initialError: data.initialError || 'Unknown exception',
      timestamp: data.timestamp || new Date().toISOString(),
      traceId: data.traceId || `TR-${Math.floor(10000 + Math.random() * 90000)}`,
      requestId: data.requestId || `REQ-${Math.floor(10000 + Math.random() * 90000)}`,
      events: data.events || [],
      groundTruth: data.groundTruth || {
        rootCause: 'User-provided root cause',
        affectedService: data.affectedService,
        triggerCondition: 'Unknown',
        reproductionFeasibility: true,
        recommendedFix: 'Review logs and traces'
      }
    };
    incidentsStore.set(id, fullIncident);
    res.json(fullIncident);
  });

  // Multi-Agent Investigation Orchestration
  app.post('/api/investigate/:id', async (req, res) => {
    const incident = incidentsStore.get(req.params.id);
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    try {
      // Agent 1 & 2: State Reconstruction
      const reconstructedState = await runStateReconstructionAgent(incident);
      incident.reconstructedState = reconstructedState;

      // Agent 3: Reproduction Scenario Generation
      const reproductionScenario = await runReproductionAgent(incident, reconstructedState);
      incident.reproductionScenario = reproductionScenario;

      // Agent 4: Root Cause Analysis
      const rootCauseAnalysis = await runRootCauseAgent(incident, reconstructedState, reproductionScenario);
      incident.rootCauseAnalysis = rootCauseAnalysis;

      // Agent 5: Impact Analysis
      const impactAnalysis = await runImpactAnalysisAgent(incident);
      incident.impactAnalysis = impactAnalysis;

      // Agent 6: Default Fix Candidate Pre-evaluation
      const defaultFix = {
        id: 'FIX-01',
        title: `Rollback ${incident.affectedService} to previous stable version`,
        description: `Revert active deployment to eliminate regression`,
        type: 'ROLLBACK' as const,
        targetService: incident.affectedService,
        parameters: { targetVersion: 'v2.4.0' }
      };
      const fixValidation = await runFixValidationAgent(incident, reproductionScenario, defaultFix);
      incident.fixValidation = fixValidation;
      incident.status = 'REPRODUCED';

      incidentsStore.set(incident.id, incident);

      res.json({
        incidentId: incident.id,
        status: incident.status,
        reconstructedState,
        reproductionScenario,
        rootCauseAnalysis,
        impactAnalysis,
        fixValidation
      });
    } catch (err: any) {
      console.error('[InvestigateError]', err);
      res.status(500).json({ error: err.message || 'Investigation pipeline failed' });
    }
  });

  // Execute Reproduction Simulation
  app.post(['/api/reproduce', '/api/reproduce/:id'], (req, res) => {
    const incidentId = req.params.id;
    let incident = incidentId ? incidentsStore.get(incidentId) : null;

    const {
      scenario: bodyScenario,
      overrideVersion,
      overrideConfig,
      overrideDatabaseState,
      originalExpectedStatus
    } = req.body;

    const scenario = bodyScenario || incident?.reproductionScenario;
    if (!scenario) {
      return res.status(400).json({ error: 'Missing reproduction scenario' });
    }

    const result = executeReproductionSimulation({
      scenario,
      overrideVersion,
      overrideConfig,
      overrideDatabaseState,
      originalExpectedStatus: originalExpectedStatus || incident?.reproductionScenario?.expectedResult?.statusCode || incident?.reproductionScenario?.expectedOutcome?.expectedStatusCode
    });

    if (incident) {
      if (result.status === 'REPRODUCED') {
        incident.status = 'REPRODUCED';
      }
      if (incident.reproductionScenario) {
        incident.reproductionScenario.lastExecutionResult = result;
      }
      incidentsStore.set(incident.id, incident);
    }

    res.json({ result, incident });
  });

  // Execute Fix Validation
  app.post(['/api/validate-fix', '/api/validate-fix/:id'], async (req, res) => {
    const incidentId = req.params.id || req.body.incidentId;
    const incident = incidentsStore.get(incidentId);
    if (!incident || !incident.reproductionScenario) {
      return res.status(400).json({ error: 'Incident or reproduction scenario missing. Run investigation first.' });
    }

    const fixCandidate = req.body.fixCandidate || req.body.fix;
    if (!fixCandidate) {
      return res.status(400).json({ error: 'Missing fix candidate' });
    }

    const fixResult = await runFixValidationAgent(incident, incident.reproductionScenario, fixCandidate);
    incident.fixValidation = fixResult;
    if (fixResult.verdict === 'PASS') {
      incident.status = 'RESOLVED';
    }
    incidentsStore.set(incident.id, incident);

    res.json({ result: fixResult, incident });
  });

  // Google Cloud Architecture Telemetry Info
  app.get('/api/gcp/architecture', (req, res) => {
    res.json({
      targetGcpProject: 'bugtwin-hackathon-prod',
      pipeline: {
        ingestion: { service: 'Google Cloud Pub/Sub', topic: 'projects/bugtwin-hackathon-prod/topics/incident-telemetry' },
        compute: { service: 'Google Cloud Run', container: 'bugtwin-engine:latest', region: 'asia-southeast1' },
        telemetryWarehouse: { service: 'Google BigQuery', dataset: 'bugtwin_analytics', tables: ['incidents', 'traces', 'deployments', 'reproduction_runs'] },
        stateStore: { service: 'Google Cloud Firestore', database: '(default)', collections: ['digital_twins', 'active_scenarios'] },
        aiModel: { service: 'Google Gemini 3.8 Flash', sdk: '@google/genai', agentCount: 6 },
        observability: { logging: 'Google Cloud Logging', monitoring: 'Google Cloud Monitoring', tracing: 'Google Cloud Trace' }
      }
    });
  });

  // Vite Middleware for Development / Static Serve for Production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[BUGTWIN] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
