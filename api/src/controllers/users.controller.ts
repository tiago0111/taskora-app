import type { Request, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function getAllUsers(req: Request, res: Response) {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: { 
                id: true,
                email: true,
                name: true,
                role: true,
                bio: true,
                createdAt: true,
            }
        });
        res.status(200).json(users);
    } catch (error) {
        console.error("Erro ao listar utilizadores:", error);
        res.status(500).json({ message: "Ocorreu um erro no servidor." });
    }
}

// Criar um novo utilizador (Apenas para Admins)
export async function createUser(req: Request, res: Response) {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios: nome, email, password, role.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role as Role, // ex: 'ADMIN' ou 'USER'
            },
            select: { id: true, email: true, name: true, role: true, bio: true, createdAt: true }
        });
        res.status(201).json(newUser);
    } catch (error) {
        console.error("Erro ao criar utilizador:", error);
        res.status(500).json({ message: "Ocorreu um erro ao criar o utilizador." });
    }
}

// Atualizar um utilizador por ID (Apenas para Admins)
export async function updateUserById(req: Request, res: Response) {
    const userIdToUpdate = Number(req.params.id);
    const { name, bio, role } = req.body;

    if (!Number.isFinite(userIdToUpdate)) {
        return res.status(400).json({ message: 'ID de utilizador inválido.' });
    }

    try {
        const updatedUser = await prisma.user.update({
            where: { id: userIdToUpdate },
            data: {
                name,
                bio,
                role: role as Role,
            },
            select: { id: true, email: true, name: true, role: true, bio: true, createdAt: true }
        });
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Erro ao atualizar o utilizador:", error);
        res.status(500).json({ message: "Ocorreu um erro ao atualizar o utilizador." });
    }
}