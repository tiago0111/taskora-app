import type { Request, Response, NextFunction } from 'express';

export function roleMiddleware(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    // A propriedade req.user é adicionada pelo authMiddleware
    const userRole = (req.user as any)?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Acesso negado. Não tem permissão para realizar esta ação.' });
    }

    next();
  };
}