variable "environment" {
  type        = string
  description = "Environment name (production, staging, dev)"
}

variable "vpc_id" {
  type        = string
  description = "VPC ID for DB/Redis security group scoping"
}

variable "db_subnet_ids" {
  type        = list(string)
  description = "Subnet IDs for RDS placement"
}

variable "db_instance_class" {
  type        = string
  description = "RDS instance class"
}

variable "db_allocated_storage" {
  type        = number
  description = "RDS allocated storage (GB)"
}

variable "redis_node_type" {
  type        = string
  description = "ElastiCache Redis node type"
}
