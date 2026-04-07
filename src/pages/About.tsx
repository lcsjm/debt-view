import { motion, useAnimationFrame, useMotionValue } from "framer-motion";
import { ArrowLeft, Linkedin } from "lucide-react";
import { useEffect, useState, useRef } from "react";

// Componente individual para cada forma que bate e volta
const BouncingShape = ({ type, color, size, startX, startY, speed }) => {
  const x = useMotionValue(startX);
  const y = useMotionValue(startY);
  const rotate = useMotionValue(0);
  
  // Direção e velocidade inicial aleatória (ângulo)
  const angle = Math.random() * Math.PI * 2;
  const vx = useRef(Math.cos(angle) * speed);
  const vy = useRef(Math.sin(angle) * speed);
  const vRotate = useRef((Math.random() - 0.5) * 1.5); // Rotação suave

  useAnimationFrame((time, delta) => {
    if (typeof window === "undefined") return;

    // Normaliza a velocidade baseada na taxa de atualização da tela
    const timeFactor = delta / 16.66;

    let curX = x.get() + vx.current * timeFactor;
    let curY = y.get() + vy.current * timeFactor;
    let curRot = rotate.get() + vRotate.current * timeFactor;

    const maxX = window.innerWidth - size;
    const maxY = window.innerHeight - size;

    // Colisão no eixo X (laterais)
    if (curX <= 0) {
      curX = 0;
      vx.current *= -1; // Inverte o sentido
    } else if (curX >= maxX) {
      curX = maxX;
      vx.current *= -1; // Inverte o sentido
    }

    // Colisão no eixo Y (teto e chão)
    if (curY <= 0) {
      curY = 0;
      vy.current *= -1; // Inverte o sentido
    } else if (curY >= maxY) {
      curY = maxY;
      vy.current *= -1; // Inverte o sentido
    }

    // Atualiza os valores
    x.set(curX);
    y.set(curY);
    rotate.set(curRot);
  });

  let shapeClass = "";

  // Define o formato geométrico usando classes utilitárias e arbitrárias do Tailwind
  if (type === "circle") {
    shapeClass = "rounded-full";
  } else if (type === "square") {
    shapeClass = "rounded-3xl";
  } else if (type === "triangle") {
    shapeClass = "[clip-path:polygon(50%_0%,_0%_100%,_100%_100%)]";
  } else if (type === "hexagon") {
    shapeClass = "[clip-path:polygon(25%_0%,_75%_0%,_100%_50%,_75%_100%,_25%_100%,_0%_50%)]";
  }

  return (
    <motion.div
      className={`absolute opacity-30 dark:opacity-20 ${color} ${shapeClass}`}
      style={{ x, y, rotate, width: size, height: size }}
    />
  );
};

// Componente de Fundo que gerencia todas as formas
const FloatingShapes = () => {
  const [mounted, setMounted] = useState(false);

  // Garante que o código de tela só rode no lado do cliente (importante para Next.js)
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Definição das formas com tamanho em pixels para o cálculo exato da colisão
  const shapes = [
    { id: 1, type: "circle", color: "bg-[#1D4F91]", size: 160, speed: 1.0 },
    { id: 2, type: "square", color: "bg-[#426DA9]", size: 120, speed: 1.5 },
    
    { id: 4, type: "circle", color: "bg-[#C1188B]", size: 220, speed: 0.7 },
    { id: 5, type: "hexagon", color: "bg-[#E80070]", size: 130, speed: 1.8 },
    { id: 6, type: "square", color: "bg-[#1D4F91]", size: 90, speed: 2.0 },
    { id: 7, type: "circle", color: "bg-[#426DA9]", size: 180, speed: 1.1 },
  ];

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {shapes.map((shape) => {
        // Posição inicial aleatória dentro dos limites da tela
        const startX = Math.random() * (window.innerWidth - shape.size);
        const startY = Math.random() * (window.innerHeight - shape.size);
        
        return (
          <BouncingShape 
            key={shape.id} 
            {...shape} 
            startX={startX} 
            startY={startY} 
          />
        );
      })}
    </div>
  );
};

const TeamSection = () => {
  return (
    <main className="relative min-h-screen bg-background overflow-hidden">
      
      {/* ─── Fundo Animado com Formas Geométricas ─── */}
      <FloatingShapes />

      {/* Container relativo com z-10 para manter o conteúdo acima do fundo animado */}
      <div className="relative z-10">
        
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

            {/* Grid de Cards dos Desenvolvedores */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {[
                {
                  name: "Guilherme",
                  role: "Desenvolvedor back-end",
                  linkedinUrl: "https://www.linkedin.com/in/guilherme-cabral-2082653b9/",
                  avatarUrl: "https://ui-avatars.com/api/?name=Guilherme&background=0D8ABC&color=fff&size=128",
                  coverUrl: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=500&auto=format&fit=crop"
                },
                {
                  name: "Victor",
                  role: "Desenvolvedor back-end",
                  linkedinUrl: "https://www.linkedin.com/in/v1cferr/",
                  avatarUrl: "Screenshot 2026-03-20 at 14-24-35 (1) Victor Ferreira LinkedIn.png",
                  coverUrl: "1710874898778.jpg"
                },
                {
                  name: "Lucas",
                  role: "Desenvolvedor front-end",
                  linkedinUrl: "https://www.linkedin.com/in/lcsjm97/",
                  avatarUrl: "Screenshot 2026-03-20 at 14-19-32 (1) Lucas Jamus LinkedIn.png",
                  coverUrl: "public/Linkedin_Lucas_capa.jpg"
                },
                {
                  name: "Alexia",
                  role: "Desenvolvedora back-end",
                  linkedinUrl: "https://www.linkedin.com/in/alexia-izabela-dos-santos-ba2b0028b/",
                  avatarUrl: "Screenshot 2026-03-24 at 14-11-55 (18) Alexia Izabela Dos Santos LinkedIn.png",
                  coverUrl: "1774372090329.jpg"
                },
                {
                  name: "Ketlyn",
                  role: "Desenvolvedora back-end",
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
                  className="block bg-card/90 rounded-2xl overflow-hidden border border-border/20 shadow-sm hover:shadow-xl hover:border-border/40 transition-all duration-300 group relative backdrop-blur-md"
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
      </div>
    </main>
  );
};

export default TeamSection;