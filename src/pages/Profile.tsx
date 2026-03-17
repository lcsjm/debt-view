import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { AppSidebar } from "@/components/AppSidebar";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { User, CreditCard, MapPin, Calendar, ShieldCheck, AlertCircle } from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(3, "Nome deve ter ao menos 3 letras"),
  cpf: z.string().min(11, "CPF inválido"),
  birth: z.string().optional().or(z.literal("")),
  cep: z.string().optional().or(z.literal("")),
  gender: z.string().optional().or(z.literal("")),
  race: z.string().optional().or(z.literal("")),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const [activeSection, setActiveSection] = useState("profile");
  const [collapsed, setCollapsed] = useState(false);
  const { profile, isLoading, saveProfile, isSaving } = useProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      cpf: "",
      birth: "",
      cep: "",
      gender: "",
      race: "",
    }
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

              {/* Avatar / Resumo do Perfil */}
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
                  <p className="text-sm text-muted-foreground">CPF: {profile?.cpf || "Não informado"}</p>
                </div>
                <div className="w-full bg-muted/40 rounded-xl p-4 text-left space-y-2">
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

                  {/* Nome */}
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Nome Completo *</label>
                    <input {...register("name")} placeholder="Ex: Victor Ferreira" className={fieldClass} />
                    {errors.name && <p className="text-destructive text-xs mt-1.5 flex items-center gap-1"><AlertCircle size={12} /> {errors.name.message}</p>}
                  </div>

                  {/* CPF */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                      CPF *
                    </label>
                    <input {...register("cpf")} placeholder="000.000.000-00" className={fieldClass} />
                    {errors.cpf && <p className="text-destructive text-xs mt-1.5 flex items-center gap-1"><AlertCircle size={12} /> {errors.cpf.message}</p>}
                  </div>

                  {/* Data de Nascimento */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Data de Nascimento</label>
                    <input {...register("birth")} type="date" className={fieldClass} />
                  </div>

                  {/* CEP */}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                      CEP
                    </label>
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
                  <div>
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
