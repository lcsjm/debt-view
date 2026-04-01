-- 1. Cria a coluna json_url na tabela chat, caso ainda não exista.
ALTER TABLE public.chat ADD COLUMN IF NOT EXISTS json_url text;

-- 2. Cria o bucket publico para armazenar os arquivos json das conversas.
-- Ignora se o bucket já existe.
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat_history', 'chat_history', true)
ON CONFLICT (id) DO NOTHING;
