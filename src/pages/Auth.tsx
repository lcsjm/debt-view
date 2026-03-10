import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, ArrowLeft, ArrowRight, Check, LogIn, UserPlus, ShieldCheck } from "lucide-react";
import supabase from "../../utils/supabase";

// --- CONFIGURAÇÕES DOS PASSOS ---
const STEPS = [
  { key: "email", label: "Email", required: true },
  { key: "password", label: "Criar Senha", required: true },
  { key: "confirmPassword", label: "Confirmar Senha", required: true }, // Nova etapa
  { key: "name", label: "Nome Completo", required: true },
  { key: "cpf", label: "CPF", required: true },
  { key: "birthdate", label: "Data de Nascimento", required: true },
  { key: "gender", label: "Sexo", required: true },
] as const;

const GENDER_OPTIONS = ["Masculino", "Feminino", "Não-binário", "Outro"];

const Auth = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(-1); // -1 = Login
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [animating, setAnimating] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    cpf: "",
    birthdate: "",
    gender: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // --- VALIDAÇÕES DE SENHA ---
  const passwordRequirements = {
    length: formData.password.length >= 8,
    upper: /[A-Z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
  };

  const isPasswordValid = Object.values(passwordRequirements).every(Boolean);

  const updateField = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  // --- LÓGICA DE TRANSIÇÃO ---
  const goTo = (next: number) => {
    setAnimating(true);
    setTimeout(() => {
      setStep(next);
      setAnimating(false);
    }, 250);
  };

  const handleNextStep = async () => {
    const currentKey = STEPS[step].key;
    const value = formData[currentKey as keyof typeof formData];

    // Validação de obrigatoriedade
    if (STEPS[step].required && !value) {
      setErrors({ [currentKey]: "Este campo é obrigatório *" });
      return;
    }

    // Validação específica de senha
    if (currentKey === "password" && !isPasswordValid) {
      setErrors({ password: "A senha não atende aos requisitos mínimos." });
      return;
    }

    // Validação de confirmação
    if (currentKey === "confirmPassword" && value !== formData.password) {
      setErrors({ confirmPassword: "As senhas não coincidem." });
      return;
    }

    if (step < STEPS.length - 1) {
      goTo(step + 1);
    } else {
      handleFinalRegister();
    }
  };

  const handleFinalRegister = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: { full_name: formData.name, cpf: formData.cpf, gender: formData.gender }
      }
    });

    if (error) {
      toast({ title: "Erro no cadastro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Conta criada!", description: "Redirecionando para o Dashboard..." });
      navigate("/dash");
    }
    setIsLoading(false);
  };

  const inputClass = "w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:ring-2 focus:ring-[#E80070] outline-none transition-all";

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0f172a] p-4 relative overflow-hidden text-white">
      <div className="absolute inset-0 bg-gradient-to-tr from-[#E80070]/10 via-transparent to-[#C1188B]/10" />

      <div className="relative z-10 w-full max-w-md backdrop-blur-xl bg-white/[0.05] border border-white/10 rounded-3xl p-8 shadow-2xl">
        
        {step === -1 ? (
          /* --- LOGIN --- */
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-2">Entrar</h1>
              <p className="text-white/50">Acesse sua conta</p>
            </div>
            <div className="space-y-4">
              <input type="email" placeholder="Email *" className={inputClass} onChange={(e) => updateField("email", e.target.value)} />
              <div className="relative">
                <input type={showPassword ? "text" : "password"} placeholder="Senha *" className={inputClass} onChange={(e) => updateField("password", e.target.value)} />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
              <button onClick={() => navigate("/dash")} className="w-full bg-gradient-to-r from-[#E80070] to-[#C1188B] py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                <LogIn size={18}/> Entrar
              </button>
              <button onClick={() => goTo(0)} className="w-full text-center text-sm text-white/50 hover:text-white transition-colors">
                Não tem conta? <span className="text-[#E80070] font-bold">Cadastre-se *</span>
              </button>
            </div>
          </div>
        ) : (
          /* --- CADASTRO MULTI-STEP --- */
          <div className={`space-y-6 transition-all duration-300 ${animating ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}>
            <div className="flex items-center justify-between mb-2">
              <button onClick={() => step === 0 ? setStep(-1) : goTo(step - 1)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <ArrowLeft size={20}/>
              </button>
              <span className="text-xs font-mono text-[#E80070]">PASSO {step + 1}/{STEPS.length}</span>
            </div>

            <h2 className="text-xl font-semibold">
              {STEPS[step].label} {STEPS[step].required && <span className="text-[#E80070]">*</span>}
            </h2>

            <div className="min-h-[100px] space-y-4">
              {/* Campo de Senha com Requisitos */}
              {STEPS[step].key === "password" ? (
                <div className="space-y-4">
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} className={inputClass} autoFocus value={formData.password} onChange={(e) => updateField("password", e.target.value)} />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] bg-white/5 p-3 rounded-lg border border-white/10">
                    <Requirement met={passwordRequirements.length} label="Mínimo 8 caracteres" />
                    <Requirement met={passwordRequirements.upper} label="Letra maiúscula" />
                    <Requirement met={passwordRequirements.number} label="Número" />
                    <Requirement met={passwordRequirements.special} label="Caractere especial" />
                  </div>
                </div>
              ) : STEPS[step].key === "confirmPassword" ? (
                <div className="relative">
                  <input type={showConfirmPassword ? "text" : "password"} className={inputClass} autoFocus value={formData.confirmPassword} onChange={(e) => updateField("confirmPassword", e.target.value)} />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </button>
                </div>
              ) : (
                <input 
                  type={STEPS[step].key === "birthdate" ? "date" : "text"}
                  className={inputClass} 
                  autoFocus 
                  value={(formData as any)[STEPS[step].key]} 
                  onChange={(e) => updateField(STEPS[step].key, e.target.value)} 
                />
              )}
              {errors[STEPS[step].key] && <p className="text-[#E80070] text-xs font-medium animate-pulse">{errors[STEPS[step].key]}</p>}
            </div>

            <button onClick={handleNextStep} disabled={isLoading} className="w-full bg-white text-black py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#E80070] hover:text-white transition-all">
              {step === STEPS.length - 1 ? (
                <>{isLoading ? "Criando..." : "Finalizar Cadastro"}<Check size={18}/></>
              ) : (
                <>Próximo <ArrowRight size={18}/></>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Sub-componente para os requisitos de senha
const Requirement = ({ met, label }: { met: boolean; label: string }) => (
  <div className={`flex items-center gap-1.5 ${met ? "text-green-400" : "text-white/30"}`}>
    <div className={`w-1.5 h-1.5 rounded-full ${met ? "bg-green-400 shadow-[0_0_5px_green]" : "bg-white/20"}`} />
    {label}
  </div>
);

export default Auth;