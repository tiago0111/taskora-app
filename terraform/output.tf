output "alb_dns_name" {
  description = "O DNS do Application Load Balancer (ALB) para acesso externo."
  value       = aws_lb.main.dns_name
}
