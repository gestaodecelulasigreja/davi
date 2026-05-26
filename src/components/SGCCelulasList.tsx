/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Celula, CellStatus, Usuario, Rede, Cargo } from "../types";
import { PlusCircle, Search, MapPin, Calendar, Clock, UserCheck, ShieldAlert, Sparkles, Filter, X, ArrowUpRight, Share2, Copy, Check, Users, Trash, Edit3 } from "lucide-react";
import { evaluateCellStatusAndAlerts } from "../data";

interface SGCCelulasListProps {
  celulas: Celula[];
  usuarios: Usuario[];
  redes: Rede[];
  currentUser: Usuario;
  onAddCelula: (newCell: Partial<Celula>) => void;
  onUpdateCelula: (cellId: string, updated: Partial<Celula>) => void;
  onDeleteCelula: (cellId: string) => void;
  selectedCellId?: string | null;
  onSelectCellId?: (cellId: string | null) => void;
  onUpdateUsuario: (userId: string, updated: Partial<Usuario>) => void;
  onDeleteUsuario: (userId: string) => void;
}

const PetropolisNeighborhoods: Record<string, { lat: number; lng: number }> = {
  "Centro": { lat: -22.5049, lng: -43.1784 },
  "Quitandinha": { lat: -22.5255, lng: -43.2012 },
  "Bingen": { lat: -22.4883, lng: -43.2104 },
  "Itaipava": { lat: -22.4042, lng: -43.1256 },
  "Corrêas": { lat: -22.4639, lng: -43.1417 },
  "Cascatinha": { lat: -22.4772, lng: -43.1611 },
  "Valparaíso": { lat: -22.5152, lng: -43.1903 },
  "Alto da Serra": { lat: -22.5222, lng: -43.1642 },
  "Retiro": { lat: -22.4936, lng: -43.1739 },
  "Nogueira": { lat: -22.4344, lng: -43.1114 }
};

