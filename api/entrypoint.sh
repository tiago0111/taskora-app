

echo "A executar as migrações da base de dados..."
npx prisma migrate deploy

echo "A popular a base de dados (seeding)..."
npx prisma db seed

echo "A iniciar a aplicação..."
exec node dist/src/index.js