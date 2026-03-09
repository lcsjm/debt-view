import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User as UserIcon } from "lucide-react";
import supabase from "../../utils/supabase";
import { User } from "@supabase/supabase-js";
import { toast } from "@/hooks/use-toast";

export default function Dash() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
      } else {
        navigate("/auth");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Erro ao sair",
        description: error.message,
      });
    } else {
      toast({
        title: "Sessão encerrada",
        description: "Você saiu da sua conta.",
      });
      navigate("/");
    }
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center text-white bg-slate-900">Carregando...</div>;

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-slate-900">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800" />
      
      {/* Subtle floating orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 rounded-full bg-[#1D4F91]/20 blur-3xl -top-48 -left-48" />
        <div className="absolute w-64 h-64 rounded-full bg-[#E80070]/10 blur-3xl bottom-10 right-10" />
      </div>

      <div className="relative z-10 w-full max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="backdrop-blur-xl bg-white/[0.08] border border-white/20 rounded-3xl p-8 shadow-2xl shadow-black/40">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#E80070] to-[#C1188B] p-1 mb-6 shadow-lg shadow-[#E80070]/20">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                <UserIcon size={32} className="text-white/80" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-2">Bem-vindo(a)</h1>
            <p className="text-white/60 mb-8">{user.email}</p>

            <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 text-left transition-all hover:bg-white/10">
              <h3 className="text-white font-medium mb-4">Detalhes da Conta</h3>
              <div className="space-y-4 text-sm">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:items-center">
                  <span className="text-white/50">ID do Usuário</span>
                  <span className="text-white/90 font-mono text-xs bg-black/20 px-2 py-1 rounded truncate max-w-full">{user.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/50">Criou conta em</span>
                  <span className="text-white/90">
                    {new Date(user.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                {user.last_sign_in_at && (
                  <div className="flex justify-between items-center">
                    <span className="text-white/50">Último acesso</span>
                    <span className="text-white/90">
                      {new Date(user.last_sign_in_at).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full py-3 px-4 rounded-xl font-medium text-white bg-white/10 border border-white/20 hover:bg-white/20 hover:text-[#E80070] transition-all active:scale-95 flex items-center justify-center gap-2 group"
            >
              <LogOut size={18} className="transition-transform group-hover:-translate-x-1" />
              Sair da conta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}