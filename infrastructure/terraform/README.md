# Terraform

Infrastructure-as-code for deploying Minecraft Platform to AWS.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    AWS Cloud                             │
│                                                          │
│  CloudFront → S3 (web/admin/docs static assets)         │
│                                                          │
│  ALB → ECS Fargate (api + workers)                       │
│                                                          │
│  RDS (PostgreSQL) | ElastiCache (Redis) | S3 (uploads)  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Files

- `main.tf` - Provider and core configuration
- `networking.tf` - VPC, subnets, security groups
- `compute.tf` - ECS cluster, services, task definitions
- `database.tf` - RDS instance, ElastiCache cluster
- `storage.tf` - S3 buckets with lifecycle policies
- `cdn.tf` - CloudFront distribution
- `iam.tf` - Roles, policies, service accounts
- `monitoring.tf` - CloudWatch alarms, SNS topics
- `variables.tf` - Input variables
- `outputs.tf` - Output values

## Usage

```bash
# Initialize
terraform init

# Plan changes
terraform plan -var-file=production.tfvars

# Apply
terraform apply -var-file=production.tfvars

# Destroy (DANGER)
terraform destroy -var-file=production.tfvars
```

## State

Remote state is stored in S3 with DynamoDB locking. Configure your backend in `backend.tf`:

```hcl
terraform {
  backend "s3" {
    bucket         = "mcp-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "mcp-terraform-locks"
    encrypt        = true
  }
}
```
