# Terraform

Terraform is an infrastructure as code tool for building, changing, and versioning infrastructure.

## Overview

Terraform uses declarative configuration files to manage infrastructure across multiple cloud providers.

## Basic Configuration

```hcl
# main.tf
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"

  tags = {
    Name = "WebServer"
  }
}
```

## Common Commands

```bash
# Initialize
terraform init

# Plan changes
terraform plan

# Apply changes
terraform apply

# Destroy infrastructure
terraform destroy

# Format code
terraform fmt

# Validate configuration
terraform validate
```

## Variables

```hcl
# variables.tf
variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"
}

# Use variable
resource "aws_instance" "web" {
  instance_type = var.instance_type
}
```

## Best Practices

- Use remote state storage
- Organize with modules
- Use workspaces for environments
- Version control everything
- Use variables for flexibility
- Implement state locking
