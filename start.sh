#!/bin/bash

# Script para iniciar o Domain Tester em modo de desenvolvimento

echo "🚀 Iniciando Domain Tester em modo de desenvolvimento..."

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não está instalado. Por favor, instale o Node.js 18+ para continuar."
    exit 1
fi

# Verificar se as dependências estão instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Criar diretório de dados se não existir
if [ ! -d "data" ]; then
    echo "📁 Criando diretório de dados..."
    mkdir -p data
fi

# Verificar se o arquivo .env.local existe
if [ ! -f ".env.local" ]; then
    echo "⚙️ Criando arquivo de configuração..."
    echo "JWT_SECRET=your-super-secret-jwt-key-change-in-production" > .env.local
    echo "NEXTAUTH_URL=http://localhost:3000" >> .env.local
fi

echo "✅ Iniciando servidor de desenvolvimento..."
echo "🌐 Acesse: http://localhost:3000"
echo "👤 Usuário padrão: admin | Senha: admin123"
echo ""
echo "Pressione Ctrl+C para parar o servidor"

npm run dev
