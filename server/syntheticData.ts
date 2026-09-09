import { Incident, TelemetryEvent, GroundTruth } from '../src/types/incident';

export const PREDEFINED_INCIDENTS: Incident[] = [
  {
    id: 'INC-101',
    title: 'Inventory Service v2.4.1 Boundary Check Regression',
    description: 'Order placement crashes with HTTP 500 when product quantity requested is greater than or equal to 8 with inventory under safety threshold.',
    severity: 'CRITICAL',
    status: 'ACTIVE',
    affectedService: 'inventory-service',
    initialError: 'Internal Server Error (500) - Unhandled NullReferenceException in InventoryValidationEngine',
    timestamp: '2026-09-05T01:42:15.000Z',
    traceId: 'TR-10001-INV-REG',
    requestId: 'REQ-78342',
    groundTruth: {
      rootCause: 'Defective threshold check logic in inventory-service v2.4.1 deployed at 01:38:00Z. When requested quantity exceeds available stock and INVENTORY_VALIDATION=true, the validator attempts to log an uninitialized metric object, throwing an unhandled NullPointer/NullReference instead of returning a clean 400 OutOfStock response.',
      affectedService: 'inventory-service',
      faultyVersion: 'v2.4.1',
      triggerCondition: 'productId="P1001", quantity=8, availableStock=5, version="v2.4.1", INVENTORY_VALIDATION=true',
      reproductionFeasibility: true,
      recommendedFix: 'Rollback inventory-service deployment from v2.4.1 to stable v2.4.0, or patch metric initialization in checkStockAvailability().'
    },
    events: [
      {
        id: 'EV-1001',
        timestamp: '2026-09-05T01:38:00.000Z',
        traceId: 'TR-DEPLOY-09',
        requestId: 'REQ-DEPLOY-441',
        service: 'inventory-service',
        version: 'v2.4.1',
        eventType: 'DEPLOYMENT',
        level: 'INFO',
        message: 'Deployment complete: inventory-service rolling update to image gcr.io/cloud-retail/inventory:v2.4.1',
        metadata: {
          previousVersion: 'v2.4.0',
          newVersion: 'v2.4.1',
          commitSha: '9e8a71b',
          author: 'dev-alex@retailtwin.internal',
          diff: 'Optimized stock threshold calculation & telemetry dispatch'
        }
      },
      {
        id: 'EV-1002',
        timestamp: '2026-09-05T01:38:45.000Z',
        traceId: 'TR-CONFIG-01',
        requestId: 'REQ-CFG-102',
        service: 'inventory-service',
        version: 'v2.4.1',
        eventType: 'CONFIG_CHANGE',
        level: 'INFO',
        message: 'Feature flag updated via Cloud RuntimeConfig: INVENTORY_VALIDATION=true',
        metadata: { key: 'INVENTORY_VALIDATION', oldValue: false, newValue: true }
      },
      {
        id: 'EV-1003',
        timestamp: '2026-09-05T01:42:10.120Z',
        traceId: 'TR-10001-INV-REG',
        requestId: 'REQ-78342',
        spanId: 'SPAN-01-GW',
        service: 'api-gateway',
        version: 'v1.12.0',
        eventType: 'USER_ACTION',
        level: 'INFO',
        endpoint: '/api/v1/checkout',
        message: 'Customer clicked "Confirm & Pay" for cart items',
        payload: { customerId: 'CUST-982', items: [{ productId: 'P1001', quantity: 8, unitPrice: 49.99 }] }
      },
      {
        id: 'EV-1004',
        timestamp: '2026-09-05T01:42:10.250Z',
        traceId: 'TR-10001-INV-REG',
        requestId: 'REQ-78342',
        spanId: 'SPAN-02-ORD',
        service: 'order-service',
        version: 'v3.1.0',
        eventType: 'API_REQUEST',
        level: 'INFO',
        endpoint: 'POST /orders',
        message: 'Order creation initiated for customer CUST-982',
        payload: { orderId: 'ORD-5541', items: [{ productId: 'P1001', quantity: 8 }] }
      },
      {
        id: 'EV-1005',
        timestamp: '2026-09-05T01:42:10.310Z',
        traceId: 'TR-10001-INV-REG',
        requestId: 'REQ-78342',
        spanId: 'SPAN-03-INV',
        service: 'inventory-service',
        version: 'v2.4.1',
        eventType: 'API_REQUEST',
        level: 'INFO',
        endpoint: 'POST /inventory/reserve',
        message: 'Stock reservation request received',
        payload: { productId: 'P1001', requiredQty: 8, warehouseId: 'WH-CENTRAL' }
      },
      {
        id: 'EV-1006',
        timestamp: '2026-09-05T01:42:10.350Z',
        traceId: 'TR-10001-INV-REG',
        requestId: 'REQ-78342',
        spanId: 'SPAN-04-DB',
        service: 'inventory-db',
        version: 'PostgreSQL-16',
        eventType: 'DB_QUERY',
        level: 'INFO',
        message: 'SELECT stock_available, reserved_qty FROM inventory_items WHERE product_id = "P1001" FOR UPDATE',
        metadata: { available: 5, reserved: 2, safetyStockLimit: 10 }
      },
      {
        id: 'EV-1007',
        timestamp: '2026-09-05T01:42:10.380Z',
        traceId: 'TR-10001-INV-REG',
        requestId: 'REQ-78342',
        spanId: 'SPAN-03-INV',
        service: 'inventory-service',
        version: 'v2.4.1',
        eventType: 'ERROR',
        level: 'ERROR',
        endpoint: 'POST /inventory/reserve',
        statusCode: 500,
        message: 'CRITICAL ERROR: NullReferenceException: Object reference not set to an instance of an object at InventoryValidator.RecordDeficitMetric() in /app/services/validator.ts:42',
        metadata: {
          stackTrace: 'Error: Cannot read property "increment" of undefined\n  at RecordDeficitMetric (/app/services/validator.ts:42:15)\n  at checkStockAvailability (/app/services/inventory.ts:114:9)\n  at handleReserveRequest (/app/controllers/reserve.ts:58:22)'
        }
      },
      {
        id: 'EV-1008',
        timestamp: '2026-09-05T01:42:10.420Z',
        traceId: 'TR-10001-INV-REG',
        requestId: 'REQ-78342',
        spanId: 'SPAN-02-ORD',
        service: 'order-service',
        version: 'v3.1.0',
        eventType: 'API_RESPONSE',
        level: 'ERROR',
        endpoint: 'POST /orders',
        statusCode: 500,
        message: 'Downstream dependency inventory-service returned HTTP 500: stock reservation aborted',
        latencyMs: 170
      },
      {
        id: 'EV-1009',
        timestamp: '2026-09-05T01:42:10.450Z',
        traceId: 'TR-10001-INV-REG',
        requestId: 'REQ-78342',
        spanId: 'SPAN-01-GW',
        service: 'api-gateway',
        version: 'v1.12.0',
        eventType: 'API_RESPONSE',
        level: 'ERROR',
        endpoint: '/api/v1/checkout',
        statusCode: 500,
        message: 'Client received HTTP 500 Internal Server Error: "Order failed - please try again later"',
        latencyMs: 330
      }
    ]
  },
  {
    id: 'INC-102',
    title: 'Payment Gateway Circuit-Breaker Cascade under Concurrency',
    description: 'During a flash deal surge, payment-service exceeded third-party gateway timeout, tripping the circuit breaker and failing all transactions.',
    severity: 'CRITICAL',
    status: 'ACTIVE',
    affectedService: 'payment-service',
    initialError: 'HTTP 504 Gateway Timeout - CircuitBreakerState: OPEN',
    timestamp: '2026-09-05T01:25:00.000Z',
    traceId: 'TR-20002-PAY-TIMEOUT',
    requestId: 'REQ-88912',
    groundTruth: {
      rootCause: 'Connection pool starvation in payment-service client when upstream provider latency exceeded 1500ms under 50 concurrent checkout workers. Circuit breaker tripped after 5 consecutive timeouts, cascading failure to order-service.',
      affectedService: 'payment-service',
      faultyVersion: 'v2.1.0',
      triggerCondition: 'concurrency=50, providerLatency=2200ms, timeoutConfig=1500ms',
      reproductionFeasibility: true,
      recommendedFix: 'Increase payment client socket timeout to 4000ms and expand maxPoolSize from 10 to 60.'
    },
    events: [
      {
        id: 'EV-2001',
        timestamp: '2026-09-05T01:24:30.000Z',
        traceId: 'TR-20002-PAY-TIMEOUT',
        requestId: 'REQ-88912',
        service: 'payment-service',
        version: 'v2.1.0',
        eventType: 'SERVICE_LOG',
        level: 'WARN',
        message: 'External gateway latency spiked to 2150ms (threshold: 1500ms)',
        metadata: { activeConnections: 10, maxPoolSize: 10, queueDepth: 42 }
      },
      {
        id: 'EV-2002',
        timestamp: '2026-09-05T01:24:50.000Z',
        traceId: 'TR-20002-PAY-TIMEOUT',
        requestId: 'REQ-88912',
        service: 'payment-service',
        version: 'v2.1.0',
        eventType: 'ERROR',
        level: 'ERROR',
        endpoint: 'POST /payments/authorize',
        statusCode: 504,
        message: 'TimeoutException: Request to StripeProcessor timed out after 1500ms',
        latencyMs: 1502
      },
      {
        id: 'EV-2003',
        timestamp: '2026-09-05T01:25:00.000Z',
        traceId: 'TR-20002-PAY-TIMEOUT',
        requestId: 'REQ-88912',
        service: 'payment-service',
        version: 'v2.1.0',
        eventType: 'CONFIG_CHANGE',
        level: 'WARN',
        message: 'Resilience4j CircuitBreaker [StripeGateway] transitioned from CLOSED to OPEN',
        metadata: { failureRate: '83.3%', failureThreshold: '50%' }
      },
      {
        id: 'EV-2004',
        timestamp: '2026-09-05T01:25:02.000Z',
        traceId: 'TR-20002-PAY-TIMEOUT',
        requestId: 'REQ-88912',
        service: 'order-service',
        version: 'v3.1.0',
        eventType: 'API_RESPONSE',
        level: 'ERROR',
        endpoint: 'POST /orders',
        statusCode: 503,
        message: 'Payment processing unavailable: CircuitBreaker is OPEN',
        latencyMs: 12
      }
    ]
  },
  {
    id: 'INC-103',
    title: 'Database Read-Replica Lag Inconsistent Inventory Check',
    description: 'Customers are allowed to order out-of-stock items because stock check reads from a replica lagging by 4.2 seconds behind the primary database.',
    severity: 'HIGH',
    status: 'ACTIVE',
    affectedService: 'inventory-db',
    initialError: 'HTTP 409 Conflict - InvariantViolation: Inventory count fell below zero (-1)',
    timestamp: '2026-09-05T01:10:00.000Z',
    traceId: 'TR-30003-DB-LAG',
    requestId: 'REQ-91024',
    groundTruth: {
      rootCause: 'Read traffic directed to Cloud SQL read-replica inventory-db-replica-01 while replication lag spiked past 4200ms due to heavy vacuum job. The preliminary stock check returned available=3, but master deduction failed because actual balance was 0.',
      affectedService: 'inventory-db',
      faultyVersion: 'PostgreSQL-16',
      triggerCondition: 'replicaLag=4200ms, masterStock=0, replicaStock=3',
      reproductionFeasibility: true,
      recommendedFix: 'Direct critical pre-checkout stock verification queries to the primary database with strong consistency or enforce max_standby_streaming_delay safeguards.'
    },
    events: [
      {
        id: 'EV-3001',
        timestamp: '2026-09-05T01:09:12.000Z',
        traceId: 'TR-30003-DB-LAG',
        requestId: 'REQ-91024',
        service: 'inventory-db',
        version: 'PostgreSQL-16',
        eventType: 'SERVICE_LOG',
        level: 'WARN',
        message: 'Replication lag monitor: Standby node lag exceeded 4000ms',
        metadata: { lagMs: 4230, standbyHost: 'inventory-replica-01' }
      },
      {
        id: 'EV-3002',
        timestamp: '2026-09-05T01:09:55.000Z',
        traceId: 'TR-30003-DB-LAG',
        requestId: 'REQ-91024',
        service: 'inventory-service',
        version: 'v2.4.0',
        eventType: 'DB_QUERY',
        level: 'INFO',
        message: 'Replica Query: SELECT stock FROM inventory WHERE sku = "SKU-992"',
        metadata: { returnedStock: 3, host: 'inventory-replica-01' }
      },
      {
        id: 'EV-3003',
        timestamp: '2026-09-05T01:10:00.000Z',
        traceId: 'TR-30003-DB-LAG',
        requestId: 'REQ-91024',
        service: 'inventory-service',
        version: 'v2.4.0',
        eventType: 'DB_QUERY',
        level: 'ERROR',
        message: 'Master Query: UPDATE inventory SET stock = stock - 1 WHERE sku = "SKU-992" AND stock >= 1',
        metadata: { rowsAffected: 0, actualMasterStock: 0 }
      },
      {
        id: 'EV-3004',
        timestamp: '2026-09-05T01:10:01.000Z',
        traceId: 'TR-30003-DB-LAG',
        requestId: 'REQ-91024',
        service: 'inventory-service',
        version: 'v2.4.0',
        eventType: 'ERROR',
        level: 'ERROR',
        statusCode: 409,
        message: 'InvariantViolation: Stock deduction failed on master after successful check on replica'
      }
    ]
  },
  {
    id: 'INC-104',
    title: 'Strict Rate-Limiter Configuration Lockout',
    description: 'Legitimate mobile app checkout traffic received HTTP 429 Too Many Requests due to incorrect window configuration in API Gateway.',
    severity: 'HIGH',
    status: 'ACTIVE',
    affectedService: 'api-gateway',
    initialError: 'HTTP 429 - Rate limit exceeded: 0 remaining in window',
    timestamp: '2026-09-05T00:55:00.000Z',
    traceId: 'TR-40004-RATELIMIT',
    requestId: 'REQ-66512',
    groundTruth: {
      rootCause: 'Terraform configuration deployment mistakenly changed RATE_LIMIT_WINDOW_SECONDS from 60 to 1 while keeping MAX_REQUESTS at 5, causing any user browsing items to immediately lock their session on checkout.',
      affectedService: 'api-gateway',
      faultyVersion: 'v1.12.0',
      triggerCondition: 'config RATE_LIMIT_WINDOW_SECONDS=1, requestBurstRate=6/sec',
      reproductionFeasibility: true,
      recommendedFix: 'Revert RATE_LIMIT_WINDOW_SECONDS to 60 or configure token bucket burst allowance of 50.'
    },
    events: [
      {
        id: 'EV-4001',
        timestamp: '2026-09-05T00:50:00.000Z',
        traceId: 'TR-TERRAFORM-82',
        requestId: 'REQ-TF-99',
        service: 'api-gateway',
        version: 'v1.12.0',
        eventType: 'CONFIG_CHANGE',
        level: 'INFO',
        message: 'Cloud Armor / Envoy Gateway config update applied',
        metadata: { key: 'RATE_LIMIT_WINDOW_SECONDS', oldValue: 60, newValue: 1 }
      },
      {
        id: 'EV-4002',
        timestamp: '2026-09-05T00:54:59.000Z',
        traceId: 'TR-40004-RATELIMIT',
        requestId: 'REQ-66512',
        service: 'api-gateway',
        version: 'v1.12.0',
        eventType: 'API_REQUEST',
        level: 'WARN',
        endpoint: '/api/v1/checkout',
        statusCode: 429,
        message: 'Client IP 198.51.100.44 exceeded rate limit of 5 requests/sec window',
        metadata: { currentCount: 6, maxAllowed: 5 }
      }
    ]
  },
  {
    id: 'INC-105',
    title: 'Checkout Race Condition SKU Double-Allocation',
    description: 'Concurrent requests for the last physical unit of high-demand item resulted in race condition and database lock deadlock.',
    severity: 'CRITICAL',
    status: 'ACTIVE',
    affectedService: 'order-service',
    initialError: 'HTTP 500 - Postgres deadlocked on concurrent transaction update',
    timestamp: '2026-09-05T00:30:00.000Z',
    traceId: 'TR-50005-RACE-COND',
    requestId: 'REQ-33109',
    groundTruth: {
      rootCause: 'Missing advisory lock or serializable isolation level when multiple order-service pods concurrently executed stock deduction without deterministic lock acquisition ordering on related order_items and inventory_items.',
      affectedService: 'order-service',
      faultyVersion: 'v3.1.0',
      triggerCondition: 'concurrentRequests=2, product="LIMITED-EDITION-01", stockRemaining=1',
      reproductionFeasibility: true,
      recommendedFix: 'Wrap reservation transaction with SELECT ... FOR UPDATE on inventory_items before creating order record or use distributed Redis Redlock.'
    },
    events: [
      {
        id: 'EV-5001',
        timestamp: '2026-09-05T00:29:59.900Z',
        traceId: 'TR-50005-RACE-COND',
        requestId: 'REQ-33109',
        service: 'order-service',
        version: 'v3.1.0',
        eventType: 'API_REQUEST',
        level: 'INFO',
        endpoint: 'POST /orders',
        message: 'Thread A initiated checkout for product LIMITED-EDITION-01',
        payload: { thread: 'TX-A', sku: 'LIMITED-EDITION-01', qty: 1 }
      },
      {
        id: 'EV-5002',
        timestamp: '2026-09-05T00:29:59.910Z',
        traceId: 'TR-50005-RACE-COND',
        requestId: 'REQ-33110',
        service: 'order-service',
        version: 'v3.1.0',
        eventType: 'API_REQUEST',
        level: 'INFO',
        endpoint: 'POST /orders',
        message: 'Thread B initiated checkout for product LIMITED-EDITION-01',
        payload: { thread: 'TX-B', sku: 'LIMITED-EDITION-01', qty: 1 }
      },
      {
        id: 'EV-5003',
        timestamp: '2026-09-05T00:30:00.050Z',
        traceId: 'TR-50005-RACE-COND',
        requestId: 'REQ-33109',
        service: 'inventory-db',
        version: 'PostgreSQL-16',
        eventType: 'ERROR',
        level: 'ERROR',
        message: 'ERROR: deadlock detected. Process 4184 waits for ExclusiveLock on tuple (4, 12); blocked by process 4185.',
        metadata: { code: '40P01', query: 'UPDATE inventory_items SET quantity = quantity - 1 WHERE sku = "LIMITED-EDITION-01"' }
      }
    ]
  }
];

