import express from "express";
import { authentication } from "./routes/auth";
import dotenv from "dotenv";
import projectsRouter from './routes/projects.router';
import userRouter from './routes/user.router';
import tasksRouter from './routes/tasks.router';
import pomodoroRouter from './routes/pomodoro.router';
import analyticsRouter from './routes/analytics.router';

dotenv.config();
const app = express();

const port = 3001;
app.use(express.json());

app.use('/api/auth', authentication);
app.use('/api/projects', projectsRouter);
app.use('/api/user', userRouter);
app.use('/api/tasks', tasksRouter); 
app.use('/api/pomodoro', pomodoroRouter);
app.use('/api/analytics', analyticsRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});