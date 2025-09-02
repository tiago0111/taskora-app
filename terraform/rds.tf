resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = [aws_subnet.private_a.id, aws_subnet.private_b.id]

  tags = {
    Name = "${var.project_name}-db-subnet-group"
  }
}

resource "aws_security_group" "db" {
  name        = "${var.project_name}-db-sg"
  description = "Permite o acesso a base de dados a partir da nossa VPC"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr_block]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-db-sg"
  }
}

resource "aws_db_instance" "main" {
  identifier           = "${var.project_name}-db"
  allocated_storage    = 10 # Tamanho do armazenamento em GB
  engine               = "postgres"
  engine_version       = "14" # Mesma versão do seu docker-compose.yml
  instance_class       = "db.t3.micro" # A classe mais pequena, elegível para o Free Tier

  db_name              = "taskora_db" # O nome da base de dados
  username             = "taskora_admin"
  password             = var.db_password 

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.db.id]

  skip_final_snapshot = true # Em produção real, isto seria 'false'
}