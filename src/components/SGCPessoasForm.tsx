/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Usuario, Cargo, Rede, PromocaoElegivel } from "../types";
import { UserPlus, Search, User, Filter, Trash, Sparkles, Check, Phone, Mail, Award, Calendar, ShieldCheck, HelpCircle, Edit3, X, Share2 } from "lucide-react";

interface SGCPessoasFormProps {
  usuarios: Usuario[];
  redes: Rede[];
  currentUser: Usuario;
  promocoesElegiveis: PromocaoElegivel[];
  onAddUsuario: (newUser: Partial<Usuario>) => void;
  onUpdateUsuario: (userId: string, updated: Partial<Usuario>) => void;
  onPromoteUser: (promocao: PromocaoElegivel) => void;
  onDeleteUsuario: (userId: string) => void;
}

export default function SGCPessoasForm({
  usuarios,
  redes,
  currentUser,
  promocoesElegiveis,
  onAddUsuario,
  onUpdateUsuario,
  onPromoteUser,
  onDeleteUsuario,
}: SGCPessoasFormProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCargo, setSelectedCargo] = useState<string>("Todos");
  const [selectedRed, setSelectedRed] = useState<string>("Todos");

  // Form triggers
  const [showAddForm, setShowAddForm] = useState(false);

  // Form input states
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [endereco, setEndereco] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [sexo, setSexo] = useState<"M" | "F">("M");
  const [estadoCivil, setEstadoCivil] = useState<Usuario["estado_civil"]>("Solteiro(a)");
  const [dataConversao, setDataConversao] = useState("");
  const [dataBatismo, setDataBatismo] = useState("");
  const [cargo, setCargo] = useState<Cargo>(Cargo.Integrante);
  const [redeId, setRedeId] = useState("");
  const [liderDiretoId, setLiderDiretoId] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [fotoBase64, setFotoBase64] = useState("");

  // Edit form states
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editTelefone, setEditTelefone] = useState("");
  const [editWhatsapp, setEditWhatsapp] = useState("");
  const [editEndereco, setEditEndereco] = useState("");
  const [editDataNascimento, setEditDataNascimento] = useState("");
  const [editSexo, setEditSexo] = useState<"M" | "F">("M");
  const [editEstadoCivil, setEditEstadoCivil] = useState<Usuario["estado_civil"]>("Solteiro(a)");
  const [editDataConversao, setEditDataConversao] = useState("");
  const [editDataBatismo, setEditDataBatismo] = useState("");
  const [editCargo, setEditCargo] = useState<Cargo>(Cargo.Integrante);
  const [editRedeId, setEditRedeId] = useState("");
  const [editLiderDiretoId, setEditLiderDiretoId] = useState("");
  const [editObservacoes, setEditObservacoes] = useState("");
  const [editFotoBase64, setEditFotoBase64] = useState("");

  const handleStartEdit = (user: Usuario) => {
    setEditingUser(user);
    setEditNome(user.nome);
    setEditEmail(user.email);
    setEditTelefone(user.telefone || "");
    setEditWhatsapp(user.whatsapp || "");
    setEditEndereco(user.endereco || "");
    setEditDataNascimento(user.data_nascimento || "");
    setEditSexo(user.sexo || "M");
    setEditEstadoCivil(user.estado_civil || "Solteiro(a)");
    setEditDataConversao(user.data_conversao || "");
    setEditDataBatismo(user.data_batismo || "");
    setEditCargo(user.cargo_atual);
    setEditRedeId(user.rede_id || "");
    setEditLiderDiretoId(user.lider_direto_id || "");
    setEditObservacoes(user.observacoes || "");
    setEditFotoBase64(user.foto || "");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    onUpdateUsuario(editingUser.id, {
      nome: editNome,
      email: editEmail,
      telefone: editTelefone,
      whatsapp: editWhatsapp || editTelefone.replace(/\D/g, ""),
      endereco: editEndereco,
      data_nascimento: editDataNascimento,
      sexo: editSexo,
      estado_civil: editEstadoCivil,
      data_conversao: editDataConversao || undefined,
      data_batismo: editDataBatismo || undefined,
      cargo_atual: editCargo,
      rede_id: editRedeId ? editRedeId : null,
      lider_direto_id: editLiderDiretoId ? editLiderDiretoId : null,
      observacoes: editObservacoes,
      foto: editFotoBase64,
    });
    setEditingUser(null);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !email) return;

    onAddUsuario({
      nome,
      email,
      telefone,
      whatsapp: whatsapp || telefone.replace(/\D/g, ""),
      endereco,
      data_nascimento: dataNascimento,
      sexo,
      estado_civil: estadoCivil,
      data_conversao: dataConversao || undefined,
      data_batismo: dataBatismo || undefined,
      cargo_atual: cargo,
      rede_id: redeId ? redeId : null,
      lider_direto_id: liderDiretoId ? liderDiretoId : null,
      observacoes,
      foto: fotoBase64,
    });

    // Reset Form
    setShowAddForm(false);
    setNome("");
    setEmail("");
    setTelefone("");
    setWhatsapp("");
    setEndereco("");
    setObservacoes("");
    setFotoBase64("");
  };

  // Filter users by current church constraint and queries
  const visibleUsuarios = usuarios.filter((u) => {
    // 1. Church separation check (RLS)
    if (currentUser.igreja_id && u.igreja_id !== currentUser.igreja_id) {
      return false; // Cannot view other churches
    }
    
    // 2. Hierarchy view limits
    if (currentUser.cargo_atual === Cargo.PastorPresidente || currentUser.cargo_atual === Cargo.MasterAdmin) {
      return true; // Vê tudo da igreja
    }
    if (currentUser.cargo_atual === Cargo.LiderRede) {
      return u.rede_id === currentUser.rede_id || u.cargo_atual === Cargo.Integrante;
    }
    
    // Supervisors / Leader cells see themselves and their subordinates
    return u.lider_direto_id === currentUser.id || u.id === currentUser.id;
  });

  const filteredUsuarios = visibleUsuarios.filter((u) => {
    const matchesSearch = u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCargo = selectedCargo === "Todos" || u.cargo_atual === selectedCargo;
    const matchesRed = selectedRed === "Todos" || u.rede_id === selectedRed;

    return matchesSearch && matchesCargo && matchesRed;
  });

  // Get potential direct leaders for selection
  const potentialLideres = usuarios.filter(
    (u) =>
      u.id !== currentUser.id &&
      u.cargo_atual !== Cargo.Integrante &&
      (!currentUser.igreja_id || u.igreja_id === currentUser.igreja_id)
  );

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

    // Supervisor (Rank 5, 6) can delete lower rank (Lider Celula, Auxiliares, Integrantes) in cells/subordinates
    if (currentUser.cargo_atual === Cargo.SupervisorSetor || currentUser.cargo_atual === Cargo.LiderSupervisor) {
      return userToDelete.lider_direto_id === currentUser.id || userToDelete.rede_id === currentUser.rede_id;
    }

    // Lider Celula (Rank 4) can only delete Integrantes or Auxiliares belonging to their cell or direct subordinates
    if (currentUser.cargo_atual === Cargo.LiderCelula) {
      return userToDelete.lider_direto_id === currentUser.id;
    }

    return false;
  };

  return (
    <div className="space-y-6" id="sgc_pessoas_register">
      {/* Top Banner & Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 border border-slate-100 rounded-xl shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-800">Fichas de Membresia & Liderança</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cadastre novos integrantes, organize a hierarquia e aprove promoções ministeriais.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white p-2.5 px-4 rounded-xl transition-all cursor-pointer shadow-sm border border-blue-700 font-sans"
          id="btn_cadastrar_membro_form"
        >
          <UserPlus className="h-4.5 w-4.5" />
          <span>Cadastrar Nova Pessoa</span>
        </button>
      </div>

      {/* Promotions notifications list (Rule 15) */}
      {promocoesElegiveis.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-3.5 animate-fadeIn" id="promotion_notification_center">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-500 text-white rounded-lg">
              <Sparkles className="h-4.5 w-4.5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs font-extrabold text-amber-900 uppercase tracking-wide">
                🏆 Alertas de Promoção de Cargo Automáticos
              </h3>
              <p className="text-[11px] text-amber-700">
                Os seguintes líderes atingiram todas as metas ministeriais estimadas para subir de nível na rede.
              </p>
            </div>
          </div>

          <div className="divide-y divide-amber-100">
            {promocoesElegiveis.map((promo, idx) => {
              const promotedUser = usuarios.find((u) => u.id === promo.usuario_id);
              if (!promotedUser) return null;

              return (
                <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    {promotedUser.foto ? (
                      <img
                        src={promotedUser.foto}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-200"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-800 text-xs">
                        {promotedUser.nome.substring(0, 2)}
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">
                        {promotedUser.nome} •{" "}
                        <span className="text-amber-700">{promo.cargo_atual}</span> ➔{" "}
                        <span className="text-emerald-700 font-black">{promo.cargo_proposto}</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                        {promo.motivo}
                      </p>
                      
                      {/* Metas percentage block indicator */}
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="w-32 bg-amber-200/50 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-emerald-500 h-full" style={{ width: `${promo.requisitoProgress}%` }}></div>
                        </div>
                        <span className="text-[9px] font-bold text-emerald-700 font-mono">Meta Atingida!</span>
                      </div>
                    </div>
                  </div>

                  {/* Approve action trigger buttons */}
                  <button
                    onClick={() => onPromoteUser(promo)}
                    className="p-1.5 px-4 rounded-xl text-[10px] font-bold bg-amber-500 hover:bg-emerald-600 border border-amber-600 hover:border-emerald-700 text-white shadow-3xs hover:shadow-sm transition-all shrink-0 flex items-center gap-1 cursor-pointer"
                    id={`btn_approve_promo_${promo.usuario_id}`}
                  >
                    <Check className="h-3.5 w-3.5 stroke-[3px]" />
                    <span>Aprovar Promoção</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Insert custom creation form */}
      {showAddForm && (
        <div className="bg-white border border-slate-100 rounded-xl shadow-md p-6 animate-fadeIn" id="add_member_form_panel">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
            <h3 className="font-bold text-slate-800 text-sm">🆕 Ficha Cadastral da Pessoa</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleCreateUser} className="space-y-4 text-xs font-sans">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wide mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Pedro Henrique"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2.5 font-semibold outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wide mb-1">E-mail *</label>
                <input
                  type="email"
                  required
                  placeholder="Ex: pedro@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2.5 font-semibold outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wide mb-1">Telefone de Contato</label>
                <input
                  type="text"
                  placeholder="Ex: (24) 99244-1234"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2.5 font-semibold outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wide mb-1">WhatsApp (Envio Automático)</label>
                <input
                  type="text"
                  placeholder="Ex: (24) 99122-3344"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2.5 font-semibold outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wide mb-1">Data de Nascimento</label>
                <input
                  type="date"
                  required
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2.5 font-semibold outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wide mb-1">Estado Civil</label>
                <select
                  value={estadoCivil}
                  onChange={(e) => setEstadoCivil(e.target.value as Usuario["estado_civil"])}
                  className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2.5 font-semibold outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="Solteiro(a)">Solteiro(a)</option>
                  <option value="Casado(a)">Casado(a)</option>
                  <option value="Divorciado(a)">Divorciado(a)</option>
                  <option value="Viúvo(a)">Viúvo(a)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wide mb-1">Sexo</label>
                <div className="flex gap-4 pt-2">
                  <label className="flex items-center gap-1.5 font-bold text-slate-600 cursor-pointer">
                    <input
                      type="radio"
                      name="sexo"
                      checked={sexo === "M"}
                      onChange={() => setSexo("M")}
                      className="accent-blue-600"
                    />{" "}
                    Masculino
                  </label>
                  <label className="flex items-center gap-1.5 font-bold text-slate-600 cursor-pointer">
                    <input
                      type="radio"
                      name="sexo"
                      checked={sexo === "F"}
                      onChange={() => setSexo("F")}
                      className="accent-blue-600"
                    />{" "}
                    Feminino
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wide mb-1">Endereço Residencial</label>
                <input
                  type="text"
                  placeholder="Ex: Av. Getulio Vargas"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2.5 font-semibold outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wide mb-1">Cargo Atual</label>
                <select
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value as Cargo)}
                  className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2.5 font-semibold outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value={Cargo.Integrante}>Integrante (Membro)</option>
                  <option value={Cargo.AuxiliarCelula}>Auxiliar de Célula</option>
                  <option value={Cargo.LiderCelula}>Líder de Célula</option>
                  <option value={Cargo.LiderSupervisor}>Líder Supervisor</option>
                  <option value={Cargo.SupervisorSetor}>Supervisor de Setor</option>
                  <option value={Cargo.LiderArea}>Líder de Área</option>
                  <option value={Cargo.LiderRede}>Líder de Rede</option>
                  <option value={Cargo.PastorPresidente}>Pastor Presidente</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wide mb-1">Data de Conversão</label>
                <input
                  type="date"
                  value={dataConversao}
                  onChange={(e) => setDataConversao(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2.5 font-semibold outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wide mb-1">Data de Batismo</label>
                <input
                  type="date"
                  value={dataBatismo}
                  onChange={(e) => setDataBatismo(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2.5 font-semibold outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wide mb-1">Rede associada</label>
                <select
                  value={redeId}
                  onChange={(e) => setRedeId(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2.5 font-semibold outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="">Nenhuma / Sem Rede</option>
                  {redes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wide mb-1">Líder Cobertura Direto</label>
                <select
                  value={liderDiretoId}
                  onChange={(e) => setLiderDiretoId(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2.5 font-semibold outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="">Nenhum / Pastor Presidente</option>
                  {potentialLideres.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome} ({p.cargo_atual})
                    </option>
                  ))}
                </select>
              </div>

              {/* Upload widget */}
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-600 uppercase tracking-wide mb-1">Foto de Perfil</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="flex-1 bg-slate-50 border p-2 rounded-lg text-xs"
                    id="profile_photo_field"
                  />
                  {fotoBase64 ? (
                    <img src={fotoBase64} alt="" className="w-10 h-10 rounded-full object-cover border" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-100 border" />
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-600 uppercase tracking-wide mb-1">Observações Espirituais/Cadastrais</label>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Ex: possui coração ensinável, participa ativamente de retiros, etc..."
                rows={2}
                className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2.5 font-semibold outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-xl border border-blue-700 transition"
              id="btn_submit_create_user"
            >
              Salvar Registro Cadastral
            </button>
          </form>
        </div>
      )}

      {/* Visual filter strip */}
      <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Pesquisar registros por nome ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg p-2 pl-9 outline-none focus:ring-1 focus:ring-blue-100"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Cargo filter */}
          <div className="flex items-center gap-1 text-[11px] bg-white border border-slate-200 rounded-lg px-2 py-1.5 shadow-3xs">
            <span className="font-bold text-slate-400">Cargo:</span>
            <select
              value={selectedCargo}
              onChange={(e) => setSelectedCargo(e.target.value)}
              className="font-bold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="Todos">Todos Cargos</option>
              {Object.values(Cargo).map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
          </div>

          {/* Red filter */}
          <div className="flex items-center gap-1 text-[11px] bg-white border border-slate-200 rounded-lg px-2 py-1.5 shadow-3xs">
            <span className="font-bold text-slate-400">Rede:</span>
            <select
              value={selectedRed}
              onChange={(e) => setSelectedRed(e.target.value)}
              className="font-bold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="Todos font-bold">Todas</option>
              {redes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nome}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tables format listing */}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase tracking-wider font-extrabold border-b border-slate-100">
              <tr>
                <th className="p-4">Cargo / Nome</th>
                <th className="p-4">Contatos</th>
                <th className="p-4">Líder Cobertura</th>
                <th className="p-4">Rede</th>
                <th className="p-4">Conversão/Batismo</th>
                <th className="p-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsuarios.map((user) => {
                const liderUser = usuarios.find((u) => u.id === user.lider_direto_id);
                const userRede = redes.find((r) => r.id === user.rede_id);
                const userPromo = promocoesElegiveis.find((p) => p.usuario_id === user.id);

                return (
                  <tr key={user.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      {user.foto ? (
                        <img
                          src={user.foto}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover shrink-0 border"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-500 shrink-0 text-xs">
                          {user.nome.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-extrabold text-slate-800 text-xs block">{user.nome}</span>
                          {userPromo && (
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse block" title="Elegível para Promoção"></span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded inline-block mt-0.5 font-medium">
                          {user.cargo_atual}
                        </span>
                      </div>
                    </td>

                    <td className="p-4 space-y-1">
                      <div className="flex items-center gap-1 font-semibold text-slate-700">
                        <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{user.telefone}</span>
                      </div>
                      <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
                        <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{user.email}</span>
                      </div>
                    </td>

                    <td className="p-4 font-bold text-slate-700">
                      {liderUser ? (
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                          <span>{liderUser.nome}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Dono / Auto Presidente</span>
                      )}
                    </td>

                    <td className="p-4">
                      {userRede ? (
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: userRede.cor }}
                        >
                          {userRede.nome}
                        </span>
                      ) : (
                        <span className="text-slate-400 select-none text-[10px] italic">Geral</span>
                      )}
                    </td>

                    <td className="p-4 space-y-1 text-slate-500 text-[11px]">
                      <div>❤️ Conv: {user.data_conversao ? <span className="font-mono">{user.data_conversao}</span> : <span className="text-slate-300">N/A</span>}</div>
                      <div>💧 Bat: {user.data_batismo ? <span className="font-mono">{user.data_batismo}</span> : <span className="text-slate-300">N/A</span>}</div>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleStartEdit(user)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                          title="Editar Cadastro"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        {/* Invite / Activation share link for registered subordinates */}
                        {(!user.senha || user.senha === "") && (
                          <button
                            type="button"
                            onClick={() => {
                              const signupLink = window.location.origin + window.location.pathname + "?invite=" + user.id;
                              navigator.clipboard.writeText(signupLink);
                              alert(`Link de Ativação copiado para a Área de Transferência:\n\n${signupLink}\n\nEnvie este link para ${user.nome} configurar sua nova senha e ativar a conta.`);
                            }}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                            title="Copiar Link de Ativação do Liderado"
                          >
                            <Share2 className="h-4 w-4 text-indigo-505 shrink-0" />
                          </button>
                        )}
                        {/* Send message on WhatsApp linking automatically! */}
                        {user.whatsapp && (
                          <a
                            href={`https://wa.me/${user.whatsapp.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg border hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors"
                            id={`wa_btn_row_${user.id}`}
                            title="Conversar no WhatsApp"
                          >
                            <Phone className="h-4 w-4" />
                          </a>
                        )}
                        {canDeleteUser(user) && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Tem certeza de que deseja excluir o cadastro de "${user.nome}" (${user.cargo_atual})? Esta ação é definitiva e removerá este usuário de todas as células e lideranças associadas.`)) {
                                onDeleteUsuario(user.id);
                              }
                            }}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                            title="Excluir Cadastro"
                          >
                            <Trash className="h-4 w-4 text-red-500" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredUsuarios.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400 italic">
                    Nenhum registro de membresia atende aos critérios da busca.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal Overlay */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-3xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-150 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative animate-zoomIn text-xs font-sans">
            <button
              onClick={() => setEditingUser(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="font-extrabold text-slate-800 text-sm mb-4">📝 Editar Ficha Cadastral ({editingUser.nome})</h3>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-600 uppercase tracking-wide mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={editNome}
                    onChange={(e) => setEditNome(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2.5 font-semibold outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                   <label className="block font-bold text-slate-600 uppercase tracking-wide mb-1">E-mail *</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2.5 font-semibold outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 uppercase tracking-wide mb-1">Telefone de Contato</label>
                  <input
                    type="text"
                    value={editTelefone}
                    onChange={(e) => setEditTelefone(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2.5 font-semibold outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 uppercase tracking-wide mb-1">WhatsApp</label>
                  <input
                    type="text"
                    value={editWhatsapp}
                    onChange={(e) => setEditWhatsapp(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2.5 font-semibold outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 uppercase tracking-wide mb-1">Data de Nascimento</label>
                  <input
                    type="date"
                    required
                    value={editDataNascimento}
                    onChange={(e) => setEditDataNascimento(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2.5 font-semibold outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 uppercase tracking-wide mb-1">Estado Civil</label>
                  <select
                    value={editEstadoCivil}
                    onChange={(e) => setEditEstadoCivil(e.target.value as any)}
                    className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2.5 font-semibold outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Solteiro(a)">Solteiro(a)</option>
                    <option value="Casado(a)">Casado(a)</option>
                    <option value="Divorciado(a)">Divorciado(a)</option>
                    <option value="Viúvo(a)">Viúvo(a)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 uppercase tracking-wide mb-1">Sexo</label>
                  <div className="flex gap-4 pt-2">
                    <label className="flex items-center gap-1.5 font-bold text-slate-600 cursor-pointer">
                      <input
                        type="radio"
                        name="edit_sexo"
                        checked={editSexo === "M"}
                        onChange={() => setEditSexo("M")}
                        className="accent-blue-600"
                      />{" "}
                      Masculino
                    </label>
                    <label className="flex items-center gap-1.5 font-bold text-slate-600 cursor-pointer">
                      <input
                        type="radio"
                        name="edit_sexo"
                        checked={editSexo === "F"}
                        onChange={() => setEditSexo("F")}
                        className="accent-blue-600"
                      />{" "}
                      Feminino
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 uppercase tracking-wide mb-1">Endereço Residencial</label>
                  <input
                    type="text"
                    value={editEndereco}
                    onChange={(e) => setEditEndereco(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2.5 font-semibold outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 uppercase tracking-wide mb-1">Cargo Atual</label>
                  <select
                    value={editCargo}
                    onChange={(e) => setEditCargo(e.target.value as Cargo)}
                    className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2.5 font-semibold outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value={Cargo.Integrante}>Integrante (Membro)</option>
                    <option value={Cargo.AuxiliarCelula}>Auxiliar de Célula</option>
                    <option value={Cargo.LiderCelula}>Líder de Célula</option>
                    <option value={Cargo.LiderSupervisor}>Líder Supervisor</option>
                    <option value={Cargo.SupervisorSetor}>Supervisor de Setor</option>
                    <option value={Cargo.LiderArea}>Líder de Área</option>
                    <option value={Cargo.LiderRede}>Líder de Rede</option>
                    <option value={Cargo.PastorPresidente}>Pastor Presidente</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 uppercase tracking-wide mb-1">Data de Conversão</label>
                  <input
                    type="date"
                    value={editDataConversao}
                    onChange={(e) => setEditDataConversao(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2.5 font-semibold outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 uppercase tracking-wide mb-1">Data de Batismo</label>
                  <input
                    type="date"
                    value={editDataBatismo}
                    onChange={(e) => setEditDataBatismo(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2.5 font-semibold outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 uppercase tracking-wide mb-1">Rede associada</label>
                  <select
                    value={editRedeId}
                    onChange={(e) => setEditRedeId(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2.5 font-semibold outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">Nenhuma / Sem Rede</option>
                    {redes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 uppercase tracking-wide mb-1">Líder Cobertura Direto</label>
                  <select
                    value={editLiderDiretoId}
                    onChange={(e) => setEditLiderDiretoId(e.target.value)}
                    className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2.5 font-semibold outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">Nenhum / Pastor Presidente</option>
                    {potentialLideres.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nome} ({p.cargo_atual})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-600 uppercase tracking-wide mb-1">Foto de Perfil</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setEditFotoBase64(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="flex-1 bg-slate-50 border p-2 rounded-lg text-xs"
                    />
                    {editFotoBase64 ? (
                      <img src={editFotoBase64} alt="" className="w-10 h-10 rounded-full object-cover border" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-100 border" />
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-wide mb-1">Observações Espirituais/Cadastrais</label>
                <textarea
                  value={editObservacoes}
                  onChange={(e) => setEditObservacoes(e.target.value)}
                  placeholder="Observações..."
                  rows={2}
                  className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-2.5 font-semibold outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-750 font-bold p-2.5 px-4 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-2.5 px-6 rounded-xl border border-blue-700 transition cursor-pointer"
                >
                  Salvar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
