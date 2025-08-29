#!/bin/bash

# Script para reiniciar o Domain Tester

echo "🔄 Reiniciando Domain Tester..."

# Parar o servidor
./stop.sh

# Aguardar um momento
sleep 2

# Iniciar novamente
./start.sh
