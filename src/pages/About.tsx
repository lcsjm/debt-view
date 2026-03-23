import { motion } from "framer-motion";
import { ArrowLeft, Linkedin } from "lucide-react";

const TeamSection = () => {
  return (
    <main className="min-h-screen bg-background">
      
      {/* Botão de Voltar */}
      <div className="max-w-[1400px] mx-auto pt-12 px-4 sm:px-6 lg:px-8">
        <a 
          href="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-medium group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Voltar para a página inicial
        </a>
      </div>

      {/* ─── Seção Sobre o Projeto ─── */}
      <section className="pt-20 pb-16 px-6 max-w-5xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#E80070] via-[#C1188B] to-[#77127B]">
          Um projeto Transforma-se: "DebtView"
        </h1>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto transition-colors duration-300">
          Nosso projeto é em parceria com a empresa Serasa Experian e SENAC-SP. Nascido na cidade de São Carlos-SP, tem como principal objetivo ajudar nossos usuários a terem mais controle sobre suas próprias finanças, mostrando análises, gráficos, planilhas, além de um auxílio de Chatbot individualizado. Disponibilizamos links externos para que seja possível realizar renegociações de dívidas e amortizações.
        </p>
      </section>

      {/* ─── Seção do Time ─── */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto">
          
          <div className="text-center mb-16">
            <h2 className="text-3xl font-heading font-bold text-foreground mb-4">
              Desenvolvedores
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Conheça o nosso perfil no LinkedIn
            </p>
          </div>

          {/* Grid de Cards dos Desenvolvedores - 5 colunas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              {
                name: "Guilherme",
                role: "Desenvolvedor",
                linkedinUrl: "https://www.linkedin.com/in/guilherme-cabral-2082653b9/",
                avatarUrl: "https://ui-avatars.com/api/?name=Guilherme&background=0D8ABC&color=fff&size=128",
                coverUrl: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=500&auto=format&fit=crop"
              },
              {
                name: "Victor",
                role: "Desenvolvedor",
                linkedinUrl: "https://www.linkedin.com/in/v1cferr/",
                avatarUrl: "Screenshot 2026-03-20 at 14-24-35 (1) Victor Ferreira LinkedIn.png",
                coverUrl: "1710874898778.jpg"
              },
              {
                name: "Lucas",
                role: "Desenvolvedor",
                linkedinUrl: "https://www.linkedin.com/in/lcsjm97/",
                avatarUrl: "Screenshot 2026-03-20 at 14-19-32 (1) Lucas Jamus LinkedIn.png",
                coverUrl: "public/Linkedin_Lucas_capa.jpg"
              },
              {
                name: "Alexia",
                role: "Desenvolvedora",
                linkedinUrl: "https://www.linkedin.com/in/alexia-izabela-dos-santos-ba2b0028b/",
                avatarUrl: "https://ui-avatars.com/api/?name=Alexia&background=1D4F91&color=fff&size=128",
                coverUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=500&auto=format&fit=crop"
              },
              {
                name: "Ketlyn",
                role: "Desenvolvedora",
                linkedinUrl: "https://www.linkedin.com/in/ketlyn-mucheroni-8b23932a9/",
                avatarUrl: "Screenshot 2026-03-20 at 14-28-13 (1) Ketlyn Mucheroni LinkedIn.png",
                coverUrl: "1748905084109.jpg"
              }
            ].map((dev, index) => (
              <motion.a
                href={dev.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="block bg-card rounded-2xl overflow-hidden border border-border/20 shadow-sm hover:shadow-xl hover:border-border/40 transition-all duration-300 group relative"
              >
                {/* Área de Capa (Cover) */}
                <div 
                  className="h-20 w-full bg-muted relative"
                  style={{ backgroundImage: `url(${dev.coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                >
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
                </div>

                {/* Foto de Perfil sobreposta */}
                <div className="px-4 relative">
                  <div className="absolute -top-10 left-4">
                    <div className="h-16 w-16 rounded-full border-4 border-card bg-muted overflow-hidden">
                      <img 
                        src={dev.avatarUrl} 
                        alt={`Foto de ${dev.name}`} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Ícone do LinkedIn */}
                  <div className="absolute top-3 right-4 text-[#0A66C2] opacity-80 group-hover:opacity-100 transition-opacity">
                    <Linkedin size={20} />
                  </div>

                  {/* Informações de Texto */}
                  <div className="pt-10 pb-6 text-center sm:text-left">
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors truncate">
                      {dev.name}
                    </h3>
                    <p className="text-xs font-medium text-foreground/80 mt-1">
                      {dev.role}
                    </p>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>

        </div>
      </section>

    </main>
  );
};

export default TeamSection;