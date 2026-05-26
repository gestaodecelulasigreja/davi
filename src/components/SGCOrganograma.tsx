/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Usuario, Cargo, Celula, CellStatus } from "../types";
import { ChevronDown, ChevronRight, User, ShieldAlert, BadgeInfo, Send, Sparkles, AlertCircle, Phone } from "lucide-react";
import { evaluateCellStatusAndAlerts } from "../data";

interface SGCOrganogramaProps {
  usuarios: Usuario[];
  celulas: Celula[];
  currentUser: Usuario;
  onPromoteClick: (userId: string) => void;
  promocoesElegiveis: any[]; // PromocaoElegivel array
  onSelectCell?: (cellId: string) => void;
}

export default function SGCOrganograma({
  usuarios,
  celulas,
  currentUser,
  onPromoteClick,
  promocoesElegiveis,
  onSelectCell,
}: SGCOrganogramaProps) {
  // Set tracking for expanded user IDs
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    [currentUser.id]: true, // Start with current user expanded
  });

  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Recursively determine how many active cells are under a user
  const getSubCellsCount = (userId: string): number => {
    const directCells = celulas.filter((c) => c.lider_id === userId).length;
    const directLiderados = usuarios.filter((u) => u.lider_direto_id === userId);
    let childCells = 0;
    directLiderados.forEach((l) => {
      childCells += getSubCellsCount(l.id);
    });
    return directCells + childCells;
  };

  // Recursively find if any cell under this user has alerts
  const checkSubAlerts = (userId: string): { hasAlert: boolean; status: CellStatus | null } => {
    const directCellsList = celulas.filter((c) => c.lider_id === userId);
    
    // Check direct
    for (const c of directCellsList) {
      if (c.status_celula !== CellStatus.VERDE) {
        return { hasAlert: true, status: c.status_celula };
      }
    }

    // Check subordinates
    const directLiderados = usuarios.filter((u) => u.lider_direto_id === userId);
    for (const l of directLiderados) {
      const parentResult = checkSubAlerts(l.id);
      if (parentResult.hasAlert) {
        return parentResult;
      }
    }

    return { hasAlert: false, status: null };
  };

  // Determine hierarchical child nodes
  const getLiderados = (userId: string): Usuario[] => {
    return usuarios.filter((u) => u.lider_direto_id === userId);
  };

  // Render a node in the tree list
  const renderNode = (user: Usuario, depth: number = 0) => {
    const isExpanded = !!expandedNodes[user.id];
    const subLiderados = getLiderados(user.id);
    const subCells = getSubCellsCount(user.id);
    const { hasAlert, status: alertStatus } = checkSubAlerts(user.id);
    const hasLiderados = subLiderados.length > 0;

    const elegivelPromocao = promocoesElegiveis.find((p) => p.usuario_id === user.id);

    // Color code based on alerts propagating down
    let borderAlertClass = "border-slate-100 hover:border-slate-200 bg-white";
    if (hasAlert) {
      if (alertStatus === CellStatus.VERMELHO) {
        borderAlertClass = "border-red-200 hover:border-red-300 bg-red-50/50";
      } else if (alertStatus === CellStatus.AMARELO) {
        borderAlertClass = "border-amber-200 hover:border-amber-300 bg-amber-50/50";
      } else if (alertStatus === CellStatus.AZUL) {
        borderAlertClass = "border-blue-200 hover:border-blue-300 bg-blue-50/50";
      }
    }

    return (
      <div key={user.id} className="relative select-none select-text-child">
        {/* Connection Line */}
        {depth > 0 && (
          <div
            className="absolute left-[18px] top-[-16px] bottom-[20px] w-0.5 bg-slate-100"
            style={{
              height: hasLiderados && isExpanded ? "34px" : "34px",
            }}
          />
        )}

        <div className="flex items-start gap-3 mt-4 relative z-10">
          {/* Collapse/Expand indicator for folders */}
          <div className="mt-2 shrink-0">
            {hasLiderados ? (
              <button
                onClick={() => toggleNode(user.id)}
                className="p-1 rounded-md hover:bg-slate-100 text-slate-500 transition-colors"
                id={`btn_toggle_${user.id}`}
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            ) : (
              <div className="w-6 h-6 flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
              </div>
            )}
          </div>

          {/* Node body */}
          <div
            className={`flex-1 rounded-xl p-3 border shadow-xs transition-all duration-200 ${borderAlertClass}`}
            style={{
              marginLeft: `${depth * 2}px`,
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* Profile Photo */}
                <div className="relative">
                  {user.foto ? (
                    <img
                      src={user.foto}
                      alt={user.nome}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-xs"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center ring-2 ring-white shadow-xs text-slate-500 font-bold text-xs uppercase">
                      {user.nome.substring(0, 2)}
                    </div>
                  )}
                  {/* Status Badging */}
                  {hasAlert && (
                    <span
                      className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white ${
                        alertStatus === CellStatus.VERMELHO
                          ? "bg-red-500"
                          : alertStatus === CellStatus.AMARELO
                          ? "bg-amber-500"
                          : "bg-blue-500"
                      }`}
                    />
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h4 className="text-sm font-bold text-slate-800">{user.nome}</h4>
                    {/* Badge Cargo */}
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                      {user.cargo_atual}
                    </span>
                    {user.id === currentUser.id && (
                      <span className="text-[9px] bg-indigo-50 border border-indigo-100 text-indigo-600 px-1.5 py-0.2 rounded-full font-bold">
                        Você
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono truncate max-w-xs sm:max-w-md">
                    ✉️ {user.email} • 📱 {user.telefone}
                  </p>

                  {(() => {
                    const directCells = celulas.filter((c) => c.lider_id === user.id);
                    if (directCells.length === 0) return null;
                    return (
                      <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Célula(s) Própria(s):</span>
                        {directCells.map((cell) => (
                          <button
                            key={cell.id}
                            type="button"
                            onClick={() => {
                              if (onSelectCell) {
                                onSelectCell(cell.id);
                              }
                            }}
                            className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-0.5 rounded border border-blue-105 transition-all cursor-pointer shadow-3xs"
                            title="Visualizar Detalhes desta Célula"
                          >
                            🏠 {cell.nome_celula} ({cell.tipo_celula || "Mista"})
                          </button>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Node statistics & buttons */}
              <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                {/* Cells indicator count */}
                {subCells > 0 && (
                  <div className="text-[11px] bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 border border-blue-100 shadow-xs">
                    <span className="font-bold font-mono">{subCells}</span>
                    <span>{subCells === 1 ? "célula" : "células"}</span>
                  </div>
                )}

                {/* Promotion badge */}
                {elegivelPromocao && (
                  <button
                    onClick={() => onPromoteClick(user.id)}
                    className="animate-pulse flex items-center gap-1 text-[11px] bg-amber-500 hover:bg-amber-600 text-white font-bold px-2.5 py-1 rounded-lg shadow-sm transition-all border border-amber-600"
                    id={`btn_promote_node_${user.id}`}
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>Promoção Pronta!</span>
                  </button>
                )}

                {/* Alerts summary badge */}
                {hasAlert && (
                  <div
                    className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg border ${
                      alertStatus === CellStatus.VERMELHO
                        ? "bg-red-50 text-red-700 border-red-200"
                        : alertStatus === CellStatus.AMARELO
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    }`}
                  >
                    <AlertCircle className="h-3. w-3" />
                    <span>Região sob Alerta</span>
                  </div>
                )}

                {/* WhatsApp Link button */}
                {user.whatsapp && (
                  <a
                    href={`https://wa.me/${user.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 px-2.5 rounded-lg border border-slate-200 hover:border-emerald-200 text-slate-500 hover:text-white hover:bg-emerald-500 transition-all flex items-center justify-center gap-1 text-xs"
                    id={`wa_btn_${user.id}`}
                  >
                    <Phone className="h-3 w-3 shrink-0" />
                    <span className="text-[10px] font-medium hidden xs:inline">WhatsApp</span>
                  </a>
                )}
              </div>
            </div>
            
            {/* Show details on expand */}
            {isExpanded && user.observacoes && (
              <div className="mt-2.5 pt-2 border-t border-dashed border-slate-100 text-xs text-slate-500 flex items-center gap-1.5 font-sans italic bg-slate-50/50 p-2 rounded-lg">
                <BadgeInfo className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>"{user.observacoes}"</span>
              </div>
            )}
          </div>
        </div>

        {/* Child level list */}
        {hasLiderados && isExpanded && (
          <div className="pl-6 border-l border-dashed border-slate-200 ml-5 relative">
            {subLiderados.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6" id="sgc_organograma_widget">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-4 mb-2">
        <div>
          <h3 className="text-base font-bold text-slate-800">Organograma de Cobertura Pastoral</h3>
          <p className="text-xs text-slate-500 leading-relaxed mt-0.5">
            Visualize a pirâmide de cobertura celular, de acordo com o cargo e líderes diretos atrelados.
          </p>
        </div>
        <div className="text-[11px] text-slate-400 italic">
          💡 Clique nos botões de seta para expandir os níveis ministeriais da igreja.
        </div>
      </div>

      <div className="overflow-x-auto py-2">
        <div className="min-w-[320px] max-w-full space-y-4">
          {/* Start rendering from current authenticated user down */}
          {renderNode(currentUser)}
        </div>
      </div>
    </div>
  );
}
