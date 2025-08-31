import { PrismaClient, Role, Status } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  const hashedPassword = await bcrypt.hash('password', 10);

  const user = await prisma.user.create({
    data: {
      email: 'admin@taskora.com',
      name: 'Admin User',
      password: hashedPassword,
      role: Role.ADMIN, // Use a enum Role
      bio: 'Perfil do administrador do sistema.',
    },
  });

  console.log(`Created user with id: ${user.id}`);

  const project = await prisma.project.create({
    data: {
      name: 'Projeto de Exemplo',
      description: 'Um projeto inicial para testar a aplicação.',
      ownerId: user.id,
    },
  });

  console.log(`Created project with id: ${project.id}`);

  await prisma.task.createMany({
    data: [
      {
        title: 'Configurar autenticação',
        description: 'Implementar a autenticação de utilizadores com JWT.',
        projectId: project.id,
        assigneeId: user.id,
        status: Status.EM_PROGRESSO, // Use a enum Status
      },
      {
        title: 'Desenvolver a dashboard',
        description: 'Criar a interface principal da dashboard.',
        projectId: project.id,
        assigneeId: user.id,
        status: Status.PENDENTE, // Use a enum Status
      },
      {
        title: 'Desenhar o logo',
        description: 'Criar o logo oficial da aplicação Taskora.',
        projectId: project.id,
        assigneeId: user.id,
        status: Status.CONCLUIDA, // Use a enum Status
      },
    ],
  });

  console.log('Created example tasks.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Seeding finished.');
  });