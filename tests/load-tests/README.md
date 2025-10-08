# Load Testing for Knowledge Assistant

This directory contains load testing scripts using k6 for the Enterprise Knowledge Assistant API.

## Prerequisites

1. **Install k6**
   ```bash
   # macOS
   brew install k6

   # Windows
   choco install k6

   # Linux
   sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
   echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
   sudo apt-get update
   sudo apt-get install k6
   ```

2. **Set Environment Variables**
   ```bash
   export API_BASE_URL=https://your-api.azurewebsites.net
   export AUTH_TOKEN=your-test-token
   ```

## Running Load Tests

### Basic Load Test
```bash
k6 run load-test.js
```

### Test with Custom Configuration
```bash
k6 run --vus 50 --duration 5m load-test.js
```

### Test with Detailed Output
```bash
k6 run --out json=results.json load-test.js
```

### Test with Cloud Integration
```bash
k6 cloud load-test.js
```

## Test Scenarios

### 1. Smoke Test (Minimal Load)
Verify the system works under minimal load.

```bash
k6 run --vus 1 --duration 1m load-test.js
```

### 2. Load Test (Expected Load)
Test under expected production load.

```bash
k6 run --vus 50 --duration 10m load-test.js
```

### 3. Stress Test (High Load)
Find the breaking point of the system.

```bash
k6 run --vus 200 --duration 15m load-test.js
```

### 4. Spike Test (Sudden Traffic)
Test how the system handles sudden traffic spikes.

```bash
k6 run --stage 1m:0,1m:500,1m:0 load-test.js
```

### 5. Soak Test (Sustained Load)
Test system stability over extended periods.

```bash
k6 run --vus 50 --duration 2h load-test.js
```

## Performance Targets

### Response Time
- **Average**: < 2 seconds
- **P95**: < 5 seconds
- **P99**: < 10 seconds

### Throughput
- **Target**: 100 requests/second
- **Peak**: 500 requests/second

### Error Rate
- **Maximum**: 1% under normal load
- **Maximum**: 5% under stress

### Resource Usage
- **CPU**: < 70% under normal load
- **Memory**: < 80% under normal load

## Analyzing Results

### Real-time Monitoring
Watch metrics in real-time:
```bash
k6 run --out influxdb=http://localhost:8086/k6 load-test.js
```

### Generate HTML Report
```bash
k6 run --out json=results.json load-test.js
k6-reporter results.json
```

### Key Metrics to Monitor

1. **http_req_duration**: Response time
2. **http_req_failed**: Failed request rate
3. **http_reqs**: Request rate (throughput)
4. **vus**: Virtual users (concurrent users)
5. **data_received**: Bandwidth usage

## Integration with CI/CD

### GitHub Actions
```yaml
- name: Run Load Tests
  run: |
    k6 run --quiet tests/load-tests/load-test.js
  env:
    API_BASE_URL: ${{ secrets.API_BASE_URL }}
    AUTH_TOKEN: ${{ secrets.TEST_AUTH_TOKEN }}
```

### Azure DevOps
```yaml
- task: Bash@3
  displayName: 'Run K6 Load Tests'
  inputs:
    targetType: 'inline'
    script: |
      k6 run tests/load-tests/load-test.js
  env:
    API_BASE_URL: $(API_BASE_URL)
    AUTH_TOKEN: $(TEST_AUTH_TOKEN)
```

## Troubleshooting

### High Error Rate
- Check API logs for errors
- Verify authentication tokens
- Check Azure service quotas
- Monitor OpenAI rate limits

### Slow Response Times
- Check database performance
- Review Azure OpenAI throttling
- Verify network latency
- Check Cognitive Search performance

### Resource Exhaustion
- Scale up App Service Plan
- Increase OpenAI capacity
- Optimize database queries
- Add caching layer

## Best Practices

1. **Run during off-peak hours** to avoid impacting production
2. **Start with smoke tests** before running full load tests
3. **Monitor Azure costs** during extended tests
4. **Use separate test environment** for load testing
5. **Gradually increase load** to identify bottlenecks
6. **Document baseline metrics** for comparison
7. **Test from multiple regions** for geo-distributed users

## Reporting

Generate a comprehensive report:
```bash
k6 run --out json=results.json load-test.js
# Analyze results.json for detailed metrics
```

Example metrics to include in reports:
- Total requests
- Success rate
- Average response time
- P95/P99 response times
- Throughput (req/s)
- Error breakdown
- Cost analysis (Azure resources)

## Support

For issues with load testing, contact the platform team or refer to [k6 documentation](https://k6.io/docs/).

