#!/bin/bash

# Script para construir e iniciar o Domain Tester em modo de produção

echo "🏗️ Construindo Domain Tester para produção..."

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não está instalado. Por favor, instale o Node.js 18+ para continuar."
    exit 1
fi

# Instalar dependências
echo "📦 Instalando dependências..."
npm ci --only=production

# Criar diretório de dados se não existir
if [ ! -d "data" ]; then
    echo "📁 Criando diretório de dados..."
    mkdir -p data
fi

# Construir aplicação
echo "🔨 Construindo aplicação..."
npm run build

# Verificar se o arquivo .env.local existe
if [ ! -f ".env.local" ]; then
    echo "⚙️ Criando arquivo de configuração..."
    echo "JWT_SECRET=$(openssl rand -base64 32)" > .env.local
    echo "NEXTAUTH_URL=http://localhost:3000" >> .env.local
    echo "NODE_ENV=production" >> .env.local
fi

echo "✅ Iniciando servidor de produção..."
echo "🌐 Acesse: http://localhost:3000"
echo "👤 Usuário padrão: admin | Senha: admin123"
echo ""
echo "Pressione Ctrl+C para parar o servidor"

npm start
