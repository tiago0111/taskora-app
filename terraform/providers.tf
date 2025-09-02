# Define a versão do Terraform que estamos a usar
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Configura o provider da AWS para usar a região que definirmos
provider "aws" {
  region = var.aws_region
}