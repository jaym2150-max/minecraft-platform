variable "aws_region" {
  type        = string
  description = "AWS region for all resources"
  default     = "us-east-1"
}

variable "environment" {
  type        = string
  description = "Environment name (production, staging, dev)"
  default     = "production"
}

variable "domain_name" {
  type        = string
  description = "Primary domain name"
  default     = "minecraftplatform.com"
}

# C34: variables the network/storage/database modules below consume. Kept
# as no-op / sane defaults so `terraform validate` runs without an env.
variable "vpc_cidr" {
  type        = string
  description = "CIDR block for the VPC the platform + workers live in"
  default     = "10.0.0.0/16"
}

variable "uploads_bucket" {
  type        = string
  description = "Base name of the S3 bucket used for upload quarantine (private); the public bucket is this name suffixed with -public"
  default     = "minecraft-platform-uploads"
}

variable "api_image" {
  type        = string
  description = "Docker image for the API"
  default     = "ghcr.io/your-org/minecraft-api:latest"
}

variable "web_image" {
  type        = string
  description = "Docker image for the web frontend"
  default     = "ghcr.io/your-org/minecraft-web:latest"
}

variable "api_port" {
  type        = number
  description = "Port the API listens on"
  default     = 4000
}

variable "web_port" {
  type        = number
  description = "Port the web app listens on"
  default     = 3000
}

variable "db_instance_class" {
  type        = string
  description = "RDS instance class"
  default     = "db.t3.medium"
}

variable "db_allocated_storage" {
  type        = number
  description = "RDS allocated storage (GB)"
  default     = 100
}

variable "redis_node_type" {
  type        = string
  description = "ElastiCache Redis node type"
  default     = "cache.t3.medium"
}

variable "api_desired_count" {
  type        = number
  description = "Desired number of API tasks"
  default     = 2
}

variable "worker_desired_count" {
  type        = number
  description = "Desired number of worker tasks"
  default     = 1
}
