terraform {
  required_version = ">= 1.7.0"
}

# S3 buckets for upload quarantine (private) and CDN-served public variants.
# C34 scaffolds — versioning + public-read policy are wired during infra
# provisioning; the output names match what outputs.tf expects.

resource "aws_s3_bucket" "uploads" {
  bucket = var.uploads_bucket

  tags = {
    Name        = var.uploads_bucket
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

resource "aws_s3_bucket" "public" {
  bucket = var.public_bucket

  tags = {
    Name        = var.public_bucket
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}
