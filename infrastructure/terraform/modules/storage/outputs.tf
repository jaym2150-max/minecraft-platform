output "uploads_bucket" {
  value = aws_s3_bucket.uploads.id
}

output "public_bucket" {
  value = aws_s3_bucket.public.id
}
