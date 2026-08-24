output "vpc_id" {
  value = module.networking.vpc_id
}

output "api_url" {
  value = "https://api.${var.domain_name}"
}

output "web_url" {
  value = "https://${var.domain_name}"
}

output "admin_url" {
  value = "https://admin.${var.domain_name}"
}

output "docs_url" {
  value = "https://docs.${var.domain_name}"
}

output "s3_uploads_bucket" {
  value = module.storage.uploads_bucket
}

output "s3_public_bucket" {
  value = module.storage.public_bucket
}

output "rds_endpoint" {
  value = module.database.rds_endpoint
  sensitive = true
}

output "redis_endpoint" {
  value = module.database.redis_endpoint
  sensitive = true
}
