# Kubernetes

Kubernetes (K8s) is an open-source container orchestration platform.

## Overview

Kubernetes automates deployment, scaling, and management of containerized applications.

## Core Concepts

- **Pods**: Smallest deployable units
- **Services**: Network access to pods
- **Deployments**: Declarative updates for pods
- **ConfigMaps**: Configuration data
- **Secrets**: Sensitive information

## Basic Commands

```bash
# Get cluster info
kubectl cluster-info
kubectl get nodes

# Deploy application
kubectl apply -f deployment.yaml

# View resources
kubectl get pods
kubectl get services
kubectl get deployments

# Logs and debugging
kubectl logs pod-name
kubectl describe pod pod-name
kubectl exec -it pod-name -- /bin/sh

# Scale deployment
kubectl scale deployment myapp --replicas=3
```

## Simple Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: myapp
        image: myapp:latest
        ports:
        - containerPort: 8080
```
