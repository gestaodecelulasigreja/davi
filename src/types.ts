/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Cargo {
  MasterAdmin = "Master SaaS Admin",
  PastorPresidente = "Pastor Presidente",
  Administrador = "Administrador da Igreja",
  LiderKidsRede = "Líder Kids de Rede",
  LiderRede = "Líder de Rede",
  LiderArea = "Líder de Área",
  SupervisorSetor = "Supervisor de Setor",
  LiderSupervisor = "Líder Supervisor",
  LiderCelula = "Líder de Célula",
  AuxiliarCelula = "Auxiliar de Célula",
  Integrante = "Integrante",
}

export interface SaasEmail {
  id: string;
  destinatario: string;
  assunto: string;
  conteudo: string;
  status: "Enviado" | "Faturamento Pendente" | "Falha na Transação" | "Aprovado";
  data: string;
  tipo: "sucesso_cadastro" | "processamento" | "erro_pagamento" | "link_cadastro" | "atualizacao_sistema";
  link?: string;
}

export interface Igreja {
  id: string;
  nome: string;
  logo: string; // text/emoji or URL
  cidade: string;
  estado: string;
  pastor_presidente: string;
  telefone: string;
  email: string;
  plano: "Bronze" | "Prata" | "Ouro" | "Master" | "Cortesia";
  status: "Ativa" | "Bloqueada";
  quantidade_maxima_usuarios: number;
  quantidade_maxima_celulas: number;
  data_vencimento: string;
  created_at: string;
  corPrincipal?: string; // Hex color
}

export interface Usuario {
  id: string;
  igreja_id: string | null; // null for SaaS MasterAdmin
  nome: string;
  foto: string; // base64 or placeholder URL
  telefone: string;
  whatsapp: string; // digits only or wa.me form
  email: string;
  senha?: string;
  endereco: string;
  data_nascimento: string;
  sexo: "M" | "F";
  estado_civil: "Solteiro(a)" | "Casado(a)" | "Divorciado(a)" | "Viúvo(a)";
  data_conversao?: string;
  data_batismo?: string;
  cargo_atual: Cargo;
  rede_id: string | null; // color reference
  lider_direto_id: string | null; // Supervisor or parent
  observacoes: string;
  telefone_responsavel?: string; // For kids' cell members
  created_at: string;
}

export interface Rede {
  id: string; // "vermelha", "azul", etc.
  igreja_id: string;
  nome: string;
  cor: string; // hex or tailwind class
  lider_id: string;
}

export enum CellStatus {
  VERDE = "VERDE",      // Saudável
  AMARELO = "AMARELO",  // Atenção
  VERMELHO = "VERMELHO",// Problema
  AZUL = "AZUL",        // Multiplicação
}

export interface Celula {
  id: string;
  igreja_id: string;
  nome_celula: string;
  endereco_completo: string;
  cep: string;
  bairro: string; // Bairro de Petrópolis (Quitandinha, Itaipava, etc.)
  latitude: number;
  longitude: number;
  dia_semana: "Segunda" | "Terça" | "Quarta" | "Quinta" | "Sexta" | "Sábado" | "Domingo";
  horario: string;
  lider_id: string; // Usuario ID
  auxiliares: string[]; // up to 2 Usuario IDs
  rede_id: string;
  supervisor_id: string | null; // Usuario ID
  quantidade_integrantes: number;
  status_celula: CellStatus;
  tipo_celula?: "Mista" | "Jovem" | "Adolescentes" | "Kids" | "Homens" | "Mulheres"; // Category
  data_abertura: string;
  observacoes: string;
  created_at: string;
}

export interface IntegranteCelula {
  id: string;
  igreja_id: string;
  celula_id: string;
  usuario_id: string; // Reference to Usuario
  data_entrada: string;
  observacoes?: string;
}

export interface RelatorioSemanal {
  id: string;
  igreja_id: string;
  celula_id: string;
  aconteceu: boolean;
  quantidade_presentes: number;
  visitantes: number;
  decisao: number; // decisões por Cristo
  pedidos_oracao: string;
  observacoes: string;
  foto_celula?: string; // base64 string
  data_relatorio: string;
  created_at: string;
  preenchido_por: string; // Usuario ID (Líder)
}

export interface Presenca {
  id: string;
  igreja_id: string;
  relatorio_id: string;
  usuario_id: string;
  presente: boolean;
}

export interface Notificacao {
  id: string;
  igreja_id: string;
  usuario_id: string; // Destination
  titulo: string;
  mensagem: string;
  lida: boolean;
  tipo: "relatorio_pendente" | "promocao_disponivel" | "alerta_celula" | "nova_celula" | "novo_integrante" | "baixa_frequencia";
  created_at: string;
}

export interface PromocaoElegivel {
  usuario_id: string;
  cargo_atual: Cargo;
  cargo_proposto: Cargo;
  motivo: string;
  requisitoProgress: number; // Percentage
  data_identificacao: string;
}
