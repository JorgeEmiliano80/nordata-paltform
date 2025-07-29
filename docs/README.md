
# NORDATA.AI - Documentação Técnica

## 🏗️ Arquitetura da Plataforma

### Visão Geral
A plataforma NORDATA.AI é uma aplicação de análise de dados que utiliza:
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Autenticação**: Supabase Auth
- **Storage**: Supabase Storage
- **Processamento**: API Externa (Databricks)

### Estrutura de Diretórios
```
src/
├── components/         # Componentes reutilizáveis
├── hooks/             # Hooks personalizados
├── pages/             # Páginas da aplicação
├── integrations/      # Integrações com APIs
└── lib/              # Utilitários

supabase/
├── functions/         # Edge Functions
├── migrations/        # Migrações do banco
└── config.toml       # Configuração do Supabase
```

## 🔐 Sistema de Autenticação

### Tipos de Usuário
1. **Admin (Master User)**
   - Email: `iamjorgear80@gmail.com`
   - Senha: `Jorge41304254#`
   - Permissões: Acesso total à plataforma

2. **Cliente**
   - Acesso apenas por convite
   - Pode processar arquivos e usar chatbot
   - Acesso limitado aos próprios dados

### Fluxo de Autenticação
1. **Login Master**: Usa Edge Function `master-auth`
2. **Login Cliente**: Usa Supabase Auth tradicional
3. **Convites**: Criados pelo admin via Edge Function `admin-invite-user`

## 📊 Estrutura do Banco de Dados

### Tabelas Principais

#### `profiles`
```sql
- user_id: UUID (referência ao auth.users)
- full_name: TEXT
- company_name: TEXT
- industry: TEXT
- role: ENUM ('admin', 'client')
- is_active: BOOLEAN
- accepted_terms: BOOLEAN
```

#### `files`
```sql
- id: UUID (primary key)
- user_id: UUID (foreign key)
- file_name: TEXT
- file_type: TEXT
- file_size: BIGINT
- storage_url: TEXT
- status: ENUM ('uploaded', 'processing', 'done', 'error')
- metadata: JSONB
```

#### `insights`
```sql
- id: UUID (primary key)
- file_id: UUID (foreign key)
- insight_type: ENUM ('cluster', 'anomaly', 'trend', 'summary', 'recommendation')
- title: TEXT
- description: TEXT
- data: JSONB
- confidence_score: NUMERIC
```

#### `chat_history`
```sql
- id: UUID (primary key)
- user_id: UUID (foreign key)
- file_id: UUID (foreign key, nullable)
- message: TEXT
- response: TEXT
- is_user_message: BOOLEAN
```

#### `pending_invitations`
```sql
- id: UUID (primary key)
- email: TEXT
- full_name: TEXT
- company_name: TEXT
- industry: TEXT
- invitation_token: TEXT
- invited_by: UUID (foreign key)
- expires_at: TIMESTAMP
- used_at: TIMESTAMP (nullable)
```

## 🔄 Fluxo de Processamento de Arquivos

### 1. Upload
1. Cliente seleciona arquivo (.csv, .xlsx, .json)
2. Validação de tipo e tamanho (máx. 50MB)
3. Upload para Supabase Storage
4. Criação de registro na tabela `files`

### 2. Processamento
1. Edge Function `process-file` é chamada automaticamente
2. Arquivo é enviado para API do Databricks
3. Status do arquivo atualizado para 'processing'
4. Logs são registrados na tabela `processing_logs`

### 3. Callback
1. Databricks chama Edge Function `handle-databricks-callback`
2. Resultados são salvos na tabela `insights`
3. Status do arquivo atualizado para 'done' ou 'error'
4. Notificações são criadas para o usuário

## 🚀 Edge Functions

### `master-auth`
- **Descrição**: Autenticação do usuário master
- **Entrada**: `{ email, password }`
- **Saída**: `{ user, profile, token }`

### `admin-invite-user`
- **Descrição**: Criação de convites para novos usuários
- **Entrada**: `{ email, fullName, companyName, industry }`
- **Saída**: `{ invitationToken, inviteUrl }`

### `process-file`
- **Descrição**: Envio de arquivo para processamento
- **Entrada**: `{ fileId, userId, fileUrl, fileName, fileType }`
- **Saída**: `{ jobId }`

### `handle-databricks-callback`
- **Descrição**: Processamento de resultados do Databricks
- **Entrada**: `{ jobId, fileId, userId, status, results }`
- **Saída**: `{ success }`

