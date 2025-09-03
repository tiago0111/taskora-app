
# Usar Node.js para extrair o host e a porta de forma fiável
DB_HOST=$(node -p "new URL(process.env.DATABASE_URL).hostname")
DB_PORT=$(node -p "new URL(process.env.DATABASE_URL).port")

# Verificar se as variáveis foram extraídas corretamente
if [ -z "$DB_HOST" ] || [ -z "$DB_PORT" ]; then
  echo "ERRO: Não foi possível extrair DB_HOST ou DB_PORT da DATABASE_URL"
  exit 1
fi

echo "A aguardar pela base de dados em ${DB_HOST} na porta ${DB_PORT}..."

# Esperar que a base de dados esteja pronta
while ! nc -z "$DB_HOST" "$DB_PORT"; do
  sleep 1
done

echo "Base de dados pronta!"

echo "A executar as migrações da base de dados..."
npx prisma migrate deploy

echo "A popular a base de dados (seeding)..."
npx prisma db seed

echo "A iniciar a aplicação..."
exec node dist/src/index.js