-- ═══════════════════════════════════════════════════════
-- LUNA — Schema completo do Supabase
-- Execute este arquivo no SQL Editor do Supabase
-- ═══════════════════════════════════════════════════════

-- Extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS public.users (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  google_id text UNIQUE NOT NULL,
  nome text NOT NULL,
  email text UNIQUE NOT NULL,
  avatar text,
  plano text DEFAULT 'free' CHECK (plano IN ('free','pro','business')),
  criado_em timestamptz DEFAULT now(),
  ultimo_login timestamptz,
  ativo boolean DEFAULT true
);

-- Configurações do usuário
CREATE TABLE IF NOT EXISTS public.settings (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  user_id uuid UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  gemini_api_key text,
  openrouter_api_key text,
  zapi_instance text,
  zapi_token text,
  zapi_client_token text,
  mp_public_key text,
  idioma text DEFAULT 'pt' CHECK (idioma IN ('pt','en','es')),
  configuracoes_json jsonb DEFAULT '{}',
  atualizado_em timestamptz DEFAULT now()
);

-- Conversas do chat
CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  titulo text DEFAULT 'Nova conversa',
  criado_em timestamptz DEFAULT now(),
  atualizado_em timestamptz DEFAULT now()
);

-- Mensagens do chat
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  role text CHECK (role IN ('user','assistant')),
  conteudo text NOT NULL,
  criado_em timestamptz DEFAULT now()
);

-- Notas / Tarefas / Lembretes
CREATE TABLE IF NOT EXISTS public.notes (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  tipo text DEFAULT 'nota' CHECK (tipo IN ('nota','tarefa','lembrete')),
  titulo text,
  conteudo text NOT NULL,
  concluido boolean DEFAULT false,
  lembrete_em timestamptz,
  cor text DEFAULT '#7c6dfa',
  criado_em timestamptz DEFAULT now(),
  atualizado_em timestamptz DEFAULT now()
);

-- Automações WhatsApp
CREATE TABLE IF NOT EXISTS public.automations (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  nome text NOT NULL,
  tipo text NOT NULL,
  ativo boolean DEFAULT true,
  configuracao jsonb DEFAULT '{}',
  criado_em timestamptz DEFAULT now(),
  atualizado_em timestamptz DEFAULT now()
);

-- Usuários WhatsApp
CREATE TABLE IF NOT EXISTS public.wa_users (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  nome text NOT NULL,
  telefone text NOT NULL,
  criado_em timestamptz DEFAULT now()
);

-- Logs de atividade
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id),
  acao text NOT NULL,
  detalhes jsonb DEFAULT '{}',
  criado_em timestamptz DEFAULT now()
);

-- ═══════════════════════════════════════════════
-- NOVAS TABELAS — Finanças e Hábitos
-- ═══════════════════════════════════════════════

-- Transações financeiras
CREATE TABLE IF NOT EXISTS public.finances (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  tipo text NOT NULL CHECK (tipo IN ('gasto','receita')),
  valor numeric(10,2) NOT NULL,
  descricao text NOT NULL,
  categoria text NOT NULL DEFAULT 'outro',
  data date NOT NULL DEFAULT CURRENT_DATE,
  recorrente boolean DEFAULT false,
  criado_em timestamptz DEFAULT now()
);

-- Hábitos
CREATE TABLE IF NOT EXISTS public.habits (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  nome text NOT NULL,
  emoji text DEFAULT '⭐',
  frequencia text NOT NULL DEFAULT 'diario' CHECK (frequencia IN ('diario','semanal')),
  streak_atual int DEFAULT 0,
  streak_maximo int DEFAULT 0,
  meta_dias int DEFAULT 30,
  ativo boolean DEFAULT true,
  criado_em timestamptz DEFAULT now()
);

-- Registros diários de hábitos
CREATE TABLE IF NOT EXISTS public.habit_logs (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  habit_id uuid NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  data date NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE(habit_id, data)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_finances_user_id ON public.finances(user_id);
CREATE INDEX IF NOT EXISTS idx_finances_data ON public.finances(data);
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON public.habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id ON public.habit_logs(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_data ON public.habit_logs(data);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
