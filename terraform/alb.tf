resource "aws_security_group" "alb" {
  name        = "${var.project_name}-alb-sg"
  description = "Permite trafego HTTP para o ALB"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-alb-sg"
  }
}

resource "aws_lb" "main" {
  name               = "${var.project_name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = [aws_subnet.public_a.id, aws_subnet.public_b.id]

  tags = {
    Name = "${var.project_name}-alb"
  }
}

# Target group para o CLIENTE (Frontend)
resource "aws_lb_target_group" "client" {
  name        = "${var.project_name}-client-tg"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    path = "/"
  }

  tags = {
    Name = "${var.project_name}-client-tg"
  }
}

# Target group para a API (Backend)
resource "aws_lb_target_group" "api" {
  name        = "${var.project_name}-api-tg"
  port        = 3001
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    path                = "/" # A sua API tem um health check em '/'
    protocol            = "HTTP"
    matcher             = "200"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 3
    unhealthy_threshold = 3
  }

  tags = {
    Name = "${var.project_name}-api-tg"
  }
}

# Listener principal para a porta 80
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  # A ação por defeito encaminha todo o tráfego para o CLIENTE
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.client.arn
  }
}

# Regra adicional para encaminhar tráfego da API
resource "aws_lb_listener_rule" "api" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }

  # Condição: se o caminho começar com /api/, encaminha para a API
  condition {
    path_pattern {
      values = ["/api/*"]
    }
  }
}