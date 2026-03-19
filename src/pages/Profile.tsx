import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { AppSidebar } from "@/components/AppSidebar";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "@/hooks/use-toast";
import { User, MapPin, Calendar, ShieldCheck, AlertCircle, Mail, Lock, Zap } from "lucide-react";
import supabase from "../../utils/supabase";

// 🎭 Formata o CPF
const formatCPF = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

// ✅ Validação de CPF
const validateCPF = (cpf: string) => {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return false;
  if (/^(\d)\1+$/.test(digits)) return false; 
  const calc = (factor: number) => {
    let sum = 0;
    for (let i = 0; i < factor - 1; i++) sum += parseInt(digits[i]) * (factor - i);
    const rest = (sum * 10) % 11;
    return rest === 10 || rest === 11 ? 0 : rest;
  };
  return calc(10) === parseInt(digits[9]) && calc(11) === parseInt(digits[10]);
};

// 📮 Formata o CEP
const formatCEP = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
};

const profileSchema = z.object({
  name: z.string().min(3, "Nome deve ter ao menos 3 letras"),
  cpf: z
    .string()
    .min(14, "CPF incompleto — ex: 123.456.789-00")
    .refine(validateCPF, "CPF inválido — verifique os dígitos"),
  birth: z.string().optional().or(z.literal("")),
  cep: z
    .string()
    .optional()
    .refine(
      v => !v || v.replace(/\D/g, "").length === 0 || v.replace(/\D/g, "").length === 8,
      "CEP inválido — ex: 01310-100"
    )
    .or(z.literal("")),
  gender: z.string().optional().or(z.literal("")),
  race: z.string().optional().or(z.literal("")),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const [activeSection, setActiveSection] = useState("profile");
  const [collapsed, setCollapsed] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { profile, isLoading, saveProfile, isSaving } = useProfile();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });
  }, []);

  const { register, handleSubmit, reset, control, formState: { errors, isDirty } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", cpf: "", birth: "", cep: "", gender: "", race: "" }
  });

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name || "",
        cpf: profile.cpf || "",
        birth: profile.birth ? profile.birth.split("T")[0] : "",
        cep: profile.cep || "",
        gender: profile.gender || "",
        race: profile.race || "",
      });
    }
  }, [profile, reset]);

  async function onSubmit(data: ProfileForm) {
    try {
      await saveProfile({
        name: data.name,
        cpf: data.cpf,
        birth: data.birth || null,
        cep: data.cep || null,
        gender: data.gender || null,
        race: data.race || null,
      });
      toast({ title: "Perfil atualizado com sucesso! ✅" });
    } catch (err: any) {
      toast({ title: "Erro ao salvar", description: err.message, variant: "destructive" });
    }
  }

  // Estilo padronizado e dinâmico para os inputs (Glassmorphism adaptável claro/escuro)
  const fieldClass = "w-full border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#426DA9]/50 focus:border-[#426DA9] transition-all text-sm backdrop-blur-sm";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 relative overflow-hidden text-slate-900 dark:text-slate-100">
      
      {/* Orbs de fundo dinâmicos com a palheta da Serasa */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#1D4F91]/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-[#77127B]/10 blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDuration: '12s' }} />
        <div className="absolute top-[30%] right-[20%] w-[30vw] h-[30vw] rounded-full bg-[#E80070]/5 blur-[90px] mix-blend-multiply dark:mix-blend-screen" />
      </div>

      <AppSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <main className={`relative z-10 transition-all duration-300 p-4 md:p-8 ${collapsed ? "ml-[72px]" : "ml-[72px] md:ml-[260px]"}`}>

        {/* Header Fluído */}
        <div className="mb-8 bg-white/40 dark:bg-slate-900/40 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-md shadow-sm">
          <p className="text-sm text-[#426DA9] dark:text-[#8CB4F5] font-semibold mb-1 uppercase tracking-wider">Configurações</p>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#1D4F91] dark:text-white">Meu Perfil</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Mantenha seus dados atualizados para aproveitar todas as funcionalidades.</p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 opacity-60">
            <div className="w-10 h-10 border-4 border-[#426DA9] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-[#426DA9] dark:text-slate-300 font-medium">Carregando perfil...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Cartão Resumo */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-[#C1188B]/20 rounded-3xl p-6 flex flex-col items-center text-center gap-4 shadow-lg shadow-[#E80070]/5"
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#E80070]/10 to-[#C1188B]/10 border-4 border-[#E80070]/20 flex items-center justify-center relative group">
                  <div className="absolute inset-0 rounded-full bg-[#E80070] opacity-0 group-hover:opacity-10 transition-opacity" />
                  <User className="w-10 h-10 text-[#E80070] dark:text-[#FF66A3]" />
                </div>
                <div>
                  <p className="font-black text-xl text-[#1D4F91] dark:text-white">{profile?.name || "Usuário"}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-[200px]">{userEmail || "—"}</p>
                </div>

                <div className="w-full bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl p-4 text-left space-y-3 mt-2">
                  <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                    <div className="p-1.5 bg-[#426DA9]/10 rounded-lg text-[#426DA9] dark:text-[#8CB4F5]"><Mail size={14} /></div>
                    <span className="truncate text-slate-800 dark:text-slate-200 font-medium">{userEmail || "—"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                    <div className="p-1.5 bg-[#77127B]/10 rounded-lg text-[#77127B] dark:text-[#E88CEE]"><MapPin size={14} /></div>
                    <span>CEP: <strong className="text-slate-800 dark:text-slate-200 font-medium">{profile?.cep || "—"}</strong></span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                    <div className="p-1.5 bg-[#C1188B]/10 rounded-lg text-[#C1188B] dark:text-[#FF85BB]"><Calendar size={14} /></div>
                    <span>Nasc: <strong className="text-slate-800 dark:text-slate-200 font-medium">{profile?.birth ? new Date(profile.birth).toLocaleDateString("pt-BR") : "—"}</strong></span>
                  </div>
                  <div className="flex items-center gap-3 text-sm pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                    <ShieldCheck className="w-5 h-5 flex-shrink-0 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Conta Autenticada</span>
                  </div>
                </div>
              </motion.div>

              {/* Formulário */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-2 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 md:p-8 shadow-sm"
              >
                <h2 className="font-bold text-xl mb-6 flex items-center gap-3 text-[#1D4F91] dark:text-white">
                  <div className="p-2 bg-[#1D4F91]/10 rounded-lg text-[#1D4F91] dark:text-[#8CB4F5]">
                    <Zap className="w-5 h-5" />
                  </div>
                  Dados Pessoais
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                  {/* Email — somente leitura */}
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      E-mail <Lock size={12} className="opacity-50" />
                    </label>
                    <div className="flex items-center gap-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 rounded-xl px-4 py-3">
                      <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">{userEmail || "—"}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5">O e-mail é vinculado à sua autenticação de segurança e não pode ser alterado.</p>
                  </div>

                  {/* Nome */}
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 block">Nome Completo *</label>
                    <input {...register("name")} placeholder="Ex: João da Silva" className={fieldClass} />
                    {errors.name && <p className="text-[#E80070] text-xs mt-2 flex items-center gap-1"><AlertCircle size={12} /> {errors.name.message}</p>}
                  </div>

                  {/* CPF */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 block">CPF *</label>
                    <Controller
                      name="cpf"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="000.000.000-00"
                          className={fieldClass}
                          value={value}
                          onChange={e => onChange(formatCPF(e.target.value))}
                        />
                      )}
                    />
                    {errors.cpf && <p className="text-[#E80070] text-xs mt-2 flex items-center gap-1"><AlertCircle size={12} /> {errors.cpf.message}</p>}
                  </div>

                  {/* Data de Nascimento */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 block">Data de Nascimento</label>
                    <input {...register("birth")} type="date" className={fieldClass} />
                  </div>

                  {/* CEP */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 block">CEP</label>
                    <Controller
                      name="cep"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="00000-000"
                          className={fieldClass}
                          value={value ?? ""}
                          onChange={e => onChange(formatCEP(e.target.value))}
                        />
                      )}
                    />
                    {errors.cep && <p className="text-[#E80070] text-xs mt-2 flex items-center gap-1"><AlertCircle size={12} /> {errors.cep.message}</p>}
                  </div>

                  {/* Gênero */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 block">Gênero</label>
                    <select {...register("gender")} className={fieldClass}>
                      <option value="">Prefiro não informar</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                      <option value="Não-binário">Não-binário</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>

                  {/* Raça */}
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 block">Raça / Cor</label>
                    <select {...register("race")} className={fieldClass}>
                      <option value="">Prefiro não informar</option>
                      <option value="Branca">Branca</option>
                      <option value="Preta">Preta</option>
                      <option value="Parda">Parda</option>
                      <option value="Amarela">Amarela</option>
                      <option value="Indígena">Indígena</option>
                    </select>
                  </div>

                </div>

                {/* Submit Action */}
                <div className="flex justify-end pt-6 border-t border-slate-200/50 dark:border-slate-800/50 mt-6">
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(232, 0, 112, 0.4)" }}
                    whileTap={{ scale: 0.97 }}
                    disabled={isSaving || !isDirty}
                    className="bg-gradient-to-r from-[#E80070] to-[#C1188B] text-white px-8 py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:grayscale"
                  >
                    {isSaving ? "Atualizando..." : "Salvar Alterações"}
                  </motion.button>
                </div>

              </motion.div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}