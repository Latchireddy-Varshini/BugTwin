export type IncidentSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type IncidentStatus = 'ACTIVE' | 'INVESTIGATING' | 'REPRODUCED' | 'RESOLVED';

export interface TelemetryEvent {
  id: string;
  timestamp: string;
  traceId: string;
  requestId: string;
  spanId?: string;
  service: string;
  version: string;
  eventType: 'USER_ACTION' | 'API_REQUEST' | 'API_RESPONSE' | 'SERVICE_LOG' | 'DB_QUERY' | 'DEPLOYMENT' | 'CONFIG_CHANGE' | 'ERROR';
  endpoint?: string;
  level?: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  statusCode?: number;
  latencyMs?: number;
  payload?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface ServiceNode {
  id: string;
  name: string;
  type: 'GATEWAY' | 'SERVICE' | 'DATABASE' | 'EXTERNAL_API' | 'QUEUE';
  version: string;
  status: 'HEALTHY' | 'DEGRADED' | 'FAILED' | 'SUSPICIOUS';
  trafficRps: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
  recentDeployment?: {
    version: string;
    timestamp: string;
    author: string;
    commitSha: string;
    diffSummary: string;
  };
  activeConfig: Record<string, any>;
  dependencies: string[];
}

export interface ServiceDependency {
  source: string;
  target: string;
  protocol: 'HTTP' | 'GRPC' | 'SQL' | 'PUBSUB';
  latencyMs: number;
  errorRate: number;
  status: 'NORMAL' | 'SLOW' | 'FAILING';
}

export interface DigitalTwinState {
  services: ServiceNode[];
  dependencies: ServiceDependency[];
  failureOriginId?: string;
  propagationPath: string[];
  reconstructedAt: string;
  environment: {
    region: string;
    cloudProvider: 'Google Cloud Platform';
    cluster: string;
    activeDeployments: number;
  };
}

export interface GroundTruth {
  rootCause: string;
  affectedService: string;
  faultyVersion?: string;
  triggerCondition: string;
  reproductionFeasibility: boolean;
  recommendedFix: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  affectedService: string;
  initialError: string;
  timestamp: string;
  traceId: string;
  requestId: string;
  events: TelemetryEvent[];
  groundTruth: GroundTruth;
  reconstructedState?: ReconstructedState;
  reproductionScenario?: ReproductionScenario;
  rootCauseAnalysis?: RootCauseAnalysis;
  impactAnalysis?: ImpactAnalysis;
  fixValidation?: FixValidationResult;
}

export interface ReconstructedState {
  timestamp: string;
  activeServices: {
    name: string;
    version: string;
    status: string;
    activeConfig: Record<string, any>;
  }[];
  databaseState: Record<string, any>;
  requestSequence: {
    step: number;
    service: string;
    action: string;
    payload: Record<string, any>;
    status: number;
  }[];
  suspiciousChanges: {
    type: 'DEPLOYMENT' | 'CONFIG' | 'DATA' | 'TRAFFIC';
    service: string;
    details: string;
    occurredAt: string;
    timeDeltaBeforeFailure: string;
  }[];
  environmentalConditions: {
    concurrencyLevel: number;
    memoryPressure: string;
    trafficAnomaly: boolean;
  };
}

export interface ReproductionScenario {
  scenarioId: string;
  targetService: string;
  targetVersion: string;
  inputs: {
    endpoint: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers: Record<string, string>;
    body: Record<string, any>;
  };
  preconditions: {
    databaseState: Record<string, any>;
    configuration: Record<string, any>;
    serviceVersion: string;
    concurrency?: number;
  };
  executionSteps: {
    step: number;
    action: string;
    expectedStatus: number;
    expectedOutcome: string;
  }[];
  expectedResult: {
    statusCode: number;
    errorSignature: string;
    failureComponent: string;
  };
  expectedOutcome?: {
    expectedStatusCode: number;
    failureSignature: string;
  };
  lastExecutionResult?: ReplayExecutionResult;
}

export interface ReplayLog {
  step: number;
  timestamp: string;
  message: string;
  status: 'SUCCESS' | 'WARNING' | 'ERROR';
  details?: Record<string, any>;
}

export interface ReplayExecutionResult {
  executionId: string;
  scenarioId: string;
  executedAt: string;
  durationMs: number;
  status: 'REPRODUCED' | 'NOT_REPRODUCED' | 'ERROR';
  actualStatusCode: number;
  actualErrorSignature: string;
  logs: ReplayLog[];
  stateDivergence: string[];
  reproductionConfidence: number;
  summary: string;
}

export interface Hypothesis {
  id: string;
  candidate: string;
  component: string;
  confidenceScore: number;
  evidence: string[];
  contradictoryEvidence: string[];
  isPrimary: boolean;
}

export interface RootCauseAnalysis {
  analyzedAt: string;
  primaryHypothesis: Hypothesis;
  alternativeHypotheses: Hypothesis[];
  evidenceScoreBreakdown: {
    temporalProximity: number;
    errorSpikeCorrelation: number;
    reproductionVerification: number;
    codeConfigDiffMatch: number;
    totalConfidence: number;
  };
  reasoningNarrative: string;
}

export interface ImpactAnalysis {
  analyzedAt: string;
  affectedComponents: string[];
  affectedEndpoints: string[];
  estimatedAffectedUsers: number;
  estimatedFailedTransactions: number;
  estimatedRevenueAtRisk: number;
  blastRadius: 'ISOLATED' | 'SERVICE_WIDE' | 'MULTI_SERVICE' | 'PLATFORM_WIDE';
  downstreamPropagation: {
    service: string;
    impactType: string;
    severity: IncidentSeverity;
  }[];
}

export interface FixCandidate {
  id: string;
  title: string;
  description: string;
  type: 'ROLLBACK' | 'CONFIG_CHANGE' | 'CODE_PATCH' | 'CIRCUIT_BREAKER';
  targetService: string;
  parameters: Record<string, any>;
}

export interface FixValidationResult {
  validatedAt: string;
  fixApplied: FixCandidate;
  beforeFixResult: {
    statusCode: number;
    status: 'FAIL';
    errorMessage: string;
  };
  afterFixResult: {
    statusCode: number;
    status: 'PASS';
    message: string;
    responseBody?: Record<string, any>;
  };
  verdict: 'PASS' | 'FAIL';
  explanation: string;
  regressionDetected: boolean;
}

export interface AgentExecutionState {
  agentId: string;
  agentName: string;
  status: 'IDLE' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  durationMs?: number;
  outputSummary?: string;
  modelUsed?: string;
}
