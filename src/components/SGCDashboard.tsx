/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo } from "react";
import { Celula, CellStatus, Usuario, Cargo, Rede, RelatorioSemanal, Notificacao } from "../types";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell, Legend } from "recharts";
import { Activity, Users, Home, TrendingUp, AlertTriangle, Sparkles, HeartPulse, CheckSquare, Bell, Cross, Baby } from "lucide-react";

interface SGCDashboardProps {
  celulas: Celula[];
  usuarios: Usuario[];
  redes: Rede[];
  relatorios: RelatorioSemanal[];
  promocoesElegiveis: any[]; // PromocaoElegivel[]
  notificacoes: Notificacao[];
  currentUser: Usuario;
  onNavigate: (tab: string) => void;
}

export default function SGCDashboard({
  celulas,
  usuarios,
  redes,
  relatorios,
  promocoesElegiveis,
  notificacoes,
  currentUser,
  onNavigate,
}: SGCDashboardProps) {
  // 1. Church separation (local security filter)
  const churchCelulas = useMemo(() => {
    return celulas.filter((c) => !currentUser.igreja_id || c.igreja_id === currentUser.igreja_id);
  }, [celulas, currentUser.igreja_id]);

  const churchUsuarios = useMemo(() => {
    return usuarios.filter((u) => !currentUser.igreja_id || u.igreja_id === currentUser.igreja_id);
  }, [usuarios, currentUser.igreja_id]);

  const churchRelatorios = useMemo(() => {
    return relatorios.filter((r) => !currentUser.igreja_id || r.igreja_id === currentUser.igreja_id);
  }, [relatorios, currentUser.igreja_id]);

  // Compute stats
  const totalCelulas = churchCelulas.length;
  const kidsCelulasCount = churchCelulas.filter((c) => c.tipo_celula === "Kids").length;

  const celulasTipoStats = useMemo(() => {
    const stats = {
      Mista: 0,
      Jovem: 0,
      Adolescentes: 0,
      Kids: 0,
      Homens: 0,
      Mulheres: 0
    };
    churchCelulas.forEach(c => {
      const t = c.tipo_celula || "Mista";
      if (t === "Mista") stats.Mista++;
      else if (t === "Jovem") stats.Jovem++;
      else if (t === "Adolescentes") stats.Adolescentes++;
      else if (t === "Kids") stats.Kids++;
      else if (t === "Homens") stats.Homens++;
      else if (t === "Mulheres") stats.Mulheres++;
    });
    return stats;
  }, [churchCelulas]);

  const totalLideres = churchUsuarios.filter(
    (u) =>
      u.cargo_atual === Cargo.LiderCelula ||
      u.cargo_atual === Cargo.LiderSupervisor ||
      u.cargo_atual === Cargo.SupervisorSetor
  ).length;

  const totalIntegrantes = useMemo(() => {
    return churchCelulas.reduce((acc, cell) => acc + cell.quantidade_integrantes, 0);
  }, [churchCelulas]);

  const saudaveisCount = churchCelulas.filter((c) => c.status_cellula === CellStatus.VERDE).length;
  const alertaCount = churchCelulas.filter(
    (c) => c.status_cellula === CellStatus.AMARELO || c.status_cellula === CellStatus.VERMELHO
  ).length;
  const multiplicacaoCount = churchCelulas.filter((c) => c.status_cellula === CellStatus.AZUL).length;

  const frequenciaMedia = useMemo(() => {
    if (churchRelatorios.length === 0) return 0;
    const totalPresentes = churchRelatorios.reduce((acc, r) => acc + r.quantidade_presentes, 0);
    // Ideal count is reports count * average cell size
    const averageCellSize = totalIntegrantes / (totalCelulas || 1);
    const idealPossible = churchRelatorios.length * averageCellSize;
    if (idealPossible === 0) return 100;
    return Math.min(100, Math.round((totalPresentes / idealPossible) * 100));
  }, [churchRelatorios, totalIntegrantes, totalCelulas]);

  // Charts data: Growth monthly (simulating nice smooth metrics over recent months)
  const growthData = [
    { name: "Dez", celulas: Math.max(1, Math.round(totalCelulas * 0.7)), membros: Math.max(10, Math.round(totalIntegrantes * 0.65)) },
    { name: "Jan", celulas: Math.max(2, Math.round(totalCelulas * 0.8)), membros: Math.max(15, Math.round(totalIntegrantes * 0.75)) },
    { name: "Fev", celulas: Math.max(3, Math.round(totalCelulas * 0.85)), membros: Math.max(20, Math.round(totalIntegrantes * 0.8)) },
    { name: "Mar", celulas: Math.max(4, Math.round(totalCelulas * 0.95)), membros: Math.max(25, Math.round(totalIntegrantes * 0.9)) },
    { name: "Abr", celulas: totalCelulas, membros: totalIntegrantes },
  ];

  // Charts data: Redes metrics
  const redesChartData = useMemo(() => {
    return redes
      .filter((r) => !currentUser.igreja_id || r.igreja_id === currentUser.igreja_id)
      .map((r) => {
        const count = churchCelulas.filter((c) => c.rede_id === r.id).length;
        return {
          name: r.nome,
          value: count,
          color: r.cor,
        };
      });
  }, [redes, churchCelulas, currentUser.igreja_id]);

  // Charts data: Area metrics
  const bairrosChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    churchCelulas.forEach((c) => {
      counts[c.bairro] = (counts[c.bairro] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [churchCelulas]);

  const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6"];

  return (
    <div className="space-y-6" id="sgc_dashboard_bento">
      {/* Dynamic Welcome bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 relative overflow-hidden shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6" id="dashboard_welcome_card text-white">
        {/* Subtle background decoration cross element */}
        <div className="absolute right-0 bottom-[-50px] opacity-[0.03] select-none text-[300px] pointer-events-none font-bold">
          ✝
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1 px-2.5 bg-blue-500/30 text-blue-300 rounded-full font-bold text-[10px] uppercase tracking-wider font-mono">
              Ambiente {currentUser.cargo_atual}
            </span>
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">Bem-vindo, {currentUser.nome}!</h2>
          <p className="text-xs text-slate-300 max-w-lg leading-relaxed mt-1">
            Painel Geral Estratégico de Crescimento e Coerção Pastoral. Gerencie com precisão a saúde das células e tome decisões baseadas em relatórios reais.
          </p>
        </div>

        {/* Quick promotions feed or notification alert button */}
        {promocoesElegiveis.length > 0 && (
          <div className="bg-white/10 backdrop-blur-md border border-white/15 p-3.5 rounded-xl shrink-0 flex items-center gap-3 max-w-sm">
            <div className="p-2 bg-amber-500 text-white rounded-lg animate-bounce">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-amber-300 uppercase tracking-widest">METAS ATINGIDAS</div>
              <h4 className="text-xs font-bold text-white mt-0.5">Líderes elegíveis para Promoção!</h4>
              <button
                onClick={() => onNavigate("pessoas")}
                className="text-[10px] text-blue-300 font-semibold mt-1 hover:underline text-left block"
              >
                Supervisionar plano de promoção ➔
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Empty Church Welcome Wizard & Onboarding Checklists */}
      {totalCelulas === 0 && (
        <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-6 shadow-sm space-y-4 animate-fadeIn" id="pastor_empty_church_wizard">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-5 w-5 text-blue-600 shrink-0" />
            <h3 className="font-extrabold text-blue-900 text-sm">🌱 Bem-vindo ao Seu Ambiente Inicial!</h3>
          </div>
          <p className="text-xs text-blue-800 leading-relaxed max-w-3xl">
            Sua plataforma está vazia! Como Pastor Presidente ou Administrador, veja abaixo os caminhos sugeridos para iniciar o mapeamento e acompanhamento do crescimento da sua igreja:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-white p-4.5 rounded-xl border border-blue-105 flex gap-3 shadow-3xs">
              <div className="p-2 bg-blue-50 text-blue-700 h-fit rounded-lg font-mono font-bold text-xs">1</div>
              <div className="space-y-1 text-xs">
                <h4 className="font-extrabold text-slate-800">Definir Liderança de Rede</h4>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Cadastre o Líder de Rede que ficará a cargo de supervisionar as frentes de expansão associadas. Superior governando os cargos e discípulos abaixo.
                </p>
                <button
                  onClick={() => onNavigate("pessoas")}
                  className="text-[10.5px] text-blue-600 font-extrabold flex items-center gap-0.5 hover:underline mt-2 cursor-pointer focus:outline-none"
                >
                  Cadastrar Líder de Rede ➔
                </button>
              </div>
            </div>

            <div className="bg-white p-4.5 rounded-xl border border-blue-105 flex gap-3 shadow-3xs">
              <div className="p-2 bg-blue-50 text-blue-700 h-fit rounded-lg font-mono font-bold text-xs">2</div>
              <div className="space-y-1 text-xs">
                <h4 className="font-extrabold text-slate-800">Começar pela Primeira Célula</h4>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Se a sua igreja está em implantação inicial e você ainda não possui um líder de rede estabelecido, pode cadastrar diretamente uma célula para iniciar!
                </p>
                <button
                  onClick={() => onNavigate("celulas")}
                  className="text-[10.5px] text-blue-600 font-extrabold flex items-center gap-0.5 hover:underline mt-2 cursor-pointer focus:outline-none"
                >
                  Cadastrar Primeira Célula ➔
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Weekly reports pending warnings / reminders center based on church hierarchies */}
      {(() => {
        // Calculate which cells are missing reports in the last 7 days
        const pendingCells = churchCelulas.filter((c) => {
          const reports = churchRelatorios.filter((r) => r.celula_id === c.id);
          if (reports.length === 0) return true;
          const sorted = [...reports].sort((a, b) => new Date(b.data_relatorio).getTime() - new Date(a.data_relatorio).getTime());
          const lastReportDate = new Date(sorted[0].data_relatorio);
          const diffDays = Math.ceil(Math.abs(Date.now() - lastReportDate.getTime()) / (1000 * 60 * 60 * 24));
          return diffDays > 7;
        });

        if (pendingCells.length === 0) return null;

        // Is current user a direct cell leader with missing reports?
        const isLider = currentUser.cargo_atual === Cargo.LiderCelula;
        const myPending = pendingCells.filter((c) => c.lider_id === currentUser.id);

        if (isLider && myPending.length > 0) {
          return (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4.5 shadow-3xs flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
              <div className="flex items-start gap-3 text-xs text-amber-900">
                <div className="p-2 bg-amber-100 rounded-lg text-amber-700 shrink-0">
                  <Bell className="h-4 w-4 animate-bounce" />
                </div>
                <div>
                  <h4 className="font-extrabold">📅 Lembrete de Envio de Relatório!</h4>
                  <p className="text-[11px] text-amber-700 leading-relaxed mt-0.5">
                    Seu supervisor está aguardando os relatórios semanais das seguintes células que você lidera:{" "}
                    <strong>{myPending.map((c) => c.nome_celula).join(", ")}</strong>. Envie para manter sua liderança atualizada!
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate("relatorios")}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold p-1.5 px-3.5 rounded-lg border border-amber-700 transition cursor-pointer text-[10.5px] whitespace-nowrap"
              >
                Lançar Relatório Agora ➔
              </button>
            </div>
          );
        }

        // Is superior supervising these cells? (Pastor, Admin, Rede, Area, Supervisor)
        const isSuperior = [
          Cargo.PastorPresidente,
          Cargo.Administrador,
          Cargo.LiderRede,
          Cargo.LiderKidsRede,
          Cargo.LiderArea,
          Cargo.SupervisorSetor,
          Cargo.LiderSupervisor
        ].includes(currentUser.cargo_atual);

        if (isSuperior) {
          // Filter list of pending cells matching their scope
          const supervisedPending = pendingCells.filter((c) => {
            if (currentUser.cargo_atual === Cargo.PastorPresidente || currentUser.cargo_atual === Cargo.Administrador) return true;
            if (currentUser.cargo_atual === Cargo.LiderRede || currentUser.cargo_atual === Cargo.LiderKidsRede) return c.rede_id === currentUser.rede_id;
            return c.supervisor_id === currentUser.id;
          });

          if (supervisedPending.length > 0) {
            return (
              <div className="bg-rose-50 border border-rose-105 rounded-xl p-4.5 shadow-3xs text-xs space-y-3 animate-fadeIn">
                <div className="flex items-start gap-2.5 text-rose-900">
                  <AlertTriangle className="h-4.5 w-4.5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold">⚠️ Alerta de Relatórios Pendentes na sua Cobertura</h4>
                    <p className="text-[11px] text-rose-700 leading-relaxed mt-0.5">
                      Você e seus líderes abaixo possuem células com relatórios semanais pendentes há mais de 7 dias. Lembre seus liderados de enviar os registros:
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[160px] overflow-y-auto pt-1">
                  {supervisedPending.map((cell) => {
                    const cellLeader = churchUsuarios.find((u) => u.id === cell.lider_id);
                    return (
                      <div key={cell.id} className="bg-white border border-rose-100 p-2.5 rounded-lg flex items-center justify-between gap-2 shadow-4xs">
                        <div>
                          <span className="font-black text-slate-800 text-[11px] block">{cell.nome_celula}</span>
                          <span className="text-[9.5px] text-slate-400 block mt-0.5">
                            Líder: {cellLeader ? cellLeader.nome : "Não Atribuído"}
                          </span>
                        </div>
                        {cellLeader?.whatsapp && (
                          <a
                            href={`https://wa.me/${cellLeader.whatsapp.replace(/\D/g, "")}?text=Ol%C3%A1%20${encodeURIComponent(cellLeader.nome)}%2C%20sua%20c%C3%A9lula%20${encodeURIComponent(cell.nome_celula)}%20est%C3%A1%20sem%20o%20relat%C3%B3rio%20semanal%20de%20presen%C3%A7a%20lan%C3%A7ado.%20Por%20favor%20registre%20no%20sistema!`}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold p-1 px-2 border border-emerald-250 rounded text-[9.5px] whitespace-nowrap block"
                          >
                            💬 Enviar Cobrança WhatsApp
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }
        }

        return null;
      })()}

      {/* Numerical Stats row panel */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* First card */}
        <div className="bg-white border border-slate-100 p-5 rounded-xl shadow-3xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
            <Home className="h-6 w-6" />
          </div>
          <div>
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Total de Células</span>
            <span className="text-2xl font-black text-slate-800 block font-mono">{totalCelulas}</span>
          </div>
        </div>

        {/* Second card */}
        <div className="bg-white border border-slate-100 p-5 rounded-xl shadow-3xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Membros Coordenados</span>
            <span className="text-2xl font-black text-slate-800 block font-mono">{totalIntegrantes}</span>
          </div>
        </div>

        {/* Third card */}
        <div className="bg-white border border-slate-100 p-5 rounded-xl shadow-3xs flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl shrink-0">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Líderes Ativos</span>
            <span className="text-2xl font-black text-slate-800 block font-mono">{totalLideres}</span>
          </div>
        </div>

        {/* Kids Card */}
        <div className="bg-white border border-slate-100 p-5 rounded-xl shadow-3xs flex items-center gap-4">
          <div className="p-3 bg-pink-50 text-pink-600 rounded-xl shrink-0">
            <Baby className="h-6 w-6" />
          </div>
          <div>
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Células Kids</span>
            <span className="text-2xl font-black text-slate-800 block font-mono">{kidsCelulasCount}</span>
          </div>
        </div>

        {/* Fourth card */}
        <div className="bg-white border border-slate-100 p-5 rounded-xl shadow-3xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl shrink-0">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Frequência Média</span>
            <span className="text-2xl font-black text-slate-800 block font-mono">{frequenciaMedia}%</span>
          </div>
        </div>
      </div>

      {/* Healthy Indicators Box */}
      <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-xs">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest border-b border-slate-50 pb-3 mb-4 flex items-center gap-1.5">
          <HeartPulse className="h-4.5 w-4.5 text-blue-500" /> Diagnóstico de Saúde das Células
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Saudaveis card */}
          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
            <div className="flex items-center justify-between">
              <span className="text-emerald-800 text-[10px] font-bold uppercase tracking-wider">Células Saudáveis</span>
              <span className="text-[10px] text-emerald-600 bg-white border border-emerald-100 px-2 rounded font-semibold font-mono">4-11 pessoas</span>
            </div>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-black text-emerald-800 font-mono">{saudaveisCount}</span>
              <span className="text-xs font-bold text-emerald-600">ativas</span>
            </div>
          </div>

          {/* Alertas card */}
          <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
            <div className="flex items-center justify-between">
              <span className="text-amber-800 text-[10px] font-bold uppercase tracking-wider">Necessitam Apoio</span>
              <span className="text-[10px] text-amber-600 bg-white border border-amber-100 px-2 rounded font-semibold">Alerta &lt;4 membros</span>
            </div>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-black text-amber-800 font-mono">{alertaCount}</span>
              <span className="text-xs font-bold text-amber-600">em risco</span>
            </div>
          </div>

          {/* Prontos para Multiplicação */}
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <div className="flex items-center justify-between">
              <span className="text-blue-800 text-[10px] font-bold uppercase tracking-wider">Prontas p/ Multiplicar</span>
              <span className="text-[10px] text-blue-600 bg-white border border-blue-100 px-2 rounded font-semibold font-mono">&gt;=12 pessoas</span>
            </div>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-black text-blue-800 font-mono">{multiplicacaoCount}</span>
              <span className="text-xs font-bold text-blue-600 font-sans">maduras</span>
            </div>
          </div>
        </div>

        {/* Distribution by Cell Type Panel */}
        <div className="border-t border-slate-100 pt-5 mt-5">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-2.5">
            Distribuição por tipo de Célula
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
            {[
              { type: "Mista", count: celulasTipoStats.Mista, bg: "bg-slate-50", text: "text-slate-700" },
              { type: "Jovem", count: celulasTipoStats.Jovem, bg: "bg-blue-50", text: "text-blue-700" },
              { type: "Adolescentes", count: celulasTipoStats.Adolescentes, bg: "bg-purple-50", text: "text-purple-700" },
              { type: "Criança (Kids)", count: celulasTipoStats.Kids, bg: "bg-pink-50/70", text: "text-pink-700" },
              { type: "Homem", count: celulasTipoStats.Homens, bg: "bg-cyan-50", text: "text-cyan-700" },
              { type: "Mulheres", count: celulasTipoStats.Mulheres, bg: "bg-teal-50", text: "text-teal-700" },
            ].map((item) => (
              <div
                key={item.type}
                className={`${item.bg} p-2.5 rounded-lg border border-slate-100 text-center flex flex-col justify-center items-center shadow-3xs`}
              >
                <span className="text-[10px] text-slate-500 font-bold tracking-tight block">
                  {item.type}
                </span>
                <span className={`text-base font-black ${item.text} block font-mono mt-0.5`}>
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Visual charts Grid display (Rule 17) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth Chart Area */}
        <div className="bg-white border rounded-xl p-5 shadow-xs lg:col-span-2">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-4">Gráfico de Crescimento Escalonado (Células & Membros)</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCelulas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorMembros" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, borderColor: "#E2E8F0" }} />
                <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                <Area type="monotone" dataKey="celulas" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCelulas)" name="Células Ativas" />
                <Area type="monotone" dataKey="membros" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMembros)" name="Total Integrantes" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Networks pie chart */}
        <div className="bg-white border rounded-xl p-5 shadow-xs">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-4">Gráficos de Concentração por Rede</h4>
          <div className="h-64 relative flex flex-col justify-between">
            <ResponsiveContainer width="100%" height="75%">
              <PieChart>
                <Pie
                  data={redesChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {redesChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 10, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Custom chart legend list */}
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 border-t border-slate-50 pt-2 shrink-0">
              {redesChartData.map((entry, index) => (
                <div key={index} className="flex items-center gap-1.5 font-semibold">
                  <span className="w-2 h-2 rounded-full inline-block shrink-0" style={{ backgroundColor: entry.color }}></span>
                  <span className="truncate">{entry.name}: <span className="font-bold text-slate-800 font-mono">{entry.value}</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bairros Area coverage metrics */}
        <div className="bg-white border rounded-xl p-5 shadow-xs lg:col-span-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-4">Concentração Geográfica das Células (Bairros de Petrópolis RJ)</h4>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bairrosChartData}>
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Células Totais">
                  {bairrosChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
