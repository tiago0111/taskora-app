variable "aws_region" {
  description = "A regiao da AWS onde os recursos serao criados."
  type        = string
  default     = "eu-north-1" 
}

variable "project_name" {
  description = "O nome do projeto, usado para nomear recursos."
  type        = string
  default     = "taskora"
}

variable "vpc_cidr_block" {
  description = "O bloco de enderecos IP para a nossa VPC."
  type        = string
  default     = "10.0.0.0/16"
}

variable "db_password" {
  description = "A password para a base de dados RDS."
  type        = string
  sensitive   = true # O Terraform não irá mostrar este valor nos logs
}
variable "aws_account_id" {
  description = "O ID da sua conta AWS."
  type        = string
}

variable "api_image_name" {
  description = "O nome do repositorio ECR para a API."
  type        = string
  default     = "taskora/api"
}

variable "client_image_name" {
  description = "O nome do repositorio ECR para o Cliente."
  type        = string
  default     = "taskora/client"
}

variable "jwt_secret" {
  description = "A chave secreta para os tokens JWT em producao."
  type        = string
  sensitive   = true
}