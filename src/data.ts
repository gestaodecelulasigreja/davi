/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Igreja, Usuario, Rede, Celula, Cargo, CellStatus, RelatorioSemanal, Notificacao, PromocaoElegivel } from "./types";

// Setup Initial Churches
export const defaultIgrejas: Igreja[] = [
  {
    id: "lagoinha-petropolis",
    nome: "Lagoinha Petrópolis",
    logo: "⛪",
    cidade: "Petrópolis",
    estado: "RJ",
    pastor_presidente: "Pr. Marcos Andrade",
    telefone: "(24) 99876-5432",
    email: "pres@lagoinha.com",
    plano: "Ouro",
    status: "Ativa",
    quantidade_maxima_usuarios: 500,
    quantidade_maxima_celulas: 100,
    data_vencimento: "2027-12-31",
    created_at: "2026-01-10T12:00:00Z",
    corPrincipal: "#2563EB", // Blue
  },
  {
    id: "videira-quitandinha",
    nome: "Igreja Videira Quitandinha",
    logo: "🍇",
    cidade: "Petrópolis",
    estado: "RJ",
    pastor_presidente: "Pr. Roberto Silva",
    telefone: "(24) 98844-3322",
    email: "roberto@videira.com",
    plano: "Prata",
    status: "Ativa",
    quantidade_maxima_usuarios: 150,
    quantidade_maxima_celulas: 30,
    data_vencimento: "2026-12-01",
    created_at: "2026-02-15T14:30:00Z",
    corPrincipal: "#16A34A", // Green
  },
  {
    id: "nazareno-bingen",
    nome: "Igreja do Nazareno Bingen",
    logo: "🔥",
    cidade: "Petrópolis",
    estado: "RJ",
    pastor_presidente: "Pr. Lucas Neves",
    telefone: "(24) 99311-2244",
    email: "lucas@nazareno.com",
    plano: "Bronze",
    status: "Ativa",
    quantidade_maxima_usuarios: 50,
    quantidade_maxima_celulas: 10,
    data_vencimento: "2026-10-15",
    created_at: "2026-03-01T09:00:00Z",
    corPrincipal: "#DC2626", // Red
  },
  {
    id: "renascer-itaipava",
    nome: "Igreja Renascer Itaipava",
    logo: "🦅",
    cidade: "Petrópolis",
    estado: "RJ",
    pastor_presidente: "Pr. Carlos Santos",
    telefone: "(24) 98122-9988",
    email: "carlos@renascer.com",
    plano: "Bronze",
    status: "Bloqueada", // This church is blocked to show access control!
    quantidade_maxima_usuarios: 50,
    quantidade_maxima_celulas: 10,
    data_vencimento: "2026-05-10",
    created_at: "2026-01-01T08:00:00Z",
    corPrincipal: "#8B5CF6", // Purple
  }
];

// Redes available per church (We support the required Rede Vermelha, Azul, Verde, Branca, Roxa)
export const defaultRedes: Rede[] = [
  // Lagoinha
  { id: "red-lag-vermelha", igreja_id: "lagoinha-petropolis", nome: "Rede Vermelha", cor: "#EF4444", lider_id: "lider-red-vermelha" },
  { id: "red-lag-azul", igreja_id: "lagoinha-petropolis", nome: "Rede Azul", cor: "#3B82F6", lider_id: "lider-red-azul" },
  { id: "red-lag-verde", igreja_id: "lagoinha-petropolis", nome: "Rede Verde", cor: "#10B981", lider_id: "lider-red-verde" },
  { id: "red-lag-branca", igreja_id: "lagoinha-petropolis", nome: "Rede Branca", cor: "#64748B", lider_id: "lider-red-branca" },
  { id: "red-lag-roxa", igreja_id: "lagoinha-petropolis", nome: "Rede Roxa", cor: "#8B5CF6", lider_id: "lider-red-roxa" },
  
  // Videira
  { id: "red-vid-videiras", igreja_id: "videira-quitandinha", nome: "Rede das Videiras", cor: "#8B5CF6", lider_id: "lider-vid-principal" }
];

// Helper for generating initial date string offsets
const daysAgoStr = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
};

