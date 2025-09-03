import { PrismaClient, Role, Status } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  const hashedPassword = await bcrypt.hash('password', 10);

  // Use "upsert" para criar o utilizador apenas se ele não existir
  const user = await prisma.user.upsert({
    where: { email: 'admin@taskora.com' },
    update: {}, // Não é necessário atualizar nada se o utilizador já existir
    create: {
      email: 'admin@taskora.com',
      name: 'Admin User',
      password: hashedPassword,
      role: Role.ADMIN,
      bio: 'Perfil do administrador do sistema.',
    },
  });

  console.log(`Admin user is ensured with id: ${user.id}`);

  // Para evitar duplicados, vamos verificar se o projeto de exemplo já existe
  let project = await prisma.project.findFirst({
    where: {
      name: 'Projeto de Exemplo',
      ownerId: user.id,
    },
  });

  if (!project) {
    project = await prisma.project.create({
      data: {
        name: 'Projeto de Exemplo',
        description: 'Um projeto inicial para testar a aplicação.',
        ownerId: user.id,
      },
    });
    console.log(`Created project with id: ${project.id}`);

    // Criar tarefas apenas se o projeto for novo
    await prisma.task.createMany({
      data: [
        {
          title: 'Configurar autenticação',
          description: 'Implementar a autenticação de utilizadores com JWT.',
          projectId: project.id,
          assigneeId: user.id,
          status: Status.EM_PROGRESSO,
        },
        {
          title: 'Desenvolver a dashboard',
          description: 'Criar a interface principal da dashboard.',
          projectId: project.id,
          assigneeId: user.id,
          status: Status.PENDENTE,
        },
        {
          title: 'Desenhar o logo',
          description: 'Criar o logo oficial da aplicação Taskora.',
          projectId: project.id,
          assigneeId: user.id,
          status: Status.CONCLUIDA,
        },
      ],
    });
    console.log('Created example tasks.');
  } else {
    console.log('Example project and tasks already exist.');
  }
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