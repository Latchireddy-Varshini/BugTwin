import { DigitalTwinState, Incident, ServiceNode, ServiceDependency } from '../src/types/incident';

export function buildDigitalTwinForIncident(incident: Incident): DigitalTwinState {
  const isInventoryFault = incident.affectedService === 'inventory-service';
  const isPaymentFault = incident.affectedService === 'payment-service';
  const isDbFault = incident.affectedService === 'inventory-db';
  const isGatewayFault = incident.affectedService === 'api-gateway';
  const isOrderFault = incident.affectedService === 'order-service';

  const services: ServiceNode[] = [
    {
      id: 'client-web',
      name: 'Web Client / Mobile App',
      type: 'EXTERNAL_API',
      version: 'v4.8.2',
      status: 'HEALTHY',
      trafficRps: 180,
      errorRate: incident.severity === 'CRITICAL' ? 14.2 : 4.1,
      cpuUsage: 12,
      memoryUsage: 28,
      activeConfig: { platform: 'React/Next.js PWA', telemetry: 'OpenTelemetry Web' },
      dependencies: ['api-gateway']
    },
    {
      id: 'api-gateway',
      name: 'API Gateway (Envoy / Cloud Armor)',
      type: 'GATEWAY',
      version: 'v1.12.0',
      status: isGatewayFault ? 'FAILED' : (incident.severity === 'CRITICAL' ? 'DEGRADED' : 'HEALTHY'),
      trafficRps: 180,
      errorRate: isGatewayFault ? 88.5 : (incident.severity === 'CRITICAL' ? 12.4 : 0.8),
      cpuUsage: 45,
      memoryUsage: 54,
      recentDeployment: isGatewayFault ? {
        version: 'v1.12.0',
        timestamp: '15m ago',
        author: 'infra-security@retailtwin.internal',
        commitSha: '6b490f2',
        diffSummary: 'Rate limiting rules updated: strict window applied'
      } : undefined,
      activeConfig: {
        timeoutMs: 3000,
        rateLimitRps: isGatewayFault ? 5 : 500,
        corsEnabled: true,
        authProvider: 'Cloud Identity'
      },
      dependencies: ['auth-service', 'order-service']
    },
    {
      id: 'auth-service',
      name: 'Auth Service (OAuth / IAM)',
      type: 'SERVICE',
      version: 'v2.0.1',
      status: 'HEALTHY',
      trafficRps: 190,
      errorRate: 0.1,
      cpuUsage: 22,
      memoryUsage: 35,
      activeConfig: { jwtExpirySec: 3600, keyRotationHours: 24 },
      dependencies: []
    },
    {
      id: 'order-service',
      name: 'Order Service (Cloud Run)',
      type: 'SERVICE',
      version: 'v3.1.0',
      status: isOrderFault ? 'FAILED' : (isInventoryFault || isPaymentFault || isDbFault ? 'DEGRADED' : 'HEALTHY'),
      trafficRps: 65,
      errorRate: (isInventoryFault || isPaymentFault || isDbFault || isOrderFault) ? 38.2 : 0.2,
      cpuUsage: 68,
      memoryUsage: 62,
      activeConfig: {
        orchestration: 'Saga Pattern',
        circuitBreakerEnabled: true,
        maxRetries: 2
      },
      dependencies: ['inventory-service', 'payment-service', 'notification-service']
    },
    {
      id: 'inventory-service',
      name: 'Inventory Service (Cloud Run)',
      type: 'SERVICE',
      version: isInventoryFault ? 'v2.4.1' : 'v2.4.0',
      status: isInventoryFault ? 'FAILED' : (isDbFault ? 'DEGRADED' : 'HEALTHY'),
      trafficRps: 90,
      errorRate: isInventoryFault ? 76.4 : (isDbFault ? 31.0 : 0.4),
      cpuUsage: 84,
      memoryUsage: 79,
      recentDeployment: isInventoryFault ? {
        version: 'v2.4.1',
        timestamp: '4m before incident',
        author: 'dev-alex@retailtwin.internal',
        commitSha: '9e8a71b',
        diffSummary: 'Optimized stock threshold calculation & telemetry dispatch'
      } : undefined,
      activeConfig: {
        INVENTORY_VALIDATION: isInventoryFault ? true : false,
        safetyStockThreshold: 10,
        cacheTtlSeconds: 30
      },
      dependencies: ['inventory-db']
    },
    {
      id: 'inventory-db',
      name: 'Inventory Cloud SQL (PostgreSQL)',
      type: 'DATABASE',
      version: 'PostgreSQL-16',
      status: isDbFault ? 'FAILED' : 'HEALTHY',
      trafficRps: 140,
      errorRate: isDbFault ? 42.0 : 0.05,
      cpuUsage: isDbFault ? 92 : 38,
      memoryUsage: 65,
      activeConfig: {
        poolSize: 50,
        replicationMode: 'Asynchronous Read-Replica',
        replicaLagSeconds: isDbFault ? 4.2 : 0.04
      },
      dependencies: []
    },
    {
      id: 'payment-service',
      name: 'Payment Service (Cloud Run)',
      type: 'SERVICE',
      version: 'v2.1.0',
      status: isPaymentFault ? 'FAILED' : 'HEALTHY',
      trafficRps: 45,
      errorRate: isPaymentFault ? 91.5 : 0.2,
      cpuUsage: 58,
      memoryUsage: 60,
      activeConfig: {
        gatewayTimeoutMs: isPaymentFault ? 1500 : 4000,
        circuitBreakerThreshold: 5,
        currency: 'USD'
      },
      dependencies: ['stripe-gateway']
    },
    {
      id: 'stripe-gateway',
      name: 'External Payment Gateway (Stripe)',
      type: 'EXTERNAL_API',
      version: 'API-v2024-04',
      status: isPaymentFault ? 'DEGRADED' : 'HEALTHY',
      trafficRps: 45,
      errorRate: isPaymentFault ? 25.0 : 0.02,
      cpuUsage: 15,
      memoryUsage: 20,
      activeConfig: { endpoint: 'https://api.stripe.com/v1/charges' },
      dependencies: []
    },
    {
      id: 'notification-service',
      name: 'Notification Service (Pub/Sub)',
      type: 'QUEUE',
      version: 'v1.4.0',
      status: 'HEALTHY',
      trafficRps: 35,
      errorRate: 0.1,
      cpuUsage: 18,
      memoryUsage: 25,
      activeConfig: { topic: 'order-events', batchSize: 20 },
      dependencies: []
    }
  ];

  const dependencies: ServiceDependency[] = [
    { source: 'client-web', target: 'api-gateway', protocol: 'HTTP', latencyMs: 25, errorRate: 2.1, status: 'NORMAL' },
    { source: 'api-gateway', target: 'auth-service', protocol: 'HTTP', latencyMs: 12, errorRate: 0.1, status: 'NORMAL' },
    {
      source: 'api-gateway',
      target: 'order-service',
      protocol: 'HTTP',
      latencyMs: (isInventoryFault || isPaymentFault) ? 420 : 65,
      errorRate: (isInventoryFault || isPaymentFault || isOrderFault) ? 35.0 : 0.2,
      status: (isInventoryFault || isPaymentFault || isOrderFault) ? 'FAILING' : 'NORMAL'
    },
    {
      source: 'order-service',
      target: 'inventory-service',
      protocol: 'HTTP',
      latencyMs: isInventoryFault ? 310 : 35,
      errorRate: isInventoryFault ? 78.0 : 0.3,
      status: isInventoryFault ? 'FAILING' : 'NORMAL'
    },
    {
      source: 'inventory-service',
      target: 'inventory-db',
      protocol: 'SQL',
      latencyMs: isDbFault ? 1250 : 15,
      errorRate: isDbFault ? 45.0 : 0.05,
      status: isDbFault ? 'FAILING' : 'NORMAL'
    },
    {
      source: 'order-service',
      target: 'payment-service',
      protocol: 'HTTP',
      latencyMs: isPaymentFault ? 1800 : 85,
      errorRate: isPaymentFault ? 90.0 : 0.1,
      status: isPaymentFault ? 'FAILING' : 'NORMAL'
    },
    {
      source: 'payment-service',
      target: 'stripe-gateway',
      protocol: 'HTTP',
      latencyMs: isPaymentFault ? 2200 : 140,
      errorRate: isPaymentFault ? 60.0 : 0.05,
      status: isPaymentFault ? 'SLOW' : 'NORMAL'
    },
    {
      source: 'order-service',
      target: 'notification-service',
      protocol: 'PUBSUB',
      latencyMs: 8,
      errorRate: 0.0,
      status: 'NORMAL'
    }
  ];

  let propagationPath: string[] = [];
  if (isInventoryFault) {
    propagationPath = ['inventory-service', 'order-service', 'api-gateway', 'client-web'];
  } else if (isPaymentFault) {
    propagationPath = ['stripe-gateway', 'payment-service', 'order-service', 'api-gateway', 'client-web'];
  } else if (isDbFault) {
    propagationPath = ['inventory-db', 'inventory-service', 'order-service', 'api-gateway', 'client-web'];
  } else if (isGatewayFault) {
    propagationPath = ['api-gateway', 'client-web'];
  } else if (isOrderFault) {
    propagationPath = ['inventory-db', 'order-service', 'api-gateway', 'client-web'];
  } else {
    propagationPath = [incident.affectedService, 'order-service', 'api-gateway', 'client-web'];
  }

  return {
    services,
    dependencies,
    failureOriginId: incident.affectedService,
    propagationPath,
    reconstructedAt: incident.timestamp,
    environment: {
      region: 'asia-southeast1 (Google Cloud)',
      cloudProvider: 'Google Cloud Platform',
      cluster: 'prod-ecommerce-gke-01',
      activeDeployments: 1
    }
  };
}
