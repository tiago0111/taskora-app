import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Usa o mesmo fallback do controlador de auth para evitar inconsistências
const JWT_SECRET = process.env.JWT_SECRET || 'your_default_secret';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // Alguns proxies/ambientes podem enviar o header com capitalização diferente
  const rawHeader = (req.headers['authorization'] || (req.headers as any)['Authorization']) as string | undefined;

  if (!rawHeader) {
    return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
  }

  // Suporta espaços extra e "bearer" em qualquer capitalização
  const parts = rawHeader.trim().split(/\s+/);
  const scheme = parts[0]?.toLowerCase();
  const token = parts[1];

  if (scheme !== 'bearer' || !token) {
    return res.status(401).json({ message: 'Acesso negado. Token em formato inválido.' });
  }

  try {
    const decodedPayload = jwt.verify(token, JWT_SECRET);
    req.user = decodedPayload;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido ou expirado.' });
  }
}