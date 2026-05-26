/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Igreja, Cargo, Rede } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { 
  Check, 
  Sparkles, 
  Building, 
  User, 
  Mail, 
  Lock, 
  Phone, 
  MapPin, 
  CreditCard, 
  QrCode, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Calendar, 
  AlertCircle,
  Copy,
  Info
} from "lucide-react";

interface SGCSaasSubscriptionWizardProps {
  onAddIgreja: (newChurch: Partial<Igreja>, presidentName: string, presidentEmail: string, senha?: string) => string | void;
  onAutoLogin: (email: string) => void;
  onClose: () => void;
}

interface Plan {
  id: "Bronze" | "Prata" | "Ouro" | "Master";
  name: string;
  price: number;
  originalPrice: number;
  maxCells: number;
  maxUsers: number;
  features: string[];
  badge?: string;
  color: string;
}

const PLANS: Plan[] = [
  {
    id: "Bronze",
    name: "Plano Bronze",
    price: 149,
    originalPrice: 199,
    maxCells: 10,
    maxUsers: 50,
    color: "from-amber-600 to-amber-700",
    features: [
      "Até 10 Células ativas",
      "Até 50 Membros registrados",
      "Relatórios Semanais Dinâmicos",
      "Controle de Presença Básico",
      "Mapa de Localização de Células",
      "Controle de Cargos da Igreja"
    ]
  },
  {
    id: "Prata",
    name: "Plano Prata",
    price: 299,
    originalPrice: 399,
    maxCells: 30,
    maxUsers: 150,
    badge: "Mais Popular",
    color: "from-slate-400 to-slate-500",
    features: [
      "Até 30 Células ativas",
      "Até 150 Membros registrados",
      "Tudo do Plano Bronze",
      "Alertas Inteligentes de Frequência",
      "Alertas de Sugestão de Multiplicação",
      "Filtros Geográficos Inteligentes"
    ]
  },
  {
    id: "Ouro",
    name: "Plano Ouro",
    price: 599,
    originalPrice: 799,
    maxCells: 100,
    maxUsers: 500,
    badge: "Crescimento Ágil",
    color: "from-yellow-500 to-yellow-600",
    features: [
      "Até 100 Células ativas",
      "Até 500 Membros registrados",
      "Tudo do Plano Prata",
      "Organograma Completo de Cobertura",
      "Sugestões Automáticas de Promoções",
      "Dashboard de Metas e Crescimento"
    ]
  },
  {
    id: "Master",
    name: "Plano Master",
    price: 999,
    originalPrice: 1299,
    maxCells: 300,
    maxUsers: 1500,
    badge: "Solução Ministerial",
    color: "from-indigo-600 to-indigo-700",
    features: [
      "Até 300 Células ativas",
      "Até 1500 Membros registrados",
      "Tudo do Plano Ouro",
      "Downloads Gerais XLS / PDF",
      "Múltiplos Administradores Compartilhados",
      "Prioridade Máxima em suporte 24/7"
    ]
  }
];

