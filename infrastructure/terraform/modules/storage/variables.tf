variable "environment" {
  type        = string
  description = "Environment name (production, staging, dev)"
}

variable "vpc_id" {
  type        = string
  description = "VPC ID for bucket policy scoping (wired during provisioning)"
}

variable "uploads_bucket" {
  type        = string
  description = "Private quarantine bucket name"
}

variable "public_bucket" {
  type        = string
  description = "CDN-served public bucket name"
}
