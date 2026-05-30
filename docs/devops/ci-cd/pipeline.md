# CI/CD Pipeline

Continuous Integration and Continuous Deployment automate software delivery.

## Overview

CI/CD pipelines automate building, testing, and deploying code changes.

## Pipeline Stages

### 1. Source
- Code commit triggers pipeline
- Version control integration

### 2. Build
```yaml
# Example GitHub Actions
name: Build
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build
        run: npm run build
```

### 3. Test
- Unit tests
- Integration tests
- Security scans

### 4. Deploy
- Staging environment
- Production deployment
- Rollback capability

## Tools

- **GitHub Actions**: GitHub-native CI/CD
- **GitLab CI**: Integrated with GitLab
- **Jenkins**: Self-hosted automation
- **CircleCI**: Cloud-based CI/CD

## Best Practices

- Keep pipelines fast (< 10 minutes)
- Test in production-like environments
- Automate everything
- Monitor deployments
- Enable easy rollbacks
