import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, ArrowLeft, ArrowRight, Check, CornerDownLeft, LogIn, UserPlus } from "lucide-react";
import supabase from "../../utils/supabase";

// --- CONFIGURAÇÕES E MÁSCARAS (Mantendo seu original) ---
const STEPS = [
  { key: "email", label: "Email", required: true },
  { key: "password", label: "Senha", required: true },
  { key: "name", label: "Nome", required: false },
  { key: "cpf", label: "CPF", required: false },
  { key: "cep", label: "CEP", required: false },
  { key: "birthdate", label: "Data de Nascimento", required: true },
  { key: "gender", label: "Sexo", required: true },
  { key: "race", label: "Cor e Raça", required: true },
] as const;

const GENDER_OPTIONS = ["Masculino", "Feminino", "Não-binário"];
const RACE_OPTIONS = ["Parda", "Preta", "Branca", "Indígena", "Amarela"];

function maskCPF(v: string) { return v.replace(/\D/g, "").slice(0, 11).replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2"); }
function maskCEP(v: string) { return v.replace(/\D/g, "").slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2"); }

// --- COMPONENTE DE BOTÃO MAGNÉTICO (Seu original) ---
const MagneticButton = ({ children, onClick, disabled, variant = "primary", className = "", type = "button" }: any) => {
  const ref = useRef<HTMLButtonElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (disabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width / 2)) * 0.25;
    const dy = (e.clientY - (rect.top + rect.height / 2)) * 0.25;
    setOffset({ x: dx, y: dy });
  }, [disabled]);
  const base = variant === "primary" ? "bg-gradient-to-r from-[#E80070] to-[#C1188B] text-white shadow-lg shadow-[#E80070]/30" : "bg-white/10 border border-white/30 text-white/90 hover:bg-white/20";
  return (
    <button type={type} ref={ref} onClick={onClick} disabled={disabled} onMouseMove={handleMouseMove} onMouseLeave={() => setOffset({ x: 0, y: 0 })}
      className={`px-6 py-3 rounded-xl font-semibold transition-all duration-150 active:scale-95 disabled:opacity-40 flex items-center gap-2 ${base} ${className}`}
      style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
    >{children}</button>
  );
};

