/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { 
  getStoredData, 
  saveStoredData, 
  evaluateCellStatusAndAlerts, 
  evaluateUserPromotions,
  defaultIgrejas,
  defaultUsuarios,
  defaultCelulas,
  defaultRelatorios,
  defaultNotificacoes,
  defaultRedes 
} from "./data";
import { Igreja, Usuario, Rede, Celula, Cargo, CellStatus, RelatorioSemanal, Notificacao, PromocaoElegivel, SaasEmail } from "./types";
import { getVisibleCelulas, getVisibleUsuarios, getVisibleRelatorios } from "./utils/hierarchy";
import SGCDashboard from "./components/SGCDashboard";
import SGCMap from "./components/SGCMap";
import SGCCelulasList from "./components/SGCCelulasList";
import SGCPessoasForm from "./components/SGCPessoasForm";
import SGCReportForm from "./components/SGCReportForm";
import SGCOrganograma from "./components/SGCOrganograma";
import SGCSaasMasterPanel from "./components/SGCSaasMasterPanel";
import SGCSaasSubscriptionWizard from "./components/SGCSaasSubscriptionWizard";
import SGCProfileEditModal from "./components/SGCProfileEditModal";
import { AnimatePresence, motion } from "motion/react";
import {
  Menu,
  X,
  LayoutDashboard,
  Map,
  Home,
  Users,
  FileText,
  GitBranch,
  Settings,
  LogOut,
  Bell,
  CheckCircle,
  AlertTriangle,
  User,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  BookOpen,
  ArrowRight,
  ArrowLeft
} from "lucide-react";

