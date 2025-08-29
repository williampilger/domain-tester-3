# Domain Tester 🌐

```
⚠️ Este projeto foi desenvolvido e testado 100% pelo Github Copilot (Claude Sonnet 4). Nada disso foi revisado por mim, use por sua conta e risco.
```

Sistema completo para teste e análise de domínios, sites e servidores desenvolvido em Next.js com TypeScript.

## ✨ Funcionalidades

### 🔍 Análise Completa de Domínios
- **Resolução de DNS**: Registros A, AAAA, MX, NS, TXT, CNAME, SOA
- **Informações de IP**: Resolução e validação de endereços
- **Certificados SSL**: Validação, emissor, datas de validade
- **Análise de Segurança**: Headers de segurança (HSTS, CSP, X-Frame-Options)
- **Teste de Velocidade**: Tempo de resposta, TTFB, velocidade de download
- **Informações de Hosting**: Provedor, servidor, tecnologias utilizadas
- **WHOIS**: Informações de registro do domínio

### ⚡ Teste de Stress
- Simulação de múltiplos usuários concorrentes
- Configuração de duração do teste
- Métricas detalhadas:
  - Total de requisições
  - Taxa de sucesso/falha
  - Tempo médio, mínimo e máximo de resposta
  - Requisições por segundo
  - Log de erros

### 👥 Sistema de Usuários
- Autenticação segura com JWT
- Usuário administrador padrão
- Suporte a múltiplos usuários
- Histórico de testes por usuário

### 💾 Banco de Dados
- SQLite em arquivo para simplicidade
- Armazenamento de resultados de testes
- Histórico completo de análises

## 🚀 Instalação e Uso

### Pré-requisitos
- Node.js 18+ 
- npm
- Sistema operacional Linux/macOS/Windows

### Instalação Rápida

1. **Clone ou baixe o projeto**
```bash
cd DomainTester3
```

2. **Execute o script de inicialização**
```bash
./start.sh
```

O script irá:
- Verificar dependências
- Instalar pacotes necessários
- Criar diretórios de dados
- Iniciar o servidor de desenvolvimento

3. **Acesse a aplicação**
- URL: http://localhost:3000
- Usuário padrão: `admin`
- Senha padrão: `admin123`

### Scripts Disponíveis

#### Desenvolvimento
```bash
./start.sh          # Inicia em modo desenvolvimento
./stop.sh           # Para o servidor
./restart.sh        # Reinicia o servidor
```

#### Produção
```bash
./start-production.sh   # Constrói e inicia em modo produção
```

#### Comandos NPM
```bash
npm run dev         # Desenvolvimento
npm run build       # Construir para produção
npm run start       # Iniciar produção
npm run lint        # Verificar código
```

## 📖 Como Usar

### 1. Análise de Domínio

1. Faça login no sistema
2. Acesse o Dashboard
3. Na aba "Análise de Domínio":
   - Digite o domínio ou IP (ex: `google.com` ou `8.8.8.8`)
   - Opcionalmente, especifique uma porta
   - Clique em "Analisar Domínio"

4. Visualize os resultados organizados em seções:
   - **Informações Básicas**: Domínio, IP, porta
   - **Registros DNS**: Todos os registros DNS encontrados
   - **Certificado SSL**: Status e detalhes do certificado
   - **Teste de Velocidade**: Métricas de performance
   - **Segurança**: Headers e configurações de segurança
   - **Hospedagem**: Informações do servidor e tecnologias

### 2. Teste de Stress

1. Na aba "Teste de Stress":
   - Digite o domínio ou IP
   - Configure o número de usuários concorrentes (1-100)
   - Defina a duração do teste (5-300 segundos)
   - Clique em "Iniciar Teste de Stress"

2. Acompanhe os resultados:
   - Total de requisições executadas
   - Taxa de sucesso e falha
   - Tempos de resposta (médio, mínimo, máximo)
   - Requisições por segundo
   - Log de erros encontrados

### 3. Gestão de Usuários

#### Criar Novo Usuário
1. Acesse `/auth/register`
2. Preencha os dados
3. Faça login com as credenciais criadas

