import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 5 },    // Warm up 5 users
    { duration: '30s', target: 10 },   // 10 users
    { duration: '30s', target: 20 },   // 20 users
    { duration: '30s', target: 0 },    // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<5000'],
    'http_req_failed': ['rate<0.20'],
  },
};

const BASE_URL = 'https://vendorvibeos.web.app';

export default function () {
  const res = http.get(`${BASE_URL}/`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    timeout: '10s',
  });
  
  check(res, {
    'status 2xx': (r) => r.status >= 200 && r.status < 300,
    'response < 5s': (r) => r.timings.duration < 5000,
  });
  
  sleep(2);
}

export function handleSummary(data) {
  return {
    'stdout': `
============================================
📊 K6 LOAD TEST RESULT
============================================
Total Requests: ${data.metrics.http_reqs.values.count}
Failed Requests: ${data.metrics.http_req_failed.values.passes || 0}
Avg Response: ${Math.round(data.metrics.http_req_duration.values.avg)}ms
P95 Response: ${Math.round(data.metrics.http_req_duration.values['p(95)'])}ms
Max Response: ${Math.round(data.metrics.http_req_duration.values.max)}ms
Requests/sec: ${data.metrics.http_reqs.values.rate.toFixed(2)}
============================================
    `,
  };
}