variable "environment" {
  type        = string
  description = "Environment name (production, staging, dev)"
}

variable "vpc_cidr" {
  type        = string
  description = "CIDR block for the VPC"
}

variable "availability_zones" {
  type        = list(string)
  description = "List of available AZs in the region"
}
