# Placeholder outputs that match what outputs.tf expects to reference.
# The real endpoint values are populated when RDS / ElastiCache resources
# are added during infra provisioning.

output "rds_endpoint" {
  description = "RDS Postgres endpoint — populated when the RDS resource is provisioned."
  value       = ""
}

output "redis_endpoint" {
  description = "ElastiCache Redis endpoint — populated when the Redis resource is provisioned."
  value       = ""
}
