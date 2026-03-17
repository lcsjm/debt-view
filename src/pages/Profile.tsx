import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { AppSidebar } from "@/components/AppSidebar";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "@/hooks/use-toast";
import { User, MapPin, Calendar, ShieldCheck, AlertCircle, Mail, Lock } from "lucide-react";
import supabase from "../../utils/supabase";

// 🎭 Formata o CPF enquanto o usuário digita: "12345678900" → "123.456.789-00"
const formatCPF = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

// ✅ Algoritmo oficial dos dígitos verificadores do CPF (Receita Federal)
const validateCPF = (cpf: string) => {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return false;
  if (/^(\d)\1+$/.test(digits)) return false; // bloqueia 111.111.111-11 e similares
  const calc = (factor: number) => {
    let sum = 0;
    for (let i = 0; i < factor - 1; i++) sum += parseInt(digits[i]) * (factor - i);
    const rest = (sum * 10) % 11;
    return rest === 10 || rest === 11 ? 0 : rest;
  };
  return calc(10) === parseInt(digits[9]) && calc(11) === parseInt(digits[10]);
};


const profileSchema = z.object({
  name: z.string().min(3, "Nome deve ter ao menos 3 letras"),
  cpf: z
    .string()
    .min(14, "CPF incompleto — ex: 123.456.789-00")
    .refine(validateCPF, "CPF inválido — verifique os dígitos"),
  birth: z.string().optional().or(z.literal("")),
  cep: z.string().optional().or(z.literal("")),
  gender: z.string().optional().or(z.literal("")),
  race: z.string().optional().or(z.literal("")),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const [activeSection, setActiveSection] = useState("profile");
  const [collapsed, setCollapsed] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { profile, isLoading, saveProfile, isSaving } = useProfile();

  // Busca o email da conta autenticada (fica em auth.users, não na tabela profiles)
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty }
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", cpf: "", birth: "", cep: "", gender: "", race: "" }
  });

  // Quando o perfil chegar do Supabase, preenche o form
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

  const fieldClass = "w-full border border-border bg-background rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring transition-all text-sm";

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <main className={`transition-all duration-300 p-4 md:p-8 ${collapsed ? "ml-[72px]" : "ml-[72px] md:ml-[260px]"}`}>

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm text-muted-foreground mb-1">Configurações</p>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">Meu Perfil</h1>
          <p className="text-muted-foreground text-sm mt-1">Mantenha seus dados atualizados para aproveitar todas as funcionalidades.</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="animate-pulse text-muted-foreground font-medium">Carregando perfil...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Cartão Resumo */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center text-center gap-4 shadow-sm"
              >
                <div className="w-24 h-24 rounded-full bg-primary/10 border-4 border-primary/20 flex items-center justify-center">
                  <User className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <p className="font-heading font-bold text-xl text-foreground">{profile?.name || "Usuário"}</p>
                  <p className="text-sm text-muted-foreground truncate max-w-[200px]">{userEmail || "—"}</p>
                </div>
                <div className="w-full bg-muted/40 rounded-xl p-4 text-left space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4 flex-shrink-0 text-primary" />
                    <span className="truncate"><strong className="text-foreground">{userEmail || "—"}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 flex-shrink-0 text-primary" />
                    <span>CEP: <strong className="text-foreground">{profile?.cep || "—"}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 flex-shrink-0 text-primary" />
                    <span>Nascimento: <strong className="text-foreground">{profile?.birth ? new Date(profile.birth).toLocaleDateString("pt-BR") : "—"}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ShieldCheck className="w-4 h-4 flex-shrink-0 text-green-500" />
                    <span className="text-green-600 dark:text-green-400 font-semibold">Conta Verificada</span>
                  </div>
                </div>
              </motion.div>

              {/* Formulário */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6"
              >
                <h2 className="font-heading font-bold text-lg text-foreground flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Dados Pessoais
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {/* Email — somente leitura */}
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      E-mail <Lock size={10} className="opacity-50" />
                    </label>
                    <div className="flex items-center gap-2 border border-border bg-muted/50 rounded-xl px-4 py-3">
                      <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{userEmail || "—"}</span>
                    </div>
                    <p className="text-xs text-muted-foreground/60 mt-1">O email é gerenciado pelo sistema de autenticação e não pode ser alterado aqui.</p>
                  </div>

                  {/* Nome */}
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Nome Completo *</label>
                    <input {...register("name")} placeholder="Ex: Victor Ferreira" className={fieldClass} />
                    {errors.name && <p className="text-destructive text-xs mt-1.5 flex items-center gap-1"><AlertCircle size={12} /> {errors.name.message}</p>}
                  </div>

                  {/* CPF — com máscara e validação de dígitos verificadores */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">CPF *</label>
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
                    {errors.cpf && <p className="text-destructive text-xs mt-1.5 flex items-center gap-1"><AlertCircle size={12} /> {errors.cpf.message}</p>}
                  </div>

                  {/* Data de Nascimento */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Data de Nascimento</label>
                    <input {...register("birth")} type="date" className={fieldClass} />
                  </div>

                  {/* CEP */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">CEP</label>
                    <input {...register("cep")} placeholder="00000-000" className={fieldClass} />
                  </div>

                  {/* Gênero */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Gênero</label>
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
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Raça / Cor</label>
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

                <div className="flex justify-end pt-4 border-t border-border">
                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.97 }}
                    disabled={isSaving || !isDirty}
                    className="bg-primary text-primary-foreground px-8 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition disabled:opacity-50"
                  >
                    {isSaving ? "Salvando..." : "Salvar Alterações"}
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
