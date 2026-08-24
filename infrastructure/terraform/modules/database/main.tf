terraform {
  required_version = ">= 1.7.0"
}

# RDS Postgres + ElastiCache Redis scaffold consumed by `core/main.tf`
# (C34). Real subnet groups, security groups, parameter groups, and
# credentials rotation are wired during infra provisioning; this validates
# end-to-end. Outputs match what outputs.tf expects.