export default function SGCCelulasList({
  celulas,
  usuarios,
  redes,
  currentUser,
  onAddCelula,
  onUpdateCelula,
  onDeleteCelula,
  selectedCellId,
  onSelectCellId,
  onUpdateUsuario,
  onDeleteUsuario,
}: SGCCelulasListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const uniqueBairros = React.useMemo(() => {
    const list = new Set<string>();
    celulas.forEach((c) => {
      if (c.bairro) list.add(c.bairro);
    });
    Object.keys(PetropolisNeighborhoods).forEach((k) => list.add(k));
    return Array.from(list).sort();
  }, [celulas]);

  const [selectedBairro, setSelectedBairro] = useState("Todos");
  const [selectedStatus, setSelectedStatus] = useState("Todos");
  const [selectedRedId, setSelectedRedId] = useState("Todos");
  const [selectedTipo, setSelectedTipo] = useState("Todos");

  // State for adding new cell
  const [showAddForm, setShowAddForm] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // New cell form fields
  const [nomeCelula, setNomeCelula] = useState("");
  const [endereco, setEndereco] = useState("");
  const [cep, setCep] = useState("");
  const [bairro, setBairro] = useState("Centro");
  const [diaSemana, setDiaSemana] = useState<Celula["dia_semana"]>("Sábado");
  const [horario, setHorario] = useState("19:00");
  const [liderId, setLiderId] = useState("");
  const [redeId, setRedeId] = useState(redes.length > 0 ? redes[0].id : "");
  const [supervisorId, setSupervisorId] = useState("");
  const [quantidadeIntegrantes, setQuantidadeIntegrantes] = useState(0);
  const [observacoes, setObservacoes] = useState("");
  const [tipoCelula, setTipoCelula] = useState<"Mista" | "Jovem" | "Adolescentes" | "Kids" | "Homens" | "Mulheres">("Mista");
  const [errorMsg, setErrorMsg] = useState("");
  const [newMemberParentPhone, setNewMemberParentPhone] = useState("");

  // Editing Cell states
  const [isEditingCell, setIsEditingCell] = useState(false);
  const [editNomeCelula, setEditNomeCelula] = useState("");
  const [editEndereco, setEditEndereco] = useState("");
  const [editCep, setEditCep] = useState("");
  const [editBairro, setEditBairro] = useState("");
  const [editDiaSemana, setEditDiaSemana] = useState<Celula["dia_semana"]>("Sábado");
  const [editHorario, setEditHorario] = useState("19:00");
  const [editLiderId, setEditLiderId] = useState("");
  const [editRedeId, setEditRedeId] = useState("");
  const [editSupervisorId, setEditSupervisorId] = useState("");
  const [editQuantidadeIntegrantes, setEditQuantidadeIntegrantes] = useState(0);
  const [editObservacoes, setEditObservacoes] = useState("");
  const [editTipoCelula, setEditTipoCelula] = useState<"Mista" | "Jovem" | "Adolescentes" | "Kids" | "Homens" | "Mulheres">("Mista");
  const [editStatusCelula, setEditStatusCelula] = useState<CellStatus>(CellStatus.VERDE);

  // Editing direct cell member states
  const [editingMember, setEditingMember] = useState<Usuario | null>(null);
  const [editMemberName, setEditMemberName] = useState("");
  const [editMemberPhone, setEditMemberPhone] = useState("");
  const [editMemberEmail, setEditMemberEmail] = useState("");
  const [editMemberParentPhone, setEditMemberParentPhone] = useState("");
  const [editMemberEstadoCivil, setEditMemberEstadoCivil] = useState<Usuario["estado_civil"]>("Solteiro(a)");

  // Helper to resolve rank indexes for deletion hierarchy (as requested)
  const getCargoRank = (cargo: Cargo): number => {
    switch (cargo) {
      case Cargo.MasterAdmin: return 10;
      case Cargo.PastorPresidente: return 9;
      case Cargo.LiderRede: return 8;
      case Cargo.LiderArea: return 7;
      case Cargo.SupervisorSetor: return 6;
      case Cargo.LiderSupervisor: return 5;
      case Cargo.LiderCelula: return 4;
      case Cargo.AuxiliarCelula: return 3;
      case Cargo.Integrante: return 2;
      default: return 0;
    }
  };

  // Rule: o pastor pode excluir tudo, e assim sucessivamente ate chegar ao lider de celula excluir integrante de sua celula apenas
  const canDeleteUser = (userToDelete: Usuario): boolean => {
    if (userToDelete.id === currentUser.id) return false; // cannot delete self

    const R_user = getCargoRank(currentUser.cargo_atual);
    const R_target = getCargoRank(userToDelete.cargo_atual);

    // Pastor or Master can delete anyone
    if (currentUser.cargo_atual === Cargo.MasterAdmin || currentUser.cargo_atual === Cargo.PastorPresidente) {
      return true;
    }

    // Role must be strictly higher in rank
    if (R_user <= R_target) return false;

    // Lider de Rede / Lider Area (Rank 7, 8) can delete any lower rank in their network
    if (currentUser.cargo_atual === Cargo.LiderRede || currentUser.cargo_atual === Cargo.LiderArea) {
      return userToDelete.rede_id === currentUser.rede_id;
    }

    // Supervisor (Rank 5, 6) can delete lower rank (Lider Celula, Auxiliares, Integrantes) in cells they coordinate or direct subordinate
    if (currentUser.cargo_atual === Cargo.SupervisorSetor || currentUser.cargo_atual === Cargo.LiderSupervisor) {
      return userToDelete.lider_direto_id === currentUser.id ||
             celulas.some(c => c.supervisor_id === currentUser.id && (c.lider_id === userToDelete.id || c.auxiliares.includes(userToDelete.id) || userToDelete.lider_direto_id === c.lider_id));
    }

    // Lider Celula (Rank 4) can only delete Integrantes or Auxiliares belonging to their cell
    if (currentUser.cargo_atual === Cargo.LiderCelula) {
      const isDirectMember = userToDelete.lider_direto_id === currentUser.id && userToDelete.cargo_atual === Cargo.Integrante;
      const isMyAuxiliar = celulas.some(c => c.lider_id === currentUser.id && c.auxiliares.includes(userToDelete.id));
      return isDirectMember || isMyAuxiliar;
    }

    return false;
  };

  const canDeleteCell = (cell: Celula): boolean => {
    // Pastor or Master can delete any cell
    if (currentUser.cargo_atual === Cargo.MasterAdmin || currentUser.cargo_atual === Cargo.PastorPresidente) {
      return true;
    }

    // Lider de Rede / Area can delete cells in their network
    if (currentUser.cargo_atual === Cargo.LiderRede || currentUser.cargo_atual === Cargo.LiderArea) {
      return cell.rede_id === currentUser.rede_id;
    }

    // Supervisor can delete cells they supervise
    if (currentUser.cargo_atual === Cargo.SupervisorSetor || currentUser.cargo_atual === Cargo.LiderSupervisor) {
      return cell.supervisor_id === currentUser.id || cell.lider_id === currentUser.id;
    }

    return false; // Cell leaders and under cannot delete cells
  };

  const handleStartEditCell = (cell: Celula) => {
    setIsEditingCell(true);
    setEditNomeCelula(cell.nome_celula);
    setEditEndereco(cell.endereco_completo);
    setEditCep(cell.cep || "");
    setEditBairro(cell.bairro);
    setEditDiaSemana(cell.dia_semana);
    setEditHorario(cell.horario);
    setEditLiderId(cell.lider_id);
    setEditRedeId(cell.rede_id);
    setEditSupervisorId(cell.supervisor_id || "");
    setEditQuantidadeIntegrantes(cell.quantidade_integrantes);
    setEditObservacoes(cell.observacoes || "");
    setEditTipoCelula(cell.tipo_celula || "Mista");
    setEditStatusCelula(cell.status_celula);
  };

  const handleSaveCellEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expandedCell) return;

    if (editTipoCelula === "Kids") {
      const chosenLeader = usuarios.find((u) => u.id === editLiderId);
      if (chosenLeader && chosenLeader.sexo !== "F") {
        alert("Atenção: Uma Célula Kids só pode ser liderada por líder mulher! Selecione uma líder feminina.");
        return;
      }
    }
    if (editTipoCelula === "Mulheres") {
      const chosenLeader = usuarios.find((u) => u.id === editLiderId);
      if (chosenLeader && chosenLeader.sexo !== "F") {
        alert("Atenção: Uma Célula de Mulheres só pode ser liderada por líder mulher! Selecione uma líder feminina.");
        return;
      }
    }

    onUpdateCelula(expandedCell.id, {
      nome_celula: editNomeCelula,
      endereco_completo: editEndereco,
      cep: editCep,
      bairro: editBairro,
      dia_semana: editDiaSemana,
      horario: editHorario,
      lider_id: editLiderId,
      rede_id: editRedeId,
      supervisor_id: editSupervisorId || null,
      quantidade_integrantes: editQuantidadeIntegrantes,
      observacoes: editObservacoes,
      tipo_celula: editTipoCelula,
      status_celula: editStatusCelula,
    });
    setIsEditingCell(false);
  };

  const handleStartEditMember = (member: Usuario) => {
    setEditingMember(member);
    setEditMemberName(member.nome);
    setEditMemberPhone(member.telefone || "");
    setEditMemberEmail(member.email || "");
    setEditMemberParentPhone(member.telefone_responsavel || "");
    setEditMemberEstadoCivil(member.estado_civil || "Solteiro(a)");
  };

  const handleSaveMemberEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    onUpdateUsuario(editingMember.id, {
      nome: editMemberName,
      telefone: editMemberPhone,
      email: editMemberEmail,
      telefone_responsavel: editMemberParentPhone || undefined,
      estado_civil: editMemberEstadoCivil,
    });
    setEditingMember(null);
  };

  const handleCepLookup = async (cepVal: string, isEditing: boolean = false) => {
    const cleanCep = cepVal.replace(/\D/g, "");
    if (cleanCep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          if (isEditing) {
            setEditEndereco(data.logradouro || "");
            setEditBairro(data.bairro || "");
          } else {
            setEndereco(data.logradouro || "");
            setBairro(data.bairro || "");
          }
        }
      } catch (err) {
        console.error("Erro ao carregar CEP:", err);
      }
    }
  };

  // Managing Cell selected to expand details
  const [selectedCellDetailId, setSelectedCellDetailId] = useState<string | null>(null);

  // Synchronize state from parent if updated (such as navigating from Organograma)
  React.useEffect(() => {
    if (selectedCellId !== undefined) {
      setSelectedCellDetailId(selectedCellId);
    }
  }, [selectedCellId]);

  const handleCloseDetail = () => {
    setSelectedCellDetailId(null);
    if (onSelectCellId) {
      onSelectCellId(null);
    }
  };

  const tipoStyle: Record<string, { bg: string; text: string; border: string }> = {
    Mista: { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200" },
    Jovem: { bg: "bg-blue-50/70", text: "text-blue-700 font-bold", border: "border-blue-150" },
    Adolescentes: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200" },
    Kids: { bg: "bg-pink-50", text: "text-pink-600", border: "border-pink-200" },
    Homens: { bg: "bg-cyan-50", text: "text-cyan-600", border: "border-cyan-200" },
    Mulheres: { bg: "bg-teal-50", text: "text-teal-600", border: "border-teal-200" },
  };

  // Add Member to cell state
  const [showAddMemberField, setShowAddMemberField] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberPhone, setNewMemberPhone] = useState("");

  const handleCreateCell = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!nomeCelula || !liderId || !redeId) return;

    const chosenLeader = usuarios.find((u) => u.id === liderId);
    if (tipoCelula === "Kids" && chosenLeader && chosenLeader.sexo !== "F") {
      setErrorMsg("Atenção: Uma Célula Kids só pode ser liderada por líder mulher! Selecione uma líder feminina.");
      return;
    }

    if (tipoCelula === "Mulheres" && chosenLeader && chosenLeader.sexo !== "F") {
      setErrorMsg("Atenção: Uma Célula de Mulheres só pode ser liderada por líder mulher! Selecione uma líder feminina.");
      return;
    }

    // Resolve geographic position dynamically using the Petropolis geocoding directory
    const resolvedCoords = PetropolisNeighborhoods[bairro] || { lat: -22.5049, lng: -43.1784 };

    // Set standard offsets slightly to avoid pins sitting directly atop each other
    const latOffset = resolvedCoords.lat + (Math.random() - 0.5) * 0.005;
    const lngOffset = resolvedCoords.lng + (Math.random() - 0.5) * 0.005;

    onAddCelula({
      nome_celula: nomeCelula,
      endereco_completo: endereco,
      cep,
      bairro,
      latitude: latOffset,
      longitude: lngOffset,
      dia_semana: diaSemana,
      horario,
      lider_id: liderId,
      auxiliares: [],
      rede_id: redeId,
      supervisor_id: supervisorId || null,
      quantidade_integrantes: quantidadeIntegrantes,
      tipo_celula: tipoCelula,
      data_abertura: new Date().toISOString().split("T")[0],
      observacoes,
    });

    // Reset Form
    setShowAddForm(false);
    setNomeCelula("");
    setEndereco("");
    setCep("");
    setObservacoes("");
    setErrorMsg("");
  };

  const handleCopyPublicLink = () => {
    const publicUrl = `${window.location.origin}/invite-register-celula?igreja_id=${currentUser.igreja_id || "default"}`;
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => {
      setCopiedLink(false);
    }, 3000);
  };

  // Filter cells according to RLS permissions
  const visibleCelulas = celulas.filter((cell) => {
    // 1. Church scope check
    if (currentUser.igreja_id && cell.igreja_id !== currentUser.igreja_id) {
      return false;
    }

    // If the user is the leader of this cell, they must ALWAYS see it, regardless of level/promotions
    if (cell.lider_id === currentUser.id) {
      return true;
    }

    // 2. Hierarchical scope check (RLS simulator)
    if (currentUser.cargo_atual === Cargo.PastorPresidente || currentUser.cargo_atual === Cargo.MasterAdmin) {
      return true; // Presidente sees everything inside church
    }
    if (currentUser.cargo_atual === Cargo.LiderRede) {
      return cell.rede_id === currentUser.rede_id; // Rede restriction
    }
    if (currentUser.cargo_atual === Cargo.LiderArea) {
      // Area leader sees their area (Area Jefferson led by Marcos, matches red network)
      return cell.rede_id === currentUser.rede_id;
    }
    if (currentUser.cargo_atual === Cargo.SupervisorSetor || currentUser.cargo_atual === Cargo.LiderSupervisor) {
      // Sees cells under their direct coordinate structure
      return cell.supervisor_id === currentUser.id || cell.lider_id === currentUser.id;
    }
    if (currentUser.cargo_atual === Cargo.LiderCelula || currentUser.cargo_atual === Cargo.AuxiliarCelula) {
      return cell.lider_id === currentUser.id || cell.id === currentUser.id; // Only their cell
    }
    return false;
  });

  // Apply visual search and filter filters
  const filteredCelulas = visibleCelulas.filter((cell) => {
    const matchesSearch = cell.nome_celula.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          cell.bairro.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBairro = selectedBairro === "Todos" || cell.bairro === selectedBairro;
    const matchesStatus = selectedStatus === "Todos" || cell.status_celula === selectedStatus;
    const matchesRed = selectedRedId === "Todos" || cell.rede_id === selectedRedId;
    const matchesTipo = selectedTipo === "Todos" || (cell.tipo_celula || "Mista") === selectedTipo;

    return matchesSearch && matchesBairro && matchesStatus && matchesRed && matchesTipo;
  });

  // Members selection lists for dropdowns - allow all leadership roles to lead cells
  const eligibleLeaders = [
    Cargo.LiderRede,
    Cargo.LiderArea,
    Cargo.SupervisorSetor,
    Cargo.LiderSupervisor,
    Cargo.LiderCelula
  ];
  const availableLeaders = usuarios.filter(
    (u) => eligibleLeaders.includes(u.cargo_atual) && (!currentUser.igreja_id || u.igreja_id === currentUser.igreja_id)
  );

  const availableSupervisors = usuarios.filter(
    (u) => u.cargo_atual === Cargo.LiderSupervisor && (!currentUser.igreja_id || u.igreja_id === currentUser.igreja_id)
  );

  const availableAuxiliares = usuarios.filter(
    (u) => u.cargo_atual === Cargo.AuxiliarCelula && (!currentUser.igreja_id || u.igreja_id === currentUser.igreja_id)
  );

  // Status mapping colors styling utilities
  const statusConfig: Record<CellStatus, { label: string; bg: string; text: string; border: string; desc: string }> = {
    [CellStatus.VERDE]: { label: "Saudável", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", desc: "4-11 pessoas" },
    [CellStatus.AMARELO]: { label: "Atenção", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", desc: "Poucas pessoas (<4)" },
    [CellStatus.VERMELHO]: { label: "Problema", bg: "bg-red-50", text: "text-red-700", border: "border-red-200", desc: "Baixa freq. reuniões" },
    [CellStatus.AZUL]: { label: "Pronta p/ Multiplicar", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", desc: "Elevada (>12)" },
  };

  const handleAddMemberToCell = (cellId: string) => {
    if (!newMemberName) return;

    const cellObj = celulas.find((c) => c.id === cellId);
    if (!cellObj) return;

    // Simulate appending new user to global list (this will update users from state)
    const mockNewUserId = "user-added-" + Math.random();
    const newUserRecord: Usuario = {
      id: mockNewUserId,
      igreja_id: currentUser.igreja_id,
      nome: newMemberName,
      foto: "",
      telefone: newMemberPhone || "(24) 99000-0000",
      whatsapp: newMemberPhone.replace(/\D/g, "") || "24990000000",
      email: newMemberEmail || `${newMemberName.toLowerCase().replace(/\s/g, "")}@gmail.com`,
      endereco: "Endereço cadastrado",
      sexo: "M",
      estado_civil: "Solteiro(a)",
      data_nascimento: "1995-01-01",
      cargo_atual: Cargo.Integrante,
      rede_id: cellObj.rede_id,
      lider_direto_id: cellObj.lider_id,
      telefone_responsavel: cellObj.tipo_celula === "Kids" ? newMemberParentPhone : undefined,
      observacoes: "Adicionado via ficha de Célula.",
      created_at: new Date().toISOString(),
    };

    onUpdateCelula(cellId, {
      quantidade_integrantes: cellObj.quantidade_integrantes + 1,
    });

    // We can push this new user directly into the mock DB!
    // Triggers custom component update helper
    usuarios.push(newUserRecord);

    setNewMemberName("");
    setNewMemberEmail("");
    setNewMemberPhone("");
    setNewMemberParentPhone("");
    setShowAddMemberField(false);
  };

  const handleRemoveAuxiliar = (cellId: string, auxIdToDelete: string) => {
    const cellObj = celulas.find((c) => c.id === cellId);
    if (!cellObj) return;
    const filteredAux = cellObj.auxiliares.filter((a) => a !== auxIdToDelete);
    onUpdateCelula(cellId, { auxiliares: filteredAux });
  };

  const handleAddAuxiliar = (cellId: string, newAuxId: string) => {
    const cellObj = celulas.find((c) => c.id === cellId);
    if (!cellObj || !newAuxId) return;
    if (cellObj.auxiliares.length >= 2) {
      alert("Uma célula pode possuir no máximo 2 auxiliares.");
      return;
    }
    if (cellObj.auxiliares.includes(newAuxId)) return;
    onUpdateCelula(cellId, { auxiliares: [...cellObj.auxiliares, newAuxId] });
  };

  const expandedCell = celulas.find((c) => c.id === selectedCellDetailId);
  const expandedCellMembers = expandedCell
    ? usuarios.filter((u) => u.lider_direto_id === expandedCell.lider_id && u.cargo_atual === Cargo.Integrante)
    : [];

  return (
    <div className="space-y-6" id="sgc_celulas_catalog">
      {/* Header operations Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 border border-slate-100 rounded-xl shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-800">Células Coordenadas</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gerencie novos plantios, integrantes, supervisores e status de saúde celular.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Public invite share button */}
          <button
            onClick={handleCopyPublicLink}
            className="flex items-center gap-2 text-xs font-bold bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 p-2.5 px-4 rounded-xl transition-all shadow-3xs cursor-pointer"
            id="btn_share_public_link"
          >
            {copiedLink ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4 text-slate-500" />}
            <span>{copiedLink ? "Link Copiado!" : "Link Público Cadastro"}</span>
          </button>

          {/* Create Cell trigger button */}
          <button
            onClick={() => {
              setShowAddForm(true);
              setLiderId(availableLeaders.length > 0 ? availableLeaders[0].id : "");
            }}
            className="flex items-center gap-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white p-2.5 px-4 rounded-xl transition-all cursor-pointer shadow-sm shadow-blue-100 border border-blue-700"
            id="btn_abrir_celula_form"
          >
            <PlusCircle className="h-4.5 w-4.5" />
            <span>Abrir Nova Célula</span>
          </button>
        </div>
      </div>

      {/* Embedded form to plant/open a new cell */}
      {showAddForm && (
        <div className="bg-white border border-blue-100 rounded-xl shadow-md p-6 animate-fadeIn" id="cell_planting_form">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
            <div className="flex items-center gap-2">
              <span className="p-1 text-blue-600 bg-blue-50 rounded font-bold text-xs uppercase font-mono">Formulário</span>
              <h3 className="font-bold text-slate-800 text-sm">Plantar & Abrir Nova Célula</h3>
            </div>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded bg-slate-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleCreateCell} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1">Nome da Célula</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Célula Betel"
                  value={nomeCelula}
                  onChange={(e) => setNomeCelula(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2.5 font-semibold outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1">Tipo de Célula</label>
                <select
                  value={tipoCelula}
                  onChange={(e) => {
                    setTipoCelula(e.target.value as any);
                    setErrorMsg("");
                  }}
                  className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2.5 font-semibold outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="Mista">Mista</option>
                  <option value="Jovem">Jovem</option>
                  <option value="Adolescentes">Adolescentes</option>
                  <option value="Kids">Criança (Kids)</option>
                  <option value="Homens">Homem</option>
                  <option value="Mulheres">Mulheres</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1">CEP *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Ex: 25600-000"
                    value={cep}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCep(val);
                      handleCepLookup(val, false);
                    }}
                    className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2.5 font-semibold outline-none focus:border-blue-500"
                  />
                  <span className="absolute right-2 top-2 text-[9px] font-bold text-slate-400 bg-white border px-1.5 py-1 rounded shadow-3xs select-none">Busca Auto</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1">Bairro da Célula *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Quitandinha, Centro, Itaipava..."
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2.5 font-semibold outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1">Endereço Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Rua Imperial, 120"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2.5 font-semibold outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1">Dia de Encontro</label>
                <select
                  value={diaSemana}
                  onChange={(e) => setDiaSemana(e.target.value as Celula["dia_semana"])}
                  className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2.5 font-semibold outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="Segunda">Segunda-feira</option>
                  <option value="Terça">Terça-feira</option>
                  <option value="Quarta">Quarta-feira</option>
                  <option value="Quinta">Quinta-feira</option>
                  <option value="Sexta">Sexta-feira</option>
                  <option value="Sábado">Sábado</option>
                  <option value="Domingo">Domingo</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1">Horário</label>
                <input
                  type="time"
                  required
                  value={horario}
                  onChange={(e) => setHorario(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2.5 font-semibold outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1">Líder Responsável</label>
                <select
                  value={liderId}
                  onChange={(e) => setLiderId(e.target.value)}
                  required
                  className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2.5 font-semibold outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="">Selecione Líder...</option>
                  {availableLeaders.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1">Supervisor de Células</label>
                <select
                  value={supervisorId}
                  onChange={(e) => setSupervisorId(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2.5 font-semibold outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="">Nenhum Supervisor direto</option>
                  {availableSupervisors.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1">Rede Ministerial</label>
                <select
                  value={redeId}
                  onChange={(e) => setRedeId(e.target.value)}
                  required
                  className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2.5 font-semibold outline-none focus:border-blue-500 cursor-pointer"
                >
                  {redes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1">Observações da Célula</label>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Discorra sobre objetivos de plantio, histórico local ou frentes pastorais..."
                rows={2}
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2.5 font-semibold outline-none focus:border-blue-500"
              />
            </div>

            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3.5 rounded-xl flex items-center gap-2 mb-2 animate-shake">
                <ShieldAlert className="h-4.5 w-4.5 text-red-500 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-xl border border-blue-700 transition-all shadow-sm cursor-pointer"
              id="btn_submit_plant_cell"
            >
              Confirmar Plantio de Célula
            </button>
          </form>
        </div>
      )}

      {/* Collateral catalog visual filters */}
      <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Pesquisar por nome ou bairro da célula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg p-2 pl-9 outline-none focus:ring-1 focus:ring-blue-100"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick filter by Red */}
          <div className="flex items-center gap-1 text-[11px] bg-white border border-slate-200 rounded-lg px-2 py-1.5 shadow-3xs">
            <span className="font-bold text-slate-400">Rede:</span>
            <select
              value={selectedRedId}
              onChange={(e) => setSelectedRedId(e.target.value)}
              className="font-bold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="Todos">Todas</option>
              {redes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Quick filter by Bairro */}
          <div className="flex items-center gap-1 text-[11px] bg-white border border-slate-200 rounded-lg px-2 py-1.5 shadow-3xs">
            <span className="font-bold text-slate-400">Região:</span>
            <select
              value={selectedBairro}
              onChange={(e) => setSelectedBairro(e.target.value)}
              className="font-bold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="Todos">Todas Regiões</option>
              {uniqueBairros.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Quick filter by Status */}
          <div className="flex items-center gap-1 text-[11px] bg-white border border-slate-200 rounded-lg px-2 py-1.5 shadow-3xs">
            <span className="font-bold text-slate-400">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="font-bold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="Todos">Todos Status</option>
              <option value={CellStatus.VERDE}>🟢 Saudáveis</option>
              <option value={CellStatus.AMARELO}>🟡 Alerta: Poucas Pessoas</option>
              <option value={CellStatus.AZUL}>🔵 Pronta p/ Multiplicar</option>
              <option value={CellStatus.VERMELHO}>🔴 Alerta: Frequência Baixa</option>
            </select>
          </div>

          {/* Quick filter by Cell Type */}
          <div className="flex items-center gap-1 text-[11px] bg-white border border-slate-200 rounded-lg px-2 py-1.5 shadow-3xs">
            <span className="font-bold text-slate-400">Tipo:</span>
            <select
              value={selectedTipo}
              onChange={(e) => setSelectedTipo(e.target.value)}
              className="font-bold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="Todos">Todos os Tipos</option>
              <option value="Mista">Mista</option>
              <option value="Jovem">Jovem</option>
              <option value="Adolescentes">Adolescentes</option>
              <option value="Kids">Criança (Kids)</option>
              <option value="Homens">Homem</option>
              <option value="Mulheres">Mulheres</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid rendering list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCelulas.map((cell) => {
          const leader = usuarios.find((u) => u.id === cell.lider_id);
          const rede = redes.find((r) => r.id === cell.rede_id);
          const conf = statusConfig[cell.status_celula] || statusConfig[CellStatus.VERDE];

          return (
            <div
              key={cell.id}
              className={`bg-white rounded-xl border-t-[5px] border border-slate-100 hover:border-slate-300 transition-all p-5 shadow-xs flex flex-col justify-between cursor-pointer ${
                cell.status_celula === CellStatus.VERDE ? "border-t-emerald-500" :
                cell.status_celula === CellStatus.AMARELO ? "border-t-amber-500" :
                cell.status_celula === CellStatus.VERMELHO ? "border-t-red-500" :
                "border-t-blue-500"
              }`}
              onClick={() => setSelectedCellDetailId(cell.id)}
            >
              <div>
                <div className="flex flex-wrap items-center gap-1.5 justify-between mb-3.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${conf.bg} ${conf.text} ${conf.border}`}>
                    {conf.label} ({conf.desc})
                  </span>
                  
                  <div className="flex gap-1 items-center">
                    <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      📍 {cell.bairro}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${tipoStyle[cell.tipo_celula || "Mista"]?.bg || "bg-slate-50"} ${tipoStyle[cell.tipo_celula || "Mista"]?.text || "text-slate-600"} ${tipoStyle[cell.tipo_celula || "Mista"]?.border || "border-slate-200"}`}>
                      🏷️ {cell.tipo_celula || "Mista"}
                    </span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-800 hover:text-blue-600 transition-colors">
                  {cell.nome_celula}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 flex items-start gap-1">
                  <MapPin className="h-3 w-3 shrink-0 text-slate-400 mt-0.5" />
                  <span className="truncate">{cell.endereco_completo}</span>
                </p>

                {(() => {
                  const otherCellsAtSameAddress = celulas.filter(
                    (c) => c.id !== cell.id && c.endereco_completo.toLowerCase().trim() === cell.endereco_completo.toLowerCase().trim()
                  );
                  return otherCellsAtSameAddress.length > 0 ? (
                    <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold border border-indigo-100 shadow-3xs">
                      🏠 Hospeda {otherCellsAtSameAddress.length + 1} células nesta residência!
                    </div>
                  ) : null;
                })()}

                <div className="grid grid-cols-2 gap-2 border-t border-slate-50 pt-3 mt-3.5 text-[11px]">
                  <div>
                    <span className="text-slate-400 font-medium block">Líder:</span>
                    <span className="text-slate-700 font-bold truncate block">
                      👤 {leader ? leader.nome.split(" ")[0] + " " + (leader.nome.split(" ")[1] || "") : "N/A"}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-medium block">Horário:</span>
                    <span className="text-slate-700 font-bold block flex items-center gap-0.5 truncate">
                      <Clock className="h-3 w-3 inline text-slate-400" /> {cell.dia_semana}, {cell.horario}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-50 pt-3.5 mt-3.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Users className="h-4 w-4 text-slate-400" />
                  <span className="font-bold text-slate-700 font-mono">{cell.quantidade_integrantes}</span>
                  <span>Integrantes</span>
                </div>

                <span className="text-[10px] text-blue-600 font-bold group hover:underline inline-flex items-center gap-0.5">
                  Expandir Ficha <ArrowUpRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          );
        })}

        {filteredCelulas.length === 0 && (
          <div className="col-span-full bg-white rounded-xl shadow-3xs p-12 text-center text-slate-400 border border-slate-100">
            Nenhuma célula encontrada para os critérios de busca atuais.
          </div>
        )}
      </div>

      {/* Expanded Ficha / Cell Drawer Modal */}
      {selectedCellDetailId && expandedCell && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-3xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative animate-zoomIn">
            {/* Close */}
            <button
              onClick={handleCloseDetail}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            {/* Header info */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusConfig[expandedCell.status_celula].bg} ${statusConfig[expandedCell.status_celula].text}`}>
                {statusConfig[expandedCell.status_celula].label}
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold font-mono">Bairro {expandedCell.bairro}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${tipoStyle[expandedCell.tipo_celula || "Mista"]?.bg || "bg-slate-50"} ${tipoStyle[expandedCell.tipo_celula || "Mista"]?.text || "text-slate-600"} ${tipoStyle[expandedCell.tipo_celula || "Mista"]?.border || "border-slate-200"}`}>
                🏷️ Tipo: {expandedCell.tipo_celula || "Mista"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-800">{expandedCell.nome_celula}</h3>
              <div className="flex items-center gap-3">
                {!isEditingCell && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleStartEditCell(expandedCell)}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="h-3.5 w-3.5" /> Editar Informações
                    </button>
                    {canDeleteCell(expandedCell) && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Tem certeza de que deseja excluir a célula "${expandedCell.nome_celula}"? Todos os relatórios desta célula também serão apagados.`)) {
                            onDeleteCelula(expandedCell.id);
                            handleCloseDetail();
                          }
                        }}
                        className="text-[11px] font-bold text-red-600 hover:text-red-850 flex items-center gap-0.5 cursor-pointer transition-colors"
                        title="Excluir Célula"
                      >
                        <Trash className="h-3.5 w-3.5 text-red-500" /> Excluir Célula
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {isEditingCell ? (
              <form onSubmit={handleSaveCellEdit} className="space-y-4 border-t border-slate-100 pt-4 mt-4 text-xs font-sans">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1">Nome da Célula *</label>
                    <input
                      type="text"
                      required
                      value={editNomeCelula}
                      onChange={(e) => setEditNomeCelula(e.target.value)}
                      className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2 font-semibold outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1">Tipo de Célula *</label>
                    <select
                      value={editTipoCelula}
                      onChange={(e) => setEditTipoCelula(e.target.value as any)}
                      className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2 font-semibold outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="Mista">Mista</option>
                      <option value="Jovem">Jovem</option>
                      <option value="Adolescentes">Adolescentes</option>
                      <option value="Kids">Criança (Kids)</option>
                      <option value="Homens">Homem</option>
                      <option value="Mulheres">Mulheres</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1">CEP *</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={editCep}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditCep(val);
                          handleCepLookup(val, true);
                        }}
                        className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2 font-semibold outline-none focus:border-blue-500"
                      />
                      <span className="absolute right-2 top-2 text-[8px] font-bold text-slate-400 bg-white border px-1 rounded shadow-3xs select-none">Busca Auto</span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1">Bairro *</label>
                    <input
                      type="text"
                      required
                      value={editBairro}
                      onChange={(e) => setEditBairro(e.target.value)}
                      className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2 font-semibold outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1">Endereço Completo</label>
                    <input
                      type="text"
                      value={editEndereco}
                      onChange={(e) => setEditEndereco(e.target.value)}
                      className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2 font-semibold outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1">Dia da Semana</label>
                    <select
                      value={editDiaSemana}
                      onChange={(e) => setEditDiaSemana(e.target.value as any)}
                      className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2 font-semibold outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="Segunda">Segunda-feira</option>
                      <option value="Terça">Terça-feira</option>
                      <option value="Quarta">Quarta-feira</option>
                      <option value="Quinta">Quinta-feira</option>
                      <option value="Sexta">Sexta-feira</option>
                      <option value="Sábado">Sábado</option>
                      <option value="Domingo">Domingo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1">Horário</label>
                    <input
                      type="time"
                      value={editHorario}
                      onChange={(e) => setEditHorario(e.target.value)}
                      className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2 font-semibold outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1">Líder Oficial</label>
                    <select
                      value={editLiderId}
                      onChange={(e) => setEditLiderId(e.target.value)}
                      className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2 font-semibold outline-none focus:border-blue-500 cursor-pointer"
                    >
                      {usuarios.filter(u => u.cargo_atual === Cargo.LiderCelula || u.cargo_atual === Cargo.AuxiliarCelula || u.cargo_atual === Cargo.LiderSupervisor || u.cargo_atual === Cargo.SupervisorSetor || u.cargo_atual === Cargo.Integrante).map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.nome} ({u.cargo_atual})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1">Rede Ministerial (Cor)</label>
                    <select
                      value={editRedeId}
                      onChange={(e) => setEditRedeId(e.target.value)}
                      className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2 font-semibold outline-none focus:border-blue-500 cursor-pointer"
                    >
                      {redes.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1">Supervisor de Célula</label>
                    <select
                      value={editSupervisorId}
                      onChange={(e) => setEditSupervisorId(e.target.value)}
                      className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2 font-semibold outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="">Nenhum Supervisor direto</option>
                      {usuarios.filter((u) => u.cargo_atual === Cargo.LiderSupervisor || u.cargo_atual === Cargo.SupervisorSetor || u.cargo_atual === Cargo.LiderRede).map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1">Status de Saúde</label>
                    <select
                      value={editStatusCelula}
                      onChange={(e) => setEditStatusCelula(e.target.value as any)}
                      className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2 font-semibold outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value={CellStatus.VERDE}>🟢 Saudável (Verde)</option>
                      <option value={CellStatus.AMARELO}>🟡 Sob Alerta: Poucas Pessoas (Amarelo)</option>
                      <option value={CellStatus.AZUL}>🔵 Pronta p/ Multiplicar (Azul)</option>
                      <option value={CellStatus.VERMELHO}>🔴 Alerta: Frequência Baixa (Vermelho)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1">Quant. Integrantes</label>
                    <input
                      type="number"
                      required
                      value={editQuantidadeIntegrantes}
                      onChange={(e) => setEditQuantidadeIntegrantes(parseInt(e.target.value) || 0)}
                      className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2 font-semibold outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1">Observações da Célula</label>
                  <textarea
                    value={editObservacoes}
                    onChange={(e) => setEditObservacoes(e.target.value)}
                    rows={1}
                    className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2 font-semibold outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-1.5">
                  <button
                    type="button"
                    onClick={() => setIsEditingCell(false)}
                    className="bg-slate-150 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-1.5 rounded-lg transition cursor-pointer"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </form>
            ) : (
              <>
                <p className="text-xs text-slate-400 mt-1 flex items-center justify-between">
                  <span>📌 {expandedCell.endereco_completo} (CEP: {expandedCell.cep || "N/A"})</span>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4 mt-4 text-xs text-slate-600">
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Líder Oficial:</span>
                      <span className="font-bold text-slate-800">
                        {usuarios.find((u) => u.id === expandedCell.lider_id)?.nome || "Não atribuído"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Rede:</span>
                      <span className="font-bold text-slate-800" style={{ color: redes.find((r) => r.id === expandedCell.rede_id)?.cor }}>
                        {redes.find((r) => r.id === expandedCell.rede_id)?.nome || "Geral"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Reuniões:</span>
                      <span className="font-bold text-slate-800">{expandedCell.dia_semana} às {expandedCell.horario}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Abertura:</span>
                      <span className="font-mono">{expandedCell.data_abertura}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Integrantes:</span>
                      <span className="font-bold text-slate-800 font-mono bg-slate-100 px-1.5 py-0.5 rounded">{expandedCell.quantidade_integrantes}</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Auxiliar management (up to 2 auxiliars) */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mt-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/50 pb-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1">
                  ⭐ Auxiliares de Célula (Máximo 2)
                </h4>
              </div>

              {/* Render existing checkouts */}
              <div className="space-y-2">
                {expandedCell.auxiliares.map((auxId) => {
                  const auxUser = usuarios.find((u) => u.id === auxId);
                  if (!auxUser) return null;
                  return (
                    <div key={auxId} className="bg-white border rounded-lg p-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {auxUser.foto ? (
                          <img src={auxUser.foto} alt="" className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                            AX
                          </div>
                        )}
                        <span className="text-xs font-bold text-slate-700">{auxUser.nome}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveAuxiliar(expandedCell.id, auxId)}
                        className="p-1 hover:bg-red-50 text-red-500 hover:text-red-700 rounded transition-colors"
                        title="Remover"
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}

                {expandedCell.auxiliares.length === 0 && (
                  <div className="text-[11px] text-slate-400 italic">Nenhum auxiliar associado a esta célula.</div>
                )}
              </div>

              {/* Add Auxiliar trigger dropdown if length < 2 */}
              {expandedCell.auxiliares.length < 2 && (
                <div className="pt-1.5 flex gap-2">
                  <select
                    id="add_aux_select"
                    className="flex-1 bg-white border border-slate-200 rounded-lg p-1.5 text-xs outline-none"
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddAuxiliar(expandedCell.id, e.target.value);
                        e.target.value = "";
                      }
                    }}
                  >
                    <option value="">+ Associar Auxiliar...</option>
                    {availableAuxiliares
                      .filter((u) => !expandedCell.auxiliares.includes(u.id))
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.nome}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>

            {/* List of cell members */}
            <div className="border-t border-slate-100 pt-5 mt-5">
              <div className="flex items-center justify-between mb-3.5">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  👥 Integrantes Integrados ({expandedCellMembers.length})
                </h4>
                <button
                  onClick={() => setShowAddMemberField(!showAddMemberField)}
                  className="text-xs text-blue-600 hover:bg-blue-50 font-bold p-1 px-2.5 rounded-lg border border-blue-100 transition-colors"
                >
                  {showAddMemberField ? "Cancelar" : "+ Adicionar Integrante"}
                </button>
              </div>

              {showAddMemberField && (
                <div className="bg-slate-50 border p-3.5 rounded-xl space-y-3 mb-4 animate-fadeIn">
                  <h5 className="font-bold text-slate-800 text-[11px] uppercase tracking-wide">Novos Integrantes</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <input
                      type="text"
                      placeholder="Nome Completo *"
                      required
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      className="bg-white border rounded-lg p-2 outline-none w-full"
                    />
                    <input
                      type="text"
                      placeholder="WhatsApp (com DDD)"
                      value={newMemberPhone}
                      onChange={(e) => setNewMemberPhone(e.target.value)}
                      className="bg-white border rounded-lg p-2 outline-none w-full"
                    />
                    <input
                      type="email"
                      placeholder="E-mail"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                      className="bg-white border rounded-lg p-2 outline-none w-full sm:col-span-2"
                    />
                    {expandedCell.tipo_celula === "Kids" && (
                      <input
                        type="text"
                        placeholder="Telefone do Responsável *"
                        required
                        value={newMemberParentPhone}
                        onChange={(e) => setNewMemberParentPhone(e.target.value)}
                        className="bg-white border border-pink-200 focus:border-pink-400 rounded-lg p-2 outline-none w-full sm:col-span-2 font-semibold"
                      />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddMemberToCell(expandedCell.id)}
                    className="w-full bg-slate-800 text-white font-bold p-2 text-xs rounded-lg transition-colors"
                  >
                    Salvar Integrante
                  </button>
                </div>
              )}

              {/* Members check table */}
              <div className="overflow-hidden border border-slate-100 rounded-xl max-h-[220px] overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase font-bold border-b border-slate-100">
                    <tr>
                      <th className="p-2.5">Nome</th>
                      <th className="p-2.5">WhatsApp / Telefone</th>
                      {expandedCell.tipo_celula === "Kids" ? (
                        <th className="p-2.5 text-pink-700 font-bold">Responsável (Tel)</th>
                      ) : (
                        <th className="p-2.5">Estado Civil</th>
                      )}
                      <th className="p-2.5 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {expandedCellMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-slate-50/50">
                        <td className="p-2.5 font-bold text-slate-700 flex items-center gap-1.5">
                          {member.nome}
                        </td>
                        <td className="p-2.5 font-mono text-slate-500">{member.telefone || "N/A"}</td>
                        {expandedCell.tipo_celula === "Kids" ? (
                          <td className="p-2.5 font-bold text-pink-600 font-mono">
                            📞 {member.telefone_responsavel || "Não cadastrado"}
                          </td>
                        ) : (
                          <td className="p-2.5 text-slate-500">{member.estado_civil}</td>
                        )}
                        <td className="p-2.5 text-right font-sans">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleStartEditMember(member)}
                              className="p-1 rounded hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                              title="Editar Integrante"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            {canDeleteUser(member) && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Tem certeza de que deseja excluir o integrante "${member.nome}"?`)) {
                                    onDeleteUsuario(member.id);
                                    onUpdateCelula(expandedCell.id, {
                                      quantidade_integrantes: Math.max(0, expandedCell.quantidade_integrantes - 1)
                                    });
                                  }
                                }}
                                className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                                title="Excluir Integrante"
                              >
                                <Trash className="h-3.5 w-3.5 text-red-500" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}

                    {expandedCellMembers.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-slate-400 italic">
                          Nenhum integrante cadastrado nesta célula ainda.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editingMember && expandedCell && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-3xs z-55 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl max-w-md w-full p-6 relative animate-zoomIn text-xs font-sans">
            <button
              onClick={() => setEditingMember(null)}
              className="absolute top-4 right-4 p-1 rounded-full bg-slate-150 hover:bg-slate-200 text-slate-500 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="font-extrabold text-slate-800 text-sm mb-4">👤 Editar Ficha de Integrante</h3>

            <form onSubmit={handleSaveMemberEdit} className="space-y-4 font-sans text-xs">
              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={editMemberName}
                  onChange={(e) => setEditMemberName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-semibold outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1">WhatsApp / Telefone</label>
                <input
                  type="text"
                  value={editMemberPhone}
                  onChange={(e) => setEditMemberPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-semibold outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1">E-mail</label>
                <input
                  type="email"
                  value={editMemberEmail}
                  onChange={(e) => setEditMemberEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-semibold outline-none focus:border-blue-500"
                />
              </div>

              {expandedCell.tipo_celula === "Kids" ? (
                <div>
                  <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1">Telefone do Responsável *</label>
                  <input
                    type="text"
                    required
                    value={editMemberParentPhone}
                    onChange={(e) => setEditMemberParentPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-semibold outline-none focus:border-pink-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-slate-600 uppercase tracking-wider mb-1">Estado Civil</label>
                  <select
                    value={editMemberEstadoCivil}
                    onChange={(e) => setEditMemberEstadoCivil(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-semibold outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Solteiro(a)">Solteiro(a)</option>
                    <option value="Casado(a)">Casado(a)</option>
                    <option value="Divorciado(a)">Divorciado(a)</option>
                    <option value="Viúvo(a)">Viúvo(a)</option>
                  </select>
                </div>
              )}

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl border border-blue-700 transition cursor-pointer"
                >
                  Salvar Integrante
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