const Auth = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(-1); // -1 será a nossa tela de LOGIN
  const [showPassword, setShowPassword] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "", name: "", cpf: "", cep: "", birthdate: "", gender: "", race: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (key: string, value: string) => {
    let v = value;
    if (key === "cpf") v = maskCPF(value);
    if (key === "cep") v = maskCEP(value);
    setFormData((prev) => ({ ...prev, [key]: v }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  // --- LÓGICA DE LOGIN ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });
    if (error) {
      toast({ title: "Erro", description: "Login inválido: " + error.message, variant: "destructive" });
    } else {
      toast({ title: "Bem-vindo!", description: "Login realizado." });
      navigate("/dash");
    }
    setIsLoading(false);
  };

  // --- LÓGICA DE CADASTRO (Seu original adaptado) ---
  const handleNextStep = async () => {
    // Validação simples
    const currentStep = STEPS[step];
    if (currentStep?.required && !formData[currentStep.key as keyof typeof formData]) {
        setErrors({ [currentStep.key]: "Campo obrigatório" });
        return;
    }

    if (step < STEPS.length - 1) {
      setAnimating(true);
      setTimeout(() => { setStep(step + 1); setAnimating(false); }, 300);
    } else {
      setIsLoading(true);
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: { full_name: formData.name, cpf: formData.cpf, gender: formData.gender, race: formData.race } }
      });
      if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
      else {
        toast({ title: "Sucesso!", description: "Cadastro realizado." });
        navigate("/dash");
      }
      setIsLoading(false);
    }
  };

  const inputClass = "w-full bg-white/10 border border-white/25 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:ring-2 focus:ring-[#E80070] outline-none transition-all";

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 relative overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0 auth-gradient-bg opacity-50" />
      
      <div className="relative z-10 w-full max-w-md mx-4 transition-all duration-500">
        <div className="backdrop-blur-xl bg-white/[0.08] border border-white/20 rounded-3xl p-8 shadow-2xl">
          
          {step === -1 ? (
            /* --- TELA DE LOGIN --- */
            <div className="animate-in fade-in zoom-in-95 duration-500">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Acessar</h1>
                <p className="text-white/50">Bem-vindo de volta!</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <input type="email" placeholder="Email" className={inputClass} required
                  value={formData.email} onChange={(e) => updateField("email", e.target.value)} />
                
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} placeholder="Senha" className={inputClass} required
                    value={formData.password} onChange={(e) => updateField("password", e.target.value)} />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <MagneticButton type="submit" className="w-full justify-center" disabled={isLoading}>
                  {isLoading ? "Entrando..." : <><LogIn size={18}/> Entrar</>}
                </MagneticButton>
              </form>

              <div className="mt-6 pt-6 border-t border-white/10 text-center">
                <button onClick={() => setStep(0)} className="text-white/50 hover:text-[#E80070] transition-colors flex items-center justify-center gap-2 w-full">
                  Não tem conta? <strong className="text-white">Cadastre-se aqui</strong> <UserPlus size={16}/>
                </button>
              </div>
            </div>
          ) : (
            /* --- TELA DE CADASTRO (O SEU MULTI-STEP) --- */
            <div className={`transition-all duration-300 ${animating ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"}`}>
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-white">Criar Conta</h2>
                <p className="text-white/40 text-sm">Passo {step + 1} de {STEPS.length}</p>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1 bg-white/10 rounded-full mb-8 overflow-hidden">
                <div className="h-full bg-[#E80070] transition-all duration-500" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
              </div>

              <div className="min-h-[120px]">
                <label className="block text-white/70 text-sm mb-2">{STEPS[step].label}</label>
                {/* Renderização dinâmica baseada no seu código original */}
                {STEPS[step].key === "gender" ? (
                    <div className="flex flex-col gap-2">
                        {GENDER_OPTIONS.map(opt => (
                            <button key={opt} onClick={() => updateField("gender", opt)} 
                                className={`p-3 rounded-xl border text-left transition-all ${formData.gender === opt ? "bg-[#E80070]/20 border-[#E80070] text-white" : "bg-white/5 border-white/10 text-white/60"}`}>
                                {opt}
                            </button>
                        ))}
                    </div>
                ) : STEPS[step].key === "race" ? (
                    <div className="flex flex-col gap-2">
                        {RACE_OPTIONS.map(opt => (
                            <button key={opt} onClick={() => updateField("race", opt)} 
                                className={`p-3 rounded-xl border text-left transition-all ${formData.race === opt ? "bg-[#E80070]/20 border-[#E80070] text-white" : "bg-white/5 border-white/10 text-white/60"}`}>
                                {opt}
                            </button>
                        ))}
                    </div>
                ) : (
                    <input 
                        type={STEPS[step].key === "password" ? (showPassword ? "text" : "password") : STEPS[step].key === "birthdate" ? "date" : "text"}
                        className={inputClass}
                        autoFocus
                        value={(formData as any)[STEPS[step].key]}
                        onChange={(e) => updateField(STEPS[step].key, e.target.value)}
                    />
                )}
                {errors[STEPS[step].key] && <p className="text-[#E80070] text-xs mt-2">{errors[STEPS[step].key]}</p>}
              </div>

              <div className="flex gap-3 mt-8">
                <MagneticButton variant="secondary" onClick={() => step === 0 ? setStep(-1) : setStep(step - 1)}>
                   <ArrowLeft size={18}/> {step === 0 ? "Login" : "Voltar"}
                </MagneticButton>
                <MagneticButton className="flex-1 justify-center" onClick={handleNextStep} disabled={isLoading}>
                   {step === STEPS.length - 1 ? <><Check size={18}/> Finalizar</> : <><ArrowRight size={18}/> Próximo</>}
                </MagneticButton>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Auth;

