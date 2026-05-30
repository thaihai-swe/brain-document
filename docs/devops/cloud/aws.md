# AWS Services

Amazon Web Services (AWS) is a comprehensive cloud computing platform.

## Overview

AWS provides on-demand cloud computing platforms and APIs on a pay-as-you-go basis.

## Core Services

### Compute
- **EC2**: Virtual servers
- **Lambda**: Serverless functions
- **ECS/EKS**: Container orchestration

### Storage
- **S3**: Object storage
- **EBS**: Block storage
- **EFS**: File storage

### Database
- **RDS**: Relational databases
- **DynamoDB**: NoSQL database
- **ElastiCache**: In-memory cache

## Basic EC2 Example

```bash
# Launch instance
aws ec2 run-instances \
  --image-id ami-12345678 \
  --instance-type t2.micro \
  --key-name my-key

# List instances
aws ec2 describe-instances

# Stop instance
aws ec2 stop-instances --instance-ids i-1234567890abcdef0
```

## Best Practices

- Use IAM roles for permissions
- Enable CloudWatch monitoring
- Tag all resources
- Use Auto Scaling groups
- Implement backup strategies