export default function App() {
  // Database States
  const [db, setDb] = useState<{
    igrejas: Igreja[];
    usuarios: Usuario[];
    celulas: Celula[];
    relatorios: RelatorioSemanal[];
    notificacoes: Notificacao[];
    redes: Rede[];
  } | null>(null);

  // Authentication states
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginSenha, setLoginSenha] = useState("");
  const [loginError, setLoginError] = useState("");

  // Support / Impersonation for platform master
  const [impersonatedChurchId, setImpersonatedChurchId] = useState<string | null>(null);
  const [profileEditOpen, setProfileEditOpen] = useState(false);

  // Nav states
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Virtualized user context when impersonating / supporting a church as SaaS owner
  const virtualUser = useMemo(() => {
    if (!currentUser) return null;
    if (currentUser.cargo_atual === Cargo.MasterAdmin && impersonatedChurchId) {
      return {
        ...currentUser,
        igreja_id: impersonatedChurchId,
        cargo_atual: Cargo.PastorPresidente, // Elevate permissions to simulate administrative power for support!
      };
    }
    return currentUser;
  }, [currentUser, impersonatedChurchId]);

  // Routing synchronizer depending on user role and support state
  useEffect(() => {
    if (currentUser) {
      if (currentUser.cargo_atual === Cargo.MasterAdmin) {
        if (!impersonatedChurchId) {
          setCurrentTab("master-panel");
        }
      } else {
        setImpersonatedChurchId(null);
        if (currentTab === "master-panel") {
          setCurrentTab("dashboard");
        }
      }
    }
  }, [currentUser, impersonatedChurchId]);

  // Global map state filter shared overrides
  const [selectedMapRedId, setSelectedMapRedId] = useState("");
  const [selectedMapStatus, setSelectedMapStatus] = useState("");

  // SaaS Subscriber Wizard state
  const [showSubscriptionWizard, setShowSubscriptionWizard] = useState(false);

  // Simulated email logs database
  const [saasEmails, setSaasEmails] = useState<SaasEmail[]>([]);

  // Load emails
  useEffect(() => {
    const raw = localStorage.getItem("sgc_saas_emails");
    if (raw) {
      try {
        setSaasEmails(JSON.parse(raw));
      } catch (err) {
        console.error("Failed to parse saas emails", err);
      }
    } else {
      const initial: SaasEmail[] = [
        {
          id: "email-1",
          destinatario: "pastor@lagoinha.com",
          assunto: "🎉 Bem-vindo ao Prompt Master Celular!",
          conteudo: "Olá Pastor Presidente,\n\nSeu cadastro no Plano Prata foi realizado com sucesso! Sua igreja está habilitada em nossa nuvem segura.\nComece cadastrando seus líderes de rede ou células.\n\nEquipe de Sucesso do Cliente SaaS",
          status: "Enviado",
          data: "2026-05-20T10:00:00Z",
          tipo: "sucesso_cadastro"
        },
        {
          id: "email-2",
          destinatario: "pastor@lagoinha.com",
          assunto: "⚡ Transação em Processamento - Mensalidade de Maio",
          conteudo: "Prezado Assinante,\n\nSua fatura recorrente mensal de R$ 399,00 está em processamento junto à adquirente.\nNão é necessária nenhuma ação no momento.\n\nGateway de Faturamento SaaS",
          status: "Faturamento Pendente",
          data: "2026-05-20T10:02:00Z",
          tipo: "processamento"
        },
        {
          id: "email-3",
          destinatario: "pastor@nazareno.com",
          assunto: "⚠️ Falha no Débito da Mensalidade SaaS",
          conteudo: "Atenção,\n\nHouve um erro ao tentar processar o pagamento com o cartão final 4010. Faturamento recusado pelo banco emissor.\nPor favor, atualize seus dados de cobrança para reativar seu ecossistema.\n\nDepartamento Financeiro SaaS",
          status: "Falha na Transação",
          data: "2026-05-22T14:30:00Z",
          tipo: "erro_pagamento"
        },
        {
          id: "email-4",
          destinatario: "7daviramos@gmail.com",
          assunto: "📢 Notificação Global de Atualização de Sistema",
          conteudo: "Olá,\n\nNova atualização ativada: Adicionado suporte completo para administradores de igreja personalizados, triagens hierárquicas automatizadas de segurança de visualização e filtros opcionais da liderança Kids de Redes!\n\nEngenharia de Produto SaaS",
          status: "Enviado",
          data: "2026-05-24T18:00:00Z",
          tipo: "atualizacao_sistema"
        }
      ];
      setSaasEmails(initial);
      localStorage.setItem("sgc_saas_emails", JSON.stringify(initial));
    }
  }, []);

  const saveEmails = (list: SaasEmail[]) => {
    setSaasEmails(list);
    localStorage.setItem("sgc_saas_emails", JSON.stringify(list));
  };

  const handleBroadCastUpdateEmail = (subject: string, content: string) => {
    if (!db) return;
    const pastorEmails = db.usuarios.filter((u) => u.cargo_atual === Cargo.PastorPresidente).map((u) => u.email);
    
    // Broadcast email triggers
    const newBroadcasts: SaasEmail[] = pastorEmails.map((email, idx) => ({
      id: `email-update-${Date.now()}-${idx}`,
      destinatario: email,
      assunto: `📢 ATUALIZAÇÃO RELEVANTE: ${subject}`,
      conteudo: content,
      status: "Enviado",
      data: new Date().toISOString(),
      tipo: "atualizacao_sistema"
    }));

    saveEmails([...newBroadcasts, ...saasEmails]);

    // Also inject floating system notification for inside users! Rule 35.
    const newNotifications: Notificacao[] = db.igrejas.map((ch, idx) => ({
      id: `saas-notif-${Date.now()}-${idx}`,
      igreja_id: ch.id,
      mensagem: `📢 NOTÍCIA DO SAAS: ${subject}`,
      tipo: "Aviso",
      lida: false,
      data: new Date().toISOString().split("T")[0]
    }));

    updateDbState((prev) => ({
      ...prev,
      notificacoes: [...newNotifications, ...prev.notificacoes]
    }));
  };

  // Sync logged in user session to localStorage to persist restarts/reloads seamlessly
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("sgc_active_user_email", currentUser.email);
    } else {
      localStorage.removeItem("sgc_active_user_email");
    }
  }, [currentUser]);

  // Load and hydrate database
  useEffect(() => {
    const data = getStoredData();

    // Make sure davi admin is present in the usuarios list (handles dev stale local storages)
    const hasDavi = data.usuarios.some((u) => u.email.toLowerCase() === "7daviramos@gmail.com");
    if (!hasDavi) {
      const newMaster: Usuario = {
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
        created_at: new Date().toISOString()
      };
      data.usuarios.push(newMaster);
      saveStoredData(data);
    }
    setDb(data);

    // Initial Login setup shortcut - Active user session only
    const cachedEmail = localStorage.getItem("sgc_active_user_email");
    if (cachedEmail) {
      const foundUser = data.usuarios.find((u) => u.email.toLowerCase() === cachedEmail.toLowerCase().trim());
      if (foundUser) {
        setCurrentUser(foundUser);
      }
    }
  }, []);

  // Save changes to localStorage helper
  const updateDbState = (updater: (prev: typeof db) => any) => {
    setDb((prev) => {
      if (!prev) return prev;
      const next = updater(prev);
      saveStoredData(next);
      return next;
    });
  };

  // Evaluate promotions list dynamically
  const promocoesElegiveis = useMemo(() => {
    if (!db) return [];
    return evaluateUserPromotions(db.usuarios, db.celulas);
  }, [db]);

  // Handle standard user credentials login
  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;

    const matchedUser = db.usuarios.find(
      (u) => u.email.toLowerCase() === loginEmail.toLowerCase().trim()
    );

    if (!matchedUser) {
      setLoginError("Credenciais não localizadas no banco de dados.");
      return;
    }

    // Checking password
    if (loginSenha && matchedUser.senha !== loginSenha) {
      setLoginError("Senha incorreta.");
      return;
    }

    // Successful login
    setLoginError("");
    setCurrentUser(matchedUser);

    // Check if the church they belong is blocked (Rule 28 SaaS block test)
    if (matchedUser.igreja_id) {
      const church = db.igrejas.find((i) => i.id === matchedUser.igreja_id);
      if (church && church.status === "Bloqueada") {
        // Keeps user logged-in but app handles screen restriction!
      }
    }
  };

  const handleShortcutLogin = (email: string) => {
    if (!db) return;
    const lowerEmail = email.toLowerCase().trim();
    let user = db.usuarios.find((u) => u.email.toLowerCase() === lowerEmail);

    if (!user && lowerEmail === "7daviramos@gmail.com") {
      const newMaster: Usuario = {
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
        created_at: new Date().toISOString()
      };
      updateDbState((prev) => {
        const alreadyHas = prev.usuarios.some((u) => u.email.toLowerCase() === "7daviramos@gmail.com");
        if (alreadyHas) return prev;
        return {
          ...prev,
          usuarios: [...prev.usuarios, newMaster]
        };
      });
      user = newMaster;
    }

    if (user) {
      setCurrentUser(user);
      setLoginError("");
    } else {
      setLoginError("Erro ao autenticar com acesso master.");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginEmail("");
    setLoginSenha("");
    setLoginError("");
    setCurrentTab("dashboard");
  };

  // 1. ADD CELULA MUTATION
  const handleAddCelula = (newCell: Partial<Celula>) => {
    updateDbState((prev) => {
      const fullCell: Celula = {
        id: "cel-gen-" + Date.now(),
        igreja_id: currentUser?.igreja_id || "lagoinha-petropolis",
        nome_celula: newCell.nome_celula || "Nova Célula",
        endereco_completo: newCell.endereco_completo || "",
        cep: newCell.cep || "",
        bairro: newCell.bairro || "Centro",
        latitude: newCell.latitude || -22.5049,
        longitude: newCell.longitude || -43.1784,
        dia_semana: newCell.dia_semana || "Sábado",
        horario: newCell.horario || "19:00",
        lider_id: newCell.lider_id || "",
        auxiliares: newCell.auxiliares || [],
        rede_id: newCell.rede_id || "red-lag-vermelha",
        supervisor_id: newCell.supervisor_id || null,
        quantidade_integrantes: newCell.quantidade_integrantes || 4,
        status_celula: CellStatus.VERDE,
        data_abertura: newCell.data_abertura || new Date().toISOString().split("T")[0],
        observacoes: newCell.observacoes || "",
        created_at: new Date().toISOString(),
      };

      // Add default notification
      const newNotif: Notificacao = {
        id: "not-gen-" + Date.now(),
        igreja_id: fullCell.igreja_id,
        usuario_id: "pres-lagoinha", // To church head
        titulo: "Nova Célula Aberta",
        mensagem: `Uma nova célula chamada "${fullCell.nome_celula}" foi plantada em Petrópolis (bairro ${fullCell.bairro}) sob liderança direta.`,
        lida: false,
        tipo: "nova_celula",
        created_at: new Date().toISOString(),
      };

      return {
        ...prev,
        celulas: [...prev.celulas, fullCell],
        notificacoes: [newNotif, ...prev.notificacoes],
      };
    });
  };

  // 2. UPDATE CELULA MUTATION (integrating status checks and alerts automatically!)
  const handleUpdateCelula = (cellId: string, updatedFields: Partial<Celula>) => {
    updateDbState((prev) => {
      const updatedCells = prev.celulas.map((cell) => {
        if (cell.id !== cellId) return cell;

        const merged = { ...cell, ...updatedFields };
        // Evaluate dynamic alerts & colors based on rule 13, 14
        const { status } = evaluateCellStatusAndAlerts(merged, prev.relatorios);
        merged.status_cellula = status;

        return merged;
      });

      return {
        ...prev,
        celulas: updatedCells,
      };
    });
  };

  // 3. ADD USUARIO / PESSOA MUTATION
  const handleAddUsuario = (newUser: Partial<Usuario>) => {
    updateDbState((prev) => {
      const fullUser: Usuario = {
        id: "usr-gen-" + Date.now(),
        igreja_id: currentUser?.igreja_id || "lagoinha-petropolis",
        nome: newUser.nome || "",
        foto: newUser.foto || "",
        telefone: newUser.telefone || "",
        whatsapp: newUser.whatsapp || "",
        email: newUser.email || "",
        senha: "123", // default standard demo password
        endereco: newUser.endereco || "",
        data_nascimento: newUser.data_nascimento || "1990-01-01",
        sexo: newUser.sexo || "M",
        estado_civil: newUser.estado_civil || "Solteiro(a)",
        data_conversao: newUser.data_conversao,
        data_batismo: newUser.data_batismo,
        cargo_atual: newUser.cargo_atual || Cargo.Integrante,
        rede_id: newUser.rede_id || null,
        lider_direto_id: newUser.lider_direto_id || null,
        observacoes: newUser.observacoes || "",
        created_at: new Date().toISOString(),
      };

      return {
        ...prev,
        usuarios: [...prev.usuarios, fullUser],
      };
    });
  };

  // 4. UPDATE USUARIO / PESSOA
  const handleUpdateUsuario = (userId: string, updatedFields: Partial<Usuario>) => {
    updateDbState((prev) => {
      const updatedUsers = prev.usuarios.map((u) => (u.id === userId ? { ...u, ...updatedFields } : u));
      return { ...prev, usuarios: updatedUsers };
    });
  };

  // DELETE CELULA
  const handleDeleteCelula = (cellId: string) => {
    updateDbState((prev) => {
      const nextCelulas = prev.celulas.filter((c) => c.id !== cellId);
      const nextRelatorios = prev.relatorios.filter((r) => r.celula_id !== cellId);
      return {
        ...prev,
        celulas: nextCelulas,
        relatorios: nextRelatorios,
      };
    });
  };

  // DELETE USUARIO / PESSOA
  const handleDeleteUsuario = (userId: string) => {
    updateDbState((prev) => {
      const nextUsuarios = prev.usuarios.filter((u) => u.id !== userId);
      // Clean up cell associations where they were leader, auxiliares, or supervisor
      const nextCelulas = prev.celulas.map((c) => {
        let updated = false;
        let nextLeader = c.lider_id;
        let nextAuxiliares = [...c.auxiliares];
        let nextSupervisor = c.supervisor_id;

        if (c.lider_id === userId) {
          nextLeader = ""; 
          updated = true;
        }
        if (c.auxiliares.includes(userId)) {
          nextAuxiliares = c.auxiliares.filter((id) => id !== userId);
          updated = true;
        }
        if (c.supervisor_id === userId) {
          nextSupervisor = null;
          updated = true;
        }

        if (updated) {
          return {
            ...c,
            lider_id: nextLeader,
            auxiliares: nextAuxiliares,
            supervisor_id: nextSupervisor,
            quantidade_integrantes: nextLeader === "" ? Math.max(0, c.quantidade_integrantes - 1) : c.quantidade_integrantes
          };
        }
        return c;
      });

      return {
        ...prev,
        usuarios: nextUsuarios,
        celulas: nextCelulas,
      };
    });
  };

  // 5. ADD WEEKLY REPORT MUTATION (with automatic triggers based on Rule 12, 13, 14)
  const handleAddReport = (newReport: Partial<RelatorioSemanal>, presencasMap: Record<string, boolean>) => {
    updateDbState((prev) => {
      const reportId = "rep-gen-" + Date.now();
      const fullReport: RelatorioSemanal = {
        id: reportId,
        igreja_id: currentUser?.igreja_id || "lagoinha-petropolis",
        celula_id: newReport.celula_id || "",
        aconteceu: newReport.aconteceu ?? true,
        quantidade_presentes: newReport.quantidade_presentes || 0,
        visitantes: newReport.visitantes || 0,
        decisao: newReport.decisao || 0,
        pedidos_oracao: newReport.pedidos_oracao || "",
        observacoes: newReport.observacoes || "",
        foto_celula: newReport.foto_celula,
        data_relatorio: newReport.data_relatorio || new Date().toISOString().split("T")[0],
        preenchido_por: currentUser?.id || "",
        created_at: new Date().toISOString(),
      };

      // Find cell to update presence statistics as well
      const cell = prev.celulas.find((c) => c.id === fullReport.celula_id);
      
      const nextCelulas = prev.celulas.map((c) => {
        if (c.id !== fullReport.celula_id) return c;

        // Create updated copy to check alert triggers
        const updatedCopy = { ...c };
        
        // Let's add report and calculate status
        const nextReportsList = [fullReport, ...prev.relatorios];
        const { status, alertMessage } = evaluateCellStatusAndAlerts(updatedCopy, nextReportsList);
        
        updatedCopy.status_cellula = status;

        return updatedCopy;
      });

      // Assemble automatic alert notifications (Rule 14)
      const alertsNotifs: Notificacao[] = [];
      if (cell) {
        const dummyCopy = { ...cell };
        const tempReports = [fullReport, ...prev.relatorios];
        const { status, alertMessage } = evaluateCellStatusAndAlerts(dummyCopy, tempReports);
        
        if (alertMessage) {
          alertsNotifs.push({
            id: "not-alert-" + Date.now(),
            igreja_id: cell.igreja_id,
            usuario_id: "pres-lagoinha", // Auto alert sent straight to President
            titulo: "Alerta de Saúde Celular",
            mensagem: `Célula "${cell.nome_celula}": ${alertMessage}`,
            lida: false,
            tipo: "alerta_celula",
            created_at: new Date().toISOString(),
          });
        }
      }

      return {
        ...prev,
        relatorios: [fullReport, ...prev.relatorios],
        celulas: nextCelulas,
        notificacoes: [...alertsNotifs, ...prev.notificacoes],
      };
    });
  };

  // 6. APPROVE & MUTATE DIRECT POSITION PROMOTIONS (Rule 15)
  const handlePromoteUser = (promo: PromocaoElegivel) => {
    updateDbState((prev) => {
      const updatedUsers = prev.usuarios.map((u) => {
        if (u.id !== promo.usuario_id) return u;
        return {
          ...u,
          cargo_atual: promo.cargo_proposto,
          observacoes: `${u.observacoes || ""}. Promovido a ${promo.cargo_proposto} em ${new Date().toLocaleDateString("pt-BR")}.`,
        };
      });

      // Clear notifications or add a success alert info
      const successNotif: Notificacao = {
        id: "not-promo-success-" + Date.now(),
        igreja_id: currentUser?.igreja_id || "lagoinha-petropolis",
        usuario_id: promo.usuario_id,
        titulo: "Parabéns pela Promoção!",
        mensagem: `Sua liderança foi reconhecida! Você foi promovido(a) a "${promo.cargo_proposto}" com aprovação ministerial.`,
        lida: false,
        tipo: "promocao_disponivel",
        created_at: new Date().toISOString(),
      };

      return {
        ...prev,
        usuarios: updatedUsers,
        notificacoes: [successNotif, ...prev.notificacoes],
      };
    });
  };

  // 7. MULTI-CHURCH: ADD NEW CONGREGATION (Rule 28)
  const handleAddIgreja = (newChurch: Partial<Igreja>, presidentName: string, presidentEmail: string, senha?: string) => {
    updateDbState((prev) => {
      const churchId = "ch-gen-" + Date.now();
      const fullChurch: Igreja = {
        id: churchId,
        nome: newChurch.nome || "Nova Igreja Partner",
        logo: newChurch.logo || "⛪",
        cidade: newChurch.cidade || "Petrópolis",
        estado: newChurch.estado || "RJ",
        pastor_presidente: presidentName,
        telefone: newChurch.telefone || "",
        email: presidentEmail,
        plano: newChurch.plano || "Bronze",
        status: "Ativa",
        quantidade_maxima_usuarios: newChurch.quantidade_maxima_usuarios || 50,
        quantidade_maxima_celulas: newChurch.quantidade_maxima_celulas || 10,
        data_vencimento: newChurch.data_vencimento || "",
        created_at: new Date().toISOString(),
      };

      // Bootstrap a corresponding Pastor Presidente user for this church automatically!
      const presidentUser: Usuario = {
        id: "usr-pres-" + Date.now(),
        igreja_id: churchId,
        nome: presidentName,
        foto: "",
        telefone: newChurch.telefone || "",
        whatsapp: "",
        email: presidentEmail,
        senha: senha || "123", // custom default or assigned credentials password
        endereco: `${fullChurch.cidade}, RJ`,
        data_nascimento: "1980-01-01",
        sexo: "M",
        estado_civil: "Casado(a)",
        cargo_atual: Cargo.PastorPresidente,
        rede_id: null,
        lider_direto_id: null,
        observacoes: "Pastor Presidente fundador e master.",
        created_at: new Date().toISOString(),
      };

      // Provision 2 default networks (Redes) for this church automatically to guide their initial setup!
      const defaultIgrejaRedes: Rede[] = [
        { id: `red-${churchId}-vermelha`, igreja_id: churchId, nome: "Rede Vermelha", cor: "#EF4444", lider_id: presidentUser.id },
        { id: `red-${churchId}-azul`, igreja_id: churchId, nome: "Rede Azul", cor: "#3B82F6", lider_id: presidentUser.id }
      ];

      // Automatically generate simulated SaaS transaction and onboarding emails
      const successEmail: SaasEmail = {
        id: "email-gen-" + Date.now() + "-1",
        destinatario: presidentEmail,
        assunto: "🎉 Bem-vindo ao Prompt Master Celular! Cadastro Efetivado",
        conteudo: `Olá ${presidentName},\n\nSua congregação "${fullChurch.nome}" foi matriculada com sucesso em nossa nuvem segura!\nSeu plano contratado foi o Plano ${fullChurch.plano}. Período gratuito de experimentação de 7 dias habilitado a partir de agora.\n\nAtenciosamente,\nEquipe Prompt Master Celular`,
        status: "Enviado",
        data: new Date().toISOString(),
        tipo: "sucesso_cadastro"
      };

      const procEmail: SaasEmail = {
        id: "email-gen-" + Date.now() + "-2",
        destinatario: presidentEmail,
        assunto: `⚡ Faturamento Ativo - Plano ${fullChurch.plano}`,
        conteudo: `Parabéns ${presidentName},\n\nA fatura mensal referente ao plano ${fullChurch.plano} foi inicializada em nosso faturamento recorrente.\n\nFaturamento simulado via cartão/PIX programado.\nStatus: Ativo em Avaliação.\n\nGateway de Cobrança SaaS`,
        status: "Aprovado",
        data: new Date().toISOString(),
        tipo: "processamento"
      };

      const linkEmail: SaasEmail = {
        id: "email-gen-" + Date.now() + "-3",
        destinatario: presidentEmail,
        assunto: "🔑 Seu link de acesso de Pastor Presidente foi liberado",
        conteudo: `Olá ${presidentName},\n\nSua conta administradora de pastor presidente foi estruturada e está ativa! Clique no link abaixo para configurar sua senha e realizar o primeiro acesso:\n\nLink de Ativação do Login: ${window.location.origin}${window.location.pathname}?invite=${presidentUser.id}\n\nE-mail institucional: ${presidentEmail}`,
        status: "Enviado",
        data: new Date().toISOString(),
        tipo: "link_cadastro",
        link: `${window.location.origin}${window.location.pathname}?invite=${presidentUser.id}`
      };

      saveEmails([successEmail, procEmail, linkEmail, ...saasEmails]);

      return {
        ...prev,
        igrejas: [...prev.igrejas, fullChurch],
        usuarios: [presidentUser, ...prev.usuarios],
        redes: [...prev.redes, ...defaultIgrejaRedes],
      };
    });
  };

  // 8. UPDATE IGREJA STATE (block, modify plans, etc.)
  const handleUpdateIgreja = (churchId: string, updatedFields: Partial<Igreja>) => {
    updateDbState((prev) => {
      const nextIgrejas = prev.igrejas.map((ch) => (ch.id === churchId ? { ...ch, ...updatedFields } : ch));
      return { ...prev, igrejas: nextIgrejas };
    });
  };

  const handleResetPresidentPassword = (email: string) => {
    // Standard redefinition
    setDb((prev) => {
      if (!prev) return prev;
      const nextUsers = prev.usuarios.map((u) => (u.email === email ? { ...u, senha: "123" } : u));
      return { ...prev, usuarios: nextUsers };
    });
  };

  const handleResetDatabaseToClean = () => {
    const masterUser = db?.usuarios.find((u) => u.cargo_atual === Cargo.MasterAdmin) || {
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
      created_at: new Date().toISOString()
    };

    const cleanDb = {
      igrejas: [],
      usuarios: [masterUser],
      celulas: [],
      relatorios: [],
      notificacoes: [],
      redes: [],
    };

    setDb(cleanDb);
    saveStoredData(cleanDb);
    setImpersonatedChurchId(null);
    setCurrentUser(masterUser);
    setCurrentTab("master-panel");
  };

  const handleRestoreSampleData = () => {
    const sampleDb = {
      igrejas: defaultIgrejas,
      usuarios: defaultUsuarios,
      celulas: defaultCelulas,
      relatorios: defaultRelatorios,
      notificacoes: defaultNotificacoes,
      redes: defaultRedes,
    };

    setDb(sampleDb);
    saveStoredData(sampleDb);
    setImpersonatedChurchId(null);
    const masterUser = defaultUsuarios.find((u) => u.email.toLowerCase() === "7daviramos@gmail.com") || defaultUsuarios[0];
    setCurrentUser(masterUser);
    setCurrentTab("master-panel");
  };

  const markNotificationRead = (id: string) => {
    updateDbState((prev) => {
      const nextNotifs = prev.notificacoes.map((n) => (n.id === id ? { ...n, lida: true } : n));
      return { ...prev, notificacoes: nextNotifs };
    });
  };

  // Helper selectors
  const activeUser = virtualUser || currentUser;

  const visibleCelulasList = useMemo(() => {
    if (!db || !activeUser) return [];
    return getVisibleCelulas(db.celulas, activeUser, db.usuarios);
  }, [db, activeUser]);

  const visibleUsuariosList = useMemo(() => {
    if (!db || !activeUser) return [];
    return getVisibleUsuarios(db.usuarios, activeUser);
  }, [db, activeUser]);

  const visibleRelatoriosList = useMemo(() => {
    if (!db || !activeUser) return [];
    return getVisibleRelatorios(db.relatorios, db.celulas, activeUser, db.usuarios);
  }, [db, activeUser]);

  const visibleRedesList = useMemo(() => {
    if (!db || !activeUser) return [];
    if (
      activeUser.cargo_atual === Cargo.MasterAdmin ||
      activeUser.cargo_atual === Cargo.PastorPresidente ||
      activeUser.cargo_atual === Cargo.Administrador
    ) {
      return db.redes.filter((r) => !activeUser.igreja_id || r.igreja_id === activeUser.igreja_id);
    }
    return db.redes.filter((r) => r.id === activeUser.rede_id);
  }, [db, activeUser]);

  const activeChurchObj = useMemo(() => {
    if (!virtualUser || !virtualUser.igreja_id || !db) return null;
    return db.igrejas.find((i) => i.id === virtualUser.igreja_id);
  }, [virtualUser, db]);

  const activeChurchName = activeChurchObj ? activeChurchObj.nome : "Plataforma Geral";
  const userChurchBlocked = activeChurchObj?.status === "Bloqueada";

  const unreadNotifCount = useMemo(() => {
    if (!db || !virtualUser) return 0;
    return db.notificacoes.filter(
      (n) => !n.lida && (!virtualUser.igreja_id || n.igreja_id === virtualUser.igreja_id)
    ).length;
  }, [db, virtualUser]);

  const activeNotificacoesList = useMemo(() => {
    if (!db || !virtualUser) return [];
    return db.notificacoes.filter(
      (n) => !virtualUser.igreja_id || n.igreja_id === virtualUser.igreja_id
    );
  }, [db, virtualUser]);

  // Loading indicator
  if (!db) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-bold mt-4">Iniciando Banco de Dados Relacional...</p>
      </div>
    );
  }

  // LOGIN SCREEN (if not authorized)
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden" id="login_screen_panel">
        
        {/* Render Self-Onboarding Plan checkout wizard if state active */}
        {showSubscriptionWizard && (
          <SGCSaasSubscriptionWizard
            onAddIgreja={handleAddIgreja}
            onAutoLogin={(email) => {
              const matched = db.usuarios.find((u) => u.email.toLowerCase() === email.toLowerCase());
              if (matched) {
                setCurrentUser(matched);
                setShowSubscriptionWizard(false);
              }
            }}
            onClose={() => setShowSubscriptionWizard(false)}
          />
        )}

        <div className="max-w-md w-full mx-auto space-y-6">
          <div className="text-center">
            <span className="text-3xl">⛪</span>
            <h1 className="text-xl font-black text-slate-800 tracking-tight mt-3">Gestão de células para Igreja</h1>
            <p className="text-xs text-indigo-600 font-extrabold uppercase tracking-widest mt-1">
              Plataforma SaaS de Liderança & Comunidade
            </p>
          </div>

          <div className="bg-white border p-8 rounded-2xl shadow-md space-y-6 relative animate-fadeIn">
            {/* Version badge button, acts as developer shortcut as requested for monitoring until sales launch */}
            <div className="absolute top-3 right-3 shrink-0">
              <button
                type="button"
                onClick={() => handleShortcutLogin("7daviramos@gmail.com")}
                className="p-1 px-2 bg-slate-50 text-slate-500 hover:text-slate-800 hover:bg-slate-100 font-bold text-[8px] rounded uppercase tracking-wider border border-slate-200 cursor-pointer transition"
                title="Acesso Master (Davi Ramos)"
              >
                SaaS v1.2 🔒
              </button>
            </div>

            <h3 className="text-sm font-bold text-slate-700 border-b pb-3 text-center">Entrar no Sistema</h3>

            {loginError && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-2">
                <AlertTriangle className="h-4.5 w-4.5 text-red-600 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Manual Form */}
            <form onSubmit={handleManualLogin} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  E-mail institucional
                </label>
                <input
                  type="email"
                  required
                  placeholder="Ex: pastor@lagoinha.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl p-3 text-xs font-semibold outline-none focus:border-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Senha de Acesso
                </label>
                <input
                  type="password"
                  required
                  placeholder="• • • • • •"
                  value={loginSenha}
                  onChange={(e) => setLoginSenha(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl p-3 text-xs font-semibold outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 text-xs rounded-xl border border-blue-700 transition shadow-sm cursor-pointer"
                id="btn_login_submit"
              >
                Acessar Workspace
              </button>
            </form>

            {/* SaaS Self-Subscribe Call-to-action */}
            <div className="bg-slate-50 border border-dashed rounded-xl p-4 text-center space-y-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Ministério da sua Igreja?</span>
              <p className="text-[10.5px] text-slate-500 leading-normal font-sans">
                Faça a gestão de todas as células, cobertura de supervisores, áreas, histórico de relatórios de presença e promoções de cargos.
              </p>
              <button
                type="button"
                onClick={() => setShowSubscriptionWizard(true)}
                className="w-full mt-1 bg-indigo-50 hover:bg-indigo-100/85 text-indigo-700 font-bold py-2.5 px-4 text-xs rounded-xl border border-indigo-200/80 transition-colors cursor-pointer"
                id="trigger_saas_signup"
              >
                ⭐ Começar Teste Grátis de 7 Dias 🎁
              </button>
            </div>

            {/* Fast login helpers shortcuts inside demo! */}
            <div className="border-t pt-5 space-y-3">
              <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-center mb-1">
                Atalhos Rápidos de Simulação
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                <button
                  type="button"
                  onClick={() => handleShortcutLogin("pres@lagoinha.com")}
                  className="text-left p-2.5 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border rounded-lg font-bold flex items-center justify-between"
                  id="shortcut_pres_login"
                >
                  <span>⛪ Pastor Presidente</span>
                  <ArrowRight className="h-3 w-3 text-slate-400" />
                </button>
                <button
                  type="button"
                  onClick={() => handleShortcutLogin("area@lagoinha.com")}
                  className="text-left p-2.5 bg-slate-50 hover:bg-orange-50 hover:border-orange-200 border rounded-lg font-bold flex items-center justify-between"
                  id="shortcut_area_login"
                >
                  <span>🍊 Líder de Área (Jefferson)</span>
                  <ArrowRight className="h-3 w-3 text-slate-400" />
                </button>
                <button
                  type="button"
                  onClick={() => handleShortcutLogin("lider@lagoinha.com")}
                  className="text-left p-2.5 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border rounded-lg font-bold flex items-center justify-between"
                  id="shortcut_lider_login"
                >
                  <span>🟢 Líder de Célula (Rodrigo)</span>
                  <ArrowRight className="h-3 w-3 text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // RESTRICTED BLOCKED SYSTEM TAB (Rule 28 test)
  if (userChurchBlocked) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 text-center">
        <div className="max-w-md w-full bg-white border rounded-2xl shadow-xl p-8 space-y-4">
          <div className="p-4 bg-red-100 text-red-600 rounded-full w-fit mx-auto shadow-inner">
            <ShieldAlert className="h-10 w-10 animate-bounce" />
          </div>
          <h2 className="text-lg font-extrabold text-slate-900 uppercase">Ambiente Suspenso</h2>
          <h3 className="font-bold text-slate-700">{activeChurchName}</h3>
          
          <p className="text-xs text-slate-500 leading-relaxed bg-red-50 p-4 border border-red-100 rounded-xl">
            Sua congregação ultrapassou o período de testes ou as faturas do plano de Gestão de Células SaaS estão pendentes. O Pastor Presidente deve regularizar o acesso.
          </p>
          
          <div className="border-t border-slate-100 pt-4 mt-4 text-[10px] text-slate-400 font-mono">
            igreja_id: {currentUser.igreja_id} • status: BLOQUEADO
          </div>

          <button
            onClick={handleLogout}
            className="w-full bg-slate-800 hover:bg-slate-900 border border-slate-950 text-white font-bold p-3 text-xs rounded-xl shadow-sm cursor-pointer transition-colors"
          >
            Sair do Sistema
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row font-sans" id="sgc_app_root">
      {/* MOBILE HEADER RESPONSIVE BAR (Rule 25) */}
      <div className="lg:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between z-40 relative">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⛪</span>
          <div>
            <h1 className="text-xs font-black text-slate-800 tracking-tight">PROMPT MASTER</h1>
            <span className="text-[9px] text-slate-500 font-mono font-bold block truncate max-w-[120px]">
              {activeChurchName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Notifications pill count */}
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 relative cursor-pointer"
          >
            <Bell className="h-4 w-4" />
            {unreadNotifCount > 0 && (
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full animate-ping"></span>
            )}
          </button>

          {/* Hamburger trigger menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 cursor-pointer"
            id="mobile_hamburger_trigger"
          >
            {mobileMenuOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
          </button>
        </div>
      </div>

      {/* WORKSPACE SIDEBAR - Notion/ClickUp style (Rule 25) */}
      <aside
        className={`bg-white border-r border-slate-200/80 w-64 lg:flex flex-col justify-between shrink-0 fixed inset-y-0 left-0 z-30 transition-all duration-300 lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0 pt-16 lg:pt-0" : "-translate-x-full"
        }`}
        id="sgc_sidebar"
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Main Logo header */}
          <div className="p-6 border-b border-slate-100 hidden lg:flex items-center gap-3">
            <span className="text-3xl p-1 bg-slate-100 rounded-xl">⛪</span>
            <div>
              <h1 className="text-sm font-black text-slate-800 tracking-tight">PROMPT MASTER</h1>
              <span className="text-[10px] bg-slate-50 border text-slate-500 font-mono font-bold block rounded-md px-1.5 py-0.5 truncate max-w-[150px] mt-0.5">
                {activeChurchName}
              </span>
            </div>
          </div>

          {/* Current log user block info with profile and brand configuration settings */}
          <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 truncate flex-1">
              {currentUser.foto ? (
                <img
                  src={currentUser.foto}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-white shadow-xs"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-black text-slate-600 text-xs shrink-0">
                  {currentUser.nome.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div className="truncate">
                <span className="text-xs font-bold text-slate-800 block truncate leading-none">{currentUser.nome}</span>
                <span className="text-[10px] text-slate-400 block font-semibold truncate mt-1">
                  {currentUser.cargo_atual}
                </span>
              </div>
            </div>

            <button
              onClick={() => setProfileEditOpen(true)}
              className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border text-slate-500 hover:text-slate-800 transition cursor-pointer shrink-0 shadow-3xs"
              title="Ajustar Perfil & Identidade Visual"
              id="sidebar_profile_edit_gear"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation Links list with conditional filtering based on security contexts */}
          <nav className="p-4 space-y-1" id="nav_links_container">
            
            {/* If Master Owner is in support mode, show standard church tabs, else hide them completely */}
            {(currentUser.cargo_atual !== Cargo.MasterAdmin || impersonatedChurchId !== null) && (
              <>
                <button
                  onClick={() => {
                    setCurrentTab("dashboard");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full p-2 px-3.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2.5 cursor-pointer ${
                    currentTab === "dashboard" ? "bg-indigo-50 text-indigo-700 shadow-3xs" : "hover:bg-slate-50 text-slate-600"
                  }`}
                  id="sidebar_tab_dashboard"
                >
                  <LayoutDashboard className="h-4.5 w-4.5" />
                  <span>Painel Geral</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentTab("mapa");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full p-2 px-3.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2.5 cursor-pointer ${
                    currentTab === "mapa" ? "bg-indigo-50 text-indigo-700 shadow-3xs" : "hover:bg-slate-50 text-slate-600"
                  }`}
                  id="sidebar_tab_mapa"
                >
                  <Map className="h-4.5 w-4.5" />
                  <span>Mapa de Células</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentTab("celulas");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full p-2 px-3.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2.5 cursor-pointer ${
                    currentTab === "celulas" ? "bg-indigo-50 text-indigo-700 shadow-3xs" : "hover:bg-slate-50 text-slate-600"
                  }`}
                  id="sidebar_tab_celulas"
                >
                  <Home className="h-4.5 w-4.5" />
                  <span>Células</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentTab("pessoas");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full p-2 px-3.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2.5 cursor-pointer ${
                    currentTab === "pessoas" ? "bg-indigo-50 text-indigo-700 shadow-3xs" : "hover:bg-slate-50 text-slate-600"
                  }`}
                  id="sidebar_tab_pessoas"
                >
                  <Users className="h-4.5 w-4.5" />
                  <span>Membros & Promoções</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentTab("relatorios");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full p-2 px-3.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2.5 cursor-pointer ${
                    currentTab === "relatorios" ? "bg-indigo-50 text-indigo-700 shadow-3xs" : "hover:bg-slate-50 text-slate-600"
                  }`}
                  id="sidebar_tab_relatorios"
                >
                  <FileText className="h-4.5 w-4.5" />
                  <span>Relatórios Semanais</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentTab("organograma");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full p-2 px-3.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2.5 cursor-pointer ${
                    currentTab === "organograma" ? "bg-indigo-50 text-indigo-700 shadow-3xs" : "hover:bg-slate-50 text-slate-600"
                  }`}
                  id="sidebar_tab_organograma"
                >
                  <GitBranch className="h-4.5 w-4.5" />
                  <span>Organograma Cobertura</span>
                </button>
              </>
            )}

            {/* Master administration Switch Tab */}
            {currentUser.cargo_atual === Cargo.MasterAdmin && (
              <div className="pt-4 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 block px-3.5 uppercase tracking-widest mb-1.5 select-none">
                  SaaS Master Control
                </span>
                
                <button
                  onClick={() => {
                    setCurrentTab("master-panel");
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full p-2 px-3.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2.5 cursor-pointer ${
                    currentTab === "master-panel" && impersonatedChurchId === null
                      ? "bg-slate-900 text-white shadow-3xs"
                      : "hover:bg-slate-50 text-slate-600"
                  }`}
                  id="sidebar_tab_master"
                >
                  <Settings className="h-4.5 w-4.5 text-indigo-500" />
                  <span>Painel Master SaaS</span>
                </button>

                {/* Return back button to Exit Impersonation support session */}
                {impersonatedChurchId !== null && (
                  <button
                    onClick={() => {
                      setImpersonatedChurchId(null);
                      setCurrentTab("master-panel");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full mt-2 p-2 px-3.5 text-xs font-bold rounded-xl text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-100 transition flex items-center gap-2.5 cursor-pointer animate-pulse"
                    id="sidebar_exit_support_bt"
                  >
                    <ArrowLeft className="h-4.5 w-4.5 text-teal-600 shrink-0" />
                    <span className="truncate">Voltar ao Painel Master</span>
                  </button>
                )}
              </div>
            )}
          </nav>
        </div>

        {/* Bottom panel actions exit */}
        <div className="p-4 border-t border-slate-100 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full p-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100/80 transition rounded-xl flex items-center justify-center gap-2 border border-red-100 cursor-pointer"
            id="sidebar_logout_btn"
          >
            <LogOut className="h-4 w-4" />
            <span>Sair do Sistema</span>
          </button>
        </div>
      </aside>

      {/* WORKSPACE CONTENT ROUTER PANEL */}
      <main className="flex-1 lg:pl-64 flex flex-col min-w-0" id="sgc_main_scrollable">
        
        {/* Support Impersonation warning banner */}
        {impersonatedChurchId && (
          <div className="bg-amber-50 border-b border-amber-200 p-3 px-6 text-xs text-amber-800 flex flex-wrap items-center justify-between gap-2.5 animate-fadeIn">
            <span className="font-semibold flex items-center gap-1.5 leading-normal">
              ⚠️ <span className="underline">Modo Suporte Ativo</span>: Visualizando e editando dados institucionais de <strong className="text-slate-900 font-extrabold">{activeChurchName}</strong>. Quaisquer alterações persistirão para este cliente.
            </span>
            <button
              onClick={() => {
                setImpersonatedChurchId(null);
                setCurrentTab("master-panel");
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold p-1 px-3.5 rounded-lg border border-amber-700 transition cursor-pointer text-[10px]"
            >
              Voltar ao Painel Master
            </button>
          </div>
        )}

        {/* DESKTOP NOTIFICATION HEADER STRIP */}
        <header className="bg-white border-b border-slate-200/80 p-4 pl-6 hidden lg:flex items-center justify-end z-20 shrink-0 sticky top-0 bg-white/90 backdrop-blur-xs">
          <div className="flex items-center gap-4">
            {/* Quick help context badge */}
            <span className="text-xs bg-slate-50 border text-slate-500 p-1.5 px-3 rounded-lg font-mono flex items-center gap-1.5 select-none font-bold">
              🕒 UTC: 2026-05-25 (Demo)
            </span>

            {/* In-app Notification center bell trigger button */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 bg-slate-55 hover:bg-slate-100 transition border rounded-xl text-slate-600 relative cursor-pointer"
                id="bell_notification_trigger"
              >
                <Bell className="h-4.5 w-4.5" />
                {unreadNotifCount > 0 && (
                  <span className="absolute top-[-2px] right-[-2px] block h-4 w-4 rounded-full bg-red-500 text-[10px] text-white font-extrabold text-center leading-none flex items-center justify-center border-2 border-white font-mono">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              {/* Notification Overlay Panel popup */}
              {notificationsOpen && (
                <div className="absolute right-0 top-11 z-50 bg-white border rounded-2xl shadow-xl w-[320px] p-4 text-xs space-y-3 animate-zoomIn">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h4 className="font-bold text-slate-800">Notificações Recentes ({activeNotificacoesList.length})</h4>
                    <button
                      onClick={() => setNotificationsOpen(false)}
                      className="text-[10px] text-blue-600 hover:underline font-bold"
                    >
                      Fechar
                    </button>
                  </div>
                  <div className="max-h-[250px] overflow-y-auto space-y-2.5 divide-y divide-slate-100">
                    {activeNotificacoesList.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markNotificationRead(notif.id)}
                        className={`pt-2 pointer cursor-pointer hover:bg-slate-50/50 p-1 rounded transition-colors ${
                          !notif.lida ? "font-bold text-slate-800 bg-blue-50/20" : "text-slate-500"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          {!notif.lida && <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>}
                          <span>{notif.titulo}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-normal leading-relaxed mt-0.5">
                          {notif.mensagem}
                        </p>
                      </div>
                    ))}

                    {activeNotificacoesList.length === 0 && (
                      <div className="text-center p-4 text-slate-400 italic">Sem notificações recentes.</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Tab route visual display */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              {currentTab === "dashboard" && (
                <div className="space-y-6">
                  <SGCDashboard
                    celulas={visibleCelulasList}
                    usuarios={visibleUsuariosList}
                    redes={visibleRedesList}
                    relatorios={visibleRelatoriosList}
                    promocoesElegiveis={promocoesElegiveis}
                    notificacoes={activeNotificacoesList}
                    currentUser={virtualUser || currentUser}
                    onNavigate={(tab) => setCurrentTab(tab)}
                  />
                  {/* Embedded inline map on dashboard for premium visuals */}
                  <div className="border-t border-slate-200/50 pt-3">
                    <SGCMap
                      celulas={visibleCelulasList}
                      redes={visibleRedesList}
                      usuarios={visibleUsuariosList}
                      selectedRedId={selectedMapRedId}
                      setSelectedRedId={setSelectedMapRedId}
                      selectedStatus={selectedMapStatus}
                      setSelectedStatus={setSelectedMapStatus}
                      cidade={activeChurchObj?.cidade}
                    />
                  </div>
                </div>
              )}

              {currentTab === "mapa" && (
                <SGCMap
                  celulas={visibleCelulasList}
                  redes={visibleRedesList}
                  usuarios={visibleUsuariosList}
                  selectedRedId={selectedMapRedId}
                  setSelectedRedId={setSelectedMapRedId}
                  selectedStatus={selectedMapStatus}
                  setSelectedStatus={setSelectedMapStatus}
                  cidade={activeChurchObj?.cidade}
                />
              )}

              {currentTab === "celulas" && (
                <SGCCelulasList
                  celulas={visibleCelulasList}
                  usuarios={visibleUsuariosList}
                  redes={visibleRedesList}
                  currentUser={virtualUser || currentUser}
                  onAddCelula={handleAddCelula}
                  onUpdateCelula={handleUpdateCelula}
                  onDeleteCelula={handleDeleteCelula}
                  selectedCellId={selectedCellId}
                  onSelectCellId={setSelectedCellId}
                  onUpdateUsuario={handleUpdateUsuario}
                  onDeleteUsuario={handleDeleteUsuario}
                />
              )}

              {currentTab === "pessoas" && (
                <SGCPessoasForm
                  usuarios={visibleUsuariosList}
                  redes={visibleRedesList}
                  currentUser={virtualUser || currentUser}
                  promocoesElegiveis={promocoesElegiveis}
                  onAddUsuario={handleAddUsuario}
                  onUpdateUsuario={handleUpdateUsuario}
                  onPromoteUser={handlePromoteUser}
                  onDeleteUsuario={handleDeleteUsuario}
                />
              )}

              {currentTab === "relatorios" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* New report filing form */}
                  <div className="lg:col-span-2">
                    <SGCReportForm
                      celulas={visibleCelulasList}
                      usuarios={visibleUsuariosList}
                      currentUser={virtualUser || currentUser}
                      onSubmitReport={handleAddReport}
                    />
                  </div>

                  {/* Previous Reports feed history column */}
                  <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4 font-sans text-xs">
                    <div className="border-b pb-2">
                      <h4 className="font-extrabold text-slate-800 uppercase tracking-widest text-[10px]">
                        Histórico de Relatórios Enviados
                      </h4>
                      <p className="text-[10px] text-slate-400">Exibindo os últimos lançamentos semanais correspondentes ao seu escopo hierárquico.</p>
                    </div>

                    <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                      {visibleRelatoriosList
                        .map((rel) => {
                          const associatedCell = visibleCelulasList.find((c) => c.id === rel.celula_id);
                          return (
                            <div key={rel.id} className="border border-slate-100 hover:border-slate-200 bg-slate-50/20 rounded-xl p-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-black text-slate-800 text-xs">
                                  {associatedCell ? associatedCell.nome_celula : "Célula Geral"}
                                </span>
                                <span className="text-[10px] bg-slate-100 font-mono text-slate-500 px-1.5 py-0.5 rounded">
                                  {rel.data_relatorio}
                                </span>
                              </div>

                              <div className="grid grid-cols-3 gap-1 bg-white border border-slate-100/50 p-2 rounded-lg text-center font-mono text-[10px]">
                                <div className="text-slate-500 border-r border-slate-100">
                                  Presentes <span className="font-black text-slate-800 block">{rel.quantidade_presentes}</span>
                                </div>
                                <div className="text-slate-500 border-r border-slate-100">
                                  Vistantes <span className="font-black text-slate-800 block">{rel.visitantes}</span>
                                </div>
                                <div className="text-slate-500">
                                  Decisões <span className="font-black text-amber-600 block">{rel.decisao}</span>
                                </div>
                              </div>

                              {rel.foto_celula && (
                                <img
                                  src={rel.foto_celula}
                                  alt=""
                                  className="w-full h-24 object-cover rounded-lg border border-slate-50"
                                  referrerPolicy="no-referrer"
                                />
                              )}

                              {rel.pedidos_oracao && (
                                <div className="p-2 rounded bg-rose-50/50 text-[10px] text-rose-700 leading-relaxed italic border border-rose-100/30">
                                  🙏 "{rel.pedidos_oracao}"
                                </div>
                              )}

                              <div className="text-[11px] text-slate-500 truncate mt-1">
                                💬 "{rel.observacoes || "Sem observações detalhadas..."}"
                              </div>
                            </div>
                          );
                        })}

                      {visibleRelatoriosList.length === 0 && (
                        <div className="text-center p-8 text-slate-400 italic">Sem relatórios lançados elegíveis.</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {currentTab === "organograma" && (
                <SGCOrganograma
                  usuarios={visibleUsuariosList}
                  celulas={visibleCelulasList}
                  currentUser={virtualUser || currentUser}
                  promocoesElegiveis={promocoesElegiveis}
                  onPromoteClick={(userId) => {
                    // Switch to Membros/Pessoas where promotion sliders and triggers reside
                    setCurrentTab("pessoas");
                  }}
                  onSelectCell={(cellId) => {
                    setSelectedCellId(cellId);
                    setCurrentTab("celulas");
                  }}
                />
              )}

              {currentTab === "master-panel" && currentUser.cargo_atual === Cargo.MasterAdmin && (
                <SGCSaasMasterPanel
                  igrejas={db.igrejas}
                  usuarios={db.usuarios}
                  emails={saasEmails}
                  onAddIgreja={handleAddIgreja}
                  onUpdateIgreja={handleUpdateIgreja}
                  onResetPresidentPassword={handleResetPresidentPassword}
                  onImpersonateChurch={(churchId) => {
                    setImpersonatedChurchId(churchId);
                    setCurrentTab("dashboard");
                  }}
                  onResetDatabaseToClean={handleResetDatabaseToClean}
                  onRestoreSampleData={handleRestoreSampleData}
                  onBroadcastUpdate={handleBroadCastUpdateEmail}
                  onSimulateEmailFail={(presidentEmail, churchName, amount) => {
                    const failEmail: SaasEmail = {
                      id: "email-fail-" + Date.now(),
                      destinatario: presidentEmail,
                      assunto: `⚠️ Cobrança Falhou: Assinatura Recusada em ${churchName}`,
                      conteudo: `Prezado Pastor,\n\nHouve uma falha na transação bancária automática da mensalidade SaaS no valor de R$ ${amount},00 contratada para a igreja "${churchName}".\nA administradora do cartão de crédito recusou o débito.\n\nPor favor, atualize as credenciais de pagamento ou pague via Pix em sua aba administrativa do aplicativo para evitar a suspensão da conta.\n\nDepartamento Recorrente Prompt Master`,
                      status: "Falha na Transação",
                      data: new Date().toISOString(),
                      tipo: "erro_pagamento"
                    };
                    saveEmails([failEmail, ...saasEmails]);
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Render Profile & Brand Configuration Overlay Modal */}
      {profileEditOpen && (
        <SGCProfileEditModal
          currentUser={currentUser}
          activeChurch={activeChurchObj}
          onUpdateUser={handleUpdateUsuario}
          onUpdateIgreja={handleUpdateIgreja}
          onClose={() => setProfileEditOpen(false)}
        />
      )}
    </div>
  );
}
