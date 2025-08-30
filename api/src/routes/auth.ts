import { Router } from 'express';
import { login } from '../controllers/auth-controller';
export const authentication = Router();

console.log("--- Ficheiro de Rotas de Autenticação foi carregado com sucesso! ---");


authentication.post('/login', login);

export default authentication;