import { BookOpen, Lightbulb, Play } from "lucide-react";

const videos = [
  { title: "Como não cair na armadilha do mínimo do cartão", duration: "3 min" },
  { title: "Juros compostos: o inimigo silencioso", duration: "5 min" },
  { title: "Como fazer um orçamento que funciona", duration: "4 min" },
];

const tips = [
  "Hoje, tente trocar a marca X pela Y no supermercado e guarde a diferença.",
  "Antes de comprar, espere 24 horas. Se ainda quiser, aí compre.",
  "Anote TODOS os gastos, até o cafezinho. Você vai se surpreender.",
];

export function EducationWall() {
  const randomTip = tips[Math.floor(Math.random() * tips.length)];

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-heading font-bold text-foreground">
        Mural da Educação
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Videos */}
        <div className="bg-card rounded-xl p-5 shadow-card border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Play className="w-5 h-5 text-destructive" />
            <h3 className="text-sm font-semibold text-foreground">Vídeos Curtos</h3>
          </div>
          <div className="space-y-2">
            {videos.map((video) => (
              <div
                key={video.title}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted hover:bg-muted/70 transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg gradient-accent flex items-center justify-center flex-shrink-0">
                  <Play className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{video.title}</p>
                  <p className="text-xs text-muted-foreground">{video.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tip of the day */}
        <div className="bg-card rounded-xl p-5 shadow-card border border-border flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-brand-magenta" />
            <h3 className="text-sm font-semibold text-foreground">Dica do Dia</h3>
          </div>
          <div className="flex-1 flex items-center">
            <div className="p-6 bg-muted rounded-xl w-full">
              <BookOpen className="w-8 h-8 text-primary mb-3" />
              <p className="text-foreground font-medium leading-relaxed">
                "{randomTip}"
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
