import React, { useState } from "react";
import { X, User, Shield, Phone, Mail, Award, Landmark, Palette, Image as ImageIcon, Check } from "lucide-react";
import { Usuario, Igreja } from "../types";

interface SGCProfileEditModalProps {
  currentUser: Usuario;
  activeChurch: Igreja | null;
  onUpdateUser: (userId: string, fields: Partial<Usuario>) => void;
  onUpdateIgreja: (churchId: string, fields: Partial<Igreja>) => void;
  onClose: () => void;
}

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
];

const PRESET_CHURCH_LOGOS = ["⛪", "🍇", "🔥", "🦅", "⭐", "🕊️", "🛡️", "👑"];

const PRESET_COLORS = [
  { name: "Principal (Azul)", value: "#2563EB" },
  { name: "Crescimento (Verde)", value: "#16A34A" },
  { name: "Paixão (Vermelho)", value: "#DC2626" },
  { name: "Real (Roxo)", value: "#8B5CF6" },
  { name: "Aliança (Ciano)", value: "#0D9488" },
  { name: "Fogo (Laranja)", value: "#EA580C" },
];

export default function SGCProfileEditModal({
  currentUser,
  activeChurch,
  onUpdateUser,
  onUpdateIgreja,
  onClose,
}: SGCProfileEditModalProps) {
  const [activeTab, setActiveTab] = useState<"perfil" | "igreja">("perfil");

  // User States
  const [nome, setNome] = useState(currentUser.nome);
  const [telefone, setTelefone] = useState(currentUser.telefone || "");
  const [email, setEmail] = useState(currentUser.email);
  const [foto, setFoto] = useState(currentUser.foto || "");
  const [isSimulatingUpload, setIsSimulatingUpload] = useState(false);

  // Church States (optional based on whether they have a church)
  const [igrejaNome, setIgrejaNome] = useState(activeChurch?.nome || "");
  const [igrejaLogo, setIgrejaLogo] = useState(activeChurch?.logo || "⛪");
  const [igrejaCor, setIgrejaCor] = useState(activeChurch?.corPrincipal || "#2563EB");
  const [igrejaTelefone, setIgrejaTelefone] = useState(activeChurch?.telefone || "");
  const [igrejaCidade, setIgrejaCidade] = useState(activeChurch?.cidade || "");
  const [isSimulatingChurchUpload, setIsSimulatingChurchUpload] = useState(false);

  const triggerFakeChurchUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsSimulatingChurchUpload(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setTimeout(() => {
          setIgrejaLogo(reader.result as string);
          setIsSimulatingChurchUpload(false);
        }, 900);
      };
      reader.readAsDataURL(file);
    }
  };

  // Success animation states
  const [userSaved, setUserSaved] = useState(false);
  const [churchSaved, setChurchSaved] = useState(false);

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser(currentUser.id, {
      nome,
      telefone,
      email,
      foto,
    });
    setUserSaved(true);
    setTimeout(() => {
      setUserSaved(false);
    }, 2000);
  };

  const handleSaveIgreja = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeChurch) {
      onUpdateIgreja(activeChurch.id, {
        nome: igrejaNome,
        logo: igrejaLogo,
        corPrincipal: igrejaCor,
        telefone: igrejaTelefone,
        cidade: igrejaCidade,
      });
      setChurchSaved(true);
      setTimeout(() => {
        setChurchSaved(false);
      }, 2000);
    }
  };

  // Simulate local photo file upload
  const triggerFakeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsSimulatingUpload(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        // Use reader result as photo
        setTimeout(() => {
          setFoto(reader.result as string);
          setIsSimulatingUpload(false);
        }, 900);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 flex flex-col min-h-[500px] animate-fadeIn">
        
        {/* Header bar */}
        <div className="bg-slate-950 text-white p-5 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black tracking-tight flex items-center gap-2">
              <Shield className="h-4.5 w-4.5 text-teal-400" />
              <span>Configuração de Perfil & Identidade Visual</span>
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
              Personalização de Acesso
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition text-xs flex items-center gap-1 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
            <span>Fechar</span>
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-100 bg-slate-50/50 p-2">
          <button
            onClick={() => setActiveTab("perfil")}
            className={`flex-1 py-2 text-center text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "perfil"
                ? "bg-white text-slate-900 shadow-sm border border-slate-150"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>Meu Perfil de Liderança</span>
          </button>
          
          {activeChurch && (
            <button
              onClick={() => setActiveTab("igreja")}
              className={`flex-1 py-2 text-center text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === "igreja"
                  ? "bg-white text-slate-900 shadow-sm border border-slate-150"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Landmark className="h-3.5 w-3.5" />
              <span>Identidade da Igreja</span>
            </button>
          )}
        </div>

        {/* Mode Perfil Form */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === "perfil" ? (
            <form onSubmit={handleSaveUser} className="space-y-5">
              
              {/* Profile Photo Upload / Edit */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Foto do Perfil (Pastor / Líder)
                </label>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-4 border rounded-xl">
                  {foto ? (
                    <img
                      src={foto}
                      alt="Preview"
                      className="w-16 h-16 rounded-full object-cover ring-4 ring-white shadow-md border"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center font-black text-slate-500 text-lg border-2 border-dashed border-slate-300 shadow-inner">
                      {nome.substring(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div className="flex-1 w-full space-y-2 text-center sm:text-left">
                    <div className="flex flex-wrap justify-center sm:justify-start gap-1.5">
                      {PRESET_AVATARS.map((preset, idx) => (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => setFoto(preset)}
                          className={`w-8 h-8 rounded-full border-2 overflow-hidden transition hover:scale-105 cursor-pointer ${
                            foto === preset ? "border-indigo-600 scale-105" : "border-white shadow-xs"
                          }`}
                        >
                          <img src={preset} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 items-center">
                      <label className="bg-white hover:bg-slate-100 border text-slate-700 font-bold px-3 py-1.5 rounded-lg text-[10px] cursor-pointer inline-flex items-center gap-1.5 shadow-2xs">
                        <ImageIcon className="h-3 w-3" />
                        <span>{isSimulatingUpload ? "Enviando..." : "Fazer Upload Foto"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={triggerFakeUpload}
                          className="hidden"
                          disabled={isSimulatingUpload}
                        />
                      </label>
                      
                      <input
                        type="text"
                        placeholder="Ou digite o link URL de uma foto..."
                        value={foto.startsWith("data:") ? "" : foto}
                        onChange={(e) => setFoto(e.target.value)}
                        className="bg-white border text-[10px] px-2.5 py-1.5 rounded-lg flex-1 outline-none font-sans"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Display fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="bg-slate-50 hover:bg-slate-100/80 border p-2.5 pl-9 rounded-xl text-xs font-semibold w-full outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Telefone de Contato
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      className="bg-slate-50 hover:bg-slate-100/80 border p-2.5 pl-9 rounded-xl text-xs font-semibold w-full outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Correio Eletrônico (E-mail Login)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-50 hover:bg-slate-100/80 border p-2.5 pl-9 rounded-xl text-xs font-semibold w-full outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Cargo Eclesiástico
                </label>
                <div className="relative">
                  <Award className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    disabled
                    value={currentUser.cargo_atual}
                    className="bg-slate-100 text-slate-500 border p-2.5 pl-9 rounded-xl text-xs font-semibold w-full outline-none select-none cursor-not-allowed"
                  />
                </div>
                <span className="text-[9px] text-slate-400 leading-normal block">
                  O cargo atual só pode ser alterado através da promoção pelo organograma da congregação.
                </span>
              </div>

              {/* Call-to-actions save */}
              <div className="pt-4 border-t flex items-center justify-between">
                <div>
                  {userSaved && (
                    <span className="text-emerald-600 text-xs font-bold flex items-center gap-1 animate-pulse">
                      <Check className="h-4 w-4 shrink-0" /> Perfil atualizado com sucesso!
                    </span>
                  )}
                </div>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 border border-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs cursor-pointer shadow-sm ml-auto"
                >
                  Salvar Perfil
                </button>
              </div>

            </form>
          ) : (
            <form onSubmit={handleSaveIgreja} className="space-y-5">
              
              {/* Church Logo Icon Custom preset */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Símbolo representativo da Igreja (Logo)
                </label>

                <div className="flex items-center gap-4 bg-slate-50 p-4 border rounded-xl">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-3xl flex items-center justify-center font-bold shadow-sm shrink-0">
                    {igrejaLogo}
                  </div>

                  <div className="flex-1 space-y-2">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Escolha um EmojIcone Rápido</p>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_CHURCH_LOGOS.map((logoPreset) => (
                        <button
                          type="button"
                          key={logoPreset}
                          onClick={() => setIgrejaLogo(logoPreset)}
                          className={`w-9 h-9 text-lg rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
                            igrejaLogo === logoPreset
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-md scale-105"
                              : "bg-white hover:bg-slate-200 border-slate-200"
                          }`}
                        >
                          {logoPreset}
                        </button>
                      ))}
                    </div>

                    <input
                      type="text"
                      placeholder="Ou digite outra letra/emoji..."
                      maxLength={4}
                      value={igrejaLogo}
                      onChange={(e) => setIgrejaLogo(e.target.value)}
                      className="bg-white border text-center text-xs px-2.5 py-1.5 rounded-lg w-32 outline-none font-bold shadow-2xs mt-2"
                    />
                  </div>
                </div>
              </div>

              {/* Church main branding color */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Cor de Identidade Visual Primária (Dashboard)
                </label>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PRESET_COLORS.map((colorPreset) => (
                    <button
                      type="button"
                      key={colorPreset.value}
                      onClick={() => setIgrejaCor(colorPreset.value)}
                      className={`flex items-center gap-2 p-2 rounded-xl text-[10px] font-bold border transition text-left cursor-pointer ${
                        igrejaCor === colorPreset.value
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 border border-white/20"
                        style={{ backgroundColor: colorPreset.value }}
                      ></span>
                      <span className="truncate">{colorPreset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Church Metadata editing */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Nome da Congregação / Paróquia
                </label>
                <div className="relative">
                  <Landmark className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={igrejaNome}
                    onChange={(e) => setIgrejaNome(e.target.value)}
                    className="bg-slate-50 hover:bg-slate-100/80 border p-2.5 pl-9 rounded-xl text-xs font-semibold w-full outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Cidade
                  </label>
                  <input
                    type="text"
                    required
                    value={igrejaCidade}
                    onChange={(e) => setIgrejaCidade(e.target.value)}
                    className="bg-slate-50 hover:bg-slate-100/80 border p-2.5 rounded-xl text-xs font-semibold w-full outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    WhatsApp Comercial
                  </label>
                  <input
                    type="text"
                    value={igrejaTelefone}
                    onChange={(e) => setIgrejaTelefone(e.target.value)}
                    className="bg-slate-50 hover:bg-slate-100/80 border p-2.5 rounded-xl text-xs font-semibold w-full outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Call-to-actions save */}
              <div className="pt-4 border-t flex items-center justify-between">
                <div>
                  {churchSaved && (
                    <span className="text-emerald-600 text-xs font-bold flex items-center gap-1 animate-pulse">
                      <Check className="h-4 w-4 shrink-0" /> Identidade visual gravada com sucesso!
                    </span>
                  )}
                </div>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 border border-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs cursor-pointer shadow-sm ml-auto"
                >
                  Salvar Mudanças
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
}
