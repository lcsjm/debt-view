import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, LogIn, UserPlus, ArrowLeft } from "lucide-react";
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

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const updateField = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
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
      navigate("/dashboard");
    }
    setIsLoading(false);
  };

  const inputClass = "w-full bg-white/10 border border-white/25 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:ring-2 focus:ring-[#E80070] outline-none transition-all";

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 auth-gradient-bg opacity-50" />
      
      <div className="relative z-10 w-full max-w-md mx-4 transition-all duration-200">
        <div className="backdrop-blur-xl bg-white/[0.08] border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <div className="text-center mb-8 relative">
              <button 
                onClick={() => navigate("/")} 
                className="absolute left-0 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                title="Voltar ao Início"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-3xl font-bold text-white mb-2">Acessar</h1>
              <p className="text-white/50">Bem-vindo de volta ao DebtView!</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <input type="email" placeholder="Email" className={inputClass} required
                value={formData.email} onChange={(e) => updateField("email", e.target.value)} />
              
              <div className="relative">
                <input type={showPassword ? "text" : "password"} placeholder="Senha" className={inputClass} required
                  value={formData.password} onChange={(e) => updateField("password", e.target.value)} />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <MagneticButton type="submit" className="w-full justify-center" disabled={isLoading}>
                {isLoading ? "Entrando..." : <><LogIn size={18}/> Entrar</>}
              </MagneticButton>
            </form>

            <div className="mt-6 pt-6 border-t border-white/10 text-center">
              <button onClick={() => navigate("/register")} className="text-white/50 flex items-center justify-center gap-2 w-full">
                Não possui uma conta? <strong className="text-white hover:text-[#E80070] transition-colors ">Cadastre-se aqui</strong> <UserPlus size={16}/>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
