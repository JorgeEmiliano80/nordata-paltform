
# NORDATA.AI - Plataforma de Análise de Dados

## 🎯 Visão Geral

NORDATA.AI é uma plataforma completa de análise de dados que permite aos usuários fazer upload de arquivos, processá-los usando inteligência artificial e obter insights automatizados. A plataforma é administrada exclusivamente pela equipe NORDATA, com acesso de clientes apenas por convite.

## ✨ Funcionalidades

### 🔐 Sistema de Autenticação
- **Login por convite**: Acesso restrito a usuários convidados
- **Usuário Master**: Administrador da plataforma
- **Controle de roles**: Admin e Cliente com permissões diferenciadas

### 📁 Gestão de Arquivos
- **Upload seguro**: Suporte a CSV, Excel (.xlsx, .xls) e JSON
- **Processamento automático**: Integração com Databricks para análise
- **Insights em tempo real**: Geração automática de análises
- **Histórico completo**: Rastreamento de status e logs

### 💬 Chat Inteligente
- **IA Conversacional**: Chat baseado nos dados processados
- **Contexto personalizado**: Respostas baseadas nos arquivos do usuário
- **Histórico de conversas**: Persistência de interações

### 👥 Painel Administrativo
- **Gestão de usuários**: Criar, editar e desativar contas
- **Sistema de convites**: Criação de tokens de acesso
- **Monitoramento**: Visualização de atividades e estatísticas
- **Logs de sistema**: Rastreamento de operações

## 🏗️ Tecnologias Utilizadas

### Frontend
- **React 18** + **TypeScript**
- **Tailwind CSS** para estilização
- **Vite** como build tool
- **Shadcn/ui** para componentes

### Backend
- **Supabase** (PostgreSQL + Edge Functions)
- **Supabase Auth** para autenticação
- **Supabase Storage** para arquivos
- **Row Level Security** para proteção de dados

### Integrações
- **Databricks** para processamento de dados
- **API Externa** para análise de IA

## 📊 Estrutura do Projeto

```
src/
├── components/         # Componentes React
│   ├── ui/            # Componentes base (Shadcn)
│   ├── FileUpload.tsx # Upload de arquivos
│   ├── FilesList.tsx  # Lista de arquivos
│   └── ...
├── hooks/             # Hooks personalizados
│   ├── useAuth.ts     # Autenticação
│   ├── useFiles.ts    # Gestão de arquivos
│   └── useAdmin.ts    # Funcionalidades admin
├── pages/             # Páginas da aplicação
│   ├── Login.tsx      # Página de login
│   ├── Dashboard.tsx  # Dashboard principal
│   ├── Upload.tsx     # Upload de arquivos
│   ├── AdminPanel.tsx # Painel administrativo
│   └── ...
├── integrations/      # Integrações externas
│   └── supabase/      # Cliente Supabase
└── lib/              # Utilitários

supabase/
├── functions/         # Edge Functions
│   ├── master-auth/   # Autenticação master
│   ├── process-file/  # Processamento de arquivos
│   └── ...
├── migrations/        # Migrações do banco
└── config.toml       # Configuração
```

## 🚀 Instalação e Configuração

### 1. Pré-requisitos
```bash
# Node.js 18+ e npm/yarn
node --version
npm --version

# Supabase CLI
npm install -g supabase
```

### 2. Configuração do Projeto
```bash
# Clonar o repositório
git clone <repository-url>
cd nordata-ai

# Instalar dependências
npm install

# Configurar Supabase
supabase start
supabase db push
```

### 3. Configuração de Secrets
Configure os seguintes secrets no Supabase:
```bash
# Dashboard > Settings > Edge Functions > Secrets
DATABRICKS_API_URL=https://your-databricks-endpoint.com
DATABRICKS_TOKEN=dapi123456789abcdef
```

### 4. Configuração do Master User
```bash
# Executar função para criar usuário master
supabase functions invoke setup-master-user
```

### 5. Execução Local
```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 🔑 Credenciais de Acesso

### Usuário Master (Administrador)
- **Email**: `iamjorgear80@gmail.com`
- **Senha**: `Jorge41304254#`
- **Permissões**: Acesso total ao sistema

### Clientes
- Acesso apenas por convite
- Criados pelo administrador
- Permissões limitadas aos próprios dados

## 📖 Documentação

### Guias Disponíveis
- [**Documentação Técnica**](./docs/README.md) - Arquitetura e implementação
- [**Guia de Deploy**](./docs/DEPLOYMENT.md) - Configuração de produção
- [**Documentação da API**](./docs/API.md) - Endpoints e funções

### Funcionalidades por Página

#### `/login`
- ✅ Autenticação segura
- ✅ Suporte a tokens de convite
- ✅ Validação de credenciais
- ✅ Redirecionamento por role

#### `/dashboard`
- ✅ Estatísticas personalizadas
- ✅ Arquivos recentes
- ✅ Ações rápidas
- ✅ Visão geral da conta

#### `/upload`
- ✅ Upload drag-and-drop
- ✅ Validação de arquivos
- ✅ Processamento automático
- ✅ Acompanhamento de status

#### `/admin`
- ✅ Gestão de usuários
- ✅ Criação de convites
- ✅ Estatísticas da plataforma
- ✅ Monitoramento de atividades

#### `/chatbot`
- ✅ Chat com IA
- ✅ Contexto baseado em dados
- ✅ Histórico de conversas
- ✅ Respostas personalizadas

## 🛡️ Segurança e Compliance

### Proteção de Dados
- **LGPD** e **Lei 25.326** compliant
- **Row Level Security** em todas as tabelas
- **Criptografia** de dados sensíveis
- **Auditoria** de todas as operações

### Validações
- Tipos de arquivo permitidos
- Tamanho máximo (50MB)
- Autenticação obrigatória
- Verificação de permissões

## 🧪 Testes

### Fluxo de Teste Completo
```bash
# 1. Login como master
# Email: iamjorgear80@gmail.com
# Senha: Jorge41304254#

# 2. Criar convite para cliente
# Admin Panel > Convidar Usuário

# 3. Fazer upload de arquivo
# Formatos: CSV, Excel, JSON
# Máximo: 50MB

# 4. Acompanhar processamento
# Status: uploaded → processing → done

# 5. Testar chatbot
# Conversar sobre dados processados
```

### Validações Importantes
- ✅ Todos os botões funcionais
- ✅ Redirecionamentos corretos
- ✅ Tratamento de erros
- ✅ Feedback visual adequado
- ✅ Segurança por roles

## 📈 Monitoramento

### Métricas Disponíveis
- Tempo de processamento
- Taxa de sucesso de uploads
- Atividade por usuário
- Insights gerados

### Logs do Sistema
- Processing logs
- Edge function logs
- Database logs
- Auth logs

## 🔮 Roadmap

### Próximas Funcionalidades
- [ ] Notificações push
- [ ] API pública
- [ ] Dashboards customizáveis
- [ ] Relatórios automatizados
- [ ] Auditoria avançada

## 🤝 Suporte

### Contato
- **Email**: suporte@nordata.ai
- **Documentação**: [docs/](./docs/)
- **Issues**: GitHub Issues

### Troubleshooting
Consulte a [documentação técnica](./docs/README.md) para problemas comuns e soluções.

---

**Desenvolvido por**: NORDATA.AI Team  
**Versão**: 1.0.0  
**Licença**: Proprietária  
**Última Atualização**: 28/01/2025
