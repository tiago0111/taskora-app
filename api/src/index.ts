import express from "express";
import { authentication } from "./routes/auth";
import dotenv from "dotenv";
import projectsRouter from './routes/projects.router';
import usersRouter from './routes/users.router'; 
import pomodoroRouter from './routes/pomodoro.router';
import analyticsRouter from './routes/analytics.router';
import cors from 'cors';

dotenv.config();
const app = express();

const port = 3001;
app.use(express.json());
app.use(cors());



app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API is healthy' });
});
app.use('/api/auth', authentication);
app.use('/api/projects', projectsRouter);
app.use('/api/users', usersRouter); 
app.use('/api/pomodoro', pomodoroRouter);
app.use('/api/analytics', analyticsRouter);

app.listen(port, () => {
  console.log(`Servidor a correr na porta ${port}`)
});