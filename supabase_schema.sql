-- =========================================================================
-- CONTROLE DE BANCO DE DADOS - GESTÃO DE CÉLULAS PARA IGREJA (SUPABASE/POSTGRES)
-- =========================================================================
-- Esse script cria toda a estrutura relacional de tabelas necessárias para o 
-- funcionamento completo da plataforma multi-igrejas (SaaS).
-- Cole este código no "SQL Editor" do seu painel do Supabase e clique em "RUN".

-- Habilita extensão para geração de UUID randômico
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE IGREJAS (Cada congregação assinante do SaaS)
CREATE TABLE IF NOT EXISTS igrejas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    logo TEXT NOT NULL DEFAULT '⛪', -- Pode ser emoji ou URL do logotipo
    cidade VARCHAR(150) NOT NULL,
    estado VARCHAR(50) NOT NULL,
    pastor_presidente VARCHAR(255) NOT NULL,
    telefone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    plano VARCHAR(50) NOT NULL DEFAULT 'Bronze', -- 'Bronze', 'Prata', 'Ouro', 'Master'
    status VARCHAR(50) NOT NULL DEFAULT 'Ativa',  -- 'Ativa', 'Bloqueada'
    quantidade_maxima_usuarios INT NOT NULL DEFAULT 30,
    quantidade_maxima_celulas INT NOT NULL DEFAULT 8,
    data_vencimento DATE NOT NULL,
    cor_principal VARCHAR(20) DEFAULT '#2563EB', -- Cor customizada do tema
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. TABELA DE USUÁRIOS (Líderes, Pastores, Auxiliares e Integrantes)
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    igreja_id UUID REFERENCES igrejas(id) ON DELETE CASCADE, -- NULL indica Administrador Master SaaS
    nome VARCHAR(255) NOT NULL,
    foto TEXT, -- URL de imagem ou Base64
    telefone VARCHAR(50),
    whatsapp VARCHAR(50),
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL DEFAULT '123', -- Senha padrão (criptografe em produção)
    endereco TEXT,
    data_nascimento DATE,
    sexo CHAR(1) CHECK (sexo IN ('M', 'F')),
    estado_civil VARCHAR(100),
    data_conversao DATE,
    data_batismo DATE,
    cargo_atual VARCHAR(100) NOT NULL, -- Cargo da hierarquia (Master SaaS Admin, Pastor Presidente, Administrador da Igreja, Líder Kids de Rede, Líder de Rede, etc.)
    rede_id VARCHAR(50), -- Identificação rápida da rede (Ex: 'azul', 'vermelha')
    lider_direto_id UUID REFERENCES usuarios(id) ON DELETE SET NULL, -- Auto-relacionamento
    observacoes TEXT,
    telefone_responsavel VARCHAR(50), -- Para menores
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. TABELA DE REDES (Estruturas de Coberturas de supervisão na Igreja)
CREATE TABLE IF NOT EXISTS redes (
    id VARCHAR(100) PRIMARY KEY, -- ID legível como 'vermelha', 'azul', 'laranja', etc.
    igreja_id UUID NOT NULL REFERENCES igrejas(id) ON DELETE CASCADE,
    nome VARCHAR(150) NOT NULL,
    cor VARCHAR(20) NOT NULL, -- Código cor Hex
    lider_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. TABELA DE CÉLULAS (Casas anfitriãs registradas de cada congregação)
CREATE TABLE IF NOT EXISTS celulas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    igreja_id UUID NOT NULL REFERENCES igrejas(id) ON DELETE CASCADE,
    nome_celula VARCHAR(255) NOT NULL,
    endereco_completo TEXT NOT NULL,
    cep VARCHAR(20) NOT NULL,
    bairro VARCHAR(150) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    dia_semana VARCHAR(50) NOT NULL, -- Segunda, Terça, Quarta etc.
    horario VARCHAR(20) NOT NULL, -- Ex: "19:30"
    lider_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    auxiliares UUID[] DEFAULT '{}', -- Array de UUIDs de auxiliares da célula
    rede_id VARCHAR(100),
    supervisor_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    quantidade_integrantes INT NOT NULL DEFAULT 0,
    status_celula VARCHAR(50) NOT NULL DEFAULT 'VERDE', -- VERDE, AMARELO, VERMELHO, AZUL
    tipo_celula VARCHAR(50) DEFAULT 'Mista', -- Mista, Jovem, Kids, Homens etc.
    data_abertura DATE NOT NULL,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. TABELA DE RELATÓRIOS SEMANAIS (Preenchimento pelos líderes)
CREATE TABLE IF NOT EXISTS relatorios_semanais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    igreja_id UUID NOT NULL REFERENCES igrejas(id) ON DELETE CASCADE,
    celula_id UUID NOT NULL REFERENCES celulas(id) ON DELETE CASCADE,
    aconteceu BOOLEAN NOT NULL DEFAULT TRUE,
    quantidade_presentes INT NOT NULL DEFAULT 0,
    visitantes INT NOT NULL DEFAULT 0,
    decisao INT NOT NULL DEFAULT 0, -- Decisões por Cristo
    pedidos_oracao TEXT,
    observacoes TEXT,
    foto_celula TEXT, -- URL ou Base64 representativa da reunião
    data_relatorio DATE NOT NULL,
    preenchido_por UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. TABELA DE PRESENÇAS (Registro individual de quem foi na reunião)
CREATE TABLE IF NOT EXISTS presencas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    igreja_id UUID NOT NULL REFERENCES igrejas(id) ON DELETE CASCADE,
    relatorio_id UUID NOT NULL REFERENCES relatorios_semanais(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    presente BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. TABELA DE NOTIFICAÇÕES (Alertas individuais para líderes/pastores)
CREATE TABLE IF NOT EXISTS notificacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    igreja_id UUID NOT NULL REFERENCES igrejas(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT NOT NULL,
    lida BOOLEAN NOT NULL DEFAULT FALSE,
    tipo VARCHAR(100) NOT NULL, -- 'relatorio_pendente', 'promocao_disponivel', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. TABELA DE SAAS EMAILS (Histórico corporativo de e-mails de faturamento, ativação e comunicados)
CREATE TABLE IF NOT EXISTS saas_emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    destinatario VARCHAR(255) NOT NULL,
    assunto VARCHAR(255) NOT NULL,
    conteudo TEXT NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'Enviado', 'Faturamento Pendente', 'Falha na Transação', 'Aprovado'
    tipo VARCHAR(50) NOT NULL,   -- 'sucesso_cadastro', 'processamento', 'erro_pagamento', 'link_cadastro', 'atualizacao_sistema'
    link TEXT,                   -- Link opcional de ativação/faturamento
    data TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);


-- =========================================================================
-- EXEMPLO DE SEED - INSERÇÃO DE DADOS INICIAIS DE TESTE
-- =========================================================================

-- Inserindo o Davi Ramos como Administrador Master SaaS (Não pertence a nenhuma igreja)
-- O email foi atualizado para: 7daviramos@gmail.com
INSERT INTO usuarios (id, igreja_id, nome, email, senha, cargo_atual, foto, telefone, whatsapp, endereco, created_at)
VALUES (
    'a308ef06-df52-4752-9659-cb14e0ae2cae',
    NULL,
    'Davi Ramos (Dono SaaS)',
    '7daviramos@gmail.com',
    'admin', -- Recomendamos alterar a senha no primeiro acesso
    'Master SaaS Admin',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
    '(24) 99111-0000',
    '24991110000',
    'Av. Koeler, 100 - Centro, Petrópolis - RJ',
    NOW()
) ON CONFLICT (email) DO NOTHING;


-- Inserindo uma Igreja de Exemplo
INSERT INTO igrejas (id, nome, logo, cidade, estado, pastor_presidente, telefone, email, plano, status, quantidade_maxima_usuarios, quantidade_maxima_celulas, data_vencimento, cor_principal)
VALUES (
    '8b6c4598-f472-4d14-88aa-cb200d72cafe',
    'Lagoinha Petrópolis',
    '⛪',
    'Petrópolis',
    'Rio de Janeiro',
    'Pr. Marcos Andrade',
    '(24) 98888-7777',
    'pres@lagoinha.com',
    'Ouro',
    'Ativa',
    100,
    40,
    '2028-12-31',
    '#2563EB'
) ON CONFLICT DO NOTHING;
