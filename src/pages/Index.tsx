import { useEffect } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CalculatorIndex from "@/components/CalculatorIndex";
import AnalysisSection from "@/components/AnalysisSection";
import EducationSection from "@/components/EducationSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <CalculatorIndex />
      <AnalysisSection />
      <EducationSection />

      {/* Footer */}
      <footer className="bg-primary py-10">
        <div className="container mx-auto px-4 text-center">
          <p className="text-primary-foreground/60 text-sm">
            © 2026 DebtView. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