### `setup-master-user`
- **Descrição**: Configuração inicial do usuário master
- **Entrada**: Nenhuma
- **Saída**: `{ success, user_id }`

## 🎯 Funcionalidades por Página

### `/login`
- ✅ Autenticação de usuários
- ✅ Suporte a convites por token
- ✅ Validação de credenciais
- ✅ Redirecionamento baseado em role

### `/dashboard`
- ✅ Estatísticas personalizadas por role
- ✅ Arquivos recentes
- ✅ Ações rápidas contextuais
- ✅ Dados em tempo real

### `/upload`
- ✅ Upload drag-and-drop
- ✅ Validação de arquivos
- ✅ Lista de arquivos com status
- ✅ Ações: visualizar, download, excluir, reprocessar

### `/admin`
- ✅ Gestão de usuários
- ✅ Criação de convites
- ✅ Estatísticas da plataforma
- ✅ Monitoramento de processamentos

### `/chatbot`
- ✅ Chat com IA baseado nos dados
- ✅ Histórico de conversas
- ✅ Contexto por arquivo processado

### `/analytics`
- ✅ Visualização de insights
- ✅ Gráficos e métricas
- ✅ Filtros por período e tipo

## 🛡️ Segurança e Compliance

### LGPD e Lei 25.326
1. **Consentimento**: Checkbox obrigatório nos termos
2. **Minimização**: Apenas dados necessários são coletados
3. **Acesso**: Usuários veem apenas seus próprios dados
4. **Exclusão**: Função `cleanup_file_data` remove todos os dados relacionados
5. **Transparência**: Política de privacidade visível

### Row Level Security (RLS)
- Todas as tabelas possuem RLS habilitado
- Políticas específicas por role (admin/client)
- Funções SECURITY DEFINER para operações privilegiadas

### Validações
- Tipos de arquivo permitidos
- Tamanho máximo de arquivo
- Validação de tokens de convite
- Verificação de permissões em todas as operações

## 📱 Hooks Personalizados

### `useAuth`
- Gerenciamento de autenticação
- Suporte a usuário master
- Verificação de roles
- Persistência de sessão

### `useFiles`
- Operações com arquivos
- Upload, download, exclusão
- Estatísticas e filtros
- Sincronização com backend

### `useAdmin`
- Funcionalidades administrativas
- Gestão de usuários
- Criação de convites
- Estatísticas da plataforma

## 🔧 Configuração e Deploy

### Variáveis de Ambiente (Supabase Secrets)
```
SUPABASE_URL=https://sveaehifwnoetwfxkasn.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABRICKS_API_URL=https://databricks-api-endpoint.com
DATABRICKS_TOKEN=dapi123456789...
```

### Configuração Inicial
1. Executar `supabase start`
2. Aplicar migrações: `supabase db push`
3. Configurar secrets no dashboard do Supabase
4. Executar Edge Function `setup-master-user`

### Deploy
1. **Frontend**: Conectar repositório ao Vercel/Netlify
2. **Backend**: Edge Functions são deployadas automaticamente
3. **Database**: Migrações aplicadas via Supabase CLI

## 🧪 Testes e Validação

### Fluxo de Teste Completo
1. **Login Master**: Verificar acesso admin
2. **Criar Convite**: Testar criação de usuário cliente
3. **Upload Arquivo**: Validar processamento completo
4. **Chatbot**: Testar interação com dados processados
5. **Exclusão**: Verificar remoção completa de dados

### Pontos de Validação
- ✅ Todos os botões funcionais
- ✅ Redirecionamentos corretos
- ✅ Validações de segurança
- ✅ Feedback visual adequado
- ✅ Tratamento de erros

## 📈 Monitoramento

### Logs Disponíveis
- **Processing Logs**: Histórico de processamentos
- **Edge Function Logs**: Logs das funções serverless
- **Database Logs**: Queries e operações do banco
- **Auth Logs**: Eventos de autenticação

### Métricas Importantes
- Tempo de processamento médio
- Taxa de sucesso dos uploads
- Número de insights gerados
- Atividade por usuário

## 🔮 Roadmap

### Próximas Funcionalidades
1. **Notificações Push**: Alertas em tempo real
2. **API Pública**: Endpoints para integrações externas
3. **Dashboards Customizáveis**: Visualizações personalizadas
4. **Relatórios Automáticos**: Exportação de insights
5. **Auditoria Completa**: Logs detalhados de todas as operações

---

**Última Atualização**: 28/01/2025  
**Versão**: 1.0.0  
**Mantido por**: NORDATA.AI Team
