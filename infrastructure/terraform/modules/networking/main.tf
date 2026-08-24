terraform {
  required_version = ">= 1.7.0"
}

# Minimal VPC scaffold consumed by `core/main.tf` (C34). Real resources
# (subnets, route tables, NAT, IGW, security groups) are added during infra
# provisioning; this validates end-to-end and exposes the outputs that
# outputs.tf and the sibling modules need.

resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name        = "minecraft-platform-${var.environment}"
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}
