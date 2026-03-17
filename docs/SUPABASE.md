<https://supabase.com/dashboard/project/wltiqhyvlggihpqhxard/database/schemas>

-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.chat (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id uuid NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  url text DEFAULT ''::text,
  CONSTRAINT chat_pkey PRIMARY KEY (id),
  CONSTRAINT chat_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.debts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  creditor text,
  value numeric,
  amount numeric,
  rate numeric,
  date timestamp with time zone,
  status text,
  user_id uuid,
  CONSTRAINT debts_pkey PRIMARY KEY (id),
  CONSTRAINT debts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.finances (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  fixed_expense numeric NOT NULL DEFAULT '0'::numeric,
  variable_expense numeric NOT NULL DEFAULT '0'::numeric,
  fixed_income numeric NOT NULL DEFAULT '0'::numeric,
  variable_income numeric NOT NULL DEFAULT '0'::numeric,
  debts numeric NOT NULL DEFAULT '0'::numeric,
  investments numeric NOT NULL DEFAULT '0'::numeric,
  user_id uuid UNIQUE,
  CONSTRAINT finances_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.guilhermes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text DEFAULT 'gui'::text,
  age numeric,
  CONSTRAINT guilhermes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.lucas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text DEFAULT 'Luc'::text,
  age date,
  CONSTRAINT lucas_pkey PRIMARY KEY (id)
);
CREATE TABLE public.mock_serasa_debts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_cpf character varying NOT NULL,
  creditor_name character varying NOT NULL,
  original_amount numeric NOT NULL,
  current_amount numeric NOT NULL,
  due_date date NOT NULL,
  status character varying DEFAULT 'Pendente'::character varying,
  CONSTRAINT mock_serasa_debts_pkey PRIMARY KEY (id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone,
  name text,
  cpf text DEFAULT ''::text UNIQUE,
  birth date,
  cep text,
  gender text,
  race text,
  user_id uuid,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profile_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  value numeric,
  type text,
  category text,
  user_id uuid DEFAULT gen_random_uuid(),
  CONSTRAINT transactions_pkey PRIMARY KEY (id),
  CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.victors (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text DEFAULT 'vict'::text,
  birth date,
  CONSTRAINT victors_pkey PRIMARY KEY (id)
);