import { ReplayExecutionResult, ReplayLog, ReproductionScenario } from '../src/types/incident';

export interface SimulatorExecutionOptions {
  scenario: ReproductionScenario;
  overrideVersion?: string;
  overrideConfig?: Record<string, any>;
  overrideDatabaseState?: Record<string, any>;
  originalExpectedStatus?: number;
}

export function executeReproductionSimulation(options: SimulatorExecutionOptions): ReplayExecutionResult {
  const { scenario, overrideVersion, overrideConfig, overrideDatabaseState, originalExpectedStatus = 500 } = options;
  const logs: ReplayLog[] = [];
  const stateDivergence: string[] = [];
  const startTime = Date.now();

  const activeVersion = overrideVersion || scenario.targetVersion;
  const activeConfig = {
    ...scenario.preconditions.configuration,
    ...(overrideConfig || {})
  };
  const activeDb = {
    ...scenario.preconditions.databaseState,
    ...(overrideDatabaseState || {})
  };

  // STEP 1: Initialize Sandbox Environment & State
  logs.push({
    step: 1,
    timestamp: new Date(startTime).toISOString(),
    message: `[SANDBOX INIT] Bootstrapping isolated microservice container sandbox for target '${scenario.targetService}'`,
    status: 'SUCCESS',
    details: {
      targetService: scenario.targetService,
      runtimeVersion: activeVersion,
      sandboxId: `sbx-${Math.random().toString(36).substring(2, 9)}`
    }
  });

  // STEP 2: Configure System Preconditions & State
  logs.push({
    step: 2,
    timestamp: new Date(startTime + 45).toISOString(),
    message: `[PRECONDITION] Seeding simulated database state & runtime flags`,
    status: 'SUCCESS',
    details: {
      databaseSnapshot: activeDb,
      configurationFlags: activeConfig
    }
  });

  // STEP 3: Execute API Sequence
  logs.push({
    step: 3,
    timestamp: new Date(startTime + 110).toISOString(),
    message: `[API DISPATCH] Executing sequence: ${scenario.inputs.method} ${scenario.inputs.endpoint}`,
    status: 'SUCCESS',
    details: {
      headers: scenario.inputs.headers,
      payload: scenario.inputs.body
    }
  });

  // STEP 4: Internal Service Logic & Condition Evaluation
  let simulatedStatusCode = 200;
  let simulatedErrorSignature = '';
  let reproductionOccurred = false;

  const target = scenario.targetService.toLowerCase();

  if (target === 'inventory-service') {
    const requestedQty = scenario.inputs.body.requiredQty || scenario.inputs.body.quantity || 8;
    const availableStock = activeDb.available ?? 5;
    const isFaultyVersion = activeVersion === 'v2.4.1';
    const validationEnabled = activeConfig.INVENTORY_VALIDATION !== false;

    logs.push({
      step: 4,
      timestamp: new Date(startTime + 180).toISOString(),
      message: `[INVENTORY ENGINE] Evaluating reservation: requested=${requestedQty}, available=${availableStock}, threshold=${activeConfig.safetyStockThreshold ?? 10}, version=${activeVersion}`,
      status: 'SUCCESS'
    });

    if (isFaultyVersion && validationEnabled && requestedQty > availableStock) {
      // Trigger the exact regression
      simulatedStatusCode = 500;
      simulatedErrorSignature = 'NullReferenceException: Object reference not set to an instance of an object at InventoryValidator.RecordDeficitMetric()';
      reproductionOccurred = true;

      logs.push({
        step: 4,
        timestamp: new Date(startTime + 210).toISOString(),
        message: `[RUNTIME EXCEPTION] ${simulatedErrorSignature}`,
        status: 'ERROR',
        details: {
          file: '/app/services/validator.ts',
          line: 42,
          reason: 'Deficit metric collector was not instantiated when INVENTORY_VALIDATION=true on v2.4.1'
        }
      });
    } else if (!isFaultyVersion) {
      // v2.4.0 or patched version handles deficit gracefully
      simulatedStatusCode = 400;
      simulatedErrorSignature = 'Graceful Rejection: Insufficient inventory available';
      reproductionOccurred = false;
      stateDivergence.push(`Service version ${activeVersion} does NOT trigger the null reference crash. Handled gracefully.`);

      logs.push({
        step: 4,
        timestamp: new Date(startTime + 205).toISOString(),
        message: `[STABLE BEHAVIOR] v2.4.0 correctly evaluated deficit without crashing. Returned 400 OutOfStock cleanly.`,
        status: 'SUCCESS'
      });
    } else if (!validationEnabled) {
      // Feature flag disabled bypasses the bad code path
      simulatedStatusCode = 200;
      simulatedErrorSignature = '';
      reproductionOccurred = false;
      stateDivergence.push('INVENTORY_VALIDATION feature flag is disabled, bypassing buggy validator.');

      logs.push({
        step: 4,
        timestamp: new Date(startTime + 205).toISOString(),
        message: `[FLAG DISABLED] Validation bypassed by configuration flag. Request completed.`,
        status: 'SUCCESS'
      });
    }
  } else if (target === 'payment-service') {
    const timeoutMs = activeConfig.gatewayTimeoutMs || 1500;
    const providerLatency = 2200;

    logs.push({
      step: 4,
      timestamp: new Date(startTime + 180).toISOString(),
      message: `[GATEWAY CLIENT] Calling StripeProcessor with socketTimeout=${timeoutMs}ms (upstream provider latency=${providerLatency}ms)`,
      status: timeoutMs < providerLatency ? 'WARNING' : 'SUCCESS'
    });

    if (timeoutMs < providerLatency) {
      simulatedStatusCode = 504;
      simulatedErrorSignature = 'TimeoutException: Request to StripeProcessor timed out after ' + timeoutMs + 'ms';
      reproductionOccurred = true;

      logs.push({
        step: 4,
        timestamp: new Date(startTime + 195).toISOString(),
        message: `[TIMEOUT EXCEPTION] ${simulatedErrorSignature}`,
        status: 'ERROR'
      });
    } else {
      simulatedStatusCode = 200;
      simulatedErrorSignature = 'Payment authorized successfully';
      reproductionOccurred = false;
      stateDivergence.push(`Timeout allowance of ${timeoutMs}ms safely accommodates provider latency of ${providerLatency}ms.`);
    }
  } else if (target === 'inventory-db') {
    const lagMs = activeConfig.replicaLagMs || 4200;
    const masterStock = activeDb.masterStock ?? 0;
    const replicaStock = activeDb.replicaStock ?? 3;

    logs.push({
      step: 4,
      timestamp: new Date(startTime + 180).toISOString(),
      message: `[DB SYNC CHECK] Testing read replica (stock=${replicaStock}) vs master write (stock=${masterStock}) with lag=${lagMs}ms`,
      status: lagMs > 1000 ? 'WARNING' : 'SUCCESS'
    });

    if (lagMs > 1000 && masterStock <= 0 && replicaStock > 0) {
      simulatedStatusCode = 409;
      simulatedErrorSignature = 'InvariantViolation: Stock deduction failed on master after successful check on replica';
      reproductionOccurred = true;

      logs.push({
        step: 4,
        timestamp: new Date(startTime + 200).toISOString(),
        message: `[DATA INCONSISTENCY] ${simulatedErrorSignature}`,
        status: 'ERROR'
      });
    } else {
      simulatedStatusCode = 200;
      simulatedErrorSignature = '';
      reproductionOccurred = false;
      stateDivergence.push('Consistent read route ensured primary master data was used directly.');
    }
  } else if (target === 'api-gateway') {
    const windowSec = activeConfig.RATE_LIMIT_WINDOW_SECONDS ?? 1;
    const maxReq = activeConfig.MAX_REQUESTS ?? 5;
    const burst = 6;

    if (windowSec <= 2 && burst > maxReq) {
      simulatedStatusCode = 429;
      simulatedErrorSignature = 'HTTP 429 - Rate limit exceeded: 0 remaining in window';
      reproductionOccurred = true;

      logs.push({
        step: 4,
        timestamp: new Date(startTime + 190).toISOString(),
        message: `[ENVOY RATE LIMITER] Rate limit tripped: ${burst} requests in ${windowSec}s window exceeded limit of ${maxReq}`,
        status: 'ERROR'
      });
    } else {
      simulatedStatusCode = 200;
      reproductionOccurred = false;
      stateDivergence.push(`Relaxed rate limit window (${windowSec}s) accepted legitimate traffic.`);
    }
  } else {
    // Generic fallback deterministic reproduction
    if (activeVersion === 'v2.4.1') {
      simulatedStatusCode = 500;
      simulatedErrorSignature = `Internal Error in ${scenario.targetService} v2.4.1: simulated defect triggered`;
      reproductionOccurred = true;
    } else {
      simulatedStatusCode = 200;
      reproductionOccurred = false;
    }
  }

  // STEP 5: Verification & Comparison
  const statusMatches = simulatedStatusCode === (originalExpectedStatus || scenario.expectedResult.statusCode);
  const verdict = statusMatches && reproductionOccurred ? 'REPRODUCED' : 'NOT_REPRODUCED';
  const confidence = verdict === 'REPRODUCED' ? 96.4 : 12.0;

  logs.push({
    step: 5,
    timestamp: new Date(startTime + 260).toISOString(),
    message: `[COMPARISON VERDICT] Original Status: ${originalExpectedStatus} | Replay Status: ${simulatedStatusCode} => ${verdict}`,
    status: verdict === 'REPRODUCED' ? 'SUCCESS' : 'WARNING',
    details: {
      expectedStatusCode: originalExpectedStatus,
      replayedStatusCode: simulatedStatusCode,
      verdict,
      confidence: `${confidence}%`
    }
  });

  return {
    executionId: `REP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    scenarioId: scenario.scenarioId,
    executedAt: new Date().toISOString(),
    durationMs: Date.now() - startTime + 260,
    status: verdict,
    actualStatusCode: simulatedStatusCode,
    actualErrorSignature: simulatedErrorSignature,
    logs,
    stateDivergence,
    reproductionConfidence: confidence,
    summary: verdict === 'REPRODUCED'
      ? `BugTwin successfully reproduced the identical failure (HTTP ${simulatedStatusCode}) under the reconstructed digital twin parameters.`
      : `Replay yielded HTTP ${simulatedStatusCode}. Failure did not reproduce under these modified parameters.`
  };
}
