#!/bin/bash

# Script para parar o Domain Tester

echo "🛑 Parando Domain Tester..."

# Encontrar e matar processos do Node.js rodando na porta 3000
PORT_PROCESS=$(lsof -ti:3000)

if [ ! -z "$PORT_PROCESS" ]; then
    echo "🔍 Encontrado processo na porta 3000: $PORT_PROCESS"
    kill -9 $PORT_PROCESS
    echo "✅ Processo parado com sucesso!"
else
    echo "ℹ️ Nenhum processo encontrado na porta 3000"
fi

# Matar processos do npm/node relacionados ao Domain Tester
DOMAIN_TESTER_PROCESSES=$(ps aux | grep -E "(npm|node).*domain-tester" | grep -v grep | awk '{print $2}')

if [ ! -z "$DOMAIN_TESTER_PROCESSES" ]; then
    echo "🔍 Encontrados processos do Domain Tester: $DOMAIN_TESTER_PROCESSES"
    echo $DOMAIN_TESTER_PROCESSES | xargs kill -9
    echo "✅ Processos do Domain Tester parados!"
else
    echo "ℹ️ Nenhum processo do Domain Tester encontrado"
fi

echo "🏁 Domain Tester parado completamente!"