export default function SGCSaasSubscriptionWizard({
  onAddIgreja,
  onAutoLogin,
  onClose,
}: SGCSaasSubscriptionWizardProps) {
  const [step, setStep] = useState<number>(1);
  const [selectedPlan, setSelectedPlan] = useState<Plan>(PLANS[1]); // Default Prata
  
  // Registration Form States
  const [nomeIgreja, setNomeIgreja] = useState("");
  const [cidade, setCidade] = useState("Petrópolis");
  const [pastorPresidente, setPastorPresidente] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [telefone, setTelefone] = useState("");

  // Payment Form States
  const [paymentMethod, setPaymentMethod] = useState<"card" | "pix">("pix");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  // Loading / Success Animation states
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const pixCode = "00020101021226930014br.gov.bcb.pix2571pix.saas.promptmaster.com/invoice/9934125893475105201105030245204000053039865405" + (selectedPlan.price) + "005802BR5925PromptMasterCelulasSaaS6009Petropolis62070503SGC6304ED5A";

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleNextStep = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (!nomeIgreja || !pastorPresidente || !email || !senha) {
        alert("Por favor, preencha todos os campos obrigatórios (*).");
        return;
      }
      setStep(3);
    }
  };

  const handleBackStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleCompleteSubscription = () => {
    setIsProcessing(true);
    
    // Simulate API delay for premium high-fidelity look
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      
      // Call mutation to register the new church & Pastor
      onAddIgreja(
        {
          nome: nomeIgreja,
          logo: "⛪",
          cidade,
          estado: "RJ",
          pastor_presidente: pastorPresidente,
          telefone,
          email,
          plano: selectedPlan.id,
          status: "Ativa",
          quantidade_maxima_usuarios: selectedPlan.maxUsers,
          quantidade_maxima_celulas: selectedPlan.maxCells,
          data_vencimento: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Annual
        },
        pastorPresidente,
        email,
        senha
      );

      // Auto login the new pastor president after a small delay
      setTimeout(() => {
        onAutoLogin(email);
      }, 2500);

    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto font-sans" id="saas_subscription_wizard">
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full overflow-hidden border border-slate-100 flex flex-col md:flex-row min-h-[600px] animate-fadeIn">
        
        {/* Left Side: Summary Panel */}
        <div className="bg-slate-950 text-white p-8 md:w-80 shrink-0 flex flex-col justify-between relative overflow-hidden">
          {/* Decorative ambient gradient */}
          <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-radial from-blue-500/10 to-transparent pointer-events-none"></div>
          
          <div className="relative z-10 space-y-6">
            <div>
              <span className="p-1 px-2.5 bg-blue-500/20 text-blue-300 rounded-full font-bold text-[9px] uppercase tracking-widest font-mono inline-block">
                SaaS Onboarding
              </span>
              <h2 className="text-xl font-black tracking-tight mt-2 text-white">Prompt Master Celular</h2>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Você está a poucos passos de implantar o ecossistema líder de gestão e multiplicação de células na sua igreja.
              </p>
            </div>

            {/* Stepper visual state */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step >= 1 ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400"
                }`}>
                  {step > 1 ? <Check className="h-3 w-3" /> : "1"}
                </div>
                <div>
                  <span className="text-xs font-bold block text-slate-200">Escolha o Plano</span>
                  <span className="text-[10px] text-slate-500 block">Capacidade ideal</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step >= 2 ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400"
                }`}>
                  {step > 2 ? <Check className="h-3 w-3" /> : "2"}
                </div>
                <div>
                  <span className="text-xs font-bold block text-slate-200">Cadastro da Igreja</span>
                  <span className="text-[10px] text-slate-500 block">Dados & Pastor Presidente</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step >= 3 ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400"
                }`}>
                  3
                </div>
                <div>
                  <span className="text-xs font-bold block text-slate-200">Simulação e Ativação</span>
                  <span className="text-[10px] text-slate-500 block">Gateway de Pagamento</span>
                </div>
              </div>
            </div>
          </div>

          {/* Plan Selected Summary */}
          <div className="relative z-10 bg-slate-900 border border-slate-800 p-4 rounded-2xl block mt-8 space-y-3">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Plano Selecionado</span>
            
            <div className="flex justify-between items-center">
              <span className={`text-xs font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${selectedPlan.color}`}>
                {selectedPlan.name}
              </span>
              <span className="text-sm font-black text-white font-mono">
                R$ {selectedPlan.price}/mês
              </span>
            </div>

            <div className="text-[10px] text-slate-400 font-semibold space-y-1 pt-2 border-t border-slate-800/80">
              <div className="flex justify-between">
                <span>Período de Testes:</span>
                <span className="text-teal-400 font-black">7 Dias Grátis 🎁</span>
              </div>
              <div className="flex justify-between">
                <span>Cobrança pós teste:</span>
                <span className="text-white font-bold">R$ {selectedPlan.price},00/mês</span>
              </div>
              <div className="flex justify-between border-t border-slate-800/50 pt-1 mt-1">
                <span>Células Inclusas:</span>
                <span className="text-white font-bold">{selectedPlan.maxCells}</span>
              </div>
              <div className="flex justify-between">
                <span>Limite de Membros:</span>
                <span className="text-white font-bold">{selectedPlan.maxUsers}</span>
              </div>
            </div>
          </div>

          {/* Legal notes */}
          <div className="text-[9px] text-slate-500 mt-6 relative z-10 leading-relaxed font-semibold">
            🛡️ Transação demo criptografada. Nenhum valor real será debitado do seu cartão or saldo PIX.
          </div>
        </div>

        {/* Right Side: Active Wizard Content */}
        <div className="flex-1 p-8 flex flex-col justify-between bg-slate-50/50">
          
          <AnimatePresence mode="wait">
            {/* Step 1: Tariffs list */}
            {step === 1 && !isSuccess && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-slate-800">Escolha o tamanho do seu projeto</h3>
                    <button
                      onClick={onClose}
                      className="text-xs font-bold text-slate-400 hover:text-slate-600"
                    >
                      Voltar ao Login
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">Selecione o plano ideal para as dimensões de células e redes da sua igreja.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[380px] overflow-y-auto pr-1">
                  {PLANS.map((plan) => {
                    const isSelected = selectedPlan.id === plan.id;
                    return (
                      <div
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan)}
                        className={`border rounded-2xl p-4 cursor-pointer transition-all flex flex-col justify-between relative ${
                          isSelected 
                            ? "bg-white border-blue-600 shadow-md ring-2 ring-blue-600/10" 
                            : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs"
                        }`}
                      >
                        {plan.badge && (
                          <span className="absolute top-2 right-2 bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider">
                            {plan.badge}
                          </span>
                        )}

                        <div className="space-y-1">
                          <span className="text-slate-400 text-[10px] font-extrabold uppercase tracking-widest block">Nível</span>
                          <h4 className="text-sm font-black text-slate-800">{plan.name}</h4>
                          <span className="text-slate-400 line-through text-[10.5px] font-mono block">R$ {plan.originalPrice},00/mês</span>
                          <span className="text-xl font-black text-blue-600 font-mono mt-0.5 block">
                            R$ {plan.price}
                            <span className="text-slate-400 text-[11px] font-medium font-sans"> / mês</span>
                          </span>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 space-y-1">
                          <p className="text-[10px] text-slate-500 font-semibold flex items-center gap-1.5">
                            <span className="text-emerald-500 font-bold">✔</span> Limite: {plan.maxCells} Células
                          </p>
                          <p className="text-[10px] text-slate-500 font-semibold flex items-center gap-1.5">
                            <span className="text-emerald-500 font-bold">✔</span> Limite: {plan.maxUsers} Membros
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Plan detail summary review */}
                <div className="bg-slate-100/50 p-4 rounded-xl border border-slate-250 flex items-start gap-2 text-[11px] text-slate-600">
                  <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <p className="leading-normal">
                    Todos os planos incluem implantação inicial, suporte técnico via email e atualizações automáticas de novas regras ministeriais e relatórios. Você pode migrar de plano a qualquer momento no futuro.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 2: Church & Pastor registration */}
            {step === 2 && !isSuccess && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-lg font-black text-slate-800">Diga-nos sobre sua comunidade</h3>
                  <p className="text-xs text-slate-500">Insira as informações da sua congregação e defina a senha do Pastor Presidente.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Nome da Igreja / Congregação *
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="Ex: Videira Petrópolis"
                        value={nomeIgreja}
                        onChange={(e) => setNomeIgreja(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 pl-9 outline-none font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Pastor Presidente *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="Nome completo do Pastor"
                        value={pastorPresidente}
                        onChange={(e) => setPastorPresidente(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 pl-9 outline-none font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Cidade Sede *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="Ex: Petrópolis"
                        value={cidade}
                        onChange={(e) => setCidade(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 pl-9 outline-none font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Telefone da Secretaria
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Ex: (24) 99888-7766"
                        value={telefone}
                        onChange={(e) => setTelefone(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2.5 pl-9 outline-none font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <div className="bg-slate-150 p-3 rounded-xl border border-dashed border-slate-300 flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
                      <span className="text-[10px] text-slate-600 leading-normal font-semibold">
                        Abaixo, defina o e-mail e a senha de login do Pastor Presidente. Esse será o usuário administrador master da congregação!
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          E-mail de Acesso (Login) *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                          <input
                            type="email"
                            required
                            placeholder="pastor@igreja.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl p-2.5 pl-9 outline-none font-bold"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          Senha de Acesso *
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                          <input
                            type="password"
                            required
                            placeholder="Mínimo 4 caracteres"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl p-2.5 pl-9 outline-none font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Fast billing checkout checkout */}
            {step === 3 && !isSuccess && !isProcessing && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-lg font-black text-slate-800">Ativação da Assinatura</h3>
                  <p className="text-xs text-slate-500">Escolha o método para simular o faturamento mensal recorrente de R$ {selectedPlan.price},00.</p>
                </div>

                {/* Tab layout switch card/pix */}
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("pix")}
                    className={`flex-1 p-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      paymentMethod === "pix" ? "bg-white shadow-3xs text-slate-800" : "text-slate-500"
                    }`}
                  >
                    <QrCode className="h-4 w-4 text-teal-600" />
                    <span>PIX Instantâneo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`flex-1 p-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      paymentMethod === "card" ? "bg-white shadow-3xs text-slate-800" : "text-slate-500"
                    }`}
                  >
                    <CreditCard className="h-4 w-4 text-blue-600" />
                    <span>Cartão de Crédito</span>
                  </button>
                </div>

                {paymentMethod === "pix" ? (
                  <div className="bg-white border rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center animate-fadeIn text-xs w-full overflow-hidden font-sans">
                    <div className="bg-slate-100 p-2.5 rounded-xl block shrink-0 border border-slate-250">
                      {/* Fake stylized QR code */}
                      <div className="w-24 h-24 bg-slate-200 flex flex-col items-center justify-center relative rounded border border-slate-300">
                        <QrCode className="h-16 w-16 text-slate-800 opacity-80" />
                        <span className="text-[6.5px] font-mono text-center font-bold px-1 bg-teal-500 text-white rounded absolute bottom-1">
                          PIX DEMO ASSEMBLEIA
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 flex-1 w-full overflow-hidden">
                      <h4 className="font-bold text-teal-700 flex items-center gap-1.5">
                        <span>Pague com PIX para ativar após o teste</span>
                        <span className="bg-teal-50 text-teal-700 text-[8px] font-black p-0.5 px-1 rounded border border-teal-200 uppercase">7 dias grátis</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-normal font-semibold">
                        Aponte a câmera para o QR Code ou copie o código PIX abaixo. O faturamento começará a contar somente após o término dos 7 dias de teste grátis!
                      </p>
                      
                      <div className="flex flex-col sm:flex-row gap-2 bg-slate-50 border border-slate-200 p-2 rounded-xl items-center font-mono text-[9px] w-full overflow-hidden">
                        <span className="break-all flex-1 text-slate-500 font-mono text-center sm:text-left select-all px-1 max-w-full">{pixCode}</span>
                        <button
                          type="button"
                          onClick={handleCopyPix}
                          className="bg-indigo-600 hover:bg-indigo-700 font-sans font-bold text-white px-3 py-2 rounded-lg text-[9px] cursor-pointer shrink-0 inline-flex items-center gap-1 self-stretch sm:self-auto justify-center"
                        >
                          <Copy className="h-3 w-3" />
                          <span className="whitespace-nowrap">{isCopied ? "Copiado!" : "Copiar Chave PIX"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border rounded-2xl p-4 gap-4 animate-fadeIn text-xs space-y-3">
                    <h4 className="font-bold text-slate-700">Dados do Cartão Simulador</h4>
                    
                    <div className="space-y-2 font-sans">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Número do Cartão</label>
                        <input
                          type="text"
                          placeholder="4000 1234 5678 9010"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').substring(0, 16))}
                          className="w-full bg-slate-50 border rounded-xl p-2 font-mono font-bold"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Validade</label>
                          <input
                            type="text"
                            placeholder="MM/AA"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value.substring(0, 5))}
                            className="w-full bg-slate-50 border rounded-xl p-2 font-mono font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">CVV</label>
                          <input
                            type="password"
                            placeholder="123"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                            className="w-full bg-slate-50 border rounded-xl p-2 font-mono font-bold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Titular do Cartão</label>
                        <input
                          type="text"
                          placeholder="Insira o nome do titular"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 text-amber-900 text-[11px] flex gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="leading-snug">
                    <strong>Ponto de Demonstração SaaS:</strong> Não é consumido dinheiro real. O simulador aprovará qualquer cartão ou código de cópia PIX instantaneamente para liberar seu acesso!
                  </p>
                </div>
              </motion.div>
            )}

            {/* Simulated Loading Gateway State */}
            {isProcessing && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center p-8 space-y-4 text-center min-h-[300px]"
              >
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-sm">Autenticando transação bancária...</h4>
                  <p className="text-xs text-slate-400 mt-1">Conectando ao gateway de pagamento Stripe / PIX...</p>
                </div>
                <div className="p-3 bg-slate-100 rounded-lg max-w-[280px] w-full border text-[10px] font-mono text-slate-500 text-left space-y-1">
                  <div>GET /v1/payment_intents ... OK 200</div>
                  <div>VERIFYING webhook ... RECEIVED</div>
                  <div>PROVISIONING tenancy code "{nomeIgreja.toLowerCase().replace(/\s+/g, '-')}"</div>
                </div>
              </motion.div>
            )}

            {/* Success celebrate onboarding screen */}
            {isSuccess && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center p-8 space-y-4 text-center min-h-[350px]"
              >
                <div className="p-4 bg-emerald-100 text-emerald-600 rounded-full shadow-inner animate-pulse">
                  <ShieldCheck className="h-10 w-10 text-emerald-600" />
                </div>
                <div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 p-1 px-2.5 font-bold rounded-full uppercase tracking-wider">
                    Assinatura Confirmada! 🎉
                  </span>
                  <h3 className="text-base font-black text-slate-800 mt-3">Sua igreja foi registrada com sucesso!</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                    A congregação <strong>{nomeIgreja}</strong> já está ativa na nossa nuvem. Inicializamos o seu painel de controle e geramos duas redes celulares (Vermelha e Azul) para agilizar o setup!
                  </p>
                </div>

                <div className="bg-slate-50 border p-4 rounded-2xl w-full max-w-xs text-xs space-y-1.5 text-left font-sans">
                  <div className="flex justify-between border-b pb-1.5 mb-1.5">
                    <span className="font-bold text-slate-400">Administrador</span>
                    <span className="font-bold text-slate-700">{pastorPresidente}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-400">ID da Igreja</span>
                    <span className="font-mono text-slate-700">ch-gen-{nomeIgreja.substring(0,3).toLowerCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-400">Senha Padrão</span>
                    <span className="font-bold text-blue-600">Sua senha salva</span>
                  </div>
                </div>

                <div className="text-[10.5px] text-slate-400 flex items-center justify-center gap-1.5 animate-pulse mt-4 font-bold">
                  <span className="w-2 h-2 bg-blue-600 rounded-full animate-ping"></span>
                  <span>Inicializando workspace pastoral e efetuando login automático...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Controls Button Bar */}
          {!isProcessing && !isSuccess && (
            <div className="flex justify-between items-center border-t border-slate-200/60 pt-4 mt-6">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBackStep}
                  className="p-2.5 px-4 rounded-xl hover:bg-slate-100 text-slate-600 text-xs font-bold transition flex items-center gap-1 border border-slate-200 shrink-0 cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Anterior</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2.5 px-4 rounded-xl hover:bg-slate-100 text-slate-500 text-xs font-bold transition border border-slate-200 shrink-0 cursor-pointer"
                >
                  Voltar ao Login
                </button>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="p-2.5 px-4 bg-slate-900 border border-slate-950 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 hover:bg-slate-800 cursor-pointer shrink-0 shadow-sm"
                  id="wizard_btn_next"
                >
                  <span>Continuar</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCompleteSubscription}
                  className="p-3 px-5 bg-indigo-600 border border-indigo-700 text-white rounded-xl text-xs font-sans font-black transition flex items-center gap-1 hover:bg-indigo-700 cursor-pointer shrink-0 shadow-md animate-pulse"
                  id="wizard_btn_complete"
                >
                  <span>Ativar Assinatura & Entrar 🚀</span>
                </button>
              )}
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
