import http from 'k6/http';
import { check } from 'k6';

export let options = {
  vus: 5,
  duration: '30s',
};

const BASE_URL = 'https://lablens-o256-p6xr5486o-biospark-fea59ac0.vercel.app';

export default function() {
  // Test health endpoint (database connectivity)
  let response = http.get(`${BASE_URL}/api/health`);
  check(response, {
    'DB health check < 200ms': (r) => r.timings.duration < 200,
  });
  
  // Test performance metrics endpoint
  response = http.get(`${BASE_URL}/api/performance/metrics`);
  check(response, {
    'Performance metrics < 300ms': (r) => r.timings.duration < 300,
  });
}
