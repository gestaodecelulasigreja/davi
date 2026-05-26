/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Celula, RelatorioSemanal, Usuario, Cargo } from "../types";
import { Calendar, Users, HeartHandshake, Image as ImageIcon, CheckCircle, Flame, MessageSquare, Plus, AlertCircle, X, Check } from "lucide-react";

interface SGCReportFormProps {
  celulas: Celula[];
  usuarios: Usuario[];
  currentUser: Usuario;
  onSubmitReport: (report: Partial<RelatorioSemanal>, presencas: Record<string, boolean>) => void;
}

export default function SGCReportForm({
  celulas,
  usuarios,
  currentUser,
  onSubmitReport,
}: SGCReportFormProps) {
  // Find which cells the current user is permitted to report on
  // Pastor: everything, Leader: their own, others: hierarchy based
  const allowedCelulas = celulas.filter((c) => {
    if (currentUser.cargo_atual === Cargo.PastorPresidente || currentUser.cargo_atual === Cargo.MasterAdmin) {
      return true;
    }
    // Cell Leader can report on their cells
    if (c.lider_id === currentUser.id) {
      return true;
    }
    // Supervisor can report on their oversaw cells
    if (c.supervisor_id === currentUser.id) {
      return true;
    }
    return false;
  });

  const [selectedCellId, setSelectedCellId] = useState(
    allowedCelulas.length > 0 ? allowedCelulas[0].id : ""
  );

  const [aconteceu, setAconteceu] = useState<boolean>(true);
  const [presentesCount, setPresentesCount] = useState<number>(4);
  const [visitantes, setVisitantes] = useState<number>(0);
  const [decisoes, setDecisoes] = useState<number>(0);
  const [pedidosOracao, setPedidosOracao] = useState<string>("");
  const [observacoes, setObservacoes] = useState<string>("");
  const [dataRelatorio, setDataRelatorio] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [fotoBase64, setFotoBase64] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState("");

  // Grid check-ins of members belonging to this cellular group
  const cellMembers = usuarios.filter((u) => {
    if (!selectedCellId) return false;
    const cellObj = celulas.find((c) => c.id === selectedCellId);
    if (!cellObj) return false;
    
    // Member belongs to cell if direct leader matches the cell loader, or direct relations
    return u.lider_direto_id === cellObj.lider_id || u.id === cellObj.lider_id || cellObj.auxiliares.includes(u.id);
  });

  // Track map of user_id -> present (boolean)
  const [presencas, setPresencas] = useState<Record<string, boolean>>({});

  const handleMemberChecked = (userId: string, isChecked: boolean) => {
    const updated = { ...presencas, [userId]: isChecked };
    setPresencas(updated);
    
    // Automatically match presents count to ticked checkboxes plus visitors!
    const countChecked = Object.values(updated).filter(Boolean).length;
    setPresentesCount(countChecked);
  };

  // Trigger base64 conversion for foto upload
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

  const clearPhoto = () => {
    setFotoBase64("");
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCellId) return;

    onSubmitReport(
      {
        celula_id: selectedCellId,
        aconteceu,
        quantidade_presentes: aconteceu ? presentesCount : 0,
        visitantes: aconteceu ? visitantes : 0,
        decisao: aconteceu ? deçisõesComputed() : 0,
        pedidos_oracao: pedidosOracao,
        observacoes,
        foto_celula: fotoBase64,
        data_relatorio: dataRelatorio,
      },
      presencas
    );

    setSuccessMsg("Relatório Semanal preenchido com sucesso e integrado ao dashboard!");
    
    // Clear form inputs
    setTimeout(() => {
      setSuccessMsg("");
      setPedidosOracao("");
      setObservacoes("");
      clearPhoto();
      setPresencas({});
    }, 4000);
  };

  const deçisõesComputed = () => deçisõesComputedValue(decisoes);
  const deçisõesComputedValue = (val: number) => val;

  if (allowedCelulas.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 text-center" id="report_form_widget">
        <div className="p-4 bg-slate-50 text-slate-400 rounded-full w-fit mx-auto mb-3">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h4 className="font-bold text-slate-800 text-sm mb-1">Acesso Restrito a Relatórios</h4>
        <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
          De acordo com as regras de Row Level Security (RLS), o envio de relatórios semanais é restrito aos Líderes responsáveis pelas células coordenadas.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6" id="report_form_widget">
      <div className="border-b border-slate-100 pb-4 mb-5">
        <h3 className="text-base font-bold text-slate-800">📄 Lançar Relatório Semanal</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Preencha a ficha semanal com presenças, decisões, pedidos de oração e foto com a Célula.
        </p>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Células dropdown selection */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Selecionar Célula
            </label>
            <select
              value={selectedCellId}
              onChange={(e) => setSelectedCellId(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              required
              id="select_cell_report"
            >
              {allowedCelulas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome_celula} ({c.bairro})
                </option>
              ))}
            </select>
          </div>

          {/* Data dropdown selection */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Data do Encontro
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
              <input
                type="date"
                value={dataRelatorio}
                onChange={(e) => setDataRelatorio(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200 rounded-lg p-2.5 pl-10 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Binary question - "a célula aconteceu?" */}
        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-slate-800">A reunião aconteceu esta semana?</h4>
            <p className="text-xs text-slate-500 mt-0.5">Selecione para abrir o controle de quórum e decisões.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAconteceu(true)}
              className={`p-2 px-5 text-xs font-bold rounded-lg transition-all border ${
                aconteceu
                  ? "bg-blue-600 text-white border-blue-700 shadow-sm"
                  : "bg-white hover:bg-slate-100 text-slate-600 border-slate-200"
              }`}
              id="report_aconteceu_sim"
            >
              Sim, aconteceu!
            </button>
            <button
              type="button"
              onClick={() => setAconteceu(false)}
              className={`p-2 px-5 text-xs font-bold rounded-lg transition-all border ${
                !aconteceu
                  ? "bg-slate-800 text-white border-slate-900 shadow-sm"
                  : "bg-white hover:bg-slate-100 text-slate-600 border-slate-200"
              }`}
              id="report_aconteceu_nao"
            >
              Não correu
            </button>
          </div>
        </div>

        {/* Quantities Form details if Aconteceu is TRUE */}
        {aconteceu && (
          <div className="space-y-6">
            {/* Quick counters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Users className="h-4 w-4 text-slate-400" /> Visitantes na Célula
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={visitantes}
                    onChange={(e) => setVisitantes(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full text-xs font-semibold bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 font-mono"
                  />
                  <div className="absolute right-2.5 top-1.5 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setVisitantes(Math.max(0, visitantes - 1))}
                      className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-500 hover:bg-slate-100 font-bold"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() => setVisitantes(visitantes + 1)}
                      className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-500 hover:bg-slate-100 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Flame className="h-4 w-4 text-amber-500 animate-pulse" /> Decisões por Cristo
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={decisoes}
                    onChange={(e) => setDecisoes(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full text-xs font-semibold bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 font-mono text-amber-800"
                  />
                  <div className="absolute right-2.5 top-1.5 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setDecisoes(Math.max(0, decisoes - 1))}
                      className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-500 hover:bg-slate-100 font-bold"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() => setDecisoes(decisoes + 1)}
                      className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-500 hover:bg-slate-100 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance checklist Grid (Rule 11) */}
            {cellMembers.length > 0 && (
              <div className="bg-slate-50/20 rounded-xl border border-slate-100 p-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    👥 Integrantes da Célula ({cellMembers.length})
                  </h4>
                  <div className="text-[10px] text-slate-500 font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                    {presentesCount} Presentes tagueados
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {cellMembers.map((member) => {
                    const isChecked = !!presencas[member.id];
                    return (
                      <div
                        key={member.id}
                        onClick={() => handleMemberChecked(member.id, !isChecked)}
                        className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer select-none transition-all duration-150 ${
                          isChecked
                            ? "bg-emerald-50/50 border-emerald-400 text-emerald-900 shadow-3xs"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {member.foto ? (
                            <img
                              src={member.foto}
                              alt={member.nome}
                              className="w-6 h-6 rounded-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase">
                              {member.nome.substring(0, 1)}
                            </div>
                          )}
                          <span className="text-xs font-semibold truncate max-w-[100px]">
                            {member.nome.split(" ")[0]} {member.nome.split(" ")[1] || ""}
                          </span>
                        </div>

                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                            isChecked
                              ? "bg-emerald-500 border-emerald-600 text-white"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {isChecked && <Check className="h-3 w-3 stroke-[3px]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Prayer requests */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <HeartHandshake className="h-4 w-4 text-rose-500" /> Pedidos de Oração
          </label>
          <textarea
            value={pedidosOracao}
            onChange={(e) => setPedidosOracao(e.target.value)}
            placeholder="Escreva as necessidades e clamores levantados pelo grupo celular..."
            rows={2}
            className="w-full text-xs font-medium bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 min-h-[50px]"
          />
        </div>

        {/* Observations */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <MessageSquare className="h-4 w-4 text-slate-400" /> Observações Pastorais Gerais
          </label>
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Relate como foi o estudo bíblico, comunhão dos irmãos, reuniões de liderança, etc..."
            rows={3}
            className="w-full text-xs font-medium bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 min-h-[60px]"
          />
        </div>

        {/* Image upload widget (Rule 21) */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <ImageIcon className="h-4 w-4 text-slate-400" /> Enviar Foto da Célula (Comunhão)
          </label>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full flex-1 relative border-2 border-dashed border-slate-200 rounded-xl hover:border-slate-300 transition-all p-4 text-center cursor-pointer select-none bg-slate-50/50">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="report_file_picker"
              />
              <ImageIcon className="h-6 w-6 text-slate-400 mx-auto mb-1.5" />
              <span className="text-xs font-bold text-slate-700 block">Escolher Imagem / Fotografar</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Dispositivos móveis oferecem abrir câmera</span>
            </div>

            {/* Display Base64 preview snippet directly */}
            {fotoBase64 ? (
              <div className="relative w-40 h-24 rounded-lg overflow-hidden border border-slate-200 shrink-0 shadow-3xs group">
                <img
                  src={fotoBase64}
                  alt="Relatório Upload Preview"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <button
                  type="button"
                  onClick={clearPhoto}
                  className="absolute p-1 top-1.5 right-1.5 rounded-full bg-slate-950/75 hover:bg-red-600 text-white transition-colors"
                  title="Remover foto"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div className="w-40 h-24 bg-slate-100 rounded-lg border border-dashed border-slate-200 flex items-center justify-center shrink-0">
                <span className="text-[10px] text-slate-400 font-medium select-none">Sem foto anexada</span>
              </div>
            )}
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-xl transition-all shadow-sm shadow-blue-200 flex items-center justify-center gap-2 text-sm mt-4 border border-blue-700"
          id="btn_submit_report_form"
        >
          <Check className="h-4.5 w-4.5" />
          <span>Enviar Relatório de Célula</span>
        </button>
      </form>
    </div>
  );
}