// Users data including passwords for fast-switching demonstration
export const defaultUsuarios: Usuario[] = [
  // Super Admin of SaaS platform (No church id constraint)
  {
    id: "master-admin-saas",
    igreja_id: null,
    nome: "Davi Ramos (Dono SaaS)",
    foto: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200",
    telefone: "(24) 99111-0000",
    whatsapp: "24991110000",
    email: "7daviramos@gmail.com",
    senha: "admin",
    endereco: "Av. Koeler, 100 - Centro, Petrópolis - RJ",
    data_nascimento: "1980-05-15",
    sexo: "M",
    estado_civil: "Casado(a)",
    cargo_atual: Cargo.MasterAdmin,
    rede_id: null,
    lider_direto_id: null,
    observacoes: "Dono master da plataforma SaaS.",
    created_at: "2026-01-01T00:00:00Z"
  },
  
  // LAGOINHA USERS
  // 1. Pastor Presidente
  {
    id: "pres-lagoinha",
    igreja_id: "lagoinha-petropolis",
    nome: "Pr. Marcos Andrade",
    foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    telefone: "(24) 99876-5432",
    whatsapp: "24998765432",
    email: "pres@lagoinha.com",
    senha: "123",
    endereco: "Rua do Imperador, 350 - Centro, Petrópolis - RJ",
    data_nascimento: "1975-08-22",
    sexo: "M",
    estado_civil: "Casado(a)",
    data_conversao: "1994-04-12",
    data_batismo: "1994-10-23",
    cargo_atual: Cargo.PastorPresidente,
    rede_id: null,
    lider_direto_id: null,
    observacoes: "Pastor fundador e líder geral da Lagoinha Petrópolis.",
    created_at: "2026-01-10T12:00:00Z"
  },
  
  // 2. Líder de Rede (Rede Vermelha)
  {
    id: "lider-red-vermelha",
    igreja_id: "lagoinha-petropolis",
    nome: "Marcos Vinícius (Rede Vermelha)",
    foto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
    telefone: "(24) 98845-6712",
    whatsapp: "24988456712",
    email: "rede.vermelha@lagoinha.com",
    senha: "123",
    endereco: "Rua Bingen, 1400 - Bingen, Petrópolis - RJ",
    data_nascimento: "1988-11-05",
    sexo: "M",
    estado_civil: "Casado(a)",
    data_conversao: "2005-06-20",
    data_batismo: "2005-12-18",
    cargo_atual: Cargo.LiderRede,
    rede_id: "red-lag-vermelha",
    lider_direto_id: "pres-lagoinha",
    observacoes: "Líder de rede muito experiente.",
    created_at: "2026-01-15T10:00:00Z"
  },

  // 3. Outros líderes de rede
  {
    id: "lider-red-azul",
    igreja_id: "lagoinha-petropolis",
    nome: "Aline Souza (Rede Azul)",
    foto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
    telefone: "(24) 99222-1111",
    whatsapp: "24992221111",
    email: "rede.azul@lagoinha.com",
    senha: "123",
    endereco: "Itaipava, Petrópolis - RJ",
    data_nascimento: "1992-02-14",
    sexo: "F",
    estado_civil: "Casado(a)",
    cargo_atual: Cargo.LiderRede,
    rede_id: "red-lag-azul",
    lider_direto_id: "pres-lagoinha",
    observacoes: "Coordenadora de células jovens.",
    created_at: "2026-01-16T10:00:00Z"
  },
  { id: "lider-red-verde", igreja_id: "lagoinha-petropolis", nome: "Pr. Roberto Verde", foto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200", telefone: "(24) 99333", whatsapp: "2499333", email: "rede.verde@lagoinha.com", senha: "123", endereco: "Centro", data_nascimento: "1985-01-01", sexo: "M", estado_civil: "Casado(a)", cargo_atual: Cargo.LiderRede, rede_id: "red-lag-verde", lider_direto_id: "pres-lagoinha", observacoes: "Forte foco de evangelismo", created_at: "2026-01-20T10:00:00Z" },
  { id: "lider-red-branca", igreja_id: "lagoinha-petropolis", nome: "Dra. Marcia Branca", foto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200", telefone: "(24) 99444", whatsapp: "2499444", email: "rede.branca@lagoinha.com", senha: "123", endereco: "Corrêas", data_nascimento: "1983-05-05", sexo: "F", estado_civil: "Casado(a)", cargo_atual: Cargo.LiderRede, rede_id: "red-lag-branca", lider_direto_id: "pres-lagoinha", observacoes: "Rede de casais", created_at: "2026-01-20T10:00:00Z" },
  { id: "lider-red-roxa", igreja_id: "lagoinha-petropolis", nome: "Pr. Juliano Roxo", foto: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200", telefone: "(24) 99555", whatsapp: "2499555", email: "rede.roxa@lagoinha.com", senha: "123", endereco: "Quitandinha", data_nascimento: "1990-09-09", sexo: "M", estado_civil: "Solteiro(a)", cargo_atual: Cargo.LiderRede, rede_id: "red-lag-roxa", lider_direto_id: "pres-lagoinha", observacoes: "Rede universitária", created_at: "2026-01-20T10:00:00Z" },

  // 4. Líder de Área (Possui 15 Células para simular requisitos!)
  {
    id: "lider-area-jefferson",
    igreja_id: "lagoinha-petropolis",
    nome: "Jefferson Albuquerque (Área 1)",
    foto: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&q=80&w=200",
    telefone: "(24) 98114-5511",
    whatsapp: "24981145511",
    email: "area@lagoinha.com",
    senha: "123",
    endereco: "Estrada União e Indústria, 2500 - Corrêas, Petrópolis - RJ",
    data_nascimento: "1985-03-30",
    sexo: "M",
    estado_civil: "Casado(a)",
    cargo_atual: Cargo.LiderArea,
    rede_id: "red-lag-vermelha",
    lider_direto_id: "lider-red-vermelha",
    observacoes: "Grande supervisor de rede, tem potencial para crescer ainda mais.",
    created_at: "2026-02-01T10:00:00Z"
  },

  // 5. Supervisor de Setor (Possui 5+ Células abaixo)
  {
    id: "super-setor-tiago",
    igreja_id: "lagoinha-petropolis",
    nome: "Tiago Mendes (Setor Quitandinha)",
    foto: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200",
    telefone: "(24) 98855-4411",
    whatsapp: "24988554411",
    email: "setor@lagoinha.com",
    senha: "123",
    endereco: "Rua Joaquim Rolla, 20 - Quitandinha, Petrópolis - RJ",
    data_nascimento: "1989-10-10",
    sexo: "M",
    estado_civil: "Casado(a)",
    cargo_atual: Cargo.SupervisorSetor,
    rede_id: "red-lag-vermelha",
    lider_direto_id: "lider-area-jefferson",
    observacoes: "Focado na área de Quitandinha, excelente pastor de líderes.",
    created_at: "2026-02-10T12:00:00Z"
  },

  // 6. Líder Supervisor (Possui 3+ Células abaixo)
  {
    id: "super-mateus",
    igreja_id: "lagoinha-petropolis",
    nome: "Mateus Ribeiro (Supervisor de Células)",
    foto: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=200",
    telefone: "(24) 99123-4567",
    whatsapp: "24991234567",
    email: "supervisor@lagoinha.com",
    senha: "123",
    endereco: "Av. Ayrton Senna, 10 - Quitandinha, Petrópolis - RJ",
    data_nascimento: "1994-06-18",
    sexo: "M",
    estado_civil: "Solteiro(a)",
    cargo_atual: Cargo.LiderSupervisor,
    rede_id: "red-lag-vermelha",
    lider_direto_id: "super-setor-tiago",
    observacoes: "Jovem dinâmico, supervisiona com excelência.",
    created_at: "2026-03-01T12:00:00Z"
  },

  // 7. Líderes de Célula de Lagoinha
  {
    id: "lider-daniel",
    igreja_id: "lagoinha-petropolis",
    nome: "Daniel Fernandes (Célula Aliança)",
    foto: "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&q=80&w=200",
    telefone: "(24) 99911-2233",
    whatsapp: "24999112233",
    email: "lider.daniel@lagoinha.com",
    senha: "123",
    endereco: "Rua Honduras, 12 - Quitandinha, Petrópolis - RJ",
    data_nascimento: "1993-01-15",
    sexo: "M",
    estado_civil: "Casado(a)",
    data_conversao: "2015-02-10",
    data_batismo: "2015-08-16",
    cargo_atual: Cargo.LiderCelula,
    rede_id: "red-lag-vermelha",
    lider_direto_id: "super-mateus",
    observacoes: "Líder da Célula Aliança.",
    created_at: "2026-03-10T14:00:00Z"
  },
  {
    id: "lider-gabriela",
    igreja_id: "lagoinha-petropolis",
    nome: "Gabriela Vasconcellos (Célula Esperança)",
    foto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    telefone: "(24) 98112-3344",
    whatsapp: "24981123344",
    email: "lider.gabriela@lagoinha.com",
    senha: "123",
    endereco: "Rua Paulino Afonso, 45 - Centro, Petrópolis - RJ",
    data_nascimento: "1996-07-22",
    sexo: "F",
    estado_civil: "Solteiro(a)",
    cargo_atual: Cargo.LiderCelula,
    rede_id: "red-lag-vermelha",
    lider_direto_id: "super-mateus",
    observacoes: "Lidera com muita doçura e foco evangelístico.",
    created_at: "2026-03-15T15:00:00Z"
  },
  {
    id: "lider-felipe",
    igreja_id: "lagoinha-petropolis",
    nome: "Felipe Bastos (Célula Vide)",
    foto: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200",
    telefone: "(24) 99245-5566",
    whatsapp: "24992455566",
    email: "lider.felipe@lagoinha.com",
    senha: "123",
    endereco: "Próximo à Unifase, Av. Barão do Rio Branco - Centro, Petrópolis - RJ",
    data_nascimento: "1998-04-12",
    sexo: "M",
    estado_civil: "Solteiro(a)",
    cargo_atual: Cargo.LiderCelula,
    rede_id: "red-lag-vermelha",
    lider_direto_id: "super-mateus",
    observacoes: "Célula estudantil/universitária.",
    created_at: "2026-03-20T10:00:00Z"
  },
  {
    id: "lider-lucelia",
    igreja_id: "lagoinha-petropolis",
    nome: "Lucélia Diniz (Célula Gerar)",
    foto: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
    telefone: "(24) 99881-2299",
    whatsapp: "24998812299",
    email: "lider.lucelia@lagoinha.com",
    senha: "123",
    endereco: "Rua Hermogênio Silva, 500 - Retiro, Petrópolis - RJ",
    data_nascimento: "1983-09-24",
    sexo: "F",
    estado_civil: "Casado(a)",
    cargo_atual: Cargo.LiderCelula,
    rede_id: "red-lag-vermelha",
    lider_direto_id: "super-setor-tiago",
    observacoes: "Célula de famílias.",
    created_at: "2026-03-22T10:00:00Z"
  },
  {
    id: "lider-rodrigo",
    igreja_id: "lagoinha-petropolis",
    nome: "Rodrigo Chaves (Célula Farol)",
    foto: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=200",
    telefone: "(24) 98833-2211",
    whatsapp: "24988332211",
    email: "lider@lagoinha.com", // THE MAIN DEMO CELL LEADER ACCOUNT!
    senha: "123",
    endereco: "Rua Teresa, 800 - Alto da Serra, Petrópolis - RJ",
    data_nascimento: "1991-12-05",
    sexo: "M",
    estado_civil: "Casado(a)",
    cargo_atual: Cargo.LiderCelula,
    rede_id: "red-lag-vermelha",
    lider_direto_id: "super-setor-tiago", // has Tiago Mendes as direct direct leader!
    observacoes: "Célula Farol no Alto da Serra. Liderança ativa.",
    created_at: "2026-03-25T11:00:00Z"
  },

  // 8. Auxiliares (2 for Rodrigo's cell)
  {
    id: "aux-roberto",
    igreja_id: "lagoinha-petropolis",
    nome: "Roberto Guedes",
    foto: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&q=80&w=200",
    telefone: "(24) 98122-1133",
    whatsapp: "24981221133",
    email: "auxiliar@lagoinha.com",
    senha: "123",
    endereco: "Rua Saldanha Marinho, 30 - Centro, Petrópolis - RJ",
    data_nascimento: "1995-10-18",
    sexo: "M",
    estado_civil: "Solteiro(a)",
    cargo_atual: Cargo.AuxiliarCelula,
    rede_id: "red-lag-vermelha",
    lider_direto_id: "lider-rodrigo",
    observacoes: "Primeiro auxiliar da célula Farol.",
    created_at: "2026-03-26T10:00:00Z"
  },
  {
    id: "aux-isabela",
    igreja_id: "lagoinha-petropolis",
    nome: "Isabela Martins",
    foto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
    telefone: "(24) 99122-8877",
    whatsapp: "24991228877",
    email: "isabela@lagoinha.com",
    senha: "123",
    endereco: "Bingen, Petrópolis - RJ",
    data_nascimento: "1997-03-12",
    sexo: "F",
    estado_civil: "Solteiro(a)",
    cargo_atual: Cargo.AuxiliarCelula,
    rede_id: "red-lag-vermelha",
    lider_direto_id: "lider-rodrigo",
    observacoes: "Segunda auxiliar da célula.",
    created_at: "2026-03-26T12:00:00Z"
  },

  // 9. Integrantes of Célula Farol (Rodrigo)
  {
    id: "int-lucas",
    igreja_id: "lagoinha-petropolis",
    nome: "Lucas Mendes (Demo Integrante)",
    foto: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200",
    telefone: "(24) 99344-5566",
    whatsapp: "24993445566",
    email: "integrante@lagoinha.com",
    senha: "123",
    endereco: "Rua do Imperador, 750 - Centro, Petrópolis - RJ",
    data_nascimento: "2000-01-01",
    sexo: "M",
    estado_civil: "Solteiro(a)",
    cargo_atual: Cargo.Integrante,
    rede_id: "red-lag-vermelha",
    lider_direto_id: "lider-rodrigo",
    observacoes: "Estudante, batizado recentemente.",
    created_at: "2026-04-01T12:00:00Z"
  },
  { id: "int-carla", igreja_id: "lagoinha-petropolis", nome: "Carla Pires", foto: "", telefone: "(24) 99211-1234", whatsapp: "24992111234", email: "carla@gmail.com", endereco: "Alto da Serra", data_nascimento: "1998-05-14", sexo: "F", estado_civil: "Solteiro(a)", cargo_atual: Cargo.Integrante, rede_id: "red-lag-vermelha", lider_direto_id: "lider-rodrigo", observacoes: "", created_at: "2026-04-01T12:00:00Z" },
  { id: "int-marcos", igreja_id: "lagoinha-petropolis", nome: "Marcos Aurelio", foto: "", telefone: "(24) 98800-4499", whatsapp: "24988004499", email: "marcos.aurelio@gmail.com", endereco: "Alto da Serra", data_nascimento: "1985-02-20", sexo: "M", estado_civil: "Casado(a)", cargo_atual: Cargo.Integrante, rede_id: "red-lag-vermelha", lider_direto_id: "lider-rodrigo", observacoes: "", created_at: "2026-04-01T12:00:00Z" },
  { id: "int-tatiana", igreja_id: "lagoinha-petropolis", nome: "Tatiana Xavier", foto: "", telefone: "(24) 98111-2233", whatsapp: "24981112233", email: "tatiana@gmail.com", endereco: "Valparaíso", data_nascimento: "1991-03-30", sexo: "F", estado_civil: "Solteiro(a)", cargo_atual: Cargo.Integrante, rede_id: "red-lag-vermelha", lider_direto_id: "lider-rodrigo", observacoes: "", created_at: "2026-04-01T12:00:00Z" },
  { id: "int-jonas", igreja_id: "lagoinha-petropolis", nome: "Jonas K", foto: "", telefone: "(24) 99000-8811", whatsapp: "24990008811", email: "jonas@gmail.com", endereco: "Quitandinha", data_nascimento: "1994-09-15", sexo: "M", estado_civil: "Casado(a)", cargo_atual: Cargo.Integrante, rede_id: "red-lag-vermelha", lider_direto_id: "lider-rodrigo", observacoes: "", created_at: "2026-04-01T12:00:00Z" },
  { id: "int-paulo", igreja_id: "lagoinha-petropolis", nome: "Paulo Santos", foto: "", telefone: "(24) 99823-1122", whatsapp: "24998231122", email: "paulo@gmail.com", endereco: "Itaipava", data_nascimento: "1992-11-11", sexo: "M", estado_civil: "Casado(a)", cargo_atual: Cargo.Integrante, rede_id: "red-lag-vermelha", lider_direto_id: "lider-rodrigo", observacoes: "", created_at: "2026-04-01T12:00:00Z" },
  { id: "int-ester", igreja_id: "lagoinha-petropolis", nome: "Ester Ferreira", foto: "", telefone: "(24) 98122-3344", whatsapp: "24981223344", email: "ester@gmail.com", endereco: "Centro", data_nascimento: "2002-04-04", sexo: "F", estado_civil: "Solteiro(a)", cargo_atual: Cargo.Integrante, rede_id: "red-lag-vermelha", lider_direto_id: "lider-rodrigo", observacoes: "", created_at: "2026-04-01T12:00:00Z" },
  { id: "int-debora", igreja_id: "lagoinha-petropolis", nome: "Débora Maria", foto: "", telefone: "(24) 99245-1212", whatsapp: "24992451212", email: "debora@gmail.com", endereco: "Nogueira", data_nascimento: "1997-07-06", sexo: "F", estado_civil: "Casado(a)", cargo_atual: Cargo.Integrante, rede_id: "red-lag-vermelha", lider_direto_id: "lider-rodrigo", observacoes: "", created_at: "2026-04-02T10:00:00Z" },
  { id: "int-anderson", igreja_id: "lagoinha-petropolis", nome: "Anderson Silva", foto: "", telefone: "(24) 98845-9090", whatsapp: "24988459090", email: "anderson@gmail.com", endereco: "Cascatinha", data_nascimento: "1989-08-08", sexo: "M", estado_civil: "Casado(a)", cargo_atual: Cargo.Integrante, rede_id: "red-lag-vermelha", lider_direto_id: "lider-rodrigo", observacoes: "", created_at: "2026-04-02T10:00:00Z" },

  // OTHER INTEGRANTES TO SIMULATE THE >15 CELLS UNDER JEFFERSON AREA LEADER (we can just define cells and counts, or populate some)
  
  // VIDEIRA CHURCH USERS
  {
    id: "lider-vid-principal",
    igreja_id: "videira-quitandinha",
    nome: "Pr. Roberto Silva (Líder)",
    foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    telefone: "(24) 98844-3322",
    whatsapp: "24988443322",
    email: "roberto@videira.com",
    senha: "123",
    endereco: "Quitandinha, Petrópolis - RJ",
    data_nascimento: "1978-04-12",
    sexo: "M",
    estado_civil: "Casado(a)",
    cargo_atual: Cargo.PastorPresidente,
    rede_id: "red-vid-videiras",
    lider_direto_id: null,
    observacoes: "Pastor da Videira Quitandinha.",
    created_at: "2026-02-15T14:30:00Z"
  }
];

// Set of cells centering Petrópolis - RJ
export const defaultCelulas: Celula[] = [
  // 1. Célula Farol (Rodrigo Chaves) - Multiplicação alert (>12 people, actually has 11 members + leader + auxiliaries = 14 people total in state)
  {
    id: "cel-farol",
    igreja_id: "lagoinha-petropolis",
    nome_celula: "Célula Farol",
    endereco_completo: "Rua Teresa, 800 - Alto da Serra, Petrópolis - RJ",
    cep: "25625-027",
    bairro: "Alto da Serra",
    latitude: -22.5222,
    longitude: -43.1642,
    dia_semana: "Sábado",
    horario: "19:00",
    lider_id: "lider-rodrigo",
    auxiliares: ["aux-roberto", "aux-isabela"],
    rede_id: "red-lag-vermelha",
    supervisor_id: "super-mateus",
    quantidade_integrantes: 14, // Rodrigo, 2 auxiliaries, 11 integrations
    status_celula: CellStatus.AZUL, // Multiplicação (>12)
    tipo_celula: "Mista",
    data_abertura: "2026-03-25",
    observacoes: "Célula em excelente crescimento no Alto da Serra.",
    created_at: "2026-03-25T11:00:00Z"
  },
  // 2. Célula Aliança (Daniel) - Saudável (between 4 and 11, has 8 members)
  {
    id: "cel-alianca",
    igreja_id: "lagoinha-petropolis",
    nome_celula: "Célula Aliança",
    endereco_completo: "Rua Honduras, 12 - Quitandinha, Petrópolis - RJ",
    cep: "25651-090",
    bairro: "Quitandinha",
    latitude: -22.5255,
    longitude: -43.2012,
    dia_semana: "Quarta",
    horario: "20:00",
    lider_id: "lider-daniel",
    auxiliares: [],
    rede_id: "red-lag-vermelha",
    supervisor_id: "super-mateus",
    quantidade_integrantes: 8,
    status_celula: CellStatus.VERDE, // Saudável
    tipo_celula: "Mista",
    data_abertura: "2026-03-10",
    observacoes: "Célula unida focada em ensino pastoral.",
    created_at: "2026-03-10T14:00:00Z"
  },
  // 3. Célula Esperança (Gabriela) - Poucas Pessoas Alert (<4 members, e.g. 2 members) - Kids Cell
  {
    id: "cel-esperanca",
    igreja_id: "lagoinha-petropolis",
    nome_celula: "Célula Kids Esperança",
    endereco_completo: "Rua Paulino Afonso, 45 - Centro, Petrópolis - RJ",
    cep: "25680-003",
    bairro: "Centro",
    latitude: -22.5049,
    longitude: -43.1784,
    dia_semana: "Terça",
    horario: "19:30",
    lider_id: "lider-gabriela",
    auxiliares: [],
    rede_id: "red-lag-vermelha",
    supervisor_id: "super-mateus",
    quantidade_integrantes: 2,
    status_celula: CellStatus.AMARELO, // Atenção (needs pastoral check!)
    tipo_celula: "Kids",
    data_abertura: "2026-03-15",
    observacoes: "Célula Kids liderada por Gabriela Maciel.",
    created_at: "2026-03-15T15:00:00Z"
  },
  // 4. Célula Vide (Felipe) - Baixa Frequência / Problema (realizou poucas reuniões no mês)
  {
    id: "cel-vide",
    igreja_id: "lagoinha-petropolis",
    nome_celula: "Célula Vide Jovem",
    endereco_completo: "Av. Barão do Rio Branco, 1000 - Centro, Petrópolis - RJ",
    cep: "25680-275",
    bairro: "Centro",
    latitude: -22.4936,
    longitude: -43.1739,
    dia_semana: "Sexta",
    horario: "18:30",
    lider_id: "lider-felipe",
    auxiliares: [],
    rede_id: "red-lag-vermelha",
    supervisor_id: "super-mateus",
    quantidade_integrantes: 5,
    status_celula: CellStatus.VERMELHO, // Problema (frequência baixa)
    tipo_celula: "Jovem",
    data_abertura: "2026-03-20",
    observacoes: "Encontros têm sido cancelados frequentemente devido a provas universitárias.",
    created_at: "2026-03-20T10:00:00Z"
  },
  // 5. Célula Gerar (Lucelia) - Saudável
  {
    id: "cel-gerar",
    igreja_id: "lagoinha-petropolis",
    nome_celula: "Célula de Mulheres Gerar",
    endereco_completo: "Rua Hermogênio Silva, 500 - Retiro, Petrópolis - RJ",
    cep: "25715-060",
    bairro: "Retiro",
    latitude: -22.4772,
    longitude: -43.1611,
    dia_semana: "Quinta",
    horario: "20:00",
    lider_id: "lider-lucelia",
    auxiliares: [],
    rede_id: "red-lag-vermelha",
    supervisor_id: "super-setor-tiago",
    quantidade_integrantes: 6,
    status_celula: CellStatus.VERDE,
    tipo_celula: "Mulheres",
    data_abertura: "2026-03-22",
    observacoes: "Célula madura de casais e famílias com boa comunhão.",
    created_at: "2026-03-22T10:00:00Z"
  },
  // 6. Célula Itaipava Monte (Líder Roberto Silva) - Nazareno/Videira
  {
    id: "cel-itaipava-monte",
    igreja_id: "videira-quitandinha",
    nome_celula: "Célula Videira Itaipava",
    endereco_completo: "Estrada União e Indústria, 11000 - Itaipava, Petrópolis - RJ",
    cep: "25730-730",
    bairro: "Itaipava",
    latitude: -22.4042,
    longitude: -43.1256,
    dia_semana: "Sábado",
    horario: "18:00",
    lider_id: "lider-vid-principal",
    auxiliares: [],
    rede_id: "red-vid-videiras",
    supervisor_id: null,
    quantidade_integrantes: 8,
    status_celula: CellStatus.VERDE,
    tipo_celula: "Mista",
    data_abertura: "2026-02-20",
    observacoes: "Célula inicial na Videira de Itaipava.",
    created_at: "2026-02-20T10:00:00Z"
  }
];

// High fidelity mock weekly cell reports
export const defaultRelatorios: RelatorioSemanal[] = [
  {
    id: "rep-far-1",
    igreja_id: "lagoinha-petropolis",
    celula_id: "cel-farol",
    aconteceu: true,
    quantidade_presentes: 12,
    visitantes: 2,
    decisao: 1,
    pedidos_oracao: "Oração pela integridade física do irmão Carlos e cura de sua esposa Débora.",
    observacoes: "Célula cheia! Muita presença de Deus, louvores inspirados e lanche excelente.",
    foto_celula: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=400",
    data_relatorio: daysAgoStr(2),
    created_at: daysAgoStr(2) + "T21:00:00Z",
    preenchido_por: "lider-rodrigo"
  },
  {
    id: "rep-far-2",
    igreja_id: "lagoinha-petropolis",
    celula_id: "cel-farol",
    aconteceu: true,
    quantidade_presentes: 14,
    visitantes: 3,
    decisao: 2,
    pedidos_oracao: "Vida profissional do Lucas, restauração no casamento de Débora e Anderson.",
    observacoes: "Tempo extraordinário. Glória a Deus pelas 2 decisões!",
    foto_celula: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=400",
    data_relatorio: daysAgoStr(9),
    created_at: daysAgoStr(9) + "T21:30:00Z",
    preenchido_por: "lider-rodrigo"
  },
  {
    id: "rep-ali-1",
    igreja_id: "lagoinha-petropolis",
    celula_id: "cel-alianca",
    aconteceu: true,
    quantidade_presentes: 8,
    visitantes: 0,
    decisao: 0,
    pedidos_oracao: "Estudos acadêmicos e paz espiritual na família.",
    observacoes: "Estudo bíblico focado nos Evangelhos.",
    data_relatorio: daysAgoStr(3),
    created_at: daysAgoStr(3) + "T20:00:00Z",
    preenchido_por: "lider-daniel"
  },
  {
    id: "rep-esp-1",
    igreja_id: "lagoinha-petropolis",
    celula_id: "cel-esperanca",
    aconteceu: true,
    quantidade_presentes: 2,
    visitantes: 0,
    decisao: 0,
    pedidos_oracao: "Para que novos integrantes consigam comparecer e pelo desânimo da liderança.",
    observacoes: "Apenas eu e mais 1 pessoa comparecemos.",
    data_relatorio: daysAgoStr(5),
    created_at: daysAgoStr(5) + "T19:00:00Z",
    preenchido_por: "lider-gabriela"
  },
  {
    id: "rep-vide-1",
    igreja_id: "lagoinha-petropolis",
    celula_id: "cel-vide",
    aconteceu: false, // "a celula aconteceu?" - NÃO
    quantidade_presentes: 0,
    visitantes: 0,
    decisao: 0,
    pedidos_oracao: "Clamor pelo retorno das atividades.",
    observacoes: "Não houve quórum devido a semana de provas na Unifase.",
    data_relatorio: daysAgoStr(4),
    created_at: daysAgoStr(4) + "To18:30:00Z",
    preenchido_por: "lider-felipe"
  },
  {
    id: "rep-vide-2",
    igreja_id: "lagoinha-petropolis",
    celula_id: "cel-vide",
    aconteceu: false, // "a celula aconteceu?" - NÃO
    quantidade_presentes: 0,
    visitantes: 0,
    decisao: 0,
    pedidos_oracao: "Renovação espiritual dos estudantes.",
    observacoes: "Célula desmarcada em cima da hora.",
    data_relatorio: daysAgoStr(11),
    created_at: daysAgoStr(11) + "T18:30:00Z",
    preenchido_por: "lider-felipe"
  },
  {
    id: "rep-vide-3",
    igreja_id: "lagoinha-petropolis",
    celula_id: "cel-vide",
    aconteceu: false, // "a celula aconteceu?" - NÃO
    quantidade_presentes: 0,
    visitantes: 0,
    decisao: 0,
    pedidos_oracao: "",
    observacoes: "Feriado de Tiradentes e recesso estudantil cancelaram o encontro.",
    data_relatorio: daysAgoStr(18),
    created_at: daysAgoStr(18) + "T18:30:00Z",
    preenchido_por: "lider-felipe"
  }
];

// Default in-app notifications
export const defaultNotificacoes: Notificacao[] = [
  {
    id: "not-1",
    igreja_id: "lagoinha-petropolis",
    usuario_id: "pres-lagoinha",
    titulo: "Célula Pronta para Multiplicação",
    mensagem: "MATEUS RIBEIRO identificou que a 'Célula Farol' de RODRIGO CHAVES atingiu 14 integrantes e está elegível para multiplicação imediata.",
    lida: false,
    tipo: "alerta_celula",
    created_at: daysAgoStr(1) + "T09:00:00Z"
  },
  {
    id: "not-2",
    igreja_id: "lagoinha-petropolis",
    usuario_id: "pres-lagoinha",
    titulo: "Célula em Alerta de Poucas Pessoas",
    mensagem: "A 'Célula Esperança' de GABRIELA VASCONCELLOS registrou apenas 2 presentes no último relatório semanal. Essa célula precisa de acompanhamento pastoral.",
    lida: false,
    tipo: "alerta_celula",
    created_at: daysAgoStr(2) + "T10:00:00Z"
  },
  {
    id: "not-3",
    igreja_id: "lagoinha-petropolis",
    usuario_id: "pres-lagoinha",
    titulo: "Promoção de Cargo Disponível",
    mensagem: "TIAGO MENDES atingiu os requisitos de células coordenadas e está pronto para ser promovido a Supervisor de Setor.",
    lida: true,
    tipo: "promocao_disponivel",
    created_at: daysAgoStr(3) + "T14:00:00Z"
  },
  {
    id: "not-4",
    igreja_id: "lagoinha-petropolis",
    usuario_id: "super-mateus",
    titulo: "Relatório Semanal Pendente",
    mensagem: "A sua coordenada 'Célula Vide' (Felipe Bastos) não enviou o relatório de presença há mais de uma semana.",
    lida: false,
    tipo: "relatorio_pendente",
    created_at: daysAgoStr(1) + "T15:00:00Z"
  }
];

// Storage Engine
export function getStoredData() {
  if (typeof window === "undefined") {
    return {
      igrejas: defaultIgrejas,
      usuarios: defaultUsuarios,
      celulas: defaultCelulas,
      relatorios: defaultRelatorios,
      notificacoes: defaultNotificacoes,
      redes: defaultRedes,
    };
  }

  const storedIgrejas = localStorage.getItem("sgc_igrejas");
  const storedUsuarios = localStorage.getItem("sgc_usuarios");
  const storedCelulas = localStorage.getItem("sgc_celulas");
  const storedRelatorios = localStorage.getItem("sgc_relatorios");
  const storedNotificacoes = localStorage.getItem("sgc_notificacoes");
  const storedRedes = localStorage.getItem("sgc_redes");

  if (!storedIgrejas || !storedUsuarios) {
    // Write defaults
    localStorage.setItem("sgc_igrejas", JSON.stringify(defaultIgrejas));
    localStorage.setItem("sgc_usuarios", JSON.stringify(defaultUsuarios));
    localStorage.setItem("sgc_celulas", JSON.stringify(defaultCelulas));
    localStorage.setItem("sgc_relatorios", JSON.stringify(defaultRelatorios));
    localStorage.setItem("sgc_notificacoes", JSON.stringify(defaultNotificacoes));
    localStorage.setItem("sgc_redes", JSON.stringify(defaultRedes));

    return {
      igrejas: defaultIgrejas,
      usuarios: defaultUsuarios,
      celulas: defaultCelulas,
      relatorios: defaultRelatorios,
      notificacoes: defaultNotificacoes,
      redes: defaultRedes,
    };
  }

  return {
    igrejas: JSON.parse(storedIgrejas),
    usuarios: JSON.parse(storedUsuarios),
    celulas: JSON.parse(storedCelulas),
    relatorios: JSON.parse(storedRelatorios),
    notificacoes: JSON.parse(storedNotificacoes),
    redes: JSON.parse(storedRedes),
  };
}

export function saveStoredData(data: {
  igrejas: Igreja[];
  usuarios: Usuario[];
  celulas: Celula[];
  relatorios: RelatorioSemanal[];
  notificacoes: Notificacao[];
  redes: Rede[];
}) {
  if (typeof window === "undefined") return;
  localStorage.setItem("sgc_igrejas", JSON.stringify(data.igrejas));
  localStorage.setItem("sgc_usuarios", JSON.stringify(data.usuarios));
  localStorage.setItem("sgc_celulas", JSON.stringify(data.celulas));
  localStorage.setItem("sgc_relatorios", JSON.stringify(data.relatorios));
  localStorage.setItem("sgc_notificacoes", JSON.stringify(data.notificacoes));
  localStorage.setItem("sgc_redes", JSON.stringify(data.redes));
}

// Automatic cell status evaluator based on rule 13, 14
export function evaluateCellStatusAndAlerts(
  celula: Celula,
  relatorios: RelatorioSemanal[]
): { status: CellStatus; alertMessage: string | null } {
  const cellReports = relatorios
    .filter((r) => r.celula_id === celula.id)
    .sort((a, b) => new Date(b.data_relatorio).getTime() - new Date(a.data_relatorio).getTime());

  // Rule 14: ALERTA DE FREQUÊNCIA - se em 1 mês realizou apenas 2 células ou menos (30 days ago)
  const oneMonthAgo = new Date();
  oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
  
  const recentReports = cellReports.filter((r) => new Date(r.data_relatorio) >= oneMonthAgo);
  const meetingsHappened = recentReports.filter((r) => r.aconteceu).length;

  // Let's check rule priority.
  // First, rule 14: Low frequency (happened <= 2 times in a month, and the cell is at least 30 days old).
  const cellAgeDays = (Date.now() - new Date(celula.data_abertura).getTime()) / (1000 * 60 * 60 * 24);
  
  if (cellAgeDays >= 30 && meetingsHappened <= 2 && recentReports.length >= 3) {
    return {
      status: CellStatus.VERMELHO,
      alertMessage: "Essa célula está apresentando baixa frequência.",
    };
  }

  // Rule 14: ALERTA DE MULTIPLICAÇÃO - mais de 12 pessoas (Integrantes)
  if (celula.quantidade_integrantes >= 12) {
    return {
      status: CellStatus.AZUL,
      alertMessage: "Essa célula está pronta para multiplicação.",
    };
  }

  // Rule 14: ALERTA DE POUCAS PESSOAS - menos de 4 pessoas (Integrantes)
  if (celula.quantidade_integrantes < 4) {
    return {
      status: CellStatus.AMARELO,
      alertMessage: "Essa célula precisa de acompanhamento pastoral.",
    };
  }

  // Rule 13: CÉLULA SAUDÁVEL - acontece toda semana, possui entre 4 e 11 pessoas
  return {
    status: CellStatus.VERDE,
    alertMessage: null,
  };
}

// Evaluate promotion requirements automatically based on Rule 3, 15
// - LÍDER DE ÁREA: no mínimo 15 células abaixo dele na hierarquia
// - SUPERVISOR DE SETOR: no mínimo 5 células abaixo dele na hierarquia
// - LÍDER SUPERVISOR: no mínimo 3 células abaixo dele na hierarquia
// - LÍDER DE CÉLULA: lidera 1 célula
export function evaluateUserPromotions(
  usuarios: Usuario[],
  celulas: Celula[]
): PromocaoElegivel[] {
  const elegiveis: PromocaoElegivel[] = [];

  usuarios.forEach((user) => {
    // Only evaluate church people with specific positions
    if (!user.igreja_id || user.cargo_atual === Cargo.PastorPresidente || user.cargo_atual === Cargo.MasterAdmin) {
      return;
    }

    // Function to calculate cells managed by this user (including down-hierarchy recursively)
    const countCellsRecursively = (userId: string): number => {
      // Find cells led directly by this user
      const directCells = celulas.filter((c) => c.lider_id === userId).length;
      
      // Find users directly reporting to this user
      const reportingUsers = usuarios.filter((u) => u.lider_direto_id === userId);
      
      // Add recursively
      let childCells = 0;
      reportingUsers.forEach((u) => {
        childCells += countCellsRecursively(u.id);
      });

      return directCells + childCells;
    };

    const cellsCount = countCellsRecursively(user.id);

    // Evaluate potential promotions
    if (user.cargo_atual === Cargo.Integrante) {
      // If of type Integrante and has conversion/batismo etc., can be proposed as Auxiliar
      return;
    }

    if (user.cargo_atual === Cargo.AuxiliarCelula) {
      // Direct eligible if trained/observed
      return;
    }

    if (user.cargo_atual === Cargo.LiderCelula) {
      // If leads 1 cell and has children reporting to them, can step up to Lider Supervisor if they supervise >= 3 cells
      if (cellsCount >= 3) {
        elegiveis.push({
          usuario_id: user.id,
          cargo_atual: user.cargo_atual,
          cargo_proposto: Cargo.LiderSupervisor,
          motivo: `Coordena atualmente ${cellsCount} células em sua descendência direta, superando o requisito mínimo de 3 células para Liderança de Supervisão.`,
          requisitoProgress: Math.min(100, (cellsCount / 3) * 100),
          data_identificacao: new Date().toISOString().split("T")[0],
        });
      }
    }

    if (user.cargo_atual === Cargo.LiderSupervisor) {
      // Needs >= 5 cells to become Supervisor de Setor
      if (cellsCount >= 5) {
        elegiveis.push({
          usuario_id: user.id,
          cargo_atual: user.cargo_atual,
          cargo_proposto: Cargo.SupervisorSetor,
          motivo: `Expandiu com excelência sua rede celular para ${cellsCount} células ativas, atingindo o requisito de supervisor setorial (mínimo 5 células).`,
          requisitoProgress: Math.min(100, (cellsCount / 5) * 100),
          data_identificacao: new Date().toISOString().split("T")[0],
        });
      }
    }

    if (user.cargo_atual === Cargo.SupervisorSetor) {
      // Needs >= 15 cells to become Líder de Área
      if (cellsCount >= 15) {
        elegiveis.push({
          usuario_id: user.id,
          cargo_atual: user.cargo_atual,
          cargo_proposto: Cargo.LiderArea,
          motivo: `Liderou com sucesso a expansão para um contingente de ${cellsCount} células coordenadas, atingindo o patamar ministerial correspondente à Liderança de Área (mínimo 15 células).`,
          requisitoProgress: Math.min(100, (cellsCount / 15) * 100),
          data_identificacao: new Date().toISOString().split("T")[0],
        });
      }
    }
  });

  return elegiveis;
}