#### Usuário Administrador
- Username: `admin`
- Password: `admin123`
- Criado automaticamente na primeira execução

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Next.js 15**: Framework React com SSR
- **TypeScript**: Tipagem estática
- **Tailwind CSS**: Estilização responsiva
- **React Hooks**: Gerenciamento de estado

### Backend
- **Next.js API Routes**: APIs serverless
- **SQLite**: Banco de dados em arquivo
- **bcryptjs**: Hash de senhas
- **JWT**: Autenticação de usuários

### Ferramentas de Análise
- **DNS Promises**: Resolução de DNS nativa do Node.js
- **OpenSSL**: Análise de certificados SSL
- **Axios**: Requisições HTTP
- **Child Process**: Execução de comandos do sistema

## 📁 Estrutura do Projeto

```
DomainTester3/
├── src/
│   ├── app/
│   │   ├── api/          # APIs do Next.js
│   │   ├── auth/         # Páginas de autenticação
│   │   ├── dashboard/    # Dashboard principal
│   │   └── page.tsx      # Página inicial
│   └── lib/
│       ├── auth.ts       # Utilitários de autenticação
│       ├── database.ts   # Configuração do banco
│       └── domain-utils.ts # Utilitários de análise
├── data/                 # Banco de dados SQLite
├── public/              # Arquivos estáticos
├── scripts/             # Scripts de controle
└── docs/               # Documentação
```

## 🔧 Configuração

### Variáveis de Ambiente

Edite o arquivo `.env.local`:

```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
```

### Porta Customizada

Para usar uma porta diferente:

```bash
PORT=8080 npm run dev
```

## 🐛 Troubleshooting

### Problemas Comuns

1. **Erro de permissão nos scripts**
```bash
chmod +x *.sh
```

2. **Porta 3000 em uso**
```bash
./stop.sh  # Para processos existentes
# ou use outra porta
PORT=8080 ./start.sh
```

3. **Erro de dependências**
```bash
rm -rf node_modules package-lock.json
npm install
```

4. **Banco de dados corrompido**
```bash
rm -rf data/domain_tester.db
# O banco será recriado automaticamente
```

### Logs de Debug

Para habilitar logs detalhados:

```bash
DEBUG=* npm run dev
```

## 🔒 Segurança

### Recomendações para Produção

1. **Altere o JWT_SECRET**
```bash
openssl rand -base64 32
```

2. **Configure HTTPS**
3. **Use variáveis de ambiente seguras**
4. **Configure firewall adequadamente**
5. **Mantenha dependências atualizadas**

### Limitações de Segurança

- Testes de stress limitados a 100 usuários concorrentes
- Duração máxima de teste: 5 minutos
- Rate limiting automático nas APIs

## 📊 Exemplos de Uso

### Análise Básica
```
Domínio: google.com
Resultado: IP, DNS records, SSL válido, headers de segurança
```

### Teste com Porta Específica
```
Domínio: example.com
Porta: 8080
Resultado: Análise específica da porta 8080
```

### Teste de Stress
```
Domínio: mysite.com
Usuários: 50
Duração: 60s
Resultado: 3000 requisições, 99% sucesso, 150ms médio
```

## 📞 Suporte

Para problemas ou dúvidas:

1. Verifique os logs do console
2. Consulte a seção de Troubleshooting
3. Verifique se todas as dependências estão instaladas
4. Teste com o usuário administrador padrão

## 📝 Licença

Este projeto é desenvolvido para fins educacionais e de teste. Use responsavelmente e respeite os termos de serviço dos sites testados.

## 🎯 Roadmap

### Próximas Funcionalidades
- [ ] Exportação de relatórios em PDF
- [ ] Agendamento de testes automáticos
- [ ] Integração com APIs de monitoramento
- [ ] Dashboard com gráficos
- [ ] Notificações por e-mail
- [ ] API REST para integração
- [ ] Suporte a múltiplos idiomas
- [ ] Temas personalizáveis

---

**Domain Tester** - Sistema completo para análise de domínios e testes de performance 🚀
