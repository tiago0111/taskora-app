import express from "express";
import {authentication} from "./routes/auth";
import dotenv from "dotenv";
import {projectsRouter} from './routes/projects.router';

dotenv.config();
const app = express ();


const port = 3001;
app.use(express.json());

app.use('/api/auth', authentication);
app.use('/api/projects', projectsRouter); // <-- Adicionas esta linha


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
