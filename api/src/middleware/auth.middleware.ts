import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Renomeei a função para ser mais descritiva
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // Boa prática: usar req.headers.get() como discutimos
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Acesso negado. Token em formato inválido.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodedPayload = jwt.verify(token, process.env.JWT_SECRET as string);

    req.user = decodedPayload;

    next();
  } catch (err) {
    // Se o token for inválido, o jwt.verify lança um erro que é apanhado aqui
    return res.status(401).json({ message: 'Token inválido ou expirado.' });
  }

}
