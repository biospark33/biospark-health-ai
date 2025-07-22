import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '15s', target: 5 },
    { duration: '30s', target: 10 },
    { duration: '15s', target: 0 },
  ],
};

const BASE_URL = 'https://lablens-o256-p6xr5486o-biospark-fea59ac0.vercel.app';

export default function() {
  // Test health endpoint (should be fastest)
  let response = http.get(`${BASE_URL}/api/health`);
  check(response, {
    'health API response time < 500ms': (r) => r.timings.duration < 500,
  });

  // Test performance metrics endpoint
  response = http.get(`${BASE_URL}/api/performance/metrics`);
  check(response, {
    'metrics API response time < 1000ms': (r) => r.timings.duration < 1000,
  });

  sleep(0.5);
}
