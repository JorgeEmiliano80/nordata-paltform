-- Add indexes for better performance on foreign key relationships and common queries
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_dataset_id ON public.customers(dataset_id);
CREATE INDEX IF NOT EXISTS idx_datasets_user_id ON public.datasets(user_id);
CREATE INDEX IF NOT EXISTS idx_pipelines_user_id ON public.pipelines(user_id);
CREATE INDEX IF NOT EXISTS idx_pipelines_dataset_id ON public.pipelines(dataset_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_customer_id ON public.transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_dataset_id ON public.transactions(dataset_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- Add indexes for common search fields
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_customer_id ON public.customers(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_transaction_id ON public.transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(transaction_date);

-- Add missing triggers for updated_at columns
CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON public.customers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_datasets_updated_at
    BEFORE UPDATE ON public.datasets
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add computed columns for better analytics
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS last_activity_date TIMESTAMP WITH TIME ZONE;

-- Create a view for customer analytics
CREATE OR REPLACE VIEW public.customer_analytics AS
SELECT 
    c.id,
    c.user_id,
    c.customer_id,
    c.name,
    c.email,
    c.age,
    c.gender,
    c.segment,
    c.risk_level,
    c.total_spent,
    c.total_orders,
    c.last_purchase_date,
    COUNT(t.id) as transaction_count,
    COALESCE(SUM(t.amount), 0) as calculated_total_spent,
    MAX(t.transaction_date) as last_transaction_date,
    AVG(t.amount) as avg_transaction_amount
FROM public.customers c
LEFT JOIN public.transactions t ON c.id = t.customer_id
GROUP BY c.id, c.user_id, c.customer_id, c.name, c.email, c.age, c.gender, c.segment, c.risk_level, c.total_spent, c.total_orders, c.last_purchase_date;

-- Create RLS policy for the view
CREATE POLICY "Users can view their own customer analytics" 
ON public.customer_analytics 
FOR SELECT 
USING (auth.uid() = user_id);