export function generateSyntheticIncident(params?: {
  service?: string;
  errorType?: string;
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}): Incident {
  const service = params?.service || 'inventory-service';
  const severity = params?.severity || 'CRITICAL';
  const id = `INC-${Math.floor(100 + Math.random() * 900)}`;
  const traceId = `TR-${Math.floor(10000 + Math.random() * 90000)}-SYNTH`;
  const requestId = `REQ-${Math.floor(10000 + Math.random() * 90000)}`;
  const now = new Date().toISOString();
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  return {
    id,
    title: `Synthetic ${service} Regression (${params?.errorType || 'NullPointer Exception'})`,
    description: `Automated synthetic incident generated for microservice ${service}. Client requests trigger unexpected error due to runtime regression.`,
    severity,
    status: 'ACTIVE',
    affectedService: service,
    initialError: `HTTP 500 Internal Server Error - ${service} crashed during request handling`,
    timestamp: now,
    traceId,
    requestId,
    groundTruth: {
      rootCause: `Code regression in ${service} v2.4.1 handling edge condition under load.`,
      affectedService: service,
      faultyVersion: 'v2.4.1',
      triggerCondition: `endpoint="/api/action", service="${service}", version="v2.4.1"`,
      reproductionFeasibility: true,
      recommendedFix: `Revert ${service} to v2.4.0 or patch error handling.`
    },
    events: [
      {
        id: `EV-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: fiveMinAgo,
        traceId: `TR-DEPLOY-${Math.floor(100 + Math.random() * 900)}`,
        requestId: `REQ-DEP-${Math.floor(100 + Math.random() * 900)}`,
        service,
        version: 'v2.4.1',
        eventType: 'DEPLOYMENT',
        level: 'INFO',
        message: `Deployment of ${service} v2.4.1 completed across 4 pods`,
        metadata: { author: 'ci-bot@retailtwin.internal', commit: '7b28a1c' }
      },
      {
        id: `EV-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: now,
        traceId,
        requestId,
        service: 'api-gateway',
        version: 'v1.12.0',
        eventType: 'API_REQUEST',
        level: 'INFO',
        endpoint: '/api/v1/resource',
        message: 'Inbound customer request dispatched'
      },
      {
        id: `EV-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: now,
        traceId,
        requestId,
        service,
        version: 'v2.4.1',
        eventType: 'ERROR',
        level: 'ERROR',
        endpoint: '/api/v1/resource',
        statusCode: 500,
        message: `Unhandled exception in ${service} handler: logic error at boundary condition`
      }
    ]
  };
}
