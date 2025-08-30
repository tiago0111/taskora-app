import { PrismaClient } from '@prisma/client';
import type { Request, Response } from 'express';
import bcrypt from "bcryptjs";
import { error } from 'console';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function login(req: Request, res: Response) {
  try {
    const { email , password } = req.body;

    if (!email || !password) {
      return res.status(422).json({ error: 'Missing email or password' });
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'invalid credential email' });
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (passwordCompare) {
      //verifica se o secret existe
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        console.error('JWT_SECRET is not set');
        return res.status(500).json({ error: 'Server configuration error' });
      }
      // cria o jwt token
      const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '90d' });
      return res.json({ token });
    } else {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.log('Erro ao fazer o login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}