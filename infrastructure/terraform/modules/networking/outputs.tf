output "vpc_id" {
  value = aws_vpc.main.id
}

output "database_subnet_ids" {
  description = "Subnet IDs for database placement — placeholder empty list until the real subnets are provisioned."
  value       = []
}
