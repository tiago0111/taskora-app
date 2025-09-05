import { PrismaClient, Role, Status } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  const adminPassword = await bcrypt.hash('password', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@taskora.com' },
    update: {},
    create: {
      email: 'admin@taskora.com',
      name: 'Admin User',
      password: adminPassword,
      role: Role.ADMIN,
    },
  });
  console.log(`Admin user ensured with id: ${adminUser.id}`);

  const demoPassword = await bcrypt.hash('password123', 10); // Use uma password simples
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@taskora.com' },
    update: {},
    create: {
      email: 'demo@taskora.com',
      name: 'Demo User',
      password: demoPassword,
      role: Role.USER, 
    },
  });
  console.log(`Demo user ensured with id: ${demoUser.id}`);

  const existingDemoProject = await prisma.project.findFirst({
      where: {
          ownerId: demoUser.id,
          name: 'Projeto de Demonstração'
      }
  });

  if (!existingDemoProject) {
      const demoProject = await prisma.project.create({
        data: {
          name: 'Projeto de Demonstração',
          description: 'Um projeto para experimentar as funcionalidades do Taskora.',
          ownerId: demoUser.id,
          tasks: {
            create: [
              { title: 'Explorar o Kanban Board', assigneeId: demoUser.id, status: 'PENDENTE' },
              { title: 'Testar o Pomodoro Timer', assigneeId: demoUser.id, status: 'EM_PROGRESSO' },
              { title: 'Criar uma nova tarefa', assigneeId: demoUser.id, status: 'PENDENTE' },
            ],
          },
        },
      });
      console.log(`Created demo project with id: ${demoProject.id}`);
  } else {
      console.log('Demo project already exists.');
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