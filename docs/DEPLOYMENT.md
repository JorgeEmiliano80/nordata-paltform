
# Guia de Deploy - NORDATA.AI

## 🚀 Configuração de Produção

### 1. Configuração do Supabase

#### Secrets Necessários
Configure os seguintes secrets no dashboard do Supabase:

```bash
# Acesse: https://supabase.com/dashboard/project/sveaehifwnoetwfxkasn/settings/functions
DATABRICKS_API_URL=https://your-databricks-endpoint.com
DATABRICKS_TOKEN=dapi123456789abcdef
```

#### Configuração do Master User
Execute a Edge Function para configurar o usuário master:

```bash
# Via Supabase CLI
supabase functions invoke setup-master-user

# Ou via cURL
curl -X POST 'https://sveaehifwnoetwfxkasn.supabase.co/functions/v1/setup-master-user' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json'
```

### 2. Deploy do Frontend

#### Vercel (Recomendado)
```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod
```

#### Netlify
```bash
# 1. Build do projeto
npm run build

# 2. Deploy via Netlify CLI
netlify deploy --prod --dir=dist
```

### 3. Configuração de Domínio

#### Variáveis de Ambiente
```bash
# .env.production
VITE_SUPABASE_URL=https://sveaehifwnoetwfxkasn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### CORS Configuration
Atualize as configurações de CORS no Supabase:
```bash
# Dashboard > Authentication > URL Configuration
Site URL: https://your-domain.com
Additional Redirect URLs: https://your-domain.com/auth/callback
```

### 4. Monitoramento

#### Logs em Produção
- **Edge Functions**: `supabase functions logs`
- **Database**: Dashboard do Supabase
- **Frontend**: Vercel/Netlify Analytics

#### Métricas Importantes
- Tempo de resposta das APIs
- Taxa de sucesso dos uploads
- Erros de processamento
- Uso de storage

### 5. Backup e Segurança

#### Backup Automático
```sql
-- Configurar backup automático no Supabase
-- Dashboard > Settings > Database > Backup
```

#### Políticas de Segurança
- SSL/TLS obrigatório
- Rate limiting nas Edge Functions
- Validação de inputs
- Logs de auditoria

### 6. Troubleshooting

#### Problemas Comuns
1. **Edge Functions timeout**: Aumentar timeout no `config.toml`
2. **Storage permissions**: Verificar RLS policies
3. **CORS errors**: Atualizar configurações de redirect
4. **Database locks**: Otimizar queries lentas

#### Comandos Úteis
```bash
# Verificar status do projeto
supabase status

# Reset do banco (CUIDADO!)
supabase db reset

# Aplicar migrações
supabase db push
```

---

**Suporte**: Para problemas de deploy, consulte a documentação do Supabase ou abra um issue no repositório.
