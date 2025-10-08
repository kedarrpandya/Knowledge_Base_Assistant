import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const queryDuration = new Trend('query_duration');
const successfulQueries = new Counter('successful_queries');
const failedQueries = new Counter('failed_queries');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 10 },   // Ramp up to 10 users
    { duration: '5m', target: 10 },   // Stay at 10 users
    { duration: '2m', target: 50 },   // Ramp up to 50 users
    { duration: '5m', target: 50 },   // Stay at 50 users
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '3m', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000', 'p(99)<10000'], // 95% < 5s, 99% < 10s
    errors: ['rate<0.1'],                              // Error rate < 10%
    http_req_failed: ['rate<0.05'],                    // Failed requests < 5%
  },
};

// Configuration
const BASE_URL = __ENV.API_BASE_URL || 'http://localhost:3000';
const AUTH_TOKEN = __ENV.AUTH_TOKEN || 'test-token';

// Sample questions for testing
const questions = [
  'How do I submit expense reimbursements?',
  'What are the IT security best practices?',
  'Tell me about the onboarding process',
  'What is the escalation process for customer issues?',
  'How do I launch a new product?',
  'What are the employee benefits?',
  'How do I reset my password?',
  'What is the vacation policy?',
  'How do I access the VPN?',
  'What are the company values?',
];

export default function () {
  // Select a random question
  const question = questions[Math.floor(Math.random() * questions.length)];

  // Prepare request
  const payload = JSON.stringify({
    question: question,
    sessionId: `load-test-${__VU}-${__ITER}`,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AUTH_TOKEN}`,
    },
    timeout: '60s',
  };

  // Send query request
  const startTime = Date.now();
  const response = http.post(`${BASE_URL}/api/query`, payload, params);
  const duration = Date.now() - startTime;

  // Record metrics
  queryDuration.add(duration);

  // Check response
  const success = check(response, {
    'status is 200': (r) => r.status === 200,
    'has answer': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.answer && body.answer.length > 0;
      } catch (e) {
        return false;
      }
    },
    'has sources': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body.sources);
      } catch (e) {
        return false;
      }
    },
    'response time < 10s': (r) => r.timings.duration < 10000,
  });

  if (success) {
    successfulQueries.add(1);
  } else {
    failedQueries.add(1);
    errorRate.add(1);
    console.error(`Request failed: ${response.status} - ${response.body}`);
  }

  // Think time between requests (1-3 seconds)
  sleep(Math.random() * 2 + 1);
}

// Setup function (runs once at the beginning)
export function setup() {
  console.log('Starting load test...');
  console.log(`Target: ${BASE_URL}`);
  console.log(`Questions pool: ${questions.length} questions`);

  // Health check
  const healthResponse = http.get(`${BASE_URL}/health`);
  if (healthResponse.status !== 200) {
    throw new Error(`API health check failed: ${healthResponse.status}`);
  }

  console.log('API is healthy. Starting test...');
  return { startTime: Date.now() };
}

// Teardown function (runs once at the end)
export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000;
  console.log(`Load test completed in ${duration}s`);
}

// Handle summary
export function handleSummary(data) {
  return {
    'load-test-summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  const indent = options.indent || '';
  const colors = options.enableColors;

  let summary = '\n';
  summary += `${indent}Test Summary\n`;
  summary += `${indent}${'='.repeat(60)}\n\n`;

  // Overall stats
  summary += `${indent}Total Requests: ${data.metrics.http_reqs.values.count}\n`;
  summary += `${indent}Failed Requests: ${data.metrics.http_req_failed.values.passes}\n`;
  summary += `${indent}Request Rate: ${data.metrics.http_reqs.values.rate.toFixed(2)}/s\n\n`;

  // Response times
  summary += `${indent}Response Time:\n`;
  summary += `${indent}  Average: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
  summary += `${indent}  Median:  ${data.metrics.http_req_duration.values.med.toFixed(2)}ms\n`;
  summary += `${indent}  P95:     ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n`;
  summary += `${indent}  P99:     ${data.metrics.http_req_duration.values['p(99)'].toFixed(2)}ms\n`;
  summary += `${indent}  Max:     ${data.metrics.http_req_duration.values.max.toFixed(2)}ms\n\n`;

  // Custom metrics
  if (data.metrics.successful_queries) {
    summary += `${indent}Successful Queries: ${data.metrics.successful_queries.values.count}\n`;
  }
  if (data.metrics.failed_queries) {
    summary += `${indent}Failed Queries: ${data.metrics.failed_queries.values.count}\n`;
  }
  if (data.metrics.errors) {
    summary += `${indent}Error Rate: ${(data.metrics.errors.values.rate * 100).toFixed(2)}%\n`;
  }

  summary += `\n${indent}${'='.repeat(60)}\n`;

  return summary;
}

