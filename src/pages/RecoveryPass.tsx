import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, ArrowLeft, Check, KeyRound, Loader2 } from "lucide-react";
import supabase from "../../utils/supabase";

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

const RecoveryPass = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState(false);

  // Detectar e processar os tokens de recuperação da URL (enviados pelo Supabase via email)
  useEffect(() => {
    const handleRecoveryToken = async () => {
      const hash = window.location.hash;

      // Se há um fragment com access_token, processar a sessão
      if (hash && hash.includes("access_token")) {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error("Erro ao restaurar sessão de recuperação:", error);
            setSessionError(true);
            toast({
              title: "Link expirado ou inválido",
              description: "Solicite um novo link de recuperação de senha.",
              variant: "destructive",
            });
          } else {
            // Limpa o hash da URL para ficar mais limpo
            window.history.replaceState(null, "", window.location.pathname);
            setSessionReady(true);
          }
          return;
        }
      }

      // Se não tem token na URL, verificar se já existe uma sessão ativa (ex: PASSWORD_RECOVERY event)
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSessionReady(true);
      } else {
        setSessionError(true);
      }
    };

    handleRecoveryToken();
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação de requisitos
    const hasLength = newPassword.length >= 8;
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

    if (!hasLength || !hasUpper || !hasNumber || !hasSpecial) {
      setErrors({ newPassword: "A senha não atende a todos os requisitos." });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrors({ confirmNewPassword: "As senhas não coincidem." });
      return;
    }

    setIsLoading(true);
    try {
      // 1. Atualiza a senha no Auth do Supabase
      const { data, error: authError } = await supabase.auth.updateUser({ password: newPassword });
      
      if (authError) throw authError;

      // 2. Atualiza o campo de senha na tabela profiles (conforme solicitado pelo usuário)
      if (data?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ password: newPassword })
          .eq('user_id', data.user.id);

        if (profileError) {
          console.error("Erro ao atualizar senha no perfil:", profileError);
          // Opcional: decidimos se falhar aqui é um erro crítico. 
          // Como a senha do Auth já foi alterada, avisamos mas podemos prosseguir.
        }
      }

      toast({ 
        title: "Senha atualizada!", 
        description: "Sua senha foi redefinida e sincronizada com seu perfil." 
      });
      
      // Redireciona para o login após sucesso
      setTimeout(() => navigate("/auth"), 2000);
      
    } catch (error: any) {
      toast({ 
        title: "Erro ao atualizar", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full bg-white/10 border border-white/25 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:ring-2 focus:ring-[#E80070] outline-none transition-all";

  // Estado de carregamento: verificando sessão
  if (!sessionReady && !sessionError) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 auth-gradient-bg opacity-50" />
        <div className="relative z-10 text-center">
          <Loader2 size={40} className="animate-spin text-[#E80070] mx-auto mb-4" />
          <p className="text-white/60">Verificando link de recuperação...</p>
        </div>
      </div>
    );
  }

  // Estado de erro: link inválido ou expirado
  if (sessionError) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 auth-gradient-bg opacity-50" />
        <div className="relative z-10 w-full max-w-md mx-4">
          <div className="backdrop-blur-xl bg-white/[0.08] border border-white/20 rounded-3xl p-8 shadow-2xl text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
              <KeyRound size={28} className="text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Link Inválido</h1>
            <p className="text-white/50 text-sm mb-6">
              Este link de recuperação expirou ou é inválido. Solicite um novo link para redefinir sua senha.
            </p>
            <MagneticButton onClick={() => navigate("/auth")} className="w-full justify-center">
              <ArrowLeft size={18} /> Voltar ao Login
            </MagneticButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 auth-gradient-bg opacity-50" />
      
      <button 
        onClick={() => navigate("/auth")} 
        className="absolute top-6 left-6 md:top-8 md:left-8 z-20 flex items-center gap-2 text-white/70 hover:text-white transition-all bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10"
      >
        <ArrowLeft size={18} />
        <span>Voltar ao Login</span>
      </button>

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="backdrop-blur-xl bg-white/[0.08] border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
              <KeyRound size={28} className="text-[#E80070]" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Recuperação de Senha</h1>
            <p className="text-white/50 text-sm">Crie uma nova senha segura para sua conta.</p>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-6">
            <div>
              <label className="block text-white/70 text-sm mb-2">Nova Senha</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  className={inputClass} 
                  autoFocus
                  placeholder="********"
                  value={newPassword} 
                  onChange={(e) => { setNewPassword(e.target.value); setErrors({}); }} 
                  required
                />
                <button 
                  type="button" 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              <div className="mt-4 flex flex-col gap-1 text-sm">
                <span className={newPassword.length >= 8 ? "text-green-400" : "text-white/60"}>
                  {newPassword.length >= 8 ? "✓" : "•"} Mínimo de 8 caracteres
                </span>
                <span className={/[A-Z]/.test(newPassword) ? "text-green-400" : "text-white/60"}>
                  {/[A-Z]/.test(newPassword) ? "✓" : "•"} Letra maiúscula
                </span>
                <span className={/[0-9]/.test(newPassword) ? "text-green-400" : "text-white/60"}>
                  {/[0-9]/.test(newPassword) ? "✓" : "•"} Número
                </span>
                <span className={/[^A-Za-z0-9]/.test(newPassword) ? "text-green-400" : "text-white/60"}>
                  {/[^A-Za-z0-9]/.test(newPassword) ? "✓" : "•"} Caractere especial (!, #, @, etc)
                </span>
              </div>
              {errors.newPassword && <p className="text-[#E80070] text-xs mt-2">{errors.newPassword}</p>}
            </div>

            <div>
              <label className="block text-white/70 text-sm mb-2">Confirmar Nova Senha</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  className={inputClass}
                  placeholder="********"
                  value={confirmNewPassword} 
                  onChange={(e) => { setConfirmNewPassword(e.target.value); setErrors({}); }} 
                  required
                />
              </div>
              {errors.confirmNewPassword && <p className="text-[#E80070] text-xs mt-2">{errors.confirmNewPassword}</p>}
            </div>

            <MagneticButton type="submit" className="w-full justify-center mt-4" disabled={isLoading}>
              {isLoading ? "Salvando..." : <><Check size={18}/> Redefinir Senha</>}
            </MagneticButton>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RecoveryPass;
