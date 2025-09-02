resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-cluster"

  tags = {
    Name = "${var.project_name}-cluster"
  }
}

resource "aws_security_group" "ecs_service" {
  name        = "${var.project_name}-ecs-service-sg"
  description = "Permite trafego do ALB para os conteineres"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 0
    to_port         = 0
    protocol        = "-1"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-ecs-service-sg"
  }
}

resource "aws_ecs_task_definition" "api" {
  family                   = "${var.project_name}-api-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"  # 0.25 vCPU
  memory                   = "512"  # 512 MB
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name      = "${var.project_name}-api-container",
      image     = "${var.aws_account_id}.dkr.ecr.${var.aws_region}.amazonaws.com/${var.api_image_name}:latest",
      essential = true,
      portMappings = [
        {
          containerPort = 3001,
          hostPort      = 3001
        }
      ],
      environment = [
        {
          name  = "DATABASE_URL",
          value = "postgresql://${aws_db_instance.main.username}:${var.db_password}@${aws_db_instance.main.address}/${aws_db_instance.main.db_name}"
        },
        {
          name  = "JWT_SECRET",
          value = var.jwt_secret
        }
      ],
      logConfiguration = {
        logDriver = "awslogs",
        options = {
          "awslogs-group"         = "/ecs/${var.project_name}-api",
          "awslogs-region"        = var.aws_region,
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "api" {
  name            = "${var.project_name}-api-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = 1 # Queremos 1 instância da nossa API a correr
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = [aws_subnet.public_a.id, aws_subnet.public_b.id]
    security_groups = [aws_security_group.ecs_service.id]
    assign_public_ip = true # Atribuir IP público para permitir puxar imagens do ECR
  }

  # Anexar a API ao Load Balancer
  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn # Usa o novo target group da API
    container_name   = "${var.project_name}-api-container"
    container_port   = 3001
  }

  # Garante que o serviço só é atualizado após a criação da nova regra do ALB
  depends_on = [aws_lb_listener_rule.api]
}

resource "aws_ecs_task_definition" "client" {
  family                   = "${var.project_name}-client-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([
    {
      name      = "${var.project_name}-client-container",
      image     = "${var.aws_account_id}.dkr.ecr.${var.aws_region}.amazonaws.com/${var.client_image_name}:latest",
      essential = true,
      portMappings = [
        {
          containerPort = 3000,
          hostPort      = 3000
        }
      ],
      # A variável de ambiente para o frontend saber o endereço da API
      environment = [
        {
          name  = "NEXT_PUBLIC_API_URL",
          # ATUALIZADO: Usar o DNS público do ALB
          value = "http://${aws_lb.main.dns_name}/api"
        }
      ],
      logConfiguration = {
        logDriver = "awslogs",
        options = {
          "awslogs-group"         = "/ecs/${var.project_name}-client",
          "awslogs-region"        = var.aws_region,
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "client" {
  name            = "${var.project_name}-client-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.client.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = [aws_subnet.public_a.id, aws_subnet.public_b.id]
    security_groups = [aws_security_group.ecs_service.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.client.arn
    container_name   = "${var.project_name}-client-container"
    container_port   = 3000
  }
}