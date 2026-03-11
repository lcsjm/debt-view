import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, ArrowLeft, ArrowRight, Check } from "lucide-react";
import supabase from "../../utils/supabase";

const STEPS = [
  { key: "email", label: "Email", required: true },
  { key: "password", label: "Senha", required: true },
  { key: "confirmPassword", label: "Confirmar Senha", required: true },
  { key: "name", label: "Nome completo", required: false },
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

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "", confirmPassword: "", name: "", cpf: "", cep: "", birthdate: "", gender: "", race: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (key: string, value: string) => {
    let v = value;
    if (key === "cpf") v = maskCPF(value);
    if (key === "cep") v = maskCEP(value);
    setFormData((prev) => ({ ...prev, [key]: v }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleNextStep = async () => {
    const currentStep = STEPS[step];
    if (currentStep?.required && !formData[currentStep.key as keyof typeof formData]) {
        setErrors({ [currentStep.key]: "Campo obrigatório" });
        return;
    }

    if (currentStep.key === "password") {
        const hasLength = formData.password.length >= 8;
        const hasUpper = /[A-Z]/.test(formData.password);
        const hasNumber = /[0-9]/.test(formData.password);
        const hasSpecial = /[^A-Za-z0-9]/.test(formData.password);
        
        if (!hasLength || !hasUpper || !hasNumber || !hasSpecial) {
            setErrors({ password: "A senha não atende a todos os requisitos." });
            return;
        }
    }

    if (currentStep.key === "confirmPassword") {
        if (formData.password !== formData.confirmPassword) {
            setErrors({ confirmPassword: "As senhas não coincidem." });
            return;
        }
    }

    if (step < STEPS.length - 1) {
      setAnimating(true);
      setTimeout(() => { 
        setStep(step + 1); 
        setShowPassword(false); // Reseta o olhinho entre as etapas
        setAnimating(false); 
      }, 300);
    } else {
      setIsLoading(true);
      try {
        const cleanCpf = formData.cpf.replace(/\D/g, "");
        const cleanCep = formData.cep.replace(/\D/g, "");

        const { data, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: { full_name: formData.name, cpf: cleanCpf, gender: formData.gender, race: formData.race }
          }
        });

        if (authError) throw authError;

        if (data.user) {
          const { error: profileError } = await supabase.from('profiles').insert({
            user_id: data.user.id,
            name: formData.name,
            cpf: cleanCpf,
            cep: cleanCep,
            birth: formData.birthdate,
            gender: formData.gender,
            race: formData.race
          });

          if (profileError) {
             console.error("Profile insertion error details:", profileError);
             throw new Error(`Falha ao salvar perfil: ${profileError.message}`);
          }
        }

        toast({ title: "Sucesso!", description: "Sua conta foi criada. Entrando..." });
        navigate("/dashboard");
      } catch (err: any) {
        toast({ title: "Erro no Cadastro", description: err.message, variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const inputClass = "w-full bg-white/10 border border-white/25 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:ring-2 focus:ring-[#E80070] outline-none transition-all";

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 auth-gradient-bg opacity-50" />
      
      <div className="relative z-10 w-full max-w-md mx-4 transition-all duration-500">
        <div className="backdrop-blur-xl bg-white/[0.08] border border-white/20 rounded-3xl p-8 shadow-2xl">
          
          <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }} className={`transition-all duration-300 ${animating ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"}`}>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-white">Criar Conta</h2>
              <p className="text-white/40 text-sm">Passo {step + 1} de {STEPS.length}</p>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1 bg-white/10 rounded-full mb-8 overflow-hidden">
              <div className="h-full bg-[#E80070] transition-all duration-500" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
            </div>

            <div className="min-h-[120px]">
              <label className="block text-white/70 text-sm mb-2">
                {STEPS[step].label}
                {STEPS[step].required && <span className="text-[#E80070] ml-1">*</span>}
              </label>
              {STEPS[step].key === "gender" ? (
                  <div className="flex flex-col gap-2">
                      {GENDER_OPTIONS.map(opt => (
                          <button type="button" key={opt} onClick={() => updateField("gender", opt)} 
                              className={`p-3 rounded-xl border text-left transition-all hover:bg-white/10 ${formData.gender === opt ? "bg-[#E80070]/20 border-[#E80070] text-white" : "bg-white/5 border-white/10 text-white/60"}`}>
                              {opt}
                          </button>
                      ))}
                  </div>
              ) : STEPS[step].key === "race" ? (
                  <div className="flex flex-col gap-2">
                      {RACE_OPTIONS.map(opt => (
                          <button type="button" key={opt} onClick={() => updateField("race", opt)} 
                              className={`p-3 rounded-xl border text-left transition-all hover:bg-white/10 ${formData.race === opt ? "bg-[#E80070]/20 border-[#E80070] text-white" : "bg-white/5 border-white/10 text-white/60"}`}>
                              {opt}
                          </button>
                      ))}
                  </div>
              ) : STEPS[step].key === "password" || STEPS[step].key === "confirmPassword" ? (
                  <div>
                      <div className="relative">
                          <input 
                              type={showPassword ? "text" : "password"}
                              className={inputClass}
                              autoFocus
                              value={(formData as any)[STEPS[step].key]}
                              onChange={(e) => updateField(STEPS[step].key, e.target.value)}
                          />
                          <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors" onClick={() => setShowPassword(!showPassword)}>
                              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                      </div>
                      
                      {STEPS[step].key === "password" && (
                          <div className="mt-4 flex flex-col gap-1 text-sm">
                              <span className={formData.password.length >= 8 ? "text-green-400" : "text-white/60 transition-colors"}>• Mínimo de 8 caracteres</span>
                              <span className={/[A-Z]/.test(formData.password) ? "text-green-400" : "text-white/60 transition-colors"}>• Letra maiúscula</span>
                              <span className={/[0-9]/.test(formData.password) ? "text-green-400" : "text-white/60 transition-colors"}>• Número</span>
                              <span className={/[^A-Za-z0-9]/.test(formData.password) ? "text-green-400" : "text-white/60 transition-colors"}>• Caractere especial (!, #, @, etc)</span>
                          </div>
                      )}
                  </div>
              ) : (
                  <input 
                      type={STEPS[step].key === "birthdate" ? "date" : STEPS[step].key === "email" ? "email" : "text"}
                      inputMode={["cpf", "cep"].includes(STEPS[step].key) ? "numeric" : undefined}
                      className={inputClass}
                      autoFocus
                      value={(formData as any)[STEPS[step].key]}
                      onChange={(e) => updateField(STEPS[step].key, e.target.value)}
                  />
              )}
              {errors[STEPS[step].key] && <p className="text-[#E80070] text-xs mt-2">{errors[STEPS[step].key]}</p>}
            </div>

            <div className="flex gap-3 mt-8">
              <MagneticButton variant="secondary" onClick={() => step === 0 ? navigate("/login") : setStep(step - 1)}>
                  <ArrowLeft size={18}/> {step === 0 ? "Voltar" : "Voltar"}
              </MagneticButton>
              <MagneticButton type="submit" className="flex-1 justify-center" disabled={isLoading}>
                  {step === STEPS.length - 1 ? <><Check size={18}/> Finalizar</> : <><ArrowRight size={18}/> Próximo</>}
              </MagneticButton>
            </div>
            
            {step === 0 && (
              <div className="mt-4 text-center">
                <button type="button" onClick={() => navigate("/login")} className="text-white/50">
                  Já possui uma conta? 
                  <strong className="text-white hover:text-[#E80070] transition-colors"> Entrar</strong>
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
