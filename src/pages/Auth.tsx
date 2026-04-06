import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, ArrowLeft, ArrowRight, Check, LogIn, UserPlus, X } from "lucide-react";
import supabase from "../../utils/supabase";

const STEPS = [
  { key: "email", label: "Email", required: true },
  { key: "password", label: "Senha", required: true },
  { key: "confirmPassword", label: "Confirmar Senha", required: true },
  { key: "name", label: "Nome", required: true },
  { key: "cpf", label: "CPF", required: false },
  { key: "cep", label: "CEP", required: false },
  { key: "birthdate", label: "Data de Nascimento", required: true },
  { key: "gender", label: "Sexo", required: true },
  { key: "race", label: "Cor e Raça", required: true },
  { key: "lgpd", label: "Termos e Privacidade", required: true },
] as const;

const GENDER_OPTIONS = ["Masculino", "Feminino", "Não-binário", "Prefiro não responder"];
const RACE_OPTIONS = ["Parda", "Preta", "Branca", "Indígena", "Amarela", "Prefiro não responder"];

// Funções de máscara
function maskCPF(v: string) { return v.replace(/\D/g, "").slice(0, 11).replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2"); }
function maskCEP(v: string) { return v.replace(/\D/g, "").slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2"); }
function maskDate(v: string) { return v.replace(/\D/g, "").slice(0, 8).replace(/(\d{2})(\d)/, "$1/$2").replace(/(\d{2})(\d)/, "$1/$2"); }

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
  const [step, setStep] = useState(-1);
  const [showPassword, setShowPassword] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [activeModal, setActiveModal] = useState<"privacy" | "terms" | null>(null);
  
  const [formData, setFormData] = useState({ email: "", password: "", confirmPassword: "", name: "", cpf: "", cep: "", birthdate: "", gender: "", race: "", lgpd: false });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (key: string, value: string | boolean) => {
    let v = value;
    if (typeof value === 'string') {
        if (key === "cpf") v = maskCPF(value);
        if (key === "cep") v = maskCEP(value);
        if (key === "birthdate") v = maskDate(value); 
    }
    setFormData((prev) => ({ ...prev, [key]: v }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

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
      navigate("/dashboard");
    }
    setIsLoading(false);
  };

  const handleNextStep = async () => {
    const currentStep = STEPS[step];
    
    if (currentStep?.required && currentStep.key !== "lgpd" && !formData[currentStep.key as keyof typeof formData]) {
        setErrors({ [currentStep.key]: "Campo obrigatório" });
        return;
    }

    // MODIFICADO: Validação do E-mail e verificação no banco logo no primeiro passo
    if (currentStep.key === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setErrors({ email: "Insira um e-mail válido." });
            return;
        }

        setIsLoading(true);
        try {
            // Chama a RPC criada no Supabase
            const { data: emailExists, error } = await supabase.rpc('check_email_exists', { check_email: formData.email });
            
            if (error) {
                console.error("Erro ao verificar e-mail:", error);
            } else if (emailExists) {
                setErrors({ email: "Este e-mail já foi cadastrado anteriormente." });
                setIsLoading(false);
                return;
            }
        } catch (err) {
            console.error("Falha ao checar e-mail", err);
        }
        setIsLoading(false);
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

    if (currentStep.key === "birthdate") {
        if (formData.birthdate.length !== 10) {
            setErrors({ birthdate: "Insira uma data válida (DD/MM/AAAA)." });
            return;
        }
    }

    if (currentStep.key === "lgpd" && !formData.lgpd) {
        setErrors({ lgpd: "Você precisa aceitar os termos para concluir o cadastro." });
        return;
    }

    if (step < STEPS.length - 1) {
      setAnimating(true);
      setTimeout(() => {
        setStep(step + 1);
        setShowPassword(false);
        setAnimating(false);
      }, 300);
    } else {
      setIsLoading(true);
      try {
        const cleanCpf = formData.cpf.replace(/\D/g, "");
        const cleanCep = formData.cep.replace(/\D/g, "");

        const [day, month, year] = formData.birthdate.split('/');
        const isoDate = `${year}-${month}-${day}`;

        const { data, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: { full_name: formData.name, cpf: cleanCpf, gender: formData.gender, race: formData.race }
          }
        });

        // Mantido como redundância caso o usuário tente burlar a interface
        if (authError) {
          if (authError.message === "User already registered") {
            throw new Error("Este e-mail já foi cadastrado anteriormente.");
          }
          throw authError;
        }

        if (data?.user && data.user.identities && data.user.identities.length === 0) {
          throw new Error("Este e-mail já foi cadastrado anteriormente.");
        }

        if (data.user) {
          const { error: profileError } = await supabase.from('profiles').insert({
            user_id: data.user.id,
            name: formData.name,
            cpf: cleanCpf,
            cep: cleanCep,
            birth: isoDate,
            gender: formData.gender,
            race: formData.race,
            terms_accepted: formData.lgpd,
            terms_accepted_at: new Date().toISOString() 
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
      
      <button 
        onClick={() => navigate("/")} 
        className="absolute top-6 left-6 md:top-8 md:left-8 z-20 flex items-center gap-2 text-white/70 hover:text-white transition-all bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10"
        aria-label="Voltar para a página inicial"
      >
        <ArrowLeft size={18} />
        <span className="hidden sm:inline">Voltar ao Início</span>
      </button>
      
      <div className="relative z-10 w-full max-w-md mx-4 transition-all duration-500">
        <div className="backdrop-blur-xl bg-white/[0.08] border border-white/20 rounded-3xl p-8 shadow-2xl">
          
          {step === -1 ? (
            <div className="animate-in fade-in zoom-in-95 duration-500">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Acessar</h1>
                <p className="text-white/50">Bem-vindo de volta!</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <input type="email" placeholder="Email" className={inputClass} required aria-label="Email"
                  value={formData.email} onChange={(e) => updateField("email", e.target.value)} />
                
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} placeholder="Senha" className={inputClass} required aria-label="Senha"
                    value={formData.password} onChange={(e) => updateField("password", e.target.value)} />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <MagneticButton type="submit" className="w-full justify-center" disabled={isLoading}>
                  {isLoading ? "Entrando..." : <><LogIn size={18}/> Entrar</>}
                </MagneticButton>
              </form>

              <div className="mt-6 pt-6 border-t border-white/10 text-center">
                <button onClick={() => setStep(0)} className="text-white/50 flex items-center justify-center gap-2 w-full hover:text-white transition-colors">
                  Não tem conta? <strong className="text-white hover:text-[#E80070] transition-colors">Cadastre-se aqui</strong> <UserPlus size={16}/>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }} className={`transition-all duration-300 ${animating ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"}`}>
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-white">Criar Conta</h2>
                <p className="text-white/40 text-sm">Passo {step + 1} de {STEPS.length}</p>
              </div>

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
                ) : STEPS[step].key === "lgpd" ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start gap-3 bg-slate-800 border border-white/10 p-4 rounded-xl">
                        <input
                          type="checkbox"
                          id="lgpd-consent"
                          checked={formData.lgpd}
                          onChange={(e) => updateField("lgpd", e.target.checked)}
                          className="mt-1 w-5 h-5 rounded border-white/30 bg-white/10 text-[#E80070] focus:ring-[#E80070] focus:ring-offset-slate-900 cursor-pointer accent-[#E80070]"
                        />
                        <label htmlFor="lgpd-consent" className="text-sm text-white/70 leading-relaxed cursor-pointer">
                          Eu li e concordo com os{' '}
                          <button 
                            type="button" 
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveModal("terms"); }} 
                            className="text-[#FF6BBA] font-bold hover:text-white transition-colors underline"
                          >
                            Termos de Uso
                          </button>{' '}
                          e a{' '}
                          <button 
                            type="button" 
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveModal("privacy"); }} 
                            className="text-[#FF6BBA] font-bold hover:text-white transition-colors underline"
                          >
                            Política de Privacidade
                          </button>
                          , e aceito o tratamento dos meus dados conforme a Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018).
                        </label>
                      </div>
                    </div>
                ) : (
                    <input
                        type={STEPS[step].key === "email" ? "email" : "text"}
                        inputMode={["cpf", "cep", "birthdate"].includes(STEPS[step].key) ? "numeric" : undefined}
                        placeholder={STEPS[step].key === "birthdate" ? "DD/MM/AAAA" : ""}
                        className={inputClass}
                        autoFocus
                        value={(formData as any)[STEPS[step].key]}
                        onChange={(e) => updateField(STEPS[step].key, e.target.value)}
                    />
                )}
                {errors[STEPS[step].key] && <p className="text-[#E80070] text-sm font-medium mt-2">{errors[STEPS[step].key]}</p>}
              </div>

              <div className="flex gap-3 mt-8">
                <MagneticButton variant="secondary" onClick={() => step === 0 ? setStep(-1) : setStep(step - 1)}>
                  <ArrowLeft size={18}/> {step === 0 ? "Login" : "Voltar"}
                </MagneticButton>
                <MagneticButton type="submit" className="flex-1 justify-center" disabled={isLoading}>
                  {isLoading ? "Verificando..." : step === STEPS.length - 1 ? <><Check size={18}/> Finalizar</> : <><ArrowRight size={18}/> Próximo</>}
                </MagneticButton>
              </div>
            </form>
          )}

        </div>
      </div>

      {/* RENDERIZAÇÃO CONDICIONAL DOS MODAIS */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-800 border border-white/20 rounded-2xl p-6 max-w-2xl w-full shadow-2xl relative flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors z-10"
              aria-label="Fechar"
            >
              <X size={24} />
            </button>

            {/* MODAL DA POLÍTICA DE PRIVACIDADE */}
            {activeModal === "privacy" && (
              <>
                <div className="mb-6 shrink-0 mt-2">
                  <h3 className="text-2xl font-bold text-white">Política de Privacidade – DebtView</h3>
                  <p className="text-white/40 text-sm mt-1">Última atualização: Abril de 2026</p>
                </div>
                
                <div className="text-white/70 space-y-5 text-sm overflow-y-auto pr-4 custom-scrollbar">
                  <p>Bem-vindo(a) ao DebtView. Nós levamos a sua privacidade a sério. Esta Política de Privacidade explica como coletamos, usamos, armazenamos e protegemos os seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).</p>
                  <p>O DebtView é um projeto de caráter estritamente educacional, desenvolvido por estudantes do Programa Transforme-se da Serasa Experian.</p>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">1. Quais dados coletamos?</h4>
                    <p>Ao criar uma conta em nossa plataforma, solicitamos os seguintes dados:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1 ml-1 text-white/60">
                      <li><strong className="text-white/80">Dados de Identificação e Contato:</strong> Nome completo, E-mail, CPF.</li>
                      <li><strong className="text-white/80">Dados de Acesso:</strong> Senha (criptografada).</li>
                      <li><strong className="text-white/80">Dados Demográficos:</strong> Data de Nascimento, CEP, Sexo e Cor/Raça.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">2. Para que usamos os seus dados?</h4>
                    <p>Os dados coletados têm finalidades específicas e limitadas:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1 ml-1 text-white/60">
                      <li><strong className="text-white/80">Segurança e Autenticação:</strong> Seu e-mail, senha e CPF são utilizados exclusivamente para criar sua conta, validar sua identidade e garantir o acesso seguro à plataforma.</li>
                      <li><strong className="text-white/80">Fins Estatísticos:</strong> Os dados de CEP, Data de Nascimento, Sexo e Cor/Raça são utilizados de forma agregada para fins estatísticos e de estudo demográfico dentro do contexto educacional do projeto.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">3. Tratamento de Dados de Menores de Idade</h4>
                    <p>Nossa plataforma permite o cadastro de menores de 18 anos. De acordo com a LGPD, o tratamento de dados de crianças e adolescentes deverá ser realizado em seu melhor interesse. Ao aceitar esta política, o usuário menor de idade declara que possui a autorização e supervisão de seus pais ou responsáveis legais para o uso do DebtView e fornecimento de seus dados.</p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">4. Com quem compartilhamos seus dados?</h4>
                    <p><strong className="text-white/80">Nós não vendemos, alugamos ou repassamos seus dados pessoais para terceiros.</strong></p>
                    <p className="mt-2">Para o funcionamento técnico do site, seus dados são armazenados de forma segura nos servidores do Supabase, que atua apenas como nosso provedor de infraestrutura de banco de dados e autenticação, seguindo rigorosos padrões de segurança da informação.</p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">5. Uso de Cookies</h4>
                    <p>O DebtView utiliza apenas cookies essenciais. Isso significa que usamos pequenos arquivos de texto no seu navegador exclusivamente para manter a sua sessão ativa (manter você logado). Não utilizamos cookies de rastreamento para marketing ou publicidade.</p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">6. Seus Direitos (LGPD)</h4>
                    <p>Você tem total controle sobre seus dados. A qualquer momento, você pode solicitar:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1 ml-1 text-white/60">
                      <li>A confirmação da existência de tratamento de seus dados.</li>
                      <li>O acesso aos dados que possuímos sobre você.</li>
                      <li>A correção de dados incompletos, inexatos ou desatualizados.</li>
                      <li>A exclusão total da sua conta e dos seus dados do nosso banco de dados.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">7. Como entrar em contato</h4>
                    <p>Se você tiver dúvidas sobre esta política, quiser exercer seus direitos ou solicitar a exclusão da sua conta, entre em contato através do e-mail: <a href="mailto:privacidade@debtview.com.br" className="text-[#E80070] hover:text-white transition-colors">privacidade@debtview.com.br</a>.</p>
                  </div>
                </div>
              </>
            )}

            {/* MODAL DOS TERMOS DE USO */}
            {activeModal === "terms" && (
              <>
                <div className="mb-6 shrink-0 mt-2">
                  <h3 className="text-2xl font-bold text-white">Termos de Uso – DebtView</h3>
                  <p className="text-white/40 text-sm mt-1">Última atualização: Abril de 2026</p>
                </div>
                
                <div className="text-white/70 space-y-5 text-sm overflow-y-auto pr-4 custom-scrollbar">
                  <p>Estes Termos de Uso regulamentam o acesso e a utilização da plataforma DebtView. Ao marcar a caixa de consentimento e criar sua conta, você concorda com as regras descritas abaixo.</p>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">1. Natureza do Serviço</h4>
                    <p>O DebtView é um projeto de cunho educacional e acadêmico, desenvolvido por estudantes integrantes do Programa Transforme-se da Serasa Experian. O serviço é fornecido "no estado em que se encontra" (as is), sem fins lucrativos e sem garantias de disponibilidade contínua, podendo ser alterado, suspenso ou descontinuado a qualquer momento sem aviso prévio.</p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">2. Cadastro e Responsabilidades do Usuário</h4>
                    <p>Para utilizar o DebtView, você precisará criar uma conta. Ao fazê-lo, você se compromete a:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1 ml-1 text-white/60">
                      <li>Fornecer informações verdadeiras, exatas e atualizadas (especialmente seu CPF e e-mail).</li>
                      <li>Manter a confidencialidade da sua senha. Você é o único responsável por todas as atividades que ocorrerem sob a sua conta.</li>
                      <li>Não utilizar a plataforma para fins ilegais, fraudulentos ou que violem os direitos de terceiros.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">3. Usuários Menores de Idade</h4>
                    <p>Se você tem menos de 18 anos, você só poderá utilizar o DebtView com a ciência e autorização de seus pais ou responsáveis legais. Ao se cadastrar, você garante que possui essa permissão.</p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">4. Propriedade Intelectual</h4>
                    <p>Todo o conteúdo, design, código-fonte e estrutura da plataforma DebtView pertencem aos seus desenvolvedores (estudantes do Programa Transforme-se). É proibida a cópia, distribuição ou engenharia reversa do sistema sem autorização prévia.</p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">5. Limitação de Responsabilidade</h4>
                    <p>Por se tratar de um projeto de estudantes, os criadores do DebtView, bem como a Serasa Experian (como mantenedora do programa educacional), não se responsabilizam por eventuais indisponibilidades técnicas do sistema, perdas de dados ou quaisquer danos diretos e indiretos decorrentes do uso da plataforma.</p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">6. Alterações nos Termos</h4>
                    <p>Podemos atualizar estes Termos de Uso periodicamente. Caso ocorram mudanças significativas, você será notificado no seu próximo acesso à plataforma.</p>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">7. Contato e Suporte</h4>
                    <p>Para dúvidas ou problemas técnicos, contate-nos em: <a href="mailto:suporte@debtview.com.br" className="text-[#E80070] hover:text-white transition-colors">suporte@debtview.com.br</a>.</p>
                  </div>
                </div>
              </>
            )}
            
            <div className="mt-6 shrink-0 border-t border-white/10 pt-4">
              <button
                onClick={() => setActiveModal(null)}
                className="w-full bg-[#E80070] hover:bg-[#C1188B] text-white py-3 rounded-xl font-semibold transition-colors active:scale-95 duration-150"
              >
                Entendi e concordo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Auth;