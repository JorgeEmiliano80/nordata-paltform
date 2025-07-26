-- Criar tabela de perfis de usuário
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  company_name TEXT,
  industry TEXT CHECK (industry IN ('agronegocio', 'varejo', 'automotriz', 'industria', 'ecommerce', 'turismo', 'outros')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de datasets/arquivos carregados
CREATE TABLE public.datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  file_type TEXT CHECK (file_type IN ('csv', 'excel', 'json')),
  file_url TEXT,
  metadata JSONB,
  insights JSONB,
  row_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de pipelines
CREATE TABLE public.pipelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  dataset_id UUID REFERENCES public.datasets(id) ON DELETE CASCADE,
  configuration JSONB,
  status TEXT CHECK (status IN ('draft', 'active', 'paused', 'completed')) DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de clientes (extraída dos dados)
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  dataset_id UUID REFERENCES public.datasets(id) ON DELETE CASCADE,
  customer_id TEXT NOT NULL,
  name TEXT,
  email TEXT,
  age INTEGER,
  gender TEXT,
  segment TEXT,
  total_spent DECIMAL(12,2) DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  last_purchase_date DATE,
  risk_level TEXT CHECK (risk_level IN ('baixo', 'medio', 'alto')) DEFAULT 'baixo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, dataset_id, customer_id)
);

-- Criar tabela de transações/vendas
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  dataset_id UUID REFERENCES public.datasets(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  transaction_id TEXT,
  amount DECIMAL(12,2) NOT NULL,
  product_name TEXT,
  product_category TEXT,
  quantity INTEGER DEFAULT 1,
  transaction_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para datasets
CREATE POLICY "Users can view their own datasets"
  ON public.datasets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own datasets"
  ON public.datasets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own datasets"
  ON public.datasets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own datasets"
  ON public.datasets FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas RLS para pipelines
CREATE POLICY "Users can view their own pipelines"
  ON public.pipelines FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pipelines"
  ON public.pipelines FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pipelines"
  ON public.pipelines FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pipelines"
  ON public.pipelines FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas RLS para customers
CREATE POLICY "Users can view their own customers"
  ON public.customers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own customers"
  ON public.customers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customers"
  ON public.customers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own customers"
  ON public.customers FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas RLS para transactions
CREATE POLICY "Users can view their own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
  ON public.transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
  ON public.transactions FOR DELETE
  USING (auth.uid() = user_id);

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para atualizar timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pipelines_updated_at
  BEFORE UPDATE ON public.pipelines
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Criar bucket de storage para arquivos
INSERT INTO storage.buckets (id, name, public) VALUES ('datasets', 'datasets', false);

-- Políticas de storage
CREATE POLICY "Users can upload their own files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'datasets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'datasets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own files"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'datasets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'datasets' AND auth.uid()::text = (storage.foldername(name))[1]);