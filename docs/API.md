
# Documentação da API - NORDATA.AI

## 🔗 Edge Functions

### Authentication

#### `POST /functions/v1/master-auth`
Autenticação do usuário master (administrador).

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "iamjorgear80@gmail.com",
  "password": "Jorge41304254#"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "string",
    "user_metadata": {}
  },
  "profile": {
    "user_id": "uuid",
    "full_name": "string",
    "company_name": "string",
    "role": "admin"
  },
  "token": "string"
}
```

#### `POST /functions/v1/setup-master-user`
Configuração inicial do usuário master.

**Headers:**
```
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "message": "Usuario master configurado exitosamente",
  "user_id": "uuid",
  "profile": {}
}
```

### User Management

#### `POST /functions/v1/admin-invite-user`
Criação de convites para novos usuários (apenas admin).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "email": "user@example.com",
  "fullName": "Nome do Usuário",
  "companyName": "Empresa LTDA",
  "industry": "technology"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Convite criado com sucesso",
  "invitationToken": "string",
  "inviteUrl": "https://app.com/login?token=abc123",
  "email": "user@example.com"
}
```

### File Processing

#### `POST /functions/v1/process-file`
Envio de arquivo para processamento no Databricks.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "fileId": "uuid",
  "userId": "uuid",
  "fileUrl": "https://storage.url/file.csv",
  "fileName": "data.csv",
  "fileType": "csv"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Arquivo enviado para processamento com sucesso",
  "jobId": "databricks-job-id"
}
```

#### `POST /functions/v1/handle-databricks-callback`
Callback para receber resultados do Databricks.

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "jobId": "databricks-job-id",
  "fileId": "uuid",
  "userId": "uuid",
  "status": "completed",
  "results": {
    "summary": {},
    "insights": [
      {
        "type": "trend",
        "title": "Tendência Identificada",
        "description": "Descrição do insight",
        "data": {},
        "confidence_score": 0.85
      }
    ],
    "processedFileUrl": "https://storage.url/processed.csv"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Callback processado com sucesso"
}
```

## 📊 Database Functions

### `get_admin_dashboard()`
Retorna estatísticas para o painel administrativo.

**SQL:**
```sql
SELECT * FROM get_admin_dashboard();
```

**Response:**
```sql
user_id | full_name | company_name | role | user_created_at | is_active | total_files | processed_files | failed_files | last_upload | total_chat_messages
```

### `create_invitation(email, full_name, company_name, industry)`
Cria um novo convite de usuário.

**SQL:**
```sql
SELECT create_invitation(
  'user@example.com',
  'Nome do Usuário',
  'Empresa LTDA',
  'technology'
);
```

**Response:**
```sql
invitation_token (TEXT)
```

### `use_invitation(user_uuid, token)`
Utiliza um convite para ativar um usuário.

**SQL:**
```sql
SELECT use_invitation(
  'user-uuid',
  'invitation-token'
);
```

**Response:**
```sql
success (BOOLEAN)
```

### `cleanup_file_data(file_uuid)`
Remove todos os dados relacionados a um arquivo.

**SQL:**
```sql
SELECT cleanup_file_data('file-uuid');
```

**Response:**
```sql
void
```

## 🔒 Row Level Security

### Policies por Tabela

#### `profiles`
- **SELECT**: Usuários podem ver apenas seu próprio perfil
- **INSERT**: Usuários podem criar apenas seu próprio perfil
- **UPDATE**: Usuários podem atualizar apenas seu próprio perfil

#### `files`
- **SELECT**: Usuários veem apenas seus arquivos; admins veem todos
- **INSERT**: Usuários podem inserir apenas com seu user_id
- **UPDATE**: Usuários podem atualizar apenas seus arquivos
- **DELETE**: Usuários podem deletar apenas seus arquivos

#### `insights`
- **SELECT**: Usuários veem insights apenas de seus arquivos
- **INSERT**: Sistema pode inserir insights

#### `chat_history`
- **SELECT**: Usuários veem apenas seu histórico
- **INSERT**: Usuários podem inserir apenas com seu user_id

#### `pending_invitations`
- **SELECT**: Admins podem gerenciar convites; usuários podem ver convites válidos
- **ALL**: Apenas admins podem gerenciar convites

## 🚦 Rate Limiting

### Limites por Endpoint

- **File Upload**: 10 arquivos por minuto
- **Chat Messages**: 60 mensagens por minuto
- **Admin Operations**: 100 operações por minuto

### Headers de Response
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1643723400
```

## 📝 Error Codes

### HTTP Status Codes

- **200**: Sucesso
- **400**: Requisição inválida
- **401**: Não autorizado
- **403**: Proibido
- **404**: Não encontrado
- **429**: Muitas requisições
- **500**: Erro interno do servidor

### Error Response Format
```json
{
  "success": false,
  "error": "Mensagem de erro",
  "code": "ERROR_CODE",
  "details": {}
}
```

## 🔧 Webhooks

### Databricks Callback
Configure o webhook no Databricks para apontar para:
```
https://sveaehifwnoetwfxkasn.supabase.co/functions/v1/handle-databricks-callback
```

### Payload Example
```json
{
  "jobId": "job-123",
  "fileId": "file-uuid",
  "userId": "user-uuid",
  "status": "completed",
  "results": {
    "insights": [...],
    "processedFileUrl": "https://..."
  }
}
```

---

**Última Atualização**: 28/01/2025  
**Versão**: 1.0.0
