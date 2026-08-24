terraform {
  required_version = ">= 1.7.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.40"
    }
  }

  # C38 (AUDIT.md): remote state backend. Storing Terraform state locally is
  # fine for one-off dev but loses the world on a developer laptop and has
  # no locking — two operators running `apply` concurrently silently
  # overwrite each other's state, which is the single most common way teams
  # corrupt infra state. The S3 + DynamoDB lock configuration below is the
  # recommended remote storage pattern; uncomment and configure the bucket
  # before the first `terraform init -migrate-state` run.
  #
  # backend "s3" {
  #   bucket         = "minecraft-platform-terraform-state"
  #   key            = "minecraft-platform/${var.environment}/terraform.tfstate"
  #   region         = var.aws_region
  #   dynamodb_table = "minecraft-platform-terraform-locks"
  #   encrypt        = true
  # }

  # Default to local state for dev; operators override via `-backend-config=`
  # on `terraform init`. Kept so `terraform validate` works out of the box.
  backend "local" {}
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "minecraft-platform"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

# ---------------------------------------------------------------------------
# C34 (AUDIT.md): outputs.tf previously referenced `module.networking`,
# `module.storage`, and `module.database`, but no module blocks existed —
# `terraform validate` would fail with "Reference to undeclared module".
# We declare them here, pointing at the local submodules under `modules/*`
# (scaffolded minimally so the configuration validates end-to-end; real
# AWS resources are added during infra provisioning).
# ---------------------------------------------------------------------------

module "networking" {
  source             = "./modules/networking"
  environment        = var.environment
  vpc_cidr           = var.vpc_cidr
  availability_zones = data.aws_availability_zones.available.names
}

module "storage" {
  source        = "./modules/storage"
  environment   = var.environment
  vpc_id        = module.networking.vpc_id
  uploads_bucket = var.uploads_bucket
  public_bucket  = "${var.uploads_bucket}-public"
}

module "database" {
  source              = "./modules/database"
  environment         = var.environment
  vpc_id              = module.networking.vpc_id
  db_subnet_ids       = module.networking.database_subnet_ids
  db_instance_class   = var.db_instance_class
  db_allocated_storage = var.db_allocated_storage
  redis_node_type     = var.redis_node_type
}
