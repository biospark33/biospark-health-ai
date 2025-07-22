import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 20 },
    { duration: '30s', target: 0 },
  ],
};

const BASE_URL = 'https://lablens-o256-p6xr5486o-biospark-fea59ac0.vercel.app';

export default function() {
  // Test main page load
  let response = http.get(`${BASE_URL}/`);
  check(response, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage response time < 1000ms': (r) => r.timings.duration < 1000,
  });

  // Test API health endpoint
  response = http.get(`${BASE_URL}/api/health`);
  check(response, {
    'health API status is 200': (r) => r.status === 200,
    'health API response time < 500ms': (r) => r.timings.duration < 500,
  });

  // Test dashboard page
  response = http.get(`${BASE_URL}/dashboard`);
  check(response, {
    'dashboard status is 200': (r) => r.status === 200,
    'dashboard response time < 1500ms': (r) => r.timings.duration < 1500,
  });

  // Test analysis page
  response = http.get(`${BASE_URL}/analysis`);
  check(response, {
    'analysis status is 200': (r) => r.status === 200,
    'analysis response time < 1500ms': (r) => r.timings.duration < 1500,
  });

  sleep(1);
}
