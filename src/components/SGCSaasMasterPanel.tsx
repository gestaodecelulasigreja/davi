/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Igreja, Usuario, Cargo, SaasEmail } from "../types";
import { Building2, Plus, ToggleLeft, ToggleRight, Sparkles, KeyRound, ArrowRight, ShieldCheck, Check, Ban, Settings, BarChart, Mail, Bell, Send, AlertTriangle } from "lucide-react";

interface SGCSaasMasterPanelProps {
  igrejas: Igreja[];
  usuarios: Usuario[];
  emails: SaasEmail[];
  onAddIgreja: (newChurch: Partial<Igreja>, presidentName: string, presidentEmail: string) => void;
  onUpdateIgreja: (churchId: string, updated: Partial<Igreja>) => void;
  onResetPresidentPassword: (email: string) => void;
  onImpersonateChurch: (churchId: string) => void;
  onResetDatabaseToClean?: () => void;
  onRestoreSampleData?: () => void;
  onBroadcastUpdate?: (subject: string, content: string) => void;
  onSimulateEmailFail?: (presidentEmail: string, churchName: string, amount: number) => void;
}

export default function SGCSaasMasterPanel({
  igrejas,
  usuarios,
  emails,
  onAddIgreja,
  onUpdateIgreja,
  onResetPresidentPassword,
  onImpersonateChurch,
  onResetDatabaseToClean,
  onRestoreSampleData,
  onBroadcastUpdate,
  onSimulateEmailFail,
}: SGCSaasMasterPanelProps) {
  // Creating church form states
  const [showAddChurch, setShowAddChurch] = useState(false);
  const [nomeIgreja, setNomeIgreja] = useState("");
  const [cidade, setCidade] = useState("Petrópolis");
  const [pastorPresidente, setPastorPresidente] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [plano, setPlano] = useState<Igreja["plano"]>("Bronze");
  const [maxUsuarios, setMaxUsuarios] = useState(50);
  const [maxCelulas, setMaxCelulas] = useState(10);
  const [successMsg, setSuccessMsg] = useState("");

  const handleCreateChurch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeIgreja || !pastorPresidente || !email) return;

    onAddIgreja(
      {
        nome: nomeIgreja,
        logo: "⛪",
        cidade,
        estado: "RJ",
        pastor_presidente: pastorPresidente,
        telefone,
        email,
        plano,
        status: "Ativa",
        quantidade_maxima_usuarios: maxUsuarios,
        quantidade_maxima_celulas: maxCelulas,
        data_vencimento: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 1 year expiration
      },
      pastorPresidente,
      email
    );

    setSuccessMsg(`Igreja "${nomeIgreja}" cadastrada e Pastor Presidente cadastrado com senha padrão "123"!`);
    
    // Clear
    setNomeIgreja("");
    setPastorPresidente("");
    setEmail("");
    setTelefone("");
    setShowAddChurch(false);
    
    setTimeout(() => {
      setSuccessMsg("");
    }, 4000);
  };

  const handleToggleChurchBlock = (churchId: string, currentStatus: "Ativa" | "Bloqueada") => {
    const nextStatus = currentStatus === "Ativa" ? "Bloqueada" : "Ativa";
    onUpdateIgreja(churchId, { status: nextStatus });
  };

  const handleChangePlan = (churchId: string, newPlan: Igreja["plano"]) => {
    // Standard limits per plan
    const limits = {
      Bronze: { users: 50, cells: 10 },
      Prata: { users: 150, cells: 30 },
      Ouro: { users: 500, cells: 100 },
      Master: { users: 1500, cells: 300 },
      Cortesia: { users: 1000, cells: 200 },
    };

    const targetLimits = limits[newPlan] || limits.Bronze;

    onUpdateIgreja(churchId, {
      plano: newPlan,
      quantidade_maxima_usuarios: targetLimits.users,
      quantidade_maxima_celulas: targetLimits.cells,
    });
  };

  // SaaS wide metrics
  const activeChurchesCount = igrejas.filter((i) => i.status === "Ativa").length;
  const blockedChurchesCount = igrejas.filter((i) => i.status === "Bloqueada").length;

  const totalPlatformUsers = usuarios.length;
  const platformBillingEstimate = igrejas.reduce((acc, curr) => {
    if (curr.status !== "Ativa") return acc;
    const planValues = { Bronze: 199, Prata: 399, Ouro: 799, Master: 1499, Cortesia: 0 };
    return acc + (planValues[curr.plano] || 0);
  }, 0);

  return (
    <div className="space-y-6" id="sgc_master_saas_panel">
      {/* SaaS Info Header */}
      <div className="bg-slate-950 text-white rounded-2xl p-6 relative overflow-hidden" id="saas_master_welcome_bar">
        <div className="absolute right-0 bottom-[-40px] opacity-10 select-none text-9xl font-bold">
          SaaS
        </div>

        <div>
          <span className="p-1 px-2 mb-2 bg-blue-500/30 text-blue-300 rounded font-bold text-[9px] uppercase tracking-widest font-mono">
            🛡️ Painel de Controle Master SaaS (Dono da Plataforma)
          </span>
          <h2 className="text-xl font-extrabold tracking-tight mt-1">Supervisão de Ecossistemas Integrados</h2>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed mt-1">
            Controle de ativação, bloqueios, faturamento recorrente estimado e provisionamento direto de pastores presidentes das igrejas parceiras.
          </p>
        </div>
      </div>

      {/* Dev / Admin DB Controls for Idealizer */}
      <div className="bg-white border rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-3xs" id="db_test_sandbox_actions">
        <div>
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Ambiente de Testes do Idealizador</h4>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Zere o banco de dados para simular o produto limpo como se estivesse do zero ou restaure a amostra de simulação.
          </p>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={() => {
              if (confirm("⚠️ ATENÇÃO: Deseja mesmo RESETAR toda a base celular? Isso removerá todas as demais congregações, membros e células de demonstração, deixando apenas o seu Usuário Master Admin atual.")) {
                onResetDatabaseToClean?.();
              }
            }}
            className="flex-1 sm:flex-none p-2 px-3.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-250 transition text-xs font-bold rounded-xl cursor-pointer"
            id="btn_reset_db_saas"
          >
            🗑️ Limpar Tudo (Zerar)
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm("Deseja restaurar as igrejas demostrativas (Lagoinha, Videira, Nazareno) com seus relatórios, redes e células?")) {
                onRestoreSampleData?.();
              }
            }}
            className="flex-1 sm:flex-none p-2 px-3.5 bg-slate-900 hover:bg-slate-800 text-white transition text-xs font-bold rounded-xl cursor-pointer"
            id="btn_restore_sample_saas"
          >
            📋 Restaurar Dados Simulados
          </button>
        </div>
      </div>

      {/* Global SaaS counters cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border p-5 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-slate-400 text-[10px] font-bold uppercase block tracking-wider">Igrejas Ativas</span>
            <span className="text-2xl font-black text-slate-800 block font-mono">{activeChurchesCount}</span>
          </div>
        </div>

        <div className="bg-white border p-5 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <Ban className="h-6 w-6" />
          </div>
          <div>
            <span className="text-slate-400 text-[10px] font-bold uppercase block tracking-wider">Igrejas Bloqueadas</span>
            <span className="text-2xl font-black text-slate-800 block font-mono">{blockedChurchesCount}</span>
          </div>
        </div>

        <div className="bg-white border p-5 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <BarChart className="h-6 w-6" />
          </div>
          <div>
            <span className="text-slate-400 text-[10px] font-bold uppercase block tracking-wider">Usuários no Ecossistema</span>
            <span className="text-2xl font-black text-slate-800 block font-mono">{totalPlatformUsers}</span>
          </div>
        </div>

        <div className="bg-white border p-5 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <span className="text-lg font-bold">R$</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] font-bold uppercase block tracking-wider">Faturamento Estimado</span>
            <span className="text-2xl font-black text-slate-800 block font-mono">R$ {platformBillingEstimate}/m</span>
          </div>
        </div>
      </div>

      {/* Success notification banner */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 animate-fadeIn">
          <Check className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Embedded add new church form */}
      {showAddChurch ? (
        <div className="bg-white border border-blue-100 rounded-xl p-5 shadow-md animate-fadeIn" id="church_provision_panel">
          <div className="flex items-center justify-between border-b pb-2 mb-4">
            <h3 className="font-bold text-slate-800 text-sm">Provisionar Nova Igreja</h3>
            <button
              onClick={() => setShowAddChurch(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              Fechar
            </button>
          </div>

          <form onSubmit={handleCreateChurch} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-widest mb-1">Nome da Congregação</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Videira Itaipava"
                  value={nomeIgreja}
                  onChange={(e) => setNomeIgreja(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 p-2 rounded-lg font-bold outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-widest mb-1">Cidade</label>
                <input
                  type="text"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 p-2 rounded-lg font-bold outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-widest mb-1">Telefone Comercial</label>
                <input
                  type="text"
                  placeholder="(24) 99000-0000"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 p-2 rounded-lg font-bold outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-widest mb-1">Pr. Presidente *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Pr. Geraldo Santos"
                  value={pastorPresidente}
                  onChange={(e) => setPastorPresidente(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 p-2 rounded-lg font-bold outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-widest mb-1">Email (Login Presidente) *</label>
                <input
                  type="email"
                  required
                  placeholder="Ex: geraldo@igreja.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 p-2 rounded-lg font-bold outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-widest mb-1">Plano Adquirido</label>
                <select
                  value={plano}
                  onChange={(e) => {
                    const nextVal = e.target.value as Igreja["plano"];
                    setPlano(nextVal);
                    // Autofills limits
                    if (nextVal === "Bronze") { setMaxUsuarios(50); setMaxCelulas(10); }
                    else if (nextVal === "Prata") { setMaxUsuarios(150); setMaxCelulas(30); }
                    else if (nextVal === "Ouro") { setMaxUsuarios(500); setMaxCelulas(100); }
                    else if (nextVal === "Cortesia") { setMaxUsuarios(1000); setMaxCelulas(200); }
                    else { setMaxUsuarios(1500); setMaxCelulas(300); }
                  }}
                  className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 p-2 rounded-lg font-bold outline-none cursor-pointer"
                >
                  <option value="Bronze">Bronze (R$ 199/m)</option>
                  <option value="Prata">Prata (R$ 399/m)</option>
                  <option value="Ouro">Ouro (R$ 799/m)</option>
                  <option value="Master">Master (R$ 1499/m)</option>
                  <option value="Cortesia">🎁 Cortesia (Grátis / Testes)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-widest mb-1">Máx Células</label>
                <input
                  type="number"
                  value={maxCelulas}
                  onChange={(e) => setMaxCelulas(parseInt(e.target.value) || 10)}
                  className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 p-2 rounded-lg font-bold outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase tracking-widest mb-1">Máx Usuários</label>
                <input
                  type="number"
                  value={maxUsuarios}
                  onChange={(e) => setMaxUsuarios(parseInt(e.target.value) || 50)}
                  className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 p-2 rounded-lg font-bold outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-3 rounded-lg border border-indigo-700 transition shadow-sm font-sans"
              id="submit_igreja_btn"
            >
              Criar Igreja & Gerar Credenciais Pastor Presidente
            </button>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setShowAddChurch(true)}
          className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs p-2.5 px-4 rounded-xl shadow-sm cursor-pointer border border-indigo-700"
          id="btn_provision_shortcut"
        >
          <Plus className="h-4 w-4" /> Provisionar Nova Igreja Parco
        </button>
      )}

      {/* Churches grid controls table */}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            Lista de Igrejas sob Supervisão SaaS
          </h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-600 font-sans">
            <thead className="bg-slate-50/50 text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b">
              <tr>
                <th className="p-3.5">Igreja ID / Nome</th>
                <th className="p-3.5">Presidente Responsável</th>
                <th className="p-3.5">Limites / Plano</th>
                <th className="p-3.5">Validade</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Ação Master</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {igrejas.map((ch) => {
                const isBlocked = ch.status === "Bloqueada";
                return (
                  <tr key={ch.id} className="hover:bg-slate-50/40">
                    <td className="p-3.5 flex items-center gap-2.5">
                      <span className="text-lg p-1 bg-slate-100 rounded">{ch.logo}</span>
                      <div>
                        <span className="font-extrabold text-slate-800 text-xs block">{ch.nome}</span>
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{ch.id}</span>
                      </div>
                    </td>

                    <td className="p-3.5 space-y-0.5">
                      <div className="font-bold text-slate-700">{ch.pastor_presidente}</div>
                      <div className="text-[10px] text-slate-400 font-mono select-all truncate max-w-[150px]">{ch.email}</div>
                    </td>

                    <td className="p-3.5 space-y-1">
                      {/* Plan selectors */}
                      <select
                        value={ch.plano}
                        onChange={(e) => handleChangePlan(ch.id, e.target.value as Igreja["plano"])}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 rounded p-1 font-bold block text-[10px] outline-none cursor-pointer border border-slate-200"
                        id={`select_plane_church_${ch.id}`}
                      >
                        <option value="Bronze">🏆 Bronze (50L/10C)</option>
                        <option value="Prata">💎 Prata (150L/30C)</option>
                        <option value="Ouro">🔥 Ouro (500L/100C)</option>
                        <option value="Master">👑 Master (1500L/300C)</option>
                        <option value="Cortesia">🎁 Cortesia (1000L/200C)</option>
                      </select>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        Max ({ch.quantidade_maxima_celulas} células, {ch.quantidade_maxima_usuarios} memb.)
                      </span>
                    </td>

                    <td className="p-3.5 text-slate-500 font-mono text-[11px] font-semibold">
                      📅 {ch.data_vencimento}
                    </td>

                    <td className="p-3.5">
                      <button
                        onClick={() => handleToggleChurchBlock(ch.id, ch.status)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block cursor-pointer transition-all border ${
                          isBlocked
                            ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                            : "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
                        }`}
                        id={`btn_toggle_block_${ch.id}`}
                      >
                        {ch.status === "Ativa" ? "🟢 Ativa" : "🔴 Bloqueada"}
                      </button>
                    </td>

                    <td className="p-3.5 text-right space-x-2">
                      {/* Impersonation entry action */}
                      <button
                        type="button"
                        onClick={() => onImpersonateChurch(ch.id)}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold p-1.5 px-3 rounded-lg text-[10px] inline-flex items-center gap-1 shadow-sm transition cursor-pointer border border-indigo-250"
                        id={`btn_impersonate_${ch.id}`}
                      >
                        <Settings className="h-3 w-3 text-indigo-500" />
                        <span>Acessar Dashboard 🖥️</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (onSimulateEmailFail) {
                            const planValues = { Bronze: 199, Prata: 399, Ouro: 799, Master: 1499, Cortesia: 0 };
                            const cost = planValues[ch.plano] || 199;
                            onSimulateEmailFail(ch.email, ch.nome, cost);
                            alert(`Faturamento REJEITADO simulado! E-mail de cobrança falha enviado para ${ch.email}`);
                          }
                        }}
                        className="p-1.5 px-2.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-650 font-bold inline-flex items-center gap-1 text-[10px] cursor-pointer"
                        title="Simular Transação Recusada (Alerta Financeiro)"
                      >
                        <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                        <span>Simular Recusa</span>
                      </button>

                      {/* Reset password buttons trigger */}
                      <button
                        type="button"
                        onClick={() => {
                          onResetPresidentPassword(ch.email);
                          alert(`Senha de acesso do Pastor Presidente (${ch.email}) foi redefinida para "123"!`);
                        }}
                        className="p-1.5 px-2.5 rounded-lg border border-slate-250 hover:text-rose-600 inline-flex items-center gap-1 text-[10px] cursor-pointer"
                        id={`btn_reset_pwd_${ch.id}`}
                        title="Restaurar senha original (123)"
                      >
                        <KeyRound className="h-3.5 w-3.5 text-slate-400" />
                        <span>Resetar Senha</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simulated Email Gateway & Broadcast System Update Center for the SaaS Creator */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md space-y-6" id="saas_simulation_control_room">
        <div className="border-b border-slate-800 pb-3">
          <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wider">
            📬 Central de Cobranças, Ativações & E-mails Enviados (SaaS Gateway)
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
            Painel exclusivo do Idealizador da plataforma para inspecionar, auditar e testar os e-mails transacionais recebidos pelos clientes (Confirmação de Plano, Link de senha, Erros de pagamento e Atualizações Globais).
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Email dispatch histories logs */}
          <div className="lg:col-span-2 space-y-3 font-sans">
            <h4 className="text-[10.5px] font-extrabold text-blue-400 uppercase tracking-widest flex items-center gap-1">
              <Mail className="h-3.5 w-3.5 text-blue-400" /> Histórico de logs de e-mails disparados ({emails.length})
            </h4>

            <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
              {emails.map((e) => {
                const isErr = e.tipo === "erro_pagamento";
                const isLink = e.tipo === "link_cadastro";
                const isUpdate = e.tipo === "atualizacao_sistema";
                
                return (
                  <div key={e.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4.5 space-y-2.5 shadow-md">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-2">
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Para: <span className="text-white select-all font-mono font-bold">{e.destinatario}</span></span>
                        <h5 className="font-extrabold text-slate-100 text-[11.5px] tracking-tight">{e.assunto}</h5>
                      </div>
                      
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Type Label */}
                        <span className={`text-[8.5px] px-2 py-0.5 font-bold rounded uppercase ${
                          isErr ? "bg-red-500/20 text-red-300 border border-red-500/30" :
                          isLink ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" :
                          isUpdate ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" :
                          "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        }`}>
                          {e.tipo}
                        </span>

                        {/* Status Label */}
                        <span className={`text-[8.5px] px-1.5 py-0.5 font-black rounded uppercase ${
                          e.status.includes("Falha") ? "bg-rose-600 text-white" :
                          e.status.includes("Pendente") ? "bg-amber-600 text-white" :
                          "bg-slate-800 text-slate-300"
                        }`}>
                          {e.status}
                        </span>
                      </div>
                    </div>

                    <p className="text-[10.5px] text-slate-300 leading-relaxed whitespace-pre-line font-medium bg-slate-900 p-3 rounded-lg select-text border border-slate-800/60">
                      {e.conteudo}
                    </p>

                    <div className="flex items-center justify-between text-[9px] text-slate-500">
                      <span className="font-mono">{e.data.replace("T", " ").substring(0, 19)}</span>
                      {e.link && (
                        <a
                          href={e.link}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-blue-600 hover:bg-blue-700 text-white font-black p-1 px-2.5 rounded hover:text-white transition"
                        >
                          🔗 Simular Clique do Pastor (Ativar Login)
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Broadcast update composer form */}
          <div className="bg-slate-950 border border-slate-805 rounded-xl p-4.5 space-y-4 shadow-sm font-sans text-xs">
            <div className="border-b border-slate-800 pb-2">
              <h4 className="text-[10px] font-extrabold text-purple-400 uppercase tracking-widest flex items-center gap-1">
                <Send className="h-3.5 w-3.5 text-purple-400" /> Transmitir Novas Atualizações
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
                Notifique todos os pastores presidentes sobre novas funcionalidades do software imediatamente via e-mail corporativo.
              </p>
            </div>

            {(() => {
              const [upSubject, setUpSubject] = useState("Vaga para Células Kids Ativada!");
              const [upContent, setUpContent] = useState(
                "Olá Pastor Presidente,\n\nLiberamos o recurso de Líder de Ministério Kids (opcional) de celular a pedido do nosso comitê de usuários nacionais. Habilite em sua rede de forma instantânea.\n\nEquipe de engenharia do Prompt Master Celular"
              );

              return (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!upSubject || !upContent) return;
                    if (onBroadcastUpdate) {
                      onBroadcastUpdate(upSubject, upContent);
                      alert("Atualização transmitida com sucesso para o canal de e-mails de todos os Pastores!");
                    }
                  }}
                  className="space-y-3"
                >
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Título da Atualização / Assunto
                    </label>
                    <input
                      type="text"
                      required
                      value={upSubject}
                      onChange={(e) => setUpSubject(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-[11px] font-bold outline-none text-white focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Conteúdo do E-mail Legislativo
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={upContent}
                      onChange={(e) => setUpContent(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-[10.5px] leading-relaxed outline-none text-white focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-purple-650 hover:bg-purple-700 text-white font-extrabold p-2.5 rounded-lg border border-purple-700 transition cursor-pointer flex items-center justify-center gap-1.5 text-[10.5px]"
                  >
                    <span>Disparar Broadcast Global 📢</span>
                  </button>
                </form>
              );
            })()}

            <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-850 space-y-1.5">
              <span className="text-[9px] font-extrabold text-amber-500 uppercase tracking-wider block">⚠️ NOTA DE ENGENHARIA</span>
              <p className="text-[10px] text-slate-400 leading-normal">
                Ao disparar atualizações globais, os pastores logados também receberão alertas flutuantes em seus dashboards internos de células!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
