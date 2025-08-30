import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    export interface Request {
      // Ela pode conter uma string ou o objeto JwtPayload que o jwt.verify retorna
      user?: string | JwtPayload;
      

    }
  }
}
typescript
  try {
    // ... lógica de verificação ...
    req.user = decodedPayload;
    next(); 
  }
  catch(err) {
    return res.status(401).json({message:'Token inválido ou expirado'});
  }

  next(); 
