const client = require('prom-client');

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestCount = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
});

const riskEvaluationCount = new client.Counter({
  name: 'risk_evaluation_requests_total',
  help: 'Total risk evaluation requests',
  labelNames: ['status'],
  registers: [register],
});

const riskEvaluationDuration = new client.Histogram({
  name: 'risk_evaluation_duration_seconds',
  help: 'Duration of risk evaluation calls to ML model',
  buckets: [0.1, 0.5, 1, 2.5, 5, 10, 30],
  registers: [register],
});

const riskEvaluationResults = new client.Counter({
  name: 'risk_evaluation_results_total',
  help: 'Risk evaluation results by label',
  labelNames: ['risk_label'],
  registers: [register],
});

const studentCount = new client.Gauge({
  name: 'students_total',
  help: 'Total number of students in the database',
  registers: [register],
});

const modelApiHealth = new client.Gauge({
  name: 'model_api_healthy',
  help: 'Whether the ML model API is reachable (1=yes, 0=no)',
  registers: [register],
});

function metricsMiddleware(req, res, next) {
  if (req.path === '/api/metrics') {
    return next();
  }
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const elapsed = Number(process.hrtime.bigint() - start) / 1e9;
    const route = normalizeRoute(req.path);
    httpRequestCount.inc({ method: req.method, route, status_code: res.statusCode });
    httpRequestDuration.observe({ method: req.method, route }, elapsed);
  });
  next();
}

function normalizeRoute(path) {
  return path
    .replace(/\/api\/students\/\d+/, '/api/students/:id')
    .replace(/\/api\/risk\/evaluate\/\d+/, '/api/risk/evaluate/:studentId');
}

module.exports = {
  register,
  httpRequestCount,
  httpRequestDuration,
  riskEvaluationCount,
  riskEvaluationDuration,
  riskEvaluationResults,
  studentCount,
  modelApiHealth,
  metricsMiddleware,
};
