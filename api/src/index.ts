import express from "express";
import { authentication } from "./routes/auth";
import dotenv from "dotenv";
import projectsRouter from './routes/projects.router';
// CORREÇÃO: Importar o novo router
import usersRouter from './routes/users.router'; 
import pomodoroRouter from './routes/pomodoro.router';
import analyticsRouter from './routes/analytics.router';
import cors from 'cors';

dotenv.config();
const app = express();

const port = 3001;
app.use(express.json());
app.use(cors());

// Middleware de logging para depuração (opcional, mas útil)
app.use((req, res, next) => {
  console.log(`[LOG] Pedido Recebido: ${req.method} ${req.originalUrl}`);
  next();
});

app.use('/api/auth', authentication);
app.use('/api/projects', projectsRouter);
// CORREÇÃO: Usar o novo router no plural
app.use('/api/users', usersRouter); 
app.use('/api/pomodoro', pomodoroRouter);
app.use('/api/analytics', analyticsRouter);

app.listen(port, () => {
  console.log(`Servidor a correr na porta ${port}`)
});